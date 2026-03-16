"use client";

import { motion } from "framer-motion";
import { DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CommissionsPage() {
  const commissionPayouts = useQuery(api.commissions.getAllPayouts);
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate);
  
  if (!commissionPayouts || !currentAffiliate) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const userPayouts = (commissionPayouts || []).filter((p: any) => p.affiliateId === currentAffiliate._id);
  
  const totalPaid = userPayouts.filter((p: any) => p.status === "paid").reduce((sum: number, p: any) => sum + p.amount, 0);
  const totalPending = userPayouts.filter((p: any) => p.status === "pending").reduce((sum: number, p: any) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Commissions</h1>
        <p className="text-gray-400">Track your commission payouts</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Paid</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(totalPaid)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{formatCurrency(totalPending)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {userPayouts.map((payout: any) => (
              <tr key={payout._id}>
                <td className="px-6 py-4 text-sm text-white">{formatDate(payout.createdAt)}</td>
                <td className="px-6 py-4 text-sm font-medium text-white">{formatCurrency(payout.amount)}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded ${
                    payout.status === "paid" ? "bg-green-500/20 text-green-400" :
                    payout.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                    payout.status === "processing" ? "bg-blue-500/20 text-blue-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>
                    {payout.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">{payout.referenceNumber || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
