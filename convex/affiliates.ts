import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentAffiliate = query({
  args: { clerkUserId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // If clerkUserId provided, try to find by clerk ID first
    if (args.clerkUserId) {
      const byClerkId = await ctx.db
        .query("affiliates")
        .withIndex("by_clerk_id")
        .filter((q) => q.eq(q.field("clerkUserId"), args.clerkUserId))
        .take(1);
      if (byClerkId.length > 0) {
        return byClerkId[0];
      }
      // User is logged in but no affiliate found - return null (not demo)
      return null;
    }
    
    // No clerkUserId - return first affiliate (for demo/unauthenticated)
    const affiliates = await ctx.db.query("affiliates").take(1);
    return affiliates[0] || null;
  },
});

export const getAffiliateById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getAllAffiliates = query({
  handler: async (ctx) => {
    return await ctx.db.query("affiliates").collect();
  },
});

// Register or get affiliate by Clerk user
export const registerAffiliate = mutation({
  args: {
    clerkUserId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    city: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    experienceLevel: v.optional(v.union(v.literal("none"), v.literal("some"), v.literal("extensive"))),
  },
  handler: async (ctx, args) => {
    // Check if already registered with Clerk
    const existing = await ctx.db
      .query("affiliates")
      .withIndex("by_clerk_id")
      .filter((q) => q.eq(q.field("clerkUserId"), args.clerkUserId))
      .take(1);
    
    if (existing.length > 0) {
      return { success: true, affiliateId: existing[0]._id, isNew: false };
    }
    
    // Generate affiliate code
    const affiliateCode = `ROV-${args.firstName.substring(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const referralLink = `https://roventis.co.za/?ref=${affiliateCode}`;
    
    // Create new affiliate
    const affiliateId = await ctx.db.insert("affiliates", {
      clerkUserId: args.clerkUserId,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: args.phone,
      city: args.city,
      linkedinUrl: args.linkedinUrl,
      experienceLevel: args.experienceLevel,
      affiliateCode,
      referralLink,
      status: "pending",
      tier: "bronze",
      trainingCompleted: false,
      isApprovedToSell: false,
      totalSales: 0,
      totalCommissionEarned: 0,
      totalCommissionPaid: 0,
      pendingCommission: 0,
      createdAt: Date.now(),
    });
    
    return { success: true, affiliateId, isNew: true };
  },
});

// Seed demo data (for testing)
export const seedDemoData = mutation({
  args: { 
    clerkUserId: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // If a Clerk user ID is provided
      if (args.clerkUserId) {
        // First check if they already have an affiliate
        const existing = await ctx.db
          .query("affiliates")
          .withIndex("by_clerk_id")
          .filter((q) => q.eq(q.field("clerkUserId"), args.clerkUserId))
          .take(1);
        
        if (existing.length > 0) {
          return { success: true, affiliateId: existing[0]._id, isNew: false };
        }
        
        // Get all affiliates
        const allAffiliates = await ctx.db.query("affiliates").collect();
        
        // Link this user to the first affiliate (demo user takeover)
        if (allAffiliates.length > 0) {
          const firstAffiliate = allAffiliates[0];
          await ctx.db.patch(firstAffiliate._id, { 
            clerkUserId: args.clerkUserId,
            firstName: args.firstName || "Demo",
            lastName: args.lastName || "User",
            email: args.email || "demo@roventis.co.za",
            status: "approved",
            isApprovedToSell: true,
          });
          return { success: true, affiliateId: firstAffiliate._id, isNew: false };
        }
        
        // No affiliate exists at all - create one
        const affiliateCode = `ROV-USER-${Date.now().toString(36).toUpperCase()}`;
        const affiliateId = await ctx.db.insert("affiliates", {
          clerkUserId: args.clerkUserId,
          firstName: args.firstName || "New",
          lastName: args.lastName || "User",
          email: args.email || "user@clerk.dev",
          phone: "",
          city: "",
          linkedinUrl: "",
          experienceLevel: "none",
          affiliateCode,
          referralLink: `https://roventis.co.za/?ref=${affiliateCode}`,
          status: "pending",
          tier: "bronze",
          trainingCompleted: false,
          isApprovedToSell: false,
          totalSales: 0,
          totalCommissionEarned: 0,
          totalCommissionPaid: 0,
          pendingCommission: 0,
          createdAt: Date.now(),
        });
        return { success: true, affiliateId, isNew: true };
      }
      
      // No Clerk user ID - check if already seeded (demo mode)
      const existing = await ctx.db.query("affiliates").take(1);
      if (existing.length > 0) {
        return { success: true, message: "Already seeded" };
      }
      
      // Create demo affiliate
      await ctx.db.insert("affiliates", {
        firstName: "Demo",
        lastName: "User",
        email: "demo@roventis.co.za",
        phone: "+27 82 123 4567",
        city: "Cape Town",
        linkedinUrl: "",
        experienceLevel: "some",
        affiliateCode: "ROV-DEMO-001",
        referralLink: "https://roventis.co.za/?ref=ROV-DEMO-001",
        status: "approved",
        tier: "gold",
        trainingCompleted: true,
        isApprovedToSell: true,
        trainingScore: 85,
        totalSales: 250000,
        totalCommissionEarned: 25000,
        totalCommissionPaid: 20000,
        pendingCommission: 5000,
        bankName: "FNB",
        accountNumber: "1234567890",
        accountType: "business",
        createdAt: Date.now(),
      });
      
      return { success: true, message: "Seeded affiliate" };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  },
});

