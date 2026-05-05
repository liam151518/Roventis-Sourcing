import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { TIER_CONFIG, getNextMondayMidnightSAST, CLAIM_TTL_MS, MAX_RELEASES_DEFAULT, getAllowedPools, getWeeklyLimit, type PoolTier } from "./lib/tierConfig";
import { isAdminClerkId, requireAdmin } from "./lib/auth";
import { internal } from "./_generated/api";

// ========== UTILITIES ==========

// Slugify function for creating dedupe keys
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Create dedupe key from lead data
function createDedupeKey(data: {
  contactEmail?: string;
  contactPhone?: string;
  companyName: string;
  city?: string;
}): string {
  if (data.contactEmail) {
    return data.contactEmail.toLowerCase().trim();
  }
  if (data.contactPhone) {
    // Normalize phone: remove all non-digits
    const normalized = data.contactPhone.replace(/\D/g, "");
    return normalized;
  }
  // Fallback: slugify company + city
  const base = data.companyName.toLowerCase().trim();
  const city = data.city ? data.city.toLowerCase().trim() : "";
  return slugify(city ? `${base}-${city}` : base);
}

// ========== QUERIES ==========

// Get available leads for an affiliate (tier-aware with pool filtering)
export const getAvailableLeadsForAffiliate = query({
  args: { affiliateId: v.string() },
  handler: async (ctx, args) => {
    const affiliate = await ctx.db.get(args.affiliateId as any);
    if (!affiliate) {
      throw new Error("Affiliate not found");
    }

    const tier = affiliate.tier;
    const allowedPools = getAllowedPools(tier);
    const weeklyLimit = getWeeklyLimit(tier);
    const now = Date.now();
    
    // Reset weekly counter if past reset time
    let weeklyClaimsUsed = affiliate.weeklyClaimsUsed || 0;
    if (affiliate.weeklyClaimsResetAt && now >= affiliate.weeklyClaimsResetAt) {
      weeklyClaimsUsed = 0;
    }

    const remainingClaims = tier === "platinum" 
      ? Infinity 
      : Math.max(0, weeklyLimit - weeklyClaimsUsed);

    // Get available leads for this tier's pools
    let leads = await ctx.db
      .query("leads")
      .withIndex("by_status_pool")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "available"),
          q.or(...allowedPools.map(pool => q.eq(q.field("poolTier"), pool)))
        )
      )
      .take(100);

    // Sort by createdAt desc
    leads.sort((a, b) => b.createdAt - a.createdAt);

    // Remove sensitive fields
    const sanitizedLeads = leads.map(lead => ({
      ...lead,
      contactEmail: undefined, // Hide until claimed
      contactPhone: undefined,
    }));

    return {
      leads: sanitizedLeads,
      remainingClaimsThisWeek: remainingClaims,
      weeklyLimit,
      resetAt: affiliate.weeklyClaimsResetAt || getNextMondayMidnightSAST(now),
    };
  },
});

// Get leads claimed by current affiliate
export const getMyClaimedLeads = query({
  args: { affiliateId: v.string() },
  handler: async (ctx, args) => {
    const affiliate = await ctx.db.get(args.affiliateId as any);
    if (!affiliate) {
      return [];
    }

    const affiliateId = args.affiliateId;
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_claimedBy")
      .filter((q) => q.eq(q.field("claimedBy"), affiliateId))
      .collect();

    // Filter to only claimed (not converted/expired/retired)
    return leads.filter(lead => lead.status === "claimed");
  },
});

