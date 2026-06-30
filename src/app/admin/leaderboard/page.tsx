"use client";

import { motion } from "framer-motion";
import { Trophy, TrendingUp, DollarSign, ShoppingCart, Medal } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatCurrency } from "@/lib/utils";

export default function AdminLeaderboardPage() {
  const leaderboard = useQuery(api.admin.getLeaderboard);

  if (!leaderboard) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--rs-bg-base)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: "var(--rs-accent)" }} />
      </div>
    );
  }

  const getTierBorder = (tier: string) => {
    switch (tier) {
      case "platinum": return "rgba(167,139,250,0.30)";
      case "gold": return "rgba(251,191,36,0.30)";
      case "silver": return "rgba(255,255,255,0.10)";
      default: return "var(--rs-border)";
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 0) return "🥇";
    if (rank === 1) return "🥈";
    if (rank === 2) return "🥉";
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="rs-page-header">
        <div>
          <span className="rs-overline">Admin</span>
          <h1 className="rs-page-title mt-1">Leaderboard</h1>
          <p className="rs-page-subtitle">Top performing affiliates by sales</p>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="rs-empty-state rs-card">
          <Trophy className="rs-empty-state-icon" style={{ width: 48, height: 48 }} />
          <p className="rs-empty-state-title">No Data Yet</p>
          <p className="rs-empty-state-description">Complete some deals to see the leaderboard.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.affiliate._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rs-card p-6"
              style={{ borderColor: getTierBorder(entry.affiliate.tier) }}
            >
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl" style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}>
                  {getMedalIcon(index) ? (
                    <span className="text-2xl">{getMedalIcon(index)}</span>
                  ) : (
                    <span className="text-xl font-semibold text-white">#{index + 1}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {entry.affiliate.firstName} {entry.affiliate.lastName}
                    </h3>
                    <span
                      className="rs-pill capitalize"
                      style={
                        entry.affiliate.tier === "platinum"
                          ? { background: "rgba(167,139,250,0.10)", color: "rgb(167,139,250)", borderColor: "rgba(167,139,250,0.25)" }
                          : entry.affiliate.tier === "gold"
                          ? { background: "rgba(251,191,36,0.10)", color: "rgb(251,191,36)", borderColor: "rgba(251,191,36,0.25)" }
                          : entry.affiliate.tier === "silver"
                          ? { background: "rgba(255,255,255,0.06)", color: "rgb(229,231,235)", borderColor: "rgba(255,255,255,0.15)" }
                          : { background: "rgba(245,158,11,0.10)", color: "rgb(251,146,60)", borderColor: "rgba(245,158,11,0.25)" }
                      }
                    >
                      {entry.affiliate.tier}
                    </span>
                  </div>
                  <p className="text-sm truncate" style={{ color: "var(--rs-text-secondary)" }}>{entry.affiliate.email}</p>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--rs-text-muted)" }}>Deals</p>
                    <p className="text-xl font-semibold text-white">{entry.dealCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--rs-text-muted)" }}>Conversion</p>
                    <p className="text-xl font-semibold text-white">{entry.conversionRate.toFixed(1)}%</p>
                  </div>
                  <div className="text-center min-w-[120px]">
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--rs-text-muted)" }}>Total Sales</p>
                    <p className="text-xl font-semibold text-white">{formatCurrency(entry.totalSales)}</p>
                  </div>
                  <div className="text-center min-w-[120px]">
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--rs-text-muted)" }}>Commission</p>
                    <p className="text-xl font-semibold" style={{ color: "rgb(74,222,128)" }}>{formatCurrency(entry.totalCommission)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
