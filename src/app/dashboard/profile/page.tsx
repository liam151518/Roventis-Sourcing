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
    color: "from-orange-700 to-orange-900",
    accentColor: "text-orange-400",
    borderAccent: "border-orange-500/20",
    iconColor: "text-orange-400",
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
    color: "from-gray-400 to-gray-600",
    accentColor: "text-gray-300",
    borderAccent: "border-white/10",
    iconColor: "text-[var(--rs-text-secondary)]",
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
    color: "from-yellow-500 to-amber-600",
    accentColor: "text-yellow-400",
    borderAccent: "border-amber-400/30",
    iconColor: "text-amber-300",
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
    color: "from-violet-600 to-purple-800",
    accentColor: "text-violet-400",
    borderAccent: "border-violet-500/30",
    iconColor: "text-violet-300",
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

  const tierColors: Record<string, string> = {
    bronze: "border-orange-500/20",
    silver: "border-white/10",
    gold: "border-amber-400/30",
    platinum: "border-violet-500/30",
  };

  const tierIconColors: Record<string, string> = {
    bronze: "text-orange-400",
    silver: "text-[var(--rs-text-secondary)]",
    gold: "text-amber-300",
    platinum: "text-violet-300",
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
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rs-card p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className={`w-24 h-24 bg-[var(--rs-accent-soft)] ${tierIconColors[currentAffiliate.tier] || "text-violet-400"} rounded-[14px] flex items-center justify-center text-3xl font-bold text-white shadow-lg`}>
            {currentAffiliate.firstName?.[0]}{currentAffiliate.lastName?.[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-white">
                {currentAffiliate.firstName} {currentAffiliate.lastName}
              </h1>
              <span className={`px-3 py-1 bg-[var(--rs-accent-soft)] text-violet-400 border border-[var(--rs-accent)]/20 text-xs font-medium rounded-full capitalize`}>
                {currentAffiliate.tier} Tier
              </span>
            </div>
            <p className="text-gray-500 mt-1">{currentAffiliate.email}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentAffiliate.access === "active" ? "bg-[var(--rs-success)]/10 text-[var(--rs-success)]" :
                currentAffiliate.access === "paused" ? "bg-amber-500/10 text-amber-400" :
                currentAffiliate.access === "suspended" ? "bg-[var(--rs-warning)]/10 text-[var(--rs-warning)]" :
                currentAffiliate.access === "deactivated" ? "bg-[var(--rs-danger)]/10 text-[var(--rs-danger)]" :
                "bg-[var(--rs-warning)]/10 text-[var(--rs-warning)]"
              }`}>
                {currentAffiliate.access === "active" ? "Active" :
                 currentAffiliate.access === "paused" ? "Paused - your account is under review" :
                 currentAffiliate.access === "suspended" ? "Suspended - contact support" :
                 currentAffiliate.access === "deactivated" ? "Deactivated" :
                 "Pending setup"}
              </span>
              <span className="text-sm text-gray-500">
                Member since {new Date(currentAffiliate.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-[14px] font-medium transition-colors ${
              isEditing 
                ? "bg-[var(--rs-danger)]/10 text-[var(--rs-danger)] hover:bg-[var(--rs-danger)]/20" 
                : "rs-btn-primary"
            }`}
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 border-b border-white/5 overflow-x-auto"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? "border-blue-500 text-blue-400" 
                  : "border-transparent text-gray-500 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
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
              <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  defaultValue={currentAffiliate.firstName}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-[14px] text-white placeholder-gray-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  defaultValue={currentAffiliate.lastName}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-[14px] text-white placeholder-gray-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  defaultValue={currentAffiliate.email}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-[14px] text-white placeholder-gray-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="tel"
                  defaultValue={currentAffiliate.phone || ""}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-[14px] text-white placeholder-gray-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">City</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  defaultValue={currentAffiliate.city || ""}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-[14px] text-white placeholder-gray-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">LinkedIn URL</label>
              <div className="relative">
                <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="url"
                  defaultValue={currentAffiliate.linkedinUrl || ""}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-[14px] text-white placeholder-gray-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "banking" && (
          <div className="space-y-6">
            {/* Banking Info Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">Payment Details</h3>
                <p className="text-gray-500 mt-1">Your bank details for commission payouts</p>
              </div>
              <div className={`px-4 py-2 rounded-[14px] text-sm font-medium ${
                currentAffiliate.bankName 
                  ? "bg-[var(--rs-success)]/10 text-[var(--rs-success)]" 
                  : "bg-[var(--rs-warning)]/10 text-[var(--rs-warning)]"
              }`}>
                {currentAffiliate.bankName ? "Verified" : "Pending"}
              </div>
            </div>

            {/* Banking Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Bank Name */}
              <div className="bg-[#0a0a0b] rounded-[14px] p-6 border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-[14px] flex items-center justify-center">
                    <Building className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bank Name</p>
                    <p className="text-white font-medium">{currentAffiliate.bankName || "Not set"}</p>
                  </div>
                </div>
                {isEditing && (
                  <input
                    type="text"
                    name="bankName"
                    defaultValue={currentAffiliate.bankName || ""}
                    className="w-full mt-3 px-4 py-2.5 bg-[#141417] border border-white/10 rounded-[14px] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="e.g., FNB, Standard Bank"
                  />
                )}
              </div>

              {/* Account Number */}
              <div className="bg-[#0a0a0b] rounded-[14px] p-6 border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-[14px] flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account Number</p>
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
                    className="w-full mt-3 px-4 py-2.5 bg-[#141417] border border-white/10 rounded-[14px] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Your account number"
                  />
                )}
              </div>

              {/* Account Type */}
              <div className="bg-[#0a0a0b] rounded-[14px] p-6 border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-[14px] flex items-center justify-center">
                    <Lock className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account Type</p>
                    <p className="text-white font-medium capitalize">{currentAffiliate.accountType || "Not set"}</p>
                  </div>
                </div>
                {isEditing && (
                  <select
                    name="accountType"
                    defaultValue={currentAffiliate.accountType || "savings"}
                    className="w-full mt-3 px-4 py-2.5 bg-[#141417] border border-white/10 rounded-[14px] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="savings">Savings</option>
                    <option value="checking">Checking</option>
                    <option value="business">Business</option>
                  </select>
                )}
              </div>

              {/* Branch Code */}
              <div className="bg-[#0a0a0b] rounded-[14px] p-6 border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-[14px] flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Branch Code</p>
                    <p className="text-white font-medium">{(currentAffiliate as any)?.branchCode || "Not set"}</p>
                  </div>
                </div>
                {isEditing && (
                  <input
                    type="text"
                    name="branchCode"
                    defaultValue={(currentAffiliate as any)?.branchCode || ""}
                    className="w-full mt-3 px-4 py-2.5 bg-[#141417] border border-white/10 rounded-[14px] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    placeholder="e.g., 250655"
                  />
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-[14px] p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ChevronRight className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-blue-400 text-sm font-medium">How payouts work</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Commissions are paid monthly via EFT to your registered bank account. 
                    You can request a payout once you have R500+ in pending commissions. 
                    Payouts are processed within 8-10 business days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "account" && (
          <div className="space-y-6">
            {/* Affiliate Code - Only show after training is completed */}
            {currentAffiliate.trainingCompleted ? (
              <>
                <div className="bg-[#0a0a0b] rounded-[14px] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Your Affiliate Code</p>
                      <p className="text-xl font-mono text-white">{currentAffiliate.affiliateCode}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(currentAffiliate.affiliateCode)}
                      className="p-3 rs-btn-primary rounded-lg transition-colors"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Referral Link */}
                <div className="bg-[#0a0a0b] rounded-[14px] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Referral Link</p>
                      <p className="text-sm font-mono text-blue-400 truncate">{currentAffiliate.referralLink}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(currentAffiliate.referralLink)}
                      className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-[14px] p-4">
                <p className="text-amber-400 text-sm">
                  Complete your training to unlock your affiliate code and referral link.
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-[#0a0a0b] rounded-[14px] p-4">
                <p className="text-sm text-gray-400 mb-1">Experience Level</p>
                <p className="text-white font-medium capitalize">{currentAffiliate.experienceLevel || "Beginner"}</p>
              </div>
              <div className="bg-[#0a0a0b] rounded-[14px] p-4">
                <p className="text-sm text-gray-400 mb-1">Total Sales</p>
                <p className="text-white font-medium">R{currentAffiliate.totalSales?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-[#0a0a0b] rounded-[14px] p-4">
                <p className="text-sm text-gray-400 mb-1">Commission Earned</p>
                <p className="text-emerald-400 font-medium">R{currentAffiliate.totalCommissionEarned?.toLocaleString() || 0}</p>
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
                <div className="relative overflow-hidden bg-[#0a0a0b] rounded-3xl border border-white/10 p-8">
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                  
                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                    {/* Left - Current Tier Info */}
                    <div className="flex items-center gap-6">
                      <div className={`w-20 h-20 rounded-[14px] bg-gradient-to-br ${currentTier.color} flex items-center justify-center shadow-lg shadow-black/20`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className={`text-3xl font-bold ${currentTier.accentColor}`}>{currentTier.name}</h3>
                          {currentAffiliate.tier === "platinum" && (
                            <span className="px-3 py-1 bg-violet-500/20 text-violet-400 text-sm font-medium rounded-full">Active</span>
                          )}
                        </div>
                        <p className="text-gray-400 mt-1">{currentTier.commission} commission rate</p>
                      </div>
                    </div>

                    {/* Right - Progress */}
                    {nextTier && (
                      <div className="flex-1 lg:max-w-md">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-500">Progress to {nextTier.name}</span>
                          <span className="text-sm font-medium text-white">
                            R{(currentAffiliate.totalSales || 0).toLocaleString()} / R{nextTier.id === "gold" ? "150,000" : "500,000"}
                          </span>
                        </div>
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, ((currentAffiliate.totalSales || 0) / (nextTier.id === "gold" ? 150000 : 500000)) * 100)}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full" 
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
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
              <h3 className="text-xl font-semibold text-white mb-6">Commission Tiers</h3>
              <div className="grid md:grid-cols-4 gap-4">
                {tiers.map((tier) => {
                  const isCurrentTier = tier.id === currentAffiliate.tier;
                  const Icon = tier.icon;
                  return (
                    <div 
                      key={tier.id}
                      className={`relative overflow-hidden bg-[#0a0a0b] rounded-[14px] p-6 border transition-all duration-300 hover:scale-[1.02] ${
                        isCurrentTier 
                          ? "border-white/30 shadow-lg shadow-black/20" 
                          : "border-white/5 hover:border-white/10"
                      }`}
                    >
                      {isCurrentTier && (
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 bg-[var(--rs-accent-soft)] text-violet-400 text-xs font-medium rounded-full">Current</span>
                        </div>
                      )}
                      
                      <div className={`w-12 h-12 rounded-[14px] bg-[var(--rs-accent-soft)] flex items-center justify-center mb-4 shadow-lg ${tier.iconColor}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <h4 className={`text-lg font-bold ${tier.accentColor}`}>{tier.name}</h4>
                      <p className="text-3xl font-bold text-white mt-2">{tier.commission}</p>
                      <p className="text-sm text-gray-500 mt-1">{tier.subscription}</p>
                      
                      <div className="mt-6 pt-6 border-t border-white/5">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Benefits</p>
                        <div className="space-y-2">
                          {tier.features.slice(0, 4).map((feature) => (
                            <div key={feature.name} className="flex items-center gap-2">
                              {feature.included ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              ) : (
                                <X className="w-4 h-4 text-gray-700 flex-shrink-0" />
                              )}
                              <span className={`text-sm ${feature.included ? "text-gray-300" : "text-gray-600"}`}>
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
              <div className="relative overflow-hidden bg-gradient-to-r from-violet-900/40 via-purple-900/30 to-violet-900/40 rounded-3xl p-8 border border-violet-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Zap className="w-6 h-6 text-violet-400" />
                      Go Platinum
                    </h3>
                    <p className="text-gray-400 mt-2 text-lg">Unlock higher commissions, exclusive leads & priority support</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>12-15% Commission</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>Exclusive Leads</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>Priority Support</span>
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-[14px] hover:from-violet-700 hover:to-purple-700 transition-all hover:scale-105 shadow-lg shadow-violet-500/25">
                    Upgrade - R899.69/mo
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {isEditing && (
          <div className="flex justify-end mt-8 pt-6 border-t border-white/5">
            <button className="flex items-center gap-2 px-6 py-3 rs-btn-primary font-medium transition-colors">
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
