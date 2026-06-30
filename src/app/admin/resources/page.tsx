"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Trash2, FileText, Plus, Edit2, Eye, EyeOff, 
  X, Image as ImageIcon, File, Link as LinkIcon, Video
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDate } from "@/lib/utils";
import productLibraryData from "@/data/productLibrary.json";

const categories = [
  { value: "coaching_sheet", label: "Coaching" },
  { value: "catalog", label: "Catalogs" },
  { value: "price_list", label: "Price Lists" },
  { value: "products", label: "Products" },
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
  coaching_sheet: "bg-[var(--rs-accent-soft)] text-violet-400",
  catalog: "bg-[var(--rs-accent-soft)] text-violet-400",
  price_list: "bg-[var(--rs-accent-soft)] text-violet-400",
  products: "bg-[var(--rs-accent-soft)] text-violet-400",
  script: "bg-[var(--rs-accent-soft)] text-violet-400",
  creative: "bg-[var(--rs-accent-soft)] text-violet-400",
  legal: "bg-[var(--rs-accent-soft)] text-violet-400",
};

const statusFilters = [
  { value: "all", label: "All Resources" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

const productCategories = [
  { value: "apparel", label: "Apparel" },
  { value: "accessories", label: "Accessories" },
  { value: "packaging", label: "Packaging" },
  { value: "other", label: "Other" },
];

export default function AdminResourcesPage() {
  const resources = useQuery(api.admin.getAllResourcesAdmin);
  // Products from JSON file (same as user pages)
  const products = productLibraryData.products || [];
  
  const createResource = useMutation(api.admin.createResource);
  const updateResource = useMutation(api.admin.updateResource);
  const deleteResource = useMutation(api.admin.deleteResource);
  const publishResource = useMutation(api.admin.publishResource);
  const unpublishResource = useMutation(api.admin.unpublishResource);
  const createProduct = useMutation(api.products.createProduct);
  const updateProduct = useMutation(api.products.updateProduct);
  const deleteProduct = useMutation(api.products.deleteProduct);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productFormData, setProductFormData] = useState({
    name: "",
    description: "",
    category: "apparel",
    colors: [] as { name: string; imageUrl: string }[],
    pricing: { price50: 0, price100: 0, price500: 0, confirmed: false },
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fileUrl: "",
    fileType: "pdf" as "pdf" | "video" | "image" | "link",
    category: "coaching_sheet" as "coaching_sheet" | "catalog" | "price_list" | "products" | "script" | "creative" | "legal",
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

  const filteredProducts = useMemo(() => {
    return (products || []).filter((p: any) => 
      !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

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
      await updateResource({ id: editingResource._id, ...formData } as any);
    } else {
      await createResource(formData as any);
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

  const openProductModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      // Convert JSON format (.image) to form format (.imageUrl)
      const convertedColors = (product.colors || []).map((c: any) => ({
        name: c.name,
        imageUrl: c.image || c.imageUrl || "",
      }));
      setProductFormData({
        name: product.name,
        description: product.description || "",
        category: product.category || "apparel",
        colors: convertedColors,
        pricing: product.pricing || { price50: 0, price100: 0, price500: 0, confirmed: false },
      });
    } else {
      setEditingProduct(null);
      setProductFormData({
        name: "",
        description: "",
        category: "apparel",
        colors: [],
        pricing: { price50: 0, price100: 0, price500: 0, confirmed: false },
      });
    }
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      await updateProduct({ id: editingProduct._id, ...productFormData });
    } else {
      await createProduct(productFormData);
    }
    setShowProductModal(false);
  };

  const addProductColor = () => {
    setProductFormData({
      ...productFormData,
      colors: [...productFormData.colors, { name: "", imageUrl: "" }],
    });
  };

  const updateProductColor = (index: number, field: string, value: string) => {
    const newColors = [...productFormData.colors];
    (newColors[index] as any)[field] = value;
    setProductFormData({ ...productFormData, colors: newColors });
  };

  const removeProductColor = (index: number) => {
    setProductFormData({
      ...productFormData,
      colors: productFormData.colors.filter((_: any, i: number) => i !== index),
    });
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf": return <File className="w-7 h-7 text-red-400" />;
      case "video": return <Video className="w-7 h-7 text-purple-400" />;
      case "image": return <ImageIcon className="w-7 h-7 text-pink-400" />;
      case "link": return <LinkIcon className="w-7 h-7 text-blue-400" />;
      default: return <FileText className="w-7 h-7 text-gray-400" />;
    }
  };

  if (!resources) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--rs-bg-base)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: "var(--rs-accent)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rs-page-header flex items-center justify-between gap-4">
        <div>
          <span className="rs-overline">Admin</span>
          <h1 className="rs-page-title mt-1">Resources</h1>
          <p className="rs-page-subtitle">Manage and publish resources for affiliates</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="rs-btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Resource
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rs-card p-4">
          <p className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>Total Resources</p>
          <p className="rs-stat mt-1">{stats.total}</p>
        </div>
        <div className="rs-card p-4" style={{ borderColor: "rgba(16,185,129,0.25)" }}>
          <p className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>Published</p>
          <p className="rs-stat mt-1" style={{ color: "rgb(74,222,128)" }}>{stats.published}</p>
        </div>
        <div className="rs-card p-4" style={{ borderColor: "rgba(245,158,11,0.25)" }}>
          <p className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>Drafts</p>
          <p className="rs-stat mt-1" style={{ color: "rgb(251,191,36)" }}>{stats.drafts}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rs-input w-full pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rs-input md:w-48"
        >
          {statusFilters.map(filter => (
            <option key={filter.value} value={filter.value}>{filter.label}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rs-input md:w-48"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {categoryFilter === "products" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => openProductModal()}
              className="rs-btn-primary flex items-center gap-2"
              style={{ background: "rgb(234,88,12)", color: "white" }}
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rs-empty-state rs-card">
              <FileText className="rs-empty-state-icon" style={{ width: 48, height: 48 }} />
              <p className="rs-empty-state-title">No products yet</p>
              <p className="rs-empty-state-description">Add a product to get started.</p>
              <button
                onClick={() => openProductModal()}
                className="rs-btn-primary mt-4"
                style={{ background: "rgb(234,88,12)", color: "white" }}
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product: any) => (
                <motion.div
                  key={product.id}
                  className="rs-card rs-card-interactive overflow-hidden"
                >
                  <div className="flex items-center gap-4 p-4">
                    <div
                      className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
                      style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}
                    >
                      {product.colors?.[0]?.image ? (
                        <img src={product.colors[0].image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6" style={{ color: "var(--rs-text-muted)" }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{product.name}</h3>
                      <p className="text-sm" style={{ color: "var(--rs-text-muted)" }}>{product.colors?.length || 0} colors</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openProductModal(product)}
                        className="rs-btn-ghost p-2"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this product?")) {
                            deleteProduct({ id: product._id });
                          }
                        }}
                        className="rs-btn-ghost p-2"
                        style={{ color: "rgb(248,113,113)", background: "rgba(239,68,68,0.10)", borderColor: "rgba(239,68,68,0.20)" }}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {filteredResources.length === 0 ? (
            <div className="rs-empty-state rs-card">
              <FileText className="rs-empty-state-icon" style={{ width: 48, height: 48 }} />
              <p className="rs-empty-state-title">No resources found</p>
              <p className="rs-empty-state-description">Add your first resource to get started.</p>
              <button
                onClick={() => handleOpenModal()}
                className="rs-btn-primary mt-4"
              >
                Add Your First Resource
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((resource: any) => (
                <motion.div
                  key={resource._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rs-card rs-card-interactive p-6"
                  style={resource.isDraft ? { borderColor: "rgba(245,158,11,0.30)" } : undefined}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={
                        resource.fileType === "pdf"
                          ? { background: "rgba(239,68,68,0.10)" }
                          : resource.fileType === "video"
                          ? { background: "rgba(168,85,247,0.10)" }
                          : resource.fileType === "image"
                          ? { background: "rgba(236,72,153,0.10)" }
                          : { background: "rgba(59,130,246,0.10)" }
                      }
                    >
                      {getFileIcon(resource.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white truncate">{resource.title}</h3>
                        {resource.isDraft && (
                          <span
                            className="rs-pill"
                            style={{ background: "rgba(245,158,11,0.10)", color: "rgb(251,191,36)", borderColor: "rgba(245,158,11,0.25)" }}
                          >
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-1 line-clamp-2" style={{ color: "var(--rs-text-secondary)" }}>{resource.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--rs-border)" }}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="rs-pill"
                        style={{ background: "var(--rs-accent-soft)", color: "rgb(167,139,250)", borderColor: "rgba(167,139,250,0.25)" }}
                      >
                        {categories.find(c => c.value === resource.category)?.label}
                      </span>
                      <span className="text-xs" style={{ color: "var(--rs-text-muted)" }}>
                        {resource.downloadCount} downloads
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {resource.isDraft ? (
                        <button
                          onClick={() => handlePublish(resource)}
                          className="rs-btn-ghost p-2"
                          style={{ color: "rgb(74,222,128)", background: "rgba(16,185,129,0.10)", borderColor: "rgba(16,185,129,0.20)" }}
                          title="Publish"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnpublish(resource)}
                          className="rs-btn-ghost p-2"
                          style={{ color: "rgb(251,191,36)", background: "rgba(245,158,11,0.10)", borderColor: "rgba(245,158,11,0.20)" }}
                          title="Unpublish"
                        >
                          <EyeOff className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenModal(resource)}
                        className="rs-btn-ghost p-2"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(resource._id)}
                        className="rs-btn-ghost p-2"
                        style={{ color: "rgb(248,113,113)", background: "rgba(239,68,68,0.10)", borderColor: "rgba(239,68,68,0.20)" }}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs mt-2" style={{ color: "var(--rs-text-muted)" }}>
                    {resource.isDraft ? `Last updated: ${formatDate(resource.updatedAt || resource.createdAt)}` : `Published: ${formatDate(resource.createdAt)}`}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rs-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rs-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="rs-modal-header">
                <h2 className="text-xl font-semibold text-white">
                  {editingResource ? "Edit Resource" : "Add New Resource"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="rs-btn-ghost p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="rs-modal-body space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--rs-text-secondary)" }}>Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="rs-input w-full"
                    placeholder="Resource title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--rs-text-secondary)" }}>Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="rs-input rs-input--textarea w-full"
                    placeholder="Describe this resource..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--rs-text-secondary)" }}>File Type *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {fileTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, fileType: type.value as any })}
                          className="flex items-center justify-center gap-2 p-3 rounded-xl border text-sm transition-colors"
                          style={
                            formData.fileType === type.value
                              ? { borderColor: "var(--rs-accent)", background: "var(--rs-accent-soft)", color: "var(--rs-accent)" }
                              : { borderColor: "var(--rs-border)", color: "var(--rs-text-secondary)" }
                          }
                        >
                          <type.icon className="w-4 h-4" />
                          <span>{type.value.toUpperCase()}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--rs-text-secondary)" }}>Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="rs-input w-full"
                    >
                      {categories.filter(c => c.value !== "products").map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--rs-text-secondary)" }}>
                    {formData.fileType === "link" ? "Link URL *" : "File URL (optional)"}
                  </label>
                  <input
                    type="url"
                    required={formData.fileType === "link"}
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    className="rs-input w-full"
                    placeholder={formData.fileType === "link" ? "https://example.com" : "https://storage.example.com/file.pdf"}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!formData.isDraft}
                      onChange={(e) => setFormData({ ...formData, isDraft: !e.target.checked, isPublic: e.target.checked })}
                      className="w-5 h-5 rounded"
                      style={{ borderColor: "var(--rs-border)", background: "var(--rs-bg-base)" }}
                    />
                    <span className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>Publish immediately</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4" style={{ borderTop: "1px solid var(--rs-border)" }}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="rs-btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rs-btn-primary"
                  >
                    {editingResource ? "Save Changes" : "Create Resource"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProductModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rs-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowProductModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rs-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="rs-modal-header">
                <h2 className="text-xl font-semibold text-white">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="rs-btn-ghost p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="rs-modal-body space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--rs-text-secondary)" }}>Product Name *</label>
                  <input
                    type="text"
                    required
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    className="rs-input w-full"
                    placeholder="e.g. Workmen Tee"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--rs-text-secondary)" }}>Description</label>
                  <textarea
                    rows={2}
                    value={productFormData.description}
                    onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                    className="rs-input rs-input--textarea w-full"
                    placeholder="Product description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--rs-text-secondary)" }}>Category</label>
                  <select
                    value={productFormData.category}
                    onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                    className="rs-input w-full"
                  >
                    {productCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium" style={{ color: "var(--rs-text-secondary)" }}>Colors & Images</label>
                    <button
                      type="button"
                      onClick={addProductColor}
                      className="text-sm font-medium"
                      style={{ color: "rgb(251,146,60)" }}
                    >
                      + Add Color
                    </button>
                  </div>
                  <div className="space-y-2">
                    {productFormData.colors.map((color, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={color.name}
                          onChange={(e) => updateProductColor(index, "name", e.target.value)}
                          className="rs-input flex-1"
                          placeholder="Color name (e.g. Navy)"
                        />
                        <div
                          className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                          style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}
                        >
                          {color.imageUrl || (color as any).image ? (
                            <img src={color.imageUrl || (color as any).image} alt="preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 m-auto" style={{ color: "var(--rs-text-muted)" }} />
                          )}
                        </div>
                        <label className="rs-btn-ghost cursor-pointer text-xs">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  updateProductColor(index, "imageUrl", reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <span>Upload</span>
                        </label>
                        <input
                          type="url"
                          value={color.imageUrl}
                          onChange={(e) => updateProductColor(index, "imageUrl", e.target.value)}
                          className="rs-input flex-1"
                          placeholder="Or paste URL"
                        />
                        <button
                          type="button"
                          onClick={() => removeProductColor(index)}
                          className="rs-btn-ghost p-2"
                          style={{ color: "rgb(248,113,113)", background: "rgba(239,68,68,0.10)", borderColor: "rgba(239,68,68,0.20)" }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {productFormData.colors.length === 0 && (
                      <p className="text-sm" style={{ color: "var(--rs-text-muted)" }}>No colors added yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--rs-text-secondary)" }}>Pricing (ZAR)</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "50 pcs", key: "price50" as const },
                      { label: "100 pcs", key: "price100" as const },
                      { label: "500 pcs", key: "price500" as const },
                    ].map((tier) => (
                      <div key={tier.key}>
                        <label className="text-xs block mb-1" style={{ color: "var(--rs-text-muted)" }}>{tier.label}</label>
                        <input
                          type="number"
                          value={productFormData.pricing[tier.key]}
                          onChange={(e) => setProductFormData({
                            ...productFormData,
                            pricing: { ...productFormData.pricing, [tier.key]: Number(e.target.value) }
                          })}
                          className="rs-input w-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productFormData.pricing.confirmed}
                      onChange={(e) => setProductFormData({
                        ...productFormData,
                        pricing: { ...productFormData.pricing, confirmed: e.target.checked }
                      })}
                      className="w-5 h-5 rounded"
                      style={{ borderColor: "var(--rs-border)", background: "var(--rs-bg-base)" }}
                    />
                    <span className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>Pricing Confirmed</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4" style={{ borderTop: "1px solid var(--rs-border)" }}>
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="rs-btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rs-btn-primary"
                    style={{ background: "rgb(234,88,12)", color: "white" }}
                  >
                    {editingProduct ? "Save Changes" : "Create Product"}
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