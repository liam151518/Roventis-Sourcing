"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  Trash2,
  Power,
  PowerOff,
  Search,
  X,
  Sparkles,
  ShieldCheck,
  CalendarDays,
  Tag,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function AdminAdvisorCodesPage() {
  const codes = useQuery(api.admin.listAdvisorAccessCodes);
  const issueCode = useMutation(api.admin.issueAdvisorAccessCode);
  const setActive = useMutation(api.admin.setAdvisorAccessCodeActive);
  const deleteCode = useMutation(api.admin.deleteAdvisorAccessCode);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "revoked">(
    "all"
  );
  const [showIssue, setShowIssue] = useState(false);
  const [issueForm, setIssueForm] = useState({ code: "", label: "" });
  const [issuing, setIssuing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<Id<"advisorAccessCodes"> | null>(
    null
  );
  const [togglingId, setTogglingId] = useState<Id<"advisorAccessCodes"> | null>(
    null
  );

  const filtered = useMemo(() => {
    const all = codes ?? [];
    return all.filter((c) => {
      const matchesSearch =
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        (c.label ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? c.isActive
            : !c.isActive;
      return matchesSearch && matchesStatus;
    });
  }, [codes, search, statusFilter]);

  const stats = useMemo(() => {
    const all = codes ?? [];
    return {
      total: all.length,
      active: all.filter((c) => c.isActive).length,
      revoked: all.filter((c) => !c.isActive).length,
    };
  }, [codes]);

  if (codes === undefined) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--rs-bg-base)" }}
      >
        <div
          className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2"
          style={{ borderColor: "var(--rs-accent)" }}
        />
      </div>
    );
  }

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = issueForm.code.trim();
    const label = issueForm.label.trim();
    if (!code) return;
    if (issuing) return;

    setIssuing(true);
    try {
      await issueCode({ code, label: label || undefined });
      toast.success("Code issued");
      setIssueForm({ code: "", label: "" });
      setShowIssue(false);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to issue code");
    } finally {
      setIssuing(false);
    }
  };

  const handleToggle = async (id: Id<"advisorAccessCodes">, nextActive: boolean) => {
    setTogglingId(id);
    try {
      await setActive({ id, isActive: nextActive });
      toast.success(nextActive ? "Code activated" : "Code revoked");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update code");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: Id<"advisorAccessCodes">) => {
    try {
      await deleteCode({ id });
      toast.success("Code deleted");
      setPendingDeleteId(null);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete code");
    }
  };

  const handleCopy = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Could not copy");
    }
  };

  const generateCode = () => {
    // Six-char human-readable code, segments of 3.
    const segment = () =>
      Math.random().toString(36).slice(2, 5).toUpperCase().replace(/[^A-Z0-9]/g, "X");
    const next = `ROV-${segment()}-${segment()}`;
    setIssueForm((f) => ({ ...f, code: next }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rs-page-header">
        <div>
          <span className="rs-overline">Admin</span>
          <h1 className="rs-page-title mt-1">Advisor Access Codes</h1>
          <p className="rs-page-subtitle">
            Issue and revoke codes that unlock the Advisor page for affiliates.
          </p>
        </div>
        <button
          onClick={() => setShowIssue(true)}
          className="rs-btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Issue code
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div
          className="rs-card p-5"
          style={{ borderColor: "var(--rs-border)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-xs uppercase tracking-wider"
                style={{ color: "var(--rs-text-muted)" }}
              >
                Total codes
              </p>
              <p className="text-2xl font-semibold text-white mt-1">
                {stats.total}
              </p>
            </div>
            <div
              className="rs-icon-tile rs-icon-tile--accent"
              style={{ width: 36, height: 36 }}
            >
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
        </div>
        <div
          className="rs-card p-5"
          style={{ borderColor: "rgba(16,185,129,0.20)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-xs uppercase tracking-wider"
                style={{ color: "var(--rs-text-muted)" }}
              >
                Active
              </p>
              <p
                className="text-2xl font-semibold mt-1"
                style={{ color: "rgb(74,222,128)" }}
              >
                {stats.active}
              </p>
            </div>
            <div
              className="rs-icon-tile"
              style={{
                width: 36,
                height: 36,
                background: "rgba(16,185,129,0.10)",
                border: "1px solid rgba(16,185,129,0.25)",
              }}
            >
              <ShieldCheck className="w-4 h-4" style={{ color: "rgb(74,222,128)" }} />
            </div>
          </div>
        </div>
        <div
          className="rs-card p-5"
          style={{ borderColor: "rgba(239,68,68,0.20)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-xs uppercase tracking-wider"
                style={{ color: "var(--rs-text-muted)" }}
              >
                Revoked
              </p>
              <p
                className="text-2xl font-semibold mt-1"
                style={{ color: "rgb(248,113,113)" }}
              >
                {stats.revoked}
              </p>
            </div>
            <div
              className="rs-icon-tile"
              style={{
                width: 36,
                height: 36,
                background: "rgba(239,68,68,0.10)",
                border: "1px solid rgba(239,68,68,0.25)",
              }}
            >
              <PowerOff className="w-4 h-4" style={{ color: "rgb(248,113,113)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "var(--rs-text-muted)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code or label"
            className="rs-input rs-input--search w-full"
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "var(--rs-bg-raised)", border: "1px solid var(--rs-border)" }}>
          {(["all", "active", "revoked"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setStatusFilter(opt)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === opt ? "" : "hover:bg-white/5"
              }`}
              style={
                statusFilter === opt
                  ? {
                      background: "var(--rs-accent-soft)",
                      color: "var(--rs-accent)",
                    }
                  : { color: "var(--rs-text-secondary)" }
              }
            >
              {opt[0].toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rs-empty-state rs-card">
          <Sparkles
            className="rs-empty-state-icon"
            style={{ width: 48, height: 48 }}
          />
          <p className="rs-empty-state-title">
            {codes.length === 0
              ? "No advisor codes yet"
              : "No codes match your filters"}
          </p>
          <p className="rs-empty-state-description">
            {codes.length === 0
              ? "Issue your first code to start giving affiliates access to the Advisor page."
              : "Try a different search term or status filter."}
          </p>
          {codes.length === 0 && (
            <button
              onClick={() => setShowIssue(true)}
              className="rs-btn-primary mt-4 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Issue your first code
            </button>
          )}
        </div>
      ) : (
        <div
          className="rs-card overflow-hidden"
          style={{ padding: 0 }}
        >
          <div className="overflow-x-auto">
            <table className="rs-table">
              <thead>
                <tr>
                  <th className="text-left">Code</th>
                  <th className="text-left">Label</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Issued</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const isCopied = copiedId === c._id;
                  const isToggling = togglingId === c._id;
                  return (
                    <tr key={c._id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <code
                            className="font-mono text-sm px-2 py-1 rounded"
                            style={{
                              background: "var(--rs-bg-base)",
                              border: "1px solid var(--rs-border)",
                              color: c.isActive ? "var(--rs-text-primary)" : "var(--rs-text-muted)",
                            }}
                          >
                            {c.code}
                          </code>
                          <button
                            onClick={() => handleCopy(c.code, c._id)}
                            className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
                            style={{ color: "var(--rs-text-muted)" }}
                            title="Copy code"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5" style={{ color: "rgb(74,222,128)" }} />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td>
                        {c.label ? (
                          <div className="flex items-center gap-1.5">
                            <Tag
                              className="w-3.5 h-3.5"
                              style={{ color: "var(--rs-text-muted)" }}
                            />
                            <span className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>
                              {c.label}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: "var(--rs-text-muted)" }}>
                            —
                          </span>
                        )}
                      </td>
                      <td>
                        {c.isActive ? (
                          <span
                            className="rs-pill"
                            style={{
                              background: "rgba(16,185,129,0.10)",
                              color: "rgb(74,222,128)",
                              borderColor: "rgba(16,185,129,0.25)",
                            }}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span
                            className="rs-pill"
                            style={{
                              background: "rgba(239,68,68,0.10)",
                              color: "rgb(248,113,113)",
                              borderColor: "rgba(239,68,68,0.25)",
                            }}
                          >
                            <PowerOff className="w-3 h-3" />
                            Revoked
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <CalendarDays
                            className="w-3.5 h-3.5"
                            style={{ color: "var(--rs-text-muted)" }}
                          />
                          <span className="text-xs" style={{ color: "var(--rs-text-secondary)" }}>
                            {new Date(c.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() =>
                              handleToggle(c._id, !c.isActive)
                            }
                            disabled={isToggling}
                            className="rs-btn-ghost inline-flex items-center gap-1.5"
                            title={c.isActive ? "Revoke code" : "Activate code"}
                          >
                            {c.isActive ? (
                              <>
                                <PowerOff className="w-3.5 h-3.5" />
                                Revoke
                              </>
                            ) : (
                              <>
                                <Power className="w-3.5 h-3.5" />
                                Activate
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setPendingDeleteId(c._id)}
                            className="rs-btn-ghost inline-flex items-center gap-1.5"
                            title="Delete code"
                            style={{ color: "rgb(248,113,113)" }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Issue modal */}
      <AnimatePresence>
        {showIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rs-modal-backdrop"
            onClick={() => !issuing && setShowIssue(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="rs-modal max-w-md w-full p-0"
            >
              <div className="rs-modal-header">
                <div className="flex items-center gap-3">
                  <div
                    className="rs-icon-tile rs-icon-tile--accent"
                    style={{ width: 32, height: 32 }}
                  >
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    Issue advisor access code
                  </h3>
                </div>
                <button
                  onClick={() => !issuing && setShowIssue(false)}
                  className="p-1 rounded-md hover:bg-white/5 transition-colors"
                  style={{ color: "var(--rs-text-secondary)" }}
                  disabled={issuing}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleIssue}>
                <div className="rs-modal-body space-y-4">
                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: "var(--rs-text-secondary)" }}
                    >
                      Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={issueForm.code}
                        onChange={(e) =>
                          setIssueForm({ ...issueForm, code: e.target.value })
                        }
                        placeholder="e.g. ROV-ADV-2026"
                        className="rs-input flex-1"
                        autoFocus
                        required
                        disabled={issuing}
                      />
                      <button
                        type="button"
                        onClick={generateCode}
                        className="rs-btn-ghost"
                        disabled={issuing}
                        title="Generate a random code"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate
                      </button>
                    </div>
                    <p
                      className="text-xs mt-1.5"
                      style={{ color: "var(--rs-text-muted)" }}
                    >
                      Share this code with the people who need early access.
                    </p>
                  </div>
                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: "var(--rs-text-secondary)" }}
                    >
                      Label <span style={{ color: "var(--rs-text-muted)" }}>(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={issueForm.label}
                      onChange={(e) =>
                        setIssueForm({ ...issueForm, label: e.target.value })
                      }
                      placeholder="e.g. Q3 advisor cohort"
                      className="rs-input"
                      disabled={issuing}
                    />
                    <p
                      className="text-xs mt-1.5"
                      style={{ color: "var(--rs-text-muted)" }}
                    >
                      Internal note - helps you remember who this code was for.
                    </p>
                  </div>
                </div>
                <div
                  className="px-6 py-4 flex gap-2"
                  style={{ borderTop: "1px solid var(--rs-border)" }}
                >
                  <button
                    type="button"
                    onClick={() => setShowIssue(false)}
                    className="rs-btn-ghost flex-1 justify-center"
                    disabled={issuing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rs-btn-primary flex-1 justify-center disabled:opacity-50"
                    disabled={issuing || !issueForm.code.trim()}
                  >
                    {issuing ? "Issuing..." : "Issue code"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {pendingDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rs-modal-backdrop"
            onClick={() => setPendingDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="rs-modal max-w-md w-full p-0"
            >
              <div className="rs-modal-header">
                <div className="flex items-center gap-3">
                  <div
                    className="rs-icon-tile"
                    style={{
                      width: 32,
                      height: 32,
                      background: "rgba(239,68,68,0.10)",
                      border: "1px solid rgba(239,68,68,0.25)",
                    }}
                  >
                    <Trash2 className="w-4 h-4" style={{ color: "rgb(248,113,113)" }} />
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    Delete advisor code?
                  </h3>
                </div>
              </div>
              <div className="rs-modal-body space-y-3">
                <p
                  className="text-sm"
                  style={{ color: "var(--rs-text-secondary)" }}
                >
                  This permanently removes the code. Anyone still using it will
                  lose access on their next page load. This can't be undone.
                </p>
              </div>
              <div
                className="px-6 py-4 flex gap-2"
                style={{ borderTop: "1px solid var(--rs-border)" }}
              >
                <button
                  onClick={() => setPendingDeleteId(null)}
                  className="rs-btn-ghost flex-1 justify-center"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(pendingDeleteId)}
                  className="rs-btn-primary flex-1 justify-center"
                  style={{
                    background: "rgba(239,68,68,0.85)",
                    borderColor: "rgba(239,68,68,1)",
                  }}
                >
                  Delete code
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}