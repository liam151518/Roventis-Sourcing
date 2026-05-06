"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Package, X, FileText, Image, Link, User, Building2, 
  MapPin, Phone, Mail, DollarSign, Truck, CheckCircle, Clock,
  Eye, Download, Upload, Edit, Save, ChevronDown, ChevronUp
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDate, formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";

const orderStatuses = [
  { value: "draft", label: "Draft", color: "bg-[var(--rs-bg-overlay)] text-[var(--rs-text-muted)]" },
  { value: "submitted", label: "Submitted", color: "bg-[var(--rs-info)]/10 text-[var(--rs-info)]" },
  { value: "supplier_confirmed", label: "Supplier Confirmed", color: "bg-violet-500/10 text-violet-400" },
  { value: "in_transit", label: "In Transit", color: "bg-[var(--rs-warning)]/10 text-[var(--rs-warning)]" },
  { value: "delivered", label: "Delivered", color: "bg-[var(--rs-success)]/10 text-[var(--rs-success)]" },
  { value: "installed", label: "Installed", color: "bg-[var(--rs-success)]/10 text-[var(--rs-success)]" },
  { value: "cancelled", label: "Cancelled", color: "bg-[var(--rs-danger)]/10 text-[var(--rs-danger)]" },
];

const commissionStatuses = [
  { value: "pending", label: "Pending", color: "bg-[var(--rs-warning)]/10 text-[var(--rs-warning)]" },
  { value: "approved", label: "Approved", color: "bg-[var(--rs-success)]/10 text-[var(--rs-success)]" },
  { value: "paid", label: "Paid", color: "bg-[var(--rs-info)]/10 text-[var(--rs-info)]" },
];

