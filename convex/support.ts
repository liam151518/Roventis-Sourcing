import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

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
    return await ctx.db.get(args.ticketId as Id<"supportTickets">);
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
    const ticket = await ctx.db.get(args.ticketId as Id<"supportTickets">);
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const newMessage = {
      sender: args.sender,
      content: args.content,
      createdAt: Date.now(),
    };

    await ctx.db.patch(args.ticketId as Id<"supportTickets">, {
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
    await ctx.db.patch(args.ticketId as Id<"supportTickets">, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// Demo seed mutations are intentionally absent in production. The build is
// production-only; all tickets are created by real affiliates via the
// support flow. To generate test fixtures for local development, add them
// via the dashboard's Support page or write a one-off `internalMutation`.