export const seedAllData = mutation({
  handler: async (ctx) => {
    try {
      const existing = await ctx.db.query("affiliates").take(1);
      const affiliateId = existing[0]?._id;
      
      if (!affiliateId) {
        return { success: false, error: "No affiliate found" };
      }
      
      // Update affiliate with pending commission
      await ctx.db.patch(affiliateId, {
        pendingCommission: 5000,
      });
      
      // Check if deals exist
      const existingDeals = await ctx.db.query("deals").take(1);
      if (existingDeals.length === 0) {
        await ctx.db.insert("deals", {
          affiliateId,
          clientName: "Sarah Johnson",
          clientCompany: "TechCorp Solutions",
          clientEmail: "sarah@techcorp.co.za",
          dealValue: 85000,
          productCategory: ["corporate merchandise", "workwear"],
          description: "Annual corporate merchandise order",
          status: "closed_won",
          commissionRate: 10,
          commissionAmount: 8500,
          commissionStatus: "paid",
          createdAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
        });
      }
      
      // Check if training modules exist
      const existingTraining = await ctx.db.query("trainingModules").take(1);
      if (existingTraining.length === 0) {
        await ctx.db.insert("trainingModules", {
          title: "Welcome to Roventis Sourcing",
          description: "Learn about our company",
          content: "Welcome!",
          orderIndex: 0,
          isRequired: true,
          estimatedMinutes: 15,
        });
      }
      
      // Check if resources exist
      const existingResources = await ctx.db.query("resources").take(1);
      if (existingResources.length === 0) {
        await ctx.db.insert("resources", {
          title: "2024 Product Catalog",
          description: "Complete product catalog",
          fileUrl: "/catalog.pdf",
          fileType: "pdf",
          category: "catalog",
          isPublic: true,
          downloadCount: 0,
        });
      }
      
      // Seed demo leads
      const existingLeads = await ctx.db.query("leads").take(1);
      if (existingLeads.length === 0) {
        const demoLeads = [
          { companyName: "SolarTech SA", contactName: "John Smith", email: "john@solartech.co.za", phone: "+27 82 111 2222", companySize: "50-200", productInterest: "Solar panels", budgetRange: "R100k-R500k" },
          { companyName: "EcoBuild Contractors", contactName: "Maria van der Merwe", email: "maria@ecobuild.co.za", phone: "+27 83 222 3333", companySize: "10-50", productInterest: "Building materials", budgetRange: "R50k-R150k" },
          { companyName: "TechStart Incubator", contactName: "David Chen", email: "david@techstart.co.za", phone: "+27 84 333 4444", companySize: "10-50", productInterest: "Office supplies", budgetRange: "R10k-R50k" },
        ];
        for (const lead of demoLeads) {
          await ctx.db.insert("leads", {
            ...lead,
            status: "available",
            source: "Website",
            createdAt: Date.now(),
          });
        }
      }
      
      // Seed demo orders
      const existingOrders = await ctx.db.query("orders").take(1);
      if (existingOrders.length === 0) {
        await ctx.db.insert("orders", {
          affiliateId,
          clientName: "Sarah Johnson",
          clientCompany: "TechCorp Solutions",
          clientEmail: "sarah@techcorp.co.za",
          clientPhone: "+27 82 123 4567",
          deliveryAddress: "123 Tech Street, Cape Town, 8001",
          items: [
            { productName: "Corporate Branded Notebooks", quantity: 100, unitPrice: 150, total: 15000 },
          ],
          totalAmount: 15000,
          status: "delivered",
          trackingNumber: "ROV-2024-001",
          deliveryDate: Date.now() - 5 * 24 * 60 * 60 * 1000,
          commissionStatus: "approved",
          commissionAmount: 1500,
          createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        });
      }
      
      // Seed demo marketing links
      const existingMarketing = await ctx.db.query("marketingLinks").take(1);
      if (existingMarketing.length === 0) {
        await ctx.db.insert("marketingLinks", {
          affiliateId,
          name: "Main Referral Link",
          url: "https://roventis.co.za",
          shortCode: "MAIN-001",
          clicks: 156,
          conversions: 12,
          isActive: true,
          createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
        });
      }
      
      return { success: true, message: "All data seeded" };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  },
});

// Mutations
export const createAffiliate = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    city: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    experienceLevel: v.optional(v.union(v.literal("none"), v.literal("some"), v.literal("extensive"))),
    affiliateCode: v.string(),
    referralLink: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("suspended"), v.literal("inactive")),
    tier: v.union(v.literal("bronze"), v.literal("silver"), v.literal("gold"), v.literal("platinum")),
    trainingCompleted: v.boolean(),
    trainingScore: v.optional(v.number()),
    isApprovedToSell: v.optional(v.boolean()),
    totalSales: v.number(),
    totalCommissionEarned: v.number(),
    totalCommissionPaid: v.number(),
    pendingCommission: v.optional(v.number()),
    bankName: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    accountType: v.optional(v.string()),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("affiliates", args);
  },
});