// Get all leads (admin view)
export const getAllLeadsAdmin = query({
  args: {
    status: v.optional(v.union(v.literal("available"), v.literal("claimed"), v.literal("converted"), v.literal("expired"), v.literal("retired"))),
    poolTier: v.optional(v.union(v.literal("standard"), v.literal("priority"), v.literal("premium"))),
    city: v.optional(v.string()),
    industry: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let leads = await ctx.db.query("leads").collect();

    // Apply filters
    if (args.status) {
      leads = leads.filter(l => l.status === args.status);
    }
    if (args.poolTier) {
      leads = leads.filter(l => l.poolTier === args.poolTier);
    }
    if (args.city) {
      leads = leads.filter(l => l.city?.toLowerCase().includes(args.city!.toLowerCase()));
    }
    if (args.industry) {
      leads = leads.filter(l => l.industry?.toLowerCase().includes(args.industry!.toLowerCase()));
    }

    // Sort by createdAt desc
    leads.sort((a, b) => b.createdAt - a.createdAt);

    return leads;
  },
});

// Get lead activity log
export const getLeadActivity = query({
  args: { leadId: v.string() },
  handler: async (ctx, args) => {
    const activity = await ctx.db
      .query("leadActivity")
      .withIndex("by_leadId")
      .filter((q) => q.eq(q.field("leadId"), args.leadId))
      .collect();

    // Sort by createdAt desc
    activity.sort((a, b) => b.createdAt - a.createdAt);
    return activity;
  },
});

// Get all lead activity (admin view)
export const getAllLeadActivity = query({
  handler: async (ctx) => {
    const activity = await ctx.db.query("leadActivity").collect();
    // Sort by createdAt desc, take 100
    activity.sort((a, b) => b.createdAt - a.createdAt);
    return activity.slice(0, 100);
  },
});

// Get lead counts for dashboard
export const getLeadStats = query({
  args: { affiliateId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const allLeads = await ctx.db.query("leads").collect();

    const available = allLeads.filter(l => l.status === "available");
    const claimed = allLeads.filter(l => l.status === "claimed");
    
    let myActiveClaims = 0;
    let myClaimedExpirng: { leadId: string; expiresAt: number } | null = null;
    
    if (args.affiliateId) {
      const myClaimed = claimed.filter(l => l.claimedBy === args.affiliateId);
      myActiveClaims = myClaimed.length;
      
      // Find the one expiring soonest
      if (myClaimed.length > 0) {
        let earliest = myClaimed[0];
        for (const lead of myClaimed) {
          if (lead.claimExpiresAt && (!earliest.claimExpiresAt || lead.claimExpiresAt < earliest.claimExpiresAt)) {
            earliest = lead;
          }
        }
        myClaimedExpirng = { leadId: earliest._id, expiresAt: earliest.claimExpiresAt! };
      }
    }

    return {
      availableCount: available.length,
      claimedCount: claimed.length,
      myActiveClaims,
      myClaimedExpiring: myClaimedExpirng,
      byPool: {
        standard: available.filter(l => l.poolTier === "standard").length,
        priority: available.filter(l => l.poolTier === "priority").length,
        premium: available.filter(l => l.poolTier === "premium").length,
      },
    };
  },
});

// ========== MUTATIONS ==========

