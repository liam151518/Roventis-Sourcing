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
import { useDemoData } from "@/lib/demo-data";
import { formatCurrency, formatDate, dealStatuses } from "@/lib/utils";

export default function DashboardPage() {
  const { affiliates, deals, commissionPayouts, activityLogs, trainingProgress, trainingModules } = useDemoData();
  
  const currentUser = affiliates[0];
  const userDeals = deals.filter(d => d.affiliateId === currentUser.id);
  const userPayouts = commissionPayouts.filter(p => p.affiliateId === currentUser.id);
  const userProgress = trainingProgress.filter(p => p.affiliateId === currentUser.id);
  
  const thisMonthEarnings = userPayouts
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  
  const activeDeals = userDeals.filter(d => !["closed_won", "closed_lost"].includes(d.status));
  const pendingCommission = userDeals
    .filter(d => d.commissionStatus === "pending")
    .reduce((sum, d) => sum + d.commissionAmount, 0);
  
  const trainingProgressPercent = Math.round((userProgress.filter(p => p.status === "completed").length / trainingModules.length) * 100);

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
          Welcome back, {currentUser.firstName}!
        </h1>
        <p className="text-gray-400">
          Here's your affiliate business overview.
        </p>
        <div className="flex items-center gap-4 mt-4">
          <span className="px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium capitalize">
            {currentUser.tier} Tier
          </span>
          <span className="text-sm text-gray-500">
            Code: <code className="bg-white/10 px-2 py-1 rounded">{currentUser.affiliateCode}</code>
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
            <span className="flex items-center text-green-400 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +12%
            </span>
          </div>
          <div className="text-2xl font-semibold">{formatCurrency(thisMonthEarnings)}</div>
          <div className="text-gray-500 text-sm">Earned This Month</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="text-2xl font-semibold">{activeDeals.length}</div>
          <div className="text-gray-500 text-sm">Active Deals</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="text-2xl font-semibold">{trainingProgressPercent}%</div>
          <div className="text-gray-500 text-sm">Training Progress</div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-6"
      >
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard/deals"
            className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-xl hover:bg-blue-500/20 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium">New Deal</div>
              <div className="text-sm text-gray-500">Add a prospect</div>
            </div>
          </Link>
          
          <Link
            href="/dashboard/resources"
            className="flex items-center gap-3 p-4 bg-purple-500/10 rounded-xl hover:bg-purple-500/20 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium">Catalog</div>
              <div className="text-sm text-gray-500">Download materials</div>
            </div>
          </Link>
          
          <Link
            href="/dashboard/training"
            className="flex items-center gap-3 p-4 bg-green-500/10 rounded-xl hover:bg-green-500/20 transition-colors"
          >
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium">Training</div>
              <div className="text-sm text-gray-500">Continue learning</div>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Pipeline & Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sales Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Your Pipeline</h2>
            <Link href="/dashboard/deals" className="text-blue-400 text-sm font-medium hover:underline">
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {pipelineStages.map((stage) => {
              const stageDeals = userDeals.filter(d => d.status === stage.status);
              const totalValue = stageDeals.reduce((sum, d) => sum + d.dealValue, 0);
              
              return (
                <div key={stage.status} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium text-gray-400">
                    {stage.label}
                  </div>
                  <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden">
                    <div
                      className={`h-full ${stage.color} flex items-center justify-end pr-2`}
                      style={{ width: `${Math.min((stageDeals.length / 5) * 100, 100)}%` }}
                    >
                      {stageDeals.length > 0 && (
                        <span className="text-xs font-medium text-white">
                          {stageDeals.length}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm font-medium text-gray-400">
                    {formatCurrency(totalValue)}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
          </div>
          
          <div className="space-y-4">
            {activityLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                  {log.action === "deal_closed" && <CheckCircle className="w-4 h-4 text-green-400" />}
                  {log.action === "commission_paid" && <DollarSign className="w-4 h-4 text-green-400" />}
                  {log.action === "deal_created" && <Plus className="w-4 h-4 text-blue-400" />}
                  {log.action === "tier_upgraded" && <TrendingUp className="w-4 h-4 text-yellow-400" />}
                  {log.action === "resource_downloaded" && <Download className="w-4 h-4 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    {log.action === "deal_closed" && (
                      <>Closed: <span className="font-medium">{log.metadata?.clientName}</span></>
                    )}
                    {log.action === "commission_paid" && (
                      <>Commission: <span className="font-medium">{formatCurrency(log.metadata?.amount as number)}</span></>
                    )}
                    {log.action === "deal_created" && (
                      <>New deal: <span className="font-medium">{log.metadata?.clientName}</span></>
                    )}
                    {log.action === "tier_upgraded" && (
                      <>Upgraded to <span className="font-medium capitalize">{log.metadata?.to}</span>!</>
                    )}
                    {log.action === "resource_downloaded" && (
                      <>Downloaded <span className="font-medium">{log.metadata?.title}</span></>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(log.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
