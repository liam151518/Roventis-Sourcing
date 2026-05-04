"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Briefcase, Building, Mail, FileText } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface Deal {
  _id: string;
  clientName: string;
  clientCompany?: string;
  clientEmail?: string;
  dealValue: number;
  productCategory: string[];
  description?: string;
  status: string;
}

interface LoadFromDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDeal: (deal: Deal) => void;
}

const statusColors: Record<string, string> = {
  proposalSent: "bg-blue-500/10 text-blue-400",
  negotiation: "bg-orange-500/10 text-orange-400",
  closedWon: "bg-emerald-500/10 text-emerald-400",
};

const statusLabels: Record<string, string> = {
  proposalSent: "Proposal Sent",
  negotiation: "Negotiation",
  closedWon: "Closed Won",
};

export function LoadFromDealModal({ isOpen, onClose, onSelectDeal }: LoadFromDealModalProps) {
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate, {});
  const deals = useQuery(
    api.deals.getDealsByAffiliate,
    { affiliateId: currentAffiliate?._id || "" }
  );

  const eligibleDeals = deals?.filter(
    (deal) =>
      deal.status === "proposal_sent" ||
      deal.status === "negotiation" ||
      deal.status === "closed_won"
  );

  const handleSelectDeal = (deal: Deal) => {
    onSelectDeal(deal);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#0a0a0b] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Load from Deal</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Deals List */}
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            {!currentAffiliate ? (
              <div className="text-center py-8 text-gray-500">
                <p>Loading...</p>
              </div>
            ) : !eligibleDeals || eligibleDeals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                <p>No eligible deals found</p>
                <p className="text-sm mt-1 text-gray-600">
                  Deals with status "Proposal Sent", "Negotiation", or "Closed Won" are eligible
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {eligibleDeals.map((deal) => (
                  <button
                    key={deal._id}
                    onClick={() => handleSelectDeal(deal)}
                    className="w-full p-4 bg-white/5 border border-white/5 rounded-xl hover:border-blue-500/50 hover:bg-white/10 transition-all text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-white">
                            {deal.clientCompany || deal.clientName}
                          </span>
                        </div>
                        {deal.clientCompany && (
                          <p className="text-sm text-gray-500 ml-6">{deal.clientName}</p>
                        )}
                        {deal.description && (
                          <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                            {deal.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-sm text-gray-500">
                            {deal.productCategory.join(", ")}
                          </span>
                          <span className="text-sm font-semibold text-blue-400">
                            R{deal.dealValue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[deal.status] || "bg-white/5 text-gray-400"
                        }`}
                      >
                        {statusLabels[deal.status] || deal.status}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cancel button */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={onClose}
              className="w-full py-2 px-4 border border-white/10 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}