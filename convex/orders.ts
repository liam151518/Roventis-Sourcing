import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get orders for current affiliate
export const getMyOrders = query({
  args: { affiliateId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_affiliate")
      .filter((q) => q.eq(q.field("affiliateId"), args.affiliateId))
      .collect();
  },
});

// Get order by ID
export const getOrderById = query({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

// Get all orders (admin)
export const getAllOrders = query({
  handler: async (ctx) => {
    return await ctx.db.query("orders").collect();
  },
});

// Create order from deal
export const createOrder = mutation({
  args: {
    affiliateId: v.string(),
    dealId: v.optional(v.string()),
    // Client Information
    clientName: v.string(),
    clientCompany: v.optional(v.string()),
    clientEmail: v.string(),
    clientPhone: v.optional(v.string()),
    deliveryAddress: v.optional(v.string()),
    // Company Details (for manufacturing)
    companyName: v.optional(v.string()),
    companyRegistrationNumber: v.optional(v.string()),
    companyVATNumber: v.optional(v.string()),
    companyWebsite: v.optional(v.string()),
    companyAddress: v.optional(v.string()),
    contactPersonName: v.optional(v.string()),
    contactPersonEmail: v.optional(v.string()),
    contactPersonPhone: v.optional(v.string()),
    // Order Items
    items: v.array(v.object({
      productName: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      total: v.number(),
    })),
    totalAmount: v.number(),
    notes: v.optional(v.string()),
    // Documents & Files (URLs)
    invoiceDocument: v.optional(v.string()),
    legalDocument: v.optional(v.string()),
    paymentProof: v.optional(v.string()),
    productImages: v.optional(v.array(v.string())),
    mockupPhotos: v.optional(v.array(v.string())),
    customLogo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { productImages, mockupPhotos, ...rest } = args;
    
    const orderId = await ctx.db.insert("orders", {
      ...rest,
      productImages: productImages || [],
      mockupPhotos: mockupPhotos || [],
      status: "draft",
      commissionStatus: "pending",
      commissionAmount: 0,
      createdAt: Date.now(),
    });

    // If linked to a deal, update the deal status
    if (args.dealId) {
      await ctx.db.patch(args.dealId, {
        status: "closed_won",
        actualCloseDate: Date.now(),
      });
    }

    return orderId;
  },
});

// Update order status
export const updateOrderStatus = mutation({
  args: {
    orderId: v.string(),
    status: v.union(v.literal("draft"), v.literal("submitted"), v.literal("supplier_confirmed"), v.literal("in_transit"), v.literal("delivered"), v.literal("installed"), v.literal("cancelled")),
    trackingNumber: v.optional(v.string()),
    deliveryDate: v.optional(v.number()),
    installationDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { orderId, ...updates } = args;
    const order = await ctx.db.get(orderId);
    
    if (!order) {
      throw new Error("Order not found");
    }

    await ctx.db.patch(orderId, updates);

    // When order is installed/delivered, approve commission
    if (args.status === "delivered" || args.status === "installed") {
      const affiliate = await ctx.db.get(order.affiliateId);
      if (affiliate) {
        // Calculate commission based on tier
        let commissionRate = 0.05;
        if (affiliate.tier === "silver") commissionRate = 0.10;
        if (affiliate.tier === "gold") commissionRate = 0.15;
        if (affiliate.tier === "platinum") commissionRate = 0.25;

        const commissionAmount = order.totalAmount * commissionRate;
        
        await ctx.db.patch(orderId, {
          commissionStatus: "approved",
          commissionAmount,
        });

        // Update affiliate stats
        await ctx.db.patch(affiliate._id, {
          totalSales: affiliate.totalSales + order.totalAmount,
          totalCommissionEarned: affiliate.totalCommissionEarned + commissionAmount,
          pendingCommission: (affiliate.pendingCommission || 0) + commissionAmount,
        });
      }
    }

    return { success: true };
  },
});

// Update order (general)
export const updateOrder = mutation({
  args: {
    orderId: v.string(),
    clientName: v.optional(v.string()),
    clientCompany: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
    clientPhone: v.optional(v.string()),
    deliveryAddress: v.optional(v.string()),
    items: v.optional(v.array(v.object({
      productName: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      total: v.number(),
    }))),
    totalAmount: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { orderId, ...updates } = args;
    await ctx.db.patch(orderId, updates);
    return { success: true };
  },
});

// Submit order (move from draft to submitted)
export const submitOrder = mutation({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    if (order.status !== "draft") {
      throw new Error("Only draft orders can be submitted");
    }

    await ctx.db.patch(args.orderId, {
      status: "submitted",
    });

    return { success: true };
  },
});

// Admin: Update order with all fields
export const adminUpdateOrder = mutation({
  args: {
    orderId: v.string(),
    // Client Information
    clientName: v.optional(v.string()),
    clientCompany: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
    clientPhone: v.optional(v.string()),
    deliveryAddress: v.optional(v.string()),
    // Company Details
    companyName: v.optional(v.string()),
    companyRegistrationNumber: v.optional(v.string()),
    companyVATNumber: v.optional(v.string()),
    companyWebsite: v.optional(v.string()),
    companyAddress: v.optional(v.string()),
    contactPersonName: v.optional(v.string()),
    contactPersonEmail: v.optional(v.string()),
    contactPersonPhone: v.optional(v.string()),
    // Order Items
    items: v.optional(v.array(v.object({
      productName: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      total: v.number(),
    }))),
    totalAmount: v.optional(v.number()),
    // Status
    status: v.optional(v.union(v.literal("draft"), v.literal("submitted"), v.literal("supplier_confirmed"), v.literal("in_transit"), v.literal("delivered"), v.literal("installed"), v.literal("cancelled"))),
    trackingNumber: v.optional(v.string()),
    // Commission
    commissionStatus: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("paid"))),
    commissionAmount: v.optional(v.number()),
    // Documents
    invoiceDocument: v.optional(v.string()),
    legalDocument: v.optional(v.string()),
    paymentProof: v.optional(v.string()),
    productImages: v.optional(v.array(v.string())),
    mockupPhotos: v.optional(v.array(v.string())),
    customLogo: v.optional(v.string()),
    // Notes
    notes: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { orderId, ...updates } = args;
    await ctx.db.patch(orderId, updates);
    return { success: true };
  },
});

