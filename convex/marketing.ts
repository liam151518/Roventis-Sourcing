import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Get marketing links for current affiliate
export const getMyMarketingLinks = query({
  args: { affiliateId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("marketingLinks")
      .withIndex("by_affiliate")
      .filter((q) => q.eq(q.field("affiliateId"), args.affiliateId))
      .collect();
  },
});

// Get all marketing links (admin)
export const getAllMarketingLinks = query({
  handler: async (ctx) => {
    return await ctx.db.query("marketingLinks").collect();
  },
});

// Create marketing link
export const createMarketingLink = mutation({
  args: {
    affiliateId: v.string(),
    name: v.string(),
    productId: v.optional(v.string()),
    category: v.optional(v.string()),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate short code
    const shortCode = `${args.affiliateId.slice(0, 8)}-${Date.now().toString(36).slice(-4)}`;
    const affiliate = await ctx.db.get(args.affiliateId as Id<"affiliates">);
    
    const fullUrl = `${args.url}?ref=${affiliate?.affiliateCode || ''}`;

    const linkId = await ctx.db.insert("marketingLinks", {
      ...args,
      url: fullUrl,
      shortCode,
      clicks: 0,
      conversions: 0,
      isActive: true,
      createdAt: Date.now(),
    });

    return linkId;
  },
});

// Track link click
export const trackClick = mutation({
  args: { linkId: v.string() },
  handler: async (ctx, args) => {
    const link = await ctx.db.get(args.linkId as Id<"marketingLinks">);
    if (link) {
      await ctx.db.patch(args.linkId as Id<"marketingLinks">, {
        clicks: link.clicks + 1,
      });
    }
    return { success: true };
  },
});

// Track conversion
export const trackConversion = mutation({
  args: { linkId: v.string() },
  handler: async (ctx, args) => {
    const link = await ctx.db.get(args.linkId as Id<"marketingLinks">);
    if (link) {
      await ctx.db.patch(args.linkId as Id<"marketingLinks">, {
        conversions: link.conversions + 1,
      });
    }
    return { success: true };
  },
});

// Toggle link active status
export const toggleMarketingLink = mutation({
  args: { linkId: v.string() },
  handler: async (ctx, args) => {
    const link = await ctx.db.get(args.linkId as Id<"marketingLinks">);
    if (link) {
      await ctx.db.patch(args.linkId as Id<"marketingLinks">, {
        isActive: !link.isActive,
      });
    }
    return { success: true };
  },
});

// Delete marketing link
export const deleteMarketingLink = mutation({
  args: { linkId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.linkId as any);
    return { success: true };
  },
});
