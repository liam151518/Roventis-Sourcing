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
    // Access control. All new users created in Clerk (post-vetting) are
    // provisioned as "active". Use "paused" for soft holds during an
    // investigation, "suspended" for temporary disciplinary blocks, and
    // "deactivated" for permanent blocks (e.g. ToS violations, fraud).
    access: v.optional(v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("suspended"),
      v.literal("deactivated")
    )),
    tier: v.union(v.literal("bronze"), v.literal("silver"), v.literal("gold"), v.literal("platinum")),
    trainingCompleted: v.boolean(),
    trainingScore: v.optional(v.number()),
    isApprovedToSell: v.optional(v.boolean()), // Must complete training to sell
    totalSales: v.number(),
    totalCommissionEarned: v.number(),
    totalCommissionPaid: v.number(),
    pendingCommission: v.optional(v.number()), // Commission awaiting payout
    // Lead management fields
    weeklyClaimsUsed: v.optional(v.number()), // default 0
    weeklyClaimsResetAt: v.optional(v.number()), // timestamp of next Monday 00:00 SAST
    totalLeadsClaimed: v.optional(v.number()), // lifetime
    totalLeadsConverted: v.optional(v.number()), // lifetime
    bankName: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    accountType: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"])
    .index("by_clerk_id", ["clerkUserId"])
    .index("by_access", ["access"])
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
    // Track if deal came from a lead
    fromLeadId: v.optional(v.id("leads")),
    leadClaimExpiresAt: v.optional(v.number()), // For countdown urgency
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
    isDraft: v.boolean(),
    downloadCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_category", ["category"])
    .index("by_is_draft", ["isDraft"]),

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

  // Leads - tiered lead management system
  leads: defineTable({
    companyName: v.string(),
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    city: v.optional(v.string()),
    province: v.optional(v.string()),
    industry: v.optional(v.string()), // e.g. "Lodge", "Mine", "Construction", "Corporate"
    productInterest: v.optional(v.array(v.string())), // ["workwear","merchandise","solar","sourcing"]
    estimatedBudget: v.optional(v.number()), // ZAR
    notes: v.optional(v.string()),
    source: v.optional(v.string()), // "google_maps", "directory", "referral", "manual"
    dedupeKey: v.optional(v.string()), // lowercased email OR phone OR slugified companyName+city
    poolTier: v.optional(v.union(v.literal("standard"), v.literal("priority"), v.literal("premium"))),
    status: v.optional(v.union(
      v.literal("available"),
      v.literal("claimed"),
      v.literal("converted"),
      v.literal("expired"),
      v.literal("retired")
    )),
    claimedBy: v.optional(v.id("affiliates")),
    claimedAt: v.optional(v.number()),
    claimExpiresAt: v.optional(v.number()), // claimedAt + 72h
    timesReleased: v.optional(v.number()), // increments each time it expires back to pool
    maxReleases: v.optional(v.number()), // default 2; after this it goes "retired"
    uploadedBy: v.optional(v.string()), // admin clerkUserId
    uploadBatchId: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  }).index("by_status_pool", ["status", "poolTier"])
    .index("by_dedupeKey", ["dedupeKey"])
    .index("by_claimedBy", ["claimedBy"])
    .index("by_claimExpiresAt", ["claimExpiresAt"]),

  // Lead Activity - audit trail
  leadActivity: defineTable({
    leadId: v.id("leads"),
    affiliateId: v.optional(v.id("affiliates")),
    action: v.union(
      v.literal("uploaded"),
      v.literal("claimed"),
      v.literal("released"),
      v.literal("expired"),
      v.literal("converted"),
      v.literal("retired"),
      v.literal("admin_reassigned")
    ),
    meta: v.optional(v.string()), // JSON string for extra context
    createdAt: v.number(),
  }).index("by_leadId", ["leadId"])
    .index("by_affiliateId", ["affiliateId"]),

  // Orders
  orders: defineTable({
    affiliateId: v.string(),
    dealId: v.optional(v.string()),
    
    // Client Information
    clientName: v.string(),
    clientCompany: v.optional(v.string()),
    clientEmail: v.string(),
    clientPhone: v.optional(v.string()),
    deliveryAddress: v.optional(v.string()),
    
    // Company Details (for manufacturing)
    companyName: v.optional(v.string()),
    companyRegistrationNumber: v.optional(v.string()),
    companyVATNumber: v.optional(v.string()),
    companyWebsite: v.optional(v.string()),
    companyAddress: v.optional(v.string()),
    contactPersonName: v.optional(v.string()),
    contactPersonEmail: v.optional(v.string()),
    contactPersonPhone: v.optional(v.string()),
    
    // Order Items
    items: v.array(v.object({
      productName: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      total: v.number(),
    })),
    totalAmount: v.number(),
    
    // Order Status
    status: v.union(v.literal("draft"), v.literal("submitted"), v.literal("supplier_confirmed"), v.literal("in_transit"), v.literal("delivered"), v.literal("installed"), v.literal("cancelled")),
    trackingNumber: v.optional(v.string()),
    deliveryDate: v.optional(v.number()),
    installationDate: v.optional(v.number()),
    
    // Commission
    commissionStatus: v.union(v.literal("pending"), v.literal("approved"), v.literal("paid")),
    commissionAmount: v.number(),
    
    // Documents & Files
    invoiceDocument: v.optional(v.string()), // URL to invoice PDF
    legalDocument: v.optional(v.string()), // URL to signed legal document
    paymentProof: v.optional(v.string()), // URL to payment proof image
    productImages: v.optional(v.array(v.string())), // URLs to product images
    mockupPhotos: v.optional(v.array(v.string())), // URLs to mockup photos
    customLogo: v.optional(v.string()), // URL to custom logo
    
    // Additional Notes
    notes: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
    
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
    resolvedAt: v.optional(v.number()),
    closedAt: v.optional(v.number()),
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

  // Invoices
  invoices: defineTable({
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
    status: v.union(v.literal("draft"), v.literal("sent"), v.literal("paid"), v.literal("retired")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_affiliate", ["affiliateId"])
    .index("by_deal", ["dealId"]),

  // Invoice Settings (global template - single row)
  invoiceSettings: defineTable({
    // Company Info
    companyName: v.string(),
    companyEmail: v.string(),
    companyPhone: v.string(),
    companyWebsite: v.string(),
    companySocial: v.string(),
    // Bank Details
    bankName: v.string(),
    accountType: v.string(),
    accountNumber: v.string(),
    branchCode: v.string(),
    accountHolder: v.string(),
    // Customization
    tagline: v.string(),
    defaultNotes: v.array(v.string()),
    // Colors
    primaryColor: v.string(),
    secondaryColor: v.string(),
    accentColor: v.string(),
    dividerColor: v.string(),
    // Layout
    headerStyle: v.optional(v.string()), // "centered" | "left"
    showLogo: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Products - for product library
  products: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    colors: v.array(v.object({
      name: v.string(),
      imageUrl: v.string(),
    })),
    pricing: v.optional(v.object({
      price50: v.number(),
      price100: v.number(),
      price500: v.number(),
      confirmed: v.boolean(),
    })),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_category", ["category"])
    .index("by_isActive", ["isActive"]),
});
