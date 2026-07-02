"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyRound,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Check,
  Loader2,
  Eye,
  Lightbulb,
  MessageSquare,
  ClipboardList,
  TrendingUp,
  Lock,
} from "lucide-react";
import { useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";

export default function AdvisorPage() {
  const [code, setCode] = useState("");
  const [pendingCheck, setPendingCheck] = useState<string | null>(null);
  // Once we've checked a code at least once, it stays unlocked for
  // the rest of this page-load (per the user's "per-load" choice).
  const [unlocked, setUnlocked] = useState(false);
  const [invalidCode, setInvalidCode] = useState(false);
  const [validating, setValidating] = useState(false);

  // useQuery only fires when pendingCheck is non-empty (skip pattern).
  const validation = useQuery(
    api.advisor.validateAdvisorAccessCode,
    pendingCheck ? { code: pendingCheck } : "skip"
  );

  // React to the query result.
  useEffect(() => {
    if (!pendingCheck || !validation) return;
    if (validation.valid) {
      setUnlocked(true);
      toast.success("Advisor unlocked for this session");
    } else {
      setInvalidCode(true);
      toast.error("Invalid or inactive access code");
    }
    setValidating(false);
    setPendingCheck(null);
  }, [validation, pendingCheck]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed || validating) return;

    setValidating(true);
    setInvalidCode(false);
    setUnlocked(false);
    setPendingCheck(trimmed);
  };

  if (unlocked) {
    return <AdvisorShell />;
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="rs-overline">Advisor</span>
        <h1 className="rs-page-title text-2xl md:text-[28px] mt-1">
          Advisor
        </h1>
        <p className="rs-page-subtitle">
          Early access. An advisor reviews what you're doing and helps you
          make better calls.
        </p>
      </motion.div>

      {/* Lock card */}
      <div className="rs-card p-8 md:p-12">
        <div className="grid md:grid-cols-[auto_1fr] gap-8 items-center">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "var(--rs-accent-soft)",
              border: "1px solid rgba(167,139,250,0.25)",
            }}
          >
            <ShieldCheck className="w-7 h-7" style={{ color: "var(--rs-accent)" }} />
          </div>

          {/* Copy + form */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="rs-pill"
                  style={{
                    background: "rgba(167,139,250,0.10)",
                    color: "var(--rs-accent)",
                    borderColor: "rgba(167,139,250,0.25)",
                  }}
                >
                  <Lock className="w-3 h-3" />
                  Early access
                </span>
              </div>
              <h2 className="text-lg font-semibold text-white">
                Enter your advisor access code
              </h2>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--rs-text-secondary)" }}
              >
                Codes are issued in small cohorts. If you don't have one yet,
                reach out to Roventis to get on the list.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <KeyRound
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: invalidCode ? "rgb(248,113,113)" : "var(--rs-text-muted)" }}
                />
                <input
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (invalidCode) setInvalidCode(false);
                  }}
                  placeholder="e.g. ROV-ADV-2026"
                  className="rs-input rs-input--search w-full"
                  style={{
                    height: 42,
                    ...(invalidCode
                      ? {
                          borderColor: "rgba(239,68,68,0.55)",
                          background: "rgba(239,68,68,0.05)",
                        }
                      : {}),
                  }}
                  disabled={validating}
                  aria-invalid={invalidCode}
                />
              </div>
              <button
                type="submit"
                disabled={validating || !code.trim()}
                className="rs-btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ height: 42 }}
              >
                {validating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    Unlock
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p
              className="text-xs"
              style={{ color: invalidCode ? "rgb(248,113,113)" : "var(--rs-text-muted)" }}
            >
              {invalidCode
                ? "That code didn't work. Double-check the spelling or ask Roventis for a fresh one."
                : "Access is per-session. You'll be prompted again next visit."}
            </p>
          </div>
        </div>
      </div>

      {/* What's inside (teaser) */}
      <div className="rs-card p-6 md:p-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4" style={{ color: "var(--rs-accent)" }} />
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--rs-text-muted)" }}
          >
            What's inside
          </span>
        </div>
        <h3 className="text-base font-semibold text-white mb-4">
          Four things your advisor sees and helps with
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              icon: Eye,
              title: "What you're doing",
              desc: "Activity, where time goes, where deals sit.",
            },
            {
              icon: ClipboardList,
              title: "Where you are",
              desc: "Pipeline state, training progress, weekly pace.",
            },
            {
              icon: TrendingUp,
              title: "Where to focus",
              desc: "Highest-leverage moves for the next 7 days.",
            },
            {
              icon: Lightbulb,
              title: "Advice, not commentary",
              desc: "Specific next actions you can take this week.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl p-4"
              style={{
                background: "var(--rs-bg-base)",
                border: "1px solid var(--rs-border)",
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                style={{
                  background: "var(--rs-accent-soft)",
                  border: "1px solid rgba(167,139,250,0.20)",
                }}
              >
                <item.icon
                  className="w-4 h-4"
                  style={{ color: "var(--rs-accent)" }}
                />
              </div>
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--rs-text-secondary)" }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Unlocked view - placeholder shell until the advisor side is built  */
/* ------------------------------------------------------------------ */

function AdvisorShell() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className="rs-pill"
            style={{
              background: "rgba(16,185,129,0.10)",
              color: "rgb(74,222,128)",
              borderColor: "rgba(16,185,129,0.25)",
            }}
          >
            <Check className="w-3 h-3" />
            Session unlocked
          </span>
        </div>
        <span className="rs-overline">Advisor</span>
        <h1 className="rs-page-title text-2xl md:text-[28px] mt-1">
          Your advisor is on it
        </h1>
        <p className="rs-page-subtitle">
          Your advisor can see your dashboard, training, and pipeline. They
          use it to give you targeted, weekly advice.
        </p>
      </motion.div>

      {/* Status banner */}
      <div
        className="rs-callout rs-callout--info flex items-start gap-3"
      >
        <div
          className="rs-icon-tile rs-icon-tile--info flex-shrink-0"
          style={{ width: 36, height: 36 }}
        >
          <MessageSquare className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">
            Advisor view is in early access
          </p>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--rs-text-secondary)" }}
          >
            We've unlocked the page for you. The full advisor experience -
            live read-only view, weekly notes, and direct call scheduling -
            is being built out and will land here as we ship.
          </p>
        </div>
      </div>

      {/* Placeholder grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <PlaceholderCard
          label="This week, focus on"
          title="Pipeline moves"
          description="Three actions picked for you based on where your deals actually sit right now."
        />
        <PlaceholderCard
          label="Where time is going"
          title="Activity breakdown"
          description="A breakdown of where you've been spending time - and where you should be."
        />
        <PlaceholderCard
          label="Calls booked"
          title="Coaching calls"
          description="Schedule or join a 1:1 call with your advisor from here."
        />
        <PlaceholderCard
          label="Standing advice"
          title="Advisor playbook"
          description="The ongoing advice your advisor has flagged for your account."
        />
      </div>
    </div>
  );
}

function PlaceholderCard({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rs-card p-6 relative overflow-hidden">
      {/* Coming-soon chip */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: "var(--rs-text-muted)" }}
        >
          {label}
        </span>
        <span
          className="rs-pill"
          style={{
            background: "rgba(255,255,255,0.04)",
            color: "var(--rs-text-muted)",
            borderColor: "var(--rs-border)",
          }}
        >
          Coming soon
        </span>
      </div>
      <p className="text-base font-semibold text-white">{title}</p>
      <p
        className="text-sm mt-1"
        style={{ color: "var(--rs-text-secondary)" }}
      >
        {description}
      </p>
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(167,139,250,0.40), transparent)",
        }}
      />
    </div>
  );
}
