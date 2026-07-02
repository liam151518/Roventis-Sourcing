// Operations stats for the Advisor page overview tab.
//
// getMyStats aggregates pipeline, conversion, call activity, commissions,
// training, and todo counts into a single payload the UI can render.
// All reads are scoped to the calling affiliate via their Clerk user ID.

import { query } from "./_generated/server";

const MS_PER_DAY = 86400000;
const FUNNEL_DAYS = 90;
const TREND_WEEKS = 8;

// Map from deal-status -> probability weight used for "weighted pipeline value".
// These are deliberately generous defaults; they can be tuned later.
const STAGE_WEIGHTS: Record<string, number> = {
  prospect: 0.1,
  qualified: 0.25,
  proposal_sent: 0.5,
  negotiation: 0.75,
  closed_won: 1.0,
  closed_lost: 0.0,
  on_hold: 0.0,
};

const WON_STATUSES = new Set(["closed_won"]);
const OPEN_STATUSES = new Set([
  "prospect",
  "qualified",
  "proposal_sent",
  "negotiation",
  "on_hold",
]);

export const getMyStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const affiliate = await ctx.db
      .query("affiliates")
      .withIndex("by_clerk_id", (q) =>
        q.eq("clerkUserId", identity.subject)
      )
      .unique();
    if (!affiliate) return null;
    const affId = affiliate._id;

    const now = Date.now();
    const since90 = now - FUNNEL_DAYS * MS_PER_DAY;
    const since7 = now - 7 * MS_PER_DAY;
    const weekAgo = now - 14 * MS_PER_DAY;

    // Pull all of this affiliate's deals, journal, todos.
    // Reads are bounded - we cap to 500 each.
    const allDeals = await ctx.db
      .query("deals")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", affId))
      .take(500);

    const allJournal = await ctx.db
      .query("advisorJournal")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", affId))
      .take(500);

    const allTodos = await ctx.db
      .query("advisorTodos")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", affId))
      .take(500);

    // ---- Pipeline ----
    const byStatus: Record<string, number> = {};
    const byStatusValue: Record<string, number> = {};
    let pipelineValue = 0;
    let weightedValue = 0;
    let wonThisMonth = 0;
    let wonValueThisMonth = 0;
    let wonAllTimeValue = 0;
    let wonAllTimeCount = 0;
    let lostCount = 0;
    let openCount = 0;
    const monthStart = new Date(now);
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const monthStartMs = monthStart.getTime();

    for (const d of allDeals) {
      const s = String(d.status);
      const value = Number(d.dealValue ?? 0);
      byStatus[s] = (byStatus[s] ?? 0) + 1;
      byStatusValue[s] = (byStatusValue[s] ?? 0) + value;

      if (OPEN_STATUSES.has(s)) {
        pipelineValue += value;
        weightedValue += value * (STAGE_WEIGHTS[s] ?? 0);
        openCount++;
      }
      if (WON_STATUSES.has(s)) {
        wonAllTimeCount++;
        wonAllTimeValue += value;
        const closedAt = Number(d.actualCloseDate ?? d._creationTime ?? 0);
        if (closedAt >= monthStartMs) {
          wonThisMonth++;
          wonValueThisMonth += value;
        }
      }
      if (s === "closed_lost") lostCount++;
    }

    // ---- Trend (last 8 weeks of closes) ----
    const trendWeeks: Array<{
      label: string;
      won: number;
      lost: number;
    }> = [];
    for (let i = TREND_WEEKS - 1; i >= 0; i--) {
      const start = now - (i + 1) * 7 * MS_PER_DAY;
      const end = now - i * 7 * MS_PER_DAY;
      let won = 0;
      let lost = 0;
      for (const d of allDeals) {
        const closedAt = Number(d.actualCloseDate ?? 0);
        if (closedAt < start || closedAt >= end) continue;
        if (d.status === "closed_won") won++;
        if (d.status === "closed_lost") lost++;
      }
      const dt = new Date(end);
      const label = `${dt.getUTCDate()}/${dt.getUTCMonth() + 1}`;
      trendWeeks.push({ label, won, lost });
    }

    // ---- Conversion funnel ----
    const claimedLeads = await ctx.db
      .query("leads")
      .withIndex("by_claimedBy", (q) => q.eq("claimedBy", affId))
      .take(500);
    const leadsTotal = allDeals.length + claimedLeads.length; // rough
    const claimed = claimedLeads.length;
    const dealsFromLeads = allDeals.filter((d) => !!d.fromLeadId).length;
    const ordersApproved = allDeals.filter(
      (d) => d.orderStatus === "approved"
    ).length;
    const commissionsPaid = allDeals.filter(
      (d) => d.commissionStatus === "paid"
    ).length;

    // ---- Calls ----
    let callsTotal = allJournal.length;
    let callsThisWeek = 0;
    let callsLastWeek = 0;
    const byOutcome: Record<string, number> = {};
    for (const j of allJournal) {
      const t = Number(j.calledAt ?? j.createdAt ?? 0);
      if (t >= since7) callsThisWeek++;
      if (t >= weekAgo && t < since7) callsLastWeek++;
      const o = String(j.outcome ?? "other");
      byOutcome[o] = (byOutcome[o] ?? 0) + 1;
    }

    // ---- Commissions ----
    const earned = Number(affiliate.totalCommissionEarned ?? 0);
    const paid = Number(affiliate.totalCommissionPaid ?? 0);
    const pending = Math.max(0, earned - paid);
    const topDeals = [...allDeals]
      .sort(
        (a, b) =>
          Number(b.commissionAmount ?? 0) - Number(a.commissionAmount ?? 0)
      )
      .slice(0, 3)
      .map((d) => ({
        id: String(d._id),
        clientName: d.clientName ?? "(unnamed)",
        dealValue: Number(d.dealValue ?? 0),
        commissionAmount: Number(d.commissionAmount ?? 0),
        status: String(d.status),
      }));

    // ---- Training ----
    const progress = await ctx.db
      .query("trainingProgress")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", affId))
      .collect();
    const allModules = await ctx.db.query("trainingModules").take(500);
    let trainingTotal = allModules.length;
    let trainingCompleted = 0;
    let lastModuleTitle: string | null = null;
    let lastProgressAt = 0;
    for (const p of progress) {
      trainingTotal++;
      const status = String(p.status ?? "not_started");
      if (status === "completed") {
        trainingCompleted++;
        // Update last-activity based on completedAt or _creationTime
        const t = Number(p.completedAt ?? p._creationTime ?? 0);
        if (t > lastProgressAt) {
          lastProgressAt = t;
        }
      }
    }
    // Resolve the most recent module title via the trainingModules table.
    if (lastProgressAt > 0) {
      // We can't query by updatedAt directly; find the latest completed.
      const completed = progress
        .filter((p) => String(p.status) === "completed")
        .sort(
          (a, b) =>
            Number(b.completedAt ?? b._creationTime ?? 0) -
            Number(a.completedAt ?? a._creationTime ?? 0)
        );
      for (const p of completed) {
        const m = await ctx.db.get(p.moduleId as any);
        if (m && (m as any).title) {
          lastModuleTitle = String((m as any).title);
          break;
        }
      }
    }

    // ---- Todos ----
    let openTodos = 0;
    let overdueTodos = 0;
    let completedThisWeek = 0;
    let nextTodo: { id: string; title: string; dueAt: number | null; priority: string } | null = null;
    for (const t of allTodos) {
      const completed = !!t.completed;
      const dueAt = t.dueAt ?? null;
      if (!completed) {
        openTodos++;
        if (dueAt != null && dueAt < now) overdueTodos++;
        const candPriority = priorityRank(t.priority);
        const nextPriority = nextTodo ? priorityRank(nextTodo.priority as any) : -1;
        if (
          !nextTodo ||
          candPriority > nextPriority ||
          (candPriority === nextPriority &&
            (dueAt ?? Infinity) < (nextTodo.dueAt ?? Infinity))
        ) {
          nextTodo = {
            id: String(t._id),
            title: String(t.title),
            dueAt,
            priority: String(t.priority),
          };
        }
      } else if ((t.completedAt ?? 0) >= since7) {
        completedThisWeek++;
      }
    }

    return {
      generatedAt: now,
      pipeline: {
        byStatus,
        byStatusValue,
        openCount,
        pipelineValue,
        weightedValue,
        wonThisMonth,
        wonValueThisMonth,
        wonAllTimeCount,
        wonAllTimeValue,
        lostCount,
      },
      trend: trendWeeks,
      funnel: {
        leadsTotal: leadsTotal + claimed, // unique-ish
        claimed,
        dealsFromLeads,
        ordersApproved,
        commissionsPaid,
      },
      calls: {
        total: callsTotal,
        thisWeek: callsThisWeek,
        lastWeek: callsLastWeek,
        byOutcome,
      },
      commissions: {
        earned,
        paid,
        pending,
        topDeals,
      },
      training: {
        completed: trainingCompleted,
        total: trainingTotal,
        lastModuleTitle,
        lastProgressAt,
      },
      todos: {
        open: openTodos,
        overdue: overdueTodos,
        completedThisWeek,
        nextUp: nextTodo,
      },
    };
  },
});

function priorityRank(p: any): number {
  if (p === "high") return 2;
  if (p === "med") return 1;
  return 0;
}