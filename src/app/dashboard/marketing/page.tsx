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
  EyeOff,
  Lock,
  RefreshCw,
  AlertTriangle,
  Trash2,
  Calendar,
  Zap,
  MessageSquareWarning,
  CircleCheck,
  ListChecks,
  Activity,
  Power,
  PowerOff,
} from "lucide-react";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";

const PROVIDERS = [
  {
    id: "openai" as const,
    name: "OpenAI",
    model: "gpt-4o-mini",
    desc: "Fast, cheap, reliable. Get a key at platform.openai.com.",
    placeholder: "sk-...",
    docs: "https://platform.openai.com/api-keys",
  },
  {
    id: "anthropic" as const,
    name: "Anthropic",
    model: "claude-3-5-haiku",
    desc: "Strong at structured analysis. Get a key at console.anthropic.com.",
    placeholder: "sk-ant-...",
    docs: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "gemini" as const,
    name: "Google Gemini",
    model: "gemini-2.0-flash",
    desc: "Free tier available. Get a key at aistudio.google.com.",
    placeholder: "AIza...",
    docs: "https://aistudio.google.com/apikey",
  },
];

export default function AdvisorPage() {
  // Step 1: code unlock
  const [code, setCode] = useState("");
  const [pendingCheck, setPendingCheck] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [invalidCode, setInvalidCode] = useState(false);
  const [validating, setValidating] = useState(false);

  const validation = useQuery(
    api.advisor.validateAdvisorAccessCode,
    pendingCheck ? { code: pendingCheck } : "skip"
  );

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

  if (!unlocked) {
    return <UnlockCard code={code} setCode={setCode} invalidCode={invalidCode} setInvalidCode={setInvalidCode} validating={validating} handleUnlock={handleUnlock} />;
  }

  return <AdvisorWorkspace />;
}

/* ------------------------------------------------------------------ */
/* Unlock card (gates the whole advisor experience)                   */
/* ------------------------------------------------------------------ */

function UnlockCard({
  code,
  setCode,
  invalidCode,
  setInvalidCode,
  validating,
  handleUnlock,
}: {
  code: string;
  setCode: (v: string) => void;
  invalidCode: boolean;
  setInvalidCode: (v: boolean) => void;
  validating: boolean;
  handleUnlock: (e: React.FormEvent) => void;
}) {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <span className="rs-overline">Advisor</span>
        <h1 className="rs-page-title text-2xl md:text-[28px] mt-1">Advisor</h1>
        <p className="rs-page-subtitle">
          Early access. An advisor reviews what you're doing and helps you make better calls.
        </p>
      </motion.div>

      <div className="rs-card p-8 md:p-12">
        <div className="grid md:grid-cols-[auto_1fr] gap-8 items-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "var(--rs-accent-soft)",
              border: "1px solid rgba(167,139,250,0.25)",
            }}
          >
            <ShieldCheck className="w-7 h-7" style={{ color: "var(--rs-accent)" }} />
          </div>
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
              <p className="text-sm mt-1" style={{ color: "var(--rs-text-secondary)" }}>
                Codes are issued in small cohorts. If you don't have one yet, reach out to Roventis.
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
                      ? { borderColor: "rgba(239,68,68,0.55)", background: "rgba(239,68,68,0.05)" }
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
                  <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</>
                ) : (
                  <>Unlock <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
            <p className="text-xs" style={{ color: invalidCode ? "rgb(248,113,113)" : "var(--rs-text-muted)" }}>
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
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--rs-text-muted)" }}>
            What's inside
          </span>
        </div>
        <h3 className="text-base font-semibold text-white mb-4">
          A daily digest and weekly report, written just for you
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Eye, title: "What you're doing", desc: "Deals, leads, training - all in one read." },
            { icon: ListChecks, title: "What to do next", desc: "Concrete actions for the week ahead." },
            { icon: MessageSquareWarning, title: "What's blocking you", desc: "Stalled deals, low conversion, dead leads." },
            { icon: CircleCheck, title: "What's working", desc: "Reinforce what's already moving." },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl p-4"
              style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                style={{ background: "var(--rs-accent-soft)", border: "1px solid rgba(167,139,250,0.20)" }}
              >
                <item.icon className="w-4 h-4" style={{ color: "var(--rs-accent)" }} />
              </div>
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="text-xs mt-1" style={{ color: "var(--rs-text-secondary)" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Workspace (post-unlock): setup state OR active state               */
/* ------------------------------------------------------------------ */

function AdvisorWorkspace() {
  const settings = useQuery(api.advisorV2Public.getMyAdvisorSettings);
  const digests = useQuery(api.advisorV2Public.getMyLatestDigests);

  if (settings === undefined || digests === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--rs-accent)" }} />
      </div>
    );
  }

  if (!settings || !settings.configured) {
    return <SetupState />;
  }

  return <ActiveState settings={settings} digests={digests!} />;
}

