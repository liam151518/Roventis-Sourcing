"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, DollarSign, Package, CheckCircle, Clock, AlertCircle, CreditCard, Banknote, User, Eye, X } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { formatDate, formatCurrency } from "@/lib/utils";

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
      submitted: "bg-blue-500/20 text-blue-400",
      supplier_confirmed: "bg-purple-500/20 text-purple-400",
      in_transit: "bg-amber-500/20 text-amber-400",
      delivered: "bg-green-500/20 text-green-400",
      installed: "bg-emerald-500/20 text-emerald-400",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  };

  const getPayoutStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-500/20 text-green-400";
      case "processing": return "bg-blue-500/20 text-blue-400";
      case "requested": return "bg-amber-500/20 text-amber-400";
      case "rejected": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  if (!orders) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
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
            className={`fixed top-4 right-4 px-4 py-3 rounded-xl z-50 ${
              toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
            } text-white shadow-xl`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Commission Approvals & Payouts</h1>
          <p className="text-gray-500 mt-1">Validate orders and manage affiliate commission payments</p>
        </div>
        <button
          onClick={handleRecalculate}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-medium transition-colors"
        >
          Recalculate Commissions
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab("commissions")}
          className={`px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "commissions" ? "text-white" : "text-gray-500 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Commission Approvals
          </span>
          {activeTab === "commissions" && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("payouts")}
          className={`px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "payouts" ? "text-white" : "text-gray-500 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2">
            <Banknote className="w-4 h-4" />
            Payout Requests
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
              {pendingPayouts.length}
            </span>
          </span>
          {activeTab === "payouts" && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
          )}
        </button>
      </div>

      {/* COMMISSION APPROVALS TAB */}
      {activeTab === "commissions" && (
        <>
          {/* Summary Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#141417] rounded-2xl border border-amber-500/20 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Pending Approval</p>
                  <p className="text-2xl font-semibold text-white">{formatCurrency(totalPendingApproval)}</p>
                </div>
              </div>
            </div>
            <div className="bg-[#141417] rounded-2xl border border-blue-500/20 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <CheckCircle className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Approved — Awaiting Payment</p>
                  <p className="text-2xl font-semibold text-white">{formatCurrency(totalApprovedAwaitingPayment)}</p>
                </div>
              </div>
            </div>
            <div className="bg-[#141417] rounded-2xl border border-green-500/20 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Paid This Month</p>
                  <p className="text-2xl font-semibold text-white">{formatCurrency(totalPaidThisMonth)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-tabs for commission status */}
          <div className="flex gap-2 border-b border-white/10">
            {(["pending", "approved", "paid"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  statusFilter === status ? "text-white" : "text-gray-500 hover:text-white"
                }`}
              >
                {status === "pending" && `Pending (${pendingOrders.length})`}
                {status === "approved" && `Approved (${approvedOrders.length})`}
                {status === "paid" && `Paid (${paidOrders.length})`}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by client or affiliate name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#141417] border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Orders Table */}
          <div className="bg-[#141417] rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-gray-400 font-medium">Order</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Affiliate</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Client</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Total</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Commission</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                    {statusFilter !== "paid" && <th className="text-left p-4 text-gray-400 font-medium">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {getOrdersForTab(statusFilter as any).map((order: any) => (
                    <tr key={order._id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4">
                        <p className="text-white font-medium">#{order._id.slice(-8)}</p>
                        <p className="text-gray-500 text-xs">{formatDate(order.createdAt)}</p>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white">{order.affiliate?.firstName} {order.affiliate?.lastName}</p>
                          <p className="text-gray-500 text-xs">{order.affiliate?.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-white">{order.clientName}</p>
                        {order.clientCompany && <p className="text-gray-500 text-sm">{order.clientCompany}</p>}
                      </td>
                      <td className="p-4 text-white font-medium">{formatCurrency(order.totalAmount)}</td>
                      <td className="p-4">
                        <p className={`font-medium ${
                          order.commissionStatus === "paid" ? "text-green-400" :
                          order.commissionStatus === "approved" ? "text-blue-400" :
                          "text-amber-400"
                        }`}>
                          {formatCurrency(order.commissionAmount || 0)}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status?.replace("_", " ")}
                        </span>
                      </td>
                      {statusFilter !== "paid" && (
                        <td className="p-4">
                          <div className="flex flex-col gap-2">
                            {statusFilter === "pending" && (
                              <button
                                onClick={() => handleApprove(order._id)}
                                disabled={processingId === order._id}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 text-white text-xs font-medium rounded-lg flex items-center gap-1.5"
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
                                  className="px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs"
                                />
                                <button
                                  onClick={() => handleMarkPaid(order._id)}
                                  disabled={processingId === order._id}
                                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-xs font-medium rounded-lg flex items-center gap-1.5"
                                >
                                  {processingId === order._id ? (
                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  ) : (
                                    <CreditCard className="w-3.5 h-3.5" />
                                  )}
                                  Mark Paid
                                </button>
                                {statusFilter === "approved" && (
                                  <p className="text-gray-500 text-xs">
                                    8–10 business days
                                  </p>
                                )}
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
            <div className="bg-[#141417] rounded-2xl border border-amber-500/20 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Pending Payout Requests</p>
                  <p className="text-2xl font-semibold text-white">{formatCurrency(totalPendingPayouts)}</p>
                  <p className="text-gray-500 text-xs">{pendingPayouts.length} requests</p>
                </div>
              </div>
            </div>
            <div className="bg-[#141417] rounded-2xl border border-green-500/20 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Paid Out</p>
                  <p className="text-2xl font-semibold text-white">{formatCurrency(totalPaidPayouts)}</p>
                  <p className="text-gray-500 text-xs">{paidPayouts.length} payouts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payout Requests Table */}
          <div className="bg-[#141417] rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Affiliate</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Amount</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Bank Details</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Reference</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allPayoutRequests.map((payout: any) => (
                    <tr key={payout._id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4">
                        <p className="text-white">{formatDate(payout.requestedAt)}</p>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white">{payout.affiliate?.firstName} {payout.affiliate?.lastName}</p>
                          <p className="text-gray-500 text-xs">{payout.affiliate?.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-white font-semibold">{formatCurrency(payout.amount)}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-400 text-sm">{payout.bankName}</p>
                        <p className="text-gray-500 text-xs">Account: ****{payout.accountNumber?.slice(-4)}</p>
                        <p className="text-gray-500 text-xs capitalize">{payout.accountType}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPayoutStatusColor(payout.status)}`}>
                          {payout.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-500 font-mono text-sm">{payout.referenceNumber || "-"}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setSelectedPayout(payout)}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          {payout.status === "requested" && (
                            <>
                              <button
                                onClick={() => handlePayoutStatusChange(payout._id, "processing")}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg"
                              >
                                Process
                              </button>
                              <button
                                onClick={() => handlePayoutStatusChange(payout._id, "rejected")}
                                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium rounded-lg"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {payout.status === "processing" && (
                            <button
                              onClick={() => handlePayoutStatusChange(payout._id, "paid")}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg"
                            >
                              Mark Paid
                            </button>
                          )}
                          {payout.status === "paid" && (
                            <p className="text-gray-500 text-xs">Paid on {formatDate(payout.processedAt)}</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {allPayoutRequests.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-gray-500">
                        No payout requests yet
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPayout(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#141417] rounded-2xl border border-white/10 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {selectedPayout.affiliate?.firstName} {selectedPayout.affiliate?.lastName}
                    </h2>
                    <p className="text-gray-500 text-sm">{selectedPayout.affiliate?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPayout(null)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Payout Summary */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Requested Amount</span>
                    <span className="text-2xl font-bold text-white">{formatCurrency(selectedPayout.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-500 text-sm">Reference</span>
                    <span className="text-white font-mono text-sm">{selectedPayout.referenceNumber}</span>
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Banknote className="w-4 h-4" />
                    Bank Details
                  </h3>
                  <div className="bg-[#0a0a0b] rounded-xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bank Name</span>
                      <span className="text-white">{selectedPayout.bankName || "Not provided"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account Number</span>
                      <span className="text-white font-mono">{selectedPayout.accountNumber || "Not provided"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account Type</span>
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
                  <div className="bg-[#0a0a0b] rounded-xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tier</span>
                      <span className="text-white capitalize">{selectedPayout.affiliate?.tier || "bronze"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Sales</span>
                      <span className="text-white">{formatCurrency(selectedPayout.affiliate?.totalSales || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Commission Earned</span>
                      <span className="text-white">{formatCurrency(selectedPayout.affiliate?.totalCommissionEarned || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pending Balance</span>
                      <span className="text-amber-400">{formatCurrency(selectedPayout.affiliate?.pendingCommission || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Paid</span>
                      <span className="text-green-400">{formatCurrency(selectedPayout.affiliate?.totalCommissionPaid || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setSelectedPayout(null)}
                    className="flex-1 py-3 border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    Close
                  </button>
                  {selectedPayout.status === "requested" && (
                    <button
                      onClick={() => {
                        handlePayoutStatusChange(selectedPayout._id, "processing");
                        setSelectedPayout(null);
                      }}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
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
                      className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
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