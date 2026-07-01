"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Plus, 
  Search, 
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  ChevronRight,
  Eye,
  Edit,
  X,
  FileText,
  Image,
  Building2,
  User,
  Link,
  Upload,
  Trash2,
  Save,
  Send
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";

const statusConfig = {
  draft: { label: "Draft", color: "bg-gray-500/10 text-gray-400", icon: Edit },
  submitted: { label: "Submitted", color: "bg-[var(--rs-info)]/10 text-[var(--rs-info)]", icon: Clock },
  supplier_confirmed: { label: "Supplier Confirmed", color: "bg-purple-500/10 text-purple-400", icon: CheckCircle },
  in_transit: { label: "In Transit", color: "bg-[var(--rs-warning)]/10 text-[var(--rs-warning)]", icon: Truck },
  delivered: { label: "Delivered", color: "bg-[var(--rs-success)]/10 text-[var(--rs-success)]", icon: CheckCircle },
  installed: { label: "Installed", color: "bg-green-500/10 text-green-400", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-[var(--rs-danger)]/10 text-[var(--rs-danger)]", icon: XCircle },
};

const commissionStatusConfig = {
  pending: { label: "Pending", color: "bg-[var(--rs-warning)]/10 text-[var(--rs-warning)]" },
  approved: { label: "Approved", color: "bg-[var(--rs-success)]/10 text-[var(--rs-success)]" },
  paid: { label: "Paid", color: "bg-[var(--rs-info)]/10 text-[var(--rs-info)]" },
};

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function OrdersPage() {
  const { userId } = useAuth();
  const currentAffiliate = useQuery(
    api.affiliates.getCurrentAffiliate,
    { clerkUserId: userId || undefined }
  );
  const orders = useQuery(api.orders.getMyOrders, { 
    affiliateId: currentAffiliate?._id as string 
  });
  const createOrder = useMutation(api.orders.createOrder);
  const submitOrder = useMutation(api.orders.submitOrder);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Order Form State
  const [formData, setFormData] = useState({
    // Client Info
    clientName: "",
    clientCompany: "",
    clientEmail: "",
    clientPhone: "",
    deliveryAddress: "",
    // Company Details
    companyName: "",
    companyRegistrationNumber: "",
    companyVATNumber: "",
    companyWebsite: "",
    companyAddress: "",
    contactPersonName: "",
    contactPersonEmail: "",
    contactPersonPhone: "",
    // Notes
    notes: "",
    // Documents (URLs)
    invoiceDocument: "",
    legalDocument: "",
    paymentProof: "",
    customLogo: "",
    productImages: [] as string[],
    mockupPhotos: [] as string[],
  });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { productName: "", quantity: 1, unitPrice: 0, total: 0 }
  ]);

  // Loading state
  if (currentAffiliate === null || orders === null) {
    return (
      <div className="space-y-6">
        <div className="rs-skeleton h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rs-skeleton h-24" />
          <div className="rs-skeleton h-24" />
          <div className="rs-skeleton h-24" />
          <div className="rs-skeleton h-24" />
        </div>
        <div className="space-y-3">
          <div className="rs-skeleton h-28" />
          <div className="rs-skeleton h-28" />
        </div>
      </div>
    );
  }

  // Filter orders
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = 
      order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.clientCompany?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.clientEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const stats = [
    {
      label: "Total Orders",
      value: orders?.length || 0,
      icon: Package,
      tone: "info" as const,
    },
    {
      label: "In Progress",
      value: orders?.filter(o => ["submitted", "supplier_confirmed", "in_transit"].includes(o.status)).length || 0,
      icon: Clock,
      tone: "warning" as const,
    },
    {
      label: "Delivered",
      value: orders?.filter(o => ["delivered", "installed"].includes(o.status)).length || 0,
      icon: CheckCircle,
      tone: "success" as const,
    },
    {
      label: "Total Value",
      value: formatCurrency(orders?.reduce((sum, o) => sum + o.totalAmount, 0) || 0),
      icon: DollarSign,
      tone: "accent" as const,
    },
  ];

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setOrderItems(newItems);
  };

  const addItem = () => {
    setOrderItems([...orderItems, { productName: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleAddUrl = (field: "productImages" | "mockupPhotos", url: string) => {
    if (url.trim()) {
      setFormData({
        ...formData,
        [field]: [...formData[field], url.trim()]
      });
    }
  };

  const handleRemoveUrl = (field: "productImages" | "mockupPhotos", index: number) => {
    const newUrls = [...formData[field]];
    newUrls.splice(index, 1);
    setFormData({
      ...formData,
      [field]: newUrls
    });
  };

  const handleCreateOrder = async () => {
    if (!currentAffiliate?._id || !formData.clientName || !formData.clientEmail || orderItems.every(i => !i.productName)) {
      return;
    }

    setSubmitting(true);
    try {
      const validItems = orderItems.filter(i => i.productName && i.quantity > 0);
      
      await createOrder({
        affiliateId: currentAffiliate._id,
        clientName: formData.clientName,
        clientCompany: formData.clientCompany || undefined,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone || undefined,
        deliveryAddress: formData.deliveryAddress || undefined,
        companyName: formData.companyName || undefined,
        companyRegistrationNumber: formData.companyRegistrationNumber || undefined,
        companyVATNumber: formData.companyVATNumber || undefined,
        companyWebsite: formData.companyWebsite || undefined,
        companyAddress: formData.companyAddress || undefined,
        contactPersonName: formData.contactPersonName || undefined,
        contactPersonEmail: formData.contactPersonEmail || undefined,
        contactPersonPhone: formData.contactPersonPhone || undefined,
        items: validItems,
        totalAmount: calculateTotal(),
        notes: formData.notes || undefined,
        invoiceDocument: formData.invoiceDocument || undefined,
        legalDocument: formData.legalDocument || undefined,
        paymentProof: formData.paymentProof || undefined,
        customLogo: formData.customLogo || undefined,
        productImages: formData.productImages.length > 0 ? formData.productImages : undefined,
        mockupPhotos: formData.mockupPhotos.length > 0 ? formData.mockupPhotos : undefined,
      });

      // Reset form
      setFormData({
        clientName: "",
        clientCompany: "",
        clientEmail: "",
        clientPhone: "",
        deliveryAddress: "",
        companyName: "",
        companyRegistrationNumber: "",
        companyVATNumber: "",
        companyWebsite: "",
        companyAddress: "",
        contactPersonName: "",
        contactPersonEmail: "",
        contactPersonPhone: "",
        notes: "",
        invoiceDocument: "",
        legalDocument: "",
        paymentProof: "",
        customLogo: "",
        productImages: [],
        mockupPhotos: [],
      });
      setOrderItems([{ productName: "", quantity: 1, unitPrice: 0, total: 0 }]);
      setShowNewOrderModal(false);
    } catch (error) {
      console.error("Failed to create order:", error);
    }
    setSubmitting(false);
  };

  const handleSubmitToAdmin = async (orderId: string) => {
    await submitOrder({ orderId });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="rs-overline">Orders</span>
          <h1 className="rs-page-title text-2xl md:text-[28px] mt-1">
            Track and manage your orders
          </h1>
          <p className="rs-page-subtitle">
            From draft to installation — track every step of your fulfillment.
          </p>
        </div>
        <button
          onClick={() => setShowNewOrderModal(true)}
          className="rs-btn-primary"
        >
          <Plus className="w-4 h-4" />
          New Order
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rs-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`rs-icon-tile rs-icon-tile--${stat.tone}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-white rs-stat">{stat.value}</div>
            <div className="text-xs mt-1" style={{ color: "var(--rs-text-secondary)" }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "var(--rs-text-muted)" }}
          />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rs-input rs-input--search"
            style={{ height: 42 }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rs-input md:w-56"
          style={{ height: 42 }}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="supplier_confirmed">Supplier Confirmed</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="installed">Installed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, index) => {
            const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Clock;
            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => {
                  setSelectedOrder(order);
                  setShowOrderModal(true);
                }}
                className="rs-card p-5 cursor-pointer transition-all hover:border-white/10"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rs-icon-tile rs-icon-tile--accent">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{order.clientName}</h3>
                      <p className="text-xs" style={{ color: "var(--rs-text-secondary)" }}>
                        {order.clientCompany || "Individual"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px]" style={{ color: "var(--rs-text-muted)" }}>
                        Order Value
                      </p>
                      <p className="text-sm font-semibold text-white">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px]" style={{ color: "var(--rs-text-muted)" }}>
                        Commission
                      </p>
                      <p
                        className="text-sm font-semibold"
                        style={{
                          color:
                            order.commissionStatus === "approved" || order.commissionStatus === "paid"
                              ? "var(--rs-success)"
                              : "var(--rs-warning)",
                        }}
                      >
                        {formatCurrency(order.commissionAmount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        tone={
                          order.status === "submitted" ||
                          order.status === "supplier_confirmed" ||
                          order.status === "in_transit"
                            ? "active"
                            : order.status === "delivered" || order.status === "installed"
                              ? "paid"
                              : "neutral"
                        }
                      >
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
                      </StatusBadge>
                    </div>
                    <ChevronRight
                      className="w-4 h-4"
                      style={{ color: "var(--rs-text-muted)" }}
                    />
                  </div>
                </div>

                {/* Order Items Preview */}
                <div
                  className="mt-4 pt-3"
                  style={{ borderTop: "1px solid var(--rs-border)" }}
                >
                  <div className="flex flex-wrap gap-2">
                    {order.items?.slice(0, 3).map((item: any, i: number) => (
                      <span
                        key={i}
                        className="rs-pill"
                        style={{ fontSize: 10 }}
                      >
                        {item.productName} ×{item.quantity}
                      </span>
                    ))}
                    {order.items?.length > 3 && (
                      <span
                        className="rs-pill"
                        style={{
                          background: "var(--rs-bg-overlay)",
                          color: "var(--rs-text-muted)",
                          fontSize: 10,
                        }}
                      >
                        +{order.items.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Submit to Admin Button for Drafts */}
                {order.status === "draft" && (
                  <div
                    className="mt-3 pt-3 flex justify-end"
                    style={{ borderTop: "1px solid var(--rs-border)" }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubmitToAdmin(order._id);
                      }}
                      className="rs-btn-primary"
                      style={{ height: 34 }}
                    >
                      <Send className="w-3.5 h-3.5" />
                      Submit for Approval
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="rs-empty-state py-16">
            <div className="rs-empty-state-icon">
              <Package className="w-5 h-5" />
            </div>
            <div className="rs-empty-state-title">No orders found</div>
            <div className="rs-empty-state-description">
              Create your first order or adjust your filters.
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {showOrderModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rs-modal-backdrop"
            onClick={() => setShowOrderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rs-modal max-w-2xl w-full p-0"
            >
              <div className="rs-modal-header">
                <div>
                  <h2 className="text-base font-semibold text-white">Order Details</h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rs-text-muted)" }}>
                    #{selectedOrder._id.slice(-8)}
                  </p>
                </div>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
                  style={{ color: "var(--rs-text-secondary)" }}
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="rs-modal-body space-y-5">
                {/* Status Progress */}
                <div>
                  <div className="flex items-center justify-between">
                    {["draft", "submitted", "supplier_confirmed", "in_transit", "delivered", "installed"].map((status, i, arr) => {
                      const isActive = arr.indexOf(selectedOrder.status) >= i;
                      const isCurrent = selectedOrder.status === status;
                      return (
                        <div key={status} className="flex items-center">
                          <div className="flex flex-col items-center">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{
                                background: isActive
                                  ? isCurrent
                                    ? "var(--rs-accent)"
                                    : "var(--rs-success)"
                                  : "var(--rs-bg-overlay)",
                                border: isCurrent ? "2px solid var(--rs-accent)" : "0",
                              }}
                            />
                            {i < 5 && (
                              <div
                                className="w-8 h-0.5 mt-1"
                                style={{
                                  background: isActive
                                    ? "var(--rs-success)"
                                    : "var(--rs-bg-overlay)",
                                }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2">
                    <span
                      className="text-xs font-medium"
                      style={{
                        color:
                          selectedOrder.status === "draft"
                            ? "var(--rs-text-accent)"
                            : "var(--rs-success)",
                      }}
                    >
                      {statusConfig[selectedOrder.status as keyof typeof statusConfig]?.label}
                    </span>
                  </div>
                </div>

                {/* Client Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="p-4 rounded-lg"
                    style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}
                  >
                    <p className="text-[10px] mb-1" style={{ color: "var(--rs-text-muted)" }}>
                      CLIENT
                    </p>
                    <p className="text-sm font-medium text-white">{selectedOrder.clientName}</p>
                    {selectedOrder.clientCompany && (
                      <p className="text-xs mt-0.5" style={{ color: "var(--rs-text-secondary)" }}>
                        {selectedOrder.clientCompany}
                      </p>
                    )}
                  </div>
                  <div
                    className="p-4 rounded-lg"
                    style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}
                  >
                    <p className="text-[10px] mb-1" style={{ color: "var(--rs-text-muted)" }}>
                      CONTACT
                    </p>
                    <p className="text-sm font-medium text-white">{selectedOrder.clientEmail}</p>
                    {selectedOrder.clientPhone && (
                      <p className="text-xs mt-0.5" style={{ color: "var(--rs-text-secondary)" }}>
                        {selectedOrder.clientPhone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Company Details */}
                {selectedOrder.companyName && (
                  <div
                    className="p-4 rounded-lg"
                    style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}
                  >
                    <p
                      className="text-[10px] mb-3 flex items-center gap-2"
                      style={{ color: "var(--rs-text-muted)" }}
                    >
                      <Building2 className="w-3.5 h-3.5" /> COMPANY DETAILS
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px]" style={{ color: "var(--rs-text-muted)" }}>
                          Company Name
                        </p>
                        <p className="text-xs text-white mt-0.5">{selectedOrder.companyName}</p>
                      </div>
                      <div>
                        <p className="text-[10px]" style={{ color: "var(--rs-text-muted)" }}>
                          Registration #
                        </p>
                        <p className="text-xs text-white mt-0.5">
                          {selectedOrder.companyRegistrationNumber || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px]" style={{ color: "var(--rs-text-muted)" }}>
                          VAT Number
                        </p>
                        <p className="text-xs text-white mt-0.5">
                          {selectedOrder.companyVATNumber || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px]" style={{ color: "var(--rs-text-muted)" }}>
                          Website
                        </p>
                        <p className="text-xs text-white mt-0.5">
                          {selectedOrder.companyWebsite || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delivery Address */}
                {selectedOrder.deliveryAddress && (
                  <div
                    className="p-4 rounded-lg"
                    style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}
                  >
                    <p className="text-[10px] mb-2" style={{ color: "var(--rs-text-muted)" }}>
                      DELIVERY ADDRESS
                    </p>
                    <div className="flex items-start gap-2">
                      <MapPin
                        className="w-3.5 h-3.5 mt-0.5"
                        style={{ color: "var(--rs-text-muted)" }}
                      />
                      <p className="text-sm text-white">{selectedOrder.deliveryAddress}</p>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <div className="rs-section-header-title mb-3">Order Items</div>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{
                          background: "var(--rs-bg-base)",
                          border: "1px solid var(--rs-border)",
                        }}
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{item.productName}</p>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "var(--rs-text-secondary)" }}
                          >
                            Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-white rs-stat">
                          {formatCurrency(item.total)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div
                    className="mt-3 pt-3 flex justify-between"
                    style={{ borderTop: "1px solid var(--rs-border)" }}
                  >
                    <span
                      className="text-xs"
                      style={{ color: "var(--rs-text-secondary)" }}
                    >
                      Total
                    </span>
                    <span className="text-base font-semibold text-white rs-stat">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Documents */}
                {(selectedOrder.invoiceDocument || selectedOrder.legalDocument || selectedOrder.paymentProof || selectedOrder.customLogo || selectedOrder.productImages?.length > 0 || selectedOrder.mockupPhotos?.length > 0) && (
                  <div>
                    <div className="rs-section-header-title mb-3">Uploaded Documents</div>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedOrder.invoiceDocument && (
                        <a
                          href={selectedOrder.invoiceDocument}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rs-pill hover:bg-white/10 transition-colors"
                          style={{ color: "var(--rs-info)" }}
                        >
                          <FileText className="w-3.5 h-3.5" /> Invoice
                        </a>
                      )}
                      {selectedOrder.legalDocument && (
                        <a
                          href={selectedOrder.legalDocument}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rs-pill hover:bg-white/10 transition-colors"
                          style={{ color: "var(--rs-success)" }}
                        >
                          <FileText className="w-3.5 h-3.5" /> Legal Document
                        </a>
                      )}
                      {selectedOrder.paymentProof && (
                        <a
                          href={selectedOrder.paymentProof}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rs-pill hover:bg-white/10 transition-colors"
                          style={{ color: "var(--rs-text-accent)" }}
                        >
                          <Image className="w-3.5 h-3.5" /> Payment Proof
                        </a>
                      )}
                      {selectedOrder.customLogo && (
                        <a
                          href={selectedOrder.customLogo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rs-pill hover:bg-white/10 transition-colors"
                          style={{ color: "var(--rs-warning)" }}
                        >
                          <Building2 className="w-3.5 h-3.5" /> Custom Logo
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Commission & Tracking */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="p-4 rounded-lg"
                    style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}
                  >
                    <p className="text-[10px] mb-1" style={{ color: "var(--rs-text-muted)" }}>
                      COMMISSION STATUS
                    </p>
                    <span
                      className="rs-pill mt-1"
                      style={{
                        background:
                          selectedOrder.commissionStatus === "pending"
                            ? "rgba(245,158,11,0.10)"
                            : selectedOrder.commissionStatus === "approved"
                              ? "rgba(16,185,129,0.10)"
                              : "rgba(59,130,246,0.10)",
                        color:
                          selectedOrder.commissionStatus === "pending"
                            ? "var(--rs-warning)"
                            : selectedOrder.commissionStatus === "approved"
                              ? "var(--rs-success)"
                              : "var(--rs-info)",
                      }}
                    >
                      {commissionStatusConfig[selectedOrder.commissionStatus as keyof typeof commissionStatusConfig]?.label || selectedOrder.commissionStatus}
                    </span>
                    <p className="text-sm font-semibold text-white mt-2 rs-stat">
                      {formatCurrency(selectedOrder.commissionAmount)}
                    </p>
                  </div>
                  {selectedOrder.trackingNumber && (
                    <div
                      className="p-4 rounded-lg"
                      style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}
                    >
                      <p className="text-[10px] mb-1" style={{ color: "var(--rs-text-muted)" }}>
                        TRACKING
                      </p>
                      <p className="text-sm font-medium text-white">{selectedOrder.trackingNumber}</p>
                      {selectedOrder.deliveryDate && (
                        <p
                          className="text-xs mt-1"
                          style={{ color: "var(--rs-text-secondary)" }}
                        >
                          Delivered: {new Date(selectedOrder.deliveryDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Order Modal */}
      <AnimatePresence>
        {showNewOrderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rs-modal-backdrop items-start"
            onClick={() => setShowNewOrderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rs-modal w-full max-w-4xl p-0 my-8"
            >
              <div className="rs-modal-header">
                <div>
                  <h2 className="text-base font-semibold text-white">Create New Order</h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rs-text-muted)" }}>
                    Fill in all details and upload required documents
                  </p>
                </div>
                <button
                  onClick={() => setShowNewOrderModal(false)}
                  className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
                  style={{ color: "var(--rs-text-secondary)" }}
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Client Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2" style={{ color: "var(--rs-text-primary)" }}>
                    <User className="w-3.5 h-3.5" /> Client Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Client Name *</label>
                      <input
                        type="text"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        className="rs-input"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Company Name</label>
                      <input
                        type="text"
                        value={formData.clientCompany}
                        onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                        className="rs-input"
                        placeholder="Acme Corp"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Email *</label>
                      <input
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        className="rs-input"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Phone</label>
                      <input
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        className="rs-input"
                        placeholder="+27 82 123 4567"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Delivery Address</label>
                      <input
                        type="text"
                        value={formData.deliveryAddress}
                        onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                        className="rs-input"
                        placeholder="123 Main Street, City, 8001"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Details (For Manufacturing) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2" style={{ color: "var(--rs-text-primary)" }}>
                    <Building2 className="w-3.5 h-3.5" /> Company Details (For Manufacturing)
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Company Name</label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="rs-input"
                        placeholder="Acme Manufacturing"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Registration Number</label>
                      <input
                        type="text"
                        value={formData.companyRegistrationNumber}
                        onChange={(e) => setFormData({ ...formData, companyRegistrationNumber: e.target.value })}
                        className="rs-input"
                        placeholder="2021/123456/07"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>VAT Number</label>
                      <input
                        type="text"
                        value={formData.companyVATNumber}
                        onChange={(e) => setFormData({ ...formData, companyVATNumber: e.target.value })}
                        className="rs-input"
                        placeholder="4120185361"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Website</label>
                      <input
                        type="url"
                        value={formData.companyWebsite}
                        onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                        className="rs-input"
                        placeholder="https://acme.co.za"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Company Address</label>
                      <input
                        type="text"
                        value={formData.companyAddress}
                        onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                        className="rs-input"
                        placeholder="Factory Address for Manufacturing"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Contact Person Name</label>
                      <input
                        type="text"
                        value={formData.contactPersonName}
                        onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
                        className="rs-input"
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Contact Person Email</label>
                      <input
                        type="email"
                        value={formData.contactPersonEmail}
                        onChange={(e) => setFormData({ ...formData, contactPersonEmail: e.target.value })}
                        className="rs-input"
                        placeholder="jane@acme.co.za"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Contact Person Phone</label>
                      <input
                        type="tel"
                        value={formData.contactPersonPhone}
                        onChange={(e) => setFormData({ ...formData, contactPersonPhone: e.target.value })}
                        className="rs-input"
                        placeholder="+27 82 987 6543"
                      />
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2" style={{ color: "var(--rs-text-primary)" }}>
                      <Package className="w-3.5 h-3.5" /> Order Items
                    </h3>
                    <button
                      type="button"
                      onClick={addItem}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors"
                      style={{ color: "var(--rs-text-accent)" }}
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {orderItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 rounded-lg"
                        style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}
                      >
                        <input
                          type="text"
                          value={item.productName}
                          onChange={(e) => handleItemChange(index, "productName", e.target.value)}
                          placeholder="Product name"
                          className="rs-input flex-1"
                          style={{ height: 34, fontSize: 12 }}
                        />
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)}
                          className="rs-input w-20"
                          style={{ height: 34, fontSize: 12 }}
                        />
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                          placeholder="Price"
                          className="rs-input w-28"
                          style={{ height: 34, fontSize: 12 }}
                        />
                        <p className="w-24 text-xs text-white text-right rs-stat">{formatCurrency(item.total)}</p>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={orderItems.length === 1}
                          className="p-1.5 hover:bg-white/5 rounded disabled:opacity-50"
                          style={{ color: "var(--rs-text-secondary)" }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end pt-2">
                    <div className="text-right">
                      <p className="text-xs" style={{ color: "var(--rs-text-muted)" }}>
                        Total:
                      </p>
                      <p className="text-xl font-semibold text-white rs-stat">
                        {formatCurrency(calculateTotal())}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2" style={{ color: "var(--rs-text-primary)" }}>
                    <FileText className="w-3.5 h-3.5" /> Documents & Files
                  </h3>
                  <p className="text-xs" style={{ color: "var(--rs-text-muted)" }}>
                    Upload your files to cloud storage and paste the links below.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Invoice Document URL</label>
                      <input
                        type="url"
                        value={formData.invoiceDocument}
                        onChange={(e) => setFormData({ ...formData, invoiceDocument: e.target.value })}
                        className="rs-input"
                        placeholder="https://storage.example.com/invoice.pdf"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Legal Document URL (Signed)</label>
                      <input
                        type="url"
                        value={formData.legalDocument}
                        onChange={(e) => setFormData({ ...formData, legalDocument: e.target.value })}
                        className="rs-input"
                        placeholder="https://storage.example.com/contract.pdf"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Payment Proof URL</label>
                      <input
                        type="url"
                        value={formData.paymentProof}
                        onChange={(e) => setFormData({ ...formData, paymentProof: e.target.value })}
                        className="rs-input"
                        placeholder="https://storage.example.com/payment.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Custom Logo URL</label>
                      <input
                        type="url"
                        value={formData.customLogo}
                        onChange={(e) => setFormData({ ...formData, customLogo: e.target.value })}
                        className="rs-input"
                        placeholder="https://storage.example.com/logo.png"
                      />
                    </div>
                  </div>

                  {/* Product Images */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Product Images URLs</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        id="productImageUrl"
                        className="flex-1 rs-input"
                        placeholder="https://storage.example.com/product1.jpg"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            const input = document.getElementById("productImageUrl") as HTMLInputElement;
                            handleAddUrl("productImages", input.value);
                            input.value = "";
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById("productImageUrl") as HTMLInputElement;
                          handleAddUrl("productImages", input.value);
                          input.value = "";
                        }}
                        className="rs-btn-ghost"
                        style={{ height: 38, paddingLeft: 14, paddingRight: 14 }}
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.productImages.map((url, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                          style={{
                            background: "var(--rs-bg-overlay)",
                            border: "1px solid var(--rs-border)",
                          }}
                        >
                          <Image className="w-3.5 h-3.5" style={{ color: "#f472b6" }} />
                          <span
                            className="text-xs truncate max-w-[200px]"
                            style={{ color: "var(--rs-text-primary)" }}
                          >
                            Image {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveUrl("productImages", idx)}
                            className="hover:opacity-80"
                            style={{ color: "var(--rs-text-muted)" }}
                            aria-label="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mockup Photos */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Mockup Photos URLs</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        id="mockupUrl"
                        className="flex-1 rs-input"
                        placeholder="https://storage.example.com/mockup1.jpg"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            const input = document.getElementById("mockupUrl") as HTMLInputElement;
                            handleAddUrl("mockupPhotos", input.value);
                            input.value = "";
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById("mockupUrl") as HTMLInputElement;
                          handleAddUrl("mockupPhotos", input.value);
                          input.value = "";
                        }}
                        className="rs-btn-ghost"
                        style={{ height: 38, paddingLeft: 14, paddingRight: 14 }}
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.mockupPhotos.map((url, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                          style={{
                            background: "var(--rs-bg-overlay)",
                            border: "1px solid var(--rs-border)",
                          }}
                        >
                          <Image className="w-3.5 h-3.5" style={{ color: "#22d3ee" }} />
                          <span
                            className="text-xs truncate max-w-[200px]"
                            style={{ color: "var(--rs-text-primary)" }}
                          >
                            Mockup {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveUrl("mockupPhotos", idx)}
                            className="hover:opacity-80"
                            style={{ color: "var(--rs-text-muted)" }}
                            aria-label="Remove mockup"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Additional Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="rs-input rs-input--textarea"
                    placeholder="Any special instructions..."
                  />
                </div>
              </div>

              {/* Footer */}
              <div
                className="sticky bottom-0 p-4 flex justify-end gap-2"
                style={{
                  background: "var(--rs-bg-base)",
                  borderTop: "1px solid var(--rs-border)",
                }}
              >
                <button
                  onClick={() => setShowNewOrderModal(false)}
                  className="rs-btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrder}
                  disabled={
                    submitting ||
                    !formData.clientName ||
                    !formData.clientEmail ||
                    orderItems.every((i) => !i.productName)
                  }
                  className="rs-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save as Draft
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
