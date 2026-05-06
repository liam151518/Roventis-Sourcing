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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getTierBorder = (tier: string) => {
    switch (tier) {
      case "platinum": return "border-violet-500/30";
      case "gold": return "border-amber-400/30";
      case "silver": return "border-white/10";
      default: return "border-white/5";
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
      <div>
          <p className="rs-overline">Admin</p>
          <h1 className="rs-page-title">Leaderboard</h1>
          <p className="text-gray-500 mt-1">Top performing affiliates by sales</p>
        </div>

      {leaderboard.length === 0 ? (
        <div className="bg-[#141417] rounded-[14px] border border-white/5 p-12 text-center">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Data Yet</h3>
          <p className="text-gray-500">Complete some deals to see the leaderboard</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.affiliate._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rs-card p-6 ${getTierBorder(entry.affiliate.tier)} border`}
            >
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-black/30 rounded-xl">
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
                    <span className={`px-2 py-0.5 text-xs rounded-full bg-black/30 capitalize ${
                      entry.affiliate.tier === "platinum" ? "text-indigo-300" :
                      entry.affiliate.tier === "gold" ? "text-yellow-300" :
                      entry.affiliate.tier === "silver" ? "text-gray-300" :
                      "text-amber-300"
                    }`}>
                      {entry.affiliate.tier}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">{entry.affiliate.email}</p>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Deals</p>
                    <p className="text-xl font-semibold text-white">{entry.dealCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Conversion</p>
                    <p className="text-xl font-semibold text-white">{entry.conversionRate.toFixed(1)}%</p>
                  </div>
                  <div className="text-center min-w-[120px]">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Sales</p>
                    <p className="text-xl font-semibold text-white">{formatCurrency(entry.totalSales)}</p>
                  </div>
                  <div className="text-center min-w-[120px]">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Commission</p>
                    <p className="text-xl font-semibold text-emerald-400">{formatCurrency(entry.totalCommission)}</p>
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
