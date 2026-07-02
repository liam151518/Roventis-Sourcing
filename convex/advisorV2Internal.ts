// Internal queries/mutations used by the advisor v2 actions.
// Lives in a separate file from advisorV2.ts because that file
// has the "use node" directive, which forces all exports to be
// actions. Query/mutation exports need to live here.

import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const upsertSettings = internalMutation({
  args: {
    clerkUserId: v.string(),
    provider: v.union(
      v.literal("openai"),
      v.literal("anthropic"),
      v.literal("gemini")
    ),
    encryptedKey: v.string(),
    iv: v.string(),
    authTag: v.string(),
    keyPreview: v.string(),
    lastValidatedAt: v.number(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const affiliate = await ctx.db
      .query("affiliates")
      .withIndex("by_clerk_id", (q) =>
        q.eq("clerkUserId", args.clerkUserId)
      )
      .unique();
    if (!affiliate) throw new Error("Affiliate record not found");
    const existing = await ctx.db
      .query("advisorSettings")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", affiliate._id))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        provider: args.provider,
        encryptedKey: args.encryptedKey,
        iv: args.iv,
        authTag: args.authTag,
        keyPreview: args.keyPreview,
        lastValidatedAt: args.lastValidatedAt,
        isActive: true,
        updatedAt: args.now,
      });
      return { id: existing._id };
    }
    return {
      id: await ctx.db.insert("advisorSettings", {
        affiliateId: affiliate._id,
        provider: args.provider,
        encryptedKey: args.encryptedKey,
        iv: args.iv,
        authTag: args.authTag,
        keyPreview: args.keyPreview,
        lastValidatedAt: args.lastValidatedAt,
        isActive: true,
        createdAt: args.now,
        updatedAt: args.now,
      }),
    };
  },
});

export const getAffiliateByClerkId = internalQuery({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("affiliates")
      .withIndex("by_clerk_id", (q) =>
        q.eq("clerkUserId", args.clerkUserId)
      )
      .unique();
  },
});

export const getSettingsForAffiliate = internalQuery({
  args: { affiliateId: v.id("affiliates") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("advisorSettings")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", args.affiliateId))
      .unique();
  },
});

export const loadAffiliateDigestData = internalQuery({
  args: { affiliateId: v.id("affiliates") },
  handler: async (ctx, args) => {
    const affiliate = await ctx.db.get(args.affiliateId);
    if (!affiliate) return null;
    const deals = await ctx.db
      .query("deals")
      .withIndex("by_affiliate", (q) =>
        q.eq("affiliateId", String(args.affiliateId))
      )
      .collect();
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_claimedBy", (q) =>
        q.eq("claimedBy", args.affiliateId)
      )
      .collect();
    return { affiliate, deals, leads };
  },
});

export const getUsage = internalQuery({
  args: {
    affiliateId: v.id("affiliates"),
    dayKey: v.string(),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("advisorUsage")
      .withIndex("by_affiliate_day", (q) =>
        q.eq("affiliateId", args.affiliateId).eq("dayKey", args.dayKey)
      )
      .unique();
    return { count: row?.count ?? 0 };
  },
});

export const incrementUsage = internalMutation({
  args: {
    affiliateId: v.id("affiliates"),
    dayKey: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("advisorUsage")
      .withIndex("by_affiliate_day", (q) =>
        q.eq("affiliateId", args.affiliateId).eq("dayKey", args.dayKey)
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { count: existing.count + 1 });
    } else {
      await ctx.db.insert("advisorUsage", {
        affiliateId: args.affiliateId,
        dayKey: args.dayKey,
        count: 1,
      });
    }
  },
});

export const findDigestByCacheKey = internalQuery({
  args: { cacheKey: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("advisorDigestCache")
      .withIndex("by_cacheKey", (q) => q.eq("cacheKey", args.cacheKey))
      .unique();
  },
});

export const insertDigest = internalMutation({
  args: {
    affiliateId: v.id("affiliates"),
    digestType: v.union(v.literal("daily"), v.literal("weekly")),
    cacheKey: v.string(),
    generatedAt: v.number(),
    expiresAt: v.number(),
    sections: v.array(
      v.object({
        kind: v.union(
          v.literal("headline"),
          v.literal("summary"),
          v.literal("blockers"),
          v.literal("actionItems"),
          v.literal("praise"),
          v.literal("watchlist")
        ),
        title: v.string(),
        body: v.string(),
      })
    ),
    generatedBy: v.string(),
    tokensUsed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("advisorDigestCache", args);
  },
});

export const deleteDigest = internalMutation({
  args: { id: v.id("advisorDigestCache") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const listActiveAdvisorAffiliates = internalQuery({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("advisorSettings").collect();
    return all
      .filter((s) => s.isActive)
      .map((s) => ({ affiliateId: s.affiliateId, provider: s.provider }));
  },
});