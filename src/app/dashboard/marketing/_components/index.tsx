"use client";

// All sections used by /dashboard/marketing (the Advisor page).
// Lives in a single file to keep the page-level entrypoint short
// while sharing helpers. All UI follows the existing rs-* token
// system in src/app/globals.css.

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  Coins,
  DollarSign,
  Eye,
  EyeOff,
  Flame,
  Inbox,
  KeyRound,
  Lightbulb,
  ListChecks,
  Loader2,
  Lock,
  MessageSquare,
  MessageSquareWarning,
  Phone,
  Pin,
  PinOff,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  Users,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import {
  useAction,
  useMutation,
  useQuery,
} from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

const PROVIDERS = [
  { id: "openai", name: "OpenAI", model: "gpt-4o-mini", placeholder: "sk-...", docs: "https://platform.openai.com/api-keys" },
  { id: "anthropic", name: "Anthropic", model: "claude-3-5-haiku", placeholder: "sk-ant-...", docs: "https://console.anthropic.com/settings/keys" },
  { id: "gemini", name: "Google Gemini", model: "gemini-2.0-flash", placeholder: "AIza...", docs: "https://aistudio.google.com/apikey" },
  { id: "minimax", name: "MiniMax", model: "MiniMax-M3", placeholder: "eyJ...", docs: "https://platform.minimax.io/user-center/basic-information/interface-key" },
] as const;
type ProviderId = (typeof PROVIDERS)[number]["id"];

const DEFAULT_MAX_TOKENS = 1500;
type Mode = "chat" | "call" | "strategic";
const MODE_META: Record<Mode, { label: string; icon: any; blurb: string }> = {
  chat: { label: "Chat", icon: MessageSquare, blurb: "General-purpose help" },
  call: { label: "Call coach", icon: Phone, blurb: "Live sales call coaching" },
  strategic: { label: "Strategic", icon: Target, blurb: "Revenue strategy" },
};

const RANDS = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 });

/* ============================================================ */
/* Unlock + Setup + Settings (shared by all tabs)               */
/* ============================================================ */

export function UnlockCard({
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
          Early access. Your operations control center - daily digest, call journal,
          follow-up tasks, AI chat, live coaching.
        </p>
      </motion.div>
      <div className="rs-card p-8 md:p-12">
        <div className="grid md:grid-cols-[auto_1fr] gap-8 items-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--rs-accent-soft)", border: "1px solid rgba(167,139,250,0.25)" }}
          >
            <ShieldCheck className="w-7 h-7" style={{ color: "var(--rs-accent)" }} />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="rs-pill" style={{ background: "rgba(167,139,250,0.10)", color: "var(--rs-accent)", borderColor: "rgba(167,139,250,0.25)" }}>
                  <Lock className="w-3 h-3" /> Early access
                </span>
              </div>
              <h2 className="text-lg font-semibold text-white">Enter your advisor access code</h2>
              <p className="text-sm mt-1" style={{ color: "var(--rs-text-secondary)" }}>
                Codes are issued in small cohorts. If you don&apos;t have one yet, reach out to Roventis.
              </p>
            </div>
            <form onSubmit={handleUnlock} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
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
                  style={{ height: 42, ...(invalidCode ? { borderColor: "rgba(239,68,68,0.55)", background: "rgba(239,68,68,0.05)" } : {}) }}
                  disabled={validating}
                  aria-invalid={invalidCode}
                />
              </div>
              <button type="submit" disabled={validating || !code.trim()}
                className="rs-btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ height: 42 }}
              >
                {validating ? (<><Loader2 className="w-4 h-4 animate-spin" /> Checking...</>)
                  : (<>Unlock <ArrowRight className="w-4 h-4" /></>)}
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
    </div>
  );
}

