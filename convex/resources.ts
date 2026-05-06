import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getResources = query({
  args: { 
    category: v.optional(v.union(
      v.literal("coaching_sheet"),
      v.literal("catalog"),
      v.literal("price_list"),
      v.literal("script"),
      v.literal("creative"),
      v.literal("legal")
    )),
  },
  handler: async (ctx, args) => {
    let results = await ctx.db.query("resources").collect();
    // Only return published resources (not drafts)
    results = results.filter((r) => !r.isDraft);
    if (args.category) {
      results = results.filter((r) => r.category === args.category);
    }
    return results;
  },
});

export const createResource = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    fileUrl: v.optional(v.string()),
    fileType: v.union(v.literal("pdf"), v.literal("video"), v.literal("image"), v.literal("link")),
    category: v.union(v.literal("coaching_sheet"), v.literal("catalog"), v.literal("price_list"), v.literal("script"), v.literal("creative"), v.literal("legal")),
    isPublic: v.boolean(),
    isDraft: v.boolean(),
    downloadCount: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("resources", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const incrementDownloadCount = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const resource = await ctx.db.get(args.id as Id<"resources">);
    if (resource) {
      await ctx.db.patch(args.id as Id<"resources">, { downloadCount: resource.downloadCount + 1 });
    }
    return args.id;
  },
});
