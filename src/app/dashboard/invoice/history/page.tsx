"use client";

import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Plus, Eye, Download, Edit, Trash2, ArrowLeft } from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "bg-white/5 text-gray-400",
  sent: "bg-[var(--rs-info)]/10 text-[var(--rs-info)]",
  paid: "bg-[var(--rs-success)]/10 text-[var(--rs-success)]",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
};

const ZAR = (amount: number): string => {
  return `R${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function InvoiceHistoryPage() {
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate, {});
  const invoices = useQuery(
    api.invoices.getInvoicesByAffiliate,
    { affiliateId: currentAffiliate?._id || "" }
  );

  const activeInvoices = invoices?.filter((inv) => inv.status !== "retired");

  const getNextInvoiceNumber = useMutation(api.invoices.getNextInvoiceNumber);

  if (!currentAffiliate) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/dashboard/invoice"
            className="flex items-center gap-2 text-gray-500 hover:text-white mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Invoice Generator
          </Link>
          <span className="rs-overline">Invoice History</span>
          <h1 className="rs-page-title">View and manage your saved invoices</h1>
        </div>
        <Link
          href="/dashboard/invoice"
          className="py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </Link>
      </div>

      {/* Invoices Table */}
      <div className="bg-[#0a0a0b] rounded-[14px] border border-white/5 overflow-hidden">
        {!activeInvoices || activeInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-medium text-white mb-2">No invoices yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first invoice to get started
            </p>
            <Link
              href="/dashboard/invoice"
              className="inline-flex items-center gap-2 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Invoice No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {activeInvoices.map((invoice) => (
                <motion.tr
                  key={invoice._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-white/5"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-white">#{invoice.invoiceNumber}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-300">{invoice.clientCompanyName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-500">{formatDate(Number(invoice.invoiceDate))}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-white">{ZAR(invoice.total)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusColors[invoice.status] || "bg-white/5 text-gray-400"
                      }`}
                    >
                      {statusLabels[invoice.status] || invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-2 text-gray-500 hover:text-blue-400 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-500 hover:text-blue-400 transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/dashboard/invoice?edit=${invoice._id}`}
                        className="p-2 text-gray-500 hover:text-blue-400 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}