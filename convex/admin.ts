import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Admin emails
const ADMIN_EMAILS = [
  "luanras@icloud.com",
  "dino.fernandes@icloud.com",
  "marcusdeaguiar17@gmail.com",
  "echarddeklerk@icloud.com",
  "liamxandersantos@gmail.com",
];

function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// Check if user is admin
export const checkIsAdmin = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return isAdminEmail(args.email);
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
    const affiliateMap = new Map(affiliates.map((a) => [a._id, a]));
    
    return deals.map((deal) => ({
      ...deal,
      affiliate: affiliateMap.get(deal.affiliateId),
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
    const affiliateMap = new Map(affiliates.map((a) => [a._id, a]));
    
    return tickets.map((ticket) => ({
      ...ticket,
      affiliate: affiliateMap.get(ticket.affiliateId),
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
    const affiliateMap = new Map(affiliates.map((a) => [a._id, a]));
    
    return orders.map((order) => ({
      ...order,
      affiliate: affiliateMap.get(order.affiliateId),
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
    const affiliateMap = new Map(affiliates.map((a) => [a._id, a]));
    
    return requests.map((req) => ({
      ...req,
      affiliate: affiliateMap.get(req.affiliateId),
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
    
    // Status breakdown
    const affiliateStatus = {
      pending: affiliates.filter((a) => a.status === "pending").length,
      approved: affiliates.filter((a) => a.status === "approved").length,
      rejected: affiliates.filter((a) => a.status === "rejected").length,
      suspended: affiliates.filter((a) => a.status === "suspended").length,
      inactive: affiliates.filter((a) => a.status === "inactive").length,
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
      affiliateStatus,
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
    const ticket = await ctx.db.get(args.ticketId);
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
    
    await ctx.db.patch(args.ticketId, {
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
    
    await ctx.db.patch(args.ticketId, updateData);
    return { success: true };
  },
});

// Resolve and close ticket (marks as resolved and schedules auto-delete)
export const resolveAndCloseTicket = mutation({
  args: {
    ticketId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ticketId, {
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
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    
    // Only allow deletion of closed tickets
    if (ticket.status !== "closed") {
      throw new Error("Can only delete closed tickets");
    }
    
    await ctx.db.delete(args.ticketId);
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
    await ctx.db.patch(orderId, updates);
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
    await ctx.db.patch(args.orderId, {
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
    await ctx.db.patch(requestId, {
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
    await ctx.db.patch(id, {
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
    await ctx.db.patch(args.id, {
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
    await ctx.db.patch(args.id, {
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
    await ctx.db.delete(args.id);
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
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("suspended"), v.literal("inactive"))),
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
    await ctx.db.patch(id, updates);
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
      const deal = await ctx.db.get(id);
      if (deal) {
        const newCommissionAmount = Math.round(deal.dealValue * (deal.commissionRate / 100) * 100) / 100;
        updates.commissionAmount = newCommissionAmount as any;
      }
    }
    
    await ctx.db.patch(id, updates);
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
