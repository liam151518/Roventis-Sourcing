// Advisor v2 - per-user AI summaries.
//
// Flow:
//   1. User pastes their own OpenAI / Anthropic / Gemini API key on
//      /dashboard/marketing. We validate it via a cheap provider
//      probe, encrypt with AES-256-GCM, store in advisorSettings.
//   2. We pre-generate daily + weekly summaries via a cron at 7am SAST
//      so the page loads instantly. Cache lives in advisorDigestCache.
//   3. On-demand "Generate now" button triggers generateDailySummary
//      / generateWeeklyReport which hit the AI and update the cache.
//
// Security:
//   - API keys are encrypted at rest. Never returned to client.
//   - We scrub PII before sending any data to the model. The affiliate's
//     own name/email/phone/bank info never reaches the model.
//   - Hard 10 generations/day per user (configurable via env var).
//   - 15s timeout + 1500 max output tokens per generation.
//   - All error messages scrub keys before logging.

"use node";

import { v } from "convex/values";
import {
  action,
  internalAction,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import {
  decryptApiKey,
  encryptApiKey,
  maskApiKey,
} from "./lib/advisorCrypto";
import {
  buildScrubbedContext,
  sastDayKey,
  ScrubbedContext,
} from "./lib/advisorPii";
import {
  callProvider,
  ProviderId,
  ProviderResult,
  validateProviderKey,
} from "./lib/advisorProviders";

const DEFAULT_DAILY_CAP = 10;
const DAILY_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const WEEKLY_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7d

function getDailyCap(): number {
  const raw = process.env.ADVISOR_DAILY_CAP;
  const n = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_DAILY_CAP;
}

/* ============================================================ */
/* Public actions (only this file uses "use node")               */
/* ============================================================ */

/**
 * Save (or replace) the current affiliate's AI provider key. Validates
 * it with the provider first, then encrypts and stores.
 */
export const saveApiKey = action({
  args: {
    provider: v.union(
      v.literal("openai"),
      v.literal("anthropic"),
      v.literal("gemini")
    ),
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const trimmed = args.apiKey.trim();
    if (trimmed.length < 8) {
      throw new Error("That key looks too short to be valid.");
    }

    // Validate before storing - saves us from encrypting garbage.
    const ok = await validateProviderKey(args.provider, trimmed);
    if (!ok) {
      throw new Error(
        "That key was rejected by the provider. Double-check it has the right permissions and try again."
      );
    }

    const encrypted = encryptApiKey(trimmed);
    const preview = maskApiKey(trimmed);
    const now = Date.now();

    await ctx.runMutation(internal.advisorV2Internal.upsertSettings, {
      clerkUserId: identity.subject,
      provider: args.provider,
      encryptedKey: encrypted.ciphertext,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      keyPreview: preview,
      lastValidatedAt: now,
      now,
    });

    return { ok: true, provider: args.provider };
  },
});

/**
 * Manually regenerate the daily digest for the current affiliate.
 * Bumps the daily cap counter.
 */
export const generateDailySummary = action({
  args: {},
  handler: async (ctx) => {
    return await generateSummaryForCaller(ctx, "daily");
  },
});

/**
 * Manually regenerate the weekly report for the current affiliate.
 */
export const generateWeeklyReport = action({
  args: {},
  handler: async (ctx) => {
    return await generateSummaryForCaller(ctx, "weekly");
  },
});

/* ============================================================ */
/* Internal helpers (called by cron + actions)                  */
/* ============================================================ */

/**
 * Internal action used by cron to pre-generate daily + weekly digests
 * for every affiliate with an active advisor config.
 */
export const runAdvisorCron = internalAction({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.runQuery(
      internal.advisorV2Internal.listActiveAdvisorAffiliates
    );
    const now = new Date();
    const isMonday = now.getUTCDay() === 1; // UTC; cron at 5 UTC = 7 SAST
    const summaryTypes: Array<"daily" | "weekly"> = ["daily"];
    if (isMonday) summaryTypes.push("weekly");

    let ok = 0;
    let failed = 0;
    for (const s of settings) {
      for (const kind of summaryTypes) {
        try {
          await generateSummaryForAffiliate(ctx, s.affiliateId, kind, false);
          ok++;
        } catch (err) {
          failed++;
          console.error(
            `Advisor cron failed for ${s.affiliateId} (${kind}):`,
            String(err).slice(0, 200)
          );
        }
      }
    }
    return { ok, failed };
  },
});

