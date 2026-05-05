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
    clientName: v.optional(v.string()),
    clientCompany: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
    clientPhone: v.optional(v.string()),
    dealValue: v.optional(v.number()),
    productCategory: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
    expectedCloseDate: v.optional(v.number()),
    commissionRate: v.optional(v.number()),
    commissionAmount: v.optional(v.number()),
    commissionStatus: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("paid"), v.literal("disputed"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Convert string to Id if needed
    const dealId = id as any;
    const deal = await ctx.db.get(dealId) as any;
    
    if (!deal) {
      throw new Error("Deal not found");
    }
    
    // If dealValue is being updated, recalculate commissionAmount based on rate (use new rate if provided, otherwise use existing)
    if (updates.dealValue) {
      const rate = updates.commissionRate ?? deal.commissionRate ?? 5;
      updates.commissionAmount = Math.round(updates.dealValue * (rate / 100) * 100) / 100;
    }
    
    // If status is changing to closed_won, do NOT auto-credit pendingCommission
    // Commission is credited only after admin approves the order (see approveOrderCommission mutation)
    if (updates.status === "closed_won" && deal.status !== "closed_won") {
      // Just update the deal status to closed_won - no commission credit yet
      // The commission becomes real only after:
      // 1. Affiliate submits order (submitOrder mutation creates order in orders table)
      // 2. Admin approves commission (approveOrderCommission mutation)
    }
    
    await ctx.db.patch(id as any, updates);
    return id;
  },
});

export const deleteDeal = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id as any);
    return args.id;
  },
});

// Submit order details for a closed deal - creates an actual order in the orders table
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
    const deal = await ctx.db.get(args.dealId as any) as any;
    if (!deal) {
      throw new Error("Deal not found");
    }
    
    // Check if deal already has an order submitted
    if (deal.orderSubmitted && deal.orderId) {
      throw new Error("Order already submitted for this deal");
    }

    const { dealId, productImages, mockupPhotos, ...clientData } = args;
    
    // Generate order reference
    const orderReference = `ORD-${Date.now().toString(36).toUpperCase()}`;
    
    // Copy commission data from the deal
    const commissionAmount = deal.commissionAmount || 0;
    const commissionRate = deal.commissionRate || 5;
    
    // Get the affiliate ID
    const affiliateId = typeof deal.affiliateId === 'string' 
      ? deal.affiliateId 
      : deal.affiliateId;

    // Create the actual order in the orders table
    const orderId = await ctx.db.insert("orders", {
      affiliateId,
      dealId: args.dealId,
      clientName: args.clientName,
      clientCompany: args.clientCompany,
      clientEmail: args.clientEmail,
      clientPhone: args.clientPhone,
      deliveryAddress: args.deliveryAddress,
      companyName: args.companyName,
      companyRegistrationNumber: args.companyRegistrationNumber,
      companyVATNumber: args.companyVATNumber,
      companyWebsite: args.companyWebsite,
      companyAddress: args.companyAddress,
      contactPersonName: args.contactPersonName,
      contactPersonEmail: args.contactPersonEmail,
      contactPersonPhone: args.contactPersonPhone,
      items: [],
      totalAmount: deal.dealValue,
      status: "submitted",
      commissionStatus: "pending", // Not approved yet - admin must approve
      invoiceDocument: args.invoiceDocument,
      legalDocument: args.legalDocument,
      paymentProof: args.paymentProof,
      customLogo: args.customLogo,
      productImages: productImages || [],
      mockupPhotos: mockupPhotos || [],
      notes: args.orderNotes,
      createdAt: Date.now(),
    } as any);

    // Update the deal to mark order as submitted
    await ctx.db.patch(args.dealId as any, {
      orderSubmitted: true,
      orderReference,
      orderId: orderId,
      orderSubmittedAt: Date.now(),
      orderStatus: "submitted",
    } as any);

    return { success: true, orderReference, orderId };
  },
});