export const updateAffiliate = mutation({
  args: {
    id: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    city: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    experienceLevel: v.optional(v.union(v.literal("none"), v.literal("some"), v.literal("extensive"))),
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("suspended"), v.literal("inactive"))),
    tier: v.optional(v.union(v.literal("bronze"), v.literal("silver"), v.literal("gold"), v.literal("platinum"))),
    trainingCompleted: v.optional(v.boolean()),
    trainingScore: v.optional(v.number()),
    isApprovedToSell: v.optional(v.boolean()),
    totalSales: v.optional(v.number()),
    totalCommissionEarned: v.optional(v.number()),
    totalCommissionPaid: v.optional(v.number()),
    pendingCommission: v.optional(v.number()),
    bankName: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    accountType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

// Approve affiliate to sell (after training completion)
export const approveToSell = mutation({
  args: { affiliateId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.affiliateId, {
      isApprovedToSell: true,
      trainingCompleted: true,
    });
    return { success: true };
  },
});

// Update affiliate tier (with auto-upgrade logic)
export const updateAffiliateTier = mutation({
  args: {
    affiliateId: v.string(),
    newTier: v.union(v.literal("bronze"), v.literal("silver"), v.literal("gold"), v.literal("platinum")),
  },
  handler: async (ctx, args) => {
    const affiliate = await ctx.db.get(args.affiliateId);
    if (!affiliate) {
      throw new Error("Affiliate not found");
    }

    await ctx.db.patch(args.affiliateId, {
      tier: args.newTier,
    });

    return { success: true, previousTier: affiliate.tier, newTier: args.newTier };
  },
});
