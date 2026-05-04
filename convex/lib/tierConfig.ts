// Tier configuration for lead management system

export const TIER_CONFIG = {
  bronze: {
    weeklyLeadLimit: 10,
    pools: ["standard"] as const,
    label: "Bronze",
  },
  silver: {
    weeklyLeadLimit: 25,
    pools: ["standard"] as const,
    label: "Silver",
  },
  gold: {
    weeklyLeadLimit: 50,
    pools: ["standard", "priority"] as const,
    label: "Gold",
  },
  platinum: {
    weeklyLeadLimit: Infinity,
    pools: ["standard", "priority", "premium"] as const,
    label: "Platinum",
  },
} as const;

export type Tier = keyof typeof TIER_CONFIG;
export type PoolTier = "standard" | "priority" | "premium";

export const CLAIM_TTL_MS = 72 * 60 * 60 * 1000; // 72 hours
export const MAX_RELEASES_DEFAULT = 2;

/**
 * Get the next Monday midnight in SAST (Africa/Johannesburg)
 * SAST is UTC+2, no daylight saving
 */
export function getNextMondayMidnightSAST(now: number): number {
  const date = new Date(now);
  // Get current day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = date.getDay();
  // Days until next Monday
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  
  // Create date for next Monday at 00:00:00 in local time, then convert to timestamp
  const nextMonday = new Date(date);
  nextMonday.setDate(date.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  
  // Adjust for SAST offset (UTC+2)
  // The date was created in local time, but we need to interpret it as SAST
  // Since JS Date uses local timezone, we need to add 2 hours to get UTC, then the timestamp is in UTC
  // Actually, simplest is to create UTC midnight and adjust
  
  // Create a date at midnight SAST: midnight SAST = 22:00 UTC previous day
  // So we need to go to the next Monday at 22:00 UTC
  const nextMondayUTC = new Date(Date.UTC(
    nextMonday.getFullYear(),
    nextMonday.getMonth(),
    nextMonday.getDate() - 1, // Go back one day in UTC terms
    22, 0, 0, 0 // 22:00 UTC = 00:00 SAST
  ));
  
  return nextMondayUTC.getTime();
}

/**
 * Get remaining time until next Monday midnight in human readable format
 */
export function getTimeUntilReset(resetAt: number, now: number): string {
  const diff = resetAt - now;
  if (diff <= 0) return "Resets now";
  
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Get tier label from tier key
 */
export function getTierLabel(tier: Tier): string {
  return TIER_CONFIG[tier].label;
}

/**
 * Get allowed pools for a tier
 */
export function getAllowedPools(tier: Tier): readonly PoolTier[] {
  return TIER_CONFIG[tier].pools;
}

/**
 * Get weekly limit for a tier
 */
export function getWeeklyLimit(tier: Tier): number {
  return TIER_CONFIG[tier].weeklyLeadLimit;
}