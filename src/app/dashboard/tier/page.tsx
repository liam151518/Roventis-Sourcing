"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Award, 
  Zap, 
  Crown, 
  Star, 
  TrendingUp, 
  Check, 
  X,
  Lock,
  Unlock,
  DollarSign,
  Users,
  Gift,
  FileText,
  Target,
  Briefcase,
  ArrowRight
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { formatCurrency } from "@/lib/utils";

const tiers = [
  {
    id: "bronze",
    name: "Bronze",
    borderAccent: "border-orange-500/20",
    iconColor: "text-orange-400",
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
    borderAccent: "border-white/10",
    iconColor: "text-[var(--rs-text-secondary)]",
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
    borderAccent: "border-amber-400/30",
    iconColor: "text-amber-300",
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
    borderAccent: "border-violet-500/30",
    iconColor: "text-violet-300",
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

export default function TierPage() {
  const { userId } = useAuth();
  const currentAffiliate = useQuery(
    api.affiliates.getCurrentAffiliate,
    { clerkUserId: userId || undefined }
  );
  const deals = useQuery(api.deals.getAllDeals);
  
  // Loading state
  if (currentAffiliate === null || deals === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const userDeals = (deals || []).filter(d => d.affiliateId === currentAffiliate?._id);
  const closedWonValue = userDeals
    .filter(d => d.status === "closed_won")
    .reduce((sum, d) => sum + d.dealValue, 0);

  const currentTierIndex = tiers.findIndex(t => t.id === currentAffiliate?.tier);
  const nextTier = tiers[currentTierIndex + 1];
  const currentTier = tiers[currentTierIndex];

  const getProgress = () => {
    if (currentAffiliate?.tier === "bronze") {
      // First sale to unlock Silver
      return { current: closedWonValue, target: 1, percent: closedWonValue > 0 ? 100 : 0 };
    }
    if (currentAffiliate?.tier === "silver") {
      // R150k to unlock Gold
      return { current: closedWonValue, target: 150000, percent: Math.min((closedWonValue / 150000) * 100, 100) };
    }
    if (currentAffiliate?.tier === "gold") {
      // Needs to upgrade to Platinum
      return { current: 0, target: 1, percent: 0 };
    }
    return { current: 0, target: 1, percent: 100 };
  };

  const progress = getProgress();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <span className="rs-overline">Your Account</span>
        <h1 className="rs-page-title">Tier & Upgrade</h1>
        <p className="text-gray-400">View your current tier and unlock premium benefits</p>
      </div>

      {/* Current Tier Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rs-card !border-[var(--rs-accent-soft)] rounded-3xl p-8 relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
              {currentAffiliate?.tier === "platinum" ? (
                <Crown className="w-10 h-10 text-white" />
              ) : currentAffiliate?.tier === "gold" ? (
                <TrendingUp className="w-10 h-10 text-white" />
              ) : currentAffiliate?.tier === "silver" ? (
                <Star className="w-10 h-10 text-white" />
              ) : (
                <Award className="w-10 h-10 text-white" />
              )}
            </div>
            <div>
              <p className="text-gray-400 text-sm">Current Tier</p>
              <h2 className={`text-3xl font-bold ${currentTier?.iconColor}`}>{currentTier?.name}</h2>
              <p className="text-gray-400">{currentTier?.commission} commission rate</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="text-gray-400 text-sm">Total Sales</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(closedWonValue)}</p>
            </div>
            <div className="px-4 py-1.5 bg-white/5 rounded-full">
              <span className="text-gray-400 text-sm">Next: </span>
              <span className="text-white font-medium">{nextTier?.name || "Max Tier"}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progress to Next Tier */}
      {currentAffiliate?.tier !== "platinum" && nextTier && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#111113] rounded-2xl p-6 border border-white/5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Progress to {nextTier.name}</h3>
              <p className="text-gray-400 text-sm">
                {currentAffiliate?.tier === "bronze" 
                  ? "Make your first sale to unlock Silver tier"
                  : `Reach R150,000 in sales to unlock Gold tier`
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{Math.round(progress.percent)}%</p>
              <p className="text-gray-400 text-sm">
                {formatCurrency(progress.current)} / {formatCurrency(progress.target)}
              </p>
            </div>
          </div>
          
          <div className="h-3 bg-[var(--rs-bg-overlay)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full"
            />
          </div>

          {currentAffiliate?.tier === "gold" && (
            <div className="mt-4 p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
              <p className="text-violet-400 text-sm">
                Upgrade to Platinum for R899.69/month to unlock 12-15% commission and exclusive lead access.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Tier Comparison */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Compare Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier, index) => {
            const isCurrentTier = tier.id === currentAffiliate?.tier;
            const Icon = tier.icon;
            
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rs-card p-5 ${
                  isCurrentTier ? '!border-[var(--rs-accent)] shadow-[0_0_0_1px_var(--rs-accent),0_0_24px_var(--rs-accent-glow)]' : tier.borderAccent
                } relative overflow-hidden`}
              >
                {isCurrentTier && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-[var(--rs-accent-soft)] text-[var(--rs-accent)] text-xs font-medium rounded-full">
                      Current
                    </span>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-[var(--rs-accent-soft)] flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${tier.iconColor}`} />
                </div>

                <h3 className={`text-xl font-bold ${tier.iconColor} mb-1`}>{tier.name}</h3>
                
                <div className="mb-4">
                  <p className="rs-stat text-2xl font-bold text-white">{tier.commission}</p>
                  <p className="text-gray-400 text-sm">commission</p>
                </div>

                <div className="mb-4 p-3 bg-white/5 rounded-xl">
                  <p className="text-gray-400 text-xs">Subscription</p>
                  <p className="text-white font-semibold">{tier.subscription}</p>
                </div>

                <div className="space-y-2">
                  {tier.features.slice(0, 5).map((feature) => (
                    <div key={feature.name} className="flex items-center gap-2">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included ? "text-gray-300" : "text-gray-600"}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                {tier.id === "platinum" && currentAffiliate?.tier !== "platinum" && (
                  <button className="w-full mt-4 py-3 rs-btn-primary">
                    <Zap className="w-4 h-4" />
                    Upgrade Now
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Requirements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#111113] rounded-2xl p-6 border border-white/5"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Tier Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier) => (
            <div key={tier.id} className="p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg bg-[var(--rs-accent-soft)] flex items-center justify-center`} style={{ color: tier.iconColor }}>
                  <tier.icon className={`w-4 h-4 ${tier.iconColor}`} />
                </div>
                <span className={`font-semibold ${tier.iconColor}`}>{tier.name}</span>
              </div>
              <p className="text-gray-400 text-sm">{tier.requirements[0]}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Platinum CTA */}
      {currentAffiliate?.tier !== "platinum" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-violet-900/30 to-purple-900/30 rounded-3xl p-8 border border-violet-500/20"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Go Platinum</h3>
                <p className="text-gray-400">Unlock the full potential of your affiliate business</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-3xl font-bold text-white mb-1">R899.69<span className="text-lg font-normal text-gray-400">/month</span></p>
              <ul className="text-gray-400 text-sm mb-4 space-y-1">
                <li>+ 12-15% commission</li>
                <li>+ Exclusive lead pool</li>
                <li>+ Priority support</li>
              </ul>
              <button className="rs-btn-primary flex items-center gap-2 mx-auto md:mx-0">
                <Zap className="w-5 h-5" />
                Upgrade to Platinum
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
