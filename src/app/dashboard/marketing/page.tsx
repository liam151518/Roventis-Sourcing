"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  RotateCcw,
  Edit3,
  Save,
  X,
  Plus,
  ChevronDown,
  ChevronRight,
  Trash2,
  Megaphone,
} from "lucide-react";

const defaultTemplates = [
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    accent: { bg: "rgba(236,72,153,0.10)", border: "rgba(236,72,153,0.25)", color: "#f472b6" },
    template:
      "I've partnered with Roventis Sourcing to bring you premium workwear, corporate merch, and solar solutions!\n\nQuality products at competitive prices\nFast delivery across South Africa\nProfessional service\n\nUse my affiliate link below for special deals!",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    accent: { bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.25)", color: "var(--rs-info)" },
    template:
      "Professional Collaboration Opportunity\n\nI'm excited to share that I'm now an affiliate partner with Roventis Sourcing:\n\n- Premium workwear and uniforms\n- Corporate merchandise\n- Solar solutions\n- Quality industrial supplies\n\nBased in South Africa. Drop me a message!",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: MessageCircle,
    accent: { bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.25)", color: "var(--rs-success)" },
    template:
      "Hi!\n\nI came across Roventis Sourcing and thought of you! They offer:\n\n- Workwear & uniforms\n- Corporate merchandise\n- Solar solutions\n- Great prices in SA\n\nI can share more details if you're interested!",
  },
  {
    id: "email",
    name: "Email",
    icon: Mail,
    accent: { bg: "var(--rs-bg-overlay)", border: "var(--rs-border)", color: "var(--rs-text-secondary)" },
    template:
      "Subject: Premium Workwear & Corporate Solutions in SA\n\nHi,\n\nI wanted to share a great resource for workwear, corporate merchandise, and solar solutions in South Africa.\n\nRoventis Sourcing offers:\n- Quality workwear and uniforms\n- Corporate branded merchandise\n- Solar panel solutions\n- Competitive pricing\n- Nationwide delivery\n\nAs an affiliate partner, I can help connect you with them.\n\nBest regards",
  },
];

interface CustomTemplate {
  id: string;
  name: string;
  content: string;
}

