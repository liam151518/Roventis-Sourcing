import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { isAdminCtx, requireAdmin } from "./lib/auth";

// Check if the current caller is an admin (reads Clerk publicMetadata.role)
export const checkIsAdmin = query({
  args: {},
  handler: async (ctx) => {
    return await isAdminCtx(ctx);
  },
});

// Get all affiliates (admin view)
export const getAllAffiliatesAdmin = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("affiliates").collect();
  },
});

// Get all deals (admin view)
export const getAllDealsAdmin = query({
  args: {},
  handler: async (ctx) => {
    const deals = await ctx.db.query("deals").collect();
    // Enrich with affiliate info
    const affiliates = await ctx.db.query("affiliates").collect();
    const affiliateMap = new Map(affiliates.map((a) => [String(a._id), a]));
    
    return deals.map((deal) => ({
      ...deal,
      affiliate: affiliateMap.get(String(deal.affiliateId)),
    }));
  },
});

// Get all support tickets (admin view)
export const getAllSupportTicketsAdmin = query({
  args: {},
  handler: async (ctx) => {
    const tickets = await ctx.db.query("supportTickets").collect();
    // Enrich with affiliate info
    const affiliates = await ctx.db.query("affiliates").collect();
    const affiliateMap = new Map(affiliates.map((a) => [String(a._id), a]));
    
    return tickets.map((ticket) => ({
      ...ticket,
      affiliate: affiliateMap.get(String(ticket.affiliateId)),
    }));
  },
});

// Get all orders (admin view)
export const getAllOrdersAdmin = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    // Enrich with affiliate info
    const affiliates = await ctx.db.query("affiliates").collect();
    const affiliateMap = new Map(affiliates.map((a) => [String(a._id), a]));
    
    return orders.map((order) => ({
      ...order,
      affiliate: affiliateMap.get(String(order.affiliateId)),
    }));
  },
});

// Get all payout requests (admin view)
export const getAllPayoutRequestsAdmin = query({
  args: {},
  handler: async (ctx) => {
    const requests = await ctx.db.query("payoutRequests").collect();
    // Enrich with affiliate info
    const affiliates = await ctx.db.query("affiliates").collect();
    const affiliateMap = new Map(affiliates.map((a) => [String(a._id), a]));
    
    return requests.map((req) => ({
      ...req,
      affiliate: affiliateMap.get(String(req.affiliateId)),
    }));
  },
});

// Get all resources (admin view)
export const getAllResourcesAdmin = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("resources").collect();
  },
});

// Get dashboard stats (admin view)
export const getAdminDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const affiliates = await ctx.db.query("affiliates").collect();
    const deals = await ctx.db.query("deals").collect();
    const orders = await ctx.db.query("orders").collect();
    const tickets = await ctx.db.query("supportTickets").collect();
    const payoutRequests = await ctx.db.query("payoutRequests").collect();
    const resources = await ctx.db.query("resources").collect();
    
    // Calculate totals
    const totalSales = deals
      .filter((d) => d.status === "closed_won")
      .reduce((sum, d) => sum + d.dealValue, 0);
    
    const totalCommission = deals
      .filter((d) => d.status === "closed_won")
      .reduce((sum, d) => sum + d.commissionAmount, 0);
    
    const pendingCommission = deals
      .filter((d) => d.commissionStatus === "pending")
      .reduce((sum, d) => sum + d.commissionAmount, 0);
    
    const pendingPayouts = payoutRequests
      .filter((p) => p.status === "requested" || p.status === "processing")
      .reduce((sum, p) => sum + p.amount, 0);
    
    const openTickets = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;
    
    const activeOrders = orders.filter((o) => 
      o.status !== "delivered" && o.status !== "installed" && o.status !== "cancelled"
    ).length;
    
    // Tier breakdown
    const tierBreakdown = {
      bronze: affiliates.filter((a) => a.tier === "bronze").length,
      silver: affiliates.filter((a) => a.tier === "silver").length,
      gold: affiliates.filter((a) => a.tier === "gold").length,
      platinum: affiliates.filter((a) => a.tier === "platinum").length,
    };
    
    // Access breakdown
    const affiliateAccess = {
      active: affiliates.filter((a) => a.access === "active").length,
      paused: affiliates.filter((a) => a.access === "paused").length,
      suspended: affiliates.filter((a) => a.access === "suspended").length,
      deactivated: affiliates.filter((a) => a.access === "deactivated").length,
    };
    
    return {
      totalAffiliates: affiliates.length,
      totalDeals: deals.length,
      totalOrders: orders.length,
      totalTickets: tickets.length,
      totalResources: resources.length,
      totalSales,
      totalCommission,
      pendingCommission,
      pendingPayouts,
      openTickets,
      activeOrders,
      tierBreakdown,
      affiliateAccess,
    };
  },
});

