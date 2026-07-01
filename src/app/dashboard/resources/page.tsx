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
import ScriptsLibrary from "@/components/scripts/ScriptsLibrary";

const categories = [
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
  const [selectedCategory, setSelectedCategory] = useState("catalog");
  const [previewResource, setPreviewResource] = useState<any>(null);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  if (!resources || !currentAffiliate) {
    return (
      <div className="space-y-6">
        <div className="rs-skeleton h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rs-skeleton h-28" />
          <div className="rs-skeleton h-28" />
          <div className="rs-skeleton h-28" />
        </div>
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
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="rs-overline">Resources</span>
        <h1 className="rs-page-title text-2xl md:text-[28px] mt-1">
          Sales materials and resources
        </h1>
        <p className="rs-page-subtitle">
          Download catalogs, scripts, and creative assets for your outreach.
        </p>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: "var(--rs-text-muted)" }}
        />
        <input
          type="text"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rs-input rs-input--search"
          style={{ height: 42 }}
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? "text-white"
                : "hover:text-white"
            }`}
            style={{
              background:
                selectedCategory === cat.id
                  ? "var(--rs-accent-soft)"
                  : "var(--rs-bg-base)",
              border: `1px solid ${
                selectedCategory === cat.id
                  ? "var(--rs-text-accent)"
                  : "var(--rs-border)"
              }`,
              color:
                selectedCategory === cat.id
                  ? "var(--rs-text-accent)"
                  : "var(--rs-text-secondary)",
            }}
          >
            <cat.icon className="w-3.5 h-3.5" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* PRICE LIST SECTION */}
      {selectedCategory === "price_list" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rs-card overflow-hidden"
        >
          <table className="rs-table">
            <thead>
              <tr>
                <th>Product</th>
                <th className="text-center">50 pcs</th>
                <th className="text-center">100 pcs</th>
                <th className="text-center">500 pcs</th>
              </tr>
            </thead>
            <tbody>
              {(products || [])
                .filter(
                  (item) =>
                    !searchQuery ||
                    item.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="text-white font-medium">{item.name}</td>
                    <td className="text-center">
                      {item.pricing?.confirmed ? (
                        <span style={{ color: "var(--rs-warning)" }} className="font-semibold rs-stat">
                          {ZAR(item.pricing?.["50"] || item.pricing?.price50)}
                        </span>
                      ) : (
                        <span className="text-xs italic" style={{ color: "var(--rs-text-muted)" }}>
                          Coming Soon
                        </span>
                      )}
                    </td>
                    <td className="text-center">
                      {item.pricing?.confirmed ? (
                        <span style={{ color: "var(--rs-success)" }} className="font-semibold rs-stat">
                          {ZAR(item.pricing?.["100"] || item.pricing?.price100)}
                        </span>
                      ) : (
                        <span style={{ color: "var(--rs-text-muted)" }}>—</span>
                      )}
                    </td>
                    <td className="text-center">
                      {item.pricing?.confirmed ? (
                        <span style={{ color: "var(--rs-info)" }} className="font-semibold rs-stat">
                          {ZAR(item.pricing?.["500"] || item.pricing?.price500)}
                        </span>
                      ) : (
                        <span style={{ color: "var(--rs-text-muted)" }}>—</span>
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
              className="rs-card overflow-hidden"
            >
              {/* Product Header - Click to expand */}
              <button
                onClick={() => toggleProduct(product.id)}
                className="w-full flex items-center justify-between p-4 transition-colors hover:bg-[var(--rs-bg-overlay)]"
                style={{ borderBottom: expandedProducts.has(product.id) ? "1px solid var(--rs-border)" : "0" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--rs-bg-base)" }}
                  >
                    <img
                      src={product.colors?.[0]?.image || product.colors?.[0]?.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-white">{product.name}</h3>
                    <p className="text-xs" style={{ color: "var(--rs-text-muted)" }}>
                      {product.colors?.length || 0} color{(product.colors?.length || 0) > 1 ? "s" : ""} available
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${expandedProducts.has(product.id) ? "rotate-180" : ""}`}
                  style={{ color: "var(--rs-text-muted)" }}
                />
              </button>

              {/* Color Variants - Expanded */}
              <AnimatePresence>
                {expandedProducts.has(product.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {product.colors.map((color: any, colorIndex: number) => (
                        <div
                          key={colorIndex}
                          className="rounded-lg overflow-hidden transition-all"
                          style={{
                            background: "var(--rs-bg-base)",
                            border: "1px solid var(--rs-border)",
                          }}
                        >
                          <div className="h-44 p-1.5" style={{ background: "var(--rs-bg-base)" }}>
                            <img
                              src={color.image || color.imageUrl}
                              alt={`${product.name} - ${color.name}`}
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>
                          <div className="p-2" style={{ borderTop: "1px solid var(--rs-border)" }}>
                            <p className="text-xs text-white text-center truncate">{color.name}</p>
                            <a
                              href={color.image || color.imageUrl}
                              download
                              className="mt-2 flex items-center justify-center gap-1 w-full py-1.5 rounded text-xs transition-colors"
                              style={{
                                background: "var(--rs-accent-soft)",
                                color: "var(--rs-text-accent)",
                              }}
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

      {/* SCRIPTS SECTION */}
      {selectedCategory === "script" && (
        <ScriptsLibrary />
      )}

      {/* RESOURCES GRID (for other categories) */}
      {selectedCategory !== "script" && selectedCategory !== "price_list" && selectedCategory !== "product_images" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredResources.map((resource: any, index: number) => {
            const FileIcon = getFileIcon(resource.fileType);
            const accent =
              resource.fileType === "pdf"
                ? { bg: "rgba(239,68,68,0.10)", color: "var(--rs-danger)" }
                : resource.fileType === "video"
                  ? { bg: "var(--rs-accent-soft)", color: "var(--rs-text-accent)" }
                  : resource.fileType === "image"
                    ? { bg: "rgba(236,72,153,0.10)", color: "#f472b6" }
                    : { bg: "rgba(59,130,246,0.10)", color: "var(--rs-info)" };

            return (
              <motion.div
                key={resource._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rs-card p-5 cursor-pointer transition-all group"
                onClick={() => setPreviewResource(resource)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: accent.bg }}
                  >
                    <FileIcon className="w-5 h-5" style={{ color: accent.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white group-hover:text-[var(--rs-text-accent)] transition-colors truncate">
                      {resource.title}
                    </h3>
                    <p
                      className="text-xs mt-1 line-clamp-2"
                      style={{ color: "var(--rs-text-secondary)" }}
                    >
                      {resource.description}
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center justify-between mt-4 pt-3"
                  style={{ borderTop: "1px solid var(--rs-border)" }}
                >
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryColor(resource.category)}`}>
                    {resource.category.replace("_", " ")}
                  </span>
                  <div
                    className="flex items-center gap-1 text-xs"
                    style={{ color: "var(--rs-text-muted)" }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {resource.downloadCount}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* No results message */}
      {selectedCategory !== "script" && selectedCategory !== "price_list" && selectedCategory !== "product_images" && filteredResources.length === 0 && (
        <div className="rs-empty-state py-16">
          <div className="rs-empty-state-icon">
            <File className="w-5 h-5" />
          </div>
          <div className="rs-empty-state-title">No resources found</div>
          <div className="rs-empty-state-description">
            Try a different search term or category.
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewResource && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rs-modal-backdrop"
          onClick={() => setPreviewResource(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="rs-modal max-w-2xl w-full p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rs-modal-header">
              <div>
                <h2 className="text-base font-semibold text-white">{previewResource.title}</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--rs-text-muted)" }}>
                  Added {formatDate(previewResource.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setPreviewResource(null)}
                className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
                style={{ color: "var(--rs-text-secondary)" }}
                aria-label="Close"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="rs-modal-body space-y-4">
              <p className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>
                {previewResource.description}
              </p>
              <a
                href={previewResource.fileUrl}
                download
                className="rs-btn-primary w-full justify-center"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}