// Seed demo orders
export const seedDemoOrders = mutation({
  args: { affiliateId: v.string() },
  handler: async (ctx, args) => {
    const existingOrders = await ctx.db.query("orders").take(1);
    if (existingOrders.length > 0) {
      return { success: true, message: "Orders already exist" };
    }

    await ctx.db.insert("orders", {
      affiliateId: args.affiliateId,
      clientName: "Sarah Johnson",
      clientCompany: "TechCorp Solutions",
      clientEmail: "sarah@techcorp.co.za",
      clientPhone: "+27 82 123 4567",
      deliveryAddress: "123 Tech Street, Cape Town, 8001",
      items: [
        { productName: "Corporate Branded Notebooks", quantity: 100, unitPrice: 150, total: 15000 },
        { productName: "Custom USB Drives", quantity: 50, unitPrice: 200, total: 10000 },
      ],
      totalAmount: 25000,
      status: "delivered",
      trackingNumber: "ROV-2024-001",
      deliveryDate: Date.now() - 5 * 24 * 60 * 60 * 1000,
      commissionStatus: "approved",
      commissionAmount: 2500,
      notes: "First order completed successfully",
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    });

    await ctx.db.insert("orders", {
      affiliateId: args.affiliateId,
      clientName: "Mike Peters",
      clientCompany: "BuildRight Construction",
      clientEmail: "mike@buildright.co.za",
      clientPhone: "+27 83 456 7890",
      deliveryAddress: "456 Builder Ave, Johannesburg, 2000",
      items: [
        { productName: "Safety Workwear Set", quantity: 20, unitPrice: 2500, total: 50000 },
      ],
      totalAmount: 50000,
      status: "in_transit",
      trackingNumber: "ROV-2024-002",
      commissionStatus: "pending",
      commissionAmount: 0,
      createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    });

    return { success: true, message: "Demo orders created" };
  },
});
