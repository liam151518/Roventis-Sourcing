import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getDealsByAffiliate = query({
  args: { affiliateId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deals")
      .filter((q) => q.eq(q.field("affiliateId"), args.affiliateId))
      .order("desc")
      .collect();
  },
});

export const getAllDeals = query({
  handler: async (ctx) => {
    return await ctx.db.query("deals").order("desc").collect();
  },
});

export const createDeal = mutation({
  args: {
    affiliateId: v.string(),
    clientName: v.string(),
    clientCompany: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
    clientPhone: v.optional(v.string()),
    dealValue: v.number(),
    productCategory: v.array(v.string()),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("prospect"),
      v.literal("qualified"),
      v.literal("proposal_sent"),
      v.literal("negotiation"),
      v.literal("closed_won"),
      v.literal("closed_lost"),
      v.literal("on_hold")
    ),
    commissionRate: v.number(),
  },
  handler: async (ctx, args) => {
    const commissionAmount = args.dealValue * (args.commissionRate / 100);
    return await ctx.db.insert("deals", {
      ...args,
      commissionAmount,
      commissionStatus: "pending",
      createdAt: Date.now(),
    });
  },
});

export const updateDeal = mutation({
  args: {
    id: v.string(),
    status: v.optional(v.union(
      v.literal("prospect"),
      v.literal("qualified"),
      v.literal("proposal_sent"),
      v.literal("negotiation"),
      v.literal("closed_won"),
      v.literal("closed_lost"),
      v.literal("on_hold")
    )),
    dealValue: v.optional(v.number()),
    commissionStatus: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("paid"), v.literal("disputed"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    if (updates.dealValue) {
      const deal = await ctx.db.get(id);
      if (deal) {
        updates.commissionAmount = updates.dealValue * (deal.commissionRate / 100);
      }
    }
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const deleteDeal = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});
