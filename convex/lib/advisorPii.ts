// PII scrub helpers for advisor prompts.
//
// Before any user data goes into a prompt sent to OpenAI / Anthropic /
// Gemini, we strip fields that could personally identify the affiliate.
// Client names and lead contact info are KEPT because the affiliate is
// the one who collected them and needs advice on those specific people.
//
// What gets scrubbed:
//   - The affiliate's own PII: firstName, lastName, email, phone,
//     linkedinUrl, city (replaced with a generic "this user")
//   - The affiliate's Clerk user ID
//   - Bank/payout details: bankName, accountNumber, accountType
//
// What is kept (the affiliate's own business data):
//   - Deal client names, emails, phones, values
//   - Lead company/contact info
//   - Training progress, commission totals, deal counts
//   - Activity timestamps

export interface ScrubbedAffiliateContext {
  // Stable per-affiliate token so the model can still reference "you"
  // consistently across a single summary without knowing who they are.
  userToken: string;
  tier: string;
  accessStatus: string;
  isApprovedToSell: boolean;
  trainingCompleted: boolean;
  totalSales: number;
  totalCommissionEarned: number;
  totalCommissionPaid: number;
  pendingCommission: number;
  weeklyClaimsUsed: number;
  totalLeadsClaimed: number;
  totalLeadsConverted: number;
  weeklyClaimsResetAt: number | null;
}

export interface ScrubbedDeal {
  id: string;
  clientName: string;
  clientCompany: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  dealValue: number;
  productCategory: string[];
  description: string | null;
  status: string;
  commissionRate: number;
  commissionAmount: number;
  commissionStatus: string;
  expectedCloseDate: number | null;
  actualCloseDate: number | null;
  orderStatus: string | null;
  daysSinceCreated: number;
  daysSinceLastUpdate: number;
}

export interface ScrubbedLead {
  id: string;
  companyName: string;
  contactName: string | null;
  industry: string | null;
  city: string | null;
  poolTier: string | null;
  status: string;
  timesReleased: number;
}

export interface ScrubbedContext {
  user: ScrubbedAffiliateContext;
  deals: ScrubbedDeal[];
  leads: ScrubbedLead[];
  generatedAt: number;
}

/**
 * Strip PII from an affiliate row. We DO NOT pass firstName/lastName/
 * email/phone/linkedinUrl/city to the model. Bank info is also dropped.
 *
 * The caller can cap how much data is included; defaults are tuned so
 * the resulting JSON payload comfortably fits inside ~50k tokens for
 * chat messages and stays well below any model context window.
 */
export function buildScrubbedContext(args: {
  affiliate: any;
  deals: any[];
  leads: any[];
  now: number;
  maxDeals?: number;
  maxLeads?: number;
  descriptionCap?: number;
}): ScrubbedContext {
  const { affiliate, deals, leads, now } = args;

  const user: ScrubbedAffiliateContext = {
    // Stable token derived from clerkUserId so the model can refer to
    // "this affiliate" consistently, but it can't be reversed to a name.
    userToken: deriveUserToken(affiliate.clerkUserId ?? affiliate._id),
    tier: affiliate.tier ?? "bronze",
    accessStatus: affiliate.access ?? "active",
    isApprovedToSell: !!affiliate.isApprovedToSell,
    trainingCompleted: !!affiliate.trainingCompleted,
    totalSales: Number(affiliate.totalSales ?? 0),
    totalCommissionEarned: Number(affiliate.totalCommissionEarned ?? 0),
    totalCommissionPaid: Number(affiliate.totalCommissionPaid ?? 0),
    pendingCommission: Number(affiliate.pendingCommission ?? 0),
    weeklyClaimsUsed: Number(affiliate.weeklyClaimsUsed ?? 0),
    totalLeadsClaimed: Number(affiliate.totalLeadsClaimed ?? 0),
    totalLeadsConverted: Number(affiliate.totalLeadsConverted ?? 0),
    weeklyClaimsResetAt: affiliate.weeklyClaimsResetAt ?? null,
  };

  const maxDeals = args.maxDeals ?? 25;
  const maxLeads = args.maxLeads ?? 15;
  const descCap = args.descriptionCap ?? 280;

  // Newest deals first (by createdAt), then keep the most relevant.
  const sortedDeals = [...deals].sort(
    (a: any, b: any) =>
      Number(b.createdAt ?? b._creationTime ?? 0) -
      Number(a.createdAt ?? a._creationTime ?? 0)
  );
  const recentDeals = sortedDeals.slice(0, maxDeals);

  const sortedLeads = [...leads].sort(
    (a: any, b: any) =>
      Number(b._creationTime ?? 0) - Number(a._creationTime ?? 0)
  );
  const recentLeads = sortedLeads.slice(0, maxLeads);

  const scrubbedDeals: ScrubbedDeal[] = recentDeals.map((d: any) => {
    const createdAt = Number(d.createdAt ?? now);
    const updatedAt = Number(d._creationTime ?? createdAt);
    const desc = d.description ?? null;
    const description =
      desc && desc.length > descCap
        ? desc.slice(0, descCap) + "..."
        : desc;
    return {
      id: String(d._id),
      clientName: d.clientName ?? "(unnamed)",
      clientCompany: d.clientCompany ?? null,
      clientEmail: d.clientEmail ?? null,
      clientPhone: d.clientPhone ?? null,
      dealValue: Number(d.dealValue ?? 0),
      productCategory: Array.isArray(d.productCategory) ? d.productCategory : [],
      description,
      status: d.status ?? "prospect",
      commissionRate: Number(d.commissionRate ?? 0),
      commissionAmount: Number(d.commissionAmount ?? 0),
      commissionStatus: d.commissionStatus ?? "pending",
      expectedCloseDate: d.expectedCloseDate ?? null,
      actualCloseDate: d.actualCloseDate ?? null,
      orderStatus: d.orderStatus ?? null,
      daysSinceCreated: Math.max(0, Math.floor((now - createdAt) / 86400000)),
      daysSinceLastUpdate: Math.max(0, Math.floor((now - updatedAt) / 86400000)),
    };
  });

  const scrubbedLeads: ScrubbedLead[] = recentLeads.map((l: any) => ({
    id: String(l._id),
    companyName: l.companyName ?? "(unnamed)",
    contactName: l.contactName ?? null,
    industry: l.industry ?? null,
    city: l.city ?? null,
    poolTier: l.poolTier ?? null,
    status: l.status ?? "available",
    timesReleased: Number(l.timesReleased ?? 0),
  }));

  return { user, deals: scrubbedDeals, leads: scrubbedLeads, generatedAt: now };
}

/**
 * Stable, non-reversible token for the affiliate. We use a short
 * hash so the model can write things like "User #a3f9 should focus
 * on..." without ever knowing the actual identity.
 */
function deriveUserToken(input: string): string {
  // Simple deterministic 4-char hex prefix from the input. Not
  // cryptographically meaningful - just stable and unidentifying.
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return "U-" + ((h >>> 0).toString(16).padStart(8, "0").slice(0, 4));
}

/**
 * SAST date key (YYYY-MM-DD) for a given epoch ms. SAST = UTC+2.
 * Used for daily rate-limit buckets.
 */
export function sastDayKey(epochMs: number): string {
  const sast = new Date(epochMs + 2 * 60 * 60 * 1000);
  const y = sast.getUTCFullYear();
  const m = String(sast.getUTCMonth() + 1).padStart(2, "0");
  const d = String(sast.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}