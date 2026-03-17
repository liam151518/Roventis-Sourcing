import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get support tickets for current affiliate
export const getMyTickets = query({
  args: { affiliateId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("supportTickets")
      .withIndex("by_affiliate")
      .filter((q) => q.eq(q.field("affiliateId"), args.affiliateId))
      .collect();
  },
});

// Get all support tickets (admin)
export const getAllTickets = query({
  handler: async (ctx) => {
    return await ctx.db.query("supportTickets").collect();
  },
});

// Get ticket by ID
export const getTicketById = query({
  args: { ticketId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.ticketId);
  },
});

// Create support ticket
export const createTicket = mutation({
  args: {
    affiliateId: v.string(),
    subject: v.string(),
    description: v.string(),
    category: v.union(v.literal("deal"), v.literal("product"), v.literal("commission"), v.literal("technical"), v.literal("other")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
  },
  handler: async (ctx, args) => {
    const ticketId = await ctx.db.insert("supportTickets", {
      ...args,
      status: "open",
      messages: [{
        sender: "affiliate",
        content: args.description,
        createdAt: Date.now(),
      }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return ticketId;
  },
});

// Add message to ticket
export const addTicketMessage = mutation({
  args: {
    ticketId: v.string(),
    sender: v.union(v.literal("affiliate"), v.literal("admin")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const newMessage = {
      sender: args.sender,
      content: args.content,
      createdAt: Date.now(),
    };

    await ctx.db.patch(args.ticketId, {
      messages: [...ticket.messages, newMessage],
      status: args.sender === "affiliate" ? "in_progress" : ticket.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update ticket status
export const updateTicketStatus = mutation({
  args: {
    ticketId: v.string(),
    status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("resolved"), v.literal("closed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ticketId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// Seed demo tickets
export const seedDemoTickets = mutation({
  args: { affiliateId: v.string() },
  handler: async (ctx, args) => {
    const existingTickets = await ctx.db.query("supportTickets").take(1);
    if (existingTickets.length > 0) {
      return { success: true, message: "Tickets already exist" };
    }

    await ctx.db.insert("supportTickets", {
      affiliateId: args.affiliateId,
      subject: "Question about commission calculation",
      description: "Hi, I'd like to understand how my commission is calculated for solar products.",
      category: "commission",
      priority: "medium",
      status: "resolved",
      messages: [
        { sender: "affiliate", content: "Hi, I'd like to understand how my commission is calculated for solar products.", createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000 },
        { sender: "admin", content: "Great question! Platinum affiliates get 12-15% commission on products, with higher rates on select categories.", createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000 },
      ],
      createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    });

    await ctx.db.insert("supportTickets", {
      affiliateId: args.affiliateId,
      subject: "Need help with a client proposal",
      description: "I'm preparing a proposal for a new client and need some technical specifications.",
      category: "deal",
      priority: "high",
      status: "open",
      messages: [
        { sender: "affiliate", content: "I'm preparing a proposal for a new client and need some technical specifications.", createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000 },
      ],
      createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    });

    return { success: true, message: "Demo tickets created" };
  },
});