export default function MarketingPage() {
  const [templates, setTemplates] = useState(defaultTemplates);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(
    new Set(["instagram", "linkedin", "whatsapp", "email"])
  );
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", content: "" });
  const [customCollapsed, setCustomCollapsed] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("marketingTemplates");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = defaultTemplates.map((def) => ({
          ...def,
          template: parsed[def.id] || def.template,
        }));
        setTemplates(merged);
      } catch (e) {
        console.error("Failed to parse saved templates");
      }
    }

    const savedCustom = localStorage.getItem("customMarketingTemplates");
    if (savedCustom) {
      try {
        setCustomTemplates(JSON.parse(savedCustom));
      } catch (e) {
        console.error("Failed to parse custom templates");
      }
    }
  }, []);

  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startEditing = (template: (typeof defaultTemplates)[0]) => {
    setEditingId(template.id);
    setEditContent(template.template);
  };

  const saveEdit = (id: string) => {
    setSaving(id);
    const updated = templates.map((t) =>
      t.id === id ? { ...t, template: editContent } : t
    );
    setTemplates(updated);
    const toSave: Record<string, string> = {};
    updated.forEach((t) => {
      toSave[t.id] = t.template;
    });
    localStorage.setItem("marketingTemplates", JSON.stringify(toSave));
    setTimeout(() => {
      setSaving(null);
      setEditingId(null);
    }, 500);
  };

  const resetToDefault = (id: string) => {
    if (!confirm("Reset this template to default?")) return;
    const defaultTemplate = defaultTemplates.find((t) => t.id === id);
    if (!defaultTemplate) return;
    const updated = templates.map((t) =>
      t.id === id ? { ...t, template: defaultTemplate.template } : t
    );
    setTemplates(updated);
    const toSave: Record<string, string> = {};
    updated.forEach((t) => {
      toSave[t.id] = t.template;
    });
    localStorage.setItem("marketingTemplates", JSON.stringify(toSave));
  };

  const addCustomTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) return;
    const template: CustomTemplate = {
      id: `custom-${Date.now()}`,
      name: newTemplate.name,
      content: newTemplate.content,
    };
    const updated = [...customTemplates, template];
    setCustomTemplates(updated);
    localStorage.setItem("customMarketingTemplates", JSON.stringify(updated));
    setNewTemplate({ name: "", content: "" });
    setShowAddModal(false);
  };

  const deleteCustomTemplate = (id: string) => {
    if (!confirm("Delete this template?")) return;
    const updated = customTemplates.filter((t) => t.id !== id);
    setCustomTemplates(updated);
    localStorage.setItem("customMarketingTemplates", JSON.stringify(updated));
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="rs-overline">Marketing</span>
        <h1 className="rs-page-title text-2xl md:text-[28px] mt-1">
          Marketing Templates
        </h1>
        <p className="rs-page-subtitle">
          Customize and share promotional content across your channels.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Left Column - Default Templates */}
        <div className="space-y-3">
          {templates.map((template) => {
            const Icon = template.icon;
            const isEditing = editingId === template.id;
            const isCopied = copiedId === template.id;
            const isSaving = saving === template.id;
            const isCollapsed = collapsedIds.has(template.id);

            return (
              <div
                key={template.id}
                className="rs-card overflow-hidden"
              >
                <div
                  onClick={() => toggleCollapse(template.id)}
                  className="w-full flex items-center justify-between px-4 py-3 transition-colors cursor-pointer hover:bg-[var(--rs-bg-overlay)]"
                  style={{ borderBottom: isCollapsed ? "0" : "1px solid var(--rs-border)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{
                        background: template.accent.bg,
                        border: `1px solid ${template.accent.border}`,
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: template.accent.color }} />
                    </div>
                    <span className="text-sm font-medium text-white">
                      {template.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!isEditing && (
                      <div className="flex items-center gap-0.5 mr-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(template);
                          }}
                          className="p-1.5 rounded-md transition-colors hover:bg-[var(--rs-bg-overlay)]"
                          style={{ color: "var(--rs-text-muted)" }}
                          aria-label="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            resetToDefault(template.id);
                          }}
                          className="p-1.5 rounded-md transition-colors hover:bg-[var(--rs-bg-overlay)]"
                          style={{ color: "var(--rs-text-muted)" }}
                          aria-label="Reset"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    {isCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--rs-text-muted)" }} />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" style={{ color: "var(--rs-text-muted)" }} />
                    )}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 py-4 space-y-3">
                        {isEditing ? (
                          <>
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="rs-input rs-input--textarea"
                              style={{ minHeight: 160 }}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  setEditContent("");
                                }}
                                className="rs-btn-ghost flex-1 justify-center"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => saveEdit(template.id)}
                                disabled={isSaving}
                                className="rs-btn-primary flex-1 justify-center disabled:opacity-50"
                              >
                                <Save className="w-3.5 h-3.5" />
                                {isSaving ? "Saving..." : "Save"}
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div
                              className="rounded-lg p-3 min-h-[8rem]"
                              style={{
                                background: "var(--rs-bg-base)",
                                border: "1px solid var(--rs-border)",
                              }}
                            >
                              <p
                                className="text-sm whitespace-pre-wrap"
                                style={{ color: "var(--rs-text-secondary)" }}
                              >
                                {template.template}
                              </p>
                            </div>
                            <button
                              onClick={() => handleCopy(template.template, template.id)}
                              className="rs-btn-primary w-full justify-center"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" /> Copy Template
                                </>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Right Column - Custom Templates */}
        <div className="rs-card overflow-hidden h-fit">
          <div
            onClick={() => setCustomCollapsed(!customCollapsed)}
            className="w-full flex items-center justify-between px-4 py-3 transition-colors cursor-pointer hover:bg-[var(--rs-bg-overlay)]"
            style={{
              borderBottom: customCollapsed
                ? "0"
                : "1px solid var(--rs-border)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="rs-icon-tile rs-icon-tile--accent w-7 h-7">
                <Megaphone className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-medium text-white">Custom Templates</span>
              <span
                className="text-xs rs-pill"
                style={{ padding: "0.05rem 0.5rem" }}
              >
                {customTemplates.length}
              </span>
            </div>
            {customCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--rs-text-muted)" }} />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" style={{ color: "var(--rs-text-muted)" }} />
            )}
          </div>

          <AnimatePresence>
            {!customCollapsed && (
              <motion.div
                key="custom-templates"
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 py-4 space-y-2">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed rounded-lg text-xs transition-colors"
                    style={{
                      borderColor: "var(--rs-border)",
                      color: "var(--rs-text-muted)",
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Custom Template
                  </button>

                  {customTemplates.map((template) => {
                    const isCopied = copiedId === template.id;
                    return (
                      <div
                        key={template.id}
                        className="rounded-lg p-3"
                        style={{
                          background: "var(--rs-bg-base)",
                          border: "1px solid var(--rs-border)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">
                            {template.name}
                          </span>
                          <button
                            onClick={() => deleteCustomTemplate(template.id)}
                            className="p-1 rounded-md hover:bg-[var(--rs-bg-overlay)]"
                            style={{ color: "var(--rs-text-muted)" }}
                            aria-label="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div
                          className="text-xs whitespace-pre-wrap mb-2 max-h-24 overflow-y-auto"
                          style={{ color: "var(--rs-text-secondary)" }}
                        >
                          {template.content}
                        </div>
                        <button
                          onClick={() => handleCopy(template.content, template.id)}
                          className="rs-btn-ghost w-full justify-center"
                          style={{ height: 32 }}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}

                  {customTemplates.length === 0 && (
                    <div
                      className="text-xs text-center py-6"
                      style={{ color: "var(--rs-text-muted)" }}
                    >
                      No custom templates yet
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            key="add-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rs-modal-backdrop"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              key="add-modal-content"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="rs-modal max-w-md w-full p-0"
            >
              <div className="rs-modal-header">
                <h3 className="text-base font-semibold text-white">
                  Add Custom Template
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-md hover:bg-white/5 transition-colors"
                  style={{ color: "var(--rs-text-secondary)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="rs-modal-body space-y-3">
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--rs-text-secondary)" }}
                  >
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, name: e.target.value })
                    }
                    placeholder="e.g., Sales Call Script"
                    className="rs-input"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--rs-text-secondary)" }}
                  >
                    Content
                  </label>
                  <textarea
                    value={newTemplate.content}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, content: e.target.value })
                    }
                    placeholder="Enter your template..."
                    rows={6}
                    className="rs-input rs-input--textarea"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="rs-btn-ghost flex-1 justify-center"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addCustomTemplate}
                    className="rs-btn-primary flex-1 justify-center"
                  >
                    Add Template
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}