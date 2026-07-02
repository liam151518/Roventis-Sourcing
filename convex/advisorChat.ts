// Advisor chat action - sends a user message and gets a model reply.
//
// "use node" so we can call OpenAI / Anthropic / Gemini / MiniMax with
// the user's encrypted key. Per-call locks:
//   - Decrypts key, uses it, drops reference immediately after.
//   - Scrubs PII before any prompt goes out (same as digests).
//   - 60s timeout for multi-message chats (vs 45s for digests).
//   - Increments per-day SAST usage counter (same cap as digests).
//   - Saves both user + assistant messages before returning.
//   - Auto-titles the chat from the first user message.

"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { decryptApiKey } from "./lib/advisorCrypto";
import { buildScrubbedContext, sastDayKey } from "./lib/advisorPii";
import { CHAT_SYSTEM_PROMPTS, ChatMode } from "./lib/callMethodology";
import {
  ProviderId,
  sendRequest,
} from "./lib/advisorProviders";

const MAX_RECENT_MESSAGES = 30; // most recent N to feed back to model
const DEFAULT_TIMEOUT_MS = 60000;

export const sendMessage = action({
  args: {
    chatId: v.id("advisorChats"),
    content: v.string(),
  },
  handler: async (ctx, args): Promise<{ id: string; content: string; tokensUsed: number; model: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const trimmed = args.content.trim();
    if (!trimmed) throw new Error("Empty message");
    if (trimmed.length > 8000) {
      throw new Error("That message is too long. Try splitting it up.");
    }

    const affiliate = await ctx.runQuery(
      internal.advisorChatInternal.getAffiliateByClerkId,
      { clerkUserId: identity.subject }
    );
    if (!affiliate) throw new Error("Affiliate record not found");

    const chat = await ctx.runQuery(
      internal.advisorChatInternal.getChatForUser,
      { chatId: args.chatId }
    );
    if (!chat) throw new Error("Chat not found");
    if (chat.affiliateId !== affiliate._id) throw new Error("Unauthorized");

    const settings = await ctx.runQuery(
      internal.advisorChatInternal.getSettingsForAffiliate,
      { affiliateId: affiliate._id }
    );
    if (!settings || !settings.isActive) {
      throw new Error("Set up your AI provider key first.");
    }

    // Rate-limit + usage counter (same cap as digests)
    const today = sastDayKey(Date.now());
    const usage = await ctx.runQuery(internal.advisorChatInternal.getUsage, {
      affiliateId: affiliate._id,
      dayKey: today,
    });
    const cap = Number(process.env.ADVISOR_DAILY_CAP ?? "10");
    if (usage.count >= cap) {
      throw new Error(
        `You've hit today's advisor limit (${cap} operations). It resets at midnight SAST.`
      );
    }

    // Soft cap messages-per-chat to prevent runaway context / cost
    const recent = await ctx.runQuery(
      internal.advisorChatInternal.listRecentMessages,
      { chatId: args.chatId, limit: MAX_RECENT_MESSAGES }
    );
    const messageCount = recent.length;
    if (messageCount >= 50) {
      throw new Error(
        "This chat is getting long. Start a new one to keep responses sharp (and your bill lower)."
      );
    }

    // Increment usage BEFORE the call so failed attempts still count.
    await ctx.runMutation(internal.advisorChatInternal.incrementUsage, {
      affiliateId: affiliate._id,
      dayKey: today,
    });

    // Persist the user message
    await ctx.runMutation(internal.advisorChatInternal.appendMessage, {
      chatId: args.chatId,
      role: "user",
      content: trimmed,
    });

    // Auto-title from first message
    if (messageCount === 0 && chat.title === "New chat") {
      const title = trimmed.slice(0, 50) + (trimmed.length > 50 ? "..." : "");
      await ctx.runMutation(internal.advisorChatInternal.setChatTitle, {
        chatId: args.chatId,
        title,
      });
    }

    // Decrypt provider key
    const apiKey = decryptApiKey({
      ciphertext: settings.encryptedKey,
      iv: settings.iv,
      authTag: settings.authTag,
    });
    const provider: ProviderId = settings.provider;

    // Load dashboard context + scrub PII
    const data = await ctx.runQuery(
      internal.advisorChatInternal.loadDashboardContext,
      { affiliateId: affiliate._id }
    );
    const scrubbed = data
      ? buildScrubbedContext({
          affiliate: data.affiliate,
          deals: data.deals,
          leads: data.leads,
          now: Date.now(),
          maxDeals: 15, // chat uses a smaller subset than digests
          maxLeads: 10,
        })
      : null;

    const contextBlock = scrubbed
      ? `\n\n[USER CONTEXT]\n${JSON.stringify(scrubbed, null, 0)}\n` +
        `Use this when the user's question touches their pipeline, leads, or activity. ` +
        `Do not reveal identity details back to the user.`
      : "";

    const baseSystem = CHAT_SYSTEM_PROMPTS[chat.mode as ChatMode];
    const systemPrompt = baseSystem + contextBlock;

    // Build the multi-turn message array: existing conversation + new user message
    const messages = [
      ...recent.map((m: any) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: String(m.content),
      })),
      { role: "user" as const, content: trimmed },
    ];

    const result = await sendRequest(provider, {
      apiKey,
      systemPrompt,
      messages,
      maxTokens: 1500,
      timeoutMs: DEFAULT_TIMEOUT_MS,
    });

    if (!result.text.trim()) {
      throw new Error("The AI returned an empty response. Try again.");
    }

    const replyId: { id: string } = await ctx.runMutation(
      internal.advisorChatInternal.appendMessage,
      {
        chatId: args.chatId,
        role: "assistant",
        content: result.text,
        tokensUsed: result.tokensUsed,
      }
    );

    return {
      id: replyId.id,
      content: result.text,
      tokensUsed: result.tokensUsed,
      model: result.model,
    };
  },
});