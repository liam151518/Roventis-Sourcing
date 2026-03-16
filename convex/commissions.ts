import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCommissionsByAffiliate = query({
  args: { affiliateId: v.string() },
  handler: async (ctx, args) => {
    const payouts = await ctx.db
      .query("commissionPayouts")
      .filter((q) => q.eq(q.field("affiliateId"), args.affiliateId))
      .order("desc")
      .collect();
    return payouts;
  },
});

export const getAllPayouts = query({
  handler: async (ctx) => {
    return await ctx.db.query("commissionPayouts").order("desc").collect();
  },
});

export const createPayout = mutation({
  args: {
    affiliateId: v.string(),
    amount: v.number(),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("paid"), v.literal("failed")),
    paymentMethod: v.optional(v.string()),
    referenceNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("commissionPayouts", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updatePayoutStatus = mutation({
  args: {
    id: v.string(),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("paid"), v.literal("failed")),
    paidAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, args);
    return args.id;
  },
});
