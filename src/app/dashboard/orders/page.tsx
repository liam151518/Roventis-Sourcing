"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
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
  X
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

export default function OrdersPage() {
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate);
  const orders = useQuery(api.orders.getMyOrders, { 
    affiliateId: currentAffiliate?._id as string 
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-gray-400">Track and manage your orders</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
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
              className="bg-[#111113] rounded-2xl p-6 max-w-2xl w-full border border-white/10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Order Details</h3>
                  <p className="text-gray-400 text-sm">Order #{selectedOrder._id.slice(0, 8)}</p>
                </div>
                <button 
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Timeline */}
              <div className="mb-6 p-4 bg-white/5 rounded-xl">
                <p className="text-gray-400 text-sm mb-3">Order Status</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {["draft", "submitted", "supplier_confirmed", "in_transit", "delivered", "installed"].map((status, i) => {
                    const isActive = ["draft", "submitted", "supplier_confirmed", "in_transit", "delivered", "installed"].indexOf(selectedOrder.status) >= i;
                    const isCurrent = selectedOrder.status === status;
                    return (
                      <div key={status} className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${isActive ? (isCurrent ? "bg-blue-500" : "bg-emerald-500") : "bg-gray-600"}`} />
                        {i < 5 && <div className={`w-8 h-0.5 ${isActive ? "bg-emerald-500" : "bg-gray-600"}`} />}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
