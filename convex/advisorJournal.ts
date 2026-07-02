// Public queries/mutations for the Advisor Journal + Todos.
//
// Lives in a single file (no "use node") so we don't have to split.
// All functions auth-check via ctx.auth.getUserIdentity and scope
// reads to the calling affiliate.

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const JOURNAL_TAKE = 200;
const TODO_TAKE = 200;

/* ============================================================== */
/* Helpers                                                         */
/* ============================================================== */

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

/* ============================================================== */
/* Journal                                                         */
/* ============================================================== */

export const listJournal = query({
  args: {
    outcome: v.optional(
      v.union(
        v.literal("won"),
        v.literal("lost"),
        v.literal("follow-up"),
        v.literal("no-answer"),
        v.literal("info-sent"),
        v.literal("other")
      )
    ),
  },
  handler: async (ctx, args) => {
    const affiliate = await resolveAffiliate(ctx);
    let q = ctx.db
      .query("advisorJournal")
      .withIndex("by_affiliate_calledAt", (qq: any) =>
        qq.eq("affiliateId", affiliate._id)
      );
    const all = await q.order("desc").take(JOURNAL_TAKE);
    const filtered = args.outcome
      ? all.filter((j: any) => j.outcome === args.outcome)
      : all;
    return filtered;
  },
});

export const createJournal = mutation({
  args: {
    title: v.string(),
    dealId: v.optional(v.id("deals")),
    leadId: v.optional(v.id("leads")),
    outcome: v.union(
      v.literal("won"),
      v.literal("lost"),
      v.literal("follow-up"),
      v.literal("no-answer"),
      v.literal("info-sent"),
      v.literal("other")
    ),
    notes: v.string(),
    nextStep: v.optional(v.string()),
    nextStepDueAt: v.optional(v.number()),
    calledAt: v.number(),
  },
  handler: async (ctx, args) => {
    const affiliate = await resolveAffiliate(ctx);
    const title = args.title.trim();
    if (!title) throw new Error("Title is required");
    const id = await ctx.db.insert("advisorJournal", {
      affiliateId: affiliate._id,
      title,
      dealId: args.dealId,
      leadId: args.leadId,
      outcome: args.outcome,
      notes: args.notes,
      nextStep: args.nextStep,
      nextStepDueAt: args.nextStepDueAt,
      calledAt: args.calledAt,
      createdAt: Date.now(),
    });
    return { id };
  },
});

export const updateJournal = mutation({
  args: {
    id: v.id("advisorJournal"),
    title: v.optional(v.string()),
    outcome: v.optional(
      v.union(
        v.literal("won"),
        v.literal("lost"),
        v.literal("follow-up"),
        v.literal("no-answer"),
        v.literal("info-sent"),
        v.literal("other")
      )
    ),
    notes: v.optional(v.string()),
    nextStep: v.optional(v.string()),
    nextStepDueAt: v.optional(v.number()),
    calledAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const affiliate = await resolveAffiliate(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) throw new Error("Not found");
    if (row.affiliateId !== affiliate._id) throw new Error("Unauthorized");
    const patch: Record<string, unknown> = {};
    if (args.title !== undefined) patch.title = args.title.trim();
    if (args.outcome !== undefined) patch.outcome = args.outcome;
    if (args.notes !== undefined) patch.notes = args.notes;
    if (args.nextStep !== undefined) patch.nextStep = args.nextStep;
    if (args.nextStepDueAt !== undefined)
      patch.nextStepDueAt = args.nextStepDueAt;
    if (args.calledAt !== undefined) patch.calledAt = args.calledAt;
    await ctx.db.patch(args.id, patch);
    return { ok: true };
  },
});

export const deleteJournal = mutation({
  args: { id: v.id("advisorJournal") },
  handler: async (ctx, args) => {
    const affiliate = await resolveAffiliate(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) return { ok: true };
    if (row.affiliateId !== affiliate._id) throw new Error("Unauthorized");
    // Also delete todos that point at this journal entry as their source
    const linked = await ctx.db
      .query("advisorTodos")
      .withIndex("by_affiliate", (q: any) =>
        q.eq("affiliateId", affiliate._id)
      )
      .collect();
    for (const t of linked) {
      if (t.sourceJournalId === args.id) {
        await ctx.db.delete(t._id);
      }
    }
    await ctx.db.delete(args.id);
    return { ok: true };
  },
});