/**
 * Generate a summary for the calling affiliate (called from a public
 * action). Enforces the per-day cap.
 */
async function generateSummaryForCaller(
  ctx: any,
  type: "daily" | "weekly"
): Promise<{ ok: boolean; message?: string }> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const affiliate = await ctx.runQuery(
    internal.advisorV2Internal.getAffiliateByClerkId,
    { clerkUserId: identity.subject }
  );
  if (!affiliate) throw new Error("Affiliate record not found");

  // Rate limit check (advisory - cron bypasses by passing `bypassCap: true`)
  const today = sastDayKey(Date.now());
  const usage = await ctx.runQuery(internal.advisorV2Internal.getUsage, {
    affiliateId: affiliate._id,
    dayKey: today,
  });
  const cap = getDailyCap();
  if (usage.count >= cap) {
    throw new Error(
      `You've hit today's advisor limit (${cap} generations). It resets at midnight SAST.`
    );
  }

  // Increment usage before generating (so a failed call still counts).
  await ctx.runMutation(internal.advisorV2Internal.incrementUsage, {
    affiliateId: affiliate._id,
    dayKey: today,
  });

  const result = await generateSummaryForAffiliate(ctx, affiliate._id, type, false);
  return result;
}

async function generateSummaryForAffiliate(
  ctx: any,
  affiliateId: Id<"affiliates">,
  type: "daily" | "weekly",
  bypassCap: boolean
): Promise<{ ok: boolean }> {
  const settings = await ctx.runQuery(
    internal.advisorV2Internal.getSettingsForAffiliate,
    { affiliateId }
  );
  if (!settings || !settings.isActive) {
    throw new Error("Advisor not configured for this user");
  }

  const provider: ProviderId = settings.provider;
  const apiKey = decryptApiKey({
    ciphertext: settings.encryptedKey,
    iv: settings.iv,
    authTag: settings.authTag,
  });

  // Load all the data we want to summarize, then scrub PII.
  const data = await ctx.runQuery(
    internal.advisorV2Internal.loadAffiliateDigestData,
    { affiliateId }
  );
  const scrubbed = buildScrubbedContext({
    affiliate: data.affiliate,
    deals: data.deals,
    leads: data.leads,
    now: Date.now(),
  });

  const { systemPrompt, userPrompt } = buildPrompts(type, scrubbed);
  const result: ProviderResult = await callProvider(
    provider,
    apiKey,
    systemPrompt,
    userPrompt,
    1500
  );

  const sections = parseSectionsFromModelOutput(result.text, type);
  const today = sastDayKey(Date.now());
  const ttl = type === "weekly" ? WEEKLY_CACHE_TTL_MS : DAILY_CACHE_TTL_MS;
  const cacheKey = `${affiliateId}|${type}|${today}`;

  // Wipe any old same-day same-type digest before inserting new one
  const existing = await ctx.runQuery(
    internal.advisorV2Internal.findDigestByCacheKey,
    { cacheKey }
  );
  if (existing) {
    await ctx.runMutation(internal.advisorV2Internal.deleteDigest, {
      id: existing._id,
    });
  }

  await ctx.runMutation(internal.advisorV2Internal.insertDigest, {
    affiliateId,
    digestType: type,
    cacheKey,
    generatedAt: Date.now(),
    expiresAt: Date.now() + ttl,
    sections,
    generatedBy: `${provider}:${result.model}`,
    tokensUsed: result.tokensUsed,
  });

  return { ok: true };
}

/* ============================================================ */
/* Prompt construction + output parsing                          */
/* ============================================================ */

