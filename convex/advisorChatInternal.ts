// Internal helpers for the advisor chat action chain. No "use node".
//
// Used only by convex/advisorChat.ts (the sendMessage action).

import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const getAffiliateByClerkId = internalQuery({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("affiliates")
      .withIndex("by_clerk_id", (q: any) =>
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
      .withIndex("by_affiliate", (q: any) =>
        q.eq("affiliateId", args.affiliateId)
      )
      .unique();
  },
});

export const loadDashboardContext = internalQuery({
  args: { affiliateId: v.id("affiliates") },
  handler: async (ctx, args) => {
    const affiliate = await ctx.db.get(args.affiliateId);
    if (!affiliate) return null;
    const deals = await ctx.db
      .query("deals")
      .withIndex("by_affiliate", (q: any) =>
        q.eq("affiliateId", String(args.affiliateId))
      )
      .take(50);
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_claimedBy", (q: any) =>
        q.eq("claimedBy", args.affiliateId)
      )
      .take(25);
    const todos = await ctx.db
      .query("advisorTodos")
      .withIndex("by_affiliate", (q: any) =>
        q.eq("affiliateId", args.affiliateId)
      )
      .take(25);
    const journal = await ctx.db
      .query("advisorJournal")
      .withIndex("by_affiliate", (q: any) =>
        q.eq("affiliateId", args.affiliateId)
      )
      .take(15);
    return { affiliate, deals, leads, todos, journal };
  },
});

export const getChatForUser = internalQuery({
  args: { chatId: v.id("advisorChats") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.chatId);
  },
});

export const appendMessage = internalMutation({
  args: {
    chatId: v.id("advisorChats"),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system")
    ),
    content: v.string(),
    tokensUsed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("advisorChatMessages", {
      ...args,
      createdAt: now,
    });
    await ctx.db.patch(args.chatId, {
      lastMessageAt: now,
      updatedAt: now,
    });
    return { id };
  },
});

export const setChatTitle = internalMutation({
  args: { chatId: v.id("advisorChats"), title: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.chatId, {
      title: args.title,
      updatedAt: Date.now(),
    });
  },
});

export const getUsage = internalQuery({
  args: { affiliateId: v.id("affiliates"), dayKey: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("advisorUsage")
      .withIndex("by_affiliate_day", (q: any) =>
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
      .withIndex("by_affiliate_day", (q: any) =>
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

export const listRecentMessages = internalQuery({
  args: { chatId: v.id("advisorChats"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 30;
    const rows = await ctx.db
      .query("advisorChatMessages")
      .withIndex("by_chat_createdAt", (q: any) =>
        q.eq("chatId", args.chatId)
      )
      .order("desc")
      .take(limit);
    return rows.reverse();
  },
});