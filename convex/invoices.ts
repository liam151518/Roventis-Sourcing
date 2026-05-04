import { query, mutation } from "./_generated/server";
import { v, Id } from "convex/values";

export const getAllInvoices = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("invoices")
      .order("desc")
      .collect();
  },
});

export const getInvoicesByAffiliate = query({
  args: { affiliateId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("invoices")
      .filter((q) => q.eq(q.field("affiliateId"), args.affiliateId))
      .order("desc")
      .collect();
  },
});

export const getInvoiceById = query({
  args: { invoiceId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.invoiceId as Id<"invoices">);
  },
});

export const getNextInvoiceNumber = mutation({
  args: { affiliateId: v.string() },
  handler: async (ctx, args) => {
    const invoices = await ctx.db
      .query("invoices")
      .filter((q) => q.eq(q.field("affiliateId"), args.affiliateId))
      .order("desc")
      .take(100);

    if (invoices.length === 0) {
      return "0001";
    }

    const lastInvoice = invoices[0];
    const lastNumber = parseInt(lastInvoice.invoiceNumber, 10);
    const nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
    return nextNumber.toString().padStart(4, "0");
  },
});

export const createInvoice = mutation({
  args: {
    affiliateId: v.string(),
    dealId: v.optional(v.string()),
    invoiceNumber: v.string(),
    invoiceDate: v.string(),
    clientCompanyName: v.string(),
    clientAddress1: v.optional(v.string()),
    clientAddress2: v.optional(v.string()),
    clientVatNumber: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
    projectSummary: v.optional(v.string()),
    lineItems: v.array(v.object({
      productName: v.string(),
      productSubtitle: v.optional(v.string()),
      imageDataUrl: v.optional(v.string()),
      unitPrice: v.number(),
      quantity: v.number(),
      amount: v.number(),
    })),
    notes: v.array(v.string()),
    subtotal: v.number(),
    total: v.number(),
    status: v.optional(v.union(v.literal("draft"), v.literal("sent"), v.literal("paid"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("invoices", {
      ...args,
      status: args.status || "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateInvoice = mutation({
  args: {
    id: v.string(),
    dealId: v.optional(v.string()),
    invoiceNumber: v.optional(v.string()),
    invoiceDate: v.optional(v.string()),
    clientCompanyName: v.optional(v.string()),
    clientAddress1: v.optional(v.string()),
    clientAddress2: v.optional(v.string()),
    clientVatNumber: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
    projectSummary: v.optional(v.string()),
    lineItems: v.optional(v.array(v.object({
      productName: v.string(),
      productSubtitle: v.optional(v.string()),
      imageDataUrl: v.optional(v.string()),
      unitPrice: v.number(),
      quantity: v.number(),
      amount: v.number(),
    }))),
    notes: v.optional(v.array(v.string())),
    subtotal: v.optional(v.number()),
    total: v.optional(v.number()),
    status: v.optional(v.union(v.literal("draft"), v.literal("sent"), v.literal("paid"), v.literal("retired"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const invoiceId = id as Id<"invoices">;
    const invoice = await ctx.db.get(invoiceId);

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    await ctx.db.patch(invoiceId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteInvoice = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const invoiceId = args.id as Id<"invoices">;
    const invoice = await ctx.db.get(invoiceId);

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Soft delete - set status to retired
    await ctx.db.patch(invoiceId, {
      status: "retired",
      updatedAt: Date.now(),
    });
  },
});

export const getDealForInvoice = query({
  args: { dealId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.dealId as Id<"deals">);
  },
});

// ============== INVOICE SETTINGS ==============

export const getInvoiceSettings = query({
  handler: async (ctx) => {
    const settings = await ctx.db.query("invoiceSettings").take(1);
    return settings[0] || null;
  },
});

export const createInvoiceSettings = mutation({
  args: {
    companyName: v.string(),
    companyEmail: v.string(),
    companyPhone: v.string(),
    companyWebsite: v.string(),
    companySocial: v.string(),
    bankName: v.string(),
    accountType: v.string(),
    accountNumber: v.string(),
    branchCode: v.string(),
    accountHolder: v.string(),
    tagline: v.string(),
    defaultNotes: v.array(v.string()),
    primaryColor: v.string(),
    secondaryColor: v.string(),
    accentColor: v.string(),
    dividerColor: v.string(),
    headerStyle: v.optional(v.string()),
    showLogo: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    // Delete any existing settings first (we only want one record)
    const existing = await ctx.db.query("invoiceSettings").collect();
    for (const s of existing) {
      await ctx.db.delete(s._id);
    }
    // Create new settings
    return await ctx.db.insert("invoiceSettings", {
      ...args,
      headerStyle: args.headerStyle || "centered",
      showLogo: args.showLogo ?? true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateInvoiceSettings = mutation({
  args: {
    id: v.string(),
    companyName: v.optional(v.string()),
    companyEmail: v.optional(v.string()),
    companyPhone: v.optional(v.string()),
    companyWebsite: v.optional(v.string()),
    companySocial: v.optional(v.string()),
    bankName: v.optional(v.string()),
    accountType: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    branchCode: v.optional(v.string()),
    accountHolder: v.optional(v.string()),
    tagline: v.optional(v.string()),
    defaultNotes: v.optional(v.array(v.string())),
    primaryColor: v.optional(v.string()),
    secondaryColor: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    dividerColor: v.optional(v.string()),
    headerStyle: v.optional(v.string()),
    showLogo: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id as Id<"invoiceSettings">, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});