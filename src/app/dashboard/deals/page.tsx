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
  Search,
  Filter,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Edit
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatCurrency, formatDate, dealStatuses } from "@/lib/utils";

const columns = [
  { id: "prospect", label: "Prospect", color: "bg-slate-500" },
  { id: "qualified", label: "Qualified", color: "bg-blue-500" },
  { id: "proposal_sent", label: "Proposal", color: "bg-amber-500" },
  { id: "negotiation", label: "Negotiation", color: "bg-orange-500" },
  { id: "closed_won", label: "Closed Won", color: "bg-emerald-500" },
  { id: "closed_lost", label: "Closed Lost", color: "bg-red-500" },
];

export default function DealsPage() {
  const deals = useQuery(api.deals.getAllDeals);
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate);
  const createDeal = useMutation(api.deals.createDeal);
  const [showModal, setShowModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<typeof deals[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const affiliateId = currentAffiliate?._id || "";
  const userDeals = currentAffiliate ? (deals || []).filter(d => d.affiliateId === currentAffiliate._id) : [];
  
  const filteredDeals = userDeals.filter(d => 
    d.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.clientCompany?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDealsByStatus = (status: string) => 
    filteredDeals.filter(d => d.status === status);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "closed_won": return "bg-emerald-500/10 text-emerald-400";
      case "closed_lost": return "bg-red-500/10 text-red-400";
      case "negotiation": return "bg-orange-500/10 text-orange-400";
      case "proposal_sent": return "bg-amber-500/10 text-amber-400";
      case "qualified": return "bg-blue-500/10 text-blue-400";
      default: return "bg-slate-500/10 text-slate-400";
    }
  };

  if (!deals || !currentAffiliate) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold text-white">Deals Pipeline</h1>
          <p className="text-gray-500 mt-1">Track and manage your sales opportunities</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Deal
        </button>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#141417] border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-[#141417] border border-white/5 rounded-xl text-gray-400 hover:text-white hover:border-white/10 transition-colors">
          <Filter className="w-5 h-5" />
          Filter
        </button>
      </motion.div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
        {columns.map((column, colIndex) => {
          const columnDeals = getDealsByStatus(column.id);
          const totalValue = columnDeals.reduce((sum, d) => sum + d.dealValue, 0);
          
          return (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: colIndex * 0.05 }}
              className="flex-shrink-0 w-80"
            >
              <div className="bg-[#141417] rounded-2xl p-4 border border-white/5">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${column.color}`} />
                    <span className="font-medium text-white">{column.label}</span>
                    <span className="bg-white/5 text-gray-400 text-xs px-2 py-0.5 rounded-full">
                      {columnDeals.length}
                    </span>
                  </div>
                </div>
                
                {/* Column Total */}
                <div className="text-sm text-gray-500 mb-4 font-mono">
                  {formatCurrency(totalValue)}
                </div>

                {/* Cards */}
                <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                  {columnDeals.map((deal) => (
                    <motion.div
                      key={deal._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group bg-[#0a0a0b] rounded-xl p-4 border border-white/5 hover:border-white/10 cursor-pointer transition-all hover:shadow-lg hover:shadow-black/20"
                      onClick={() => setSelectedDeal(deal)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{deal.clientName}</h3>
                          {deal.clientCompany && (
                            <p className="text-sm text-gray-500 mt-0.5">{deal.clientCompany}</p>
                          )}
                        </div>
                        <button className="p-1 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{formatCurrency(deal.dealValue)}</span>
                        {deal.expectedCloseDate && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(deal.expectedCloseDate)}
                          </span>
                        )}
                      </div>
                      
                      {deal.productCategory && deal.productCategory.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {deal.productCategory.slice(0, 2).map((cat) => (
                            <span key={cat} className="text-xs px-2 py-0.5 bg-white/5 text-gray-400 rounded">
                              {cat}
                            </span>
                          ))}
                          {deal.productCategory.length > 2 && (
                            <span className="text-xs px-2 py-0.5 bg-white/5 text-gray-400 rounded">
                              +{deal.productCategory.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {columnDeals.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No deals in this stage
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Deal Detail Modal */}
      <AnimatePresence>
        {selectedDeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDeal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#141417] rounded-2xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between p-6 border-b border-white/5">
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedDeal.clientName}</h2>
                  {selectedDeal.clientCompany && (
                    <p className="text-gray-500 mt-1">{selectedDeal.clientCompany}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedDeal(null)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Deal Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0a0a0b] rounded-xl p-4">
                    <div className="text-gray-500 text-sm mb-1">Deal Value</div>
                    <div className="text-2xl font-semibold text-white">{formatCurrency(selectedDeal.dealValue)}</div>
                  </div>
                  <div className="bg-[#0a0a0b] rounded-xl p-4">
                    <div className="text-gray-500 text-sm mb-1">Commission</div>
                    <div className="text-2xl font-semibold text-emerald-400">{formatCurrency(selectedDeal.commissionAmount)}</div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <div className="text-gray-500 text-sm mb-2">Status</div>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusBadge(selectedDeal.status)}`}>
                    {selectedDeal.status.replace("_", " ")}
                  </span>
                </div>

                {/* Contact Info */}
                {selectedDeal.clientEmail || selectedDeal.clientPhone ? (
                  <div>
                    <div className="text-gray-500 text-sm mb-3">Contact Information</div>
                    <div className="space-y-2">
                      {selectedDeal.clientEmail && (
                        <div className="flex items-center gap-3 text-gray-300">
                          <Mail className="w-4 h-4 text-gray-500" />
                          {selectedDeal.clientEmail}
                        </div>
                      )}
                      {selectedDeal.clientPhone && (
                        <div className="flex items-center gap-3 text-gray-300">
                          <Phone className="w-4 h-4 text-gray-500" />
                          {selectedDeal.clientPhone}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Description */}
                {selectedDeal.description && (
                  <div>
                    <div className="text-gray-500 text-sm mb-2">Description</div>
                    <p className="text-gray-300">{selectedDeal.description}</p>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 mb-1">Created</div>
                    <div className="text-white">{formatDate(selectedDeal.createdAt)}</div>
                  </div>
                  {selectedDeal.expectedCloseDate && (
                    <div>
                      <div className="text-gray-500 mb-1">Expected Close</div>
                      <div className="text-white">{formatDate(selectedDeal.expectedCloseDate)}</div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Deal Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#141417] rounded-2xl border border-white/10 max-w-xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-xl font-semibold text-white">Create New Deal</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form className="p-6 space-y-4" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createDeal({
                  affiliateId,
                  clientName: formData.get("clientName") as string,
                  clientCompany: formData.get("clientCompany") as string || undefined,
                  clientEmail: formData.get("clientEmail") as string || undefined,
                  clientPhone: formData.get("clientPhone") as string || undefined,
                  dealValue: Number(formData.get("dealValue")),
                  productCategory: (formData.get("productCategory") as string).split(",").map(s => s.trim()).filter(Boolean),
                  description: formData.get("description") as string || undefined,
                  status: "prospect",
                  commissionRate: 10,
                  commissionAmount: Number(formData.get("dealValue")) * 0.1,
                });
                setShowModal(false);
              }}>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Client Name *</label>
                  <input
                    name="clientName"
                    required
                    className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Enter client name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Company</label>
                  <input
                    name="clientCompany"
                    className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Company name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                    <input
                      name="clientEmail"
                      type="email"
                      className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="client@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
                    <input
                      name="clientPhone"
                      className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="+27..."
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Deal Value (ZAR) *</label>
                  <input
                    name="dealValue"
                    type="number"
                    required
                    className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="50000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Product Categories</label>
                  <input
                    name="productCategory"
                    className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="workwear, corporate merch"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate categories with commas</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Describe the deal..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-5 py-3 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
                  >
                    Create Deal
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