// Reply to support ticket
export const replyToSupportTicket = mutation({
  args: {
    ticketId: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId as any) as any;
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    
    const messages = ticket.messages || [];
    messages.push({
      sender: "admin",
      content: args.message,
      createdAt: Date.now(),
    });
    
    // If ticket was closed, reopen it
    let newStatus = ticket.status;
    if (ticket.status === "closed" || ticket.status === "resolved") {
      newStatus = "in_progress";
    }
    
    await ctx.db.patch(args.ticketId as any, {
      messages,
      updatedAt: Date.now(),
      status: newStatus,
      closedAt: undefined,
    });
    
    return { success: true };
  },
});

// Update support ticket status
export const updateSupportTicketStatus = mutation({
  args: {
    ticketId: v.string(),
    status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("resolved"), v.literal("closed")),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      status: args.status,
      updatedAt: Date.now(),
    };
    
    // Set resolvedAt when marking as resolved
    if (args.status === "resolved") {
      updateData.resolvedAt = Date.now();
    }
    
    // Set closedAt when marking as closed
    if (args.status === "closed") {
      updateData.closedAt = Date.now();
    }
    
    await ctx.db.patch(args.ticketId as any, updateData);
    return { success: true };
  },
});

// Resolve and close ticket (marks as resolved and schedules auto-delete)
export const resolveAndCloseTicket = mutation({
  args: {
    ticketId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ticketId as any, {
      status: "closed",
      resolvedAt: Date.now(),
      closedAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// Permanently delete a closed ticket
export const deleteClosedTicket = mutation({
  args: {
    ticketId: v.string(),
  },
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId as any) as any;
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    
    // Only allow deletion of closed tickets
    if (ticket.status !== "closed") {
      throw new Error("Can only delete closed tickets");
    }
    
    await ctx.db.delete(args.ticketId as any);
    return { success: true };
  },
});

// Update order status
export const updateOrderStatus = mutation({
  args: {
    orderId: v.string(),
    status: v.union(v.literal("draft"), v.literal("submitted"), v.literal("supplier_confirmed"), v.literal("in_transit"), v.literal("delivered"), v.literal("installed"), v.literal("cancelled")),
    trackingNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { orderId, ...updates } = args;
    await ctx.db.patch(orderId as any, updates);
    return { success: true };
  },
});

// Update order commission status
export const updateOrderCommission = mutation({
  args: {
    orderId: v.string(),
    commissionStatus: v.union(v.literal("pending"), v.literal("approved"), v.literal("paid")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId as any, {
      commissionStatus: args.commissionStatus,
    });
    return { success: true };
  },
});

// Update payout request status
export const updatePayoutRequestStatus = mutation({
  args: {
    requestId: v.string(),
    status: v.union(v.literal("requested"), v.literal("processing"), v.literal("paid"), v.literal("rejected")),
    referenceNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { requestId, ...updates } = args;
    await ctx.db.patch(requestId as any, {
      ...updates,
      processedAt: updates.status === "paid" ? Date.now() : undefined,
    });
    return { success: true };
  },
});

// Create resource
export const createResource = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    fileUrl: v.optional(v.string()),
    fileType: v.union(v.literal("pdf"), v.literal("video"), v.literal("image"), v.literal("link")),
    category: v.union(v.literal("coaching_sheet"), v.literal("catalog"), v.literal("price_list"), v.literal("script"), v.literal("creative"), v.literal("legal")),
    isPublic: v.boolean(),
    isDraft: v.boolean(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("resources", {
      ...args,
      downloadCount: 0,
      createdAt: Date.now(),
    });
    return { success: true, id };
  },
});

