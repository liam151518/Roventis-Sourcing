"use node";

// Provider adapters for the AI advisor. Each adapter exposes:
//   - validateKey(apiKey): cheap probe to confirm the key is valid
//   - summarize(apiKey, systemPrompt, userPrompt, maxTokens): call the
//     model and return { text, tokensUsed, model }
//
// We use the smallest reasonable model from each provider for v1:
//   - OpenAI: gpt-4o-mini
//   - Anthropic: claude-3-5-haiku-latest
//   - Gemini: gemini-2.0-flash
//
// All calls have a 15s hard timeout (AbortController) and a 1500-token
// output cap. We never log the key - every error message is scrubbed
// before being returned or written to console.

import { scrubKeyFromString } from "./advisorCrypto";

export type ProviderId = "openai" | "anthropic" | "gemini" | "minimax";

// MiniMax (https://platform.minimax.io) exposes a fully OpenAI-compatible
// chat completions endpoint at https://api.minimax.io/v1. We use it via
// the standard Bearer-token Authorization header - no special wiring
// needed. Model "MiniMax-M3" is the current flagship; users can also
// pick M2.7/M2.5 via the model field if they want, but v1 hardcodes M3.
const MINIMAX_BASE = "https://api.minimax.io/v1";
const MINIMAX_MODEL = "MiniMax-M3";

export interface ProviderResult {
  text: string;
  tokensUsed: number;
  model: string;
}

const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_MAX_TOKENS = 1500;

function withTimeout(ms: number): { signal: AbortSignal; cancel: () => void } {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, cancel: () => clearTimeout(timer) };
}

/* --------------------------------------------------------------- */
/* OpenAI                                                          */
/* --------------------------------------------------------------- */

async function openaiValidate(apiKey: string): Promise<boolean> {
  const { signal, cancel } = withTimeout(DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.openai.com/v1/models", {
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

async function openaiSummarize(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
): Promise<ProviderResult> {
  const { signal, cancel } = withTimeout(DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: Math.min(maxTokens, DEFAULT_MAX_TOKENS),
        temperature: 0.4,
      }),
      signal,
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI error ${res.status}: ${scrubKeyFromString(errText)}`);
    }
    const json: any = await res.json();
    const text: string =
      json?.choices?.[0]?.message?.content?.toString() ?? "";
    const tokensUsed: number =
      (json?.usage?.total_tokens as number | undefined) ?? 0;
    return { text, tokensUsed, model: "gpt-4o-mini" };
  } catch (err) {
    throw new Error(scrubKeyFromString(String(err)));
  } finally {
    cancel();
  }
}

/* --------------------------------------------------------------- */
/* Anthropic                                                       */
/* --------------------------------------------------------------- */

async function anthropicValidate(apiKey: string): Promise<boolean> {
  const { signal, cancel } = withTimeout(DEFAULT_TIMEOUT_MS);
  try {
    // The /v1/models endpoint requires higher-tier keys. Use a
    // tiny messages call as the validation probe instead.
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
    // 401/403 means invalid key, 400 means bad request but key valid.
    if (res.status === 401 || res.status === 403) return false;
    return res.ok || res.status === 400;
  } catch (err) {
    throw new Error(scrubKeyFromString(String(err)));
  } finally {
    cancel();
  }
}

async function anthropicSummarize(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
): Promise<ProviderResult> {
  const { signal, cancel } = withTimeout(DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-latest",
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        max_tokens: Math.min(maxTokens, DEFAULT_MAX_TOKENS),
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

/* --------------------------------------------------------------- */
/* Gemini                                                          */
/* --------------------------------------------------------------- */

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

async function geminiSummarize(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
): Promise<ProviderResult> {
  const { signal, cancel } = withTimeout(DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            maxOutputTokens: Math.min(maxTokens, DEFAULT_MAX_TOKENS),
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
    const candidates: any[] = Array.isArray(json?.candidates)
      ? json.candidates
      : [];
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

/* --------------------------------------------------------------- */
/* MiniMax (OpenAI-compatible at https://api.minimax.io/v1)        */
/* --------------------------------------------------------------- */

async function minimaxValidate(apiKey: string): Promise<boolean> {
  const { signal, cancel } = withTimeout(DEFAULT_TIMEOUT_MS);
  try {
    // MiniMax exposes /v1/models on the same base URL.
    const res = await fetch(`${MINIMAX_BASE}/models`, {
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

async function minimaxSummarize(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
): Promise<ProviderResult> {
  const { signal, cancel } = withTimeout(DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(`${MINIMAX_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MINIMAX_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_completion_tokens: Math.min(maxTokens, DEFAULT_MAX_TOKENS),
        temperature: 0.4,
      }),
      signal,
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`MiniMax error ${res.status}: ${scrubKeyFromString(errText)}`);
    }
    const json: any = await res.json();
    const text: string =
      json?.choices?.[0]?.message?.content?.toString() ?? "";
    const tokensUsed: number =
      (json?.usage?.total_tokens as number | undefined) ?? 0;
    return { text, tokensUsed, model: MINIMAX_MODEL };
  } catch (err) {
    throw new Error(scrubKeyFromString(String(err)));
  } finally {
    cancel();
  }
}

/* --------------------------------------------------------------- */
/* Public dispatch                                                 */
/* --------------------------------------------------------------- */

export async function validateProviderKey(
  provider: ProviderId,
  apiKey: string,
): Promise<boolean> {
  switch (provider) {
    case "openai":
      return openaiValidate(apiKey);
    case "anthropic":
      return anthropicValidate(apiKey);
    case "gemini":
      return geminiValidate(apiKey);
    case "minimax":
      return minimaxValidate(apiKey);
  }
}

export async function callProvider(
  provider: ProviderId,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
): Promise<ProviderResult> {
  switch (provider) {
    case "openai":
      return openaiSummarize(apiKey, systemPrompt, userPrompt, maxTokens);
    case "anthropic":
      return anthropicSummarize(apiKey, systemPrompt, userPrompt, maxTokens);
    case "gemini":
      return geminiSummarize(apiKey, systemPrompt, userPrompt, maxTokens);
    case "minimax":
      return minimaxSummarize(apiKey, systemPrompt, userPrompt, maxTokens);
  }
}