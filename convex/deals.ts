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
    const commissionAmount = Math.round(args.dealValue * (args.commissionRate / 100) * 100) / 100;
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
    const deal = await ctx.db.get(id);
    
    if (!deal) {
      throw new Error("Deal not found");
    }
    
    if (updates.dealValue) {
      updates.commissionAmount = Math.round(updates.dealValue * (deal.commissionRate / 100) * 100) / 100;
    }
    
    // If status is changing to closed_won, update affiliate totals
    if (updates.status === "closed_won" && deal.status !== "closed_won") {
      const affiliate = await ctx.db.get(deal.affiliateId);
      if (affiliate) {
        await ctx.db.patch(affiliate._id, {
          totalSales: (affiliate.totalSales || 0) + deal.dealValue,
          totalCommissionEarned: (affiliate.totalCommissionEarned || 0) + deal.commissionAmount,
          pendingCommission: (affiliate.pendingCommission || 0) + deal.commissionAmount,
        });
      }
    }
    
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const deleteDeal = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Submit order details for a closed deal
export const submitOrder = mutation({
  args: {
    dealId: v.string(),
    // Client Information
    clientName: v.string(),
    clientCompany: v.optional(v.string()),
    clientEmail: v.string(),
    clientPhone: v.optional(v.string()),
    deliveryAddress: v.string(),
    // Company Details (for manufacturing)
    companyName: v.optional(v.string()),
    companyRegistrationNumber: v.optional(v.string()),
    companyVATNumber: v.optional(v.string()),
    companyWebsite: v.optional(v.string()),
    companyAddress: v.optional(v.string()),
    contactPersonName: v.optional(v.string()),
    contactPersonEmail: v.optional(v.string()),
    contactPersonPhone: v.optional(v.string()),
    // Documents (URLs)
    invoiceDocument: v.optional(v.string()),
    legalDocument: v.optional(v.string()),
    paymentProof: v.optional(v.string()),
    customLogo: v.optional(v.string()),
    productImages: v.optional(v.array(v.string())),
    mockupPhotos: v.optional(v.array(v.string())),
    // Notes
    orderNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      throw new Error("Deal not found");
    }

    const { dealId, productImages, mockupPhotos, ...orderData } = args;
    
    // Generate order reference
    const orderReference = `ORD-${Date.now().toString(36).toUpperCase()}`;

    await ctx.db.patch(args.dealId, {
      orderSubmitted: true,
      orderReference,
      ...orderData,
      productImages: productImages || [],
      mockupPhotos: mockupPhotos || [],
      orderSubmittedAt: Date.now(),
      orderStatus: "submitted",
    });

    return { success: true, orderReference };
  },
});
