"use client";

import { motion } from "framer-motion";
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
  Play
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate);
  const deals = useQuery(api.deals.getAllDeals);
  const modules = useQuery(api.training.getTrainingModules);
  const payouts = useQuery(api.commissions.getAllPayouts);
  
  // Loading state
  if (currentAffiliate === null || deals === null || modules === null || payouts === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
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
  
  const userDeals = (deals || []).filter(d => d.affiliateId === currentAffiliate._id);
  const userPayouts = (payouts || []).filter(p => p.affiliateId === currentAffiliate._id);
  
  const totalPaid = userPayouts.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = userPayouts.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
  
  const activeDeals = userDeals.filter(d => !["closed_won", "closed_lost"].includes(d.status));
  const closedWon = userDeals.filter(d => d.status === "closed_won").length;
  const conversionRate = userDeals.length > 0 ? Math.round((closedWon / userDeals.length) * 100) : 0;

  const stats = [
    {
      label: "Total Earnings",
      value: formatCurrency(currentAffiliate.totalCommissionEarned),
      change: "+12.5%",
      changeType: "positive",
      icon: DollarSign,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-400"
    },
    {
      label: "Total Sales",
      value: formatCurrency(currentAffiliate.totalSales),
      change: "+8.2%",
      changeType: "positive",
      icon: TrendingUp,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-400"
    },
    {
      label: "Active Deals",
      value: activeDeals.length.toString(),
      change: "-2",
      changeType: "neutral",
      icon: Target,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-400"
    },
    {
      label: "Conversion Rate",
      value: `${conversionRate}%`,
      change: "+3.1%",
      changeType: "positive",
      icon: Award,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-500/10",
      iconColor: "text-amber-400"
    }
  ];

  const pipelineStages = [
    { status: "prospect", label: "Prospect", color: "bg-slate-600", count: userDeals.filter(d => d.status === "prospect").length },
    { status: "qualified", label: "Qualified", color: "bg-blue-600", count: userDeals.filter(d => d.status === "qualified").length },
    { status: "proposal_sent", label: "Proposal", color: "bg-amber-600", count: userDeals.filter(d => d.status === "proposal_sent").length },
    { status: "negotiation", label: "Negotiation", color: "bg-orange-600", count: userDeals.filter(d => d.status === "negotiation").length },
    { status: "closed_won", label: "Closed Won", color: "bg-emerald-600", count: userDeals.filter(d => d.status === "closed_won").length },
  ];

  const recentDeals = userDeals.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Welcome back, {currentAffiliate.firstName}
          </h1>
          <p className="text-gray-500 mt-1">
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden bg-[#141417] rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
              <div className="flex items-start justify-between relative">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.changeType === "positive" ? "text-emerald-400" : 
                  stat.changeType === "negative" ? "text-red-400" : "text-gray-400"
                }`}>
                  {stat.changeType === "positive" ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : stat.changeType === "negative" ? (
                    <ArrowDownRight className="w-3 h-3" />
                  ) : null}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-semibold text-white">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pipeline - Takes 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-[#141417] rounded-2xl border border-white/5 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Deal Pipeline</h2>
            <Link
              href="/dashboard/deals"
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {pipelineStages.map((stage) => (
              <div key={stage.status} className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                  <span className="text-gray-300">{stage.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${stage.color} rounded-full`} 
                      style={{ width: `${userDeals.length > 0 ? (stage.count / userDeals.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-white font-medium w-8 text-right">{stage.count}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Stats / Pending */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#141417] rounded-2xl border border-white/5 p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Pending Payments</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#0a0a0b] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-white font-medium">Pending</div>
                  <div className="text-xs text-gray-500">Awaiting payment</div>
                </div>
              </div>
              <div className="text-amber-400 font-semibold">{formatCurrency(totalPending)}</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0a0a0b] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-white font-medium">Paid</div>
                  <div className="text-xs text-gray-500">This month</div>
                </div>
              </div>
              <div className="text-emerald-400 font-semibold">{formatCurrency(totalPaid)}</div>
            </div>
          </div>
          <Link
            href="/dashboard/commissions"
            className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0a0a0b] hover:bg-white/5 text-gray-300 rounded-xl text-sm font-medium transition-colors"
          >
            View Commissions <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

      {/* Recent Deals Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-[#141417] rounded-2xl border border-white/5 overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Recent Deals</h2>
          <Link
            href="/dashboard/deals"
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0a0a0b]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentDeals.map((deal) => (
                <tr key={deal._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium">
                        {deal.clientName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white font-medium">{deal.clientName}</div>
                        <div className="text-sm text-gray-500">{deal.clientCompany || "No company"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white font-medium">{formatCurrency(deal.dealValue)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      deal.status === "closed_won" ? "bg-emerald-500/10 text-emerald-400" :
                      deal.status === "closed_lost" ? "bg-red-500/10 text-red-400" :
                      deal.status === "negotiation" ? "bg-orange-500/10 text-orange-400" :
                      deal.status === "proposal_sent" ? "bg-amber-500/10 text-amber-400" :
                      deal.status === "qualified" ? "bg-blue-500/10 text-blue-400" :
                      "bg-slate-500/10 text-slate-400"
                    }`}>
                      {deal.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{formatCurrency(deal.commissionAmount)}</td>
                </tr>
              ))}
              {recentDeals.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No deals yet. <Link href="/dashboard/deals" className="text-blue-400 hover:text-blue-300">Create your first deal</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Training Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-[#141417] rounded-2xl border border-white/5 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Continue Learning</h2>
            <p className="text-sm text-gray-500 mt-1">Complete training modules to increase your commission tier</p>
          </div>
          <Link
            href="/dashboard/training"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Play className="w-4 h-4" />
            View Training
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(modules || []).slice(0, 3).map((module) => (
            <div key={module._id} className="flex items-start gap-4 p-4 bg-[#0a0a0b] rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Play className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">{module.title}</div>
                <div className="text-sm text-gray-500 mt-1">{module.estimatedMinutes} min</div>
              </div>
              {module.isRequired && (
                <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-full">Required</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
