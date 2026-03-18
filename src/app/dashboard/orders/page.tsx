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
import { formatCurrency } from "@/lib/utils";

const statusConfig = {
  draft: { label: "Draft", color: "bg-gray-500/10 text-gray-400", icon: Edit },
  submitted: { label: "Submitted", color: "bg-blue-500/10 text-blue-400", icon: Clock },
  supplier_confirmed: { label: "Supplier Confirmed", color: "bg-purple-500/10 text-purple-400", icon: CheckCircle },
  in_transit: { label: "In Transit", color: "bg-amber-500/10 text-amber-400", icon: Truck },
  delivered: { label: "Delivered", color: "bg-emerald-500/10 text-emerald-400", icon: CheckCircle },
  installed: { label: "Installed", color: "bg-green-500/10 text-green-400", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-400", icon: XCircle },
};

const commissionStatusConfig = {
  pending: { label: "Pending", color: "bg-amber-500/10 text-amber-400" },
  approved: { label: "Approved", color: "bg-emerald-500/10 text-emerald-400" },
  paid: { label: "Paid", color: "bg-blue-500/10 text-blue-400" },
};

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function OrdersPage() {
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate);
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
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
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
      color: "from-blue-500 to-indigo-600",
    },
    {
      label: "In Progress",
      value: orders?.filter(o => ["submitted", "supplier_confirmed", "in_transit"].includes(o.status)).length || 0,
      icon: Clock,
      color: "from-amber-500 to-orange-600",
    },
    {
      label: "Delivered",
      value: orders?.filter(o => ["delivered", "installed"].includes(o.status)).length || 0,
      icon: CheckCircle,
      color: "from-emerald-500 to-teal-600",
    },
    {
      label: "Total Value",
      value: formatCurrency(orders?.reduce((sum, o) => sum + o.totalAmount, 0) || 0),
      icon: DollarSign,
      color: "from-purple-500 to-pink-600",
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-gray-400">Track and manage your orders</p>
        </div>
        <button 
          onClick={() => setShowNewOrderModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Order
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-[#111113] rounded-2xl p-5 border border-white/5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <p className="text-xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#111113] border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-[#111113] border border-white/5 rounded-xl text-white focus:outline-none focus:border-blue-500"
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => {
                  setSelectedOrder(order);
                  setShowOrderModal(true);
                }}
                className="bg-[#111113] rounded-2xl p-5 border border-white/5 hover:border-white/10 cursor-pointer transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{order.clientName}</h3>
                      <p className="text-gray-400 text-sm">{order.clientCompany || "Individual"}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">Order Value</p>
                      <p className="text-white font-semibold">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">Commission</p>
                      <p className={`font-semibold ${order.commissionStatus === "approved" || order.commissionStatus === "paid" ? "text-emerald-400" : "text-amber-400"}`}>
                        {formatCurrency(order.commissionAmount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[order.status as keyof typeof statusConfig]?.color || "bg-gray-500/10 text-gray-400"}`}>
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex flex-wrap gap-2">
                    {order.items?.slice(0, 3).map((item: any, i: number) => (
                      <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
                        {item.productName} x{item.quantity}
                      </span>
                    ))}
                    {order.items?.length > 3 && (
                      <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-500">
                        +{order.items.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Submit to Admin Button for Drafts */}
                {order.status === "draft" && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubmitToAdmin(order._id);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Submit for Approval
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="bg-[#111113] rounded-2xl p-12 border border-white/5 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No orders found</p>
            <p className="text-gray-500 text-sm">Create your first order or adjust your filters</p>
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
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowOrderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111113] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#111113] border-b border-white/5 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Order Details</h2>
                  <p className="text-gray-400 text-sm">#{selectedOrder._id.slice(-8)}</p>
                </div>
                <button 
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    {["draft", "submitted", "supplier_confirmed", "in_transit", "delivered", "installed"].map((status, i, arr) => {
                      const isActive = arr.indexOf(selectedOrder.status) >= i;
                      const isCurrent = selectedOrder.status === status;
                      return (
                        <div key={status} className="flex items-center">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${isActive ? (isCurrent ? "bg-blue-500" : "bg-emerald-500") : "bg-gray-600"}`} />
                            {i < 5 && <div className={`w-8 h-0.5 ${isActive ? "bg-emerald-500" : "bg-gray-600"}`} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className={`text-xs ${selectedOrder.status === "draft" ? "text-blue-400" : "text-emerald-400"}`}>
                      {statusConfig[selectedOrder.status as keyof typeof statusConfig]?.label}
                    </span>
                  </div>
                </div>

                {/* Client Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-gray-400 text-xs mb-1">Client</p>
                    <p className="text-white font-medium">{selectedOrder.clientName}</p>
                    {selectedOrder.clientCompany && (
                      <p className="text-gray-400 text-sm">{selectedOrder.clientCompany}</p>
                    )}
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-gray-400 text-xs mb-1">Contact</p>
                    <p className="text-white font-medium">{selectedOrder.clientEmail}</p>
                    {selectedOrder.clientPhone && (
                      <p className="text-gray-400 text-sm">{selectedOrder.clientPhone}</p>
                    )}
                  </div>
                </div>

                {/* Company Details */}
                {selectedOrder.companyName && (
                  <div className="p-4 bg-white/5 rounded-xl mb-6">
                    <p className="text-gray-400 text-xs mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4" /> Company Details
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500 text-xs">Company Name</p>
                        <p className="text-white">{selectedOrder.companyName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Registration #</p>
                        <p className="text-white">{selectedOrder.companyRegistrationNumber || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">VAT Number</p>
                        <p className="text-white">{selectedOrder.companyVATNumber || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Website</p>
                        <p className="text-white">{selectedOrder.companyWebsite || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delivery Address */}
                {selectedOrder.deliveryAddress && (
                  <div className="mb-6 p-4 bg-white/5 rounded-xl">
                    <p className="text-gray-400 text-xs mb-2">Delivery Address</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <p className="text-white">{selectedOrder.deliveryAddress}</p>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-3">Order Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div>
                          <p className="text-white font-medium">{item.productName}</p>
                          <p className="text-gray-400 text-sm">Qty: {item.quantity} x {formatCurrency(item.unitPrice)}</p>
                        </div>
                        <p className="text-white font-semibold">{formatCurrency(item.total)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10 flex justify-between">
                    <span className="text-gray-400">Total</span>
                    <span className="text-white font-bold text-lg">{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                </div>

                {/* Documents */}
                {(selectedOrder.invoiceDocument || selectedOrder.legalDocument || selectedOrder.paymentProof || selectedOrder.customLogo || selectedOrder.productImages?.length > 0 || selectedOrder.mockupPhotos?.length > 0) && (
                  <div className="mb-6">
                    <p className="text-gray-400 text-sm mb-3">Uploaded Documents</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedOrder.invoiceDocument && (
                        <a href={selectedOrder.invoiceDocument} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-white/5 rounded-lg text-blue-400 hover:bg-white/10">
                          <FileText className="w-4 h-4" /> Invoice
                        </a>
                      )}
                      {selectedOrder.legalDocument && (
                        <a href={selectedOrder.legalDocument} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-white/5 rounded-lg text-green-400 hover:bg-white/10">
                          <FileText className="w-4 h-4" /> Legal Document
                        </a>
                      )}
                      {selectedOrder.paymentProof && (
                        <a href={selectedOrder.paymentProof} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-white/5 rounded-lg text-purple-400 hover:bg-white/10">
                          <Image className="w-4 h-4" /> Payment Proof
                        </a>
                      )}
                      {selectedOrder.customLogo && (
                        <a href={selectedOrder.customLogo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-white/5 rounded-lg text-amber-400 hover:bg-white/10">
                          <Building2 className="w-4 h-4" /> Custom Logo
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Commission & Tracking */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-gray-400 text-xs mb-1">Commission Status</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${commissionStatusConfig[selectedOrder.commissionStatus as keyof typeof commissionStatusConfig]?.color || "bg-gray-500/10 text-gray-400"}`}>
                      {commissionStatusConfig[selectedOrder.commissionStatus as keyof typeof commissionStatusConfig]?.label || selectedOrder.commissionStatus}
                    </span>
                    <p className="text-white font-semibold mt-1">{formatCurrency(selectedOrder.commissionAmount)}</p>
                  </div>
                  {selectedOrder.trackingNumber && (
                    <div className="p-4 bg-white/5 rounded-xl">
                      <p className="text-gray-400 text-xs mb-1">Tracking</p>
                      <p className="text-white font-medium">{selectedOrder.trackingNumber}</p>
                      {selectedOrder.deliveryDate && (
                        <p className="text-gray-400 text-sm">
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
            className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 overflow-y-auto"
            onClick={() => setShowNewOrderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111113] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8"
            >
              <div className="sticky top-0 bg-[#111113] border-b border-white/5 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Create New Order</h2>
                  <p className="text-gray-400 text-sm">Fill in all details and upload required documents</p>
                </div>
                <button 
                  onClick={() => setShowNewOrderModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Client Information */}
                <div className="space-y-4">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <User className="w-4 h-4" /> Client Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Client Name *</label>
                      <input
                        type="text"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Company Name</label>
                      <input
                        type="text"
                        value={formData.clientCompany}
                        onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="Acme Corp"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Email *</label>
                      <input
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="+27 82 123 4567"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-gray-400 text-sm mb-2">Delivery Address</label>
                      <input
                        type="text"
                        value={formData.deliveryAddress}
                        onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="123 Main Street, City, 8001"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Details (For Manufacturing) */}
                <div className="space-y-4">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Company Details (For Manufacturing)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Company Name</label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="Acme Manufacturing"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Registration Number</label>
                      <input
                        type="text"
                        value={formData.companyRegistrationNumber}
                        onChange={(e) => setFormData({ ...formData, companyRegistrationNumber: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="2021/123456/07"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">VAT Number</label>
                      <input
                        type="text"
                        value={formData.companyVATNumber}
                        onChange={(e) => setFormData({ ...formData, companyVATNumber: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="4120185361"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Website</label>
                      <input
                        type="url"
                        value={formData.companyWebsite}
                        onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="https://acme.co.za"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-gray-400 text-sm mb-2">Company Address</label>
                      <input
                        type="text"
                        value={formData.companyAddress}
                        onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="Factory Address for Manufacturing"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Contact Person Name</label>
                      <input
                        type="text"
                        value={formData.contactPersonName}
                        onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Contact Person Email</label>
                      <input
                        type="email"
                        value={formData.contactPersonEmail}
                        onChange={(e) => setFormData({ ...formData, contactPersonEmail: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="jane@acme.co.za"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Contact Person Phone</label>
                      <input
                        type="tel"
                        value={formData.contactPersonPhone}
                        onChange={(e) => setFormData({ ...formData, contactPersonPhone: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="+27 82 987 6543"
                      />
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium flex items-center gap-2">
                      <Package className="w-4 h-4" /> Order Items
                    </h3>
                    <button
                      type="button"
                      onClick={addItem}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-blue-400 hover:text-blue-300"
                    >
                      <Plus className="w-4 h-4" /> Add Item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {orderItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-white/5 rounded-xl">
                        <input
                          type="text"
                          value={item.productName}
                          onChange={(e) => handleItemChange(index, "productName", e.target.value)}
                          placeholder="Product name"
                          className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm"
                        />
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)}
                          className="w-20 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm"
                        />
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                          placeholder="Price"
                          className="w-28 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm"
                        />
                        <p className="w-24 text-white text-sm text-right">{formatCurrency(item.total)}</p>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={orderItems.length === 1}
                          className="p-2 text-gray-400 hover:text-red-400 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end pt-2">
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Total:</p>
                      <p className="text-2xl font-bold text-white">{formatCurrency(calculateTotal())}</p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-4">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Documents & Files
                  </h3>
                  <p className="text-gray-500 text-sm">Upload your files to cloud storage and paste the links below</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Invoice Document URL</label>
                      <input
                        type="url"
                        value={formData.invoiceDocument}
                        onChange={(e) => setFormData({ ...formData, invoiceDocument: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="https://storage.example.com/invoice.pdf"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Legal Document URL (Signed)</label>
                      <input
                        type="url"
                        value={formData.legalDocument}
                        onChange={(e) => setFormData({ ...formData, legalDocument: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="https://storage.example.com/contract.pdf"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Payment Proof URL</label>
                      <input
                        type="url"
                        value={formData.paymentProof}
                        onChange={(e) => setFormData({ ...formData, paymentProof: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="https://storage.example.com/payment.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Custom Logo URL</label>
                      <input
                        type="url"
                        value={formData.customLogo}
                        onChange={(e) => setFormData({ ...formData, customLogo: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        placeholder="https://storage.example.com/logo.png"
                      />
                    </div>
                  </div>

                  {/* Product Images */}
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Product Images URLs</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        id="productImageUrl"
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
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
                        className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.productImages.map((url, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg">
                          <Image className="w-4 h-4 text-pink-400" />
                          <span className="text-white text-sm truncate max-w-[200px]">{idx + 1}</span>
                          <button type="button" onClick={() => handleRemoveUrl("productImages", idx)} className="text-gray-400 hover:text-red-400">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mockup Photos */}
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Mockup Photos URLs</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        id="mockupUrl"
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
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
                        className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.mockupPhotos.map((url, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg">
                          <Image className="w-4 h-4 text-cyan-400" />
                          <span className="text-white text-sm truncate max-w-[200px]">{idx + 1}</span>
                          <button type="button" onClick={() => handleRemoveUrl("mockupPhotos", idx)} className="text-gray-400 hover:text-red-400">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Additional Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Any special instructions..."
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-[#111113] border-t border-white/5 p-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrder}
                  disabled={submitting || !formData.clientName || !formData.clientEmail || orderItems.every(i => !i.productName)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
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