// Update resource
export const updateResource = mutation({
  args: {
    id: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    fileType: v.optional(v.union(v.literal("pdf"), v.literal("video"), v.literal("image"), v.literal("link"))),
    category: v.optional(v.union(v.literal("coaching_sheet"), v.literal("catalog"), v.literal("price_list"), v.literal("script"), v.literal("creative"), v.literal("legal"))),
    isPublic: v.optional(v.boolean()),
    isDraft: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id as any, {
      ...updates,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// Publish resource (make it live)
export const publishResource = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id as any, {
      isDraft: false,
      isPublic: true,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// Unpublish resource (revert to draft)
export const unpublishResource = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id as any, {
      isDraft: true,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// Delete resource
export const deleteResource = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id as any);
    return { success: true };
  },
});

// Update affiliate (admin)
export const updateAffiliateAdmin = mutation({
  args: {
    id: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    city: v.optional(v.string()),
    access: v.optional(v.union(v.literal("active"), v.literal("paused"), v.literal("suspended"), v.literal("deactivated"))),
    tier: v.optional(v.union(v.literal("bronze"), v.literal("silver"), v.literal("gold"), v.literal("platinum"))),
    trainingCompleted: v.optional(v.boolean()),
    isApprovedToSell: v.optional(v.boolean()),
    totalSales: v.optional(v.number()),
    totalCommissionEarned: v.optional(v.number()),
    totalCommissionPaid: v.optional(v.number()),
    pendingCommission: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id as any, updates);
    return { success: true };
  },
});

// Update deal (admin)
export const updateDealAdmin = mutation({
  args: {
    id: v.string(),
    status: v.optional(v.union(v.literal("prospect"), v.literal("qualified"), v.literal("proposal_sent"), v.literal("negotiation"), v.literal("closed_won"), v.literal("closed_lost"), v.literal("on_hold"))),
    commissionStatus: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("paid"), v.literal("disputed"))),
    orderStatus: v.optional(v.union(v.literal("not_submitted"), v.literal("submitted"), v.literal("approved"), v.literal("rejected"))),
    dealValue: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // If deal value changed, recalculate commission
    if (updates.dealValue) {
      const deal = await ctx.db.get(id as any) as any;
      if (deal) {
        const newCommissionAmount = Math.round(deal.dealValue * (deal.commissionRate / 100) * 100) / 100;
        (updates as any).commissionAmount = newCommissionAmount;
      }
    }
    
    await ctx.db.patch(id as any, updates);
    return { success: true };
  },
});

// Get leaderboard data
export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const affiliates = await ctx.db.query("affiliates").collect();
    const deals = await ctx.db.query("deals").collect();
    
    // Calculate leaderboard metrics
    const leaderboard = affiliates.map((affiliate) => {
      const affiliateDeals = deals.filter(
        (d) => d.affiliateId === affiliate._id && d.status === "closed_won"
      );
      
      const totalSales = affiliateDeals.reduce((sum, d) => sum + d.dealValue, 0);
      const totalCommission = affiliateDeals.reduce((sum, d) => sum + d.commissionAmount, 0);
      const dealCount = affiliateDeals.length;
      
      // Calculate conversion rate
      const allDeals = deals.filter((d) => d.affiliateId === affiliate._id);
      const wonDeals = allDeals.filter((d) => d.status === "closed_won").length;
      const conversionRate = allDeals.length > 0 ? (wonDeals / allDeals.length) * 100 : 0;
      
      return {
        affiliate,
        totalSales,
        totalCommission,
        dealCount,
        conversionRate,
      };
    });
    
    // Sort by total sales
    return leaderboard.sort((a, b) => b.totalSales - a.totalSales);
  },
});

