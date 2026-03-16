"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Download, 
  FileText, 
  Image, 
  Video, 
  Link as LinkIcon,
  Eye,
  File,
  Presentation,
  Filter,
  ChevronRight
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDate } from "@/lib/utils";

const categories = [
  { id: "all", label: "All Resources", icon: File },
  { id: "coaching_sheet", label: "Coaching", icon: FileText },
  { id: "catalog", label: "Catalogs", icon: Presentation },
  { id: "price_list", label: "Price Lists", icon: FileText },
  { id: "script", label: "Scripts", icon: FileText },
  { id: "creative", label: "Marketing", icon: Image },
  { id: "legal", label: "Legal", icon: File },
];

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf": return FileText;
    case "video": return Video;
    case "image": return Image;
    case "link": return LinkIcon;
    default: return File;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "coaching_sheet": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "catalog": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "price_list": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "script": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "creative": return "bg-pink-500/10 text-pink-400 border-pink-500/20";
    case "legal": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
};

export default function ResourcesPage() {
  const resources = useQuery(api.resources.getResources);
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [previewResource, setPreviewResource] = useState<any>(null);

  if (!resources || !currentAffiliate) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const filteredResources = (resources || []).filter((r: any) => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold text-white">Resources</h1>
          <p className="text-gray-500 mt-1">Download sales materials and resources</p>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#141417] border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white"
                  : "bg-[#141417] text-gray-400 hover:text-white border border-white/5 hover:border-white/10"
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((resource: any, index: number) => {
          const FileIcon = getFileIcon(resource.fileType);
          
          return (
            <motion.div
              key={resource._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-[#141417] rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all hover:shadow-lg hover:shadow-black/20 cursor-pointer"
              onClick={() => setPreviewResource(resource)}
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  resource.fileType === "pdf" ? "bg-red-500/10" :
                  resource.fileType === "video" ? "bg-purple-500/10" :
                  resource.fileType === "image" ? "bg-pink-500/10" :
                  "bg-blue-500/10"
                }`}>
                  <FileIcon className={`w-7 h-7 ${
                    resource.fileType === "pdf" ? "text-red-400" :
                    resource.fileType === "video" ? "text-purple-400" :
                    resource.fileType === "image" ? "text-pink-400" :
                    "text-blue-400"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{resource.description}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <span className={`text-xs px-3 py-1 rounded-full border ${getCategoryColor(resource.category)}`}>
                  {resource.category.replace("_", " ")}
                </span>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Download className="w-4 h-4" />
                  {resource.downloadCount}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-16">
          <File className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No resources found</p>
        </div>
      )}

      {/* Preview Modal */}
      {previewResource && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewResource(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#141417] rounded-2xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-6 border-b border-white/5">
              <div>
                <h2 className="text-xl font-semibold text-white">{previewResource.title}</h2>
                <p className="text-gray-500 text-sm mt-1">Added {formatDate(previewResource.createdAt)}</p>
              </div>
              <button
                onClick={() => setPreviewResource(null)}
                className="p-2 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <p className="text-gray-300">{previewResource.description}</p>
              
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full border ${getCategoryColor(previewResource.category)}`}>
                  {previewResource.category.replace("_", " ")}
                </span>
                <span className="text-xs text-gray-500">
                  {previewResource.downloadCount} downloads
                </span>
              </div>
              
              <div className="flex gap-3">
                {previewResource.fileUrl && (
                  <a
                    href={previewResource.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </a>
                )}
                {previewResource.viewUrl && (
                  <a
                    href={previewResource.viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3 bg-[#0a0a0b] border border-white/10 text-white rounded-xl font-medium hover:bg-white/5 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                    Preview
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
