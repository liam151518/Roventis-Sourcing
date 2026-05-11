"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight,
  ChevronDown,
  Package,
  X
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { formatDate } from "@/lib/utils";
import productLibraryData from "@/data/productLibrary.json";
import CoachingCourse from "@/components/coaching/CoachingCourse";

const categories = [
  { id: "coaching_sheet", label: "Coaching", icon: FileText },
  { id: "catalog", label: "Catalogs", icon: Presentation },
  { id: "price_list", label: "Prices", icon: FileText },
  { id: "product_images", label: "Products", icon: Package },
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
    case "product_images": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
};

const ZAR = (amount: number): string => {
  return `R${amount.toLocaleString()}`;
};

export default function ResourcesPage() {
  const { userId } = useAuth();
  const resources = useQuery(api.resources.getResources, {});
  const currentAffiliate = useQuery(
    api.affiliates.getCurrentAffiliate,
    { clerkUserId: userId || undefined }
  );
  const products = productLibraryData.products || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("coaching_sheet");
  const [previewResource, setPreviewResource] = useState<any>(null);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

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
    const matchesCategory = r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter products by search
  const filteredProducts = (products || []).filter((p: any) => 
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle product accordion
  const toggleProduct = (productId: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="rs-overline">Resources</span>
        <h1 className="rs-page-title">Download sales materials and resources</h1>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-[#141417] border border-white/5 rounded-[14px] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setSearchQuery("");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-[14px] text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? "bg-orange-600 text-white"
                : "bg-[#141417] text-gray-400 hover:text-white border border-white/5 hover:border-white/10"
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* PRICE LIST SECTION */}
      {selectedCategory === "price_list" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rs-card-[14px] border border-white/5 overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-sm font-medium text-gray-400">Product</th>
                <th className="text-center p-4 text-sm font-medium text-gray-400">50 pcs</th>
                <th className="text-center p-4 text-sm font-medium text-gray-400">100 pcs</th>
                <th className="text-center p-4 text-sm font-medium text-gray-400">500 pcs</th>
              </tr>
            </thead>
            <tbody>
              {(products || [])
                .filter(item => !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item: any, index: number) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 text-white font-medium">{item.name}</td>
                    <td className="p-4 text-center">
                      {item.pricing?.confirmed ? (
                        <span className="text-orange-400 font-semibold">{ZAR(item.pricing?.["50"] || item.pricing?.price50)}</span>
                      ) : (
                        <span className="text-gray-500 italic">Coming Soon</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {item.pricing?.confirmed ? (
                        <span className="text-green-400 font-semibold">{ZAR(item.pricing?.["100"] || item.pricing?.price100)}</span>
                      ) : (
                        <span className="text-gray-500 italic">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {item.pricing?.confirmed ? (
                        <span className="text-blue-400 font-semibold">{ZAR(item.pricing?.["500"] || item.pricing?.price500)}</span>
                      ) : (
                        <span className="text-gray-500 italic">-</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* PRODUCT IMAGES SECTION */}
      {selectedCategory === "product_images" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {filteredProducts.map((product: any) => (
            <div
              key={product.id}
              className="rs-card-xl border border-white/5 overflow-hidden"
            >
              {/* Product Header - Click to expand */}
              <button
                onClick={() => toggleProduct(product.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white/5 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={product.colors?.[0]?.image || product.colors?.[0]?.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-semibold">{product.name}</h3>
                    <p className="text-gray-500 text-sm">{product.colors?.length || 0} color{(product.colors?.length || 0) > 1 ? 's' : ''} available</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedProducts.has(product.id) ? 'rotate-180' : ''}`} />
              </button>

              {/* Color Variants - Expanded */}
              <AnimatePresence>
                {expandedProducts.has(product.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5"
                  >
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {product.colors.map((color: any, colorIndex: number) => (
                        <div
                          key={colorIndex}
                          className="bg-white/5 rounded-lg overflow-hidden hover:ring-2 hover:ring-orange-500/50 transition-all"
                        >
                          <div className="h-56 bg-white/5 p-2">
                            <img
                              src={color.image || color.imageUrl}
                              alt={`${product.name} - ${color.name}`}
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>
                          <div className="p-2 border-t border-white/5">
                            <p className="text-sm text-white text-center truncate">{color.name}</p>
                            <a
                              href={color.image || color.imageUrl}
                              download
                              className="mt-2 flex items-center justify-center gap-1 w-full py-1.5 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 rounded text-xs transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      )}

      {/* COACHING SECTION */}
      {selectedCategory === "coaching_sheet" && (
        <CoachingCourse />
      )}

      {/* RESOURCES GRID (for non-coaching categories) */}
      {selectedCategory !== "coaching_sheet" && selectedCategory !== "price_list" && selectedCategory !== "product_images" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource: any, index: number) => {
            const FileIcon = getFileIcon(resource.fileType);
            
            return (
              <motion.div
                key={resource._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group rs-card-[14px] border border-white/5 p-6 hover:border-white/10 transition-all hover:shadow-lg hover:shadow-black/20 cursor-pointer"
                onClick={() => setPreviewResource(resource)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-[14px] flex items-center justify-center ${
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
                    <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors truncate">
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
      )}

      {/* No results message */}
      {selectedCategory !== "coaching_sheet" && selectedCategory !== "price_list" && selectedCategory !== "product_images" && filteredResources.length === 0 && (
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
            className="rs-card-[14px] border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-6 border-b border-white/5">
              <div>
                <h2 className="text-xl font-semibold text-white">{previewResource.title}</h2>
                <p className="text-gray-500 text-sm mt-1">Added {formatDate(previewResource.createdAt)}</p>
              </div>
              <button
                onClick={() => setPreviewResource(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-300">{previewResource.description}</p>
              <a
                href={previewResource.fileUrl}
                download
                className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-orange-600 text-white rounded-[14px] hover:bg-orange-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}