// ============================================
// COMMISSION APPROVAL FLOW (NEW)
// ============================================

// Approve commission for an order - credits affiliate's pendingCommission
export const approveOrderCommission = mutation({
  args: {
    orderId: v.string(),
    adminClerkUserId: v.string(), // deprecated, kept for client compat
  },
  handler: async (ctx, args) => {
    // Server-side admin check from Clerk JWT (role-based)
    await requireAdmin(ctx);
    
    const order = await ctx.db.get(args.orderId as any) as any;
    if (!order) {
      throw new Error("Order not found");
    }
    
    if (order.commissionStatus === "approved" || order.commissionStatus === "paid") {
      throw new Error("Commission already processed");
    }
    
    if (order.commissionStatus !== "pending") {
      throw new Error(`Cannot approve commission with status: ${order.commissionStatus}`);
    }
    
    const commissionAmount = order.commissionAmount || 0;
    if (commissionAmount <= 0) {
      throw new Error("No commission amount to approve");
    }
    
    await ctx.db.patch(args.orderId as any, { commissionStatus: "approved" });
    
    const affiliate = await ctx.db.get(order.affiliateId as any) as any;
    if (affiliate) {
      await ctx.db.patch(affiliate._id, {
        pendingCommission: (affiliate.pendingCommission || 0) + commissionAmount,
        totalCommissionEarned: (affiliate.totalCommissionEarned || 0) + commissionAmount,
      });
    }
    
    if (order.dealId) {
      await ctx.db.patch(order.dealId as any, { commissionStatus: "approved" });
    }
    
    await ctx.db.insert("activityLogs", {
      affiliateId: order.affiliateId,
      action: "commission_approved",
      metadata: JSON.stringify({ orderId: args.orderId, amount: commissionAmount }),
      createdAt: Date.now(),
    });
    
    return { success: true, orderId: args.orderId, commissionAmount, affiliateId: order.affiliateId };
  },
});

export const markCommissionPaid = mutation({
  args: {
    orderId: v.string(),
    paymentReference: v.string(),
    adminClerkUserId: v.string(), // deprecated, kept for client compat
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const order = await ctx.db.get(args.orderId as any) as any;
    if (!order) {
      throw new Error("Order not found");
    }
    
    if (order.commissionStatus !== "approved") {
      throw new Error("Commission must be approved before marking as paid");
    }
    
    const commissionAmount = order.commissionAmount || 0;
    
    await ctx.db.patch(args.orderId as any, {
      commissionStatus: "paid",
      paymentReference: args.paymentReference,
      paidAt: Date.now(),
    } as any);
    
    const affiliate = await ctx.db.get(order.affiliateId as any) as any;
    if (affiliate) {
      const currentPending = affiliate.pendingCommission || 0;
      await ctx.db.patch(affiliate._id, {
        pendingCommission: Math.max(0, currentPending - commissionAmount),
        totalCommissionPaid: (affiliate.totalCommissionPaid || 0) + commissionAmount,
      });
    }
    
    if (order.dealId) {
      await ctx.db.patch(order.dealId as any, { commissionStatus: "paid" });
    }
    
    await ctx.db.insert("activityLogs", {
      affiliateId: order.affiliateId,
      action: "commission_paid",
      metadata: JSON.stringify({ orderId: args.orderId, amount: commissionAmount, reference: args.paymentReference }),
      createdAt: Date.now(),
    });
    
    return { success: true, orderId: args.orderId, paymentReference: args.paymentReference };
  },
});

