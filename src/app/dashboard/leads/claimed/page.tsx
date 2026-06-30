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
  XCircle,
  CheckCircle,
  ChevronLeft,
  AlertTriangle,
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

  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate, {});
  const affiliateIdArg = (currentAffiliate?._id as string) || "";
  const myClaimedLeads = useQuery(
    api.leads.getMyClaimedLeads,
    affiliateIdArg ? { affiliateId: affiliateIdArg } : "skip"
  );

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

  if (currentAffiliate === null || myClaimedLeads === null) {
    return (
      <div className="space-y-6">
        <div className="rs-skeleton h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rs-skeleton h-24" />
          <div className="rs-skeleton h-24" />
          <div className="rs-skeleton h-24" />
        </div>
      </div>
    );
  }

  const claimedLeads = (myClaimedLeads || []) as ClaimedLead[];

  const activeCount = claimedLeads.length;
  const expiringCount = claimedLeads.filter(
    (l) =>
      l.claimExpiresAt &&
      l.claimExpiresAt - Date.now() < 24 * 60 * 60 * 1000
  ).length;
  const totalBudget = claimedLeads.reduce(
    (sum, l) => sum + (l.estimatedBudget || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/dashboard/leads")}
          className="rs-btn-ghost p-2"
          aria-label="Back to leads"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="rs-overline">My Claimed Leads</span>
          <h1 className="rs-page-title text-2xl md:text-[28px] mt-1">
            Manage your active leads
          </h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rs-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="rs-icon-tile rs-icon-tile--info">
              <Clock className="w-4 h-4" />
            </div>
            <span className="rs-pill">{activeCount} active</span>
          </div>
          <div className="text-2xl font-semibold text-white rs-stat">
            {activeCount}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--rs-text-secondary)" }}>
            Active claims
          </div>
        </div>
        <div className="rs-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="rs-icon-tile rs-icon-tile--warning">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div
            className="text-2xl font-semibold rs-stat"
            style={{ color: "var(--rs-warning)" }}
          >
            {expiringCount}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--rs-text-secondary)" }}>
            Expiring soon
          </div>
        </div>
        <div className="rs-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="rs-icon-tile rs-icon-tile--success">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div
            className="text-2xl font-semibold rs-stat"
            style={{ color: "var(--rs-success)" }}
          >
            {formatCurrency(totalBudget)}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--rs-text-secondary)" }}>
            Total budget
          </div>
        </div>
      </div>

      {/* Claimed Leads */}
      {claimedLeads.length > 0 ? (
        <div className="space-y-3">
          {claimedLeads.map((lead: ClaimedLead, index: number) => (
            <motion.div
              key={lead._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rs-card overflow-hidden"
            >
              <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Lead Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="rs-icon-tile rs-icon-tile--accent w-11 h-11">
                        <span className="text-base font-semibold">
                          {lead.companyName.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">
                          {lead.companyName}
                        </h3>
                        <p
                          className="text-xs"
                          style={{ color: "var(--rs-text-secondary)" }}
                        >
                          {lead.contactName}
                        </p>
                        <div className="mt-1.5">
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
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {lead.contactPhone && (
                        <div className="flex items-center gap-2 text-xs">
                          <Phone
                            className="w-3.5 h-3.5"
                            style={{ color: "var(--rs-text-muted)" }}
                          />
                          <span style={{ color: "var(--rs-text-secondary)" }}>
                            {lead.contactPhone}
                          </span>
                        </div>
                      )}
                      {lead.contactEmail && (
                        <div className="flex items-center gap-2 text-xs min-w-0">
                          <Mail
                            className="w-3.5 h-3.5 flex-shrink-0"
                            style={{ color: "var(--rs-text-muted)" }}
                          />
                          <span
                            className="truncate"
                            style={{ color: "var(--rs-text-secondary)" }}
                          >
                            {lead.contactEmail}
                          </span>
                        </div>
                      )}
                      {(lead.city || lead.province) && (
                        <div className="flex items-center gap-2 text-xs">
                          <MapPin
                            className="w-3.5 h-3.5"
                            style={{ color: "var(--rs-text-muted)" }}
                          />
                          <span style={{ color: "var(--rs-text-secondary)" }}>
                            {[lead.city, lead.province].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
                      {lead.industry && (
                        <div className="flex items-center gap-2 text-xs">
                          <Building
                            className="w-3.5 h-3.5"
                            style={{ color: "var(--rs-text-muted)" }}
                          />
                          <span style={{ color: "var(--rs-text-secondary)" }}>
                            {lead.industry}
                          </span>
                        </div>
                      )}
                    </div>

                    {lead.productInterest && lead.productInterest.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {lead.productInterest.map((interest, i) => (
                          <span key={i} className="rs-pill rs-pill--info">
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}

                    {lead.estimatedBudget && (
                      <div
                        className="mt-3 inline-flex items-center gap-1.5 text-sm"
                        style={{ color: "var(--rs-success)" }}
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span className="font-medium">
                          {formatCurrency(lead.estimatedBudget)}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: "var(--rs-text-muted)" }}
                        >
                          estimated budget
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Countdown & Actions */}
                  <div className="flex md:flex-col items-end justify-between md:justify-start gap-3 md:gap-4">
                    {lead.claimExpiresAt && (
                      <CountdownRing expiresAt={lead.claimExpiresAt} />
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowConvertModal(true);
                        }}
                        className="rs-btn-primary"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Convert
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowReleaseModal(true);
                        }}
                        className="rs-btn-ghost p-2"
                        style={{
                          color: "var(--rs-danger)",
                          borderColor: "rgba(239,68,68,0.25)",
                        }}
                        aria-label="Release lead"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rs-empty-state py-20">
          <div className="rs-empty-state-icon">
            <Clock className="w-5 h-5" />
          </div>
          <div className="rs-empty-state-title">No claimed leads</div>
          <div className="rs-empty-state-description">
            You haven't claimed any leads yet.
          </div>
          <button
            onClick={() => router.push("/dashboard/leads")}
            className="rs-btn-primary mt-4 inline-flex"
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
            className="rs-modal-backdrop"
            onClick={() => setShowReleaseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rs-modal max-w-md w-full p-0"
            >
              <div className="rs-modal-header">
                <h3 className="text-base font-semibold text-white">Release Lead</h3>
                <button
                  onClick={() => setShowReleaseModal(false)}
                  className="p-1 rounded-md hover:bg-white/5"
                  style={{ color: "var(--rs-text-secondary)" }}
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
              <div className="rs-modal-body space-y-4">
                <div className="rs-callout rs-callout--warning">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">
                      Release "{selectedLead.companyName}"?
                    </div>
                    <div
                      className="text-xs mt-1"
                      style={{ color: "var(--rs-warning)", opacity: 0.85 }}
                    >
                      This will return the lead to the pool. If you release more
                      than twice, the lead will be retired.
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--rs-text-secondary)" }}
                  >
                    Reason (optional)
                  </label>
                  <select
                    value={releaseReason}
                    onChange={(e) => setReleaseReason(e.target.value)}
                    className="rs-input"
                  >
                    <option value="">Select a reason...</option>
                    <option value="not_interested">Not interested</option>
                    <option value="no_response">No response</option>
                    <option value="bad_fit">Not a good fit</option>
                    <option value="already_client">Already a client</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowReleaseModal(false)}
                    className="rs-btn-ghost flex-1 justify-center"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRelease}
                    disabled={processingId !== null}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm text-white transition-colors disabled:opacity-50"
                    style={{ background: "var(--rs-danger)" }}
                  >
                    {processingId ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        Release
                      </>
                    )}
                  </button>
                </div>
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
            className="rs-modal-backdrop"
            onClick={() => setShowConvertModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rs-modal max-w-md w-full p-0"
            >
              <div className="rs-modal-header">
                <h3 className="text-base font-semibold text-white">
                  Convert to Deal
                </h3>
                <button
                  onClick={() => setShowConvertModal(false)}
                  className="p-1 rounded-md hover:bg-white/5"
                  style={{ color: "var(--rs-text-secondary)" }}
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
              <div className="rs-modal-body space-y-3">
                <div
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    background: "var(--rs-bg-base)",
                    border: "1px solid var(--rs-border)",
                  }}
                >
                  <div className="rs-icon-tile rs-icon-tile--info">
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {selectedLead.companyName}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--rs-text-secondary)" }}
                    >
                      {selectedLead.industry}
                    </p>
                  </div>
                </div>
                {selectedLead.estimatedBudget && (
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      background: "rgba(16,185,129,0.08)",
                      border: "1px solid rgba(16,185,129,0.20)",
                    }}
                  >
                    <DollarSign
                      className="w-4 h-4"
                      style={{ color: "var(--rs-success)" }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--rs-success)" }}
                    >
                      Estimated value: {formatCurrency(selectedLead.estimatedBudget)}
                    </span>
                  </div>
                )}
                <div className="rs-callout rs-callout--info">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    A new deal will be created and marked as "Qualified". You can
                    then add more details in the deals section.
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowConvertModal(false)}
                    className="rs-btn-ghost flex-1 justify-center"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConvert}
                    disabled={processingId !== null}
                    className="rs-btn-primary flex-1 justify-center disabled:opacity-50"
                    style={{
                      background: "var(--rs-success)",
                      borderColor: "var(--rs-success)",
                    }}
                  >
                    {processingId ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        Convert to Deal
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

      const totalHours = diff / (60 * 60 * 1000);
      setProgress((totalHours / 72) * 100);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const hoursLeft = timeLeft.hours + timeLeft.mins / 60;
  const color =
    hoursLeft < 6
      ? "#ef4444"
      : hoursLeft < 24
        ? "#f59e0b"
        : "#7c3aed";
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
            <span
              className="text-xs block"
              style={{ color: "var(--rs-text-muted)" }}
            >
              {hoursLeft < 1 ? "m" : "h"}
            </span>
          </div>
        </div>
      </div>
      <span className="text-[10px] mt-1" style={{ color: "var(--rs-text-muted)" }}>
        {hoursLeft < 24 ? "remaining" : "left"}
      </span>
    </div>
  );
}