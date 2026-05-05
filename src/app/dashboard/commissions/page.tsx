"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  ArrowUpRight,
  Send,
  X,
  Package,
  AlertCircle,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";

export default function CommissionsPage() {
  const { userId } = useAuth();
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate);
  
  // Use stable arguments for all useQuery hooks - always pass something
  const affiliateId = currentAffiliate?._id;
  const myOrders = useQuery(
    api.orders.getMyOrders, 
    affiliateId ? { affiliateId } : "skip"
  );
  const myPayoutRequests = useQuery(
    api.commissions.getMyPayoutRequests, 
    affiliateId ? { affiliateId } : "skip"
  );
  const commissionSummary = useQuery(
    api.admin.getCommissionSummary, 
    affiliateId ? { affiliateId } : "skip"
  );
  const requestPayout = useMutation(api.commissions.requestPayout);
  
  // Get deals for breakdown table - use skip pattern too
  const dealsQuery = useQuery(
    api.deals.getDealsByAffiliate, 
    affiliateId ? { affiliateId } : "skip"
  );
  
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [toast, setToast] = useState<{message: string; type: "success" | "error"} | null>(null);

  const deals = (dealsQuery || []) as any[];

  if (!currentAffiliate) {
    return (
      <div className="space-y-6">
        <SkeletonBlock className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-32" />
        </div>
      </div>
    );
  }

  const userOrders = (myOrders || []) as any[];
  const userPayouts = (myPayoutRequests || []) as any[];
  
  // Get summary from the new query first, fallback to affiliate fields
  const summary = commissionSummary || {
    pendingApproval: 0,
    approved: 0,
    paidThisMonth: 0,
    totalEarned: currentAffiliate?.totalCommissionEarned || 0,
    totalPaid: currentAffiliate?.totalCommissionPaid || 0,
    pendingBalance: currentAffiliate?.pendingCommission || 0,
  };

  const closedWonDeals = deals.filter((d: any) => d.status === "closed_won");

  // Build commission breakdown
  const breakdown = closedWonDeals.map((deal: any) => {
    const order = userOrders.find((o: any) => o.dealId === deal._id);
    let status: string;
    let label: string;
    
    if (!order) {
      status = "no_order";
      label = "Deal Closed — No Order";
    } else if (order.commissionStatus === "pending") {
      status = "pending";
      label = "Pending Approval";
    } else if (order.commissionStatus === "approved") {
      status = "approved";
      label = "Approved";
    } else if (order.commissionStatus === "paid") {
      status = "paid";
      label = "Paid";
    } else {
      status = "unknown";
      label = order.commissionStatus || "Unknown";
    }
    
    return {
      dealId: deal._id,
      deal: deal,
      order: order,
      clientName: deal.clientName,
      clientCompany: deal.clientCompany,
      dealValue: deal.dealValue,
      commissionRate: deal.commissionRate,
      commissionAmount: deal.commissionAmount,
      status,
      label,
      orderId: order?._id,
    };
  }).sort((a, b) => b.deal.createdAt - a.deal.createdAt);

  // Calculate breakdown counts
  const noOrderCount = breakdown.filter(b => b.status === "no_order").length;
  const pendingCount = breakdown.filter(b => b.status === "pending").length;
  const approvedCount = breakdown.filter(b => b.status === "approved").length;
  const paidCount = breakdown.filter(b => b.status === "paid").length;

  const stats = [
    {
      label: "Total Earned",
      value: formatCurrency(summary.totalEarned),
      subtext: "All time",
      icon: DollarSign,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-400"
    },
    {
      label: "Pending Approval",
      value: formatCurrency(summary.pendingApproval),
      subtext: `${pendingCount} order${pendingCount !== 1 ? 's' : ''}`,
      icon: Clock,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-500/10",
      iconColor: "text-amber-400"
    },
    {
      label: "Approved",
      value: formatCurrency(summary.approved),
      subtext: "Awaiting payment",
      icon: CheckCircle,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-400"
    },
    {
      label: "Total Paid",
      value: formatCurrency(summary.totalPaid),
      subtext: "All time",
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-400"
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return { bg: "bg-green-500/20", text: "text-green-400", label: "Paid" };
      case "approved": return { bg: "bg-blue-500/20", text: "text-blue-400", label: "Approved" };
      case "pending": return { bg: "bg-amber-500/20", text: "text-amber-400", label: "Pending Approval" };
      case "no_order": return { bg: "bg-gray-500/20", text: "text-gray-400", label: "Deal Closed — No Order" };
      default: return { bg: "bg-gray-500/20", text: "text-gray-400", label: status };
    }
  };

  const handleRequestPayout = async () => {
    if (!currentAffiliate?._id || !payoutAmount) return;
    const amount = parseFloat(payoutAmount);
    if (amount < 500) {
      setToast({ message: "Minimum payout amount is R500", type: "error" });
      return;
    }
    if (amount > summary.pendingBalance) {
      setToast({ message: "Amount exceeds available balance", type: "error" });
      return;
    }
    setRequesting(true);
    try {
      await requestPayout({
        affiliateId: currentAffiliate._id,
        amount,
        paymentMethod: "eft",
        bankName: currentAffiliate.bankName || "FNB",
        accountNumber: currentAffiliate.accountNumber || "1234567890",
        accountType: currentAffiliate.accountType || "business",
      });
      setShowPayoutModal(false);
      setPayoutAmount("");
      setToast({ message: "Payout requested successfully!", type: "success" });
    } catch (error: any) {
      setToast({ message: error.message || "Failed to request payout", type: "error" });
    }
    setRequesting(false);
    setTimeout(() => setToast(null), 3000);
  };

  // Determine what message to show
  const showPayoutMessage = summary.pendingBalance === 0;
  const hasApprovedCommissions = summary.approved > 0;
  const hasAnyCommissions = summary.totalEarned > 0;

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 px-4 py-3 rounded-xl z-50 ${
              toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
            } text-white shadow-xl`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Commissions</h1>
          <p className="text-gray-500 mt-1">Track your commission earnings and payouts</p>
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
              className="group bg-[#141417] rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
              <div className="flex items-start justify-between relative">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-semibold text-white">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                <div className="text-xs text-gray-600 mt-0.5">{stat.subtext}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Commission Breakdown Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#141417] rounded-2xl border border-white/5 overflow-hidden"
      >
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Commission Breakdown</h2>
            <button 
              onClick={() => setShowPayoutModal(true)}
              disabled={showPayoutMessage}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors text-sm"
            >
              <Send className="w-4 h-4" />
              Request Payout
            </button>
          </div>
          {showPayoutMessage && (
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              {hasApprovedCommissions ? (
                <p className="text-blue-400 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Your commission has been approved. Payment will be processed within 8–10 business days.
                </p>
              ) : hasAnyCommissions ? (
                <p className="text-blue-400 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  All commissions have been paid out.
                </p>
              ) : (
                <p className="text-blue-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  No commissions ready for payout yet. Close a deal and submit your order to get started.
                </p>
              )}
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0a0a0b]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal / Client</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal Value</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {breakdown.map((item: any) => {
                const badge = getStatusBadge(item.status);
                return (
                  <tr key={item.dealId} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{item.clientName}</p>
                        {item.clientCompany && (
                          <p className="text-gray-500 text-sm">{item.clientCompany}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">
                      {formatCurrency(item.dealValue)}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {item.commissionRate}%
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-emerald-400 font-medium">
                        {formatCurrency(item.commissionAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge tone={item.status === "paid" || item.status === "approved" ? "paid" : item.status === "pending" ? "pending" : "neutral"}>
                        {badge.label}
                      </StatusBadge>
                    </td>
                  </tr>
                );
              })}
              {breakdown.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No closed deals yet. Start closing deals to earn commissions!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Payout History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-[#141417] rounded-2xl border border-white/5 overflow-hidden"
      >
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Payout History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0a0a0b]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Requested</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {userPayouts.map((payout: any) => {
                let statusLabel = payout.status;
                let statusClass = "text-gray-400";
                if (payout.status === "paid") statusClass = "text-green-400";
                if (payout.status === "processing" || payout.status === "requested") statusClass = "text-amber-400";
                if (payout.status === "rejected") statusClass = "text-red-400";
                
                return (
                  <tr key={payout._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-gray-400">
                      {formatDate(payout.requestedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-semibold">{formatCurrency(payout.amount)}</span>
                    </td>
                    <td className={`px-6 py-4 capitalize ${statusClass}`}>
                      {statusLabel}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-sm">
                      {payout.referenceNumber || "-"}
                    </td>
                  </tr>
                );
              })}
              {userPayouts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No payout requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Payout Modal */}
      <AnimatePresence>
        {showPayoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPayoutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111113] rounded-2xl p-6 max-w-md w-full border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Request Payout</h3>
                <button 
                  onClick={() => setShowPayoutModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Available Balance</span>
                  <span className="text-white font-bold text-xl">{formatCurrency(summary.pendingBalance)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Amount (Min R500)</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="p-4 bg-white/5 rounded-xl space-y-2">
                  <p className="text-gray-400 text-sm">Payout to:</p>
                  <p className="text-white font-medium">{currentAffiliate.bankName || "FNB"}</p>
                  <p className="text-gray-400 text-sm">Account: {currentAffiliate.accountNumber ? "****" + currentAffiliate.accountNumber.slice(-4) : "Not set"}</p>
                  <p className="text-gray-400 text-sm">Type: {currentAffiliate.accountType || "business"}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 py-3 border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestPayout}
                  disabled={requesting || !payoutAmount}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {requesting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Request
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}