export const getCommissionSummary = query({
  args: { affiliateId: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_affiliate")
      .filter((q) => q.eq(q.field("affiliateId"), args.affiliateId))
      .collect() as any;
    
    const affiliate = await ctx.db.get(args.affiliateId as any) as any;
    if (!affiliate) {
      return null;
    }
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startOfMonthMs = startOfMonth.getTime();
    
    const pendingApproval = orders.filter((o: any) => o.commissionStatus === "pending").reduce((sum: number, o: any) => sum + (o.commissionAmount || 0), 0);
    const approved = orders.filter((o: any) => o.commissionStatus === "approved").reduce((sum: number, o: any) => sum + (o.commissionAmount || 0), 0);
    const paidThisMonth = orders.filter((o: any) => o.commissionStatus === "paid" && (o.paidAt || 0) >= startOfMonthMs).reduce((sum: number, o: any) => sum + (o.commissionAmount || 0), 0);
    
    return {
      pendingApproval,
      approved,
      paidThisMonth,
      totalEarned: affiliate.totalCommissionEarned || 0,
      totalPaid: affiliate.totalCommissionPaid || 0,
      pendingBalance: affiliate.pendingCommission || 0,
    };
  },
});

export const recalculateAffiliateCommissions = mutation({
  args: { adminClerkUserId: v.string() }, // deprecated, kept for client compat
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const affiliates = await ctx.db.query("affiliates").collect();
    const orders = await ctx.db.query("orders").collect();
    
    let updated = 0;
    
    for (const affiliate of affiliates) {
      const affiliateOrders = orders.filter((o) => String(o.affiliateId) === String(affiliate._id));
      
      const totalEarned = affiliateOrders.filter((o) => o.commissionStatus === "approved" || o.commissionStatus === "paid").reduce((sum, o) => sum + (o.commissionAmount || 0), 0);
      const totalPaid = affiliateOrders.filter((o) => o.commissionStatus === "paid").reduce((sum, o) => sum + (o.commissionAmount || 0), 0);
      const pendingBalance = affiliateOrders.filter((o) => o.commissionStatus === "approved").reduce((sum, o) => sum + (o.commissionAmount || 0), 0);
      const totalSales = affiliateOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      await ctx.db.patch(affiliate._id, {
        totalCommissionEarned: totalEarned,
        totalCommissionPaid: totalPaid,
        pendingCommission: pendingBalance,
        totalSales,
      });

      updated++;
    }

    return { success: true, affiliatesUpdated: updated };
  },
});

// ============================================
// PRODUCTION RESET (admin only)
// ============================================
//
// Two surgical wipes for the cutover from dev/demo to real production.
// Both require admin auth (Clerk publicMetadata.role === "admin").
//
// - `wipeDemoData`: removes only demo-era rows (Demo User, Sarah Johnson
//   / TechCorp, sarah@techcorp.co.za, mike@buildright.co.za, fake
//   marketing short codes "MAIN-001", the canned leads uploaded with
//   `source: "seed"` or matching known demo company names).
//
// - `wipeAllAffiliateData`: full reset. Drops every affiliate and every
//   downstream record (deals, orders, payout requests, support tickets,
//   activity logs, marketing links, lead claims). Global reference tables
//   (invoiceSettings, products, resources, trainingModules) are kept.
//
// Run `wipeDemoData` once now to clean the demo-era residue from the live
// DB. Run `wipeAllAffiliateData` only if you also want to drop any real
// affiliates you created during testing — use with care.

const DEMO_EMAIL_PATTERNS = [
  "demo@roventis.co.za",
  "sarah@techcorp.co.za",
  "mike@buildright.co.za",
];

const DEMO_COMPANY_NAMES = [
  "TechCorp Solutions",
  "BuildRight Construction",
];

const DEMO_LEAD_SOURCES = ["seed"];

const DEMO_MARKETING_SHORT_CODES = ["MAIN-001"];

