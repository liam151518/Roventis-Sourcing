"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  Send,
  X,
  AlertCircle,
  CircleDollarSign,
  Wallet,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";

export default function CommissionsPage() {
  const { userId } = useAuth();
  const currentAffiliate = useQuery(
    api.affiliates.getCurrentAffiliate,
    { clerkUserId: userId || undefined }
  );

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

  const dealsQuery = useQuery(
    api.deals.getDealsByAffiliate,
    affiliateId ? { affiliateId } : "skip"
  );

  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const deals = (dealsQuery || []) as any[];

  if (!currentAffiliate) {
    return (
      <div className="space-y-6">
        <SkeletonBlock className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
        </div>
      </div>
    );
  }

  const userOrders = (myOrders || []) as any[];
  const userPayouts = (myPayoutRequests || []) as any[];

  const summary = commissionSummary || {
    pendingApproval: 0,
    approved: 0,
    paidThisMonth: 0,
    totalEarned: currentAffiliate?.totalCommissionEarned || 0,
    totalPaid: currentAffiliate?.totalCommissionPaid || 0,
    pendingBalance: currentAffiliate?.pendingCommission || 0,
  };

  const closedWonDeals = deals.filter((d: any) => d.status === "closed_won");

  const breakdown = closedWonDeals
    .map((deal: any) => {
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
    })
    .sort((a, b) => b.deal.createdAt - a.deal.createdAt);

  const noOrderCount = breakdown.filter((b) => b.status === "no_order").length;
  const pendingCount = breakdown.filter((b) => b.status === "pending").length;
  const approvedCount = breakdown.filter((b) => b.status === "approved").length;
  const paidCount = breakdown.filter((b) => b.status === "paid").length;

  const stats: Array<{
    label: string;
    value: string;
    subtext: string;
    icon: typeof DollarSign;
    iconClass: "accent" | "warning" | "info" | "success";
  }> = [
    {
      label: "Total Earned",
      value: formatCurrency(summary.totalEarned),
      subtext: "All time",
      icon: CircleDollarSign,
      iconClass: "accent",
    },
    {
      label: "Pending Approval",
      value: formatCurrency(summary.pendingApproval),
      subtext: `${pendingCount} order${pendingCount !== 1 ? "s" : ""}`,
      icon: Clock,
      iconClass: "warning",
    },
    {
      label: "Approved",
      value: formatCurrency(summary.approved),
      subtext: "Awaiting payment",
      icon: CheckCircle,
      iconClass: "info",
    },
    {
      label: "Total Paid",
      value: formatCurrency(summary.totalPaid),
      subtext: "All time",
      icon: Wallet,
      iconClass: "success",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return { label: "Paid", tone: "paid" as const };
      case "approved":
        return { label: "Approved", tone: "paid" as const };
      case "pending":
        return { label: "Pending Approval", tone: "pending" as const };
      case "no_order":
        return { label: "Deal Closed — No Order", tone: "neutral" as const };
      default:
        return { label: status, tone: "neutral" as const };
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

  const showPayoutMessage = summary.pendingBalance === 0;
  const hasApprovedCommissions = summary.approved > 0;
  const hasAnyCommissions = summary.totalEarned > 0;

  return (
    <div className="space-y-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 px-4 py-3 rounded-xl z-50 ${
              toast.type === "success"
                ? "bg-[var(--rs-success)]"
                : "bg-[var(--rs-danger)]"
            } text-white shadow-xl`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
      >
        <div>
          <span className="rs-overline">Finance</span>
          <h1 className="rs-page-title text-2xl md:text-[28px] mt-1">Commissions</h1>
          <p className="rs-page-subtitle">
            Track your commission earnings and payouts
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rs-card p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`rs-icon-tile rs-icon-tile--${stat.iconClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div
                className="text-2xl font-semibold rs-stat"
                style={{ color: "var(--rs-text-primary)" }}
              >
                {stat.value}
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
                {stat.subtext}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Commission Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rs-card overflow-hidden"
      >
        <div className="rs-section-header">
          <div>
            <div className="rs-section-header-title">Commission Breakdown</div>
            <div className="rs-section-header-description">
              {breakdown.length} closed deal
              {breakdown.length !== 1 ? "s" : ""}
            </div>
          </div>
          <button
            onClick={() => setShowPayoutModal(true)}
            disabled={showPayoutMessage}
            className="rs-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            Request Payout
          </button>
        </div>
        {showPayoutMessage && (
          <div className="px-5 pt-4">
            <div className="rs-callout rs-callout--info">
              {hasApprovedCommissions ? (
                <>
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Your commission has been approved. Payment will be
                    processed within 8–10 business days.
                  </span>
                </>
              ) : hasAnyCommissions ? (
                <>
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>All commissions have been paid out.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    No commissions ready for payout yet. Close a deal and
                    submit your order to get started.
                  </span>
                </>
              )}
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          {breakdown.length === 0 ? (
            <div className="rs-empty-state py-16">
              <div className="rs-empty-state-icon">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="rs-empty-state-title">No closed deals yet</div>
              <div className="rs-empty-state-description">
                Start closing deals to earn commissions.
              </div>
            </div>
          ) : (
            <table className="rs-table">
              <thead>
                <tr>
                  <th>Deal / Client</th>
                  <th>Deal Value</th>
                  <th>Rate</th>
                  <th>Commission</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((item: any) => {
                  const badge = getStatusBadge(item.status);
                  return (
                    <tr key={item.dealId}>
                      <td>
                        <div>
                          <div className="font-medium text-white">
                            {item.clientName}
                          </div>
                          {item.clientCompany && (
                            <div
                              className="text-[11px]"
                              style={{ color: "var(--rs-text-muted)" }}
                            >
                              {item.clientCompany}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="rs-stat">{formatCurrency(item.dealValue)}</td>
                      <td style={{ color: "var(--rs-text-secondary)" }}>
                        {item.commissionRate}%
                      </td>
                      <td
                        className="font-medium rs-stat"
                        style={{ color: "var(--rs-success)" }}
                      >
                        {formatCurrency(item.commissionAmount)}
                      </td>
                      <td>
                        <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Payout History */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rs-card overflow-hidden"
      >
        <div className="rs-section-header">
          <div>
            <div className="rs-section-header-title">Payout History</div>
            <div className="rs-section-header-description">
              {userPayouts.length} request{userPayouts.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {userPayouts.length === 0 ? (
            <div className="rs-empty-state py-16">
              <div className="rs-empty-state-icon">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="rs-empty-state-title">No payout requests yet</div>
              <div className="rs-empty-state-description">
                Use Request Payout above when you have an approved balance.
              </div>
            </div>
          ) : (
            <table className="rs-table">
              <thead>
                <tr>
                  <th>Date Requested</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {userPayouts.map((payout: any) => {
                  const tone =
                    payout.status === "paid"
                      ? "paid"
                      : payout.status === "processing" ||
                          payout.status === "requested"
                        ? "pending"
                        : payout.status === "rejected"
                          ? "rejected"
                          : "neutral";
                  return (
                    <tr key={payout._id}>
                      <td style={{ color: "var(--rs-text-secondary)" }}>
                        {formatDate(payout.requestedAt)}
                      </td>
                      <td className="font-medium rs-stat text-white">
                        {formatCurrency(payout.amount)}
                      </td>
                      <td>
                        <span className="capitalize" style={{ color: "var(--rs-text-primary)" }}>
                          {payout.status}
                        </span>
                      </td>
                      <td
                        className="font-mono text-[11px]"
                        style={{ color: "var(--rs-text-muted)" }}
                      >
                        {payout.referenceNumber || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Payout Modal */}
      <AnimatePresence>
        {showPayoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rs-modal-backdrop"
            onClick={() => setShowPayoutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rs-modal max-w-md w-full"
            >
              <div className="rs-modal-header">
                <h3 className="text-base font-semibold text-white">Request Payout</h3>
                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="p-1 rounded-md hover:bg-white/5 transition-colors"
                  style={{ color: "var(--rs-text-secondary)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="rs-modal-body space-y-4">
                <div
                  className="p-4 rounded-xl flex items-center justify-between"
                  style={{
                    background: "rgba(59,130,246,0.08)",
                    border: "1px solid rgba(59,130,246,0.20)",
                  }}
                >
                  <span
                    className="text-sm"
                    style={{ color: "var(--rs-text-secondary)" }}
                  >
                    Available Balance
                  </span>
                  <span className="text-lg font-semibold text-white rs-stat">
                    {formatCurrency(summary.pendingBalance)}
                  </span>
                </div>

                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--rs-text-secondary)" }}
                  >
                    Amount (Min R500)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="rs-input rs-input--textarea"
                    style={{ height: 42 }}
                  />
                </div>

                <div
                  className="p-4 rounded-xl space-y-1.5"
                  style={{
                    background: "var(--rs-bg-base)",
                    border: "1px solid var(--rs-border)",
                  }}
                >
                  <div
                    className="text-[11px] uppercase tracking-wider"
                    style={{ color: "var(--rs-text-muted)" }}
                  >
                    Payout to
                  </div>
                  <div className="text-sm font-medium text-white">
                    {currentAffiliate.bankName || "FNB"}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--rs-text-secondary)" }}
                  >
                    Account:{" "}
                    {currentAffiliate.accountNumber
                      ? "****" + currentAffiliate.accountNumber.slice(-4)
                      : "Not set"}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--rs-text-secondary)" }}
                  >
                    Type: {currentAffiliate.accountType || "business"}
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowPayoutModal(false)}
                    className="rs-btn-ghost flex-1 justify-center"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestPayout}
                    disabled={requesting || !payoutAmount}
                    className="rs-btn-primary flex-1 justify-center disabled:opacity-50"
                  >
                    {requesting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
