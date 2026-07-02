// Public advisor queries + client-facing mutations.
// No "use node" here - these run in the standard Convex query/mutation
// runtime. Companion to advisorV2.ts (actions, with "use node") and
// advisorV2Internal.ts (internal helpers).

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function getDailyCap(): number {
  const raw = process.env.ADVISOR_DAILY_CAP;
  const n = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 10;
}

function sastDayKey(epochMs: number): string {
  const sast = new Date(epochMs + 2 * 60 * 60 * 1000);
  const y = sast.getUTCFullYear();
  const m = String(sast.getUTCMonth() + 1).padStart(2, "0");
  const d = String(sast.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Returns the current affiliate's advisor settings (NEVER the plaintext
 * key, only a masked preview + metadata).
 */
export const getMyAdvisorSettings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const affiliate = await ctx.db
      .query("affiliates")
      .withIndex("by_clerk_id", (q) =>
        q.eq("clerkUserId", identity.subject)
      )
      .unique();
    if (!affiliate) return null;
    const settings = await ctx.db
      .query("advisorSettings")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", affiliate._id))
      .unique();
    if (!settings) return { configured: false as const };
    return {
      configured: true as const,
      provider: settings.provider,
      keyPreview: settings.keyPreview,
      isActive: settings.isActive,
      lastValidatedAt: settings.lastValidatedAt ?? null,
      updatedAt: settings.updatedAt,
    };
  },
});

/**
 * Returns the current affiliate's most recent daily + weekly digests.
 * Used to populate the page instantly without burning tokens.
 */
export const getMyLatestDigests = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const affiliate = await ctx.db
      .query("affiliates")
      .withIndex("by_clerk_id", (q) =>
        q.eq("clerkUserId", identity.subject)
      )
      .unique();
    if (!affiliate) return null;
    const all = await ctx.db
      .query("advisorDigestCache")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", affiliate._id))
      .collect();
    const now = Date.now();
    const valid = all.filter((d) => d.expiresAt > now);
    const daily = valid
      .filter((d) => d.digestType === "daily")
      .sort((a, b) => b.generatedAt - a.generatedAt)[0] ?? null;
    const weekly = valid
      .filter((d) => d.digestType === "weekly")
      .sort((a, b) => b.generatedAt - a.generatedAt)[0] ?? null;
    const today = sastDayKey(now);
    const usage = await ctx.db
      .query("advisorUsage")
      .withIndex("by_affiliate_day", (q) =>
        q.eq("affiliateId", affiliate._id).eq("dayKey", today)
      )
      .unique();
    return {
      daily,
      weekly,
      usageToday: usage?.count ?? 0,
      dailyCap: getDailyCap(),
    };
  },
});

/**
 * Remove the current affiliate's API key entirely.
 */
export const removeApiKey = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const affiliate = await ctx.db
      .query("affiliates")
      .withIndex("by_clerk_id", (q) =>
        q.eq("clerkUserId", identity.subject)
      )
      .unique();
    if (!affiliate) throw new Error("Affiliate record not found");
    const settings = await ctx.db
      .query("advisorSettings")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", affiliate._id))
      .unique();
    if (settings) {
      await ctx.db.delete(settings._id);
    }
    const digests = await ctx.db
      .query("advisorDigestCache")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", affiliate._id))
      .collect();
    for (const d of digests) {
      await ctx.db.delete(d._id);
    }
    return { ok: true };
  },
});

/**
 * Toggle the current affiliate's advisor on/off (keeps the key).
 */
export const setAdvisorActive = mutation({
  args: { isActive: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const affiliate = await ctx.db
      .query("affiliates")
      .withIndex("by_clerk_id", (q) =>
        q.eq("clerkUserId", identity.subject)
      )
      .unique();
    if (!affiliate) throw new Error("Affiliate record not found");
    const settings = await ctx.db
      .query("advisorSettings")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", affiliate._id))
      .unique();
    if (!settings) throw new Error("No API key configured");
    await ctx.db.patch(settings._id, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});