// Claim a lead
export const claimLead = mutation({
  args: { affiliateId: v.string(), leadId: v.string() },
  handler: async (ctx, args) => {
    const { affiliateId, leadId } = args;
    const now = Date.now();

    // a) Load affiliate and verify status
    const affiliate = await ctx.db.get(affiliateId);
    if (!affiliate) {
      throw new Error("Affiliate not found");
    }
    if (affiliate.status !== "approved") {
      throw new Error("Your account must be approved before claiming leads.");
    }
    if (affiliate.isApprovedToSell !== true) {
      throw new Error("You must complete training and be approved before claiming leads.");
    }

    const tier = affiliate.tier;
    const allowedPools = getAllowedPools(tier);
    const weeklyLimit = getWeeklyLimit(tier);

    // b) Load lead and verify availability
    const lead = await ctx.db.get(leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }
    if (lead.status !== "available") {
      throw new Error("This lead is no longer available.");
    }

    // c) Verify pool tier is allowed for this affiliate
    if (!allowedPools.includes(lead.poolTier)) {
      throw new Error(`This lead is reserved for ${lead.poolTier.charAt(0).toUpperCase() + lead.poolTier.slice(1)} tier or higher.`);
    }

    // d) Reset weekly counter if past reset time
    let weeklyClaimsUsed = affiliate.weeklyClaimsUsed || 0;
    let weeklyClaimsResetAt = affiliate.weeklyClaimsResetAt || getNextMondayMidnightSAST(now);
    
    if (now >= weeklyClaimsResetAt) {
      weeklyClaimsUsed = 0;
      weeklyClaimsResetAt = getNextMondayMidnightSAST(now);
    }

    // e) Check weekly limit (skip for Platinum)
    if (tier !== "platinum" && weeklyClaimsUsed >= weeklyLimit) {
      const resetDate = new Date(weeklyClaimsResetAt);
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      throw new Error(`You've reached your weekly lead limit of ${weeklyLimit}. Resets on ${days[resetDate.getDay()]} at midnight SAST.`);
    }

    // f) Atomically patch the lead
    await ctx.db.patch(leadId, {
      status: "claimed",
      claimedBy: affiliateId,
      claimedAt: now,
      claimExpiresAt: now + CLAIM_TTL_MS,
    });

    // g) Patch affiliate: increment counters
    await ctx.db.patch(affiliateId, {
      weeklyClaimsUsed: weeklyClaimsUsed + 1,
      weeklyClaimsResetAt,
      totalLeadsClaimed: (affiliate.totalLeadsClaimed || 0) + 1,
    });

    // h) Automatically create a deal in the pipeline from this claimed lead
    const dealValue = lead.estimatedBudget || 50000;
    let commissionRate = 0.05;
    if (tier === "silver") commissionRate = 0.10;
    if (tier === "gold") commissionRate = 0.15;
    if (tier === "platinum") commissionRate = 0.25;

    const dealId = await ctx.db.insert("deals", {
      affiliateId: affiliateId,
      clientName: lead.contactName || lead.companyName,
      clientCompany: lead.companyName,
      clientEmail: lead.contactEmail,
      clientPhone: lead.contactPhone,
      dealValue: dealValue,
      productCategory: lead.productInterest || [],
      description: lead.notes,
      status: "qualified",
      commissionRate,
      commissionAmount: dealValue * commissionRate,
      commissionStatus: "pending",
      fromLeadId: leadId,
      leadClaimExpiresAt: now + CLAIM_TTL_MS,
      createdAt: now,
    });

    // i) Log activity
    await ctx.db.insert("leadActivity", {
      leadId: leadId,
      affiliateId: affiliateId,
      action: "claimed",
      meta: JSON.stringify({ tier, dealId }),
      createdAt: now,
    });

    // Return the full lead
    return await ctx.db.get(leadId);
  },
});