const DEMO_LEAD_COMPANY_NAMES = [
  "SolarTech SA",
  "EcoBuild Contractors",
  "TechStart Incubator",
  "Kruger Bush Lodge",
  "Highveld Mining Co",
  "Sandton Corporate Gifts",
  "Cape Town Construction",
  "Durban Logistics",
  "Johannesburg Office Solutions",
  "Pretoria Tech Hub",
  "Port Elizabeth Auto",
  "Bloemfontein Medical",
  "East London Retail",
  "Sun International Hotels",
  "Anglo American Mining",
  "Standard Bank Corporate",
  "Pick n Pay HQ",
  "Woolworths SA",
  "SABMiller",
  "Tiger Brands",
  "MTN South Africa",
  "Vodacom",
  "Discovery Health",
];

function isDemoAffiliate(a: any): boolean {
  if (a.firstName === "Demo" && a.lastName === "User") return true;
  if (a.email && DEMO_EMAIL_PATTERNS.includes(a.email.toLowerCase())) return true;
  if (a.affiliateCode === "ROV-DEMO-001") return true;
  return false;
}

function isDemoOrder(o: any): boolean {
  if (o.clientEmail && DEMO_EMAIL_PATTERNS.includes(o.clientEmail.toLowerCase())) return true;
  if (o.clientCompany && DEMO_COMPANY_NAMES.includes(o.clientCompany)) return true;
  if (o.trackingNumber && o.trackingNumber.startsWith("ROV-2024-")) return true;
  return false;
}

function isDemoDeal(d: any): boolean {
  if (d.clientEmail && DEMO_EMAIL_PATTERNS.includes(d.clientEmail.toLowerCase())) return true;
  if (d.clientCompany && DEMO_COMPANY_NAMES.includes(d.clientCompany)) return true;
  return false;
}

function isDemoLead(l: any): boolean {
  if (l.source && DEMO_LEAD_SOURCES.includes(l.source)) return true;
  if (l.companyName && DEMO_LEAD_COMPANY_NAMES.includes(l.companyName)) return true;
  return false;
}

function isDemoMarketingLink(m: any): boolean {
  if (m.shortCode && DEMO_MARKETING_SHORT_CODES.includes(m.shortCode)) return true;
  return false;
}

function isDemoTicket(t: any): boolean {
  if (
    t.subject &&
    (t.subject.includes("Question about commission calculation") ||
      t.subject.includes("Need help with a client proposal"))
  ) {
    return true;
  }
  return false;
}

export const wipeDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const counts = {
      affiliates: 0,
      deals: 0,
      orders: 0,
      payoutRequests: 0,
      marketingLinks: 0,
      supportTickets: 0,
      activityLogs: 0,
      leads: 0,
      leadActivity: 0,
    };

    // 1. Identify demo affiliate IDs first so we can cascade
    const allAffiliates = await ctx.db.query("affiliates").collect();
    const demoAffiliateIds = new Set<string>();
    const demoAffiliatesToDelete: any[] = [];
    for (const a of allAffiliates) {
      if (isDemoAffiliate(a)) {
        demoAffiliateIds.add(String(a._id));
        demoAffiliatesToDelete.push(a);
      }
    }

    // 2. Delete downstream per-affiliate records where they match demo signatures
    const allDeals = await ctx.db.query("deals").collect();
    for (const d of allDeals) {
      if (demoAffiliateIds.has(String(d.affiliateId)) || isDemoDeal(d)) {
        await ctx.db.delete(d._id);
        counts.deals++;
      }
    }

    const allOrders = await ctx.db.query("orders").collect();
    for (const o of allOrders) {
      if (demoAffiliateIds.has(String(o.affiliateId)) || isDemoOrder(o)) {
        await ctx.db.delete(o._id);
        counts.orders++;
      }
    }

    const allPayouts = await ctx.db.query("payoutRequests").collect();
    for (const p of allPayouts) {
      if (demoAffiliateIds.has(String(p.affiliateId))) {
        await ctx.db.delete(p._id);
        counts.payoutRequests++;
      }
    }

    const allMarketing = await ctx.db.query("marketingLinks").collect();
    for (const m of allMarketing) {
      if (demoAffiliateIds.has(String(m.affiliateId)) || isDemoMarketingLink(m)) {
        await ctx.db.delete(m._id);
        counts.marketingLinks++;
      }
    }

    const allTickets = await ctx.db.query("supportTickets").collect();
    for (const t of allTickets) {
      if (demoAffiliateIds.has(String(t.affiliateId)) || isDemoTicket(t)) {
        await ctx.db.delete(t._id);
        counts.supportTickets++;
      }
    }

    const allActivity = await ctx.db.query("activityLogs").collect();
    for (const log of allActivity) {
      if (demoAffiliateIds.has(String(log.affiliateId))) {
        await ctx.db.delete(log._id);
        counts.activityLogs++;
      }
    }

    // 3. Delete demo leads + their leadActivity audit trail
    const allLeads = await ctx.db.query("leads").collect();
    const demoLeadIds: string[] = [];
    for (const l of allLeads) {
      if (isDemoLead(l)) {
        demoLeadIds.push(String(l._id));
        await ctx.db.delete(l._id);
        counts.leads++;
      }
    }
    if (demoLeadIds.length > 0) {
      const allLeadActivity = await ctx.db.query("leadActivity").collect();
      for (const la of allLeadActivity) {
        if (demoLeadIds.includes(String(la.leadId))) {
          await ctx.db.delete(la._id);
          counts.leadActivity++;
        }
      }
    }

    // 4. Finally, delete the demo affiliate rows themselves
    for (const a of demoAffiliatesToDelete) {
      await ctx.db.delete(a._id);
      counts.affiliates++;
    }

    console.log("[wipeDemoData] admin wipe complete:", counts);
    return { success: true, counts };
  },
});

