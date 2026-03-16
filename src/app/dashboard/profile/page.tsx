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
  Edit3
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ProfilePage() {
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate);
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const tierColors: Record<string, string> = {
    bronze: "from-amber-600 to-amber-700",
    silver: "from-gray-400 to-gray-500",
    gold: "from-yellow-400 to-amber-500",
    platinum: "from-indigo-500 to-purple-600",
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "banking", label: "Banking", icon: CreditCard },
    { id: "account", label: "Account", icon: Lock },
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