/* ------------------------------------------------------------------ */
/* Setup state: provider picker + key entry                            */
/* ------------------------------------------------------------------ */

function SetupState() {
  const [provider, setProvider] = useState<typeof PROVIDERS[number]>(PROVIDERS[0]);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveApiKey = useAction(api.advisorV2.saveApiKey);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || !apiKey.trim()) return;
    setSaving(true);
    try {
      await saveApiKey({ provider: provider.id, apiKey: apiKey.trim() });
      toast.success(`${provider.name} key saved and validated`);
      setApiKey("");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not save key");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
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
        <h1 className="rs-page-title text-2xl md:text-[28px] mt-1">Connect your AI model</h1>
        <p className="rs-page-subtitle">
          Paste your own API key. It's encrypted and stored securely - we never see or use it.
        </p>
      </motion.div>

      <div className="rs-callout rs-callout--info flex items-start gap-3">
        <div className="rs-icon-tile rs-icon-tile--info flex-shrink-0" style={{ width: 36, height: 36 }}>
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">Your key, your model, your bill</p>
          <p className="text-sm mt-0.5" style={{ color: "var(--rs-text-secondary)" }}>
            We never share your key with anyone. You pay the AI provider directly - we only call them on your behalf when generating your digest. Up to 10 generations per day, hard cap.
          </p>
        </div>
      </div>

      {/* Provider picker */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Pick your provider</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {PROVIDERS.map((p) => {
            const isSelected = p.id === provider.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setProvider(p)}
                className="rs-card rs-card-interactive p-4 text-left"
                style={{
                  borderColor: isSelected ? "var(--rs-accent)" : "var(--rs-border)",
                  background: isSelected ? "var(--rs-accent-soft)" : "var(--rs-bg-raised)",
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-white">{p.name}</span>
                  {isSelected && (
                    <Check className="w-4 h-4" style={{ color: "var(--rs-accent)" }} />
                  )}
                </div>
                <p className="text-xs font-mono mb-1" style={{ color: "var(--rs-text-muted)" }}>
                  {p.model}
                </p>
                <p className="text-xs" style={{ color: "var(--rs-text-secondary)" }}>{p.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Key entry */}
      <form onSubmit={handleSave} className="rs-card p-6 space-y-4">
        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--rs-text-secondary)" }}
          >
            {provider.name} API key
          </label>
          <div className="relative">
            <KeyRound
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "var(--rs-text-muted)" }}
            />
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider.placeholder}
              autoComplete="off"
              spellCheck={false}
              className="rs-input rs-input--search w-full pr-12"
              style={{ height: 44, fontFamily: "monospace" }}
              disabled={saving}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/5"
              style={{ color: "var(--rs-text-muted)" }}
              tabIndex={-1}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs mt-1.5" style={{ color: "var(--rs-text-muted)" }}>
            Don't have a key?{" "}
            <a
              href={provider.docs}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--rs-accent)" }}
            >
              Get one here
            </a>
          </p>
        </div>
        <button
          type="submit"
          disabled={saving || !apiKey.trim()}
          className="rs-btn-primary w-full justify-center disabled:opacity-50"
          style={{ height: 44 }}
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Validating key...</>
          ) : (
            <><ShieldCheck className="w-4 h-4" /> Save and validate</>
          )}
        </button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Active state: digest viewer + manage settings                       */
/* ------------------------------------------------------------------ */

