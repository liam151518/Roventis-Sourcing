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
  Target,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { formatCurrency } from "@/lib/utils";

const tiers = [
  {
    id: "bronze",
    name: "Bronze",
    accent: "rgba(245,158,11,0.10)",
    iconColor: "#fbbf24",
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
    iconColor: "#cbd5e1",
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
    accent: "rgba(252,211,77,0.12)",
    iconColor: "#fcd34d",
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
    accent: "var(--rs-accent-soft)",
    iconColor: "var(--rs-text-accent)",
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

  if (currentAffiliate === null || deals === null) {
    return (
      <div className="space-y-6">
        <div className="rs-skeleton h-8 w-64" />
        <div className="rs-skeleton h-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rs-skeleton h-72" />
          <div className="rs-skeleton h-72" />
          <div className="rs-skeleton h-72" />
          <div className="rs-skeleton h-72" />
        </div>
      </div>
    );
  }

  const userDeals = (deals || []).filter(
    (d) => d.affiliateId === currentAffiliate?._id
  );
  const closedWonValue = userDeals
    .filter((d) => d.status === "closed_won")
    .reduce((sum, d) => sum + d.dealValue, 0);

  const currentTierIndex = tiers.findIndex(
    (t) => t.id === currentAffiliate?.tier
  );
  const nextTier = tiers[currentTierIndex + 1];
  const currentTier = tiers[currentTierIndex];

  const getProgress = () => {
    if (currentAffiliate?.tier === "bronze") {
      return {
        current: closedWonValue,
        target: 1,
        percent: closedWonValue > 0 ? 100 : 0,
      };
    }
    if (currentAffiliate?.tier === "silver") {
      return {
        current: closedWonValue,
        target: 150000,
        percent: Math.min((closedWonValue / 150000) * 100, 100),
      };
    }
    if (currentAffiliate?.tier === "gold") {
      return { current: 0, target: 1, percent: 0 };
    }
    return { current: 0, target: 1, percent: 100 };
  };

  const progress = getProgress();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="rs-overline">Your Account</span>
        <h1 className="rs-page-title text-2xl md:text-[28px] mt-1">
          Tier & Upgrade
        </h1>
        <p className="rs-page-subtitle">
          View your current tier and unlock premium benefits.
        </p>
      </div>

      {/* Current Tier Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rs-card p-8 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${currentTier?.accent}, var(--rs-bg-base))`,
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: currentTier?.accent }}
            >
              {currentAffiliate?.tier === "platinum" ? (
                <Crown
                  className="w-7 h-7"
                  style={{ color: currentTier?.iconColor }}
                />
              ) : currentAffiliate?.tier === "gold" ? (
                <TrendingUp
                  className="w-7 h-7"
                  style={{ color: currentTier?.iconColor }}
                />
              ) : currentAffiliate?.tier === "silver" ? (
                <Star
                  className="w-7 h-7"
                  style={{ color: currentTier?.iconColor }}
                />
              ) : (
                <Award
                  className="w-7 h-7"
                  style={{ color: currentTier?.iconColor }}
                />
              )}
            </div>
            <div>
              <p
                className="text-xs uppercase tracking-wider"
                style={{ color: "var(--rs-text-muted)" }}
              >
                Current Tier
              </p>
              <h2
                className="text-2xl font-semibold rs-stat"
                style={{ color: currentTier?.iconColor }}
              >
                {currentTier?.name}
              </h2>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--rs-text-secondary)" }}
              >
                {currentTier?.commission} commission rate
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <p
                className="text-xs"
                style={{ color: "var(--rs-text-muted)" }}
              >
                Total Sales
              </p>
              <p className="text-2xl font-semibold text-white rs-stat">
                {formatCurrency(closedWonValue)}
              </p>
            </div>
            <span className="rs-pill rs-pill--violet">
              Next: {nextTier?.name || "Max tier"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Progress to Next Tier */}
      {currentAffiliate?.tier !== "platinum" && nextTier && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rs-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Progress to {nextTier.name}
              </h3>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--rs-text-secondary)" }}
              >
                {currentAffiliate?.tier === "bronze"
                  ? "Make your first sale to unlock Silver tier"
                  : "Reach R150,000 in sales to unlock Gold tier"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-semibold text-white rs-stat">
                {Math.round(progress.percent)}%
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--rs-text-muted)" }}
              >
                {formatCurrency(progress.current)} /{" "}
                {formatCurrency(progress.target)}
              </p>
            </div>
          </div>

          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "var(--rs-bg-overlay)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, var(--rs-accent), var(--rs-text-accent))",
              }}
            />
          </div>

          {currentAffiliate?.tier === "gold" && (
            <div className="rs-callout rs-callout--info mt-4">
              Upgrade to Platinum for R899.69/month to unlock 12-15% commission
              and exclusive lead access.
            </div>
          )}
        </motion.div>
      )}

      {/* Tier Comparison */}
      <div>
        <div className="rs-section-header-title mb-4">Compare Tiers</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {tiers.map((tier, index) => {
            const isCurrentTier = tier.id === currentAffiliate?.tier;
            const Icon = tier.icon;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rs-card p-5 relative overflow-hidden"
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
                  <div className="absolute top-3 right-3">
                    <span className="rs-pill rs-pill--violet">Current</span>
                  </div>
                )}

                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: tier.accent }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: tier.iconColor }}
                  />
                </div>

                <h3
                  className="text-base font-semibold mb-1"
                  style={{ color: tier.iconColor }}
                >
                  {tier.name}
                </h3>

                <div className="mb-4">
                  <p className="text-2xl font-semibold text-white rs-stat">
                    {tier.commission}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--rs-text-muted)" }}
                  >
                    commission
                  </p>
                </div>

                <div
                  className="mb-4 p-3 rounded-lg"
                  style={{
                    background: "var(--rs-bg-base)",
                    border: "1px solid var(--rs-border)",
                  }}
                >
                  <p
                    className="text-[10px] uppercase tracking-wider"
                    style={{ color: "var(--rs-text-muted)" }}
                  >
                    Subscription
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {tier.subscription}
                  </p>
                </div>

                <div className="space-y-2">
                  {tier.features.slice(0, 5).map((feature) => (
                    <div key={feature.name} className="flex items-center gap-2">
                      {feature.included ? (
                        <Check
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

                {tier.id === "platinum" &&
                  currentAffiliate?.tier !== "platinum" && (
                    <button className="rs-btn-primary w-full justify-center mt-4">
                      <Zap className="w-3.5 h-3.5" />
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
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rs-card p-6"
      >
        <div className="rs-section-header-title mb-4">Tier Requirements</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className="p-4 rounded-lg"
              style={{
                background: "var(--rs-bg-base)",
                border: "1px solid var(--rs-border)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: tier.accent }}
                >
                  <tier.icon
                    className="w-4 h-4"
                    style={{ color: tier.iconColor }}
                  />
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: tier.iconColor }}
                >
                  {tier.name}
                </span>
              </div>
              <p
                className="text-xs"
                style={{ color: "var(--rs-text-secondary)" }}
              >
                {tier.requirements[0]}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Platinum CTA */}
      {currentAffiliate?.tier !== "platinum" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rs-card p-8 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, var(--rs-accent-soft), var(--rs-bg-base))",
            border: "1px solid var(--rs-accent)",
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--rs-accent)" }}
              >
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">
                    Go Platinum
                  </h3>
                  <span className="rs-pill rs-pill--violet">Premium</span>
                </div>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--rs-text-secondary)" }}
                >
                  Unlock the full potential of your affiliate business.
                </p>
              </div>
            </div>
            <div className="md:text-right">
              <p className="text-2xl font-semibold text-white rs-stat">
                R899.69
                <span
                  className="text-sm font-normal"
                  style={{ color: "var(--rs-text-muted)" }}
                >
                  /month
                </span>
              </p>
              <ul className="space-y-1 my-3">
                <li
                  className="text-xs flex items-center md:justify-end gap-1.5"
                  style={{ color: "var(--rs-text-secondary)" }}
                >
                  <Check
                    className="w-3 h-3"
                    style={{ color: "var(--rs-success)" }}
                  />
                  12-15% commission
                </li>
                <li
                  className="text-xs flex items-center md:justify-end gap-1.5"
                  style={{ color: "var(--rs-text-secondary)" }}
                >
                  <Check
                    className="w-3 h-3"
                    style={{ color: "var(--rs-success)" }}
                  />
                  Exclusive lead pool
                </li>
                <li
                  className="text-xs flex items-center md:justify-end gap-1.5"
                  style={{ color: "var(--rs-text-secondary)" }}
                >
                  <Check
                    className="w-3 h-3"
                    style={{ color: "var(--rs-success)" }}
                  />
                  Priority support
                </li>
              </ul>
              <button className="rs-btn-primary inline-flex">
                <Zap className="w-3.5 h-3.5" />
                Upgrade to Platinum
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}