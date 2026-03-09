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
import { useDemoData } from "@/lib/demo-data";
import { formatCurrency } from "@/lib/utils";

export default function ProfilePage() {
  const { affiliates } = useDemoData();
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  
  // Using first affiliate as demo user
  const currentUser = affiliates[0];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Profile Settings</h1>
          <p className="text-gray-500">Manage your account information</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {currentUser.firstName[0]}{currentUser.lastName[0]}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-primary">
              {currentUser.firstName} {currentUser.lastName}
            </h2>
            <p className="text-gray-500">{currentUser.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-3">
              <span className={`px-3 py-1 rounded-full text-white text-sm font-medium capitalize ${tierColors[currentUser.tier]}`}>
                {currentUser.tier} Tier
              </span>
              <span className="text-sm text-gray-500">
                Code: <code className="bg-gray-100 px-2 py-0.5 rounded">{currentUser.affiliateCode}</code>
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-400 transition-colors">
              <Share2 className="w-4 h-4" />
              Copy Referral Link
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Total Sales</div>
          <div className="text-2xl font-bold text-primary">{formatCurrency(currentUser.totalSales)}</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Commission Earned</div>
          <div className="text-2xl font-bold text-primary">{formatCurrency(currentUser.totalCommissionEarned)}</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Commission Paid</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(currentUser.totalCommissionPaid)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-amber-600 border-b-2 border-amber-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === "personal" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    defaultValue={currentUser.firstName}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    defaultValue={currentUser.lastName}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  defaultValue={currentUser.email}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    defaultValue={currentUser.phone || ""}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    defaultValue={currentUser.city || ""}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
                <input
                  type="url"
                  defaultValue={currentUser.linkedinUrl || ""}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </motion.div>
          )}

          {activeTab === "banking" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  Banking details are used for commission payouts. Updates require admin approval.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  defaultValue={currentUser.bankName || ""}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                  <input
                    type="text"
                    defaultValue={currentUser.accountNumber || ""}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                  <select
                    defaultValue={currentUser.accountType || ""}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select account type</option>
                    <option value="personal">Personal</option>
                    <option value="business">Business</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "account" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">Change Password</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-light">
                    Update Password
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <div className="mt-8 pt-6 border-t flex justify-end">
            <button className="flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-400 transition-colors">
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
