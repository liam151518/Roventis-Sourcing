"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Building, 
  CreditCard, 
  Lock,
  Save,
  Award,
  Share2,
  Copy,
  Check,
  Edit3,
  Zap,
  TrendingUp,
  Star,
  Crown,
  ChevronRight,
  CheckCircle,
  X,
  ArrowRight
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

const tiers = [
  {
    id: "bronze",
    name: "Bronze",
    accent: "rgba(245,158,11,0.10)",
    color: "from-orange-700 to-orange-900",
    accentColor: "#fbbf24",
    borderAccent: "border-orange-500/20",
    iconColor: "#fbbf24",
    borderColor: "border-orange-500/30",
    icon: Award,
    commission: "5%",
    subscription: "Free",
    requirements: ["Sign up"],
    features: [
      { name: "Access to dashboard", included: true },
      { name: "Basic training modules", included: true },
      { name: "Deal management (10 active)", included: true },
      { name: "Basic resources", included: true },
      { name: "Commission payouts", included: true },
      { name: "Lead access", included: false },
      { name: "Priority support", included: false },
      { name: "Advanced training", included: false },
    ],
  },
  {
    id: "silver",
    name: "Silver",
    accent: "rgba(148,163,184,0.12)",
    color: "from-gray-400 to-gray-600",
    accentColor: "#cbd5e1",
    borderAccent: "border-white/10",
    iconColor: "#cbd5e1",
    borderColor: "border-gray-400/30",
    icon: Star,
    commission: "7.5%",
    subscription: "Free",
    requirements: ["First sale"],
    features: [
      { name: "Access to dashboard", included: true },
      { name: "Basic training modules", included: true },
      { name: "Deal management (unlimited)", included: true },
      { name: "Full resource access", included: true },
      { name: "Commission payouts", included: true },
      { name: "Lead access", included: false },
      { name: "Priority support", included: false },
      { name: "Advanced training", included: true },
    ],
  },
  {
    id: "gold",
    name: "Gold",
    accent: "rgba(252,211,77,0.12)",
    color: "from-yellow-500 to-amber-600",
    accentColor: "#fcd34d",
    borderAccent: "border-amber-400/30",
    iconColor: "#fcd34d",
    borderColor: "border-yellow-500/30",
    icon: TrendingUp,
    commission: "10%",
    subscription: "Free",
    requirements: ["R150,000 in sales"],
    features: [
      { name: "Access to dashboard", included: true },
      { name: "Basic + Premium training", included: true },
      { name: "Deal management (unlimited)", included: true },
      { name: "Full resource access", included: true },
      { name: "Commission payouts", included: true },
      { name: "Lead access", included: false },
      { name: "Priority support", included: true },
      { name: "Advanced training", included: true },
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    accent: "var(--rs-accent-soft)",
    color: "from-violet-600 to-purple-800",
    accentColor: "var(--rs-text-accent)",
    borderAccent: "border-violet-500/30",
    iconColor: "var(--rs-text-accent)",
    borderColor: "border-violet-500/30",
    icon: Crown,
    commission: "12-15%",
    subscription: "R899.69/mo",
    requirements: ["Pay R899.69/month"],
    features: [
      { name: "Access to dashboard", included: true },
      { name: "All training modules", included: true },
      { name: "Deal management (unlimited)", included: true },
      { name: "Exclusive resources", included: true },
      { name: "Commission payouts", included: true },
      { name: "Lead pool access", included: true },
      { name: "Priority support", included: true },
      { name: "Advanced training", included: true },
      { name: "12-15% commission", included: true },
    ],
  },
];

export default function ProfilePage() {
  const { userId } = useAuth();
  const currentAffiliate = useQuery(
    api.affiliates.getCurrentAffiliate,
    { clerkUserId: userId || undefined }
  );
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const tierIconColors: Record<string, string> = {
    bronze: "#fbbf24",
    silver: "#cbd5e1",
    gold: "#fcd34d",
    platinum: "var(--rs-text-accent)",
  };

  const tabs = [
    { id: "personal", label: "Personal", icon: User },
    { id: "banking", label: "Banking", icon: CreditCard },
    { id: "account", label: "Account", icon: Lock },
    { id: "tier", label: "Tier & Benefits", icon: Award },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentAffiliate) {
    return (
      <div className="space-y-8">
        <div className="rs-skeleton h-32" />
        <div className="rs-skeleton h-12" />
        <div className="rs-skeleton h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rs-card p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-semibold text-white"
            style={{
              background: "var(--rs-accent-soft)",
              color: tierIconColors[currentAffiliate.tier] || "var(--rs-text-accent)",
            }}
          >
            {currentAffiliate.firstName?.[0]}
            {currentAffiliate.lastName?.[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-white rs-stat">
                {currentAffiliate.firstName} {currentAffiliate.lastName}
              </h1>
              <span className="rs-pill rs-pill--violet capitalize">
                {currentAffiliate.tier} Tier
              </span>
            </div>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--rs-text-secondary)" }}
            >
              {currentAffiliate.email}
            </p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span
                className="rs-pill"
                style={{
                  background:
                    currentAffiliate.access === "active"
                      ? "rgba(16,185,129,0.10)"
                      : currentAffiliate.access === "paused"
                        ? "rgba(245,158,11,0.10)"
                        : currentAffiliate.access === "suspended"
                          ? "rgba(245,158,11,0.10)"
                          : currentAffiliate.access === "deactivated"
                            ? "rgba(239,68,68,0.10)"
                            : "rgba(245,158,11,0.10)",
                  color:
                    currentAffiliate.access === "active"
                      ? "var(--rs-success)"
                      : currentAffiliate.access === "paused"
                        ? "var(--rs-warning)"
                        : currentAffiliate.access === "suspended"
                          ? "var(--rs-warning)"
                          : currentAffiliate.access === "deactivated"
                            ? "var(--rs-danger)"
                            : "var(--rs-warning)",
                }}
              >
                {currentAffiliate.access === "active"
                  ? "Active"
                  : currentAffiliate.access === "paused"
                    ? "Paused — under review"
                    : currentAffiliate.access === "suspended"
                      ? "Suspended"
                      : currentAffiliate.access === "deactivated"
                        ? "Deactivated"
                        : "Pending setup"}
              </span>
              <span
                className="text-xs"
                style={{ color: "var(--rs-text-muted)" }}
              >
                Member since{" "}
                {new Date(currentAffiliate.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={isEditing ? "rs-btn-ghost" : "rs-btn-primary"}
          >
            {isEditing ? (
              <>Cancel</>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-1 overflow-x-auto"
        style={{ borderBottom: "1px solid var(--rs-border)" }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors"
              style={{
                color: isActive
                  ? "var(--rs-text-accent)"
                  : "var(--rs-text-secondary)",
                borderBottom: isActive
                  ? "2px solid var(--rs-accent)"
                  : "2px solid transparent",
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rs-card p-6"
      >
        {activeTab === "personal" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
                <input
                  type="text"
                  defaultValue={currentAffiliate.firstName}
                  disabled={!isEditing}
                  className="rs-input pl-9 disabled:opacity-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Last Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
                <input
                  type="text"
                  defaultValue={currentAffiliate.lastName}
                  disabled={!isEditing}
                  className="rs-input pl-9 disabled:opacity-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
                <input
                  type="email"
                  defaultValue={currentAffiliate.email}
                  disabled={!isEditing}
                  className="rs-input pl-9 disabled:opacity-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
                <input
                  type="tel"
                  defaultValue={currentAffiliate.phone || ""}
                  disabled={!isEditing}
                  className="rs-input pl-9 disabled:opacity-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
                <input
                  type="text"
                  defaultValue={currentAffiliate.city || ""}
                  disabled={!isEditing}
                  className="rs-input pl-9 disabled:opacity-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>LinkedIn URL</label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
                <input
                  type="url"
                  defaultValue={currentAffiliate.linkedinUrl || ""}
                  disabled={!isEditing}
                  className="rs-input pl-9 disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "banking" && (
          <div className="space-y-8">
            {/* Banking Info Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Payment Details
                </h3>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--rs-text-secondary)" }}
                >
                  Your bank details for commission payouts.
                </p>
              </div>
              <span
                className="rs-pill"
                style={{
                  background: currentAffiliate.bankName
                    ? "rgba(16,185,129,0.10)"
                    : "rgba(245,158,11,0.10)",
                  color: currentAffiliate.bankName
                    ? "var(--rs-success)"
                    : "var(--rs-warning)",
                }}
              >
                {currentAffiliate.bankName ? "Verified" : "Pending"}
              </span>
            </div>

            {/* Banking Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Bank Name */}
              <div className="p-5 rounded-lg transition-colors" style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="rs-icon-tile rs-icon-tile--info">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--rs-text-muted)" }}>Bank Name</p>
                    <p className="text-white font-medium">{currentAffiliate.bankName || "Not set"}</p>
                  </div>
                </div>
                {isEditing && (
                  <input
                    type="text"
                    name="bankName"
                    defaultValue={currentAffiliate.bankName || ""}
                    className="rs-input mt-3"
                    placeholder="e.g., FNB, Standard Bank"
                  />
                )}
              </div>

              {/* Account Number */}
              <div className="p-5 rounded-lg transition-colors" style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="rs-icon-tile rs-icon-tile--accent">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--rs-text-muted)" }}>Account Number</p>
                    <p className="text-white font-medium">
                      {currentAffiliate.accountNumber 
                        ? `••••${currentAffiliate.accountNumber.slice(-4)}` 
                        : "Not set"}
                    </p>
                  </div>
                </div>
                {isEditing && (
                  <input
                    type="text"
                    name="accountNumber"
                    defaultValue={currentAffiliate.accountNumber || ""}
                    className="rs-input mt-3"
                    placeholder="Your account number"
                  />
                )}
              </div>

              {/* Account Type */}
              <div className="p-5 rounded-lg transition-colors" style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="rs-icon-tile rs-icon-tile--success">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--rs-text-muted)" }}>Account Type</p>
                    <p className="text-white font-medium capitalize">{currentAffiliate.accountType || "Not set"}</p>
                  </div>
                </div>
                {isEditing && (
                  <select
                    name="accountType"
                    defaultValue={currentAffiliate.accountType || "savings"}
                    className="rs-input mt-3"
                  >
                    <option value="savings">Savings</option>
                    <option value="checking">Checking</option>
                    <option value="business">Business</option>
                  </select>
                )}
              </div>

              {/* Branch Code */}
              <div className="p-5 rounded-lg transition-colors" style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="rs-icon-tile rs-icon-tile--warning">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--rs-text-muted)" }}>Branch Code</p>
                    <p className="text-white font-medium">{(currentAffiliate as any)?.branchCode || "Not set"}</p>
                  </div>
                </div>
                {isEditing && (
                  <input
                    type="text"
                    name="branchCode"
                    defaultValue={(currentAffiliate as any)?.branchCode || ""}
                    className="rs-input mt-3"
                    placeholder="e.g., 250655"
                  />
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="rs-callout rs-callout--info">
              <div className="flex items-start gap-2.5">
                <div className="rs-icon-tile rs-icon-tile--info w-7 h-7 mt-0.5">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "var(--rs-info)" }}
                  >
                    How payouts work
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--rs-text-secondary)" }}
                  >
                    Commissions are paid monthly via EFT to your registered bank
                    account. You can request a payout once you have R500+ in
                    pending commissions. Payouts are processed within 8–10
                    business days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "account" && (
          <div className="space-y-8">
            {/* Affiliate Code - Only show after training is completed */}
            {currentAffiliate.trainingCompleted ? (
              <>
                <div
                  className="p-4 rounded-lg flex items-center justify-between"
                  style={{
                    background: "var(--rs-bg-base)",
                    border: "1px solid var(--rs-border)",
                  }}
                >
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-wider mb-1"
                      style={{ color: "var(--rs-text-muted)" }}
                    >
                      Your Affiliate Code
                    </p>
                    <p className="text-lg font-mono text-white rs-stat">
                      {currentAffiliate.affiliateCode}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(currentAffiliate.affiliateCode)}
                    className="rs-btn-primary"
                    style={{ height: 36, paddingLeft: 12, paddingRight: 12 }}
                    aria-label="Copy affiliate code"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Referral Link */}
                <div
                  className="p-4 rounded-lg flex items-center justify-between"
                  style={{
                    background: "var(--rs-bg-base)",
                    border: "1px solid var(--rs-border)",
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[10px] uppercase tracking-wider mb-1"
                      style={{ color: "var(--rs-text-muted)" }}
                    >
                      Referral Link
                    </p>
                    <p
                      className="text-sm font-mono truncate"
                      style={{ color: "var(--rs-text-accent)" }}
                    >
                      {currentAffiliate.referralLink}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(currentAffiliate.referralLink)}
                    className="rs-btn-ghost ml-2"
                    style={{ height: 36, paddingLeft: 12, paddingRight: 12 }}
                    aria-label="Copy referral link"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="rs-callout rs-callout--warning">
                Complete your training to unlock your affiliate code and referral
                link.
              </div>
            )}

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-3">
              <div
                className="p-4 rounded-lg"
                style={{
                  background: "var(--rs-bg-base)",
                  border: "1px solid var(--rs-border)",
                }}
              >
                <p
                  className="text-[10px] uppercase tracking-wider mb-1"
                  style={{ color: "var(--rs-text-muted)" }}
                >
                  Experience Level
                </p>
                <p className="text-sm font-medium text-white capitalize">
                  {currentAffiliate.experienceLevel || "Beginner"}
                </p>
              </div>
              <div
                className="p-4 rounded-lg"
                style={{
                  background: "var(--rs-bg-base)",
                  border: "1px solid var(--rs-border)",
                }}
              >
                <p
                  className="text-[10px] uppercase tracking-wider mb-1"
                  style={{ color: "var(--rs-text-muted)" }}
                >
                  Total Sales
                </p>
                <p className="text-sm font-medium text-white rs-stat">
                  R{currentAffiliate.totalSales?.toLocaleString() || 0}
                </p>
              </div>
              <div
                className="p-4 rounded-lg"
                style={{
                  background: "var(--rs-bg-base)",
                  border: "1px solid var(--rs-border)",
                }}
              >
                <p
                  className="text-[10px] uppercase tracking-wider mb-1"
                  style={{ color: "var(--rs-text-muted)" }}
                >
                  Commission Earned
                </p>
                <p
                  className="text-sm font-medium rs-stat"
                  style={{ color: "var(--rs-success)" }}
                >
                  R{currentAffiliate.totalCommissionEarned?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "tier" && (
          <div className="space-y-8">
            {/* Current Tier Card - Premium Design */}
            {(() => {
              const currentTier = tiers.find(t => t.id === currentAffiliate.tier) || tiers[0];
              const tierIndex = tiers.findIndex(t => t.id === currentAffiliate.tier);
              const nextTier = tiers[tierIndex + 1];
              const Icon = currentTier.icon;

              return (
                <div
                  className="rs-card p-6 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${currentTier.accent}, var(--rs-bg-base))`,
                  }}
                >
                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Left - Current Tier Info */}
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: currentTier.accent }}
                      >
                        <Icon className="w-6 h-6" style={{ color: currentTier.iconColor }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold rs-stat" style={{ color: currentTier.iconColor }}>
                            {currentTier.name}
                          </h3>
                          {currentAffiliate.tier === "platinum" && (
                            <span className="rs-pill rs-pill--violet">Active</span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: "var(--rs-text-secondary)" }}>
                          {currentTier.commission} commission rate
                        </p>
                      </div>
                    </div>

                    {/* Right - Progress */}
                    {nextTier && (
                      <div className="flex-1 lg:max-w-md">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs" style={{ color: "var(--rs-text-muted)" }}>
                            Progress to {nextTier.name}
                          </span>
                          <span className="text-xs font-medium text-white">
                            R{(currentAffiliate.totalSales || 0).toLocaleString()} / R{nextTier.id === "gold" ? "150,000" : "500,000"}
                          </span>
                        </div>
                        <div
                          className="h-2 rounded-full overflow-hidden"
                          style={{ background: "var(--rs-bg-overlay)" }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, ((currentAffiliate.totalSales || 0) / (nextTier.id === "gold" ? 150000 : 500000)) * 100)}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="h-full rounded-full"
                            style={{
                              background:
                                "linear-gradient(90deg, var(--rs-accent), var(--rs-text-accent))",
                            }}
                          />
                        </div>
                        <p className="text-[11px] mt-2" style={{ color: "var(--rs-text-muted)" }}>
                          R{Math.max(0, (nextTier.id === "gold" ? 150000 : 500000) - (currentAffiliate.totalSales || 0)).toLocaleString()} more to unlock {nextTier.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Tier Comparison - Premium Cards */}
            <div>
              <div className="rs-section-header-title mb-4">Commission Tiers</div>
              <div className="grid md:grid-cols-4 gap-3">
                {tiers.map((tier) => {
                  const isCurrentTier = tier.id === currentAffiliate.tier;
                  const Icon = tier.icon;
                  return (
                    <div
                      key={tier.id}
                      className="rs-card p-5 transition-all"
                      style={
                        isCurrentTier
                          ? {
                              borderColor: "var(--rs-accent)",
                              boxShadow:
                                "0 0 0 1px var(--rs-accent), 0 0 24px var(--rs-accent-glow)",
                            }
                          : undefined
                      }
                    >
                      {isCurrentTier && (
                        <div className="flex justify-end mb-2">
                          <span className="rs-pill rs-pill--violet">Current</span>
                        </div>
                      )}

                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                        style={{ background: tier.accent }}
                      >
                        <Icon className="w-5 h-5" style={{ color: tier.iconColor }} />
                      </div>

                      <h4 className="text-base font-semibold" style={{ color: tier.iconColor }}>
                        {tier.name}
                      </h4>
                      <p className="text-xl font-semibold text-white rs-stat mt-1">{tier.commission}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--rs-text-muted)" }}>
                        {tier.subscription}
                      </p>

                      <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--rs-border)" }}>
                        <p
                          className="text-[10px] uppercase tracking-wider mb-2"
                          style={{ color: "var(--rs-text-muted)" }}
                        >
                          Benefits
                        </p>
                        <div className="space-y-2">
                          {tier.features.slice(0, 4).map((feature) => (
                            <div key={feature.name} className="flex items-center gap-2">
                              {feature.included ? (
                                <CheckCircle
                                  className="w-3.5 h-3.5 flex-shrink-0"
                                  style={{ color: "var(--rs-success)" }}
                                />
                              ) : (
                                <X
                                  className="w-3.5 h-3.5 flex-shrink-0"
                                  style={{ color: "var(--rs-text-muted)" }}
                                />
                              )}
                              <span
                                className="text-xs"
                                style={{
                                  color: feature.included
                                    ? "var(--rs-text-primary)"
                                    : "var(--rs-text-muted)",
                                }}
                              >
                                {feature.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upgrade CTA */}
            {currentAffiliate.tier !== "platinum" && (
              <div
                className="rs-card p-6 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, var(--rs-accent-soft), var(--rs-bg-base))",
                  border: "1px solid var(--rs-accent)",
                }}
              >
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4" style={{ color: "var(--rs-text-accent)" }} />
                      Go Platinum
                    </h3>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--rs-text-secondary)" }}
                    >
                      Unlock higher commissions, exclusive leads & priority support.
                    </p>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--rs-text-secondary)" }}>
                        <CheckCircle className="w-3.5 h-3.5" style={{ color: "var(--rs-success)" }} />
                        12-15% Commission
                      </div>
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--rs-text-secondary)" }}>
                        <CheckCircle className="w-3.5 h-3.5" style={{ color: "var(--rs-success)" }} />
                        Exclusive Leads
                      </div>
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--rs-text-secondary)" }}>
                        <CheckCircle className="w-3.5 h-3.5" style={{ color: "var(--rs-success)" }} />
                        Priority Support
                      </div>
                    </div>
                  </div>
                  <button className="rs-btn-primary">
                    Upgrade — R899.69/mo
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {isEditing && (
          <div className="flex justify-end mt-6 pt-4" style={{ borderTop: "1px solid var(--rs-border)" }}>
            <button className="rs-btn-primary">
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
