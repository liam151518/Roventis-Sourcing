"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Users as UsersIcon, ShieldOff, UserX, Pause, Play } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDate, formatCurrency } from "@/lib/utils";

type Access = "active" | "paused" | "suspended" | "deactivated";

const ACCESS_OPTIONS: Access[] = ["active", "paused", "suspended", "deactivated"];

function accessStyles(access: string | undefined) {
  switch (access) {
    case "active":
      return "bg-green-500/20 text-green-400 border-green-500/20";
    case "paused":
      return "bg-amber-500/20 text-amber-400 border-amber-500/20";
    case "suspended":
      return "bg-orange-500/20 text-orange-400 border-orange-500/20";
    case "deactivated":
      return "bg-red-500/20 text-red-400 border-red-500/20";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/20";
  }
}

function accessLabel(access: string | undefined): string {
  if (access === "active") return "Active";
  if (access === "paused") return "Paused";
  if (access === "suspended") return "Suspended";
  if (access === "deactivated") return "Deactivated";
  return "Unknown";
}

export default function AdminUsersPage() {
  const affiliates = useQuery(api.admin.getAllAffiliatesAdmin);
  const updateAffiliate = useMutation(api.admin.updateAffiliateAdmin);
  const [searchQuery, setSearchQuery] = useState("");
  const [accessFilter, setAccessFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState("all");

  const filteredAffiliates = (affiliates || []).filter((affiliate: any) => {
    const matchesSearch =
      affiliate.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      affiliate.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      affiliate.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAccess = accessFilter === "all" || affiliate.access === accessFilter;
    const matchesTier = tierFilter === "all" || affiliate.tier === tierFilter;
    return matchesSearch && matchesAccess && matchesTier;
  });

  const handleAccessChange = async (id: string, access: Access) => {
    await updateAffiliate({ id, access });
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
        <p className="rs-overline">Admin</p>
        <h1 className="rs-page-title">Users</h1>
        <p className="rs-page-subtitle">Manage affiliate access and tier</p>
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
          value={accessFilter}
          onChange={(e) => setAccessFilter(e.target.value)}
          className="px-4 py-3 bg-[#141417] border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Access</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="suspended">Suspended</option>
          <option value="deactivated">Deactivated</option>
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
                <th className="text-left p-4 text-gray-400 font-medium">Access</th>
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${accessStyles(affiliate.access)}`}>
                      {accessLabel(affiliate.access)}
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
                    <div className="flex gap-2 flex-wrap">
                      {/* Return to active - always available except from active */}
                      {affiliate.access !== "active" && (
                        <button
                          onClick={() => handleAccessChange(affiliate._id, "active")}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors text-xs font-medium"
                          title="Restore full access"
                        >
                          <Play className="w-3 h-3" />
                          Activate
                        </button>
                      )}
                      {/* Pause - investigation hold, available from active / suspended */}
                      {affiliate.access !== "paused" && affiliate.access !== "deactivated" && (
                        <button
                          onClick={() => handleAccessChange(affiliate._id, "paused")}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors text-xs font-medium"
                          title="Soft hold while investigating. User cannot claim leads but can still view their dashboard."
                        >
                          <Pause className="w-3 h-3" />
                          Pause
                        </button>
                      )}
                      {/* Suspend - disciplinary, available from active / paused */}
                      {affiliate.access !== "suspended" && affiliate.access !== "deactivated" && (
                        <button
                          onClick={() => handleAccessChange(affiliate._id, "suspended")}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-colors text-xs font-medium"
                          title="Temporary disciplinary block. Reversible."
                        >
                          <ShieldOff className="w-3 h-3" />
                          Suspend
                        </button>
                      )}
                      {/* Deactivate - permanent, available from any non-deactivated state */}
                      {affiliate.access !== "deactivated" && (
                        <button
                          onClick={() => {
                            if (confirm(`Permanently deactivate ${affiliate.firstName} ${affiliate.lastName}? Use only for ToS violations or fraud. This should not be reversed casually.`)) {
                              handleAccessChange(affiliate._id, "deactivated");
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-xs font-medium"
                          title="Permanent block. Use only for ToS violations or fraud."
                        >
                          <UserX className="w-3 h-3" />
                          Deactivate
                        </button>
                      )}
                    </div>
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