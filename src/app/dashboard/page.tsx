"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Target,
  Award,
  Clock,
  ChevronRight,
  Play,
  Zap,
  MousePointer,
  CircleDollarSign,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatCurrency } from "@/lib/utils";
import { isAdmin } from "@/lib/admin";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#ef4444"];

export default function DashboardPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const currentAffiliate = useQuery(
    api.affiliates.getCurrentAffiliate,
    { clerkUserId: userId || undefined }
  );
  const deals = useQuery(api.deals.getAllDeals);
  const modules = useQuery(api.training.getTrainingModules);
  const payouts = useQuery(api.commissions.getAllPayouts);
  const [timeRange, setTimeRange] = useState("month");

  const userEmail = useMemo(() => {
    if (!user) return "";
    return (
      user.emailAddresses?.[0]?.emailAddress ||
      (user as any).primaryEmailAddress?.emailAddress ||
      ""
    );
  }, [user]);

  const isAdminUser = useMemo(() => {
    if (!userId) return false;
    return isAdmin(user, userEmail);
  }, [userId, user, userEmail]);

  useEffect(() => {
    if (isLoaded && isAdminUser) {
      router.push("/admin");
    }
  }, [isLoaded, isAdminUser, router]);

  const userDeals = (deals || []).filter(
    (d) => currentAffiliate && d.affiliateId === currentAffiliate._id
  );
  const userPayouts = (payouts || []).filter(
    (p) => currentAffiliate && p.affiliateId === currentAffiliate._id
  );

  const closedWon = userDeals.filter((d) => d.status === "closed_won");
  const calculatedTotalSales = closedWon.reduce((sum, d) => sum + d.dealValue, 0);
  const calculatedTotalEarnings = closedWon.reduce(
    (sum, d) => sum + d.commissionAmount,
    0
  );
  const calculatedPending = closedWon
    .filter((d) => d.commissionStatus === "pending")
    .reduce((sum, d) => sum + d.commissionAmount, 0);

  const totalPaid = userPayouts
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const activeDeals = userDeals.filter(
    (d) => !["closed_won", "closed_lost"].includes(d.status)
  );
  const conversionRate =
    userDeals.length > 0 ? Math.round((closedWon.length / userDeals.length) * 100) : 0;

  const pipelineValue = activeDeals.reduce((sum, d) => sum + d.dealValue, 0);
  const weightedPipeline = activeDeals.reduce((sum, d) => {
    const stageWeight =
      d.status === "prospect"
        ? 0.1
        : d.status === "qualified"
          ? 0.3
          : d.status === "proposal_sent"
            ? 0.5
            : d.status === "negotiation"
              ? 0.75
              : 0;
    return sum + d.dealValue * stageWeight;
  }, 0);

  const getChartData = () => {
    const data = [];
    const now = new Date();

    if (timeRange === "week") {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString("en-US", { weekday: "short" });
        const dayDeals = userDeals.filter(
          (d) => new Date(d.createdAt).toDateString() === date.toDateString()
        );
        const closedThatDay = dayDeals.filter((d) => d.status === "closed_won");
        data.push({
          period: dateStr,
          revenue: closedThatDay.reduce((sum, d) => sum + d.dealValue, 0),
          commission: closedThatDay.reduce((sum, d) => sum + d.commissionAmount, 0),
          deals: dayDeals.length,
        });
      }
    } else if (timeRange === "month") {
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = month.toLocaleDateString("en-US", { month: "short" });
        const monthDeals = userDeals.filter((d) => {
          const dealDate = new Date(d.createdAt);
          return (
            dealDate.getMonth() === month.getMonth() &&
            dealDate.getFullYear() === month.getFullYear()
          );
        });
        const closedThisMonth = monthDeals.filter((d) => d.status === "closed_won");
        data.push({
          period: monthName,
          revenue: closedThisMonth.reduce((sum, d) => sum + d.dealValue, 0),
          commission: closedThisMonth.reduce((sum, d) => sum + d.commissionAmount, 0),
          deals: monthDeals.length,
        });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = month.toLocaleDateString("en-US", { month: "short" });
        const monthDeals = userDeals.filter((d) => {
          const dealDate = new Date(d.createdAt);
          return (
            dealDate.getMonth() === month.getMonth() &&
            dealDate.getFullYear() === month.getFullYear()
          );
        });
        const closedThisMonth = monthDeals.filter((d) => d.status === "closed_won");
        data.push({
          period: monthName,
          revenue: closedThisMonth.reduce((sum, d) => sum + d.dealValue, 0),
          commission: closedThisMonth.reduce((sum, d) => sum + d.commissionAmount, 0),
          deals: monthDeals.length,
        });
      }
    }

    return data;
  };

  const chartData = getChartData();

  const stageData = [
    { name: "Prospect", value: userDeals.filter((d) => d.status === "prospect").length },
    { name: "Qualified", value: userDeals.filter((d) => d.status === "qualified").length },
    { name: "Proposal", value: userDeals.filter((d) => d.status === "proposal_sent").length },
    { name: "Negotiation", value: userDeals.filter((d) => d.status === "negotiation").length },
    { name: "Closed Won", value: userDeals.filter((d) => d.status === "closed_won").length },
    { name: "Closed Lost", value: userDeals.filter((d) => d.status === "closed_lost").length },
  ].filter((d) => d.value > 0);

  const avgDealSize =
    closedWon.length > 0
      ? closedWon.reduce((sum, d) => sum + d.dealValue, 0) / closedWon.length
      : 0;
  const avgCloseRate = userDeals.length > 0 ? closedWon.length / userDeals.length : 0;
  const forecast3Month = weightedPipeline * avgCloseRate * 3;
  const forecast12Month = weightedPipeline * avgCloseRate * 12;

  // Loading state
  if (
    currentAffiliate === null ||
    deals === null ||
    modules === null ||
    payouts === null
  ) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-8 w-64" />
            <SkeletonBlock className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
        </div>
        <SkeletonBlock className="h-72" />
      </div>
    );
  }

  if (!currentAffiliate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="rs-empty-state">
          <div className="rs-empty-state-icon">
            <Target className="w-5 h-5" />
          </div>
          <div className="rs-empty-state-title">No affiliate account found</div>
          <div className="rs-empty-state-description">
            Apply to start earning commissions.
          </div>
          <Link href="/apply" className="rs-btn-primary mt-2">
            Apply Now
          </Link>
        </div>
      </div>
    );
  }

  const totalPending = calculatedPending || currentAffiliate.pendingCommission || 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="rounded-lg p-3 shadow-2xl"
          style={{
            background: "var(--rs-bg-raised)",
            border: "1px solid var(--rs-border)",
          }}
        >
          <p className="text-xs mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-xs font-medium text-white"
              style={{ color: entry.color }}
            >
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const stats: Array<{
    label: string;
    value: number;
    change: number;
    changeLabel: string;
    icon: typeof TrendingUp;
    iconClass: "accent" | "success" | "info" | "warning";
    link: string;
  }> = [
    {
      label: "Total Earnings",
      value: calculatedTotalEarnings,
      change: closedWon
        .filter((d) => {
          const closed = new Date(d.actualCloseDate || d.createdAt);
          const now = new Date();
          return (
            closed.getMonth() === now.getMonth() &&
            closed.getFullYear() === now.getFullYear()
          );
        })
        .reduce((sum, d) => sum + d.commissionAmount, 0),
      changeLabel: "This month",
      icon: DollarSign,
      iconClass: "success",
      link: "/dashboard/commissions",
    },
    {
      label: "Total Sales",
      value: calculatedTotalSales,
      change: closedWon
        .filter((d) => {
          const closed = new Date(d.actualCloseDate || d.createdAt);
          const now = new Date();
          return (
            closed.getMonth() === now.getMonth() &&
            closed.getFullYear() === now.getFullYear()
          );
        })
        .reduce((sum, d) => sum + d.dealValue, 0),
      changeLabel: "This month",
      icon: TrendingUp,
      iconClass: "info",
      link: "/dashboard/deals",
    },
    {
      label: "Pipeline Value",
      value: pipelineValue,
      change: activeDeals.length,
      changeLabel: "Active deals",
      icon: Target,
      iconClass: "accent",
      link: "/dashboard/deals",
    },
    {
      label: "Avg Deal Size",
      value: avgDealSize || 0,
      change: avgCloseRate * 100,
      changeLabel: `${conversionRate}% win rate`,
      icon: Award,
      iconClass: "warning",
      link: "/dashboard/deals",
    },
  ];

  return (
    <div className="space-y-8">
      {/* ===== HEADER ===== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
      >
        <div>
          <span className="rs-overline">Overview</span>
          <h1 className="rs-page-title text-2xl md:text-[28px] mt-1">
            Welcome back, {currentAffiliate.firstName}
          </h1>
          <p className="rs-page-subtitle">
            Here&apos;s what&apos;s happening with your affiliate business today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentAffiliate.affiliateCode && (
            <code
              className="px-3 py-2 rounded-lg text-xs font-mono"
              style={{
                background: "var(--rs-bg-overlay)",
                border: "1px solid var(--rs-border)",
                color: "var(--rs-text-secondary)",
              }}
            >
              <span style={{ color: "var(--rs-text-muted)" }}>Code:</span>{" "}
              <span className="text-white">{currentAffiliate.affiliateCode}</span>
            </code>
          )}
          <Link href="/dashboard/deals" className="rs-btn-primary">
            <Briefcase className="w-3.5 h-3.5" />
            New Deal
          </Link>
        </div>
      </motion.div>

      {/* ===== STATS GRID ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change > 0;
          return (
            <Link href={stat.link} key={stat.label}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: "easeOut",
                }}
                className="rs-card p-5 hover:border-[var(--rs-border-hover)] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`rs-icon-tile rs-icon-tile--${stat.iconClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {stat.change > 0 && (
                    <div
                      className="flex items-center gap-0.5 text-[10px] font-medium"
                      style={{
                        color: isPositive ? "var(--rs-success)" : "var(--rs-danger)",
                      }}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {Math.abs(Math.round((stat.change / Math.max(stat.value, 1)) * 100))}%
                    </div>
                  )}
                </div>
                <div
                  className="text-2xl font-semibold rs-stat"
                  style={{ color: "var(--rs-text-primary)" }}
                >
                  <AnimatedNumber value={stat.value} formatter={formatCurrency} />
                </div>
                <div
                  className="text-xs mt-1"
                  style={{ color: "var(--rs-text-secondary)" }}
                >
                  {stat.label}
                </div>
                <div
                  className="text-[10px] mt-0.5"
                  style={{ color: "var(--rs-text-muted)" }}
                >
                  {stat.changeLabel}
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* ===== CHARTS ROW ===== */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rs-card lg:col-span-2 overflow-hidden"
        >
          <div className="rs-section-header">
            <div>
              <div className="rs-section-header-title">Revenue Overview</div>
              <div className="rs-section-header-description">
                Monthly revenue and commission trends
              </div>
            </div>
            <div className="rs-segmented">
              {["week", "month", "year"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`rs-segmented-item ${
                    timeRange === range ? "rs-segmented-item--active" : ""
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 px-4 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="period"
                  tick={{ fill: "var(--rs-text-muted)", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--rs-text-muted)", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
                  tickLine={false}
                  tickFormatter={(value) =>
                    formatCurrency(value as number).replace(/\.00$/, "")
                  }
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(124,58,237,0.2)" }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="commission"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCommission)"
                  name="Commission"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Deal Stages Donut */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rs-card overflow-hidden"
        >
          <div className="rs-section-header">
            <div>
              <div className="rs-section-header-title">Pipeline Stages</div>
              <div className="rs-section-header-description">
                {userDeals.length} total deals
              </div>
            </div>
          </div>

          {stageData.length === 0 ? (
            <div className="rs-empty-state">
              <div className="rs-empty-state-icon">
                <Target className="w-5 h-5" />
              </div>
              <div className="rs-empty-state-title">No deals yet</div>
              <div className="rs-empty-state-description">
                Close your first deal to see your pipeline breakdown.
              </div>
            </div>
          ) : (
            <>
              <div className="relative h-44 px-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={56}
                      outerRadius={78}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="var(--rs-bg-raised)"
                      strokeWidth={2}
                    >
                      {stageData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p
                      className="text-2xl font-semibold rs-stat"
                      style={{ color: "var(--rs-text-primary)" }}
                    >
                      {activeDeals.length}
                    </p>
                    <p
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: "var(--rs-text-muted)" }}
                    >
                      Active
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4 space-y-1.5">
                {stageData.map((entry, index) => {
                  const total = userDeals.length;
                  const pct =
                    total > 0 ? Math.round((entry.value / total) * 100) : 0;
                  return (
                    <div
                      key={entry.name}
                      className="flex items-center gap-2.5 py-1"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          background: COLORS[index % COLORS.length],
                        }}
                      />
                      <span
                        className="text-xs flex-1 truncate"
                        style={{ color: "var(--rs-text-secondary)" }}
                      >
                        {entry.name}
                      </span>
                      <span
                        className="text-xs font-medium rs-stat"
                        style={{ color: "var(--rs-text-primary)" }}
                      >
                        {entry.value}
                      </span>
                      <span
                        className="text-[10px] w-8 text-right"
                        style={{ color: "var(--rs-text-muted)" }}
                      >
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* ===== MIDDLE ROW: Forecast + Quick Stats + Tier ===== */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rs-card p-5"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="rs-icon-tile rs-icon-tile--info">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Forecast</div>
              <div
                className="text-[11px]"
                style={{ color: "var(--rs-text-muted)" }}
              >
                Based on current pipeline
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div
              className="p-4 rounded-xl"
              style={{
                background: "var(--rs-bg-base)",
                border: "1px solid var(--rs-border)",
              }}
            >
              <div
                className="text-[11px] mb-1"
                style={{ color: "var(--rs-text-secondary)" }}
              >
                Next 3 months
              </div>
              <div className="text-xl font-semibold text-white rs-stat">
                {formatCurrency(forecast3Month)}
              </div>
            </div>
            <div
              className="p-4 rounded-xl"
              style={{
                background: "var(--rs-bg-base)",
                border: "1px solid var(--rs-border)",
              }}
            >
              <div
                className="text-[11px] mb-1"
                style={{ color: "var(--rs-text-secondary)" }}
              >
                Next 12 months
              </div>
              <div className="text-xl font-semibold text-white rs-stat">
                {formatCurrency(forecast12Month)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats list */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rs-card p-5"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="rs-icon-tile">
              <CircleDollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Quick Stats</div>
              <div
                className="text-[11px]"
                style={{ color: "var(--rs-text-muted)" }}
              >
                At a glance
              </div>
            </div>
          </div>
          <div className="space-y-1">
            {[
              {
                label: "Active Deals",
                value: activeDeals.length,
                icon: Target,
                iconClass: "accent",
              },
              {
                label: "Closed Won",
                value: closedWon.length,
                icon: Award,
                iconClass: "success",
              },
              {
                label: "Pending",
                value: formatCurrency(totalPending),
                icon: Clock,
                iconClass: "warning",
                raw: true,
              },
              {
                label: "Win Rate",
                value: `${conversionRate}%`,
                icon: Zap,
                iconClass: "info",
                raw: true,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between p-2.5 rounded-lg transition-colors"
                style={{ background: "var(--rs-bg-base)" }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`rs-icon-tile rs-icon-tile--sm rs-icon-tile--${
                      row.iconClass === "accent" ? "accent" : row.iconClass
                    }`}
                  >
                    <row.icon className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className="text-xs"
                    style={{ color: "var(--rs-text-secondary)" }}
                  >
                    {row.label}
                  </span>
                </div>
                <span className="text-sm font-semibold text-white rs-stat">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tier Progress */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rs-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="rs-icon-tile rs-icon-tile--warning">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  Tier Progress
                </div>
                <div
                  className="text-[11px]"
                  style={{ color: "var(--rs-text-muted)" }}
                >
                  Current: {currentAffiliate.tier?.toUpperCase() ?? "BRONZE"}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--rs-text-secondary)" }}
                >
                  Gold
                </span>
                <span className="text-xs font-semibold text-white rs-stat">
                  {Math.min(
                    100,
                    Math.round((currentAffiliate.totalSales / 150000) * 100)
                  )}
                  %
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: "var(--rs-bg-base)" }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      100,
                      (currentAffiliate.totalSales / 150000) * 100
                    )}%`,
                  }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, #f59e0b, #eab308)",
                  }}
                />
              </div>
              <div
                className="text-[10px] mt-1.5"
                style={{ color: "var(--rs-text-muted)" }}
              >
                {formatCurrency(currentAffiliate.totalSales)} of R150,000
              </div>
            </div>
            <div
              className="p-3 rounded-xl"
              style={{
                background: "var(--rs-accent-soft)",
                border: "1px solid rgba(124,58,237,0.20)",
              }}
            >
              <div
                className="text-xs font-semibold"
                style={{ color: "var(--rs-text-accent)" }}
              >
                R150,000 to Gold
              </div>
              <div
                className="text-[11px] mt-0.5"
                style={{ color: "var(--rs-text-secondary)" }}
              >
                Unlock 15% commission rate
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== RECENT DEALS + QUICK ACTIONS ===== */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Deals - spans 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rs-card overflow-hidden lg:col-span-2"
        >
          <div className="rs-section-header">
            <div>
              <div className="rs-section-header-title">Recent Deals</div>
              <div
                className="rs-section-header-description"
              >
                Your latest activity
              </div>
            </div>
            <Link
              href="/dashboard/deals"
              className="text-xs flex items-center gap-1 transition-colors"
              style={{ color: "var(--rs-text-accent)" }}
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {userDeals.length === 0 ? (
            <div className="rs-empty-state">
              <div className="rs-empty-state-icon">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="rs-empty-state-title">No deals yet</div>
              <div className="rs-empty-state-description">
                Create your first deal to start tracking your pipeline.
              </div>
              <Link href="/dashboard/deals" className="rs-btn-primary mt-1">
                <Briefcase className="w-3.5 h-3.5" />
                Create Deal
              </Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--rs-border)" }}>
              {userDeals.slice(0, 5).map((deal) => {
                const statusConfig = {
                  closed_won: { label: "Won", cls: "rs-status-pill--success" },
                  closed_lost: { label: "Lost", cls: "rs-status-pill--danger" },
                  negotiation: { label: "Negotiation", cls: "rs-status-pill--warning" },
                };
                const cfg = statusConfig[deal.status as keyof typeof statusConfig] ?? {
                  label: deal.status.replace("_", " "),
                  cls: "rs-status-pill--progress",
                };
                return (
                  <Link
                    href={`/dashboard/deals`}
                    key={deal._id}
                    className="flex items-center justify-between p-4 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center font-medium text-sm flex-shrink-0"
                        style={{
                          background: "var(--rs-bg-overlay)",
                          border: "1px solid var(--rs-border)",
                          color: "var(--rs-text-primary)",
                        }}
                      >
                        {deal.clientName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {deal.clientName}
                        </div>
                        <div
                          className="text-[11px] truncate"
                          style={{ color: "var(--rs-text-muted)" }}
                        >
                          {deal.clientCompany || "No company"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span
                        className="text-sm font-semibold rs-stat text-white"
                      >
                        {formatCurrency(deal.dealValue)}
                      </span>
                      <span className={`rs-status-pill ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rs-card p-5"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="rs-icon-tile rs-icon-tile--accent">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Quick Actions</div>
              <div
                className="text-[11px]"
                style={{ color: "var(--rs-text-muted)" }}
              >
                Jump to common tasks
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                href: "/dashboard/deals",
                label: "New Deal",
                icon: Briefcase,
                desc: "Track opportunity",
              },
              {
                href: "/dashboard/leads",
                label: "Leads",
                icon: Target,
                desc: "Browse pool",
              },
              {
                href: "/dashboard/marketing",
                label: "Advisor",
                icon: Sparkles,
                desc: "Early access",
              },
              {
                href: "/dashboard/training",
                label: "Training",
                icon: Play,
                desc: "Continue",
              },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="rs-card-inner p-3 flex flex-col items-start gap-2 transition-colors"
              >
                <action.icon
                  className="w-4 h-4"
                  style={{ color: "var(--rs-text-accent)" }}
                />
                <div>
                  <div className="text-xs font-medium text-white">
                    {action.label}
                  </div>
                  <div
                    className="text-[10px]"
                    style={{ color: "var(--rs-text-muted)" }}
                  >
                    {action.desc}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
