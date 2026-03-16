"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Image, 
  Video, 
  Link as LinkIcon,
  Eye,
  File,
  Presentation
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDate } from "@/lib/utils";

const categories = [
  { id: "all", label: "All Resources", icon: File },
  { id: "coaching_sheet", label: "Coaching Sheets", icon: FileText },
  { id: "catalog", label: "Product Catalogs", icon: Presentation },
  { id: "price_list", label: "Price Lists", icon: FileText },
  { id: "script", label: "Scripts", icon: FileText },
  { id: "creative", label: "Marketing Materials", icon: Image },
  { id: "legal", label: "Legal/Templates", icon: File },
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

export default function ResourcesPage() {
  const resources = useQuery(api.resources.getResources);
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [previewResource, setPreviewResource] = useState<any>(null);

  if (!resources || !currentAffiliate) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
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
      <div>
        <h1 className="text-2xl font-bold text-white">Resources</h1>
        <p className="text-gray-400">Download sales materials and resources</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? "bg-blue-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((resource: any) => {
          const FileIcon = getFileIcon(resource.fileType);
          return (
            <motion.div
              key={resource._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => setPreviewResource(resource)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <FileIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{resource.title}</h3>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{resource.description}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs px-2 py-1 bg-white/10 rounded text-gray-400 capitalize">
                      {resource.category.replace("_", " ")}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(resource.createdAt)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No resources found</p>
        </div>
      )}

      {previewResource && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-white">{previewResource.title}</h2>
                <button
                  onClick={() => setPreviewResource(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-400 mb-4">{previewResource.description}</p>
              <div className="flex items-center gap-3">
                {previewResource.downloadUrl && (
                  <a
                    href={previewResource.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                )}
                {previewResource.viewUrl && (
                  <a
                    href={previewResource.viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
