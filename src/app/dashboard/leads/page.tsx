"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Zap, 
  Phone, 
  Mail, 
  Building, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  Briefcase,
  Tag,
  X
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatCurrency } from "@/lib/utils";

export default function LeadsPage() {
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate);
  const availableLeads = useQuery(api.leads.getAvailableLeads);
  const myLeads = useQuery(api.leads.getMyLeads, { 
    affiliateId: currentAffiliate?._id as string 
  });
  const claimLead = useMutation(api.leads.claimLead);
  const releaseLead = useMutation(api.leads.releaseLead);
  
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claiming, setClaiming] = useState(false);

  // Loading state
  if (currentAffiliate === null || availableLeads === null || myLeads === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if Platinum
  const isPlatinum = currentAffiliate?.tier === "platinum";

  const handleClaim = async (leadId: string) => {
    if (!currentAffiliate?._id) return;
    setClaiming(true);
    try {
      await claimLead({ leadId, affiliateId: currentAffiliate._id });
      setShowClaimModal(false);
      setSelectedLead(null);
    } catch (error) {
      console.error("Failed to claim lead:", error);
    }
    setClaiming(false);
  };

  const handleRelease = async (leadId: string) => {
    try {
      await releaseLead({ leadId });
    } catch (error) {
      console.error("Failed to release lead:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-medium">Available</span>;
      case "claimed":
        return <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm font-medium">Claimed</span>;
      case "converted":
        return <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm font-medium">Converted</span>;
      case "expired":
        return <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-sm font-medium">Expired</span>;
      default:
        return null;
    }
  };

  const getCompanySizeBadge = (size: string) => {
    const colors: Record<string, string> = {
      "1-10": "bg-gray-500/10 text-gray-400",
      "10-50": "bg-blue-500/10 text-blue-400",
      "50-200": "bg-purple-500/10 text-purple-400",
      "200+": "bg-amber-500/10 text-amber-400",
    };
    return colors[size] || "bg-gray-500/10 text-gray-400";
  };

  if (!isPlatinum) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Platinum Tier Required</h1>
          <p className="text-gray-400 mb-6">
            The Leads feature is exclusive to Platinum affiliates. Upgrade your tier to access premium leads and boost your earnings.
          </p>
          <a 
            href="/dashboard/tier" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all"
          >
            <Zap className="w-5 h-5" />
            Upgrade to Platinum
          </a>
        </motion.div>
      </div>
    );
  }

  const claimedCount = myLeads?.length || 0;
  const maxLeads = 5;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-gray-400">Claim and manage your leads</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#111113] rounded-xl border border-white/5">
            <span className="text-gray-400 text-sm">Claimed:</span>
            <span className="text-white font-semibold ml-2">{claimedCount}/{maxLeads}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111113] rounded-2xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-gray-400 text-sm">Available</span>
          </div>
          <p className="text-2xl font-bold text-white">{availableLeads?.length || 0}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#111113] rounded-2xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-gray-400 text-sm">My Leads</span>
          </div>
          <p className="text-2xl font-bold text-white">{claimedCount}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111113] rounded-2xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-gray-400 text-sm">Converted</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {myLeads?.filter(l => l.status === "converted").length || 0}
          </p>
        </motion.div>
      </div>

      {/* Available Leads */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Available Leads</h2>
        {availableLeads && availableLeads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableLeads.map((lead, index) => (
              <motion.div
                key={lead._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#111113] rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold">{lead.companyName}</h3>
                    <p className="text-gray-400 text-sm">{lead.contactName}</p>
                  </div>
                  {getStatusBadge(lead.status)}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-300">{lead.email}</span>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-300">{lead.phone}</span>
                    </div>
                  )}
                  {lead.companySize && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className={`px-2 py-0.5 rounded text-xs ${getCompanySizeBadge(lead.companySize)}`}>
                        {lead.companySize} employees
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {lead.productInterest && (
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs">
                      {lead.productInterest}
                    </span>
                  )}
                  {lead.budgetRange && (
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {lead.budgetRange}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedLead(lead);
                    setShowClaimModal(true);
                  }}
                  disabled={claimedCount >= maxLeads}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {claimedCount >= maxLeads ? "Lead Limit Reached" : "Claim Lead"}
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-[#111113] rounded-2xl p-8 border border-white/5 text-center">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No leads available at the moment</p>
          </div>
        )}
      </div>

      {/* My Claimed Leads */}
      {myLeads && myLeads.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">My Claimed Leads</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myLeads.map((lead, index) => (
              <motion.div
                key={lead._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#111113] rounded-2xl p-5 border border-white/5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold">{lead.companyName}</h3>
                    <p className="text-gray-400 text-sm">{lead.contactName}</p>
                  </div>
                  {getStatusBadge(lead.status)}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-300">{lead.email}</span>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-300">{lead.phone}</span>
                    </div>
                  )}
                  {lead.claimedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">
                        Claimed: {new Date(lead.claimedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors">
                    Convert to Deal
                  </button>
                  <button
                    onClick={() => handleRelease(lead._id)}
                    className="px-4 py-2.5 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Claim Modal */}
      <AnimatePresence>
        {showClaimModal && selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowClaimModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111113] rounded-2xl p-6 max-w-md w-full border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Claim Lead</h3>
                <button 
                  onClick={() => setShowClaimModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <Building className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">{selectedLead.companyName}</p>
                    <p className="text-gray-400 text-sm">{selectedLead.contactName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">{selectedLead.email}</span>
                </div>
                {selectedLead.phone && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">{selectedLead.phone}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6">
                <p className="text-amber-400 text-sm">
                  You can have up to 5 active leads at once. Unworked leads will be manually managed.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowClaimModal(false)}
                  className="flex-1 py-3 border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleClaim(selectedLead._id)}
                  disabled={claiming}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {claiming ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Confirm Claim
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