function buildPrompts(
  type: "daily" | "weekly",
  ctx: ScrubbedContext
): { systemPrompt: string; userPrompt: string } {
  const dataJson = JSON.stringify(ctx, null, 2);

  const systemPrompt = `You are an expert sales advisor for an affiliate of Roventis Sourcing, a South African B2B sourcing platform. Your job is to give CONCISE, ACTIONABLE advice based on the user's own business data. Be direct. No fluff. No "great job!" filler. Focus on what to do THIS WEEK.

RULES:
- Never invent numbers. Only reference what's in the data.
- Output exactly these sections in this order, each as a short paragraph or bullet list:
  HEADLINE: one line, the single most important thing
  SUMMARY: 2-3 sentences on current state
  BLOCKERS: bullet list of issues that need unblocking (or "none")
  ACTION_ITEMS: 3-5 concrete next steps for the next 7 days
  PRAISE: 1-2 sentences on what's going well (only if true)
  WATCHLIST: deals/leads to keep an eye on
- Use ZAR (R) for money. SAST for dates.
- Do NOT include any personally identifying information. The user's name/email is already stripped.
- Be brutally honest if pipeline is empty or stalled - don't sugar-coat.`;

  const userPrompt =
    type === "weekly"
      ? `Generate a WEEKLY REPORT for the user based on the data below. The weekly report should focus on the overall trend, biggest wins of the period, biggest gaps, and priorities for the week ahead.

DATA:
${dataJson}`
      : `Generate a DAILY DIGEST for the user based on the data below. The daily digest should focus on what's changed today, what needs attention in the next 24h, and one specific action to take right now.

DATA:
${dataJson}`;

  return { systemPrompt, userPrompt };
}

function parseSectionsFromModelOutput(
  text: string,
  type: "daily" | "weekly"
): Array<{
  kind: "headline" | "summary" | "blockers" | "actionItems" | "praise" | "watchlist";
  title: string;
  body: string;
}> {
  const sections: Array<{
    kind:
      | "headline"
      | "summary"
      | "blockers"
      | "actionItems"
      | "praise"
      | "watchlist";
    title: string;
    body: string;
  }> = [];

  const headerTitles: Record<string, { kind: string; title: string }> = {
    HEADLINE: { kind: "headline", title: "Headline" },
    SUMMARY: { kind: "summary", title: "Summary" },
    BLOCKERS: { kind: "blockers", title: "Blockers" },
    ACTION_ITEMS: { kind: "actionItems", title: "Action items" },
    PRAISE: { kind: "praise", title: "What's working" },
    WATCHLIST: { kind: "watchlist", title: "Watchlist" },
  };

  // Split on the all-caps section markers
  const lines = text.split(/\r?\n/);
  let current: { kind: string; title: string; body: string[] } | null = null;
  for (const raw of lines) {
    const trimmed = raw.trim();
    const match = trimmed.match(/^(HEADLINE|SUMMARY|BLOCKERS|ACTION_ITEMS|PRAISE|WATCHLIST)\s*[:\-]?\s*(.*)$/);
    if (match) {
      if (current) {
        sections.push({
          kind: current.kind as any,
          title: current.title,
          body: current.body.join("\n").trim(),
        });
      }
      const headerKey = match[1];
      const header = headerTitles[headerKey];
      current = {
        kind: header.kind,
        title: header.title,
        body: match[2] ? [match[2]] : [],
      };
    } else if (current) {
      if (trimmed) current.body.push(trimmed);
    }
  }
  if (current) {
    sections.push({
      kind: current.kind as any,
      title: current.title,
      body: current.body.join("\n").trim(),
    });
  }

  // If we didn't get a structured output, fall back to a single summary section
  if (sections.length === 0 && text.trim()) {
    sections.push({
      kind: "summary",
      title: type === "weekly" ? "Weekly report" : "Daily digest",
      body: text.trim().slice(0, 4000),
    });
  }

  return sections;
}

// Internal queries/mutations are in ./advisorV2Internal.ts
// (separate file because this one uses "use node").