"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  XCircle,
  CheckCircle,
  ChevronLeft,
  AlertTriangle,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatCurrency } from "@/lib/utils";

interface ClaimedLead {
  _id: string;
  companyName: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  city?: string;
  province?: string;
  industry?: string;
  productInterest: string[];
  estimatedBudget?: number;
  poolTier: string;
  claimedAt?: number;
  claimExpiresAt?: number;
  createdAt: number;
}

export default function ClaimedLeadsPage() {
  const router = useRouter();
  const [selectedLead, setSelectedLead] = useState<ClaimedLead | null>(null);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [releaseReason, setReleaseReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Queries
  // Queries - pass empty object to match Convex args
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate, {});
  const affiliateIdArg = (currentAffiliate?._id as string) || "";
  const myClaimedLeads = useQuery(
    api.leads.getMyClaimedLeads,
    affiliateIdArg ? { affiliateId: affiliateIdArg } : "skip"
  );

  // Mutations
  const releaseLead = useMutation(api.leads.releaseLead);
  const convertLeadToDeal = useMutation(api.leads.convertLeadToDeal);

  const handleRelease = async () => {
    if (!selectedLead || !currentAffiliate?._id) return;
    setProcessingId(selectedLead._id);
    try {
      await releaseLead({
        affiliateId: currentAffiliate._id,
        leadId: selectedLead._id,
        reason: releaseReason,
      });
      setShowReleaseModal(false);
      setSelectedLead(null);
      setReleaseReason("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to release lead");
    }
    setProcessingId(null);
  };

  const handleConvert = async () => {
    if (!selectedLead || !currentAffiliate?._id) return;
    setProcessingId(selectedLead._id);
    try {
      await convertLeadToDeal({
        affiliateId: currentAffiliate._id,
        leadId: selectedLead._id,
      });
      setShowConvertModal(false);
      setSelectedLead(null);
      router.push("/dashboard/deals");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to convert lead");
    }
    setProcessingId(null);
  };

  // Loading state
  if (currentAffiliate === null || myClaimedLeads === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const claimedLeads = (myClaimedLeads || []) as ClaimedLead[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard/leads")}
          className="p-2 hover:bg-white/5 rounded-[14px] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div>
          <span className="rs-overline">My Claimed Leads</span>
          <h1 className="rs-page-title">Manage your active leads</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rs-card p-4">
          <p className="text-gray-400 text-sm">Active Claims</p>
          <p className="text-2xl font-bold text-white">{claimedLeads.length}</p>
        </div>
        <div className="rs-card p-4">
          <p className="text-gray-400 text-sm">Expiring Soon</p>
          <p className="text-2xl font-bold text-amber-400">
            {claimedLeads.filter(l => l.claimExpiresAt && l.claimExpiresAt - Date.now() < 24 * 60 * 60 * 1000).length}
          </p>
        </div>
        <div className="rs-card p-4">
          <p className="text-gray-400 text-sm">Total Budget</p>
          <p className="text-2xl font-bold text-emerald-400">
            {formatCurrency(claimedLeads.reduce((sum, l) => sum + (l.estimatedBudget || 0), 0))}
          </p>
        </div>
      </div>

      {/* Claimed Leads */}
      {claimedLeads.length > 0 ? (
        <div className="space-y-4">
          {claimedLeads.map((lead: ClaimedLead, index: number) => (
            <motion.div
              key={lead._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#141417] rounded-[14px] border border-white/5 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Lead Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[14px] flex items-center justify-center text-white font-bold text-lg">
                        {lead.companyName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{lead.companyName}</h3>
                        <p className="text-gray-400">{lead.contactName}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                          lead.poolTier === "premium" ? "bg-purple-500/10 text-purple-400" :
                          lead.poolTier === "priority" ? "bg-blue-500/10 text-blue-400" :
                          "bg-gray-500/10 text-gray-400"
                        }`}>
                          {lead.poolTier}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {lead.contactPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-300 text-sm">{lead.contactPhone}</span>
                        </div>
                      )}
                      {lead.contactEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-300 text-sm">{lead.contactEmail}</span>
                        </div>
                      )}
                      {(lead.city || lead.province) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-300 text-sm">
                            {[lead.city, lead.province].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
                      {lead.industry && (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-300 text-sm">{lead.industry}</span>
                        </div>
                      )}
                    </div>

                    {lead.productInterest && lead.productInterest.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {lead.productInterest.map((interest, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs">
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}

                    {lead.estimatedBudget && (
                      <div className="mt-3 flex items-center gap-1 text-emerald-400">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium">{formatCurrency(lead.estimatedBudget)}</span>
                        <span className="text-gray-500 text-sm">estimated budget</span>
                      </div>
                    )}
                  </div>

                  {/* Countdown & Actions */}
                  <div className="flex flex-col items-end gap-4">
                    {lead.claimExpiresAt && (
                      <CountdownRing expiresAt={lead.claimExpiresAt} />
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowConvertModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[14px] text-sm font-medium transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Convert
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowReleaseModal(true);
                        }}
                        className="p-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-[14px] transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-[#141417] rounded-[14px] p-12 border border-white/5 text-center">
          <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Claimed Leads</h3>
          <p className="text-gray-400 mb-6">
            You haven't claimed any leads yet.
          </p>
          <button
            onClick={() => router.push("/dashboard/leads")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-[14px] transition-colors"
          >
            Browse Available Leads
          </button>
        </div>
      )}

      {/* Release Modal */}
      <AnimatePresence>
        {showReleaseModal && selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReleaseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111113] rounded-[14px] p-6 max-w-md w-full border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Release Lead</h3>
                <button
                  onClick={() => setShowReleaseModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-[14px] mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-amber-400 font-medium">Release "{selectedLead.companyName}"?</p>
                    <p className="text-amber-300/70 text-sm mt-1">
                      This will return the lead to the pool. If you release more than twice, the lead will be retired.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-gray-400 text-sm mb-2 block">Reason (optional)</label>
                <select
                  value={releaseReason}
                  onChange={(e) => setReleaseReason(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0a0a0b] border border-white/10 rounded-[14px] text-white"
                >
                  <option value="">Select a reason...</option>
                  <option value="not_interested">Not interested</option>
                  <option value="no_response">No response</option>
                  <option value="bad_fit">Not a good fit</option>
                  <option value="already_client">Already a client</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReleaseModal(false)}
                  className="flex-1 py-3 border border-white/10 text-gray-300 rounded-[14px] hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRelease}
                  disabled={processingId !== null}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-medium rounded-[14px] transition-colors flex items-center justify-center gap-2"
                >
                  {processingId ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Release
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Convert Modal */}
      <AnimatePresence>
        {showConvertModal && selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConvertModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111113] rounded-[14px] p-6 max-w-md w-full border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Convert to Deal</h3>
                <button
                  onClick={() => setShowConvertModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-[14px]">
                  <Building className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">{selectedLead.companyName}</p>
                    <p className="text-gray-400 text-sm">{selectedLead.industry}</p>
                  </div>
                </div>
                {selectedLead.estimatedBudget && (
                  <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-[14px]">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400">
                      Estimated value: {formatCurrency(selectedLead.estimatedBudget)}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-[14px] mb-6">
                <p className="text-blue-400 text-sm">
                  A new deal will be created and marked as "Qualified". You can then add more details in the deals section.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConvertModal(false)}
                  className="flex-1 py-3 border border-white/10 text-gray-300 rounded-[14px] hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConvert}
                  disabled={processingId !== null}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white font-medium rounded-[14px] transition-colors flex items-center justify-center gap-2"
                >
                  {processingId ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Convert to Deal
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

function CountdownRing({ expiresAt }: { expiresAt: number }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, mins: 0, secs: 0 });
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const update = () => {
      const diff = expiresAt - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, mins: 0, secs: 0 });
        setProgress(0);
        return;
      }
      const hours = Math.floor(diff / (60 * 60 * 1000));
      const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      const secs = Math.floor((diff % (60 * 1000)) / 1000);
      setTimeLeft({ hours, mins, secs });

      // 72 hours = 100%, 0 hours = 0%
      const totalHours = diff / (60 * 60 * 1000);
      setProgress((totalHours / 72) * 100);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  // Urgency colors
  const hoursLeft = timeLeft.hours + timeLeft.mins / 60;
  const color = hoursLeft < 6 ? "#ef4444" : // red
               hoursLeft < 24 ? "#f59e0b" : // amber
               "#3b82f6"; // blue

  const bgColor = `${color}20`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={bgColor}
            strokeWidth="4"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={`${progress * 2.26} 226`}
            strokeLinecap="round"
            className="transition-all"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-lg font-bold" style={{ color }}>
              {hoursLeft < 1 ? timeLeft.mins : timeLeft.hours}
            </span>
            <span className="text-xs text-gray-500 block">
              {hoursLeft < 1 ? "m" : "h"}
            </span>
          </div>
        </div>
      </div>
      <span className="text-xs text-gray-500 mt-1">
        {hoursLeft < 24 ? "remaining" : "left"}
      </span>
    </div>
  );
}