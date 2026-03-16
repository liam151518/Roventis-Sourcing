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
  X
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

const tiers = [
  {
    id: "bronze",
    name: "Bronze",
    color: "from-orange-700 to-orange-900",
    accentColor: "text-orange-400",
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
    borderColor: "border-gray-400/30",
    icon: Star,
    commission: "10%",
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
    borderColor: "border-yellow-500/30",
    icon: TrendingUp,
    commission: "15%",
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
    borderColor: "border-violet-500/30",
    icon: Crown,
    commission: "15-25%",
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
      { name: "25% solar commission", included: true },
    ],
  },
];

export default function ProfilePage() {
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate);
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const tierColors: Record<string, string> = {
    bronze: "from-amber-700 to-amber-900",
    silver: "from-gray-400 to-gray-600",
    gold: "from-yellow-500 to-amber-600",
    platinum: "from-violet-600 to-purple-800",
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
        className="bg-[#141417] rounded-2xl border border-white/5 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className={`w-24 h-24 bg-gradient-to-br ${tierColors[currentAffiliate.tier] || "from-gray-500 to-gray-600"} rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg`}>
            {currentAffiliate.firstName?.[0]}{currentAffiliate.lastName?.[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-white">
                {currentAffiliate.firstName} {currentAffiliate.lastName}
              </h1>
              <span className={`px-3 py-1 bg-gradient-to-r ${tierColors[currentAffiliate.tier]} text-white text-xs font-medium rounded-full capitalize`}>
                {currentAffiliate.tier} Tier
              </span>
            </div>
            <p className="text-gray-500 mt-1">{currentAffiliate.email}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                currentAffiliate.status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                currentAffiliate.status === "pending" ? "bg-amber-500/10 text-amber-400" :
                "bg-red-500/10 text-red-400"
              }`}>
                {currentAffiliate.status}
              </span>
              <span className="text-sm text-gray-500">
                Member since {new Date(currentAffiliate.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${
              isEditing 
                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" 
                : "bg-blue-600 hover:bg-blue-500 text-white"
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
        className="bg-[#141417] rounded-2xl border border-white/5 p-6"
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
                  className="w-full pl-12 pr-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                  className="w-full pl-12 pr-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                  className="w-full pl-12 pr-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                  className="w-full pl-12 pr-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                  className="w-full pl-12 pr-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                  className="w-full pl-12 pr-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "banking" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Bank Name</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  defaultValue={currentAffiliate.bankName || ""}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Account Number</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  defaultValue={currentAffiliate.accountNumber || ""}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Account Type</label>
              <select
                defaultValue={currentAffiliate.accountType || "savings"}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="savings">Savings</option>
                <option value="checking">Checking</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Branch Code</label>
              <input
                type="text"
                defaultValue={currentAffiliate.branchCode || ""}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
        )}

        {activeTab === "account" && (
          <div className="space-y-6">
            {/* Affiliate Code */}
            <div className="bg-[#0a0a0b] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Your Affiliate Code</p>
                  <p className="text-xl font-mono text-white">{currentAffiliate.affiliateCode}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(currentAffiliate.affiliateCode)}
                  className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Referral Link */}
            <div className="bg-[#0a0a0b] rounded-xl p-4">
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

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-[#0a0a0b] rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">Experience Level</p>
                <p className="text-white font-medium capitalize">{currentAffiliate.experienceLevel || "Beginner"}</p>
              </div>
              <div className="bg-[#0a0a0b] rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">Total Sales</p>
                <p className="text-white font-medium">R{currentAffiliate.totalSales?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-[#0a0a0b] rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">Commission Earned</p>
                <p className="text-emerald-400 font-medium">R{currentAffiliate.totalCommissionEarned?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "tier" && (
          <div className="space-y-6">
            {/* Current Tier Card */}
            {(() => {
              const currentTier = tiers.find(t => t.id === currentAffiliate.tier) || tiers[0];
              const tierIndex = tiers.findIndex(t => t.id === currentAffiliate.tier);
              const nextTier = tiers[tierIndex + 1];
              const Icon = currentTier.icon;
              
              return (
                <div className="relative overflow-hidden bg-gradient-to-br from-[#0a0a0b] to-[#141417] rounded-2xl p-6 border border-white/10">
                  <div className={`absolute inset-0 bg-gradient-to-br ${currentTier.color} opacity-10`} />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentTier.color} flex items-center justify-center`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-2xl font-bold ${currentTier.accentColor}`}>{currentTier.name} Tier</h3>
                            {currentAffiliate.tier === "platinum" && <Crown className="w-5 h-5 text-violet-400" />}
                          </div>
                          <p className="text-gray-400">{currentTier.commission} commission rate</p>
                        </div>
                      </div>
                      {nextTier && (
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Next tier</p>
                          <p className="text-white font-medium">{nextTier.name}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Progress to next tier */}
                    {nextTier && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-400">Progress to {nextTier.name}</span>
                          <span className="text-white font-medium">
                            R{currentAffiliate.totalSales?.toLocaleString() || 0} / R{nextTier.id === "gold" ? "150,000" : "500,000"}
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (currentAffiliate.totalSales || 0) / (nextTier.id === "gold" ? 150000 : 500000) * 100)}%` }}
                            className={`h-full bg-gradient-to-r ${nextTier.color}`} 
                          />
                        </div>
                        {nextTier.id === "gold" && (
                          <p className="text-xs text-gray-500 mt-2">R{Math.max(0, 150000 - (currentAffiliate.totalSales || 0)).toLocaleString()} more to unlock Gold tier</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Tier Comparison */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Tier Benefits</h3>
              <div className="grid md:grid-cols-4 gap-4">
                {tiers.map((tier) => {
                  const isCurrentTier = tier.id === currentAffiliate.tier;
                  const Icon = tier.icon;
                  return (
                    <div 
                      key={tier.id}
                      className={`relative overflow-hidden bg-[#0a0a0b] rounded-xl p-4 border ${isCurrentTier ? `border-white/20 ${tier.borderColor}` : "border-white/5"}`}
                    >
                      {isCurrentTier && (
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">Current</span>
                        </div>
                      )}
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tier.color} flex items-center justify-center mb-3`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h4 className={`font-semibold ${tier.accentColor}`}>{tier.name}</h4>
                      <p className="text-2xl font-bold text-white mt-1">{tier.commission}</p>
                      <p className="text-xs text-gray-500 mt-1">{tier.subscription}</p>
                      
                      <div className="mt-4 space-y-2">
                        {tier.features.slice(0, 4).map((feature) => (
                          <div key={feature.name} className="flex items-center gap-2">
                            {feature.included ? (
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <X className="w-3 h-3 text-gray-600" />
                            )}
                            <span className={`text-xs ${feature.included ? "text-gray-300" : "text-gray-600"}`}>
                              {feature.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upgrade CTA for non-Platinum */}
            {currentAffiliate.tier !== "platinum" && (
              <div className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 rounded-2xl p-6 border border-violet-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">Go Platinum</h3>
                    <p className="text-gray-400 mt-1">Unlock 25% commission on solar + exclusive leads</p>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all">
                    <Zap className="w-5 h-5" />
                    Upgrade - R899.69/mo
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {isEditing && (
          <div className="flex justify-end mt-8 pt-6 border-t border-white/5">
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors">
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
