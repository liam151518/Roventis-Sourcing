"use client";

import { useState, useEffect } from "react";
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
  AlertCircle,
  UserPlus,
  Tag,
  X,
  Lock,
  Target,
  MapPin,
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
  const [activeTab, setActiveTab] = useState<"standard" | "priority" | "premium">("standard");
  const [claimingLeadId, setClaimingLeadId] = useState<string | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate, {});
  const affiliateIdArg = (currentAffiliate?._id as string) || "";

  const leadStats = useQuery(
    api.leads.getLeadStats,
    affiliateIdArg ? { affiliateId: affiliateIdArg } : "skip"
  );

  const affiliateTierData = currentAffiliate?.tier
    ? TIER_ACCESS[currentAffiliate.tier as keyof typeof TIER_ACCESS]
    : null;

  const availableLeadsData = useQuery(
    api.leads.getAvailableLeadsForAffiliate,
    affiliateIdArg ? { affiliateId: affiliateIdArg } : "skip"
  );

  const claimLead = useMutation(api.leads.claimLead);

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

  const availableLeads = (availableLeadsData?.leads || []).filter((lead: Lead) =>
    (lead.poolTier || "standard") === activeTab
  );

  const canAccessPool = (pool: string) => {
    if (!affiliateTierData) return false;
    return affiliateTierData.pools.includes(pool as any);
  };

  if (currentAffiliate === null || availableLeadsData === null || leadStats === null) {
    return (
      <div className="space-y-6">
        <div className="rs-skeleton h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="rs-skeleton h-20" />
          <div className="rs-skeleton h-20" />
          <div className="rs-skeleton h-20" />
        </div>
      </div>
    );
  }

  const isTrainingRequired =
    currentAffiliate && currentAffiliate.isApprovedToSell !== true;

  const tier = (currentAffiliate?.tier || "bronze") as keyof typeof TIER_ACCESS;
  const weeklyUsed = currentAffiliate?.weeklyClaimsUsed || 0;
  const weeklyLimit = affiliateTierData?.weekly || 10;
  const remainingThisWeek =
    tier === "platinum" ? "Unlimited" : Math.max(0, weeklyLimit - weeklyUsed);
  const resetAt = currentAffiliate?.weeklyClaimsResetAt || 0;
  const weekProgressPct =
    tier === "platinum" ? 100 : Math.min(100, (weeklyUsed / weeklyLimit) * 100);

  return (
    <div className="space-y-8">
      {/* Training Required Banner */}
      {isTrainingRequired && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rs-callout rs-callout--warning"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-medium">Complete training to claim leads</div>
            <div
              className="text-xs mt-0.5"
              style={{ color: "var(--rs-warning)", opacity: 0.75 }}
            >
              Finish your training modules to unlock lead claiming.
            </div>
          </div>
          <a href="/dashboard/training" className="rs-btn-primary">
            Start Training
          </a>
        </motion.div>
      )}

      {/* Header Strip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
      >
        <div>
          <span className="rs-overline">Lead Pool</span>
          <h1 className="rs-page-title text-2xl md:text-[28px] mt-1">Fresh leads</h1>
          <p className="rs-page-subtitle">
            Sourced and verified by Roventis, ready for you to claim.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rs-card px-4 py-3 min-w-[180px]">
            <div className="flex items-center gap-2 text-xs">
              <Target
                className="w-3.5 h-3.5"
                style={{ color: "var(--rs-text-accent)" }}
              />
              <span style={{ color: "var(--rs-text-secondary)" }}>This week:</span>
              <span className="font-semibold text-white">
                {tier === "platinum" ? "Unlimited" : `${weeklyUsed} / ${weeklyLimit}`}
              </span>
            </div>
            {tier !== "platinum" && remainingThisWeek !== 0 && (
              <div
                className="mt-2 h-1 rounded-full overflow-hidden"
                style={{ background: "var(--rs-bg-base)" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${weekProgressPct}%`,
                    background:
                      "linear-gradient(90deg, var(--rs-accent), var(--rs-text-accent))",
                  }}
                />
              </div>
            )}
          </div>
          {tier !== "platinum" && (
            <div
              className="px-3 py-2 rounded-xl flex items-center gap-2"
              style={{
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.20)",
              }}
            >
              <Clock
                className="w-3.5 h-3.5"
                style={{ color: "var(--rs-warning)" }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: "var(--rs-warning)" }}
              >
                Resets in {getTimeUntilReset(resetAt)}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Pool Tabs */}
      <div className="rs-segmented">
        {(["standard", "priority", "premium"] as const).map((pool) => {
          const isLocked = !canAccessPool(pool);
          const isActive = activeTab === pool;
          const count = leadStats?.byPool?.[pool] || 0;

          return (
            <button
              key={pool}
              onClick={() => !isLocked && setActiveTab(pool as any)}
              disabled={isLocked}
              className={`rs-segmented-item capitalize ${
                isActive ? "rs-segmented-item--active" : ""
              } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLocked && <Lock className="w-3 h-3" />}
              {pool}
              {!isLocked && (
                <span
                  className={`rs-pill ml-1.5 ${
                    pool === "premium"
                      ? "rs-pill--violet"
                      : pool === "priority"
                        ? "rs-pill--info"
                        : ""
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Locked state for higher tiers */}
      {!canAccessPool(activeTab) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rs-card p-10 text-center"
        >
          <div
            className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
            style={{
              background: "var(--rs-bg-overlay)",
              color: "var(--rs-text-muted)",
            }}
          >
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Upgrade to {activeTab === "priority" ? "Gold" : "Platinum"}
          </h3>
          <p
            className="text-sm max-w-md mx-auto mb-5"
            style={{ color: "var(--rs-text-secondary)" }}
          >
            {activeTab === "priority"
              ? "Gold affiliates get access to Priority leads with higher budgets."
              : "Platinum affiliates get unlimited leads and access to Premium enterprise accounts."}
          </p>
          <a href="/dashboard/tier" className="rs-btn-primary inline-flex">
            <Zap className="w-3.5 h-3.5" />
            Upgrade to {activeTab === "priority" ? "Gold" : "Platinum"}
          </a>
        </motion.div>
      )}

      {/* Available Leads Grid */}
      {canAccessPool(activeTab) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {availableLeads.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableLeads.map((lead: Lead, index: number) => (
                <motion.div
                  key={lead._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="rs-card p-5 flex flex-col hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {lead.companyName}
                      </h3>
                      <p
                        className="text-xs truncate"
                        style={{ color: "var(--rs-text-secondary)" }}
                      >
                        {lead.contactName}
                      </p>
                    </div>
                    <span
                      className={`rs-pill ${
                        lead.poolTier === "premium"
                          ? "rs-pill--violet"
                          : lead.poolTier === "priority"
                            ? "rs-pill--info"
                            : ""
                      }`}
                    >
                      {lead.poolTier}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 flex-1">
                    {lead.industry && (
                      <div className="flex items-center gap-2 text-xs min-w-0">
                        <Building
                          className="w-3.5 h-3.5 flex-shrink-0"
                          style={{ color: "var(--rs-text-muted)" }}
                        />
                        <span
                          className="truncate"
                          style={{ color: "var(--rs-text-secondary)" }}
                        >
                          {lead.industry}
                        </span>
                      </div>
                    )}
                    {(lead.city || lead.province) && (
                      <div className="flex items-center gap-2 text-xs min-w-0">
                        <MapPin
                          className="w-3.5 h-3.5 flex-shrink-0"
                          style={{ color: "var(--rs-text-muted)" }}
                        />
                        <span
                          className="truncate"
                          style={{ color: "var(--rs-text-secondary)" }}
                        >
                          {[lead.city, lead.province].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                    {lead.productInterest && lead.productInterest.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {lead.productInterest.slice(0, 3).map((interest, i) => (
                          <span key={i} className="rs-pill rs-pill--info">
                            <Tag className="w-3 h-3" />
                            {interest}
                          </span>
                        ))}
                        {lead.productInterest.length > 3 && (
                          <span className="rs-pill">
                            +{lead.productInterest.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-3 text-xs">
                    {lead.estimatedBudget ? (
                      <div
                        className="flex items-center gap-1 font-medium"
                        style={{ color: "var(--rs-success)" }}
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{formatCurrency(lead.estimatedBudget)}</span>
                      </div>
                    ) : (
                      <span />
                    )}
                    <span style={{ color: "var(--rs-text-muted)" }}>
                      {getTimeAgo(lead.createdAt)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedLead(lead);
                      setShowClaimModal(true);
                    }}
                    disabled={
                      isTrainingRequired ||
                      (tier !== "platinum" && weeklyUsed >= weeklyLimit)
                    }
                    className="rs-btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    {isTrainingRequired
                      ? "Training Required"
                      : tier !== "platinum" && weeklyUsed >= weeklyLimit
                        ? "Weekly Limit Reached"
                        : "Claim Lead"}
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rs-empty-state py-16">
              <div className="rs-empty-state-icon">
                <Users className="w-5 h-5" />
              </div>
              <div className="rs-empty-state-title">No Leads Available</div>
              <div className="rs-empty-state-description">
                New leads are uploaded weekly. Check back soon.
              </div>
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
            className="rs-modal-backdrop"
            onClick={() => setShowClaimModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rs-modal max-w-md w-full p-0"
            >
              <div className="rs-modal-header">
                <h3 className="text-base font-semibold text-white">Claim Lead</h3>
                <button
                  onClick={() => setShowClaimModal(false)}
                  className="p-1 rounded-md hover:bg-white/5 transition-colors"
                  style={{ color: "var(--rs-text-secondary)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="rs-modal-body space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}
                >
                  <div className="rs-icon-tile rs-icon-tile--accent">
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {selectedLead.companyName}
                    </p>
                    <p className="text-xs truncate"
                      style={{ color: "var(--rs-text-secondary)" }}
                    >
                      {selectedLead.contactName}
                    </p>
                  </div>
                </div>
                {selectedLead.contactPhone && (
                  <div className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}
                  >
                    <Phone className="w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
                    <span className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>
                      {selectedLead.contactPhone}
                    </span>
                  </div>
                )}
                <div className="rs-callout rs-callout--info">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    This lead will be assigned to you for 72 hours. After that, it
                    will return to the pool.
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowClaimModal(false)}
                    className="rs-btn-ghost flex-1 justify-center"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleClaim(selectedLead)}
                    disabled={claimingLeadId !== null}
                    className="rs-btn-primary flex-1 justify-center disabled:opacity-50"
                  >
                    {claimingLeadId ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        Confirm Claim
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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