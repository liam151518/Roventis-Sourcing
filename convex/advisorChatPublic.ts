// Public queries/mutations for advisor chats. No "use node" here.

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function resolveAffiliate(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const affiliate = await ctx.db
    .query("affiliates")
    .withIndex("by_clerk_id", (q: any) =>
      q.eq("clerkUserId", identity.subject)
    )
    .unique();
  if (!affiliate) throw new Error("Affiliate record not found");
  return affiliate;
}

export const listMyChats = query({
  args: {
    mode: v.optional(
      v.union(v.literal("chat"), v.literal("call"), v.literal("strategic"))
    ),
  },
  handler: async (ctx, args) => {
    const affiliate = await resolveAffiliate(ctx);
    const all = await ctx.db
      .query("advisorChats")
      .withIndex("by_affiliate", (q: any) =>
        q.eq("affiliateId", affiliate._id)
      )
      .take(200);
    const filtered = args.mode
      ? all.filter((c: any) => c.mode === args.mode)
      : all;
    return filtered.sort(
      (a: any, b: any) =>
        Number(b.lastMessageAt ?? 0) - Number(a.lastMessageAt ?? 0)
    );
  },
});

export const getChatMessages = query({
  args: { chatId: v.id("advisorChats") },
  handler: async (ctx, args) => {
    const affiliate = await resolveAffiliate(ctx);
    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");
    if (chat.affiliateId !== affiliate._id) throw new Error("Unauthorized");
    return await ctx.db
      .query("advisorChatMessages")
      .withIndex("by_chat_createdAt", (q: any) =>
        q.eq("chatId", args.chatId)
      )
      .order("asc")
      .take(500);
  },
});

export const createChat = mutation({
  args: {
    mode: v.union(v.literal("chat"), v.literal("call"), v.literal("strategic")),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const affiliate = await resolveAffiliate(ctx);
    const now = Date.now();
    const id = await ctx.db.insert("advisorChats", {
      affiliateId: affiliate._id,
      mode: args.mode,
      title: args.title?.trim() || "New chat",
      pinned: false,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
    });
    return { id };
  },
});

export const deleteChat = mutation({
  args: { id: v.id("advisorChats") },
  handler: async (ctx, args) => {
    const affiliate = await resolveAffiliate(ctx);
    const chat = await ctx.db.get(args.id);
    if (!chat) return { ok: true };
    if (chat.affiliateId !== affiliate._id) throw new Error("Unauthorized");
    const messages = await ctx.db
      .query("advisorChatMessages")
      .withIndex("by_chat", (q: any) => q.eq("chatId", args.id))
      .collect();
    for (const m of messages) await ctx.db.delete(m._id);
    await ctx.db.delete(args.id);
    return { ok: true };
  },
});

export const pinChat = mutation({
  args: { id: v.id("advisorChats"), pinned: v.boolean() },
  handler: async (ctx, args) => {
    const affiliate = await resolveAffiliate(ctx);
    const chat = await ctx.db.get(args.id);
    if (!chat) throw new Error("Not found");
    if (chat.affiliateId !== affiliate._id) throw new Error("Unauthorized");
    await ctx.db.patch(args.id, { pinned: args.pinned, updatedAt: Date.now() });
    return { ok: true };
  },
});

export const renameChat = mutation({
  args: { id: v.id("advisorChats"), title: v.string() },
  handler: async (ctx, args) => {
    const affiliate = await resolveAffiliate(ctx);
    const chat = await ctx.db.get(args.id);
    if (!chat) throw new Error("Not found");
    if (chat.affiliateId !== affiliate._id) throw new Error("Unauthorized");
    await ctx.db.patch(args.id, {
      title: args.title.trim() || chat.title,
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});