export function SetupState() {
  const [provider, setProvider] = useState<(typeof PROVIDERS)[number]>(PROVIDERS[0]);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveApiKey = useAction(api.advisorV2.saveApiKey);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || !apiKey.trim()) return;
    setSaving(true);
    try {
      await saveApiKey({ provider: provider.id as ProviderId, apiKey: apiKey.trim() });
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
          <span className="rs-pill" style={{ background: "rgba(16,185,129,0.10)", color: "rgb(74,222,128)", borderColor: "rgba(16,185,129,0.25)" }}>
            <Check className="w-3 h-3" /> Session unlocked
          </span>
        </div>
        <span className="rs-overline">Advisor</span>
        <h1 className="rs-page-title text-2xl md:text-[28px] mt-1">Connect your AI model</h1>
        <p className="rs-page-subtitle">
          Paste your own API key. It&apos;s encrypted at rest with AES-256-GCM.
        </p>
      </motion.div>

      <div className="rs-callout rs-callout--info flex items-start gap-3">
        <div className="rs-icon-tile rs-icon-tile--info flex-shrink-0" style={{ width: 36, height: 36 }}>
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">Your key, your model, your bill</p>
          <p className="text-sm mt-0.5" style={{ color: "var(--rs-text-secondary)" }}>
            We never share your key with anyone. You pay the AI provider directly - we just
            route your requests through their API. Hard cap of 10 operations/day across digests + chat.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Pick your provider</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PROVIDERS.map((p) => {
            const isSelected = p.id === provider.id;
            return (
              <button key={p.id} type="button" onClick={() => setProvider(p)}
                className="rs-card rs-card-interactive p-4 text-left"
                style={{ borderColor: isSelected ? "var(--rs-accent)" : "var(--rs-border)", background: isSelected ? "var(--rs-accent-soft)" : "var(--rs-bg-raised)" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-white">{p.name}</span>
                  {isSelected && <Check className="w-4 h-4" style={{ color: "var(--rs-accent)" }} />}
                </div>
                <p className="text-xs font-mono mb-1" style={{ color: "var(--rs-text-muted)" }}>{p.model}</p>
                <p className="text-xs" style={{ color: "var(--rs-text-secondary)" }}>Get a key at the provider's site.</p>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSave} className="rs-card p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>
            {provider.name} API key
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--rs-text-muted)" }} />
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
            <button type="button" onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/5"
              style={{ color: "var(--rs-text-muted)" }}
              tabIndex={-1}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs mt-1.5" style={{ color: "var(--rs-text-muted)" }}>
            Don&apos;t have a key? <a href={provider.docs} target="_blank" rel="noopener noreferrer" style={{ color: "var(--rs-accent)" }}>Get one here</a>
          </p>
        </div>
        <button type="submit" disabled={saving || !apiKey.trim()}
          className="rs-btn-primary w-full justify-center disabled:opacity-50" style={{ height: 44 }}>
          {saving ? (<><Loader2 className="w-4 h-4 animate-spin" /> Validating key...</>)
            : (<><ShieldCheck className="w-4 h-4" /> Save and validate</>)}
        </button>
      </form>
    </div>
  );
}

export function KeyManagementRow({
  settings,
  onToggleActive,
  onRemove,
}: {
  settings: { provider: string; keyPreview: string; isActive: boolean; lastValidatedAt: number | null };
  onToggleActive: () => Promise<void>;
  onRemove: () => Promise<void>;
}) {
  const info = PROVIDERS.find((p) => p.id === settings.provider) ?? PROVIDERS[0];
  return (
    <div className="rs-card p-4 flex flex-wrap items-center gap-3 justify-between">
      <div className="flex items-center gap-3 text-xs" style={{ color: "var(--rs-text-secondary)" }}>
        <KeyRound className="w-3.5 h-3.5" style={{ color: "var(--rs-text-muted)" }} />
        <span className="font-mono">{settings.keyPreview}</span>
        <span style={{ color: "var(--rs-text-muted)" }}>·</span>
        <span className="rs-pill"><Bot className="w-3 h-3" />{info.name}</span>
        <span style={{ color: "var(--rs-text-muted)" }}>·</span>
        <span style={{ color: "var(--rs-text-muted)" }}>
          Validated {settings.lastValidatedAt ? new Date(settings.lastValidatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onToggleActive} className="rs-btn-ghost inline-flex items-center gap-1.5"
          style={{ height: 30, padding: "0 10px", fontSize: 12 }}>
          {settings.isActive ? <><PowerOff className="w-3 h-3" /> Pause</> : <><Power className="w-3 h-3" /> Resume</>}
        </button>
        <button onClick={onRemove} className="rs-btn-ghost inline-flex items-center gap-1.5"
          style={{ height: 30, padding: "0 10px", fontSize: 12, color: "rgb(248,113,113)" }}>
          <Trash2 className="w-3 h-3" /> Remove key
        </button>
      </div>
    </div>
  );
}

/* ============================================================ */
/* Overview tab                                                  */
/* ============================================================ */

export function OverviewTab() {
  const stats = useQuery(api.advisorStats.getMyStats);
  const todos = useQuery(api.advisorJournal.listTodos, { includeCompleted: false });
  const journal = useQuery(api.advisorJournal.listJournal, {});

  if (stats === undefined) {
    return <CenterSpinner />;
  }
  if (!stats) return <EmptyState icon={ShieldCheck} title="No data yet" body="Your overview loads once your affiliate record is set up." />;

  const wonRate = stats.pipeline.openCount + stats.pipeline.lostCount + stats.pipeline.wonAllTimeCount > 0
    ? (stats.pipeline.wonAllTimeCount / (stats.pipeline.openCount + stats.pipeline.lostCount + stats.pipeline.wonAllTimeCount)) * 100
    : 0;
  const conversionLeadToDeal = stats.funnel.leadsTotal > 0 ? (stats.funnel.dealsFromLeads / stats.funnel.leadsTotal) * 100 : 0;
  const conversionDealToOrder = stats.pipeline.wonAllTimeCount > 0 ? (stats.funnel.ordersApproved / stats.pipeline.wonAllTimeCount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          icon={Coins}
          tint="accent"
          label="Pipeline (open)"
          value={RANDS.format(stats.pipeline.pipelineValue)}
          sub={`${stats.pipeline.openCount} open deals`}
        />
        <StatTile
          icon={Trophy}
          tint="success"
          label="Won this month"
          value={RANDS.format(stats.pipeline.wonValueThisMonth)}
          sub={`${stats.pipeline.wonThisMonth} closed`}
        />
        <StatTile
          icon={Phone}
          tint="info"
          label="Calls (7d)"
          value={String(stats.calls.thisWeek)}
          sub={`${stats.calls.total} all-time`}
        />
        <StatTile
          icon={Target}
          tint="warning"
          label="Conv. lead→deal"
          value={`${conversionLeadToDeal.toFixed(1)}%`}
          sub={`${stats.funnel.dealsFromLeads}/${stats.funnel.leadsTotal}`}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Funnel */}
        <div className="rs-card p-5">
          <SectionHeader title="Conversion funnel" description="Lead → commission." />
          <div className="space-y-1">
            <FunnelStep label="Leads claimed" value={String(stats.funnel.claimed)} />
            <FunnelArrow rate={conversionLeadToDeal} />
            <FunnelStep label="Deals from leads" value={String(stats.funnel.dealsFromLeads)} rate={conversionLeadToDeal} />
            <FunnelArrow rate={conversionDealToOrder} />
            <FunnelStep label="Won deals" value={String(stats.pipeline.wonAllTimeCount)} rate={wonRate} />
            <FunnelArrow />
            <FunnelStep label="Orders approved" value={String(stats.funnel.ordersApproved)} />
            <FunnelArrow />
            <FunnelStep label="Commissions paid" value={String(stats.funnel.commissionsPaid)} />
          </div>
        </div>

        {/* Trend */}
        <div className="rs-card p-5">
          <SectionHeader title="8-week trend" description="Won and lost deals per week." />
          <div className="h-40 flex items-end gap-2 mt-4">
            {stats.trend.map((w, i) => {
              const max = Math.max(1, ...stats.trend.map((x) => x.won + x.lost));
              const h1 = ((w.won / max) * 100) || 4;
              const h2 = ((w.lost / max) * 100) || 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 group">
                  <div className="w-full flex flex-col justify-end items-center" style={{ height: 130 }}>
                    {w.won > 0 && <div className="rs-trend-bar" style={{ height: `${h1}%` }} title={`${w.won} won`} />}
                    {w.lost > 0 && (
                      <div className="rs-trend-bar rs-trend-bar--lost" style={{ height: `${h2}%`, marginTop: 2 }} title={`${w.lost} lost`} />
                    )}
                    {(w.won + w.lost) === 0 && <div className="rs-trend-bar" style={{ height: "4%", opacity: 0.3 }} />}
                  </div>
                  <span className="text-[10px]" style={{ color: "var(--rs-text-muted)" }}>{w.label}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-3 text-[10px]" style={{ color: "var(--rs-text-muted)" }}>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: "rgba(124,58,237,0.6)" }} /> Won</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: "rgba(239,68,68,0.4)" }} /> Lost</span>
          </div>
        </div>

        {/* Next up */}
        <div className="rs-card p-5">
          <SectionHeader title="Up next" description="Most urgent todo + recent activity." />
          {stats.todos.nextUp ? (
            <div className="mt-3 p-3 rounded-lg" style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="rs-pill rs-pill--violet"><ListChecks className="w-3 h-3" />Next todo</span>
                <PriorityPill priority={stats.todos.nextUp.priority as any} />
              </div>
              <p className="text-sm font-medium text-white">{stats.todos.nextUp.title}</p>
              <p className="text-xs mt-1" style={{ color: "var(--rs-text-muted)" }}>
                Due {stats.todos.nextUp.dueAt ? new Date(stats.todos.nextUp.dueAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "no date"}
              </p>
            </div>
          ) : (
            <p className="text-sm mt-3" style={{ color: "var(--rs-text-muted)" }}>No open todos. Nice work.</p>
          )}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <MiniStat label="Open" value={stats.todos.open} icon={ListChecks} tint="info" />
            <MiniStat label="Overdue" value={stats.todos.overdue} icon={AlertTriangle} tint="danger" />
            <MiniStat label="Won/closed" value={stats.todos.completedThisWeek} icon={CheckCircle2} tint="success" />
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rs-card p-5">
        <SectionHeader title="Recent activity" description="Your last calls + todo changes." />
        {journal && journal.length > 0 ? (
          <ul className="divide-y" style={{ borderColor: "var(--rs-border)" }}>
            {journal.slice(0, 5).map((j: any) => (
              <li key={j._id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <OutcomeIcon outcome={j.outcome} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{j.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--rs-text-muted)" }}>
                      {new Date(j.calledAt ?? j.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <OutcomePill outcome={j.outcome} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm mt-3" style={{ color: "var(--rs-text-muted)" }}>Log a call from the Journal tab to see activity here.</p>
        )}
      </div>

      {/* Commissions top 3 */}
      {stats.commissions.topDeals.length > 0 && (
        <div className="rs-card p-5">
          <SectionHeader title="Top commission deals" description="By R commission earned." />
          <ul className="mt-3 space-y-2">
            {stats.commissions.topDeals.map((d, i) => (
              <li key={d.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}>
                <div className="flex items-center gap-3">
                  <span className="rs-icon-tile rs-icon-tile--accent" style={{ width: 32, height: 32 }}>
                    <Trophy className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{d.clientName}</p>
                    <p className="text-xs" style={{ color: "var(--rs-text-muted)" }}>
                      Deal {RANDS.format(d.dealValue)} · Status {d.status.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-white">{RANDS.format(d.commissionAmount)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatTile({ icon: Icon, tint, label, value, sub }: { icon: any; tint: any; label: string; value: string; sub?: string }) {
  return (
    <div className="rs-stat-tile p-4 rounded-xl" style={{ background: "var(--rs-bg-raised)", border: "1px solid var(--rs-border)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className={`rs-icon-tile rs-icon-tile--${tint}`} style={{ width: 32, height: 32 }}>
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--rs-text-muted)" }}>{label}</p>
      <p className="text-xl md:text-2xl font-semibold text-white mt-0.5" style={{ fontVariantNumeric: "tabular-nums" }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "var(--rs-text-muted)" }}>{sub}</p>}
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, tint }: any) {
  return (
    <div className="rounded-lg p-2.5" style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}>
      <div className="flex items-center gap-1.5">
        <span className={`rs-icon-tile rs-icon-tile--${tint}`} style={{ width: 22, height: 22 }}>
          <Icon className="w-3 h-3" />
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--rs-text-muted)" }}>{label}</span>
      </div>
      <p className="text-base font-semibold text-white mt-1" style={{ fontVariantNumeric: "tabular-nums" }}>{value}</p>
    </div>
  );
}

function FunnelStep({ label, value, rate }: { label: string; value: string; rate?: number }) {
  return (
    <div className="rs-funnel-step">
      <span className="rs-funnel-step-label">{label}</span>
      <span className="rs-funnel-step-value">{value}</span>
      {rate !== undefined && <span className="rs-funnel-step-rate">{rate.toFixed(0)}%</span>}
    </div>
  );
}

function FunnelArrow({ rate }: { rate?: number }) {
  return (
    <div className="rs-funnel-arrow">
      {rate !== undefined ? <span>{rate.toFixed(0)}% ↓</span> : <span className="opacity-60">↓</span>}
    </div>
  );
}

function OutcomeIcon({ outcome }: { outcome: string }) {
  const map: Record<string, { icon: any; tint: any }> = {
    won: { icon: Trophy, tint: "success" },
    lost: { icon: X, tint: "danger" },
    "follow-up": { icon: RefreshCw, tint: "info" },
    "no-answer": { icon: Phone, tint: "warning" },
    "info-sent": { icon: MessageSquare, tint: "accent" },
    other: { icon: Circle, tint: "info" },
  };
  const m = map[outcome] ?? map.other;
  const Icon = m.icon;
  return (
    <span className={`rs-icon-tile rs-icon-tile--${m.tint}`} style={{ width: 32, height: 32 }}>
      <Icon className="w-4 h-4" />
    </span>
  );
}

export function OutcomePill({ outcome }: { outcome: string }) {
  const map: Record<string, { label: string; bg: string; color: string; border: string }> = {
    won: { label: "Won", bg: "rgba(16,185,129,0.10)", color: "rgb(74,222,128)", border: "rgba(16,185,129,0.25)" },
    lost: { label: "Lost", bg: "rgba(239,68,68,0.10)", color: "rgb(248,113,113)", border: "rgba(239,68,68,0.25)" },
    "follow-up": { label: "Follow-up", bg: "rgba(59,130,246,0.10)", color: "rgb(96,165,250)", border: "rgba(59,130,246,0.25)" },
    "no-answer": { label: "No answer", bg: "rgba(245,158,11,0.10)", color: "rgb(251,191,36)", border: "rgba(245,158,11,0.25)" },
    "info-sent": { label: "Info sent", bg: "rgba(167,139,250,0.10)", color: "rgb(167,139,250)", border: "rgba(167,139,250,0.25)" },
    other: { label: "Other", bg: "rgba(255,255,255,0.06)", color: "var(--rs-text-secondary)", border: "var(--rs-border)" },
  };
  const m = map[outcome] ?? map.other;
  return <span className="rs-pill" style={{ background: m.bg, color: m.color, borderColor: m.border }}>{m.label}</span>;
}

function PriorityPill({ priority }: { priority: "low" | "med" | "high" }) {
  const map = {
    high: { bg: "rgba(239,68,68,0.10)", color: "rgb(248,113,113)", border: "rgba(239,68,68,0.25)", label: "High" },
    med: { bg: "rgba(245,158,11,0.10)", color: "rgb(251,191,36)", border: "rgba(245,158,11,0.25)", label: "Med" },
    low: { bg: "rgba(255,255,255,0.04)", color: "var(--rs-text-secondary)", border: "var(--rs-border)", label: "Low" },
  };
  const m = map[priority];
  return <span className="rs-pill" style={{ background: m.bg, color: m.color, borderColor: m.border }}>{m.label}</span>;
}

export function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {description && <p className="text-xs mt-0.5" style={{ color: "var(--rs-text-muted)" }}>{description}</p>}
    </div>
  );
}

function CenterSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--rs-accent)" }} />
    </div>
  );
}

function EmptyState({ icon: Icon, title, body }: any) {
  return (
    <div className="rs-empty-state">
      <Icon className="rs-empty-state-icon w-7 h-7" style={{ color: "var(--rs-accent)" }} />
      <p className="rs-empty-state-title">{title}</p>
      <p className="rs-empty-state-description">{body}</p>
    </div>
  );
}

/* ============================================================ */
/* Chat tab                                                      */
/* ============================================================ */

export function ChatTab() {
  const chats = useQuery(api.advisorChatPublic.listMyChats, {});
  const [activeChatId, setActiveChatId] = useState<Id<"advisorChats"> | null>(null);
  const [showNewChatMenu, setShowNewChatMenu] = useState(false);
  const createChat = useMutation(api.advisorChatPublic.createChat);

  useEffect(() => {
    if (!activeChatId && chats && chats.length > 0) setActiveChatId(chats[0]._id);
  }, [chats, activeChatId]);

  const startNewChat = async (mode: Mode) => {
    try {
      const { id } = await createChat({ mode });
      setActiveChatId(id as Id<"advisorChats">);
      setShowNewChatMenu(false);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create chat");
    }
  };

  if (chats === undefined) return <CenterSpinner />;

  const activeChat = chats.find((c: any) => c._id === activeChatId);

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-4 min-h-[600px]">
      {/* Chat list */}
      <div className="rs-card p-3 space-y-2">
        <div className="flex items-center justify-between px-1 mb-2">
          <h3 className="text-sm font-semibold text-white">Chats</h3>
          <div className="relative">
            <button onClick={() => setShowNewChatMenu((s) => !s)} className="rs-btn-ghost inline-flex items-center gap-1"
              style={{ height: 28, padding: "0 8px", fontSize: 12 }}>
              <Plus className="w-3 h-3" /> New
            </button>
            <AnimatePresence>
              {showNewChatMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 mt-1 w-44 rs-card p-1 z-10"
                  style={{ background: "var(--rs-bg-overlay)" }}
                  onMouseLeave={() => setShowNewChatMenu(false)}
                >
                  {(Object.keys(MODE_META) as Mode[]).map((mode) => {
                    const Icon = MODE_META[mode].icon;
                    return (
                      <button key={mode} onClick={() => startNewChat(mode)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-xs hover:bg-white/5"
                        style={{ color: "var(--rs-text-primary)" }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: "var(--rs-accent)" }} />
                        {MODE_META[mode].label}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="space-y-1 max-h-[500px] overflow-y-auto">
          {chats.length === 0 ? (
            <p className="text-xs px-2 py-6 text-center" style={{ color: "var(--rs-text-muted)" }}>
              Start a new chat to begin.
            </p>
          ) : (
            chats.map((c: any) => {
              const ModeIcon = MODE_META[c.mode as Mode].icon;
              return (
                <button key={c._id} onClick={() => setActiveChatId(c._id)}
                  className="w-full flex items-start gap-2 p-2 rounded-lg text-left"
                  style={{
                    background: c._id === activeChatId ? "var(--rs-accent-soft)" : "transparent",
                    border: c._id === activeChatId ? "1px solid rgba(124,58,237,0.25)" : "1px solid transparent",
                  }}
                >
                  <span className="rs-icon-tile rs-icon-tile--accent flex-shrink-0" style={{ width: 26, height: 26 }}>
                    <ModeIcon className="w-3 h-3" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-medium text-white truncate">{c.title}</p>
                      {c.pinned && <Pin className="w-2.5 h-2.5 flex-shrink-0" style={{ color: "var(--rs-accent)" }} />}
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--rs-text-muted)" }}>
                      {new Date(c.lastMessageAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat thread */}
      {activeChat ? (
        <ChatThread chat={activeChat} />
      ) : (
        <div className="rs-card p-6 flex items-center justify-center" style={{ minHeight: 500 }}>
          <EmptyState icon={MessageSquare} title="No chat yet" body="Click + New to start a conversation." />
        </div>
      )}
    </div>
  );
}

function ChatThread({ chat }: { chat: any }) {
  const messages = useQuery(api.advisorChatPublic.getChatMessages, { chatId: chat._id });
  const sendMessage = useAction(api.advisorChat.sendMessage);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const ModeIcon = MODE_META[chat.mode as Mode].icon;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending || !input.trim()) return;
    setSending(true);
    const content = input.trim();
    setInput("");
    try {
      await sendMessage({ chatId: chat._id, content });
    } catch (err: any) {
      toast.error(err?.message ?? "Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rs-card flex flex-col" style={{ minHeight: 600 }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--rs-border)" }}>
        <div className="flex items-center gap-3">
          <span className="rs-icon-tile rs-icon-tile--accent" style={{ width: 36, height: 36 }}>
            <ModeIcon className="w-4 h-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">{chat.title}</p>
            <p className="text-xs" style={{ color: "var(--rs-text-muted)" }}>{MODE_META[chat.mode as Mode].blurb}</p>
          </div>
        </div>
        <ChatActions chat={chat} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rs-chat-thread">
        {messages === undefined && <CenterSpinner />}
        {messages && messages.length === 0 && (
          <p className="text-sm text-center py-12" style={{ color: "var(--rs-text-muted)" }}>
            Type a message below to begin.
          </p>
        )}
        {messages && messages.map((m: any) => (
          <div key={m._id} className={`rs-chat-bubble rs-chat-bubble--${m.role}`}>
            <div>{m.content}</div>
            {m.role === "assistant" && m.tokensUsed != null && (
              <div className="rs-chat-bubble-meta">~{m.tokensUsed} tokens</div>
            )}
          </div>
        ))}
        {sending && (
          <div className="rs-chat-bubble rs-chat-bubble--assistant inline-flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form onSubmit={handleSend} className="p-3 border-t flex gap-2" style={{ borderColor: "var(--rs-border)" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e as any);
            }
          }}
          placeholder={chat.mode === "call" ? "Tell me what just happened on the call..." : chat.mode === "strategic" ? "Ask about your revenue strategy..." : "Ask anything..."}
          className="rs-input rs-input--textarea"
          rows={2}
          disabled={sending}
        />
        <button type="submit" disabled={sending || !input.trim()} className="rs-btn-primary inline-flex items-center justify-center gap-1.5"
          style={{ padding: "0 14px", alignSelf: "flex-end", height: 44 }}>
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}

function ChatActions({ chat }: { chat: any }) {
  const pin = useMutation(api.advisorChatPublic.pinChat);
  const del = useMutation(api.advisorChatPublic.deleteChat);
  const rename = useMutation(api.advisorChatPublic.renameChat);

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={async () => {
          const next = !chat.pinned;
          await pin({ id: chat._id, pinned: next });
          toast.success(next ? "Pinned" : "Unpinned");
        }}
        className="rs-btn-ghost p-1.5"
        title={chat.pinned ? "Unpin" : "Pin"}
      >
        {chat.pinned ? <PinOff className="w-3.5 h-3.5" style={{ color: "var(--rs-accent)" }} /> : <Pin className="w-3.5 h-3.5" />}
      </button>
      <button
        onClick={async () => {
          const title = prompt("Rename chat", chat.title);
          if (title) await rename({ id: chat._id, title });
        }}
        className="rs-btn-ghost p-1.5"
      >
        <Sparkles className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={async () => {
          if (!confirm("Delete this chat?")) return;
          await del({ id: chat._id });
          toast.success("Chat deleted");
        }}
        className="rs-btn-ghost p-1.5"
        style={{ color: "rgb(248,113,113)" }}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ============================================================ */
/* Journal tab                                                   */
/* ============================================================ */

export function JournalTab() {
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");
  const journal = useQuery(api.advisorJournal.listJournal, {
    outcome: outcomeFilter === "all" ? undefined : (outcomeFilter as any),
  });
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-sm font-semibold text-white">Call journal</h3>
        <button onClick={() => setCreating(true)} className="rs-btn-primary inline-flex items-center gap-1.5"
          style={{ padding: "0 12px", height: 32, fontSize: 13 }}>
          <Plus className="w-3.5 h-3.5" /> Log call
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {["all", "won", "lost", "follow-up", "no-answer", "info-sent", "other"].map((o) => (
          <button key={o} onClick={() => setOutcomeFilter(o)}
            className="rs-pill"
            style={{
              background: outcomeFilter === o ? "var(--rs-accent-soft)" : "rgba(255,255,255,0.04)",
              color: outcomeFilter === o ? "var(--rs-text-primary)" : "var(--rs-text-secondary)",
              borderColor: outcomeFilter === o ? "rgba(124,58,237,0.25)" : "var(--rs-border)",
              cursor: "pointer",
            }}
          >
            {o === "all" ? "All" : o.replace(/-/g, " ")}
          </button>
        ))}
      </div>

      <div className="rs-card p-2">
        {journal === undefined ? <CenterSpinner /> :
          journal.length === 0 ? (
            <EmptyState icon={Phone} title="No calls logged yet" body="Hit Log call after your next conversation." />
          ) : (
            <table className="rs-table">
              <thead>
                <tr>
                  <th className="text-left">Title</th>
                  <th className="text-left">Outcome</th>
                  <th className="text-left">Called</th>
                  <th className="text-left">Next step</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {journal.map((j: any) => (
                  <tr key={j._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <OutcomeIcon outcome={j.outcome} />
                        <div>
                          <p className="text-sm font-medium text-white">{j.title}</p>
                          {j.notes && <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--rs-text-muted)" }}>{j.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td><OutcomePill outcome={j.outcome} /></td>
                    <td className="text-xs" style={{ color: "var(--rs-text-secondary)" }}>
                      {new Date(j.calledAt ?? j.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="text-xs" style={{ color: "var(--rs-text-secondary)" }}>
                      {j.nextStep ? (
                        <div>
                          <p>{j.nextStep}</p>
                          {j.nextStepDueAt && (
                            <p style={{ color: j.nextStepDueAt < Date.now() ? "rgb(248,113,113)" : "var(--rs-text-muted)" }}>
                              Due {new Date(j.nextStepDueAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                            </p>
                          )}
                        </div>
                      ) : <span style={{ color: "var(--rs-text-muted)" }}>—</span>}
                    </td>
                    <td className="text-right">
                      <button onClick={() => setEditing(j)} className="rs-btn-ghost p-1 text-xs">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>

      <JournalModal
        open={creating || !!editing}
        onClose={() => { setCreating(false); setEditing(null); }}
        entry={editing}
      />
    </div>
  );
}

function JournalModal({ open, onClose, entry }: { open: boolean; onClose: () => void; entry: any | null }) {
  const create = useMutation(api.advisorJournal.createJournal);
  const update = useMutation(api.advisorJournal.updateJournal);
  const fromJournalCreateTodo = useMutation(api.advisorJournal.fromJournalCreateTodo);
  const [title, setTitle] = useState("");
  const [outcome, setOutcome] = useState<string>("follow-up");
  const [notes, setNotes] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [nextStepDueAt, setNextStepDueAt] = useState<string>("");
  const [calledAt, setCalledAt] = useState<string>("");
  const [createTodo, setCreateTodo] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(entry?.title ?? "");
      setOutcome(entry?.outcome ?? "follow-up");
      setNotes(entry?.notes ?? "");
      setNextStep(entry?.nextStep ?? "");
      setNextStepDueAt(entry?.nextStepDueAt ? toLocalInput(entry.nextStepDueAt) : "");
      setCalledAt(entry?.calledAt ? toLocalInput(entry.calledAt) : toLocalInput(Date.now()));
      setCreateTodo(!!entry?.nextStep);
    }
  }, [open, entry]);

  if (!open) return null;

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Title is required");
    const calledAtMs = calledAt ? new Date(calledAt).getTime() : Date.now();
    const dueMs = nextStepDueAt ? new Date(nextStepDueAt).getTime() : undefined;
    setSaving(true);
    try {
      if (entry) {
        await update({
          id: entry._id,
          title: title.trim(),
          outcome: outcome as any,
          notes,
          nextStep: nextStep || undefined,
          nextStepDueAt: dueMs,
          calledAt: calledAtMs,
        });
        toast.success("Updated");
      } else {
        const { id } = await create({
          title: title.trim(),
          outcome: outcome as any,
          notes,
          nextStep: nextStep || undefined,
          nextStepDueAt: dueMs,
          calledAt: calledAtMs,
        });
        if (createTodo && nextStep.trim()) {
          await fromJournalCreateTodo({
            journalId: id as Id<"advisorJournal">,
            title: nextStep.trim(),
            dueAt: dueMs,
            priority: "med",
          });
          toast.success("Logged + todo created");
        } else {
          toast.success("Logged");
        }
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rs-modal-backdrop" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rs-modal w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rs-modal-header">
          <h3 className="text-sm font-semibold text-white">{entry ? "Edit call" : "Log call"}</h3>
          <button onClick={onClose} className="rs-btn-ghost p-1"><X className="w-4 h-4" /></button>
        </div>
        <div className="rs-modal-body space-y-3">
          <FormField label="Title">
            <input className="rs-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Call with Acme Corp" />
          </FormField>
          <FormField label="Outcome">
            <select className="rs-input" value={outcome} onChange={(e) => setOutcome(e.target.value)}>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="follow-up">Follow-up</option>
              <option value="no-answer">No answer</option>
              <option value="info-sent">Info sent</option>
              <option value="other">Other</option>
            </select>
          </FormField>
          <FormField label="Called at">
            <input className="rs-input" type="datetime-local" value={calledAt} onChange={(e) => setCalledAt(e.target.value)} />
          </FormField>
          <FormField label="Notes">
            <textarea className="rs-input rs-input--textarea" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </FormField>
          <FormField label="Next step (optional)">
            <input className="rs-input" value={nextStep} onChange={(e) => setNextStep(e.target.value)} placeholder="Send revised quote" />
          </FormField>
          <FormField label="Due (optional)">
            <input className="rs-input" type="datetime-local" value={nextStepDueAt} onChange={(e) => setNextStepDueAt(e.target.value)} />
          </FormField>
          {!entry && nextStep.trim() && (
            <label className="flex items-center gap-2 text-xs" style={{ color: "var(--rs-text-secondary)" }}>
              <input type="checkbox" checked={createTodo} onChange={(e) => setCreateTodo(e.target.checked)} />
              Also create a follow-up todo for this
            </label>
          )}
        </div>
        <div className="rs-modal-header" style={{ borderTop: "1px solid var(--rs-border)", borderBottom: "none", justifyContent: "flex-end" }}>
          <button onClick={onClose} className="rs-btn-ghost" style={{ height: 32, padding: "0 12px", fontSize: 13 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} className="rs-btn-primary inline-flex items-center gap-1.5"
            style={{ height: 32, padding: "0 14px", fontSize: 13 }}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {entry ? "Save" : "Log call"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>{label}</label>
      {children}
    </div>
  );
}

function toLocalInput(epoch: number): string {
  const d = new Date(epoch);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* ============================================================ */
/* Todos tab                                                     */
/* ============================================================ */

export function TodosTab() {
  const todos = useQuery(api.advisorJournal.listTodos, { includeCompleted: true });
  const [showCompleted, setShowCompleted] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  const groups = useMemo(() => {
    if (!todos) return [];
    const now = Date.now();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfDay); endOfWeek.setDate(endOfWeek.getDate() + 7);
    const g = { overdue: [] as any[], today: [] as any[], week: [] as any[], later: [] as any[], done: [] as any[] };
    for (const t of todos) {
      if (t.completed) { if (showCompleted) g.done.push(t); continue; }
      const d = t.dueAt;
      if (d == null) g.later.push(t);
      else if (d < startOfDay.getTime()) g.overdue.push(t);
      else if (d < endOfWeek.getTime()) g.week.push(t);
      else g.later.push(t);
    }
    return [
      { key: "overdue", title: "Overdue", items: g.overdue, danger: true },
      { key: "today", title: "Today", items: g.today, danger: false }, // empty for now since we collapsed to week
      { key: "week", title: "This week", items: g.week, danger: false },
      { key: "later", title: "Later / no date", items: g.later, danger: false },
      ...(showCompleted ? [{ key: "done", title: "Done (last 7 days)", items: g.done, danger: false }] : []),
    ];
  }, [todos, showCompleted]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-sm font-semibold text-white">Follow-up tasks</h3>
        <div className="flex items-center gap-2">
          <label className="text-xs flex items-center gap-2" style={{ color: "var(--rs-text-secondary)" }}>
            <input type="checkbox" checked={showCompleted} onChange={(e) => setShowCompleted(e.target.checked)} />
            Show completed
          </label>
          <button onClick={() => setCreating(true)} className="rs-btn-primary inline-flex items-center gap-1.5"
            style={{ padding: "0 12px", height: 32, fontSize: 13 }}>
            <Plus className="w-3.5 h-3.5" /> New todo
          </button>
        </div>
      </div>

      {todos === undefined ? <CenterSpinner /> : (
        <div className="space-y-4">
          {groups.map((g) => g.items.length > 0 && (
            <div key={g.key}>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: g.danger ? "rgb(248,113,113)" : "var(--rs-text-muted)" }}>
                {g.title} <span className="ml-2 rs-pill">{g.items.length}</span>
              </h4>
              <div className="rs-card divide-y" style={{ borderColor: "var(--rs-border)" }}>
                {g.items.map((t: any) => (
                  <TodoRow key={t._id} todo={t} onEdit={() => setEditing(t)} />
                ))}
              </div>
            </div>
          ))}
          {todos.length === 0 && <EmptyState icon={ListChecks} title="No todos yet" body="Log a call with a next step, or create a todo directly." />}
        </div>
      )}

      <TodoModal open={creating || !!editing} onClose={() => { setCreating(false); setEditing(null); }} entry={editing} />
    </div>
  );
}

function TodoRow({ todo, onEdit }: { todo: any; onEdit: () => void }) {
  const toggle = useMutation(api.advisorJournal.toggleTodo);
  const remove = useMutation(api.advisorJournal.deleteTodo);
  return (
    <div className="flex items-center gap-3 p-3" style={{ opacity: todo.completed ? 0.6 : 1 }}>
      <button onClick={async () => { await toggle({ id: todo._id }); }} className="flex-shrink-0">
        {todo.completed ? (
          <CheckCircle2 className="w-5 h-5" style={{ color: "rgb(74,222,128)" }} />
        ) : (
          <Circle className="w-5 h-5" style={{ color: "var(--rs-text-muted)" }} />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate" style={{
          textDecoration: todo.completed ? "line-through" : "none",
        }}>{todo.title}</p>
        <div className="flex items-center gap-2 mt-0.5 text-xs" style={{ color: "var(--rs-text-muted)" }}>
          <PriorityPill priority={todo.priority} />
          {todo.dueAt && <span>Due {new Date(todo.dueAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>}
          {todo.sourceJournalId && <span className="rs-pill"><Phone className="w-3 h-3" /> from call</span>}
        </div>
      </div>
      <button onClick={onEdit} className="rs-btn-ghost text-xs">Edit</button>
      <button onClick={async () => { if (confirm("Delete?")) await remove({ id: todo._id }); }}
        className="rs-btn-ghost p-1.5" style={{ color: "rgb(248,113,113)" }}>
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function TodoModal({ open, onClose, entry }: { open: boolean; onClose: () => void; entry: any | null }) {
  const create = useMutation(api.advisorJournal.createTodo);
  const update = useMutation(api.advisorJournal.updateTodo);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueAt, setDueAt] = useState<string>("");
  const [priority, setPriority] = useState<"low" | "med" | "high">("med");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(entry?.title ?? "");
      setNotes(entry?.notes ?? "");
      setDueAt(entry?.dueAt ? toLocalInput(entry.dueAt) : "");
      setPriority(entry?.priority ?? "med");
    }
  }, [open, entry]);

  if (!open) return null;
  const save = async () => {
    if (!title.trim()) return toast.error("Title required");
    const dueMs = dueAt ? new Date(dueAt).getTime() : undefined;
    setSaving(true);
    try {
      if (entry) {
        await update({ id: entry._id, title, notes, dueAt: dueMs, priority });
        toast.success("Updated");
      } else {
        await create({ title, notes, dueAt: dueMs, priority });
        toast.success("Todo created");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rs-modal-backdrop" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rs-modal w-full max-w-md"
        onClick={(e) => e.stopPropagation()}>
        <div className="rs-modal-header">
          <h3 className="text-sm font-semibold text-white">{entry ? "Edit todo" : "New todo"}</h3>
          <button onClick={onClose} className="rs-btn-ghost p-1"><X className="w-4 h-4" /></button>
        </div>
        <div className="rs-modal-body space-y-3">
          <FormField label="Title">
            <input className="rs-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Send revised quote" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Priority">
              <select className="rs-input" value={priority} onChange={(e) => setPriority(e.target.value as any)}>
                <option value="high">High</option>
                <option value="med">Medium</option>
                <option value="low">Low</option>
              </select>
            </FormField>
            <FormField label="Due (optional)">
              <input className="rs-input" type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
            </FormField>
          </div>
          <FormField label="Notes">
            <textarea className="rs-input rs-input--textarea" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </FormField>
        </div>
        <div className="rs-modal-header" style={{ borderTop: "1px solid var(--rs-border)", borderBottom: "none", justifyContent: "flex-end" }}>
          <button onClick={onClose} className="rs-btn-ghost" style={{ height: 32, padding: "0 12px", fontSize: 13 }}>Cancel</button>
          <button onClick={save} disabled={saving} className="rs-btn-primary inline-flex items-center gap-1.5"
            style={{ height: 32, padding: "0 14px", fontSize: 13 }}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {entry ? "Save" : "Create"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ============================================================ */
/* Digests tab                                                   */
/* ============================================================ */

export function DigestsTab() {
  const digests = useQuery(api.advisorV2Public.getMyLatestDigests);
  const settings = useQuery(api.advisorV2Public.getMyAdvisorSettings);

  const generateDaily = useAction(api.advisorV2.generateDailySummary);
  const generateWeekly = useAction(api.advisorV2.generateWeeklyReport);
  const setActive = useMutation(api.advisorV2Public.setAdvisorActive);

  if (!digests || !settings) return <CenterSpinner />;
  if (!settings.configured) return null; // shouldn't happen
  const remaining = Math.max(0, digests.dailyCap - digests.usageToday);
  const atCap = digests.usageToday >= digests.dailyCap;

  return (
    <div className="space-y-4">
      <div className="rs-callout rs-callout--info flex items-start gap-3">
        <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--rs-accent)" }} />
        <div>
          <p className="text-sm font-medium text-white">Daily on demand · Weekly auto-Monday 7am SAST</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--rs-text-secondary)" }}>
            Digests run against your real data with PII scrubbed. {digests.usageToday} of {digests.dailyCap} operations used today.
            {atCap && " Cap reached - resets at midnight SAST."}
          </p>
        </div>
      </div>
      <DigestCard
        kind="daily"
        digest={digests.daily}
        generating={false}
        atCap={atCap}
        onGenerate={async () => {
          try { await generateDaily({}); toast.success("Daily digest generated"); }
          catch (e: any) { toast.error(e?.message ?? "Failed"); }
        }}
      />
      <DigestCard
        kind="weekly"
        digest={digests.weekly}
        generating={false}
        atCap={atCap}
        onGenerate={async () => {
          try { await generateWeekly({}); toast.success("Weekly report generated"); }
          catch (e: any) { toast.error(e?.message ?? "Failed"); }
        }}
      />
    </div>
  );
}

function DigestCard({
  kind, digest, generating, atCap, onGenerate,
}: {
  kind: "daily" | "weekly"; digest: any | null; generating: boolean; atCap: boolean;
  onGenerate: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const label = kind === "daily" ? "Daily digest" : "Weekly report";
  return (
    <div className="rs-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-3.5 h-3.5" style={{ color: "var(--rs-text-muted)" }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--rs-text-muted)" }}>{label}</span>
          </div>
          <p className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>
            {kind === "daily" ? "Short, focused on what's blocking you today" : "Trends + priorities for the week"}
          </p>
        </div>
        <button onClick={async () => { setBusy(true); await onGenerate(); setBusy(false); }}
          disabled={busy || atCap}
          className="rs-btn-primary inline-flex items-center gap-1.5 disabled:opacity-50"
          style={{ height: 32, padding: "0 12px", fontSize: 12 }}>
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
            digest ? <><RefreshCw className="w-3.5 h-3.5" /> Regenerate</> :
              <><Sparkles className="w-3.5 h-3.5" /> Generate</>}
        </button>
      </div>
      {digest === null ? (
        <div className="rounded-xl p-8 text-center" style={{ background: "var(--rs-bg-base)", border: "1px dashed var(--rs-border)" }}>
          <Sparkles className="w-6 h-6 mx-auto mb-2" style={{ color: "var(--rs-accent)" }} />
          <p className="text-sm font-medium text-white">No {label.toLowerCase()} yet</p>
          <p className="text-xs mt-1" style={{ color: "var(--rs-text-muted)" }}>
            {kind === "weekly" ? "Wait for Monday 7am SAST or hit Generate." : "Click Generate above."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs" style={{ color: "var(--rs-text-muted)" }}>
            <span>Written {new Date(digest.generatedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
            {digest.tokensUsed != null && <span>~{digest.tokensUsed} tokens</span>}
          </div>
          <div className="space-y-3">
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
    headline: Sparkles, summary: Eye, blockers: MessageSquareWarning,
    actionItems: ListChecks, praise: Trophy, watchlist: Activity,
  };
  const Icon = iconMap[section.kind] ?? Sparkles;
  const isHeadline = section.kind === "headline";
  const isActionItems = section.kind === "actionItems";
  return (
    <div className="rounded-xl"
      style={{
        background: isHeadline ? "var(--rs-accent-soft)" : "var(--rs-bg-base)",
        border: `1px solid ${isHeadline ? "rgba(167,139,250,0.25)" : "var(--rs-border)"}`,
        padding: isHeadline ? "10px 14px" : "12px 16px",
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-3.5 h-3.5" style={{ color: isHeadline ? "var(--rs-accent)" : "var(--rs-text-muted)" }} />
        <span className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: isHeadline ? "var(--rs-accent)" : "var(--rs-text-muted)" }}>
          {section.title}
        </span>
      </div>
      {isActionItems ? (
        <ul className="space-y-1 text-sm" style={{ color: "var(--rs-text-primary)" }}>
          {section.body.split(/\r?\n/).filter((l) => l.trim()).map((line, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: "var(--rs-accent)" }} />
              <span>{line.replace(/^[-*•\d.)\s]+/, "")}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--rs-text-primary)", lineHeight: 1.6 }}>
          {section.body}
        </p>
      )}
    </div>
  );
}