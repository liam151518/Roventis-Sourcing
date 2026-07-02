import { query } from "./_generated/server";
import { v } from "convex/values";

// Public-facing helper for the user-side Advisor page (early-access gate).
//
// `validateAdvisorAccessCode` does a constant-ish lookup against the
// `advisorAccessCodes` table. It returns `{ valid: true }` if a row with
// `code === input` and `isActive === true` exists, otherwise `{ valid: false }`.
//
// We intentionally do NOT reveal whether the code exists-but-revoked vs.
// doesn't-exist at all - both return `{ valid: false }`. This denies
// affiliates a way to enumerate codes by mistake.

export const validateAdvisorAccessCode = query({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const trimmed = args.code.trim();
    if (!trimmed) {
      return { valid: false as const };
    }

    const row = await ctx.db
      .query("advisorAccessCodes")
      .withIndex("by_code", (q) => q.eq("code", trimmed))
      .first();

    if (!row || !row.isActive) {
      return { valid: false as const };
    }

    return { valid: true as const, label: row.label ?? null };
  },
});