export default function AdminOrdersPage() {
  const orders = useQuery(api.admin.getAllOrdersAdmin);
  const updateOrderStatus = useMutation(api.admin.updateOrderStatus);
  const updateOrderCommission = useMutation(api.admin.updateOrderCommission);
  const adminUpdateOrder = useMutation(api.orders.adminUpdateOrder);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  // Refresh selected order when orders change
  useEffect(() => {
    if (selectedOrder && orders) {
      const updated = orders.find((o: any) => o._id === selectedOrder._id);
      if (updated) {
        setSelectedOrder(updated);
        setAdminNotes(updated.adminNotes || "");
        setTrackingNumber(updated.trackingNumber || "");
      }
    }
  }, [orders, selectedOrder?._id]);

  const filteredOrders = (orders || []).filter((order: any) => {
    const matchesSearch = 
      order.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.clientCompany?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.affiliate?.firstName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, status: string) => {
    await updateOrderStatus({ orderId: id, status: status as any, trackingNumber });
  };

  const handleCommissionChange = async (id: string, status: string) => {
    await updateOrderCommission({ orderId: id, commissionStatus: status as any });
  };

  const handleSaveNotes = async () => {
    if (selectedOrder) {
      await adminUpdateOrder({
        orderId: selectedOrder._id,
        adminNotes,
        trackingNumber: trackingNumber || undefined,
      });
    }
  };

  const getStatusColor = (status: string) => {
    const statusObj = orderStatuses.find(s => s.value === status);
    return statusObj?.color || "bg-gray-500/20 text-gray-400";
  };

  const getCommissionColor = (status: string) => {
    const statusObj = commissionStatuses.find(s => s.value === status);
    return statusObj?.color || "bg-gray-500/20 text-gray-400";
  };

  if (!orders) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Stats
  const stats = {
    total: orders.length,
    submitted: orders.filter((o: any) => o.status === "submitted").length,
    inProgress: orders.filter((o: any) => ["supplier_confirmed", "in_transit"].includes(o.status)).length,
    completed: orders.filter((o: any) => ["delivered", "installed"].includes(o.status)).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="rs-overline">Admin</span>
          <h1 className="rs-page-title">Orders</h1>
          <p className="text-gray-500 mt-1">Manage all orders with full details and fulfillment</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[var(--rs-warning)]/10 rounded-xl">
            <span className="text-[var(--rs-warning)] font-medium">{stats.submitted} submitted</span>
          </div>
          <div className="px-4 py-2 bg-amber-500/20 rounded-xl">
            <span className="text-amber-400 font-medium">{stats.inProgress} in progress</span>
          </div>
          <div className="px-4 py-2 bg-green-500/20 rounded-xl">
            <span className="text-green-400 font-medium">{stats.completed} completed</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by client, company, or affiliate name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#141417] border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-[#141417] border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Status</option>
          {orderStatuses.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-[#141417] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-gray-400 font-medium">Order ID</th>
                <th className="text-left p-4 text-gray-400 font-medium">Affiliate</th>
                <th className="text-left p-4 text-gray-400 font-medium">Client / Company</th>
                <th className="text-left p-4 text-gray-400 font-medium">Total</th>
                <th className="text-left p-4 text-gray-400 font-medium">Documents</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Commission</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order: any) => (
                <tr key={order._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <p className="text-white font-medium">#{order._id.slice(-8)}</p>
                    <p className="text-gray-500 text-xs">{formatDate(order.createdAt)}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-white">{order.affiliate?.firstName} {order.affiliate?.lastName}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-white">{order.clientName}</p>
                    {order.companyName && <p className="text-gray-500 text-sm">{order.companyName}</p>}
                  </td>
                  <td className="p-4 text-white font-medium">{formatCurrency(order.totalAmount)}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {order.invoiceDocument && <FileText className="w-4 h-4 text-blue-400" />}
                      {order.legalDocument && <FileText className="w-4 h-4 text-green-400" />}
                      {order.paymentProof && <Image className="w-4 h-4 text-purple-400" />}
                      {(order.productImages?.length > 0 || order.mockupPhotos?.length > 0) && <Image className="w-4 h-4 text-pink-400" />}
                      {order.customLogo && <Building2 className="w-4 h-4 text-amber-400" />}
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge tone={order.status === "submitted" || order.status === "supplier_confirmed" || order.status === "in_transit" || order.status === "draft" ? "active" : order.status === "delivered" || order.status === "installed" ? "paid" : "neutral"}>
                      {order.status?.replace("_", " ")}
                    </StatusBadge>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCommissionColor(order.commissionStatus)}`}>
                      {order.commissionStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => { setSelectedOrder(order); setShowDetail(true); setAdminNotes(order.adminNotes || ""); setTrackingNumber(order.trackingNumber || ""); }}
                      className="px-3 py-1 rs-btn-primary text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No orders found</p>
        </div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {showDetail && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141417] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto my-8"
            >
              {/* Header */}
              <div className="sticky top-0 bg-[#141417] border-b border-white/10 p-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-white">Order #{selectedOrder._id.slice(-8)}</h2>
                    <StatusBadge tone={selectedOrder.status === "submitted" || selectedOrder.status === "supplier_confirmed" || selectedOrder.status === "in_transit" || selectedOrder.status === "draft" ? "active" : selectedOrder.status === "delivered" || selectedOrder.status === "installed" ? "paid" : "neutral"}>
                      {selectedOrder.status?.replace("_", " ")}
                    </StatusBadge>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">Created: {formatDate(selectedOrder.createdAt)}</p>
                </div>
                <button
                  onClick={() => setShowDetail(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status & Commission Management */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black/30 rounded-xl p-4">
                    <label className="block text-gray-400 text-sm mb-2">Order Status</label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                      className="w-full px-3 py-2 bg-[#141417] border border-white/10 rounded-lg text-white"
                    >
                      {orderStatuses.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="bg-black/30 rounded-xl p-4">
                    <label className="block text-gray-400 text-sm mb-2">Tracking Number</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number"
                      className="w-full px-3 py-2 bg-[#141417] border border-white/10 rounded-lg text-white"
                    />
                  </div>
                  <div className="bg-black/30 rounded-xl p-4">
                    <label className="block text-gray-400 text-sm mb-2">Commission Status</label>
                    <select
                      value={selectedOrder.commissionStatus}
                      onChange={(e) => handleCommissionChange(selectedOrder._id, e.target.value)}
                      className="w-full px-3 py-2 bg-[#141417] border border-white/10 rounded-lg text-white"
                    >
                      {commissionStatuses.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Affiliate Info */}
                <div className="bg-black/30 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" /> Affiliate Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-gray-500 text-xs">Name</p>
                      <p className="text-white">{selectedOrder.affiliate?.firstName} {selectedOrder.affiliate?.lastName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Email</p>
                      <p className="text-white">{selectedOrder.affiliate?.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Tier</p>
                      <p className="text-white capitalize">{selectedOrder.affiliate?.tier}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Commission Rate</p>
                      <p className="text-white">
                        {selectedOrder.affiliate?.tier === "platinum" ? "12-15%" :
                         selectedOrder.affiliate?.tier === "gold" ? "10%" :
                         selectedOrder.affiliate?.tier === "silver" ? "7.5%" : "5%"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Client & Company Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Client Details */}
                  <div className="bg-black/30 rounded-xl p-4">
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" /> Client Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-500 text-xs">Name</p>
                        <p className="text-white">{selectedOrder.clientName}</p>
                      </div>
                      {selectedOrder.clientCompany && (
                        <div>
                          <p className="text-gray-500 text-xs">Company</p>
                          <p className="text-white">{selectedOrder.clientCompany}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-500 text-xs">Email</p>
                        <p className="text-white">{selectedOrder.clientEmail}</p>
                      </div>
                      {selectedOrder.clientPhone && (
                        <div>
                          <p className="text-gray-500 text-xs">Phone</p>
                          <p className="text-white">{selectedOrder.clientPhone}</p>
                        </div>
                      )}
                      {selectedOrder.deliveryAddress && (
                        <div>
                          <p className="text-gray-500 text-xs">Delivery Address</p>
                          <p className="text-white">{selectedOrder.deliveryAddress}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Company Details */}
                  <div className="bg-black/30 rounded-xl p-4">
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4" /> Company Details (For Manufacturing)
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-500 text-xs">Company Name</p>
                        <p className="text-white">{selectedOrder.companyName || "Not provided"}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-gray-500 text-xs">Registration #</p>
                          <p className="text-white">{selectedOrder.companyRegistrationNumber || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">VAT Number</p>
                          <p className="text-white">{selectedOrder.companyVATNumber || "N/A"}</p>
                        </div>
                      </div>
                      {selectedOrder.companyWebsite && (
                        <div>
                          <p className="text-gray-500 text-xs">Website</p>
                          <a href={selectedOrder.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                            {selectedOrder.companyWebsite}
                          </a>
                        </div>
                      )}
                      {selectedOrder.companyAddress && (
                        <div>
                          <p className="text-gray-500 text-xs">Company Address</p>
                          <p className="text-white">{selectedOrder.companyAddress}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-gray-500 text-xs">Contact Person</p>
                          <p className="text-white">{selectedOrder.contactPersonName || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Contact Email</p>
                          <p className="text-white">{selectedOrder.contactPersonEmail || "N/A"}</p>
                        </div>
                      </div>
                      {selectedOrder.contactPersonPhone && (
                        <div>
                          <p className="text-gray-500 text-xs">Contact Phone</p>
                          <p className="text-white">{selectedOrder.contactPersonPhone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-black/30 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Order Items
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left p-2 text-gray-400 text-sm">Product</th>
                          <th className="text-right p-2 text-gray-400 text-sm">Qty</th>
                          <th className="text-right p-2 text-gray-400 text-sm">Unit Price</th>
                          <th className="text-right p-2 text-gray-400 text-sm">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.map((item: any, idx: number) => (
                          <tr key={idx} className="border-b border-white/5">
                            <td className="p-2 text-white">{item.productName}</td>
                            <td className="p-2 text-white text-right">{item.quantity}</td>
                            <td className="p-2 text-white text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="p-2 text-white text-right">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={3} className="p-2 text-right text-gray-400">Total:</td>
                          <td className="p-2 text-right text-white font-medium">{formatCurrency(selectedOrder.totalAmount)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-black/30 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Documents & Files
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Invoice Document */}
                    <div className="border border-white/10 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-2">Invoice Document</p>
                      {selectedOrder.invoiceDocument ? (
                        <a href={selectedOrder.invoiceDocument} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300">
                          <FileText className="w-5 h-5" /> View Invoice
                        </a>
                      ) : (
                        <p className="text-gray-500 text-sm">Not uploaded</p>
                      )}
                    </div>

                    {/* Legal Document */}
                    <div className="border border-white/10 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-2">Legal Document (Signed)</p>
                      {selectedOrder.legalDocument ? (
                        <a href={selectedOrder.legalDocument} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-green-400 hover:text-green-300">
                          <FileText className="w-5 h-5" /> View Document
                        </a>
                      ) : (
                        <p className="text-gray-500 text-sm">Not uploaded</p>
                      )}
                    </div>

                    {/* Payment Proof */}
                    <div className="border border-white/10 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-2">Payment Proof</p>
                      {selectedOrder.paymentProof ? (
                        <a href={selectedOrder.paymentProof} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-purple-400 hover:text-purple-300">
                          <Image className="w-5 h-5" /> View Proof
                        </a>
                      ) : (
                        <p className="text-gray-500 text-sm">Not uploaded</p>
                      )}
                    </div>

                    {/* Custom Logo */}
                    <div className="border border-white/10 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-2">Custom Logo</p>
                      {selectedOrder.customLogo ? (
                        <a href={selectedOrder.customLogo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
                          <Building2 className="w-5 h-5" /> View Logo
                        </a>
                      ) : (
                        <p className="text-gray-500 text-sm">Not uploaded</p>
                      )}
                    </div>

                    {/* Product Images */}
                    <div className="border border-white/10 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-2">Product Images ({selectedOrder.productImages?.length || 0})</p>
                      {selectedOrder.productImages?.length > 0 ? (
                        <div className="flex gap-2">
                          {selectedOrder.productImages.slice(0, 3).map((img: string, idx: number) => (
                            <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                              <Image className="w-5 h-5 text-pink-400 hover:text-pink-300" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">None uploaded</p>
                      )}
                    </div>

                    {/* Mockup Photos */}
                    <div className="border border-white/10 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-2">Mockup Photos ({selectedOrder.mockupPhotos?.length || 0})</p>
                      {selectedOrder.mockupPhotos?.length > 0 ? (
                        <div className="flex gap-2">
                          {selectedOrder.mockupPhotos.slice(0, 3).map((img: string, idx: number) => (
                            <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                              <Image className="w-5 h-5 text-cyan-400 hover:text-cyan-300" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">None uploaded</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="bg-black/30 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Edit className="w-4 h-4" /> Admin Notes
                  </h3>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this order..."
                    rows={4}
                    className="w-full px-3 py-2 bg-[#141417] border border-white/10 rounded-lg text-white placeholder-gray-500 resize-none"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleSaveNotes}
                      className="flex items-center gap-2 rs-btn-primary"
                    >
                      <Save className="w-4 h-4" />
                      Save Notes
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
