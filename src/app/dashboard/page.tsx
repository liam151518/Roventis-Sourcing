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
  Calendar,
  Eye,
  MousePointer
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
  BarChart,
  Bar,
  Legend
} from "recharts";

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

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

  // Check if user is admin - using useMemo for stability
  const userEmail = useMemo(() => {
    if (!user) return "";
    return user.emailAddresses?.[0]?.emailAddress || 
           (user as any).primaryEmailAddress?.emailAddress ||
           "";
  }, [user]);

  const isAdminUser = useMemo(() => {
    if (!userId) return false;
    return isAdmin(user, userEmail);
  }, [userId, user, userEmail]);

  // Redirect admins to admin dashboard - but only after auth is loaded
  useEffect(() => {
    if (isLoaded && isAdminUser) {
      router.push("/admin");
    }
  }, [isLoaded, isAdminUser, router]);
  
  // All hooks must be called before any early returns
  // Filter deals for current user (safe to do with null checks)
  const userDeals = (deals || []).filter(d => currentAffiliate && d.affiliateId === currentAffiliate._id);
  const userPayouts = (payouts || []).filter(p => currentAffiliate && p.affiliateId === currentAffiliate._id);
  
  // Calculate totals directly from deals for accuracy
  const closedWon = userDeals.filter(d => d.status === "closed_won");
  const calculatedTotalSales = closedWon.reduce((sum, d) => sum + d.dealValue, 0);
  const calculatedTotalEarnings = closedWon.reduce((sum, d) => sum + d.commissionAmount, 0);
  const calculatedPending = closedWon.filter(d => d.commissionStatus === "pending").reduce((sum, d) => sum + d.commissionAmount, 0);
  
  const totalPaid = userPayouts.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const activeDeals = userDeals.filter(d => !["closed_won", "closed_lost"].includes(d.status));
  const conversionRate = userDeals.length > 0 ? Math.round((closedWon.length / userDeals.length) * 100) : 0;

  // Calculate pipeline value
  const pipelineValue = activeDeals.reduce((sum, d) => sum + d.dealValue, 0);
  const weightedPipeline = activeDeals.reduce((sum, d) => {
    const stageWeight = d.status === "prospect" ? 0.1 : 
                       d.status === "qualified" ? 0.3 : 
                       d.status === "proposal_sent" ? 0.5 : 
                       d.status === "negotiation" ? 0.75 : 0;
    return sum + (d.dealValue * stageWeight);
  }, 0);

  // Generate data for chart based on time range (useMemo without the hook - just regular function)
  const getChartData = () => {
    const data = [];
    const now = new Date();
    
    if (timeRange === 'week') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayDeals = userDeals.filter(d => {
          const dealDate = new Date(d.createdAt);
          return dealDate.toDateString() === date.toDateString();
        });
        const closedThatDay = dayDeals.filter(d => d.status === "closed_won");
        data.push({
          period: dateStr,
          revenue: closedThatDay.reduce((sum, d) => sum + d.dealValue, 0),
          commission: closedThatDay.reduce((sum, d) => sum + d.commissionAmount, 0),
          deals: dayDeals.length,
        });
      }
    } else if (timeRange === 'month') {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = month.toLocaleDateString('en-US', { month: 'short' });
        const monthDeals = userDeals.filter(d => {
          const dealDate = new Date(d.createdAt);
          return dealDate.getMonth() === month.getMonth() && dealDate.getFullYear() === month.getFullYear();
        });
        const closedThisMonth = monthDeals.filter(d => d.status === "closed_won");
        data.push({
          period: monthName,
          revenue: closedThisMonth.reduce((sum, d) => sum + d.dealValue, 0),
          commission: closedThisMonth.reduce((sum, d) => sum + d.commissionAmount, 0),
          deals: monthDeals.length,
        });
      }
    } else {
      // Last 12 months (year view)
      for (let i = 11; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = month.toLocaleDateString('en-US', { month: 'short' });
        const monthDeals = userDeals.filter(d => {
          const dealDate = new Date(d.createdAt);
          return dealDate.getMonth() === month.getMonth() && dealDate.getFullYear() === month.getFullYear();
        });
        const closedThisMonth = monthDeals.filter(d => d.status === "closed_won");
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

  // Pie chart data for deal stages
  const stageData = [
    { name: 'Prospect', value: userDeals.filter(d => d.status === "prospect").length },
    { name: 'Qualified', value: userDeals.filter(d => d.status === "qualified").length },
    { name: 'Proposal', value: userDeals.filter(d => d.status === "proposal_sent").length },
    { name: 'Negotiation', value: userDeals.filter(d => d.status === "negotiation").length },
    { name: 'Closed Won', value: userDeals.filter(d => d.status === "closed_won").length },
    { name: 'Closed Lost', value: userDeals.filter(d => d.status === "closed_lost").length },
  ].filter(d => d.value > 0);

  // Forecast calculation
  const avgDealSize = closedWon.length > 0 
    ? closedWon.reduce((sum, d) => sum + d.dealValue, 0) / closedWon.length 
    : 0;
  const avgCloseRate = userDeals.length > 0 ? closedWon.length / userDeals.length : 0;
  const forecast3Month = weightedPipeline * avgCloseRate * 3;
  const forecast12Month = weightedPipeline * avgCloseRate * 12;

  // Now we can do early returns after all hooks
  // Loading state
  if (currentAffiliate === null || deals === null || modules === null || payouts === null) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-8 w-64" />
            <SkeletonBlock className="h-4 w-96" />
          </div>
        </div>
        {/* Stats grid skeleton - 4 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-32" />
        </div>
        {/* Chart skeleton */}
        <SkeletonBlock className="h-80" />
      </div>
    );
  }

  if (!currentAffiliate) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No affiliate account found.</p>
          <Link href="/apply" className="btn-primary">Apply Now</Link>
        </div>
      </div>
    );
  }
  
  const totalPending = calculatedPending || currentAffiliate.pendingCommission || 0;

  // Tier progress
  const tierProgress = {
    bronze: { current: 0, target: 1, color: '#ea580c' },
    silver: { current: 0, target: 1, color: '#94a3b8' },
    gold: { current: currentAffiliate.totalSales, target: 150000, color: '#eab308' },
    platinum: { current: currentAffiliate.totalSales, target: 500000, color: '#a855f7' },
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a1d]/95 backdrop-blur-sm border border-white/10 rounded-xl p-3 shadow-2xl shadow-black/40">
          <p className="text-gray-400 text-sm mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-white font-medium" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <span className="rs-overline">Dashboard</span>
          <h1 className="rs-page-title mt-1">
            Welcome back, {currentAffiliate.firstName}
          </h1>
          <p className="rs-page-subtitle">
            Here&apos;s what&apos;s happening with your affiliate business today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#141417] rounded-xl border border-white/5">
            <span className="text-sm text-gray-400">Your Code:</span>
            <code className="text-sm font-mono text-blue-400">{currentAffiliate.affiliateCode}</code>
          </div>
          <Link
            href="/dashboard/deals"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Briefcase className="w-4 h-4" />
            New Deal
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Earnings",
            value: calculatedTotalEarnings,
            change: closedWon.filter(d => {
              const closed = new Date(d.actualCloseDate || d.createdAt);
              const now = new Date();
              return closed.getMonth() === now.getMonth() && closed.getFullYear() === now.getFullYear();
            }).reduce((sum, d) => sum + d.commissionAmount, 0),
            changeLabel: "This month",
            icon: DollarSign,
            color: "from-emerald-500 to-teal-600",
            bgColor: "bg-emerald-500/10",
            iconColor: "text-emerald-400",
            link: "/dashboard/commissions"
          },
          {
            label: "Total Sales",
            value: calculatedTotalSales,
            change: closedWon.filter(d => {
              const closed = new Date(d.actualCloseDate || d.createdAt);
              const now = new Date();
              return closed.getMonth() === now.getMonth() && closed.getFullYear() === now.getFullYear();
            }).reduce((sum, d) => sum + d.dealValue, 0),
            changeLabel: "This month",
            icon: TrendingUp,
            color: "from-blue-500 to-indigo-600",
            bgColor: "bg-blue-500/10",
            iconColor: "text-blue-400",
            link: "/dashboard/deals"
          },
          {
            label: "Pipeline Value",
            value: pipelineValue,
            change: activeDeals.length,
            changeLabel: "Active deals",
            icon: Target,
            color: "from-purple-500 to-pink-600",
            bgColor: "bg-purple-500/10",
            iconColor: "text-purple-400",
            link: "/dashboard/deals"
          },
          {
            label: "Avg Deal Size",
            value: avgDealSize || 0,
            change: avgCloseRate * 100,
            changeLabel: "Win rate",
            suffix: "%",
            icon: Award,
            color: "from-amber-500 to-orange-600",
            bgColor: "bg-amber-500/10",
            iconColor: "text-amber-400",
            link: "/dashboard/deals"
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change > 0;
          const changePercent = typeof stat.change === 'number' && stat.value > 0 
            ? Math.abs(Math.round((stat.change / stat.value) * 100)) 
            : 0;
          
          return (
            <Link href={stat.link} key={stat.label}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08, ease: "easeOut" }}
                className="group relative overflow-hidden bg-[#141417] rounded-2xl border border-white/5 p-6 hover:border-white/10 cursor-pointer"
              >
                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-15 transition-opacity duration-300`} />
                
                {/* Header */}
                <div className="flex items-center justify-between relative">
                  <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}>
                    <Icon className={`w-7 h-7 ${stat.iconColor}`} />
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full">
                    {typeof stat.change === 'number' && stat.change !== 0 ? (
                      <>
                        {isPositive ? (
                          <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-red-400" />
                        )}
                        <span className={`text-xs font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                          {stat.suffix ? `${changePercent}${stat.suffix}` : `${changePercent}%`}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500">--</span>
                    )}
                  </div>
                </div>

                {/* Value */}
                <div className="mt-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">
                      {typeof stat.value === 'number' ? (
                        <AnimatedNumber value={stat.value} formatter={formatCurrency} />
                      ) : stat.value}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-medium text-gray-300">{stat.label}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{stat.changeLabel}</span>
                  <div className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-white transition-colors">
                    <span>View</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>

                {/* Progress line at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-[#141417] rounded-2xl border border-white/5 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight">Revenue Overview</h2>
              <p className="text-sm text-gray-500 mt-1">Monthly revenue and commission trends</p>
            </div>
            <div className="flex items-center gap-2">
              {['week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === range 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="period" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.05)" }} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.05)" }} tickLine={false} tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
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

        {/* Deal Stages Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rs-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight">Deal Stages</h2>
              <p className="text-sm text-gray-500 mt-1">Your pipeline at a glance</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{userDeals.length}</p>
              <p className="text-xs text-gray-500">Total Deals</p>
            </div>
          </div>
          
          {/* Enhanced Pie Chart */}
          <div className="relative h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="#0a0a0b"
                  strokeWidth={2}
                >
                  {stageData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      className="transition-all hover:opacity-80"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const total = userDeals.length;
                      const percentage = ((data.value / total) * 100).toFixed(1);
                      return (
                        <div className="bg-[#1a1a1d] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
                          <p className="text-white font-medium">{data.name}</p>
                          <p className="text-gray-400 text-sm">{data.value} deals ({percentage}%)</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Stats */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{activeDeals.length}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
            </div>
          </div>

          {/* Enhanced Legend */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {stageData.map((entry, index) => {
              const total = userDeals.length;
              const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0;
              return (
                <div 
                  key={entry.name} 
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-300 truncate">{entry.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{entry.value}</p>
                    <p className="text-xs text-gray-500">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Stage Progress Bar */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex h-2 rounded-full overflow-hidden bg-[#0a0a0b]">
              {stageData.map((entry, index) => {
                const total = userDeals.length;
                const percentage = total > 0 ? (entry.value / total) * 100 : 0;
                return (
                  <div
                    key={entry.name}
                    className="h-full transition-all hover:opacity-80"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Forecast & Pipeline */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl border border-blue-500/20 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold tracking-tight">Forecast</h3>
              <p className="text-xs text-gray-400">Based on current pipeline</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-[#0a0a0b] rounded-xl">
              <p className="text-gray-400 text-sm">Next 3 Months</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(forecast3Month)}</p>
              <p className="text-xs text-gray-500 mt-1">Estimated commission</p>
            </div>
            <div className="p-4 bg-[#0a0a0b] rounded-xl">
              <p className="text-gray-400 text-sm">Next 12 Months</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(forecast12Month)}</p>
              <p className="text-xs text-gray-500 mt-1">Estimated commission</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rs-card p-6"
        >
          <h3 className="text-white font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-gray-400 text-sm">Active Deals</span>
              </div>
              <span className="text-white font-semibold">{activeDeals.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-gray-400 text-sm">Closed Won</span>
              </div>
              <span className="text-white font-semibold">{closedWon.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-gray-400 text-sm">Pending</span>
              </div>
              <span className="text-white font-semibold">{formatCurrency(totalPending)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-gray-400 text-sm">Conversion</span>
              </div>
              <span className="text-white font-semibold">{conversionRate}%</span>
            </div>
          </div>
        </motion.div>

        {/* Tier Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rs-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold tracking-tight">Tier Progress</h3>
            <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full font-medium">{currentAffiliate.tier.toUpperCase()}</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">Gold Progress</span>
                <span className="text-white">{Math.min(100, Math.round((currentAffiliate.totalSales / 150000) * 100))}%</span>
              </div>
              <div className="h-2 bg-[#0a0a0b] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (currentAffiliate.totalSales / 150000) * 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full" 
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatCurrency(currentAffiliate.totalSales)} / R150,000</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl border border-amber-500/20">
              <p className="text-amber-400 text-sm font-medium">R150,000 to Gold</p>
              <p className="text-gray-400 text-xs mt-1">Unlock 15% commission rate</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Deals & Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Deals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-[#141417] rounded-2xl border border-white/5 overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <h2 className="text-lg font-semibold text-white tracking-tight">Recent Deals</h2>
            <Link href="/dashboard/deals" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {userDeals.slice(0, 5).map((deal) => (
              <div key={deal._id} className="p-4 hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium">
                      {deal.clientName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{deal.clientName}</p>
                      <p className="text-sm text-gray-500">{deal.clientCompany || "No company"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{formatCurrency(deal.dealValue)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      deal.status === "closed_won" ? "bg-emerald-500/10 text-emerald-400" :
                      deal.status === "closed_lost" ? "bg-red-500/10 text-red-400" :
                      deal.status === "negotiation" ? "bg-orange-500/10 text-orange-400" :
                      "bg-blue-500/10 text-blue-400"
                    }`}>
                      {deal.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {userDeals.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No deals yet. <Link href="/dashboard/deals" className="text-blue-400">Create your first deal</Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="space-y-4"
        >
          {/* Resources */}
          <div className="rs-card p-6">
            <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/deals" className="flex items-center gap-3 p-4 rs-card-inner hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[var(--rs-accent-soft)] flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">New Deal</p>
                  <p className="text-gray-500 text-xs">Create opportunity</p>
                </div>
              </Link>
              <Link href="/dashboard/resources" className="flex items-center gap-3 p-4 rs-card-inner hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[var(--rs-accent-soft)] flex items-center justify-center">
                  <Users className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Resources</p>
                  <p className="text-gray-500 text-xs">View materials</p>
                </div>
              </Link>
              <Link href="/dashboard/marketing" className="flex items-center gap-3 p-4 rs-card-inner hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[var(--rs-accent-soft)] flex items-center justify-center">
                  <MousePointer className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Marketing</p>
                  <p className="text-gray-500 text-xs">Get links</p>
                </div>
              </Link>
              <Link href="/dashboard/training" className="flex items-center gap-3 p-4 rs-card-inner hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[var(--rs-accent-soft)] flex items-center justify-center">
                  <Play className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Training</p>
                  <p className="text-gray-500 text-xs">Learn more</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Performance This Month */}
          <div className="rs-card p-6">
            <h3 className="text-white font-semibold mb-4">This Month</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-xl">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="text-gray-400 text-sm">Commission Earned</span>
                </div>
                <span className="text-white font-semibold">
                  {formatCurrency(closedWon.filter(d => {
                    const closed = new Date(d.actualCloseDate || d.createdAt);
                    const now = new Date();
                    return closed.getMonth() === now.getMonth() && closed.getFullYear() === now.getFullYear();
                  }).reduce((sum, d) => sum + d.commissionAmount, 0))}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-xl">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400 text-sm">Deals Created</span>
                </div>
                <span className="text-white font-semibold">
                  {userDeals.filter(d => {
                    const created = new Date(d.createdAt);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                  }).length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-xl">
                <div className="flex items-center gap-3">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-400 text-sm">Win Rate</span>
                </div>
                <span className="text-white font-semibold">
                  {userDeals.length > 0 
                    ? Math.round((closedWon.length / userDeals.length) * 100) 
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
