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
import { useDemoData } from "@/lib/demo-data";
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
  const { resources } = useDemoData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [previewResource, setPreviewResource] = useState<typeof resources[0] | null>(null);

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Resource Library</h1>
          <p className="text-gray-500">Download sales materials, catalogs, and resources</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource, index) => {
          const Icon = getFileIcon(resource.fileType);
          
          return (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-primary truncate">{resource.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{resource.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  {resource.downloadCount} downloads
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewResource(resource)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No resources found</h3>
          <p className="text-gray-500">Try adjusting your search or filter</p>
        </div>
      )}

      {/* Preview Modal */}
      {previewResource && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewResource(null)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-primary">{previewResource.title}</h2>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4">{previewResource.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Category</span>
                  <p className="font-medium capitalize">{previewResource.category.replace("_", " ")}</p>
                </div>
                <div>
                  <span className="text-gray-500">Type</span>
                  <p className="font-medium uppercase">{previewResource.fileType}</p>
                </div>
                <div>
                  <span className="text-gray-500">Downloads</span>
                  <p className="font-medium">{previewResource.downloadCount}</p>
                </div>
                <div>
                  <span className="text-gray-500">Added</span>
                  <p className="font-medium">{formatDate(previewResource.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setPreviewResource(null)}
                className="px-5 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-5 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-400 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
