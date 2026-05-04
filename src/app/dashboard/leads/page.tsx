"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  X,
  Lock,
  ChevronRight,
  ArrowRight,
  Target,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatCurrency } from "@/lib/utils";

interface Lead {
  _id: string;
  companyName: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  city?: string;
  province?: string;
  industry?: string;
  productInterest?: string[];
  estimatedBudget?: number;
  poolTier?: "standard" | "priority" | "premium";
  status?: string;
  claimedBy?: string;
  claimedAt?: number;
  claimExpiresAt?: number;
  createdAt?: number;
}

const TIER_ACCESS = {
  bronze: { pools: ["standard"], label: "Bronze", weekly: 10 },
  silver: { pools: ["standard"], label: "Silver", weekly: 25 },
  gold: { pools: ["standard", "priority"], label: "Gold", weekly: 50 },
  platinum: { pools: ["standard", "priority", "premium"], label: "Platinum", weekly: Infinity },
};

export default function LeadsPage() {
  const router = useRouter();
  const [activePool, setActivePool] = useState<"standard" | "priority" | "premium">("standard");
  const [claimingLeadId, setClaimingLeadId] = useState<string | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Queries - pass empty object to match Convex args
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate, {});
  
  // Only fetch leads if we have an affiliate ID
  const affiliateIdArg = (currentAffiliate?._id as string) || "";
  
  const leadStats = useQuery(
    api.leads.getLeadStats, 
    affiliateIdArg ? { affiliateId: affiliateIdArg } : "skip"
  );

  // Get leads for current tier's pools
  const affiliateTierData = currentAffiliate?.tier ? TIER_ACCESS[currentAffiliate.tier as keyof typeof TIER_ACCESS] : null;
  
  // Note: getAvailableLeadsForAffiliate returns filtered leads by tier
  const availableLeadsData = useQuery(
    api.leads.getAvailableLeadsForAffiliate,
    affiliateIdArg ? { affiliateId: affiliateIdArg } : "skip"
  );
  const myClaimedLeads = useQuery(
    api.leads.getMyClaimedLeads,
    affiliateIdArg ? { affiliateId: affiliateIdArg } : "skip"
  );

  // Mutations
  const claimLead = useMutation(api.leads.claimLead);
  const releaseLead = useMutation(api.leads.releaseLead);
  const convertLeadToDeal = useMutation(api.leads.convertLeadToDeal);

  const handleClaim = async (lead: Lead) => {
    if (!currentAffiliate?._id) return;
    setClaimingLeadId(lead._id);
    try {
      await claimLead({ affiliateId: currentAffiliate._id, leadId: lead._id });
      setShowClaimModal(false);
      router.push("/dashboard/deals");
    } catch (error) {
      console.error("Failed to claim lead:", error);
      alert(error instanceof Error ? error.message : "Failed to claim lead");
    }
    setClaimingLeadId(null);
  };

  const getTimeUntilReset = (resetAt: number) => {
    const now = Date.now();
    const diff = resetAt - now;
    if (diff <= 0) return "Resets now";
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return "Soon";
  };

  // Filter leads by active pool tab
  const availableLeads = (availableLeadsData?.leads || []).filter((lead: Lead) => 
    (lead.poolTier || "standard") === activePool
  );

  // Check if tier can access pool
  const canAccessPool = (pool: string) => {
    if (!affiliateTierData) return false;
    return affiliateTierData.pools.includes(pool as any);
  };

  // Loading state
  if (currentAffiliate === null || availableLeadsData === null || leadStats === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if not approved - show leads but with warning on claim
  const isTrainingRequired = currentAffiliate && currentAffiliate.isApprovedToSell !== true;

  const tier = (currentAffiliate?.tier || "bronze") as keyof typeof TIER_ACCESS;
  const weeklyUsed = currentAffiliate?.weeklyClaimsUsed || 0;
  const weeklyLimit = affiliateTierData?.weekly || 10;
  const remainingThisWeek = tier === "platinum" ? "Unlimited" : Math.max(0, weeklyLimit - weeklyUsed);
  const resetAt = currentAffiliate?.weeklyClaimsResetAt || 0;

  return (
    <div className="space-y-6">
      {/* Header Strip */}
      {isTrainingRequired && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-amber-400 font-medium">Complete training to claim leads</p>
            <p className="text-amber-300/70 text-sm">Finish your training modules to unlock lead claiming</p>
          </div>
          <a
            href="/dashboard/training"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Start Training
          </a>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Lead Pool</h1>
          <p className="text-gray-400">Fresh leads sourced and verified by Roventis</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-[#111113] rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400 text-sm">This week:</span>
              <span className="text-white font-semibold">
                {tier === "platinum" ? "Unlimited" : `${weeklyUsed} / ${weeklyLimit}`}
              </span>
            </div>
            {tier !== "platinum" && remainingThisWeek !== 0 && (
              <div className="mt-1">
                <div className="h-1.5 bg-[#0a0a0b] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${(weeklyUsed / weeklyLimit) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          {tier !== "platinum" && (
            <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 text-sm">
                  Resets in {getTimeUntilReset(resetAt)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pool Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {(["standard", "priority", "premium"] as const).map((pool) => {
          const isLocked = !canAccessPool(pool);
          const isActive = activePool === pool;
          const count = leadStats?.byPool?.[pool] || 0;

          return (
            <button
              key={pool}
              onClick={() => !isLocked && setActivePool(pool)}
              disabled={isLocked}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                isLocked ? "text-gray-600 cursor-not-allowed" : isActive ? "text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {isLocked && <Lock className="w-4 h-4" />}
              <span className="capitalize">{pool}</span>
              {!isLocked && (
                <span className={`px-2 py-0.5 rounded text-xs ${
                  pool === "premium" ? "bg-purple-500/10 text-purple-400" :
                  pool === "priority" ? "bg-blue-500/10 text-blue-400" :
                  "bg-gray-500/10 text-gray-400"
                }`}>
                  {count}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="activePool"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Locked state for higher tiers */}
      {!canAccessPool(activePool) && (
        <div className="flex flex-col items-center justify-center py-16">
          <Lock className="w-16 h-16 text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Upgrade to {activePool === "priority" ? "Gold" : "Platinum"}
          </h3>
          <p className="text-gray-400 text-center max-w-md mb-6">
            {activePool === "priority" 
              ? "Gold affiliates get access to Priority leads with higher budgets." 
              : "Platinum affiliates get unlimited leads and access to Premium enterprise accounts."}
          </p>
          <a
            href="/dashboard/tier"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all"
          >
            <Zap className="w-5 h-5" />
            Upgrade to {activePool === "priority" ? "Gold" : "Platinum"}
          </a>
        </div>
      )}

      {/* Available Leads Grid */}
      {canAccessPool(activePool) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {availableLeads.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableLeads.map((lead: Lead, index: number) => (
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
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      lead.poolTier === "premium" ? "bg-purple-500/10 text-purple-400" :
                      lead.poolTier === "priority" ? "bg-blue-500/10 text-blue-400" :
                      "bg-gray-500/10 text-gray-400"
                    }`}>
                      {lead.poolTier}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-300">{lead.industry}</span>
                    </div>
                    {(lead.city || lead.province) && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-300">
                          {[lead.city, lead.province].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                    {lead.productInterest && lead.productInterest.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {lead.productInterest.map((interest, i) => (
                          <span key={i} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs">
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    {lead.estimatedBudget && (
                      <div className="flex items-center gap-1 text-emerald-400">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium">{formatCurrency(lead.estimatedBudget)}</span>
                      </div>
                    )}
                    <span className="text-gray-500 text-xs">
                      {getTimeAgo(lead.createdAt)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedLead(lead);
                      setShowClaimModal(true);
                    }}
                    disabled={isTrainingRequired || (tier !== "platinum" && weeklyUsed >= weeklyLimit)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    {isTrainingRequired ? "Training Required" : tier !== "platinum" && weeklyUsed >= weeklyLimit ? "Weekly Limit Reached" : "Claim Lead"}
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-[#111113] rounded-2xl p-12 border border-white/5 text-center">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Leads Available</h3>
              <p className="text-gray-400 mb-4">
                New leads are uploaded weekly. Check back soon.
              </p>
            </div>
          )}
        </motion.div>
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
                {selectedLead.contactPhone && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">{selectedLead.contactPhone}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
                <p className="text-blue-400 text-sm">
                  This lead will be assigned to you for 72 hours. After that, it will be returned to the pool.
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
                  onClick={() => handleClaim(selectedLead)}
                  disabled={claimingLeadId !== null}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {claimingLeadId ? (
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

function CountdownBadge({ expiresAt }: { expiresAt: number }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = expiresAt - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }
      const hours = Math.floor(diff / (60 * 60 * 1000));
      const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      setTimeLeft(`${hours}h ${mins}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const urgency = expiresAt - Date.now();
  const color = urgency < 6 * 60 * 60 * 1000 ? "text-red-400" : 
               urgency < 24 * 60 * 60 * 1000 ? "text-amber-400" : 
               "text-blue-400";

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${color} bg-current/10`}>
      <Clock className="w-3 h-3" />
      <span className="text-xs font-medium">{timeLeft}</span>
    </div>
  );
}

function getTimeAgo(timestamp?: number): string {
  if (!timestamp) return "Unknown";
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / (60 * 60 * 1000));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Need to import MapPin
import { MapPin } from "lucide-react";