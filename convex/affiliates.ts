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
    return await ctx.db.get(args.id as any);
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
      // Vetting is done pre-Clerk-add. New users start active. Use suspended
      // or deactivated to revoke access later.
      access: "active",
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
    access: v.optional(v.union(v.literal("active"), v.literal("paused"), v.literal("suspended"), v.literal("deactivated"))),
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
    access: v.optional(v.union(v.literal("active"), v.literal("paused"), v.literal("suspended"), v.literal("deactivated"))),
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
    await ctx.db.patch(id as any, updates);
    return id;
  },
});

// Approve affiliate to sell (after training completion)
export const approveToSell = mutation({
  args: { affiliateId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.affiliateId as any, {
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
    const affiliate = await ctx.db.get(args.affiliateId as any) as any;
    if (!affiliate) {
      throw new Error("Affiliate not found");
    }

    await ctx.db.patch(args.affiliateId as any, {
      tier: args.newTier,
    });

    return { success: true, previousTier: affiliate.tier, newTier: args.newTier };
  },
});

// ========== COACHING COURSE PROGRESS ==========
//
// The "Roventis Behavioral Sales Manual" (coaching course) lives in
// src/components/coaching/coachingContent.ts. The client marks
// lessons complete one-by-one. Once every lesson ID is in the
// completed set, the course is considered done and the user can
// claim leads. The lead-claim gate in convex/leads.ts enforces this.

// Mark a single coaching lesson as complete for the current affiliate.
// Idempotent - marking an already-complete lesson is a no-op.
export const markCoachingLessonComplete = mutation({
  args: {
    clerkUserId: v.string(),
    lessonId: v.string(),
    totalLessonCount: v.number(),
  },
  handler: async (ctx, args) => {
    const byClerkId = await ctx.db
      .query("affiliates")
      .withIndex("by_clerk_id")
      .filter((q) => q.eq(q.field("clerkUserId"), args.clerkUserId))
      .first();

    if (!byClerkId) {
      throw new Error("Affiliate not found");
    }

    const completed: string[] = (byClerkId as any).coachingCompletedLessonIds ?? [];
    if (completed.includes(args.lessonId)) {
      return { success: true, alreadyComplete: true, courseComplete: completed.length >= args.totalLessonCount };
    }

    const next = Array.from(new Set([...completed, args.lessonId]));
    const patch: Record<string, any> = { coachingCompletedLessonIds: next };

    if (next.length >= args.totalLessonCount) {
      patch.coachingCourseCompletedAt = Date.now();
      // Once coaching is done, also lift the training gate so the
      // user can claim leads. The DB training modules remain as
      // optional additional training on top of this.
      patch.isApprovedToSell = true;
    }

    await ctx.db.patch(byClerkId._id, patch);
    return {
      success: true,
      alreadyComplete: false,
      courseComplete: next.length >= args.totalLessonCount,
    };
  },
});

// Reset coaching progress (e.g. admin wants a user to retake the
// course). Currently unused on the client; kept for future tooling.
export const resetCoachingProgress = mutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const byClerkId = await ctx.db
      .query("affiliates")
      .withIndex("by_clerk_id")
      .filter((q) => q.eq(q.field("clerkUserId"), args.clerkUserId))
      .first();

    if (!byClerkId) {
      throw new Error("Affiliate not found");
    }

    await ctx.db.patch(byClerkId._id, {
      coachingCompletedLessonIds: [],
      coachingCourseCompletedAt: undefined,
      // Don't unset isApprovedToSell here - that's a separate gate
      // that may have been earned via DB training modules too.
    });
    return { success: true };
  },
});
