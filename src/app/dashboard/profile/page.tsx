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
  Share2
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatCurrency } from "@/lib/utils";

export default function ProfilePage() {
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate);
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);

  const tierColors: Record<string, string> = {
    bronze: "bg-amber-700",
    silver: "bg-gray-500",
    gold: "bg-yellow-500",
    platinum: "bg-indigo-600",
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "banking", label: "Banking", icon: CreditCard },
    { id: "account", label: "Account", icon: Lock },
  ];

  if (!currentAffiliate) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-gray-400">Manage your affiliate profile</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white">
            {currentAffiliate.firstName?.[0]}{currentAffiliate.lastName?.[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-white">
                {currentAffiliate.firstName} {currentAffiliate.lastName}
              </h2>
              <span className={`text-xs px-3 py-1 rounded capitalize text-white ${tierColors[currentAffiliate.tier] || "bg-gray-600"}`}>
                {currentAffiliate.tier} Tier
              </span>
            </div>
            <p className="text-gray-400">{currentAffiliate.email}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded capitalize">
                {currentAffiliate.status}
              </span>
              <span className="text-sm text-gray-500">
                Code: <span className="font-mono text-gray-300">{currentAffiliate.affiliateCode}</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id ? "text-blue-400" : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        {activeTab === "personal" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-white mb-4">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">First Name</label>
                <input
                  type="text"
                  defaultValue={currentAffiliate.firstName}
                  disabled={!isEditing}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                <input
                  type="text"
                  defaultValue={currentAffiliate.lastName}
                  disabled={!isEditing}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  defaultValue={currentAffiliate.email}
                  disabled={!isEditing}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone</label>
                <input
                  type="tel"
                  defaultValue={currentAffiliate.phone || ""}
                  disabled={!isEditing}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">City</label>
                <input
                  type="text"
                  defaultValue={currentAffiliate.city || ""}
                  disabled={!isEditing}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  defaultValue={currentAffiliate.linkedinUrl || ""}
                  disabled={!isEditing}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "banking" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-white mb-4">Banking Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Bank Name</label>
                <input
                  type="text"
                  defaultValue={currentAffiliate.bankName || ""}
                  disabled={!isEditing}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Account Number</label>
                <input
                  type="text"
                  defaultValue={currentAffiliate.accountNumber || ""}
                  disabled={!isEditing}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Account Type</label>
                <select
                  defaultValue={currentAffiliate.accountType || "savings"}
                  disabled={!isEditing}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white disabled:opacity-50"
                >
                  <option value="savings">Savings</option>
                  <option value="checking">Checking</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Branch Code</label>
                <input
                  type="text"
                  defaultValue={currentAffiliate.branchCode || ""}
                  disabled={!isEditing}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "account" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-white mb-4">Account Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">Affiliate Code</p>
                  <p className="text-sm text-gray-400">Share this code to earn commissions</p>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-black/30 px-3 py-1 rounded text-blue-400 font-mono">
                    {currentAffiliate.affiliateCode}
                  </code>
                  <button className="p-2 text-gray-400 hover:text-white">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">Experience Level</p>
                  <p className="text-sm text-gray-400">Your current experience level</p>
                </div>
                <span className="text-white capitalize">{currentAffiliate.experienceLevel || "beginner"}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">Commission Tier</p>
                  <p className="text-sm text-gray-400">Your current commission tier</p>
                </div>
                <span className={`text-white capitalize px-3 py-1 rounded ${tierColors[currentAffiliate.tier] || "bg-gray-600"}`}>
                  {currentAffiliate.tier}
                </span>
              </div>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="mt-6 flex justify-end">
            <button className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
