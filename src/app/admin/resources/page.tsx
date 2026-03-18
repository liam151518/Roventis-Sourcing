"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Trash2, FileText, Plus, Edit2, Eye, EyeOff, 
  Upload, X, Image as ImageIcon, File, Link as LinkIcon, Video
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDate } from "@/lib/utils";

const categories = [
  { value: "coaching_sheet", label: "Coaching" },
  { value: "catalog", label: "Catalogs" },
  { value: "price_list", label: "Price Lists" },
  { value: "script", label: "Scripts" },
  { value: "creative", label: "Marketing" },
  { value: "legal", label: "Legal" },
];

const fileTypes = [
  { value: "pdf", label: "PDF Document", icon: File },
  { value: "image", label: "Image (PNG, JPEG)", icon: ImageIcon },
  { value: "video", label: "Video", icon: Video },
  { value: "link", label: "External Link", icon: LinkIcon },
];

const categoryColors: Record<string, string> = {
  coaching_sheet: "bg-blue-500/20 text-blue-400",
  catalog: "bg-purple-500/20 text-purple-400",
  price_list: "bg-emerald-500/20 text-emerald-400",
  script: "bg-amber-500/20 text-amber-400",
  creative: "bg-pink-500/20 text-pink-400",
  legal: "bg-slate-500/20 text-slate-400",
};

const statusFilters = [
  { value: "all", label: "All Resources" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

export default function AdminResourcesPage() {
  const resources = useQuery(api.admin.getAllResourcesAdmin);
  const createResource = useMutation(api.admin.createResource);
  const updateResource = useMutation(api.admin.updateResource);
  const deleteResource = useMutation(api.admin.deleteResource);
  const publishResource = useMutation(api.admin.publishResource);
  const unpublishResource = useMutation(api.admin.unpublishResource);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fileUrl: "",
    fileType: "pdf" as "pdf" | "video" | "image" | "link",
    category: "coaching_sheet" as "coaching_sheet" | "catalog" | "price_list" | "script" | "creative" | "legal",
    isPublic: true,
    isDraft: true,
  });

  const filteredResources = useMemo(() => {
    return (resources || []).filter((resource: any) => {
      const matchesSearch = 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || resource.category === categoryFilter;
      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "draft" && resource.isDraft) ||
        (statusFilter === "published" && !resource.isDraft);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [resources, searchQuery, categoryFilter, statusFilter]);

  const stats = useMemo(() => {
    const all = resources || [];
    return {
      total: all.length,
      published: all.filter((r: any) => !r.isDraft).length,
      drafts: all.filter((r: any) => r.isDraft).length,
    };
  }, [resources]);

  const handleOpenModal = (resource?: any) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({
        title: resource.title,
        description: resource.description,
        fileUrl: resource.fileUrl || "",
        fileType: resource.fileType,
        category: resource.category,
        isPublic: resource.isPublic,
        isDraft: resource.isDraft,
      });
    } else {
      setEditingResource(null);
      setFormData({
        title: "",
        description: "",
        fileUrl: "",
        fileType: "pdf",
        category: "coaching_sheet",
        isPublic: true,
        isDraft: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingResource(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingResource) {
      await updateResource({
        id: editingResource._id,
        ...formData,
      });
    } else {
      await createResource(formData);
    }
    
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      await deleteResource({ id });
    }
  };

  const handlePublish = async (resource: any) => {
    await publishResource({ id: resource._id });
  };

  const handleUnpublish = async (resource: any) => {
    await unpublishResource({ id: resource._id });
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return <File className="w-7 h-7 text-red-400" />;
      case "video":
        return <Video className="w-7 h-7 text-purple-400" />;
      case "image":
        return <ImageIcon className="w-7 h-7 text-pink-400" />;
      case "link":
        return <LinkIcon className="w-7 h-7 text-blue-400" />;
      default:
        return <FileText className="w-7 h-7 text-gray-400" />;
    }
  };

  if (!resources) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Resources</h1>
          <p className="text-gray-500 mt-1">Manage and publish resources for affiliates</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Resource
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#141417] rounded-2xl border border-white/5 p-4">
          <p className="text-gray-400 text-sm">Total Resources</p>
          <p className="text-2xl font-semibold text-white">{stats.total}</p>
        </div>
        <div className="bg-[#141417] rounded-2xl border border-green-500/20 p-4">
          <p className="text-gray-400 text-sm">Published</p>
          <p className="text-2xl font-semibold text-green-400">{stats.published}</p>
        </div>
        <div className="bg-[#141417] rounded-2xl border border-yellow-500/20 p-4">
          <p className="text-gray-400 text-sm">Drafts</p>
          <p className="text-2xl font-semibold text-yellow-400">{stats.drafts}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#141417] border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-[#141417] border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          {statusFilters.map(filter => (
            <option key={filter.value} value={filter.value}>{filter.label}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 bg-[#141417] border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((resource: any) => (
          <motion.div
            key={resource._id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-[#141417] rounded-2xl border p-6 hover:border-white/10 transition-colors ${
              resource.isDraft ? "border-yellow-500/30" : "border-white/5"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                resource.fileType === "pdf" ? "bg-red-500/10" :
                resource.fileType === "video" ? "bg-purple-500/10" :
                resource.fileType === "image" ? "bg-pink-500/10" :
                "bg-blue-500/10"
              }`}>
                {getFileIcon(resource.fileType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white truncate">{resource.title}</h3>
                  {resource.isDraft && (
                    <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                      Draft
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{resource.description}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-3 py-1 rounded-full ${categoryColors[resource.category]}`}>
                  {categories.find(c => c.value === resource.category)?.label}
                </span>
                <span className="text-xs text-gray-500">
                  {resource.downloadCount} downloads
                </span>
              </div>
              <div className="flex items-center gap-1">
                {resource.isDraft ? (
                  <button
                    onClick={() => handlePublish(resource)}
                    className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                    title="Publish"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnpublish(resource)}
                    className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                    title="Unpublish"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleOpenModal(resource)}
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(resource._id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {resource.isDraft ? `Last updated: ${formatDate(resource.updatedAt || resource.createdAt)}` : `Published: ${formatDate(resource.createdAt)}`}
            </p>
          </motion.div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No resources found</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
          >
            Add Your First Resource
          </button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141417] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-xl font-semibold text-white">
                  {editingResource ? "Edit Resource" : "Add New Resource"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Resource title"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                    placeholder="Describe this resource..."
                  />
                </div>

                {/* File Type & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      File Type *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {fileTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, fileType: type.value as any })}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors ${
                            formData.fileType === type.value
                              ? "border-blue-500 bg-blue-500/10 text-blue-400"
                              : "border-white/10 text-gray-400 hover:border-white/20"
                          }`}
                        >
                          <type.icon className="w-4 h-4" />
                          <span className="text-sm">{type.value.toUpperCase()}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* File URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {formData.fileType === "link" ? "Link URL *" : "File URL (optional)"}
                  </label>
                  <input
                    type="url"
                    required={formData.fileType === "link"}
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder={formData.fileType === "link" ? "https://example.com" : "https://storage.example.com/file.pdf"}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.fileType === "link" 
                      ? "Enter the URL users will be redirected to"
                      : "Upload file to your storage and paste the URL here"}
                  </p>
                </div>

                {/* Draft/Publish Toggle */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!formData.isDraft}
                      onChange={(e) => setFormData({ ...formData, isDraft: !e.target.checked, isPublic: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 bg-black/30 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">
                      Publish immediately (make visible to users)
                    </span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
                  >
                    {editingResource ? "Save Changes" : "Create Resource"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
