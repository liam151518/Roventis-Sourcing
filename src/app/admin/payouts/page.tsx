"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, DollarSign, Package, CheckCircle, Clock } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
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

export default function AdminPayoutsPage() {
  const orders = useQuery(api.admin.getAllOrdersAdmin);
  const updateOrderStatus = useMutation(api.admin.updateOrderStatus);
  const updateOrderCommission = useMutation(api.admin.updateOrderCommission);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("submitted");

  // Filter to only show submitted orders and beyond (not drafts)
  const submittedOrders = (orders || []).filter((order: any) => 
    order.status !== "draft" && order.status !== "cancelled"
  );

  const filteredOrders = submittedOrders.filter((order: any) => {
    const matchesSearch = 
      order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.clientCompany && order.clientCompany.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.affiliate && order.affiliate.firstName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, status: string) => {
    await updateOrderStatus({ orderId: id, status: status as any });
  };

  const handleCommissionChange = async (id: string, status: string) => {
    await updateOrderCommission({ orderId: id, commissionStatus: status as any });
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

  if (!orders) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Calculate totals
  const pendingCommission = submittedOrders
    .filter((o: any) => o.commissionStatus === "pending")
    .reduce((sum: number, o: any) => sum + o.commissionAmount, 0);
  const approvedCommission = submittedOrders
    .filter((o: any) => o.commissionStatus === "approved")
    .reduce((sum: number, o: any) => sum + o.commissionAmount, 0);
  const paidCommission = submittedOrders
    .filter((o: any) => o.commissionStatus === "paid")
    .reduce((sum: number, o: any) => sum + o.commissionAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Payouts</h1>
        <p className="text-gray-500 mt-1">Validate orders and manage affiliate commission payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#141417] rounded-2xl border border-yellow-500/20 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-yellow-500/10">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending Payment</p>
              <p className="text-2xl font-semibold text-white">{formatCurrency(pendingCommission)}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#141417] rounded-2xl border border-blue-500/20 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <CheckCircle className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Approved (Ready)</p>
              <p className="text-2xl font-semibold text-white">{formatCurrency(approvedCommission)}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#141417] rounded-2xl border border-green-500/20 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-500/10">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Paid Out</p>
              <p className="text-2xl font-semibold text-white">{formatCurrency(paidCommission)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by client or affiliate name..."
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
          <option value="all">All Orders</option>
          {orderStatuses.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

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
                <th className="text-left p-4 text-gray-400 font-medium">Order Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Payout Status</th>
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
                      "text-yellow-400"
                    }`}>
                      {formatCurrency(order.commissionAmount)}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.commissionStatus === "paid" ? "bg-green-500/20 text-green-400" :
                      order.commissionStatus === "approved" ? "bg-blue-500/20 text-blue-400" :
                      "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {order.commissionStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="bg-transparent border border-white/10 rounded-lg px-2 py-1 text-white text-xs"
                      >
                        {orderStatuses.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <select
                        value={order.commissionStatus}
                        onChange={(e) => handleCommissionChange(order._id, e.target.value)}
                        className={`bg-transparent border border-white/10 rounded-lg px-2 py-1 text-xs ${
                          order.commissionStatus === "paid" ? "text-green-400" :
                          order.commissionStatus === "approved" ? "text-blue-400" :
                          "text-yellow-400"
                        }`}
                      >
                        {commissionStatuses.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
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
          <p className="text-gray-500">No submitted orders found</p>
          <p className="text-gray-600 text-sm mt-1">Orders will appear here once affiliates submit them</p>
        </div>
      )}
    </div>
  );
}
