"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Download, 
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useDemoData } from "@/lib/demo-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CommissionsPage() {
  const { deals, commissionPayouts } = useDemoData();
  const [timeRange, setTimeRange] = useState("6m");
  
  // Using first affiliate as demo user
  const affiliateId = "aff-001";
  const userDeals = deals.filter(d => d.affiliateId === affiliateId && d.status === "closed_won");
  const userPayouts = commissionPayouts.filter(p => p.affiliateId === affiliateId);
  
  const totalEarned = userDeals.reduce((sum, d) => sum + d.commissionAmount, 0);
  const totalPaid = userPayouts.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const pending = userPayouts.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
  const processing = userPayouts.filter(p => p.status === "processing").reduce((sum, p) => sum + p.amount, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending": return <Clock className="w-4 h-4 text-yellow-600" />;
      case "processing": return <CreditCard className="w-4 h-4 text-blue-600" />;
      case "failed": return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "processing": return "bg-blue-100 text-blue-700";
      case "failed": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  // Generate monthly earnings data for chart
  const monthlyData = [
    { month: "Sep", earnings: 8500 },
    { month: "Oct", earnings: 12500 },
    { month: "Nov", earnings: 9500 },
    { month: "Dec", earnings: 15000 },
    { month: "Jan", earnings: 22000 },
    { month: "Feb", earnings: 18500 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Commissions</h1>
          <p className="text-gray-500">Track your earnings and payouts</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
          <Download className="w-5 h-5" />
          Export Statement
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-primary">{formatCurrency(totalEarned)}</div>
          <div className="text-gray-500 text-sm">Total Earned</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-primary">{formatCurrency(totalPaid)}</div>
          <div className="text-gray-500 text-sm">Total Paid</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-primary">{formatCurrency(pending)}</div>
          <div className="text-gray-500 text-sm">Pending</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">
              +18%
            </span>
          </div>
          <div className="text-2xl font-bold text-primary">{formatCurrency(18500)}</div>
          <div className="text-gray-500 text-sm">This Month</div>
        </motion.div>
      </div>

      {/* Earnings Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-primary">Earnings Over Time</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
          >
            <option value="3m">Last 3 months</option>
            <option value="6m">Last 6 months</option>
            <option value="12m">Last 12 months</option>
          </select>
        </div>
        
        {/* Simple Bar Chart */}
        <div className="h-64 flex items-end gap-4">
          {monthlyData.map((data, index) => (
            <div key={data.month} className="flex-1 flex flex-col items-center">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(data.earnings / 25000) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg"
              />
              <span className="text-sm text-gray-500 mt-2">{data.month}</span>
              <span className="text-xs font-medium text-gray-700">{formatCurrency(data.earnings)}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Deals Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-primary">Commission by Deal</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deal Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Close Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {userDeals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-primary">{deal.clientName}</div>
                    {deal.clientCompany && (
                      <div className="text-sm text-gray-500">{deal.clientCompany}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{formatCurrency(deal.dealValue)}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">{formatCurrency(deal.commissionAmount)}</td>
                  <td className="px-6 py-4 text-gray-600">{deal.commissionRate}%</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(deal.commissionStatus)}`}>
                      {deal.commissionStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {deal.actualCloseDate ? formatDate(deal.actualCloseDate) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Payout History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-primary">Payout History</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {userPayouts.map((payout) => (
            <div key={payout.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center gap4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                  {getStatusIcon(payout.status)}
                </div>
                <div>
                  <div className="font-medium text-primary">{formatCurrency(payout.amount)}</div>
                  <div className="text-sm text-gray-500">
                    {payout.referenceNumber && (
                      <span className="mr-3">Ref: {payout.referenceNumber}</span>
                    )}
                    {formatDate(payout.createdAt)}
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(payout.status)}`}>
                {payout.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
