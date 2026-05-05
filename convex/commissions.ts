import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get commission payouts for an affiliate (legacy)
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

// Get all payouts (legacy)
export const getAllPayouts = query({
  handler: async (ctx) => {
    return await ctx.db.query("commissionPayouts").order("desc").collect();
  },
});

// Get payout requests for current affiliate
export const getMyPayoutRequests = query({
  args: { affiliateId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payoutRequests")
      .withIndex("by_affiliate")
      .filter((q) => q.eq(q.field("affiliateId"), args.affiliateId))
      .order("desc")
      .collect();
  },
});

// Get all payout requests (admin)
export const getAllPayoutRequests = query({
  handler: async (ctx) => {
    return await ctx.db.query("payoutRequests").order("desc").collect();
  },
});

// Request a payout
export const requestPayout = mutation({
  args: {
    affiliateId: v.string(),
    amount: v.number(),
    paymentMethod: v.string(),
    bankName: v.string(),
    accountNumber: v.string(),
    accountType: v.string(),
  },
  handler: async (ctx, args) => {
    const affiliate = await ctx.db.get(args.affiliateId as any) as any;
    if (!affiliate) {
      throw new Error("Affiliate not found");
    }

    // Check if they have pending commission (valid balance)
    const pendingCommission = affiliate.pendingCommission || 0;
    if (pendingCommission <= 0) {
      throw new Error("No pending commission available to request.");
    }
    
    // Validate amount
    if (args.amount < 500) {
      throw new Error("Minimum payout amount is R500");
    }
    if (args.amount > pendingCommission) {
      throw new Error(`Amount exceeds available balance of R${pendingCommission.toLocaleString()}`);
    }

    // Generate reference number
    const referenceNumber = `PAY-${Date.now().toString(36).toUpperCase()}`;

    const payoutId = await ctx.db.insert("payoutRequests", {
      affiliateId: args.affiliateId,
      amount: args.amount,
      status: "requested",
      paymentMethod: args.paymentMethod,
      bankName: args.bankName,
      accountNumber: args.accountNumber,
      accountType: args.accountType,
      referenceNumber,
      requestedAt: Date.now(),
    });

    // Note: We do NOT deduct pendingCommission here anymore
    // Deduction happens when admin marks as paid (in updatePayoutStatus)
    // This is the "signal only" pattern as per task requirements

    return payoutId;
  },
});

// Update payout request status (admin)
export const updatePayoutStatus = mutation({
  args: {
    payoutId: v.string(),
    status: v.union(v.literal("requested"), v.literal("processing"), v.literal("paid"), v.literal("rejected")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const payout = await ctx.db.get(args.payoutId as any) as any;
    if (!payout) {
      throw new Error("Payout not found");
    }

    const updates: any = {
      status: args.status,
    };

    // When marking as paid, update affiliate's paid/pending commissions
    if (args.status === "paid") {
      updates.processedAt = Date.now();
      
      // Get affiliate and update
      const affiliate = await ctx.db.get(payout.affiliateId as any) as any;
      if (affiliate) {
        // Deduct from pending, add to paid
        const currentPending = affiliate.pendingCommission || 0;
        await ctx.db.patch(affiliate._id, {
          pendingCommission: Math.max(0, currentPending - payout.amount),
          totalCommissionPaid: (affiliate.totalCommissionPaid || 0) + payout.amount,
        });
      }
    }

    // When rejecting, return amount to pending commission
    if (args.status === "rejected") {
      const affiliate = await ctx.db.get(payout.affiliateId as any) as any;
      if (affiliate) {
        await ctx.db.patch(affiliate._id, {
          pendingCommission: (affiliate.pendingCommission || 0) + payout.amount,
        });
      }
    }

    if (args.notes) {
      updates.notes = args.notes;
    }

    await ctx.db.patch(args.payoutId as any, updates);
    return { success: true };
  },
});

// Legacy payout creation (for admin)
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

// Legacy payout status update (for admin)
export const updateLegacyPayoutStatus = mutation({
  args: {
    id: v.string(),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("paid"), v.literal("failed")),
    paidAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id as any, args);
    return args.id;
  },
});
