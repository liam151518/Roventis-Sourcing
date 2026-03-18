"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Ticket, 
  Package,
  TrendingUp,
  FileText,
  Activity,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatCurrency } from "@/lib/utils";

const statCards = [
  { label: "Total Affiliates", key: "totalAffiliates", icon: Users, color: "blue" },
  { label: "Total Sales", key: "totalSales", icon: TrendingUp, color: "green", format: "currency" },
  { label: "Total Commission", key: "totalCommission", icon: DollarSign, color: "emerald", format: "currency" },
  { label: "Pending Commission", key: "pendingCommission", icon: Activity, color: "amber", format: "currency" },
  { label: "Total Deals", key: "totalDeals", icon: ShoppingCart, color: "purple" },
  { label: "Active Orders", key: "activeOrders", icon: Package, color: "cyan" },
  { label: "Open Tickets", key: "openTickets", icon: Ticket, color: "rose" },
  { label: "Resources", key: "totalResources", icon: FileText, color: "orange" },
];

const colorMap: Record<string, string> = {
  blue: "from-blue-500/20 to-blue-600/10 border-blue-500/20",
  green: "from-green-500/20 to-green-600/10 border-green-500/20",
  emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20",
  amber: "from-amber-500/20 to-amber-600/10 border-amber-500/20",
  purple: "from-purple-500/20 to-purple-600/10 border-purple-500/20",
  cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/20",
  rose: "from-rose-500/20 to-rose-600/10 border-rose-500/20",
  orange: "from-orange-500/20 to-orange-600/10 border-orange-500/20",
};

const iconColorMap: Record<string, string> = {
  blue: "text-blue-400",
  green: "text-green-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  purple: "text-purple-400",
  cyan: "text-cyan-400",
  rose: "text-rose-400",
  orange: "text-orange-400",
};

export default function AdminOverviewPage() {
  const stats = useQuery(api.admin.getAdminDashboardStats);

  if (!stats) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getValue = (key: string) => {
    const value = (stats as any)[key];
    if (key.includes("Sales") || key.includes("Commission")) {
      return formatCurrency(value || 0);
    }
    return value?.toLocaleString() || "0";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your affiliate program</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-gradient-to-br ${colorMap[stat.color]} border rounded-2xl p-6`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-semibold text-white mt-2">{getValue(stat.key)}</p>
              </div>
              <div className={`p-3 rounded-xl bg-white/5 ${iconColorMap[stat.color]}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#141417] rounded-2xl border border-white/5 p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Affiliate Tiers</h2>
          <div className="space-y-4">
            {Object.entries(stats.tierBreakdown).map(([tier, count]) => (
              <div key={tier} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${
                    tier === "bronze" ? "bg-amber-500" :
                    tier === "silver" ? "bg-gray-400" :
                    tier === "gold" ? "bg-yellow-500" :
                    "bg-indigo-500"
                  }`} />
                  <span className="text-gray-300 capitalize">{tier}</span>
                </div>
                <span className="text-white font-medium">{count as number} affiliates</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#141417] rounded-2xl border border-white/5 p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Affiliate Status</h2>
          <div className="space-y-4">
            {Object.entries(stats.affiliateStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${
                    status === "pending" ? "bg-yellow-500" :
                    status === "approved" ? "bg-green-500" :
                    status === "rejected" ? "bg-red-500" :
                    status === "suspended" ? "bg-orange-500" :
                    "bg-gray-500"
                  }`} />
                  <span className="text-gray-300 capitalize">{status}</span>
                </div>
                <span className="text-white font-medium">{count as number}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
