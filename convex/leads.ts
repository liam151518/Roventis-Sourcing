import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all available leads (for Platinum affiliates)
export const getAvailableLeads = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_status")
      .filter((q) => q.eq(q.field("status"), "available"))
      .collect();
  },
});

// Get leads claimed by current affiliate
export const getMyLeads = query({
  args: { affiliateId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_claimed_by")
      .filter((q) => q.eq(q.field("claimedBy"), args.affiliateId))
      .collect();
  },
});

// Get all leads (admin)
export const getAllLeads = query({
  handler: async (ctx) => {
    return await ctx.db.query("leads").collect();
  },
});

// Claim a lead
export const claimLead = mutation({
  args: { leadId: v.string(), affiliateId: v.string() },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }
    if (lead.status !== "available") {
      throw new Error("Lead is no longer available");
    }

    // Check how many leads this affiliate has claimed
    const myLeads = await ctx.db
      .query("leads")
      .withIndex("by_claimed_by")
      .filter((q) => q.eq(q.field("claimedBy"), args.affiliateId))
      .collect();

    if (myLeads.length >= 5) {
      throw new Error("You can only have 5 active leads at a time");
    }

    await ctx.db.patch(args.leadId, {
      status: "claimed",
      claimedBy: args.affiliateId,
      claimedAt: Date.now(),
    });

    return { success: true };
  },
});

// Release a lead back to pool
export const releaseLead = mutation({
  args: { leadId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.leadId, {
      status: "available",
      claimedBy: undefined,
      claimedAt: undefined,
    });
    return { success: true };
  },
});

// Create a new lead (admin)
export const createLead = mutation({
  args: {
    companyName: v.string(),
    contactName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    companySize: v.optional(v.string()),
    productInterest: v.optional(v.string()),
    budgetRange: v.optional(v.string()),
    source: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const leadId = await ctx.db.insert("leads", {
      ...args,
      status: "available",
      createdAt: Date.now(),
    });
    return leadId;
  },
});

// Convert lead to deal
export const convertLeadToDeal = mutation({
  args: {
    leadId: v.string(),
    affiliateId: v.string(),
    dealValue: v.number(),
    productCategory: v.array(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    // Calculate commission based on affiliate tier
    const affiliate = await ctx.db.get(args.affiliateId);
    if (!affiliate) {
      throw new Error("Affiliate not found");
    }

    let commissionRate = 0.05;
    if (affiliate.tier === "silver") commissionRate = 0.10;
    if (affiliate.tier === "gold") commissionRate = 0.15;
    if (affiliate.tier === "platinum") commissionRate = 0.25;

    // Create the deal
    const dealId = await ctx.db.insert("deals", {
      affiliateId: args.affiliateId,
      clientName: lead.contactName,
      clientCompany: lead.companyName,
      clientEmail: lead.email,
      clientPhone: lead.phone,
      dealValue: args.dealValue,
      productCategory: args.productCategory,
      description: args.description,
      status: "qualified",
      commissionRate,
      commissionAmount: args.dealValue * commissionRate,
      commissionStatus: "pending",
      createdAt: Date.now(),
    });

    // Update lead status
    await ctx.db.patch(args.leadId, {
      status: "converted",
      convertedToDeal: dealId,
    });

    return dealId;
  },
});

// Seed demo leads
export const seedDemoLeads = mutation({
  handler: async (ctx) => {
    const existingLeads = await ctx.db.query("leads").take(1);
    if (existingLeads.length > 0) {
      return { success: true, message: "Leads already exist" };
    }

    const demoLeads = [
      { companyName: "SolarTech SA", contactName: "John Smith", email: "john@solartech.co.za", phone: "+27 82 111 2222", companySize: "50-200", productInterest: "Solar panels", budgetRange: "R100k-R500k" },
      { companyName: "EcoBuild Contractors", contactName: "Maria van der Merwe", email: "maria@ecobuild.co.za", phone: "+27 83 222 3333", companySize: "10-50", productInterest: "Building materials", budgetRange: "R50k-R150k" },
      { companyName: "TechStart Incubator", contactName: "David Chen", email: "david@techstart.co.za", phone: "+27 84 333 4444", companySize: "10-50", productInterest: "Office supplies", budgetRange: "R10k-R50k" },
      { companyName: "GreenFields Farming", contactName: "Sarah Williams", email: "sarah@greenfields.co.za", phone: "+27 85 444 5555", companySize: "200+", productInterest: "Agricultural equipment", budgetRange: "R500k+" },
      { companyName: "Metro Office Solutions", contactName: "Tom Anderson", email: "tom@metrooffice.co.za", phone: "+27 86 555 6666", companySize: "50-200", productInterest: "Office furniture", budgetRange: "R100k-R300k" },
    ];

    for (const lead of demoLeads) {
      await ctx.db.insert("leads", {
        ...lead,
        status: "available",
        source: "Website",
        createdAt: Date.now(),
      });
    }

    return { success: true, message: "Demo leads created" };
  },
});
