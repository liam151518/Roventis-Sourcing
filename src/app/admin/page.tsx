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
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";

const statCards = [
  { label: "Total Affiliates", key: "totalAffiliates", icon: Users },
  { label: "Total Sales", key: "totalSales", icon: TrendingUp },
  { label: "Total Commission", key: "totalCommission", icon: DollarSign },
  { label: "Pending Commission", key: "pendingCommission", icon: Activity },
  { label: "Total Deals", key: "totalDeals", icon: ShoppingCart },
  { label: "Active Orders", key: "activeOrders", icon: Package },
  { label: "Open Tickets", key: "openTickets", icon: Ticket },
  { label: "Resources", key: "totalResources", icon: FileText },
];

export default function AdminOverviewPage() {
  const stats = useQuery(api.admin.getAdminDashboardStats);

  if (!stats) {
    return (
      <div className="space-y-6">
        <SkeletonBlock className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rs-page-header">
        <div>
          <span className="rs-overline">Roventis Sourcing</span>
          <h1 className="rs-page-title mt-1">Admin Overview</h1>
          <p className="rs-page-subtitle">Live metrics across all affiliates and operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
            className="rs-card p-5 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-lg bg-[var(--rs-accent-soft)] border border-violet-500/15 flex items-center justify-center group-hover:border-violet-500/30 transition-colors">
                <stat.icon className="w-4 h-4 text-violet-400" />
              </div>
              <span className="text-[11px] font-medium" style={{ color: 'var(--rs-text-muted)' }}>—</span>
            </div>
            <p className="text-xs font-medium tracking-wide mb-1" style={{ color: 'var(--rs-text-secondary)' }}>
              {stat.label}
            </p>
            <p className="rs-stat text-2xl font-semibold" style={{ color: 'var(--rs-text-primary)' }}>
              {stat.key.includes("Sales") || stat.key.includes("Commission") ? (
                <AnimatedNumber value={(stats as any)[stat.key] || 0} formatter={formatCurrency} />
              ) : (
                <AnimatedNumber value={(stats as any)[stat.key] || 0} formatter={(v) => v.toLocaleString()} />
              )}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="rs-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {(stats as any).recentActivity?.slice(0, 5).map((activity: any, i: number) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-violet-500" />
                <span className="text-slate-400">{activity.message}</span>
                <span className="ml-auto text-xs text-slate-600">{activity.time}</span>
              </div>
            )) || <p className="text-slate-500 text-sm">No recent activity</p>}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="rs-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Top Affiliates</h3>
          <div className="space-y-4">
            {(stats as any).topAffiliates?.slice(0, 5).map((affiliate: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-medium">
                    {i + 1}
                  </span>
                  <span className="text-slate-300 text-sm">{affiliate.name}</span>
                </div>
                <span className="text-slate-400 text-sm font-mono">{formatCurrency(affiliate.commission)}</span>
              </div>
            )) || <p className="text-slate-500 text-sm">No affiliates yet</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}