function ActiveState({
  settings,
  digests,
}: {
  settings: NonNullable<ReturnType<typeof useQuery<typeof api.advisorV2Public.getMyAdvisorSettings>>>;
  digests: NonNullable<ReturnType<typeof useQuery<typeof api.advisorV2Public.getMyLatestDigests>>>;
}) {
  const [generating, setGenerating] = useState<"daily" | "weekly" | null>(null);
  const generateDaily = useAction(api.advisorV2.generateDailySummary);
  const generateWeekly = useAction(api.advisorV2.generateWeeklyReport);
  const setActive = useMutation(api.advisorV2Public.setAdvisorActive);
  const removeApiKey = useMutation(api.advisorV2Public.removeApiKey);

  const providerInfo = PROVIDERS.find((p) => p.id === settings.provider) ?? PROVIDERS[0];

  const onGenerate = async (kind: "daily" | "weekly") => {
    setGenerating(kind);
    try {
      if (kind === "daily") await generateDaily({});
      else await generateWeekly({});
      toast.success(`${kind === "daily" ? "Daily digest" : "Weekly report"} generated`);
    } catch (err: any) {
      toast.error(err?.message ?? `Failed to generate ${kind}`);
    } finally {
      setGenerating(null);
    }
  };

  const onToggleActive = async () => {
    try {
      await setActive({ isActive: !settings.isActive });
      toast.success(settings.isActive ? "Advisor paused" : "Advisor resumed");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not update");
    }
  };

  const onRemove = async () => {
    if (!confirm("Remove your API key? You'll need to add it again to use the advisor.")) return;
    try {
      await removeApiKey({});
      toast.success("API key removed");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not remove");
    }
  };

  const remaining = Math.max(0, digests.dailyCap - digests.usageToday);
  const atCap = digests.usageToday >= digests.dailyCap;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rs-page-header">
        <div>
          <span className="rs-overline">Advisor</span>
          <h1 className="rs-page-title mt-1">Your advisor</h1>
          <p className="rs-page-subtitle">
            Daily digest + weekly report, written for you from your own data.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="rs-pill"
            style={{
              background: settings.isActive ? "rgba(16,185,129,0.10)" : "rgba(255,255,255,0.04)",
              color: settings.isActive ? "rgb(74,222,128)" : "var(--rs-text-muted)",
              borderColor: settings.isActive ? "rgba(16,185,129,0.25)" : "var(--rs-border)",
            }}
          >
            {settings.isActive ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
            {settings.isActive ? "Active" : "Paused"}
          </span>
          <span className="rs-pill">
            <Zap className="w-3 h-3" />
            {providerInfo.name}
          </span>
          <span
            className="rs-pill"
            style={{
              background: atCap ? "rgba(239,68,68,0.10)" : "rgba(255,255,255,0.04)",
              color: atCap ? "rgb(248,113,113)" : "var(--rs-text-muted)",
              borderColor: atCap ? "rgba(239,68,68,0.25)" : "var(--rs-border)",
            }}
          >
            <Activity className="w-3 h-3" />
            {digests.usageToday} / {digests.dailyCap} today
          </span>
        </div>
      </div>

      {/* Settings row */}
      <div className="rs-card p-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--rs-text-secondary)" }}>
          <KeyRound className="w-3.5 h-3.5" style={{ color: "var(--rs-text-muted)" }} />
          <span className="font-mono">{settings.keyPreview}</span>
          <span style={{ color: "var(--rs-text-muted)" }}>·</span>
          <span style={{ color: "var(--rs-text-muted)" }}>
            Validated {settings.lastValidatedAt ? new Date(settings.lastValidatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleActive}
            className="rs-btn-ghost inline-flex items-center gap-1.5"
            style={{ height: 30, padding: "0 10px", fontSize: 12 }}
          >
            {settings.isActive ? <><PowerOff className="w-3 h-3" /> Pause</> : <><Power className="w-3 h-3" /> Resume</>}
          </button>
          <button
            onClick={onRemove}
            className="rs-btn-ghost inline-flex items-center gap-1.5"
            style={{ height: 30, padding: "0 10px", fontSize: 12, color: "rgb(248,113,113)" }}
          >
            <Trash2 className="w-3 h-3" />
            Remove key
          </button>
        </div>
      </div>

      {/* Cap warning */}
      {atCap && (
        <div className="rs-callout rs-callout--warning flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "rgb(251,191,36)" }} />
          <div>
            <p className="text-sm font-medium text-white">Daily limit reached</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--rs-text-secondary)" }}>
              You've used all {digests.dailyCap} generations for today. Caps reset at midnight SAST.
            </p>
          </div>
        </div>
      )}

      {/* Daily digest */}
      <DigestCard
        kind="daily"
        digest={digests.daily}
        generating={generating === "daily"}
        atCap={atCap}
        remaining={remaining}
        onGenerate={() => onGenerate("daily")}
      />

      {/* Weekly report */}
      <DigestCard
        kind="weekly"
        digest={digests.weekly}
        generating={generating === "weekly"}
        atCap={atCap}
        remaining={remaining}
        onGenerate={() => onGenerate("weekly")}
      />
    </div>
  );
}

