"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Users as UsersIcon } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function AdminUsersPage() {
  const affiliates = useQuery(api.admin.getAllAffiliatesAdmin);
  const updateAffiliate = useMutation(api.admin.updateAffiliateAdmin);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");

  const filteredAffiliates = (affiliates || []).filter((affiliate: any) => {
    const matchesSearch = 
      affiliate.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      affiliate.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      affiliate.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || affiliate.status === statusFilter;
    const matchesTier = tierFilter === "all" || affiliate.tier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  const handleStatusChange = async (id: string, status: string) => {
    await updateAffiliate({ id, status: status as any });
  };

  const handleTierChange = async (id: string, tier: string) => {
    await updateAffiliate({ id, tier: tier as any });
  };

  if (!affiliates) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Users</h1>
        <p className="text-gray-500 mt-1">Manage affiliate accounts</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search users..."
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
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-4 py-3 bg-[#141417] border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Tiers</option>
          <option value="bronze">Bronze</option>
          <option value="silver">Silver</option>
          <option value="gold">Gold</option>
          <option value="platinum">Platinum</option>
        </select>
      </div>

      <div className="bg-[#141417] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-gray-400 font-medium">User</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Tier</th>
                <th className="text-left p-4 text-gray-400 font-medium">Total Sales</th>
                <th className="text-left p-4 text-gray-400 font-medium">Commission</th>
                <th className="text-left p-4 text-gray-400 font-medium">Joined</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAffiliates.map((affiliate: any) => (
                <tr key={affiliate._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div>
                      <p className="text-white font-medium">{affiliate.firstName} {affiliate.lastName}</p>
                      <p className="text-gray-500 text-sm">{affiliate.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      affiliate.status === "approved" ? "bg-green-500/20 text-green-400" :
                      affiliate.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                      affiliate.status === "rejected" ? "bg-red-500/20 text-red-400" :
                      affiliate.status === "suspended" ? "bg-orange-500/20 text-orange-400" :
                      "bg-gray-500/20 text-gray-400"
                    }`}>
                      {affiliate.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={affiliate.tier}
                      onChange={(e) => handleTierChange(affiliate._id, e.target.value)}
                      className="bg-transparent border border-white/10 rounded-lg px-2 py-1 text-white text-sm"
                    >
                      <option value="bronze">Bronze</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  </td>
                  <td className="p-4 text-white">{formatCurrency(affiliate.totalSales)}</td>
                  <td className="p-4 text-white">{formatCurrency(affiliate.totalCommissionEarned)}</td>
                  <td className="p-4 text-gray-400">{formatDate(affiliate.createdAt)}</td>
                  <td className="p-4">
                    <select
                      value={affiliate.status}
                      onChange={(e) => handleStatusChange(affiliate._id, e.target.value)}
                      className="bg-transparent border border-white/10 rounded-lg px-2 py-1 text-white text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                      <option value="suspended">Suspend</option>
                      <option value="inactive">Deactivate</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAffiliates.length === 0 && (
        <div className="text-center py-16">
          <UsersIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No users found</p>
        </div>
      )}
    </div>
  );
}
