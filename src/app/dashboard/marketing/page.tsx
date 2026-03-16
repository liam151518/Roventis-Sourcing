"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Link, 
  Plus, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode,
  Instagram,
  Linkedin,
  Mail,
  MousePointer,
  TrendingUp,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Share2
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatCurrency } from "@/lib/utils";

export default function MarketingPage() {
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate);
  const marketingLinks = useQuery(api.marketing.getMyMarketingLinks, { 
    affiliateId: currentAffiliate?._id as string 
  });
  const createLink = useMutation(api.marketing.createMarketingLink);
  const toggleLink = useMutation(api.marketing.toggleMarketingLink);
  const deleteLink = useMutation(api.marketing.deleteMarketingLink);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newLink, setNewLink] = useState({
    name: "",
    url: "https://roventis.co.za",
    category: "",
  });
  const [creating, setCreating] = useState(false);

  // Loading state
  if (currentAffiliate === null || marketingLinks === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalClicks = marketingLinks?.reduce((sum, l) => sum + l.clicks, 0) || 0;
  const totalConversions = marketingLinks?.reduce((sum, l) => sum + l.conversions, 0) || 0;

  const handleCreateLink = async () => {
    if (!currentAffiliate?._id || !newLink.name || !newLink.url) return;
    setCreating(true);
    try {
      await createLink({
        affiliateId: currentAffiliate._id,
        name: newLink.name,
        url: newLink.url,
        category: newLink.category || undefined,
      });
      setShowCreateModal(false);
      setNewLink({ name: "", url: "https://roventis.co.za", category: "" });
    } catch (error) {
      console.error("Failed to create link:", error);
    }
    setCreating(false);
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggle = async (linkId: string) => {
    try {
      await toggleLink({ linkId });
    } catch (error) {
      console.error("Failed to toggle link:", error);
    }
  };

  const handleDelete = async (linkId: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    try {
      await deleteLink({ linkId });
    } catch (error) {
      console.error("Failed to delete link:", error);
    }
  };

  const generateQRCodeUrl = (url: string) => {
    // Using a free QR code API
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  };

  const socialTemplates = [
    {
      platform: "Instagram",
      icon: Instagram,
      color: "from-pink-500 via-purple-500 to-orange-500",
      title: "Product Showcase",
      content: "Check out these amazing products from Roventis Sourcing! Great quality, competitive prices. Use my link: [YOUR_LINK]",
    },
    {
      platform: "LinkedIn",
      icon: Linkedin,
      color: "from-blue-600 to-blue-700",
      title: "Business Promo",
      content: "Looking for reliable sourcing? I've partnered with Roventis Sourcing - your trusted partner for quality products. Learn more: [YOUR_LINK]",
    },
    {
      platform: "Email",
      icon: Mail,
      color: "from-gray-600 to-gray-700",
      title: "Cold Outreach",
      content: "Hi,\n\nI came across your company and thought you might benefit from our sourcing services. We partner with businesses across SA to deliver quality products at competitive rates.\n\nWould you be interested in a quick call to discuss?\n\nBest regards",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketing</h1>
          <p className="text-gray-400">Generate links, QR codes, and share content</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Link
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111113] rounded-2xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <MousePointer className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-gray-400 text-sm">Total Clicks</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalClicks}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#111113] rounded-2xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-gray-400 text-sm">Conversions</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalConversions}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111113] rounded-2xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Link className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-gray-400 text-sm">Active Links</span>
          </div>
          <p className="text-2xl font-bold text-white">{marketingLinks?.filter(l => l.isActive).length || 0}</p>
        </motion.div>
      </div>

      {/* My Links */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">My Links</h2>
        {marketingLinks && marketingLinks.length > 0 ? (
          <div className="space-y-3">
            {marketingLinks.map((link, index) => (
              <motion.div
                key={link._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#111113] rounded-2xl p-5 border border-white/5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <Link className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold">{link.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs ${link.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-500/10 text-gray-400"}`}>
                          {link.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm truncate max-w-md">{link.url}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-gray-400 text-xs">Clicks</p>
                      <p className="text-white font-semibold">{link.clicks}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs">Conv.</p>
                      <p className="text-white font-semibold">{link.conversions}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(link.url, link._id)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      {copiedId === link._id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleToggle(link._id)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      {link.isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(link._id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* QR Code Preview */}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-lg p-1">
                    <img 
                      src={generateQRCodeUrl(link.url)} 
                      alt="QR Code" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm">Scan to test</p>
                    <p className="text-gray-500 text-xs mt-1">Share this QR code on print materials</p>
                  </div>
                  <button className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm transition-colors flex items-center gap-2">
                    <QrCode className="w-4 h-4" />
                    Download QR
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-[#111113] rounded-2xl p-12 border border-white/5 text-center">
            <Link className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No marketing links yet</p>
            <p className="text-gray-500 text-sm mb-4">Create your first link to start tracking</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Link
            </button>
          </div>
        )}
      </div>

      {/* Social Templates */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Social Media Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {socialTemplates.map((template, index) => (
            <motion.div
              key={template.platform}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#111113] rounded-2xl p-5 border border-white/5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center`}>
                  <template.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{template.platform}</h3>
                  <p className="text-gray-400 text-xs">{template.title}</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4 whitespace-pre-line line-clamp-6">{template.content}</p>
              <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                Copy Template
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create Link Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111113] rounded-2xl p-6 max-w-md w-full border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Create Marketing Link</h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Link Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Summer Sale Promo"
                    value={newLink.name}
                    onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Destination URL</label>
                  <input
                    type="url"
                    placeholder="https://roventis.co.za"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Category (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Solar, Workwear, Merchandise"
                    value={newLink.category}
                    onChange={(e) => setNewLink({ ...newLink, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateLink}
                  disabled={creating || !newLink.name || !newLink.url}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Link
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
