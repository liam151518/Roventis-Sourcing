import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Force consistent formatting - avoid hydration issues by using simple string formatting
export function formatCurrency(amount: number): string {
  // Use consistent formatting without locale-specific variations to prevent hydration mismatches
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `R ${formatted}`;
}

export function formatDate(date: Date | string | number | undefined | null): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Invalid Date";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatRelativeTime(date: Date | string | number | undefined | null): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Invalid Date";
  
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function generateAffiliateCode(firstName: string, lastName: string, count: number): string {
  const initials = (firstName[0] + lastName[0]).toUpperCase();
  const padded = String(count).padStart(3, "0");
  return `ROV-${initials}-${padded}`;
}

export function getTierCommissionRate(tier: string): number {
  const rates: Record<string, number> = {
    bronze: 5,
    silver: 7.5,
    gold: 10,
    platinum: 12,
  };
  return rates[tier] || 5;
}

export function calculateTier(totalSales: number): string {
  if (totalSales >= 500000) return "platinum";
  if (totalSales >= 200000) return "gold";
  if (totalSales >= 50000) return "silver";
  return "bronze";
}

export const dealStatuses = [
  { value: "prospect", label: "Prospect", color: "bg-gray-800 text-gray-300" },
  { value: "qualified", label: "Qualified", color: "bg-blue-900/50 text-blue-400" },
  { value: "proposal_sent", label: "Proposal Sent", color: "bg-yellow-900/50 text-yellow-400" },
  { value: "negotiation", label: "Negotiation", color: "bg-orange-900/50 text-orange-400" },
  { value: "closed_won", label: "Closed Won", color: "bg-green-900/50 text-green-400" },
  { value: "closed_lost", label: "Closed Lost", color: "bg-red-900/50 text-red-400" },
  { value: "on_hold", label: "On Hold", color: "bg-purple-900/50 text-purple-400" },
] as const;

export const tierColors = {
  bronze: "bg-amber-900/50 text-amber-400 border-amber-700",
  silver: "bg-gray-700/50 text-gray-300 border-gray-600",
  gold: "bg-yellow-900/50 text-yellow-400 border-yellow-700",
  platinum: "bg-indigo-900/50 text-indigo-400 border-indigo-700",
} as const;