// Release a lead back to pool
export const releaseLead = mutation({
  args: { affiliateId: v.string(), leadId: v.string(), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { affiliateId, leadId, reason } = args;
    const now = Date.now();

    const lead = await ctx.db.get(leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    // Verify ownership
    if (lead.claimedBy !== affiliateId) {
      throw new Error("You don't own this lead.");
    }
    if (lead.status !== "claimed") {
      throw new Error("This lead is not currently claimed.");
    }

    // Check if at max releases
    const newTimesReleased = (lead.timesReleased || 0) + 1;
    const shouldRetire = newTimesReleased >= (lead.maxReleases || MAX_RELEASES_DEFAULT);

    // Find and delete the associated deal (if any exists from lead)
    const associatedDeals = await ctx.db
      .query("deals")
      .filter((q) => q.and(
        q.eq(q.field("affiliateId"), affiliateId),
        q.eq(q.field("fromLeadId"), leadId)
      ))
      .collect();
    
    for (const deal of associatedDeals) {
      await ctx.db.delete(deal._id);
    }

    // Update lead
    await ctx.db.patch(leadId, {
      status: shouldRetire ? "retired" : "available",
      timesReleased: newTimesReleased,
      claimedBy: undefined,
      claimedAt: undefined,
      claimExpiresAt: undefined,
    });

    // Log activity
    await ctx.db.insert("leadActivity", {
      leadId: leadId,
      affiliateId: affiliateId,
      action: shouldRetire ? "retired" : "released",
      meta: reason ? JSON.stringify({ reason }) : undefined,
      createdAt: now,
    });

    return { success: true, status: shouldRetire ? "retired" : "available" };
  },
});

// Convert lead to deal
export const convertLeadToDeal = mutation({
  args: { affiliateId: v.string(), leadId: v.string() },
  handler: async (ctx, args) => {
    const { affiliateId, leadId } = args;
    const now = Date.now();

    // Load lead
    const lead = await ctx.db.get(leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    // Verify ownership
    if (lead.claimedBy !== affiliateId) {
      throw new Error("You don't own this lead.");
    }
    if (lead.status !== "claimed") {
      throw new Error("This lead is not currently claimed.");
    }

    // Load affiliate for commission rate
    const affiliate = await ctx.db.get(affiliateId);
    if (!affiliate) {
      throw new Error("Affiliate not found");
    }

    // Calculate commission rate based on tier
    let commissionRate = 0.05;
    if (affiliate.tier === "silver") commissionRate = 0.10;
    if (affiliate.tier === "gold") commissionRate = 0.15;
    if (affiliate.tier === "platinum") commissionRate = 0.25;

    // Find existing deal created when lead was claimed
    const associatedDeals = await ctx.db
      .query("deals")
      .filter((q) => q.and(
        q.eq(q.field("affiliateId"), affiliateId),
        q.eq(q.field("fromLeadId"), leadId)
      ))
      .collect();
    
    let dealId;
    if (associatedDeals.length > 0) {
      // Update existing deal
      dealId = associatedDeals[0]._id;
      await ctx.db.patch(dealId, {
        status: "qualified",
        commissionRate,
        commissionAmount: (associatedDeals[0].dealValue || 50000) * commissionRate,
      });
    } else {
      // Fallback: create deal if none exists (shouldn't happen normally)
      const dealValue = lead.estimatedBudget || 50000;
      dealId = await ctx.db.insert("deals", {
        affiliateId: affiliateId,
        clientName: lead.contactName || lead.companyName,
        clientCompany: lead.companyName,
        clientEmail: lead.contactEmail,
        clientPhone: lead.contactPhone,
        dealValue: dealValue,
        productCategory: lead.productInterest || [],
        description: lead.notes,
        status: "qualified",
        commissionRate,
        commissionAmount: dealValue * commissionRate,
        commissionStatus: "pending",
        fromLeadId: leadId,
        leadClaimExpiresAt: lead.claimExpiresAt || undefined,
        createdAt: now,
      });
    }

    // Update lead status
    await ctx.db.patch(leadId, {
      status: "converted",
    });

    // Update affiliate converted count
    await ctx.db.patch(affiliateId, {
      totalLeadsConverted: (affiliate.totalLeadsConverted || 0) + 1,
    });

    // Log activity
    await ctx.db.insert("leadActivity", {
      leadId: leadId,
      affiliateId: affiliateId,
      action: "converted",
      meta: JSON.stringify({ dealId }),
      createdAt: now,
    });

    return { success: true, dealId };
  },
});

// Bulk upload leads (admin only)
export const bulkUploadLeads = mutation({
  args: {
    leads: v.array(v.object({
      companyName: v.string(),
      contactName: v.optional(v.string()),
      contactEmail: v.optional(v.string()),
      contactPhone: v.optional(v.string()),
      city: v.optional(v.string()),
      province: v.optional(v.string()),
      industry: v.optional(v.string()),
      productInterest: v.optional(v.array(v.string())),
      estimatedBudget: v.optional(v.number()),
      notes: v.optional(v.string()),
      source: v.optional(v.string()),
      poolTier: v.optional(v.union(v.literal("standard"), v.literal("priority"), v.literal("premium"))),
    })),
    uploadBatchId: v.string(),
    adminClerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Server-side admin check
    if (!isAdminClerkId(args.adminClerkUserId)) {
      throw new Error("Admin access required");
    }

    const now = Date.now();
    let inserted = 0;
    let skippedDuplicates = 0;
    const errors: string[] = [];

    // Get existing dedupe keys
    const existingLeads = await ctx.db.query("leads").collect();
    const existingKeys = new Set(existingLeads.map(l => l.dedupeKey));

    for (const leadData of args.leads) {
      try {
        const dedupeKey = createDedupeKey(leadData);

        // Skip duplicates
        if (existingKeys.has(dedupeKey)) {
          skippedDuplicates++;
          continue;
        }

        // Insert new lead
        const leadId = await ctx.db.insert("leads", {
          companyName: leadData.companyName,
          contactName: leadData.contactName,
          contactEmail: leadData.contactEmail,
          contactPhone: leadData.contactPhone,
          city: leadData.city,
          province: leadData.province,
          industry: leadData.industry,
          productInterest: leadData.productInterest || [],
          estimatedBudget: leadData.estimatedBudget,
          notes: leadData.notes,
          source: leadData.source || "manual",
          dedupeKey,
          poolTier: leadData.poolTier || "standard",
          status: "available",
          timesReleased: 0,
          maxReleases: MAX_RELEASES_DEFAULT,
          uploadedBy: args.adminClerkUserId,
          uploadBatchId: args.uploadBatchId,
          createdAt: now,
        });

        // Log activity
        await ctx.db.insert("leadActivity", {
          leadId: leadId,
          affiliateId: undefined,
          action: "uploaded",
          meta: JSON.stringify({ batchId: args.uploadBatchId }),
          createdAt: now,
        });

        existingKeys.add(dedupeKey);
        inserted++;
      } catch (e) {
        errors.push(`Error creating lead "${leadData.companyName}": ${e}`);
      }
    }

    return { inserted, skippedDuplicates, errors };
  },
});

// Admin: reassign a lead to a different affiliate
export const adminReassignLead = mutation({
  args: { leadId: v.string(), newAffiliateId: v.string(), adminClerkUserId: v.string() },
  handler: async (ctx, args) => {
    // Server-side admin check
    if (!isAdminClerkId(args.adminClerkUserId)) {
      throw new Error("Admin access required");
    }

    const lead = await ctx.db.get(args.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    const newAffiliate = await ctx.db.get(args.newAffiliateId);
    if (!newAffiliate) {
      throw new Error("New affiliate not found");
    }

    const now = Date.now();
    const oldAffiliateId = lead.claimedBy;

    // Update lead
    await ctx.db.patch(args.leadId, {
      claimedBy: args.newAffiliateId,
      claimedAt: now,
      claimExpiresAt: now + CLAIM_TTL_MS,
    });

    // Log activity
    await ctx.db.insert("leadActivity", {
      leadId: args.leadId,
      affiliateId: args.newAffiliateId,
      action: "admin_reassigned",
      meta: JSON.stringify({ fromAffiliateId: oldAffiliateId }),
      createdAt: now,
    });

    return { success: true };
  },
});

// Admin: force release a lead (returns to pool)
export const adminReleaseLead = mutation({
  args: { leadId: v.string(), adminClerkUserId: v.string() },
  handler: async (ctx, args) => {
    // Server-side admin check
    if (!isAdminClerkId(args.adminClerkUserId)) {
      throw new Error("Admin access required");
    }

    const lead = await ctx.db.get(args.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    const now = Date.now();
    const newTimesReleased = (lead.timesReleased || 0) + 1;
    const shouldRetire = newTimesReleased >= (lead.maxReleases || MAX_RELEASES_DEFAULT);

    await ctx.db.patch(args.leadId, {
      status: shouldRetire ? "retired" : "available",
      timesReleased: newTimesReleased,
      claimedBy: undefined,
      claimedAt: undefined,
      claimExpiresAt: undefined,
    });

    await ctx.db.insert("leadActivity", {
      leadId: args.leadId,
      affiliateId: lead.claimedBy,
      action: shouldRetire ? "retired" : "released",
      meta: JSON.stringify({ by: "admin" }),
      createdAt: now,
    });

    return { success: true, status: shouldRetire ? "retired" : "available" };
  },
});

// Admin: retire a lead manually
export const adminRetireLead = mutation({
  args: { leadId: v.string(), adminClerkUserId: v.string() },
  handler: async (ctx, args) => {
    // Server-side admin check
    if (!isAdminClerkId(args.adminClerkUserId)) {
      throw new Error("Admin access required");
    }

    const lead = await ctx.db.get(args.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    const now = Date.now();

    await ctx.db.patch(args.leadId, {
      status: "retired",
      claimedBy: undefined,
      claimedAt: undefined,
      claimExpiresAt: undefined,
    });

    await ctx.db.insert("leadActivity", {
      leadId: args.leadId,
      affiliateId: undefined,
      action: "retired",
      meta: JSON.stringify({ by: "admin" }),
      createdAt: now,
    });

    return { success: true };
  },
});

// Admin: delete a lead
export const adminDeleteLead = mutation({
  args: { leadId: v.string(), adminClerkUserId: v.string() },
  handler: async (ctx, args) => {
    // Server-side admin check
    if (!isAdminClerkId(args.adminClerkUserId)) {
      throw new Error("Admin access required");
    }

    const lead = await ctx.db.get(args.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    await ctx.db.delete(args.leadId);
    return { success: true };
  },
});

// ========== INTERNAL MUTATIONS (called by cron) ==========

// Expire stale claims - called every 30 minutes
export const expireStaleClaims = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();

    // Find all claimed leads with expired claimExpiresAt
    const allLeads = await ctx.db.query("leads").collect();
    const staleLeads = allLeads.filter(
      lead => lead.status === "claimed" && lead.claimExpiresAt && lead.claimExpiresAt <= now
    );

    let expired = 0;

    for (const lead of staleLeads) {
      const newTimesReleased = (lead.timesReleased || 0) + 1;
      const shouldRetire = newTimesReleased >= (lead.maxReleases || MAX_RELEASES_DEFAULT);

      await ctx.db.patch(lead._id, {
        status: shouldRetire ? "retired" : "available",
        timesReleased: newTimesReleased,
        claimedBy: undefined,
        claimedAt: undefined,
        claimExpiresAt: undefined,
      });

      // Log activity
      await ctx.db.insert("leadActivity", {
        leadId: lead._id,
        affiliateId: lead.claimedBy,
        action: shouldRetire ? "retired" : "expired",
        meta: JSON.stringify({ auto: true }),
        createdAt: now,
      });

      expired++;
    }

    return { expired };
  },
});

// Reset weekly counters - called every Monday
export const resetWeeklyCounters = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const nextReset = getNextMondayMidnightSAST(now);

    const affiliates = await ctx.db.query("affiliates").collect();
    let reset = 0;

    for (const affiliate of affiliates) {
      if (affiliate.weeklyClaimsResetAt && now >= affiliate.weeklyClaimsResetAt) {
        await ctx.db.patch(affiliate._id, {
          weeklyClaimsUsed: 0,
          weeklyClaimsResetAt: nextReset,
        });
        reset++;
      }
    }

    return { reset };
  },
});

