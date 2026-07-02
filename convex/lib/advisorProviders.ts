"use node";

// Provider adapters for the AI advisor.
//
// Each adapter exposes:
//   - validateKey(apiKey): cheap probe to confirm the key is valid
//   - sendRequest({apiKey, systemPrompt, messages, maxTokens, timeoutMs})
//     -> { text, tokensUsed, model }
//
// Callers choose timeoutMs based on use-case:
//   - 15s for quick validation + chat replies
//   - 45s for weekly digest generation (bigger prompt = longer model time)
//   - 60s for chat if the conversation context grows large
//
// We use the smallest reasonable model from each provider for v1:
//   - OpenAI: gpt-4o-mini
//   - Anthropic: claude-3-5-haiku-latest
//   - Gemini: gemini-2.0-flash
//   - MiniMax: MiniMax-M3 (via OpenAI-compatible base)
//
// All calls share a per-request AbortController timeout and a 4000-token
// absolute output cap. Error paths scrub keys via scrubKeyFromString.

import { scrubKeyFromString } from "./advisorCrypto";

export type ProviderId = "openai" | "anthropic" | "gemini" | "minimax";

// MiniMax (https://platform.minimax.io) exposes a fully OpenAI-compatible
// chat completions endpoint at https://api.minimax.io/v1. Model "MiniMax-M3"
// is the current flagship for coding/agentic tasks with 1M context.
const MINIMAX_BASE = "https://api.minimax.io/v1";
const MINIMAX_MODEL = "MiniMax-M3";

export interface ProviderResult {
  text: string;
  tokensUsed: number;
  model: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface SendRequestArgs {
  apiKey: string;
  systemPrompt: string;
  /** Recent chat messages, in order. System prompt is sent separately. */
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  maxTokens?: number;
  /** Per-call timeout in ms. Defaults to 30s. */
  timeoutMs?: number;
}

const DEFAULT_MAX_TOKENS = 4000;
const ABSOLUTE_MAX_TOKENS = 4000;
const DEFAULT_TIMEOUT_MS = 30000;

function withTimeout(ms: number): { signal: AbortSignal; cancel: () => void } {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, cancel: () => clearTimeout(timer) };
}

function clampMax(n?: number): number {
  const v = typeof n === "number" && Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_TOKENS;
  return Math.min(v, ABSOLUTE_MAX_TOKENS);
}

/* ============================================================== */
/* OpenAI-compatible base (openai + minimax)                       */
/* ============================================================== */

interface OpenAICompatConfig {
  base: string;
  model: string;
  label: string;
}

async function openaiCompatRequest(
  cfg: OpenAICompatConfig,
  args: SendRequestArgs,
): Promise<ProviderResult> {
  const { signal, cancel } = withTimeout(args.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  try {
    const messages = [
      { role: "system", content: args.systemPrompt },
      ...args.messages,
    ];
    // MiniMax uses max_completion_tokens; OpenAI accepts both. For safety we
    // send both fields, the provider will pick whichever it supports.
    const body: Record<string, unknown> = {
      model: cfg.model,
      messages,
      max_completion_tokens: clampMax(args.maxTokens),
      max_tokens: clampMax(args.maxTokens),
      temperature: 0.4,
    };
    const res = await fetch(`${cfg.base}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal,
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`${cfg.label} error ${res.status}: ${scrubKeyFromString(errText)}`);
    }
    const json: any = await res.json();
    const text: string =
      json?.choices?.[0]?.message?.content?.toString() ?? "";
    const tokensUsed: number =
      (json?.usage?.total_tokens as number | undefined) ?? 0;
    return { text, tokensUsed, model: cfg.model };
  } catch (err) {
    throw new Error(scrubKeyFromString(String(err)));
  } finally {
    cancel();
  }
}

async function openaiCompatValidate(
  cfg: OpenAICompatConfig,
  apiKey: string,
): Promise<boolean> {
  const { signal, cancel } = withTimeout(DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(`${cfg.base}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal,
    });
    return res.ok;
  } catch (err) {
    throw new Error(scrubKeyFromString(String(err)));
  } finally {
    cancel();
  }
}

const OPENAI_CFG: OpenAICompatConfig = {
  base: "https://api.openai.com/v1",
  model: "gpt-4o-mini",
  label: "OpenAI",
};

const MINIMAX_CFG: OpenAICompatConfig = {
  base: MINIMAX_BASE,
  model: MINIMAX_MODEL,
  label: "MiniMax",
};

/* ============================================================== */
/* Anthropic                                                       */
/* ============================================================== */