/* ============================================================== */
/* Todos                                                           */
/* ============================================================== */

export const listTodos = query({
  args: { includeCompleted: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const affiliate = await resolveAffiliate(ctx);
    const all = await ctx.db
      .query("advisorTodos")
      .withIndex("by_affiliate", (q: any) =>
        q.eq("affiliateId", affiliate._id)
      )
      .take(TODO_TAKE);
    const include = args.includeCompleted ?? true;
    const filtered = include ? all : all.filter((t: any) => !t.completed);
    return filtered.sort(
      (a: any, b: any) =>
        Number(a.dueAt ?? Infinity) - Number(b.dueAt ?? Infinity)
    );
  },
});

export const createTodo = mutation({
  args: {
    title: v.string(),
    notes: v.optional(v.string()),
    dueAt: v.optional(v.number()),
    priority: v.union(v.literal("low"), v.literal("med"), v.literal("high")),
    sourceJournalId: v.optional(v.id("advisorJournal")),
  },
  handler: async (ctx, args) => {
    const affiliate = await resolveAffiliate(ctx);
    const title = args.title.trim();
    if (!title) throw new Error("Title is required");
    const id = await ctx.db.insert("advisorTodos", {
      affiliateId: affiliate._id,
      title,
      notes: args.notes,
      dueAt: args.dueAt,
      priority: args.priority,
      completed: false,
      sourceJournalId: args.sourceJournalId,
      createdAt: Date.now(),
    });
    return { id };
  },
});

export const toggleTodo = mutation({
  args: { id: v.id("advisorTodos") },
  handler: async (ctx, args) => {
    const affiliate = await resolveAffiliate(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) throw new Error("Not found");
    if (row.affiliateId !== affiliate._id) throw new Error("Unauthorized");
    const now = Date.now();
    if (row.completed) {
      await ctx.db.patch(args.id, { completed: false, completedAt: undefined });
    } else {
      await ctx.db.patch(args.id, { completed: true, completedAt: now });
    }
    return { ok: true };
  },
});

export const updateTodo = mutation({
  args: {
    id: v.id("advisorTodos"),
    title: v.optional(v.string()),
    notes: v.optional(v.string()),
    dueAt: v.optional(v.number()),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("med"), v.literal("high"))
    ),
  },
  handler: async (ctx, args) => {
    const affiliate = await resolveAffiliate(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) throw new Error("Not found");
    if (row.affiliateId !== affiliate._id) throw new Error("Unauthorized");
    const patch: Record<string, unknown> = {};
    if (args.title !== undefined) patch.title = args.title.trim();
    if (args.notes !== undefined) patch.notes = args.notes;
    if (args.dueAt !== undefined) patch.dueAt = args.dueAt;
    if (args.priority !== undefined) patch.priority = args.priority;
    await ctx.db.patch(args.id, patch);
    return { ok: true };
  },
});

export const deleteTodo = mutation({
  args: { id: v.id("advisorTodos") },
  handler: async (ctx, args) => {
    const affiliate = await resolveAffiliate(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) return { ok: true };
    if (row.affiliateId !== affiliate._id) throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
    return { ok: true };
  },
});

/**
 * Convenience: create a follow-up todo directly from a journal entry.
 * Pulls the title + nextStep + dueAt from the journal and persists
 * a linked todo.
 */
export const fromJournalCreateTodo = mutation({
  args: {
    journalId: v.id("advisorJournal"),
    title: v.optional(v.string()),
    dueAt: v.optional(v.number()),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("med"), v.literal("high"))
    ),
  },
  handler: async (ctx, args) => {
    const affiliate = await resolveAffiliate(ctx);
    const row = await ctx.db.get(args.journalId);
    if (!row) throw new Error("Journal entry not found");
    if (row.affiliateId !== affiliate._id) throw new Error("Unauthorized");
    const title =
      args.title?.trim() ||
      row.nextStep?.trim() ||
      `Follow up: ${row.title}`;
    const dueAt = args.dueAt ?? row.nextStepDueAt ?? null;
    const priority = args.priority ?? "med";
    const id = await ctx.db.insert("advisorTodos", {
      affiliateId: affiliate._id,
      title,
      notes: row.notes,
      dueAt: dueAt ?? undefined,
      priority,
      completed: false,
      sourceJournalId: args.journalId,
      createdAt: Date.now(),
    });
    return { id };
  },
});