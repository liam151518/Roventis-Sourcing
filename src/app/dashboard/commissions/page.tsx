"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Building,
  Send,
  X
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CommissionsPage() {
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate);
  const myPayoutRequests = useQuery(api.commissions.getMyPayoutRequests, { affiliateId: currentAffiliate?._id as string });
  const requestPayout = useMutation(api.commissions.requestPayout);
  
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [requesting, setRequesting] = useState(false);

  if (!currentAffiliate) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const userPayouts = (myPayoutRequests || []) as any[];
  
  const totalPaid = userPayouts.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = currentAffiliate.pendingCommission || 0;
  const totalProcessing = userPayouts.filter((p) => p.status === "processing" || p.status === "requested").reduce((sum, p) => sum + p.amount, 0);
  
  const availablePayout = totalPending;
  const maxPayout = availablePayout;

  const stats = [
    {
      label: "Total Paid",
      value: formatCurrency(totalPaid),
      icon: CheckCircle,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-400"
    },
    {
      label: "Pending",
      value: formatCurrency(totalPending),
      icon: Clock,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-500/10",
      iconColor: "text-amber-400"
    },
    {
      label: "Processing",
      value: formatCurrency(totalProcessing),
      icon: TrendingUp,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-400"
    },
    {
      label: "Total Earned",
      value: formatCurrency(totalPaid + totalPending + totalProcessing),
      icon: DollarSign,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-400"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return { bg: "bg-emerald-500/10", text: "text-emerald-400", icon: CheckCircle };
      case "pending": return { bg: "bg-amber-500/10", text: "text-amber-400", icon: Clock };
      case "requested": return { bg: "bg-amber-500/10", text: "text-amber-400", icon: Clock };
      case "processing": return { bg: "bg-blue-500/10", text: "text-blue-400", icon: TrendingUp };
      case "failed": return { bg: "bg-red-500/10", text: "text-red-400", icon: XCircle };
      case "rejected": return { bg: "bg-red-500/10", text: "text-red-400", icon: XCircle };
      default: return { bg: "bg-slate-500/10", text: "text-slate-400", icon: Clock };
    }
  };

  const handleRequestPayout = async () => {
    if (!currentAffiliate?._id || !payoutAmount) return;
    const amount = parseFloat(payoutAmount);
    if (amount < 500) {
      alert("Minimum payout amount is R500");
      return;
    }
    if (amount > availablePayout) {
      alert("Amount exceeds available balance");
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
    } catch (error) {
      console.error("Failed to request payout:", error);
      alert("Failed to request payout. Make sure you have pending commission.");
    }
    setRequesting(false);
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
          <h1 className="text-2xl font-semibold text-white">Commissions</h1>
          <p className="text-gray-500 mt-1">Track your commission payouts and earnings</p>
        </div>
        <button 
          onClick={() => setShowPayoutModal(true)}
          disabled={availablePayout < 500}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
        >
          <Send className="w-4 h-4" />
          Request Payout
        </button>
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
              className="group bg-[#141417] rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all"
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
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Payouts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#141417] rounded-2xl border border-white/5 overflow-hidden"
      >
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Payout History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0a0a0b]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {userPayouts.map((payout: any) => {
                const status = getStatusBadge(payout.status);
                const StatusIcon = status.icon;
                
                return (
                  <tr key={payout._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-gray-400">
                      {formatDate(payout.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-semibold">{formatCurrency(payout.amount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 capitalize">
                      {payout.paymentMethod || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500 font-mono text-sm">
                        {payout.referenceNumber || "-"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {userPayouts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No commission payouts yet. Start closing deals to earn commissions!
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
                  <span className="text-white font-bold text-xl">{formatCurrency(availablePayout)}</span>
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
