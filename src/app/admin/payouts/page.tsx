"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, DollarSign, Package, CheckCircle, Clock, AlertCircle, CreditCard, Banknote, User, Eye, X } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { formatDate, formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";

const orderStatuses = [
  { value: "submitted", label: "Submitted" },
  { value: "supplier_confirmed", label: "Supplier Confirmed" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "installed", label: "Installed" },
];

const commissionStatuses = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approve & Pay" },
  { value: "paid", label: "Paid" },
];

type TabType = "commissions" | "payouts";

export default function AdminPayoutsPage() {
  const { userId } = useAuth();
  const orders = useQuery(api.admin.getAllOrdersAdmin);
  const payoutRequests = useQuery(api.admin.getAllPayoutRequestsAdmin);
  const approveOrderCommission = useMutation(api.admin.approveOrderCommission);
  const markCommissionPaid = useMutation(api.admin.markCommissionPaid);
  const updatePayoutStatus = useMutation(api.commissions.updatePayoutStatus);
  const recalculateCommissions = useMutation(api.admin.recalculateAffiliateCommissions);
  
  const [activeTab, setActiveTab] = useState<TabType>("commissions");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("submitted");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{message: string; type: "success" | "error"} | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);

  // Filter orders based on commission status
  const submittedOrders = (orders || []).filter((order: any) => 
    order.status !== "draft" && order.status !== "cancelled"
  );

  const pendingOrders = submittedOrders.filter((o: any) => o.commissionStatus === "pending");
  const approvedOrders = submittedOrders.filter((o: any) => o.commissionStatus === "approved");
  const paidOrders = submittedOrders.filter((o: any) => o.commissionStatus === "paid");

  // Payout requests
  const allPayoutRequests = payoutRequests || [];
  const pendingPayouts = allPayoutRequests.filter((p: any) => p.status === "requested" || p.status === "processing");
  const paidPayouts = allPayoutRequests.filter((p: any) => p.status === "paid");

  const getOrdersForTab = (tab: "pending" | "approved" | "paid") => {
    let filtered = tab === "pending" ? pendingOrders : 
                   tab === "approved" ? approvedOrders : paidOrders;
    
    return filtered.filter((order: any) => {
      const matchesSearch = 
        order.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.clientCompany?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.affiliate?.firstName?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  };

  const filteredOrders = getOrdersForTab(activeTab === "commissions" ? "pending" : "approved");

  // Calculate totals
  const totalPendingApproval = pendingOrders.reduce((sum: number, o: any) => sum + (o.commissionAmount || 0), 0);
  const totalApprovedAwaitingPayment = approvedOrders.reduce((sum: number, o: any) => sum + (o.commissionAmount || 0), 0);
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const totalPaidThisMonth = paidOrders
    .filter((o: any) => (o.paidAt || 0) >= startOfMonth)
    .reduce((sum: number, o: any) => sum + (o.commissionAmount || 0), 0);

  // Payout request totals
  const totalPendingPayouts = pendingPayouts.reduce((sum: number, p: any) => sum + p.amount, 0);
  const totalPaidPayouts = paidPayouts.reduce((sum: number, p: any) => sum + p.amount, 0);

  const handleApprove = async (orderId: string) => {
    if (!userId) return;
    setProcessingId(orderId);
    try {
      await approveOrderCommission({ orderId, adminClerkUserId: userId });
      setToast({ message: "Commission approved successfully!", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Failed to approve commission", type: "error" });
    }
    setProcessingId(null);
    setTimeout(() => setToast(null), 3000);
  };

  const handleMarkPaid = async (orderId: string) => {
    if (!userId) return;
    const ref = paymentRef[orderId] || `PAY-${orderId.slice(-8)}`;
    setProcessingId(orderId);
    try {
      await markCommissionPaid({ orderId, paymentReference: ref, adminClerkUserId: userId });
      setToast({ message: "Commission marked as paid!", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Failed to mark as paid", type: "error" });
    }
    setProcessingId(null);
    setTimeout(() => setToast(null), 3000);
  };

  const handlePayoutStatusChange = async (payoutId: string, status: string) => {
    try {
      await updatePayoutStatus({ payoutId, status: status as any });
      setToast({ message: `Payout ${status}!`, type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Failed to update payout", type: "error" });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleRecalculate = async () => {
    if (!userId) return;
    if (!confirm("This will recalculate all affiliate commissions from orders. Continue?")) return;
    try {
      await recalculateCommissions({ adminClerkUserId: userId });
      setToast({ message: "Commissions recalculated!", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Failed to recalculate", type: "error" });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: "bg-[var(--rs-info)]/20 text-[var(--rs-info)]",
      supplier_confirmed: "bg-purple-500/20 text-purple-400",
      in_transit: "bg-[var(--rs-warning)]/20 text-[var(--rs-warning)]",
      delivered: "bg-[var(--rs-success)]/20 text-[var(--rs-success)]",
      installed: "bg-[var(--rs-success)]/20 text-[var(--rs-success)]",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  };

  const getPayoutStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-[var(--rs-success)]/20 text-[var(--rs-success)]";
      case "processing": return "bg-[var(--rs-info)]/20 text-[var(--rs-info)]";
      case "requested": return "bg-[var(--rs-warning)]/20 text-[var(--rs-warning)]";
      case "rejected": return "bg-[var(--rs-danger)]/20 text-[var(--rs-danger)]";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  if (!orders) {
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

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`rs-callout fixed top-4 right-4 z-50 max-w-sm ${toast.type === "success" ? "rs-callout--success" : "rs-callout--danger"}`}
          >
            <p className="text-sm font-medium text-white">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rs-page-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="rs-overline">Admin</span>
          <h1 className="rs-page-title mt-1">Commission Approvals & Payouts</h1>
          <p className="rs-page-subtitle">Validate orders and manage affiliate commission payments</p>
        </div>
        <button
          onClick={handleRecalculate}
          className="rs-btn-ghost px-4 py-2 text-sm"
        >
          Recalculate Commissions
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: "var(--rs-border)" }}>
        <button
          onClick={() => setActiveTab("commissions")}
          className={`px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "commissions" ? "text-white" : ""
          }`}
          style={activeTab === "commissions" ? undefined : { color: "var(--rs-text-secondary)" }}
        >
          <span className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Commission Approvals
          </span>
          {activeTab === "commissions" && (
            <motion.div layoutId="payoutsActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "var(--rs-accent)" }} />
          )}
        </button>
        <button
          onClick={() => setActiveTab("payouts")}
          className={`px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "payouts" ? "text-white" : ""
          }`}
          style={activeTab === "payouts" ? undefined : { color: "var(--rs-text-secondary)" }}
        >
          <span className="flex items-center gap-2">
            <Banknote className="w-4 h-4" />
            Payout Requests
            <span className="rs-pill text-xs px-2 py-0.5" style={{ background: "rgba(245,158,11,0.10)", color: "rgb(251,191,36)", borderColor: "rgba(245,158,11,0.20)" }}>
              {pendingPayouts.length}
            </span>
          </span>
          {activeTab === "payouts" && (
            <motion.div layoutId="payoutsActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "var(--rs-accent)" }} />
          )}
        </button>
      </div>

      {/* COMMISSION APPROVALS TAB */}
      {activeTab === "commissions" && (
        <>
          {/* Summary Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rs-card p-6 flex items-center gap-3" style={{ borderColor: "var(--rs-warning)" }}>
              <div className="rs-icon-tile rs-icon-tile--warning">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--rs-text-secondary)" }}>Pending Approval</p>
                <p className="rs-stat text-2xl text-white mt-1">{formatCurrency(totalPendingApproval)}</p>
              </div>
            </div>
            <div className="rs-card p-6 flex items-center gap-3">
              <div className="rs-icon-tile rs-icon-tile--info">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--rs-text-secondary)" }}>Approved — Awaiting Payment</p>
                <p className="rs-stat text-2xl text-white mt-1">{formatCurrency(totalApprovedAwaitingPayment)}</p>
              </div>
            </div>
            <div className="rs-card p-6 flex items-center gap-3" style={{ borderColor: "var(--rs-success)" }}>
              <div className="rs-icon-tile rs-icon-tile--success">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--rs-text-secondary)" }}>Paid This Month</p>
                <p className="rs-stat text-2xl text-white mt-1">{formatCurrency(totalPaidThisMonth)}</p>
              </div>
            </div>
          </div>

          {/* Sub-tabs for commission status */}
          <div className="flex gap-2 border-b" style={{ borderColor: "var(--rs-border)" }}>
            {(["pending", "approved", "paid"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  statusFilter === status ? "text-white" : ""
                }`}
                style={statusFilter === status ? undefined : { color: "var(--rs-text-secondary)" }}
              >
                {status === "pending" && `Pending (${pendingOrders.length})`}
                {status === "approved" && `Approved (${approvedOrders.length})`}
                {status === "paid" && `Paid (${paidOrders.length})`}
              </button>
            ))}
          </div>

          <div className="rs-card p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
              <input
                type="text"
                placeholder="Search by client or affiliate name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rs-input w-full pl-11"
              />
            </div>
          </div>

          {/* Orders Table */}
          <div className="rs-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="rs-table w-full">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Affiliate</th>
                    <th>Client</th>
                    <th>Total</th>
                    <th>Commission</th>
                    <th>Status</th>
                    {statusFilter !== "paid" && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {getOrdersForTab(statusFilter as any).map((order: any) => (
                    <tr key={order._id}>
                      <td>
                        <p className="font-medium text-white">#{order._id.slice(-8)}</p>
                        <p className="text-xs" style={{ color: "var(--rs-text-secondary)" }}>{formatDate(order.createdAt)}</p>
                      </td>
                      <td>
                        <div>
                          <p className="text-white">{order.affiliate?.firstName} {order.affiliate?.lastName}</p>
                          <p className="text-xs" style={{ color: "var(--rs-text-secondary)" }}>{order.affiliate?.email}</p>
                        </div>
                      </td>
                      <td>
                        <p className="text-white">{order.clientName}</p>
                        {order.clientCompany && <p className="text-xs" style={{ color: "var(--rs-text-secondary)" }}>{order.clientCompany}</p>}
                      </td>
                      <td className="font-medium">{formatCurrency(order.totalAmount)}</td>
                      <td>
                        <p className="font-medium" style={{
                          color: order.commissionStatus === "paid"
                            ? "rgb(74,222,128)"
                            : order.commissionStatus === "approved"
                            ? "rgb(96,165,250)"
                            : "rgb(251,191,36)"
                        }}>
                          {formatCurrency(order.commissionAmount || 0)}
                        </p>
                      </td>
                      <td>
                        <StatusBadge tone={order.status === "submitted" || order.status === "supplier_confirmed" || order.status === "in_transit" ? "active" : order.status === "delivered" || order.status === "installed" ? "paid" : "neutral"}>
                          {order.status?.replace("_", " ")}
                        </StatusBadge>
                      </td>
                      {statusFilter !== "paid" && (
                        <td>
                          <div className="flex flex-col gap-2">
                            {statusFilter === "pending" && (
                              <button
                                onClick={() => handleApprove(order._id)}
                                disabled={processingId === order._id}
                                className="rs-btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5 disabled:opacity-60"
                                style={{ background: "rgba(245,158,11,0.85)" }}
                              >
                                {processingId === order._id ? (
                                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3.5 h-3.5" />
                                )}
                                Approve
                              </button>
                            )}
                            {statusFilter === "approved" && (
                              <div className="flex flex-col gap-2">
                                <input
                                  type="text"
                                  placeholder="Payment ref..."
                                  value={paymentRef[order._id] || ""}
                                  onChange={(e) => setPaymentRef({ ...paymentRef, [order._id]: e.target.value })}
                                  className="rs-input text-xs px-2 py-1"
                                />
                                <button
                                  onClick={() => handleMarkPaid(order._id)}
                                  disabled={processingId === order._id}
                                  className="rs-btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5 disabled:opacity-60"
                                  style={{ background: "rgba(34,197,94,0.85)" }}
                                >
                                  {processingId === order._id ? (
                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  ) : (
                                    <CreditCard className="w-3.5 h-3.5" />
                                  )}
                                  Mark Paid
                                </button>
                                <p className="text-xs" style={{ color: "var(--rs-text-secondary)" }}>
                                  8–10 business days
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* PAYOUT REQUESTS TAB */}
      {activeTab === "payouts" && (
        <>
          {/* Summary Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rs-card p-6 flex items-center gap-3" style={{ borderColor: "var(--rs-warning)" }}>
              <div className="rs-icon-tile rs-icon-tile--warning">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--rs-text-secondary)" }}>Pending Payout Requests</p>
                <p className="rs-stat text-2xl text-white mt-1">{formatCurrency(totalPendingPayouts)}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--rs-text-muted)" }}>{pendingPayouts.length} requests</p>
              </div>
            </div>
            <div className="rs-card p-6 flex items-center gap-3" style={{ borderColor: "var(--rs-success)" }}>
              <div className="rs-icon-tile rs-icon-tile--success">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--rs-text-secondary)" }}>Total Paid Out</p>
                <p className="rs-stat text-2xl text-white mt-1">{formatCurrency(totalPaidPayouts)}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--rs-text-muted)" }}>{paidPayouts.length} payouts</p>
              </div>
            </div>
          </div>

          {/* Payout Requests Table */}
          <div className="rs-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="rs-table w-full">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Affiliate</th>
                    <th>Amount</th>
                    <th>Bank Details</th>
                    <th>Status</th>
                    <th>Reference</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allPayoutRequests.map((payout: any) => (
                    <tr key={payout._id}>
                      <td>
                        <p className="text-white">{formatDate(payout.requestedAt)}</p>
                      </td>
                      <td>
                        <div>
                          <p className="text-white">{payout.affiliate?.firstName} {payout.affiliate?.lastName}</p>
                          <p className="text-xs" style={{ color: "var(--rs-text-secondary)" }}>{payout.affiliate?.email}</p>
                        </div>
                      </td>
                      <td>
                        <p className="text-white font-semibold">{formatCurrency(payout.amount)}</p>
                      </td>
                      <td>
                        <p className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>{payout.bankName}</p>
                        <p className="text-xs" style={{ color: "var(--rs-text-muted)" }}>Account: ****{payout.accountNumber?.slice(-4)}</p>
                        <p className="text-xs capitalize" style={{ color: "var(--rs-text-muted)" }}>{payout.accountType}</p>
                      </td>
                      <td>
                        <StatusBadge tone={payout.status === "paid" ? "paid" : payout.status === "requested" || payout.status === "processing" ? "pending" : payout.status === "rejected" ? "rejected" : "neutral"}>
                          {payout.status}
                        </StatusBadge>
                      </td>
                      <td>
                        <p className="font-mono text-sm" style={{ color: "var(--rs-text-secondary)" }}>{payout.referenceNumber || "-"}</p>
                      </td>
                      <td>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setSelectedPayout(payout)}
                            className="rs-btn-ghost flex items-center gap-1.5 text-xs px-3 py-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          {payout.status === "requested" && (
                            <>
                              <button
                                onClick={() => handlePayoutStatusChange(payout._id, "processing")}
                                className="rs-btn-primary text-xs font-medium rounded-lg px-3 py-1.5"
                              >
                                Process
                              </button>
                              <button
                                onClick={() => handlePayoutStatusChange(payout._id, "rejected")}
                                className="rs-btn-ghost text-xs font-medium rounded-lg px-3 py-1.5"
                                style={{ color: "rgb(248,113,113)", background: "rgba(239,68,68,0.10)", borderColor: "rgba(239,68,68,0.20)" }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {payout.status === "processing" && (
                            <button
                              onClick={() => handlePayoutStatusChange(payout._id, "paid")}
                              className="rs-btn-primary text-xs font-medium rounded-lg px-3 py-1.5"
                              style={{ background: "rgba(34,197,94,0.85)" }}
                            >
                              Mark Paid
                            </button>
                          )}
                          {payout.status === "paid" && (
                            <p className="text-xs" style={{ color: "var(--rs-text-muted)" }}>Paid on {formatDate(payout.processedAt)}</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {allPayoutRequests.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <div className="rs-empty-state">
                          <p className="rs-empty-state-title">No payout requests yet</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Payout Detail Modal */}
      <AnimatePresence>
        {selectedPayout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rs-modal-backdrop"
            onClick={() => setSelectedPayout(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="rs-modal max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rs-modal-header">
                <div className="flex items-center gap-3">
                  <div className="rs-icon-tile rs-icon-tile--info w-12 h-12">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {selectedPayout.affiliate?.firstName} {selectedPayout.affiliate?.lastName}
                    </h2>
                    <p className="text-xs" style={{ color: "var(--rs-text-secondary)" }}>{selectedPayout.affiliate?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPayout(null)}
                  className="rs-btn-ghost p-2"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="rs-modal-body space-y-6">
                {/* Payout Summary */}
                <div className="rs-callout rs-callout--info">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wide" style={{ color: "var(--rs-text-secondary)" }}>Requested Amount</span>
                      <span className="rs-stat text-2xl text-white">{formatCurrency(selectedPayout.amount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: "var(--rs-text-muted)" }}>Reference</span>
                      <span className="font-mono text-sm text-white">{selectedPayout.referenceNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Banknote className="w-4 h-4" />
                    Bank Details
                  </h3>
                  <div className="rs-card p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--rs-text-secondary)" }}>Bank Name</span>
                      <span className="text-white">{selectedPayout.bankName || "Not provided"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--rs-text-secondary)" }}>Account Number</span>
                      <span className="text-white font-mono">{selectedPayout.accountNumber || "Not provided"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--rs-text-secondary)" }}>Account Type</span>
                      <span className="text-white capitalize">{selectedPayout.accountType || "Not provided"}</span>
                    </div>
                  </div>
                </div>

                {/* Affiliate Stats */}
                <div>
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Affiliate Stats
                  </h3>
                  <div className="rs-card p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--rs-text-secondary)" }}>Tier</span>
                      <span className="text-white capitalize">{selectedPayout.affiliate?.tier || "bronze"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--rs-text-secondary)" }}>Total Sales</span>
                      <span className="text-white">{formatCurrency(selectedPayout.affiliate?.totalSales || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--rs-text-secondary)" }}>Total Commission Earned</span>
                      <span className="text-white">{formatCurrency(selectedPayout.affiliate?.totalCommissionEarned || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--rs-text-secondary)" }}>Pending Balance</span>
                      <span style={{ color: "rgb(251,191,36)" }}>{formatCurrency(selectedPayout.affiliate?.pendingCommission || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--rs-text-secondary)" }}>Total Paid</span>
                      <span style={{ color: "rgb(74,222,128)" }}>{formatCurrency(selectedPayout.affiliate?.totalCommissionPaid || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4" style={{ borderTop: "1px solid var(--rs-border)" }}>
                  <button
                    onClick={() => setSelectedPayout(null)}
                    className="rs-btn-ghost flex-1 py-3"
                  >
                    Close
                  </button>
                  {selectedPayout.status === "requested" && (
                    <button
                      onClick={() => {
                        handlePayoutStatusChange(selectedPayout._id, "processing");
                        setSelectedPayout(null);
                      }}
                      className="rs-btn-primary flex-1 py-3"
                    >
                      Process Payment
                    </button>
                  )}
                  {selectedPayout.status === "processing" && (
                    <button
                      onClick={() => {
                        handlePayoutStatusChange(selectedPayout._id, "paid");
                        setSelectedPayout(null);
                      }}
                      className="rs-btn-primary flex-1 py-3"
                      style={{ background: "rgba(34,197,94,0.85)" }}
                    >
                      Mark as Paid
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}