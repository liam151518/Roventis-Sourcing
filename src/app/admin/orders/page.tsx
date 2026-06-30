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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--rs-bg-base)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: "var(--rs-accent)" }} />
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
      <div className="rs-page-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="rs-overline">Admin</span>
          <h1 className="rs-page-title mt-1">Orders</h1>
          <p className="rs-page-subtitle">Manage all orders with full details and fulfillment</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rs-pill" style={{ background: "rgba(245,158,11,0.10)", color: "rgb(251,191,36)", borderColor: "rgba(245,158,11,0.20)" }}>
            {stats.submitted} submitted
          </div>
          <div className="rs-pill" style={{ background: "rgba(249,115,22,0.10)", color: "rgb(251,146,60)", borderColor: "rgba(249,115,22,0.20)" }}>
            {stats.inProgress} in progress
          </div>
          <div className="rs-pill" style={{ background: "rgba(34,197,94,0.10)", color: "rgb(74,222,128)", borderColor: "rgba(34,197,94,0.20)" }}>
            {stats.completed} completed
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rs-card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
            <input
              type="text"
              placeholder="Search by client, company, or affiliate name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rs-input w-full pl-11"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rs-input md:w-56"
          >
            <option value="all">All Status</option>
            {orderStatuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rs-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="rs-table w-full">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Affiliate</th>
                <th>Client / Company</th>
                <th>Total</th>
                <th>Documents</th>
                <th>Status</th>
                <th>Commission</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order: any) => (
                <tr key={order._id}>
                  <td>
                    <p className="font-medium text-white">#{order._id.slice(-8)}</p>
                    <p className="text-xs" style={{ color: "var(--rs-text-secondary)" }}>{formatDate(order.createdAt)}</p>
                  </td>
                  <td>{order.affiliate?.firstName} {order.affiliate?.lastName}</td>
                  <td>
                    <p className="text-white">{order.clientName}</p>
                    {order.companyName && <p className="text-xs" style={{ color: "var(--rs-text-secondary)" }}>{order.companyName}</p>}
                  </td>
                  <td className="font-medium">{formatCurrency(order.totalAmount)}</td>
                  <td>
                    <div className="flex gap-1">
                      {order.invoiceDocument && <FileText className="w-4 h-4" style={{ color: "rgb(96,165,250)" }} />}
                      {order.legalDocument && <FileText className="w-4 h-4" style={{ color: "rgb(74,222,128)" }} />}
                      {order.paymentProof && <Image className="w-4 h-4" style={{ color: "var(--rs-text-accent)" }} />}
                      {(order.productImages?.length > 0 || order.mockupPhotos?.length > 0) && <Image className="w-4 h-4" style={{ color: "rgb(244,114,182)" }} />}
                      {order.customLogo && <Building2 className="w-4 h-4" style={{ color: "rgb(251,191,36)" }} />}
                    </div>
                  </td>
                  <td>
                    <StatusBadge tone={order.status === "submitted" || order.status === "supplier_confirmed" || order.status === "in_transit" || order.status === "draft" ? "active" : order.status === "delivered" || order.status === "installed" ? "paid" : "neutral"}>
                      {order.status?.replace("_", " ")}
                    </StatusBadge>
                  </td>
                  <td>
                    <span
                      className="rs-pill"
                      style={
                        order.commissionStatus === "paid"
                          ? { background: "rgba(34,197,94,0.10)", color: "rgb(74,222,128)", borderColor: "rgba(34,197,94,0.20)" }
                          : order.commissionStatus === "approved"
                          ? { background: "rgba(59,130,246,0.10)", color: "rgb(96,165,250)", borderColor: "rgba(59,130,246,0.20)" }
                          : { background: "rgba(245,158,11,0.10)", color: "rgb(251,191,36)", borderColor: "rgba(245,158,11,0.20)" }
                      }
                    >
                      {order.commissionStatus}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => { setSelectedOrder(order); setShowDetail(true); setAdminNotes(order.adminNotes || ""); setTrackingNumber(order.trackingNumber || ""); }}
                      className="rs-btn-ghost text-sm px-3 py-1.5"
                      style={{ color: "var(--rs-text-accent)", borderColor: "rgba(124,58,237,0.25)" }}
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
        <div className="rs-empty-state">
          <Package className="rs-empty-state-icon" />
          <p className="rs-empty-state-title">No orders found</p>
          <p className="rs-empty-state-description">Try adjusting the filters.</p>
        </div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {showDetail && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rs-modal-backdrop items-start"
            onClick={() => setShowDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rs-modal w-full max-w-5xl my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="rs-modal-header sticky top-0 z-10">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-white">Order #{selectedOrder._id.slice(-8)}</h2>
                    <StatusBadge tone={selectedOrder.status === "submitted" || selectedOrder.status === "supplier_confirmed" || selectedOrder.status === "in_transit" || selectedOrder.status === "draft" ? "active" : selectedOrder.status === "delivered" || selectedOrder.status === "installed" ? "paid" : "neutral"}>
                      {selectedOrder.status?.replace("_", " ")}
                    </StatusBadge>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--rs-text-secondary)" }}>Created: {formatDate(selectedOrder.createdAt)}</p>
                </div>
                <button
                  onClick={() => setShowDetail(false)}
                  className="rs-btn-ghost p-2"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="rs-modal-body space-y-6">
                {/* Status & Commission Management */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide mb-2" style={{ color: "var(--rs-text-secondary)" }}>Order Status</label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                      className="rs-input w-full"
                    >
                      {orderStatuses.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide mb-2" style={{ color: "var(--rs-text-secondary)" }}>Tracking Number</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number"
                      className="rs-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide mb-2" style={{ color: "var(--rs-text-secondary)" }}>Commission Status</label>
                    <select
                      value={selectedOrder.commissionStatus}
                      onChange={(e) => handleCommissionChange(selectedOrder._id, e.target.value)}
                      className="rs-input w-full"
                    >
                      {commissionStatuses.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Affiliate Info */}
                <div className="rs-card p-5">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <User className="w-4 h-4" /> Affiliate Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide" style={{ color: "var(--rs-text-muted)" }}>Name</p>
                      <p className="text-white mt-0.5">{selectedOrder.affiliate?.firstName} {selectedOrder.affiliate?.lastName}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide" style={{ color: "var(--rs-text-muted)" }}>Email</p>
                      <p className="text-white mt-0.5">{selectedOrder.affiliate?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide" style={{ color: "var(--rs-text-muted)" }}>Tier</p>
                      <p className="text-white capitalize mt-0.5">{selectedOrder.affiliate?.tier}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide" style={{ color: "var(--rs-text-muted)" }}>Commission Rate</p>
                      <p className="text-white mt-0.5">
                        {selectedOrder.affiliate?.tier === "platinum" ? "12-15%" :
                         selectedOrder.affiliate?.tier === "gold" ? "10%" :
                         selectedOrder.affiliate?.tier === "silver" ? "7.5%" : "5%"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Client & Company Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rs-card p-5">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                      <User className="w-4 h-4" /> Client Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide" style={{ color: "var(--rs-text-muted)" }}>Name</p>
                        <p className="text-white mt-0.5">{selectedOrder.clientName}</p>
                      </div>
                      {selectedOrder.clientCompany && (
                        <div>
                          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--rs-text-muted)" }}>Company</p>
                          <p className="text-white mt-0.5">{selectedOrder.clientCompany}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs uppercase tracking-wide" style={{ color: "var(--rs-text-muted)" }}>Email</p>
                        <p className="text-white mt-0.5">{selectedOrder.clientEmail}</p>
                      </div>
                      {selectedOrder.clientPhone && (
                        <div>
                          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--rs-text-muted)" }}>Phone</p>
                          <p className="text-white mt-0.5">{selectedOrder.clientPhone}</p>
                        </div>
                      )}
                      {selectedOrder.deliveryAddress && (
                        <div>
                          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--rs-text-muted)" }}>Delivery Address</p>
                          <p className="text-white mt-0.5">{selectedOrder.deliveryAddress}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rs-card p-5">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                      <Building2 className="w-4 h-4" /> Company Details (For Manufacturing)
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide" style={{ color: "var(--rs-text-muted)" }}>Company Name</p>
                        <p className="text-white mt-0.5">{selectedOrder.companyName || "Not provided"}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--rs-text-muted)" }}>Registration #</p>
                          <p className="text-white mt-0.5">{selectedOrder.companyRegistrationNumber || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--rs-text-muted)" }}>VAT Number</p>
                          <p className="text-white mt-0.5">{selectedOrder.companyVATNumber || "N/A"}</p>
                        </div>
                      </div>
                      {selectedOrder.companyWebsite && (
                        <div>
                          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--rs-text-muted)" }}>Website</p>
                          <a href={selectedOrder.companyWebsite} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "rgb(96,165,250)" }}>
                            {selectedOrder.companyWebsite}
                          </a>
                        </div>
                      )}
                      {selectedOrder.companyAddress && (
                        <div>
                          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--rs-text-muted)" }}>Company Address</p>
                          <p className="text-white mt-0.5">{selectedOrder.companyAddress}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--rs-text-muted)" }}>Contact Person</p>
                          <p className="text-white mt-0.5">{selectedOrder.contactPersonName || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--rs-text-muted)" }}>Contact Email</p>
                          <p className="text-white mt-0.5">{selectedOrder.contactPersonEmail || "N/A"}</p>
                        </div>
                      </div>
                      {selectedOrder.contactPersonPhone && (
                        <div>
                          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--rs-text-muted)" }}>Contact Phone</p>
                          <p className="text-white mt-0.5">{selectedOrder.contactPersonPhone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="rs-card p-5">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Order Items
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="rs-table w-full">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th className="text-right">Qty</th>
                          <th className="text-right">Unit Price</th>
                          <th className="text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.map((item: any, idx: number) => (
                          <tr key={idx}>
                            <td>{item.productName}</td>
                            <td className="text-right">{item.quantity}</td>
                            <td className="text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="text-right">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={3} className="text-right" style={{ color: "var(--rs-text-secondary)" }}>Total:</td>
                          <td className="text-right font-medium text-white">{formatCurrency(selectedOrder.totalAmount)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Documents */}
                <div className="rs-card p-5">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Documents & Files
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="rs-card p-3">
                      <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--rs-text-muted)" }}>Invoice Document</p>
                      {selectedOrder.invoiceDocument ? (
                        <a href={selectedOrder.invoiceDocument} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline" style={{ color: "rgb(96,165,250)" }}>
                          <FileText className="w-5 h-5" /> View Invoice
                        </a>
                      ) : (
                        <p className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>Not uploaded</p>
                      )}
                    </div>

                    <div className="rs-card p-3">
                      <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--rs-text-muted)" }}>Legal Document (Signed)</p>
                      {selectedOrder.legalDocument ? (
                        <a href={selectedOrder.legalDocument} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline" style={{ color: "rgb(74,222,128)" }}>
                          <FileText className="w-5 h-5" /> View Document
                        </a>
                      ) : (
                        <p className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>Not uploaded</p>
                      )}
                    </div>

                    <div className="rs-card p-3">
                      <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--rs-text-muted)" }}>Payment Proof</p>
                      {selectedOrder.paymentProof ? (
                        <a href={selectedOrder.paymentProof} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline" style={{ color: "var(--rs-text-accent)" }}>
                          <Image className="w-5 h-5" /> View Proof
                        </a>
                      ) : (
                        <p className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>Not uploaded</p>
                      )}
                    </div>

                    <div className="rs-card p-3">
                      <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--rs-text-muted)" }}>Custom Logo</p>
                      {selectedOrder.customLogo ? (
                        <a href={selectedOrder.customLogo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline" style={{ color: "rgb(251,191,36)" }}>
                          <Building2 className="w-5 h-5" /> View Logo
                        </a>
                      ) : (
                        <p className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>Not uploaded</p>
                      )}
                    </div>

                    <div className="rs-card p-3">
                      <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--rs-text-muted)" }}>Product Images ({selectedOrder.productImages?.length || 0})</p>
                      {selectedOrder.productImages?.length > 0 ? (
                        <div className="flex gap-2">
                          {selectedOrder.productImages.slice(0, 3).map((img: string, idx: number) => (
                            <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                              <Image className="w-5 h-5" style={{ color: "rgb(244,114,182)" }} />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>None uploaded</p>
                      )}
                    </div>

                    <div className="rs-card p-3">
                      <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--rs-text-muted)" }}>Mockup Photos ({selectedOrder.mockupPhotos?.length || 0})</p>
                      {selectedOrder.mockupPhotos?.length > 0 ? (
                        <div className="flex gap-2">
                          {selectedOrder.mockupPhotos.slice(0, 3).map((img: string, idx: number) => (
                            <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                              <Image className="w-5 h-5" style={{ color: "rgb(34,211,238)" }} />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>None uploaded</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="rs-card p-5">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Edit className="w-4 h-4" /> Admin Notes
                  </h3>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this order..."
                    rows={4}
                    className="rs-input rs-input--textarea w-full"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleSaveNotes}
                      className="rs-btn-primary flex items-center gap-2"
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
