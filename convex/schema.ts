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
    isApprovedToSell: v.optional(v.boolean()), // Must complete training to sell
    totalSales: v.number(),
    totalCommissionEarned: v.number(),
    totalCommissionPaid: v.number(),
    pendingCommission: v.optional(v.number()), // Commission awaiting payout
    bankName: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    accountType: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"])
    .index("by_clerk_id", ["clerkUserId"])
    .index("by_status", ["status"])
    .index("by_tier", ["tier"]),

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
    // Order submission fields
    orderSubmitted: v.optional(v.boolean()),
    orderReference: v.optional(v.string()),
    paymentProof: v.optional(v.string()),
    deliveryAddress: v.optional(v.string()),
    orderNotes: v.optional(v.string()),
    orderSubmittedAt: v.optional(v.number()),
    orderStatus: v.optional(v.union(v.literal("not_submitted"), v.literal("submitted"), v.literal("approved"), v.literal("rejected"))),
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

  // Leads (Platinum-only)
  leads: defineTable({
    companyName: v.string(),
    contactName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    companySize: v.optional(v.string()),
    productInterest: v.optional(v.string()),
    budgetRange: v.optional(v.string()),
    source: v.optional(v.string()),
    status: v.union(v.literal("available"), v.literal("claimed"), v.literal("converted"), v.literal("expired")),
    claimedBy: v.optional(v.string()), // affiliateId
    claimedAt: v.optional(v.number()),
    convertedToDeal: v.optional(v.string()), // dealId
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_status", ["status"])
    .index("by_claimed_by", ["claimedBy"])
    .index("by_created", ["createdAt"]),

  // Orders
  orders: defineTable({
    affiliateId: v.string(),
    dealId: v.optional(v.string()),
    clientName: v.string(),
    clientCompany: v.optional(v.string()),
    clientEmail: v.string(),
    clientPhone: v.optional(v.string()),
    deliveryAddress: v.optional(v.string()),
    items: v.array(v.object({
      productName: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      total: v.number(),
    })),
    totalAmount: v.number(),
    status: v.union(v.literal("draft"), v.literal("submitted"), v.literal("supplier_confirmed"), v.literal("in_transit"), v.literal("delivered"), v.literal("installed"), v.literal("cancelled")),
    trackingNumber: v.optional(v.string()),
    deliveryDate: v.optional(v.number()),
    installationDate: v.optional(v.number()),
    commissionStatus: v.union(v.literal("pending"), v.literal("approved"), v.literal("paid")),
    commissionAmount: v.number(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_affiliate", ["affiliateId"])
    .index("by_status", ["status"])
    .index("by_deal", ["dealId"]),

  // Marketing links
  marketingLinks: defineTable({
    affiliateId: v.string(),
    name: v.string(),
    productId: v.optional(v.string()),
    category: v.optional(v.string()),
    url: v.string(),
    shortCode: v.optional(v.string()),
    clicks: v.number(),
    conversions: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_affiliate", ["affiliateId"])
    .index("by_short_code", ["shortCode"]),

  // Support tickets
  supportTickets: defineTable({
    affiliateId: v.string(),
    subject: v.string(),
    description: v.string(),
    category: v.union(v.literal("deal"), v.literal("product"), v.literal("commission"), v.literal("technical"), v.literal("other")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("resolved"), v.literal("closed")),
    messages: v.array(v.object({
      sender: v.string(), // "affiliate" or "admin"
      content: v.string(),
      createdAt: v.number(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_affiliate", ["affiliateId"])
    .index("by_status", ["status"]),

  // Payout requests
  payoutRequests: defineTable({
    affiliateId: v.string(),
    amount: v.number(),
    status: v.union(v.literal("requested"), v.literal("processing"), v.literal("paid"), v.literal("rejected")),
    paymentMethod: v.optional(v.string()),
    bankName: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    accountType: v.optional(v.string()),
    referenceNumber: v.string(),
    requestedAt: v.number(),
    processedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  }).index("by_affiliate", ["affiliateId"])
    .index("by_status", ["status"]),
});
