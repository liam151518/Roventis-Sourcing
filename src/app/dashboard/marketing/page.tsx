"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  KeyRound,
  LineChart,
  Loader2,
  ListChecks,
  Lock,
  MessageSquare,
  Phone,
  Sparkles,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import {
  ChatTab,
  DigestsTab,
  JournalTab,
  KeyManagementRow,
  OverviewTab,
  SetupState,
  TodosTab,
  UnlockCard,
} from "./_components";

const TABS = [
  { id: "overview", label: "Overview", icon: LineChart },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "journal", label: "Journal", icon: Phone },
  { id: "todos", label: "Todos", icon: ListChecks },
  { id: "digests", label: "Digests", icon: Sparkles },
] as const;

type TabId = (typeof TABS)[number]["id"];

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
    return (
      <UnlockCard
        code={code}
        setCode={setCode}
        invalidCode={invalidCode}
        setInvalidCode={setInvalidCode}
        validating={validating}
        handleUnlock={handleUnlock}
      />
    );
  }
  return <AdvisorWorkspace />;
}

function AdvisorWorkspace() {
  const settings = useQuery(api.advisorV2Public.getMyAdvisorSettings);
  const digests = useQuery(api.advisorV2Public.getMyLatestDigests);
  const setActive = useMutation(api.advisorV2Public.setAdvisorActive);
  const removeKey = useMutation(api.advisorV2Public.removeApiKey);
  const [tab, setTab] = useState<TabId>("overview");

  if (settings === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--rs-accent)" }} />
      </div>
    );
  }

  if (!settings || !settings.configured) {
    return <SetupState />;
  }

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
      await removeKey({});
      toast.success("API key removed");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not remove");
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <span className="rs-overline">Advisor</span>
        <h1 className="rs-page-title text-2xl md:text-[28px] mt-1">Your operations center</h1>
        <p className="rs-page-subtitle">
          Stats, daily check-ins, call journal, follow-ups, and AI chat - all from one place.
        </p>
      </motion.div>

      <KeyManagementRow
        settings={settings}
        onToggleActive={onToggleActive}
        onRemove={onRemove}
      />

      {/* Tab strip */}
      <div className="rs-tab-strip" role="tablist">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} type="button" role="tab" aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`rs-tab-strip-item ${active ? "rs-tab-strip-item--active" : ""}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="mt-2">
        {tab === "overview" && <OverviewTab />}
        {tab === "chat" && <ChatTab />}
        {tab === "journal" && <JournalTab />}
        {tab === "todos" && <TodosTab />}
        {tab === "digests" && <DigestsTab />}
      </div>
    </div>
  );
}