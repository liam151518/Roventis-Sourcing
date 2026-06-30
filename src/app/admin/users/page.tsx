"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Users as UsersIcon, ShieldOff, UserX, Pause, Play } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDate, formatCurrency } from "@/lib/utils";

type Access = "active" | "paused" | "suspended" | "deactivated";

const ACCESS_OPTIONS: Access[] = ["active", "paused", "suspended", "deactivated"];

function accessPillClass(access: string | undefined) {
  switch (access) {
    case "active":
      return "rs-pill";
    case "paused":
      return "rs-pill rs-pill--warning";
    case "suspended":
      return "rs-pill rs-pill--warning";
    case "deactivated":
      return "rs-pill rs-pill--danger";
    default:
      return "rs-pill";
  }
}

function accessPillStyle(access: string | undefined): React.CSSProperties {
  switch (access) {
    case "active":
      return { background: "rgba(34,197,94,0.10)", color: "rgb(74,222,128)", borderColor: "rgba(34,197,94,0.20)" };
    case "paused":
      return { background: "rgba(245,158,11,0.10)", color: "rgb(251,191,36)", borderColor: "rgba(245,158,11,0.20)" };
    case "suspended":
      return { background: "rgba(249,115,22,0.10)", color: "rgb(251,146,60)", borderColor: "rgba(249,115,22,0.20)" };
    case "deactivated":
      return { background: "rgba(239,68,68,0.10)", color: "rgb(248,113,113)", borderColor: "rgba(239,68,68,0.20)" };
    default:
      return {};
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--rs-bg-base)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: "var(--rs-accent)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rs-page-header">
        <div>
          <span className="rs-overline">Admin</span>
          <h1 className="rs-page-title mt-1">Users</h1>
          <p className="rs-page-subtitle">Manage affiliate access and tier</p>
        </div>
      </div>

      <div className="rs-card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rs-input w-full pl-11 pr-4"
            />
          </div>
          <select
            value={accessFilter}
            onChange={(e) => setAccessFilter(e.target.value)}
            className="rs-input md:w-44"
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
            className="rs-input md:w-44"
          >
            <option value="all">All Tiers</option>
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="platinum">Platinum</option>
          </select>
        </div>
      </div>

      <div className="rs-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="rs-table w-full">
            <thead>
              <tr>
                <th>User</th>
                <th>Access</th>
                <th>Tier</th>
                <th>Total Sales</th>
                <th>Commission</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAffiliates.map((affiliate: any) => (
                <tr key={affiliate._id}>
                  <td>
                    <div>
                      <p className="font-medium text-white">{affiliate.firstName} {affiliate.lastName}</p>
                      <p className="text-xs" style={{ color: "var(--rs-text-secondary)" }}>{affiliate.email}</p>
                    </div>
                  </td>
                  <td>
                    <span className={accessPillClass(affiliate.access)} style={accessPillStyle(affiliate.access)}>
                      {accessLabel(affiliate.access)}
                    </span>
                  </td>
                  <td>
                    <select
                      value={affiliate.tier}
                      onChange={(e) => handleTierChange(affiliate._id, e.target.value)}
                      className="rs-input py-1 px-2 text-sm w-32"
                    >
                      <option value="bronze">Bronze</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  </td>
                  <td>{formatCurrency(affiliate.totalSales)}</td>
                  <td>{formatCurrency(affiliate.totalCommissionEarned)}</td>
                  <td style={{ color: "var(--rs-text-secondary)" }}>{formatDate(affiliate.createdAt)}</td>
                  <td>
                    <div className="flex gap-2 flex-wrap">
                      {affiliate.access !== "active" && (
                        <button
                          onClick={() => handleAccessChange(affiliate._id, "active")}
                          className="rs-btn-ghost text-xs flex items-center gap-1 px-2.5 py-1"
                          style={{ color: "rgb(74,222,128)", background: "rgba(34,197,94,0.10)", borderColor: "rgba(34,197,94,0.20)" }}
                          title="Restore full access"
                        >
                          <Play className="w-3 h-3" />
                          Activate
                        </button>
                      )}
                      {affiliate.access !== "paused" && affiliate.access !== "deactivated" && (
                        <button
                          onClick={() => handleAccessChange(affiliate._id, "paused")}
                          className="rs-btn-ghost text-xs flex items-center gap-1 px-2.5 py-1"
                          style={{ color: "rgb(251,191,36)", background: "rgba(245,158,11,0.10)", borderColor: "rgba(245,158,11,0.20)" }}
                          title="Soft hold while investigating. User cannot claim leads but can still view their dashboard."
                        >
                          <Pause className="w-3 h-3" />
                          Pause
                        </button>
                      )}
                      {affiliate.access !== "suspended" && affiliate.access !== "deactivated" && (
                        <button
                          onClick={() => handleAccessChange(affiliate._id, "suspended")}
                          className="rs-btn-ghost text-xs flex items-center gap-1 px-2.5 py-1"
                          style={{ color: "rgb(251,146,60)", background: "rgba(249,115,22,0.10)", borderColor: "rgba(249,115,22,0.20)" }}
                          title="Temporary disciplinary block. Reversible."
                        >
                          <ShieldOff className="w-3 h-3" />
                          Suspend
                        </button>
                      )}
                      {affiliate.access !== "deactivated" && (
                        <button
                          onClick={() => {
                            if (confirm(`Permanently deactivate ${affiliate.firstName} ${affiliate.lastName}? Use only for ToS violations or fraud. This should not be reversed casually.`)) {
                              handleAccessChange(affiliate._id, "deactivated");
                            }
                          }}
                          className="rs-btn-ghost text-xs flex items-center gap-1 px-2.5 py-1"
                          style={{ color: "rgb(248,113,113)", background: "rgba(239,68,68,0.10)", borderColor: "rgba(239,68,68,0.20)" }}
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
        <div className="rs-empty-state">
          <UsersIcon className="rs-empty-state-icon" />
          <p className="rs-empty-state-title">No users found</p>
          <p className="rs-empty-state-description">Try adjusting filters or search query.</p>
        </div>
      )}
    </div>
  );
}