export const wipeAllAffiliateData = mutation({
  args: {
    confirm: v.literal("WIPE_ALL"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (args.confirm !== "WIPE_ALL") {
      throw new Error("Refusing to wipe without confirmation token");
    }

    const counts = {
      affiliates: 0,
      deals: 0,
      orders: 0,
      payoutRequests: 0,
      marketingLinks: 0,
      supportTickets: 0,
      activityLogs: 0,
      commissionPayouts: 0,
      leads: 0,
      leadActivity: 0,
    };

    // Collect all affiliate IDs to cascade properly
    const allAffiliates = await ctx.db.query("affiliates").collect();
    const affiliateIds = new Set<string>(allAffiliates.map((a) => String(a._id)));

    // Downstream tables (filter by affiliate)
    const cascadeByAffiliate = async (
      table: "deals" | "orders" | "payoutRequests" | "marketingLinks" | "supportTickets" | "activityLogs" | "commissionPayouts",
      counterKey: keyof typeof counts,
    ) => {
      const rows = await ctx.db.query(table).collect();
      for (const row of rows) {
        if (row.affiliateId && affiliateIds.has(String(row.affiliateId))) {
          await ctx.db.delete(row._id);
          (counts as any)[counterKey]++;
        }
      }
    };

    await cascadeByAffiliate("deals", "deals");
    await cascadeByAffiliate("orders", "orders");
    await cascadeByAffiliate("payoutRequests", "payoutRequests");
    await cascadeByAffiliate("marketingLinks", "marketingLinks");
    await cascadeByAffiliate("supportTickets", "supportTickets");
    await cascadeByAffiliate("activityLogs", "activityLogs");
    await cascadeByAffiliate("commissionPayouts", "commissionPayouts");

    // Delete all leads + their activity trail (entire lead pool wiped)
    const allLeads = await ctx.db.query("leads").collect();
    for (const l of allLeads) {
      await ctx.db.delete(l._id);
      counts.leads++;
    }
    const allLeadActivity = await ctx.db.query("leadActivity").collect();
    for (const la of allLeadActivity) {
      await ctx.db.delete(la._id);
      counts.leadActivity++;
    }

    // Delete all affiliate rows last
    for (const a of allAffiliates) {
      await ctx.db.delete(a._id);
      counts.affiliates++;
    }

    console.log("[wipeAllAffiliateData] admin full reset complete:", counts);
    return { success: true, counts };
  },
});
