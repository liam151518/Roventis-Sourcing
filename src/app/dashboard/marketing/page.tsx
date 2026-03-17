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
  Trash2
} from "lucide-react";

const defaultTemplates = [
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "bg-pink-600",
    template: "I've partnered with Roventis Sourcing to bring you premium workwear, corporate merch, and solar solutions!\n\nQuality products at competitive prices\nFast delivery across South Africa\nProfessional service\n\nUse my affiliate link below for special deals!",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "bg-blue-700",
    template: "Professional Collaboration Opportunity\n\nI'm excited to share that I'm now an affiliate partner with Roventis Sourcing:\n\n- Premium workwear and uniforms\n- Corporate merchandise\n- Solar solutions\n- Quality industrial supplies\n\nBased in South Africa. Drop me a message!",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: MessageCircle,
    color: "bg-green-600",
    template: "Hi!\n\nI came across Roventis Sourcing and thought of you! They offer:\n\n- Workwear & uniforms\n- Corporate merchandise\n- Solar solutions\n- Great prices in SA\n\nI can share more details if you're interested!",
  },
  {
    id: "email",
    name: "Email",
    icon: Mail,
    color: "bg-gray-600",
    template: "Subject: Premium Workwear & Corporate Solutions in SA\n\nHi,\n\nI wanted to share a great resource for workwear, corporate merchandise, and solar solutions in South Africa.\n\nRoventis Sourcing offers:\n- Quality workwear and uniforms\n- Corporate branded merchandise\n- Solar panel solutions\n- Competitive pricing\n- Nationwide delivery\n\nAs an affiliate partner, I can help connect you with them.\n\nBest regards",
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
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set(["instagram", "linkedin", "whatsapp", "email"]));
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", content: "" });
  const [customCollapsed, setCustomCollapsed] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("marketingTemplates");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = defaultTemplates.map(def => ({
          ...def,
          template: parsed[def.id] || def.template
        }));
        setTemplates(merged);
      } catch (e) { console.error("Failed to parse saved templates"); }
    }
    
    const savedCustom = localStorage.getItem("customMarketingTemplates");
    if (savedCustom) {
      try { setCustomTemplates(JSON.parse(savedCustom)); } 
      catch (e) { console.error("Failed to parse custom templates"); }
    }
  }, []);

  const toggleCollapse = (id: string) => {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } 
      else { next.add(id); }
      return next;
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startEditing = (template: typeof defaultTemplates[0]) => {
    setEditingId(template.id);
    setEditContent(template.template);
  };

  const saveEdit = (id: string) => {
    setSaving(id);
    const updated = templates.map(t => t.id === id ? { ...t, template: editContent } : t);
    setTemplates(updated);
    const toSave: Record<string, string> = {};
    updated.forEach(t => { toSave[t.id] = t.template; });
    localStorage.setItem("marketingTemplates", JSON.stringify(toSave));
    setTimeout(() => { setSaving(null); setEditingId(null); }, 500);
  };

  const resetToDefault = (id: string) => {
    if (!confirm("Reset this template to default?")) return;
    const defaultTemplate = defaultTemplates.find(t => t.id === id);
    if (!defaultTemplate) return;
    const updated = templates.map(t => t.id === id ? { ...t, template: defaultTemplate.template } : t);
    setTemplates(updated);
    const toSave: Record<string, string> = {};
    updated.forEach(t => { toSave[t.id] = t.template; });
    localStorage.setItem("marketingTemplates", JSON.stringify(toSave));
  };

  const addCustomTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) return;
    const template: CustomTemplate = { id: `custom-${Date.now()}`, name: newTemplate.name, content: newTemplate.content };
    const updated = [...customTemplates, template];
    setCustomTemplates(updated);
    localStorage.setItem("customMarketingTemplates", JSON.stringify(updated));
    setNewTemplate({ name: "", content: "" });
    setShowAddModal(false);
  };

  const deleteCustomTemplate = (id: string) => {
    if (!confirm("Delete this template?")) return;
    const updated = customTemplates.filter(t => t.id !== id);
    setCustomTemplates(updated);
    localStorage.setItem("customMarketingTemplates", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen p-6 -mx-6">
      {/* Header - matching other pages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-semibold text-white">Marketing Templates</h1>
        <p className="text-gray-500 mt-1">Customize and share promotional content</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Default Templates */}
        <div className="space-y-3">
          {templates.map((template, index) => {
            const Icon = template.icon;
            const isEditing = editingId === template.id;
            const isCopied = copiedId === template.id;
            const isSaving = saving === template.id;
            const isCollapsed = collapsedIds.has(template.id);
            
            return (
                <div key={template.id} className="bg-[#0a0a0b] rounded-lg border border-white/10 overflow-hidden">
                <div
                  onClick={() => toggleCollapse(template.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 ${template.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium">{template.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditing && (
                      <div className="flex items-center gap-1 mr-2">
                        <button onClick={(e) => { e.stopPropagation(); startEditing(template); }} className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-white/10">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); resetToDefault(template.id); }} className="p-1.5 text-gray-500 hover:text-amber-400 rounded-lg hover:bg-amber-400/10">
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    {isCollapsed ? <ChevronRight className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
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
                      className="px-4 pb-4 overflow-hidden"
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full h-40 px-3 py-2 bg-[#141417] border border-white/10 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-blue-500 resize-none" />
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingId(null); setEditContent(""); }} className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm rounded-lg">Cancel</button>
                            <button onClick={() => saveEdit(template.id)} disabled={isSaving} className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">{isSaving ? "Saving..." : "Save"}</button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="bg-[#141417] rounded-lg p-3 min-h-[8rem] border border-white/5">
                            <p className="text-gray-400 text-sm whitespace-pre-wrap">{template.template}</p>
                          </div>
                          <button onClick={() => handleCopy(template.template, template.id)} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">
                            {isCopied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Template</>}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Right Column - Custom Templates */}
        <div className="bg-[#0a0a0b] rounded-lg border border-white/10 overflow-hidden h-fit">
          <div onClick={() => setCustomCollapsed(!customCollapsed)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-medium">Custom Templates</span>
              <span className="text-xs text-gray-500">({customTemplates.length})</span>
            </div>
            {customCollapsed ? <ChevronRight className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </div>

          <AnimatePresence>
            {!customCollapsed && (
              <motion.div key="custom-templates" initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="px-4 pb-4">
                <button onClick={() => setShowAddModal(true)} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-dashed border-white/20 hover:border-white/40 text-gray-400 hover:text-white text-sm rounded-lg transition-colors mb-3">
                  <Plus className="w-4 h-4" />
                  Add Custom Template
                </button>

                {customTemplates.map((template) => {
                  const isCopied = copiedId === template.id;
                  return (
                    <div key={template.id} className="bg-[#141417] rounded-lg p-3 mb-2 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm font-medium">{template.name}</span>
                        <button onClick={() => deleteCustomTemplate(template.id)} className="p-1 text-gray-500 hover:text-red-400 rounded">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-gray-400 text-xs whitespace-pre-wrap mb-2 max-h-24 overflow-y-auto">{template.content}</div>
                      <button onClick={() => handleCopy(template.content, template.id)} className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs rounded-lg">
                        {isCopied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                      </button>
                    </div>
                  );
                })}

                {customTemplates.length === 0 && <p className="text-gray-500 text-sm text-center py-6">No custom templates yet</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div key="add-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
            <motion.div key="add-modal-content" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-[#111113] rounded-xl p-5 w-full max-w-md border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Add Custom Template</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Template Name</label>
                  <input type="text" value={newTemplate.name} onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })} placeholder="e.g., Sales Call Script" className="w-full px-3 py-2 bg-[#0a0a0b] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Content</label>
                  <textarea value={newTemplate.content} onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })} placeholder="Enter your template..." rows={6} className="w-full px-3 py-2 bg-[#0a0a0b] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm rounded-lg">Cancel</button>
                <button onClick={addCustomTemplate} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">Add Template</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
