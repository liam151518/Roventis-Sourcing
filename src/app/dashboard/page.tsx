"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  ArrowUpRight,
  Plus,
  Download,
  FileText,
  Clock,
  CheckCircle
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If no affiliate exists, show a message
  if (!currentAffiliate) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No affiliate account found.</p>
          <Link href="/apply" className="btn-primary">Apply Now</Link>
        </div>
      </div>
    );
  }
  
  const userDeals = (deals || []).filter(d => d.affiliateId === currentAffiliate._id);
  const userPayouts = (payouts || []).filter(p => p.affiliateId === currentAffiliate._id);
  
  const thisMonthEarnings = userPayouts
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  
  const activeDeals = userDeals.filter(d => !["closed_won", "closed_lost"].includes(d.status));
  const pendingCommission = userDeals
    .filter(d => d.commissionStatus === "pending" && d.status === "closed_won")
    .reduce((sum, d) => sum + d.commissionAmount, 0);

  const pipelineStages = [
    { status: "prospect", label: "Prospect", color: "bg-gray-800" },
    { status: "qualified", label: "Qualified", color: "bg-blue-900" },
    { status: "proposal_sent", label: "Proposal", color: "bg-yellow-900" },
    { status: "negotiation", label: "Negotiation", color: "bg-orange-900" },
    { status: "closed_won", label: "Closed", color: "bg-green-900" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-black rounded-3xl p-8 border border-white/10"
      >
        <h1 className="text-3xl font-semibold mb-2">
          Welcome back, {currentAffiliate.firstName}!
        </h1>
        <p className="text-gray-400">
          Here&apos;s your affiliate business overview.
        </p>
        <div className="flex items-center gap-4 mt-4">
          <span className="px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium capitalize">
            {currentAffiliate.tier} Tier
          </span>
          <span className="text-sm text-gray-500">
            Code: <code className="bg-white/10 px-2 py-1 rounded">{currentAffiliate.affiliateCode}</code>
          </span>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-semibold">{formatCurrency(currentAffiliate.totalCommissionEarned)}</div>
          <div className="text-gray-500 text-sm">Total Earnings</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-semibold">{formatCurrency(currentAffiliate.totalSales)}</div>
          <div className="text-gray-500 text-sm">Total Sales</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="text-2xl font-semibold">{userDeals.length}</div>
          <div className="text-gray-500 text-sm">Active Deals</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div className="text-2xl font-semibold">{formatCurrency(pendingCommission)}</div>
          <div className="text-gray-500 text-sm">Pending Commission</div>
        </motion.div>
      </div>

      {/* Pipeline & Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Deal Pipeline</h2>
          <div className="space-y-3">
            {pipelineStages.map((stage) => {
              const count = userDeals.filter(d => d.status === stage.status).length;
              return (
                <div key={stage.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <span className="text-gray-300">{stage.label}</span>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              );
            })}
          </div>
          <Link
            href="/dashboard/deals"
            className="mt-4 text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
          >
            View all deals <ArrowUpRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/dashboard/deals"
              className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Plus className="w-5 h-5 text-blue-400" />
              <span className="text-sm">New Deal</span>
            </Link>
            <Link
              href="/dashboard/training"
              className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <FileText className="w-5 h-5 text-purple-400" />
              <span className="text-sm">Training</span>
            </Link>
            <Link
              href="/dashboard/resources"
              className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Download className="w-5 h-5 text-green-400" />
              <span className="text-sm">Resources</span>
            </Link>
            <Link
              href="/dashboard/commissions"
              className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <DollarSign className="w-5 h-5 text-yellow-400" />
              <span className="text-sm">Commissions</span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Training Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Training Progress</h2>
          <Link
            href="/dashboard/training"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            View all
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {(modules || []).slice(0, 5).map((module) => (
            <div key={module._id} className="text-center p-4 bg-white/5 rounded-xl">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-sm font-medium truncate">{module.title}</div>
              <div className="text-xs text-gray-500">{module.estimatedMinutes} min</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
