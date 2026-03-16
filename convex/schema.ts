import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Affiliate users
  affiliates: defineTable({
    clerkUserId: v.optional(v.string()),
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
    totalSales: v.number(),
    totalCommissionEarned: v.number(),
    totalCommissionPaid: v.number(),
    bankName: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    accountType: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"])
    .index("by_clerk_id", ["clerkUserId"])
    .index("by_status", ["status"]),

  // Deals
  deals: defineTable({
    affiliateId: v.string(),
    clientName: v.string(),
    clientCompany: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
    clientPhone: v.optional(v.string()),
    dealValue: v.number(),
    productCategory: v.array(v.string()),
    description: v.optional(v.string()),
    status: v.union(v.literal("prospect"), v.literal("qualified"), v.literal("proposal_sent"), v.literal("negotiation"), v.literal("closed_won"), v.literal("closed_lost"), v.literal("on_hold")),
    commissionRate: v.number(),
    commissionAmount: v.number(),
    commissionStatus: v.union(v.literal("pending"), v.literal("approved"), v.literal("paid"), v.literal("disputed")),
    expectedCloseDate: v.optional(v.number()),
    actualCloseDate: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_affiliate", ["affiliateId"])
    .index("by_status", ["status"]),

  // Training modules
  trainingModules: defineTable({
    title: v.string(),
    description: v.string(),
    content: v.string(),
    orderIndex: v.number(),
    isRequired: v.boolean(),
    estimatedMinutes: v.number(),
  }).index("by_order", ["orderIndex"]),

  // Training progress
  trainingProgress: defineTable({
    affiliateId: v.string(),
    moduleId: v.string(),
    status: v.union(v.literal("not_started"), v.literal("in_progress"), v.literal("completed")),
    completedAt: v.optional(v.number()),
    quizScore: v.optional(v.number()),
  }).index("by_affiliate", ["affiliateId"])
    .index("by_module", ["moduleId"]),

  // Resources
  resources: defineTable({
    title: v.string(),
    description: v.string(),
    fileUrl: v.optional(v.string()),
    fileType: v.union(v.literal("pdf"), v.literal("video"), v.literal("image"), v.literal("link")),
    category: v.union(v.literal("coaching_sheet"), v.literal("catalog"), v.literal("price_list"), v.literal("script"), v.literal("creative"), v.literal("legal")),
    isPublic: v.boolean(),
    downloadCount: v.number(),
    createdAt: v.number(),
  }).index("by_category", ["category"]),

  // Commission payouts
  commissionPayouts: defineTable({
    affiliateId: v.string(),
    amount: v.number(),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("paid"), v.literal("failed")),
    paymentMethod: v.optional(v.string()),
    paidAt: v.optional(v.number()),
    referenceNumber: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_affiliate", ["affiliateId"])
    .index("by_status", ["status"]),

  // Activity log
  activityLogs: defineTable({
    affiliateId: v.string(),
    action: v.string(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_affiliate", ["affiliateId"])
    .index("by_created", ["createdAt"]),
});