async function anthropicValidate(apiKey: string): Promise<boolean> {
  const { signal, cancel } = withTimeout(DEFAULT_TIMEOUT_MS);
  try {
    // Higher-tier keys required to hit /v1/models; use a tiny messages call.
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-latest",
        max_tokens: 1,
        messages: [{ role: "user", content: "ping" }],
      }),
      signal,
    });
    if (res.status === 401 || res.status === 403) return false;
    return res.ok || res.status === 400;
  } catch (err) {
    throw new Error(scrubKeyFromString(String(err)));
  } finally {
    cancel();
  }
}

async function anthropicRequest(args: SendRequestArgs): Promise<ProviderResult> {
  const { signal, cancel } = withTimeout(args.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": args.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-latest",
        system: args.systemPrompt,
        messages: args.messages,
        max_tokens: clampMax(args.maxTokens),
        temperature: 0.4,
      }),
      signal,
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(
        `Anthropic error ${res.status}: ${scrubKeyFromString(errText)}`
      );
    }
    const json: any = await res.json();
    const blocks: any[] = Array.isArray(json?.content) ? json.content : [];
    const text: string = blocks
      .filter((b) => b?.type === "text")
      .map((b) => b.text ?? "")
      .join("\n");
    const tokensUsed: number =
      (json?.usage?.input_tokens ?? 0) + (json?.usage?.output_tokens ?? 0);
    return { text, tokensUsed, model: "claude-3-5-haiku-latest" };
  } catch (err) {
    throw new Error(scrubKeyFromString(String(err)));
  } finally {
    cancel();
  }
}

/* ============================================================== */
/* Gemini                                                          */
/* ============================================================== */

async function geminiValidate(apiKey: string): Promise<boolean> {
  const { signal, cancel } = withTimeout(DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
      { signal }
    );
    return res.ok;
  } catch (err) {
    throw new Error(scrubKeyFromString(String(err)));
  } finally {
    cancel();
  }
}

async function geminiRequest(args: SendRequestArgs): Promise<ProviderResult> {
  const { signal, cancel } = withTimeout(args.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  try {
    // Gemini uses a "contents" array per message; collapse system into the
    // first user turn since there's no separate system channel.
    const contents: any[] = [];
    if (args.messages.length > 0) {
      contents.push({
        role: "user",
        parts: [
          { text: `[SYSTEM INSTRUCTION]\n${args.systemPrompt}` },
          ...(args.messages[0].role === "user"
            ? [{ text: args.messages[0].content }]
            : []),
        ],
      });
      for (let i = args.messages[0].role === "user" ? 1 : 0; i < args.messages.length; i++) {
        const m = args.messages[i];
        contents.push({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        });
      }
    } else {
      contents.push({
        role: "user",
        parts: [{ text: args.systemPrompt }],
      });
    }
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(args.apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: args.systemPrompt }] },
          generationConfig: {
            maxOutputTokens: clampMax(args.maxTokens),
            temperature: 0.4,
          },
        }),
        signal,
      }
    );
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini error ${res.status}: ${scrubKeyFromString(errText)}`);
    }
    const json: any = await res.json();
    const candidates: any[] = Array.isArray(json?.candidates) ? json.candidates : [];
    const parts: any[] = candidates[0]?.content?.parts ?? [];
    const text: string = parts
      .map((p) => p?.text ?? "")
      .filter(Boolean)
      .join("\n");
    const tokensUsed: number =
      (json?.usageMetadata?.totalTokenCount as number | undefined) ?? 0;
    return { text, tokensUsed, model: "gemini-2.0-flash" };
  } catch (err) {
    throw new Error(scrubKeyFromString(String(err)));
  } finally {
    cancel();
  }
}

/* ============================================================== */
/* Public dispatch                                                 */
/* ============================================================== */

export async function validateProviderKey(
  provider: ProviderId,
  apiKey: string,
): Promise<boolean> {
  switch (provider) {
    case "openai":
      return openaiCompatValidate(OPENAI_CFG, apiKey);
    case "anthropic":
      return anthropicValidate(apiKey);
    case "gemini":
      return geminiValidate(apiKey);
    case "minimax":
      return openaiCompatValidate(MINIMAX_CFG, apiKey);
  }
}

/**
 * Single-turn or multi-turn call. Used by both digests (single message)
 * and chat (multi message history).
 */
export async function sendRequest(
  provider: ProviderId,
  args: SendRequestArgs,
): Promise<ProviderResult> {
  switch (provider) {
    case "openai":
      return openaiCompatRequest(OPENAI_CFG, args);
    case "minimax":
      return openaiCompatRequest(MINIMAX_CFG, args);
    case "anthropic":
      return anthropicRequest(args);
    case "gemini":
      return geminiRequest(args);
  }
}

/**
 * Backwards-compatible one-shot helper used by the digest action.
 * Prefer sendRequest() for new code.
 */
export async function callProvider(
  provider: ProviderId,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  timeoutMs?: number,
): Promise<ProviderResult> {
  return sendRequest(provider, {
    apiKey,
    systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
    maxTokens,
    timeoutMs,
  });
}