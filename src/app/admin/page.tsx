"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Briefcase,
  Search,
  Filter,
  Clock,
  UserCheck,
  UserX,
  Eye
} from "lucide-react";
import { DemoDataProvider, useDemoData } from "@/lib/demo-data";
import { formatCurrency, formatDate, dealStatuses } from "@/lib/utils";

function AdminContent() {
  const { affiliates, deals, commissionPayouts } = useDemoData();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Stats
  const totalAffiliates = affiliates.length;
  const approvedAffiliates = affiliates.filter(a => a.status === "approved").length;
  const pendingAffiliates = affiliates.filter(a => a.status === "pending").length;
  const totalSales = deals.filter(d => d.status === "closed_won").reduce((sum, d) => sum + d.dealValue, 0);
  const totalCommissions = deals.filter(d => d.status === "closed_won").reduce((sum, d) => sum + d.commissionAmount, 0);
  const pendingPayouts = commissionPayouts.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "rejected": return "bg-red-100 text-red-700";
      case "suspended": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "affiliates", label: "Affiliates", icon: Users },
    { id: "deals", label: "Deals", icon: Briefcase },
    { id: "commissions", label: "Commissions", icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your affiliate program</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {formatDate(new Date())}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-amber-600 border-b-2 border-amber-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
                {tab.id === "affiliates" && pendingAffiliates > 0 && (
                  <span className="ml-1 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingAffiliates}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-primary to-slate-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-amber-400" />
                </div>
                <div className="text-3xl font-bold">{totalAffiliates}</div>
                <div className="text-slate-300">Total Affiliates</div>
                <div className="mt-2 text-sm text-green-400">
                  {approvedAffiliates} approved
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold">{formatCurrency(totalSales)}</div>
                <div className="text-green-100">Total Sales</div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold">{formatCurrency(totalCommissions)}</div>
                <div className="text-amber-100">Total Commissions</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold">{formatCurrency(pendingPayouts)}</div>
                <div className="text-blue-100">Pending Payouts</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Affiliates */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Recent Affiliates</h3>
                <div className="space-y-3">
                  {affiliates.slice(0, 5).map((affiliate) => (
                    <div key={affiliate.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {affiliate.firstName[0]}{affiliate.lastName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-primary">
                            {affiliate.firstName} {affiliate.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{affiliate.email}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(affiliate.status)}`}>
                        {affiliate.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Deals */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Recent Deals</h3>
                <div className="space-y-3">
                  {deals.slice(0, 5).map((deal) => {
                    const affiliate = affiliates.find(a => a.id === deal.affiliateId);
                    return (
                      <div key={deal.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                        <div>
                          <div className="font-medium text-primary">{deal.clientName}</div>
                          <div className="text-sm text-gray-500">
                            {affiliate?.firstName} {affiliate?.lastName}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-primary">{formatCurrency(deal.dealValue)}</div>
                          <div className={`text-xs ${deal.status === "closed_won" ? "text-green-600" : "text-gray-500"}`}>
                            {deal.status.replace("_", " ")}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Affiliates Tab */}
        {activeTab === "affiliates" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6"
          >
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search affiliates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                <Filter className="w-5 h-5" />
                Filter
              </button>
            </div>

            {/* Affiliates Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Affiliate</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {affiliates.map((affiliate) => (
                    <tr key={affiliate.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                            {affiliate.firstName[0]}{affiliate.lastName[0]}
                          </div>
                          <div>
                            <div className="font-medium text-primary">
                              {affiliate.firstName} {affiliate.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{affiliate.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{affiliate.affiliateCode}</code>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          affiliate.tier === "bronze" ? "bg-amber-100 text-amber-700" :
                          affiliate.tier === "silver" ? "bg-gray-200 text-gray-700" :
                          affiliate.tier === "gold" ? "bg-yellow-100 text-yellow-700" :
                          "bg-indigo-100 text-indigo-700"
                        }`}>
                          {affiliate.tier}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(affiliate.status)}`}>
                          {affiliate.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium text-primary">
                        {formatCurrency(affiliate.totalSales)}
                      </td>
                      <td className="px-4 py-4 text-gray-500">
                        {formatDate(affiliate.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {affiliate.status === "pending" && (
                            <>
                              <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Approve">
                                <UserCheck className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Reject">
                                <UserX className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Deals Tab */}
        {activeTab === "deals" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Affiliate</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {deals.map((deal) => {
                    const affiliate = affiliates.find(a => a.id === deal.affiliateId);
                    return (
                      <tr key={deal.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="font-medium text-primary">{deal.clientName}</div>
                          {deal.clientCompany && (
                            <div className="text-sm text-gray-500">{deal.clientCompany}</div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-gray-600">
                          {affiliate?.firstName} {affiliate?.lastName}
                        </td>
                        <td className="px-4 py-4 font-medium text-primary">
                          {formatCurrency(deal.dealValue)}
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-green-600 font-medium">{formatCurrency(deal.commissionAmount)}</span>
                          <span className="text-gray-400 text-sm ml-1">({deal.commissionRate}%)</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${dealStatuses.find(s => s.value === deal.status)?.color || ""}`}>
                            {deal.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Commissions Tab */}
        {activeTab === "commissions" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Affiliate</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {commissionPayouts.map((payout) => {
                    const affiliate = affiliates.find(a => a.id === payout.affiliateId);
                    return (
                      <tr key={payout.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="font-medium text-primary">
                            {affiliate?.firstName} {affiliate?.lastName}
                          </div>
                        </td>
                        <td className="px-4 py-4 font-medium text-primary">
                          {formatCurrency(payout.amount)}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            payout.status === "paid" ? "bg-green-100 text-green-700" :
                            payout.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                            payout.status === "processing" ? "bg-blue-100 text-blue-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {payout.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-500">
                          {payout.referenceNumber || "-"}
                        </td>
                        <td className="px-4 py-4 text-gray-500">
                          {formatDate(payout.createdAt)}
                        </td>
                        <td className="px-4 py-4">
                          {payout.status === "pending" && (
                            <button className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600">
                              Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <DemoDataProvider>
      <AdminContent />
    </DemoDataProvider>
  );
}