// ========== SEED DATA ==========

// Seed demo leads
export const seedDemoLeads = mutation({
  args: { adminClerkUserId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Check if leads exist
    const existing = await ctx.db.query("leads").take(1);
    if (existing.length > 0) {
      return { success: false, message: "Leads already exist" };
    }

    const now = Date.now();

    // Check for admin auth if provided
    if (args.adminClerkUserId && !isAdminClerkId(args.adminClerkUserId)) {
      throw new Error("Admin access required");
    }

    const demoLeads = [
      // Standard tier - various industries
      { companyName: "Kruger Bush Lodge", contactName: "Jan van der Merwe", contactEmail: "jan@krugerbuslodge.co.za", contactPhone: "+27 82 111 2222", city: "Nelspruit", province: "Mpumalanga", industry: "Lodge", productInterest: ["workwear", "merchandise"], estimatedBudget: 75000, poolTier: "standard" as PoolTier },
      { companyName: "Highveld Mining Co", contactName: "Pieter Smit", contactEmail: "pieter@highveldmining.com", contactPhone: "+27 83 222 3333", city: "Secunda", province: "Mpumalanga", industry: "Mining", productInterest: ["workwear", "safety"], estimatedBudget: 150000, poolTier: "standard" as PoolTier },
      { companyName: "Sandton Corporate Gifts", contactName: "Sarah Jones", contactEmail: "sarah@sandtongifts.co.za", contactPhone: "+27 84 333 4444", city: "Sandton", province: "Gauteng", industry: "Corporate", productInterest: ["merchandise"], estimatedBudget: 50000, poolTier: "standard" as PoolTier },
      { companyName: "Cape Town Construction", contactName: "David Smith", contactEmail: "david@ctconstruction.co.za", contactPhone: "+27 85 444 5555", city: "Cape Town", province: "Western Cape", industry: "Construction", productInterest: ["workwear"], estimatedBudget: 100000, poolTier: "standard" as PoolTier },
      { companyName: "Durban Logistics", contactName: "Tom Anderson", contactEmail: "tom@durbanlogistics.co.za", contactPhone: "+27 86 555 6666", city: "Durban", province: "KZN", industry: "Logistics", productInterest: ["workwear", "merchandise"], estimatedBudget: 80000, poolTier: "standard" as PoolTier },
      { companyName: "Johannesburg Office Solutions", contactName: "Maria Botha", contactEmail: "maria@joburgoffice.co.za", contactPhone: "+27 87 666 7777", city: "Johannesburg", province: "Gauteng", industry: "Corporate", productInterest: ["merchandise", "sourcing"], estimatedBudget: 60000, poolTier: "standard" as PoolTier },
      { companyName: "Pretoria Tech Hub", contactName: "John Meyer", contactEmail: "john@prettiatech.co.za", contactPhone: "+27 88 777 8888", city: "Pretoria", province: "Gauteng", industry: "Tech", productInterest: ["merchandise"], estimatedBudget: 45000, poolTier: "standard" as PoolTier },
      { companyName: "Port Elizabeth Auto", contactName: "Lisa Williams", contactEmail: "lisa@peauto.co.za", contactPhone: "+27 89 888 9999", city: "Port Elizabeth", province: "Eastern Cape", industry: "Automotive", productInterest: ["workwear"], estimatedBudget: 90000, poolTier: "standard" as PoolTier },
      { companyName: "Bloemfontein Medical", contactName: "Robert Brown", contactEmail: "robert@bloemmed.co.za", contactPhone: "+27 82 999 1111", city: "Bloemfontein", province: "Free State", industry: "Medical", productInterest: ["workwear", "merchandise"], estimatedBudget: 120000, poolTier: "standard" as PoolTier },
      { companyName: "East London Retail", contactName: "Anna Clarke", contactEmail: "anna@elretail.co.za", contactPhone: "+27 83 111 2222", city: "East London", province: "Eastern Cape", industry: "Retail", productInterest: ["merchandise"], estimatedBudget: 55000, poolTier: "standard" as PoolTier },
      // Priority tier - larger companies
      { companyName: "Sun International Hotels", contactName: "James Wilson", contactEmail: "james@sunintl.co.za", contactPhone: "+27 84 222 3333", city: "Johannesburg", province: "Gauteng", industry: "Hospitality", productInterest: ["workwear", "merchandise"], estimatedBudget: 250000, poolTier: "priority" as PoolTier },
      { companyName: "Anglo American Mining", contactName: "Michael Thompson", contactEmail: "michael@anglo.co.za", contactPhone: "+27 85 333 4444", city: "Johannesburg", province: "Gauteng", industry: "Mining", productInterest: ["workwear", "safety"], estimatedBudget: 500000, poolTier: "priority" as PoolTier },
      { companyName: "Standard Bank Corporate", contactName: "Patricia Davis", contactEmail: "patricia@standardbank.co.za", contactPhone: "+27 86 444 5555", city: "Johannesburg", province: "Gauteng", industry: "Finance", productInterest: ["merchandise"], estimatedBudget: 350000, poolTier: "priority" as PoolTier },
      { companyName: "Pick n Pay HQ", contactName: "Richard Taylor", contactEmail: "richard@picknpay.co.za", contactPhone: "+27 87 555 6666", city: "Durban", province: "KZN", industry: "Retail", productInterest: ["workwear", "merchandise"], estimatedBudget: 400000, poolTier: "priority" as PoolTier },
      { companyName: "Woolworths SA", contactName: "Jennifer White", contactEmail: "jennifer@woolworths.co.za", contactPhone: "+27 88 666 7777", city: "Cape Town", province: "Western Cape", industry: "Retail", productInterest: ["merchandise", "sourcing"], estimatedBudget: 450000, poolTier: "priority" as PoolTier },
      // Premium tier - enterprise
      { companyName: "SABMiller", contactName: "Daniel Johnson", contactEmail: "daniel@sabmiller.co.za", contactPhone: "+27 89 777 8888", city: "Johannesburg", province: "Gauteng", industry: "Manufacturing", productInterest: ["workwear", "merchandise", "sourcing"], estimatedBudget: 800000, poolTier: "premium" as PoolTier },
      { companyName: "Tiger Brands", contactName: "Michelle Lee", contactEmail: "michelle@tigerbrands.co.za", contactPhone: "+27 82 888 9999", city: "Johannesburg", province: "Gauteng", industry: "Manufacturing", productInterest: ["workwear", "merchandise"], estimatedBudget: 750000, poolTier: "premium" as PoolTier },
      { companyName: "MTN South Africa", contactName: "Kevin Martin", contactEmail: "kevin@mtn.co.za", contactPhone: "+27 83 999 1111", city: "Johannesburg", province: "Gauteng", industry: "Telecom", productInterest: ["merchandise", "sourcing"], estimatedBudget: 900000, poolTier: "premium" as PoolTier },
      { companyName: "Vodacom", contactName: "Sandra Garcia", contactEmail: "sandra@vodacom.co.za", contactPhone: "+27 84 111 2222", city: "Midrand", province: "Gauteng", industry: "Telecom", productInterest: ["merchandise"], estimatedBudget: 850000, poolTier: "premium" as PoolTier },
      { companyName: "Discovery Health", contactName: "Andrew Nel", contactEmail: "andrew@discovery.co.za", contactPhone: "+27 85 222 3333", city: "Sandton", province: "Gauteng", industry: "Healthcare", productInterest: ["merchandise", "workwear"], estimatedBudget: 600000, poolTier: "premium" as PoolTier },
    ];

    for (const leadData of demoLeads) {
      const dedupeKey = createDedupeKey(leadData);

      const leadId = await ctx.db.insert("leads", {
        companyName: leadData.companyName,
        contactName: leadData.contactName,
        contactEmail: leadData.contactEmail,
        contactPhone: leadData.contactPhone,
        city: leadData.city,
        province: leadData.province,
        industry: leadData.industry,
        productInterest: leadData.productInterest,
        estimatedBudget: leadData.estimatedBudget,
        notes: undefined,
        source: "seed",
        dedupeKey,
        poolTier: leadData.poolTier,
        status: "available",
        timesReleased: 0,
        maxReleases: MAX_RELEASES_DEFAULT,
        createdAt: now,
      });

      await ctx.db.insert("leadActivity", {
        leadId: leadId,
        affiliateId: undefined,
        action: "uploaded",
        meta: JSON.stringify({ seed: true }),
        createdAt: now,
      });
    }

    return { success: true, count: demoLeads.length };
  },
});