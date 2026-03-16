import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getTrainingModules = query({
  handler: async (ctx) => {
    return await ctx.db.query("trainingModules").order("asc").collect();
  },
});

export const createTrainingModule = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    content: v.string(),
    orderIndex: v.number(),
    isRequired: v.boolean(),
    estimatedMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("trainingModules", args);
  },
});

export const getTrainingProgress = query({
  args: { affiliateId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trainingProgress")
      .filter((q) => q.eq(q.field("affiliateId"), args.affiliateId))
      .collect();
  },
});

export const updateTrainingProgress = mutation({
  args: {
    affiliateId: v.string(),
    moduleId: v.string(),
    status: v.union(v.literal("not_started"), v.literal("in_progress"), v.literal("completed")),
    quizScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("trainingProgress")
      .filter((q) => 
        q.and(
          q.eq(q.field("affiliateId"), args.affiliateId),
          q.eq(q.field("moduleId"), args.moduleId)
        )
      )
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        completedAt: args.status === "completed" ? Date.now() : undefined,
        quizScore: args.quizScore,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("trainingProgress", {
        affiliateId: args.affiliateId,
        moduleId: args.moduleId,
        status: args.status,
        completedAt: args.status === "completed" ? Date.now() : undefined,
        quizScore: args.quizScore,
      });
    }
  },
});