function DigestCard({
  kind,
  digest,
  generating,
  atCap,
  remaining,
  onGenerate,
}: {
  kind: "daily" | "weekly";
  digest: any | null;
  generating: boolean;
  atCap: boolean;
  remaining: number;
  onGenerate: () => void;
}) {
  const label = kind === "daily" ? "Daily digest" : "Weekly report";
  const subtitle = kind === "daily" ? "A short read for today" : "A deeper look at your week";

  return (
    <div className="rs-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-3.5 h-3.5" style={{ color: "var(--rs-text-muted)" }} />
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--rs-text-muted)" }}
            >
              {label}
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>{subtitle}</p>
        </div>
        <button
          onClick={onGenerate}
          disabled={generating || atCap}
          className="rs-btn-primary inline-flex items-center gap-1.5 disabled:opacity-50"
          style={{ height: 32, padding: "0 12px", fontSize: 12 }}
        >
          {generating ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
          ) : digest ? (
            <><RefreshCw className="w-3.5 h-3.5" /> Regenerate</>
          ) : (
            <><Sparkles className="w-3.5 h-3.5" /> Generate</>
          )}
        </button>
      </div>

      {digest === null ? (
        <div
          className="rounded-xl p-8 text-center"
          style={{ background: "var(--rs-bg-base)", border: "1px dashed var(--rs-border)" }}
        >
          <Sparkles className="w-6 h-6 mx-auto mb-2" style={{ color: "var(--rs-accent)" }} />
          <p className="text-sm font-medium text-white">No {label.toLowerCase()} yet</p>
          <p className="text-xs mt-1" style={{ color: "var(--rs-text-muted)" }}>
            Click Generate, or wait - we'll write one for you at 7am SAST.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs" style={{ color: "var(--rs-text-muted)" }}>
            <span>
              Written {new Date(digest.generatedAt).toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {digest.tokensUsed != null && <span>~{digest.tokensUsed} tokens</span>}
          </div>
          <div className="space-y-4">
            {digest.sections.map((s: any, i: number) => (
              <DigestSection key={i} section={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DigestSection({ section }: { section: { kind: string; title: string; body: string } }) {
  const iconMap: Record<string, any> = {
    headline: Sparkles,
    summary: Eye,
    blockers: MessageSquareWarning,
    actionItems: ListChecks,
    praise: CircleCheck,
    watchlist: Activity,
  };
  const Icon = iconMap[section.kind] ?? Sparkles;
  const isHeadline = section.kind === "headline";
  const isActionItems = section.kind === "actionItems";

  return (
    <div
      className="rounded-xl"
      style={{
        background: isHeadline ? "var(--rs-accent-soft)" : "var(--rs-bg-base)",
        border: `1px solid ${isHeadline ? "rgba(167,139,250,0.25)" : "var(--rs-border)"}`,
        padding: isHeadline ? "12px 14px" : "14px 16px",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon
          className="w-3.5 h-3.5"
          style={{ color: isHeadline ? "var(--rs-accent)" : "var(--rs-text-muted)" }}
        />
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: isHeadline ? "var(--rs-accent)" : "var(--rs-text-muted)" }}
        >
          {section.title}
        </span>
      </div>
      {isActionItems ? (
        <ul className="space-y-1.5 text-sm" style={{ color: "var(--rs-text-primary)" }}>
          {section.body
            .split(/\r?\n/)
            .filter((l) => l.trim())
            .map((line, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                  style={{ background: "var(--rs-accent)" }}
                />
                <span>{line.replace(/^[-*•\d.)\s]+/, "")}</span>
              </li>
            ))}
        </ul>
      ) : (
        <p
          className="text-sm whitespace-pre-wrap"
          style={{ color: "var(--rs-text-primary)", lineHeight: 1.6 }}
        >
          {section.body}
        </p>
      )}
    </div>
  );
}