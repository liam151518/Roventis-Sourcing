"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  X, 
  Building, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign,
  MoreHorizontal,
  Filter,
  Search,
  ChevronRight
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatCurrency, formatDate, dealStatuses } from "@/lib/utils";

const columns = [
  { id: "prospect", label: "Prospect", color: "bg-gray-500" },
  { id: "qualified", label: "Qualified", color: "bg-blue-500" },
  { id: "proposal_sent", label: "Proposal Sent", color: "bg-yellow-500" },
  { id: "negotiation", label: "Negotiation", color: "bg-orange-500" },
  { id: "closed_won", label: "Closed Won", color: "bg-green-500" },
  { id: "closed_lost", label: "Closed Lost", color: "bg-red-500" },
];

export default function DealsPage() {
  const deals = useQuery(api.deals.getAllDeals);
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate);
  const createDeal = useMutation(api.deals.createDeal);
  const [showModal, setShowModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<typeof deals[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Using first affiliate as demo user
  const affiliateId = currentAffiliate?._id || "";
  const userDeals = currentAffiliate ? (deals || []).filter(d => d.affiliateId === currentAffiliate._id) : [];
  
  const filteredDeals = userDeals.filter(d => 
    d.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.clientCompany?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDealsByStatus = (status: string) => 
    filteredDeals.filter(d => d.status === status);

  const getStatusBadge = (status: string) => {
    const statusObj = dealStatuses.find(s => s.value === status);
    return statusObj?.color || "bg-gray-100 text-gray-700";
  };

  if (!deals || !currentAffiliate) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Deals Pipeline</h1>
          <p className="text-gray-500">Track and manage your sales opportunities</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-400 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Deal
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <Filter className="w-5 h-5" />
            Filter
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnDeals = getDealsByStatus(column.id);
          const totalValue = columnDeals.reduce((sum, d) => sum + d.dealValue, 0);
          
          return (
            <div key={column.id} className="flex-shrink-0 w-72">
              <div className="bg-gray-100 rounded-xl p-4">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${column.color}`} />
                    <span className="font-semibold text-gray-700">{column.label}</span>
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                      {columnDeals.length}
                    </span>
                  </div>
                </div>
                
                {/* Column Total */}
                <div className="text-sm text-gray-500 mb-3">
                  {formatCurrency(totalValue)}
                </div>

                {/* Cards */}
                <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto">
                  {columnDeals.map((deal) => (
                    <motion.div
                      key={deal._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedDeal(deal)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-primary">{deal.clientName}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs ${getStatusBadge(deal.status)}`}>
                          {deal.status.replace("_", " ")}
                        </span>
                      </div>
                      {deal.clientCompany && (
                        <p className="text-sm text-gray-500 mb-2">{deal.clientCompany}</p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-bold text-primary">{formatCurrency(deal.dealValue)}</span>
                        {deal.expectedCloseDate && (
                          <span className="text-xs text-gray-400">
                            {formatDate(deal.expectedCloseDate)}
                          </span>
                        )}
                      </div>
                      {deal.commissionAmount > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            Commission: <span className="font-medium text-green-600">{formatCurrency(deal.commissionAmount)}</span>
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {columnDeals.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No deals in this stage
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Deal Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold text-primary">Create New Deal</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Acme Corp"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                      placeholder="john@acme.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                      placeholder="+27 82 123 4567"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deal Value *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
                    <input
                      type="number"
                      required
                      className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                      placeholder="50000"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Categories</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["tactical_gear", "corporate_merch", "workwear", "event_merch", "uniforms", "custom"].map((cat) => (
                      <label key={cat} className="flex items-center gap-2">
                        <input type="checkbox" className="rounded text-amber-500" />
                        <span className="text-sm capitalize">{cat.replace("_", " ")}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Additional details about this deal..."
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-400"
                  >
                    Create Deal
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deal Detail Modal */}
      <AnimatePresence>
        {selectedDeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDeal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-xl font-bold text-primary">{selectedDeal.clientName}</h2>
                  {selectedDeal.clientCompany && (
                    <p className="text-gray-500">{selectedDeal.clientCompany}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedDeal(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Deal Value</span>
                    <p className="font-semibold text-primary">{formatCurrency(selectedDeal.dealValue)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Status</span>
                    <p className={`inline-block px-2 py-0.5 rounded text-sm ${getStatusBadge(selectedDeal.status)}`}>
                      {selectedDeal.status.replace("_", " ")}
                    </p>
                  </div>
                </div>
                
                {selectedDeal.description && (
                  <div>
                    <span className="text-sm text-gray-500">Description</span>
                    <p className="text-primary">{selectedDeal.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Commission</span>
                    <p className="font-semibold text-green-600">{formatCurrency(selectedDeal.commissionAmount)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Commission Status</span>
                    <p className="capitalize">{selectedDeal.commissionStatus}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Created</span>
                    <p>{formatDate(selectedDeal.createdAt)}</p>
                  </div>
                  {selectedDeal.expectedCloseDate && (
                    <div>
                      <span className="text-sm text-gray-500">Expected Close</span>
                      <p>{formatDate(selectedDeal.expectedCloseDate)}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 p-6 border-t">
                <button
                  onClick={() => setSelectedDeal(null)}
                  className="px-5 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
