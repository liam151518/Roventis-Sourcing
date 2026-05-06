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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="rs-overline">Admin</p>
          <h1 className="rs-page-title">Resources</h1>
          <p className="text-gray-500 mt-1">Manage and publish resources for affiliates</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 rs-btn-primary transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Resource
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rs-card p-4">
          <p className="text-gray-400 text-sm">Total Resources</p>
          <p className="text-2xl font-semibold text-white">{stats.total}</p>
        </div>
        <div className="rs-card p-4" style={{ borderColor: 'var(--rs-success)', borderWidth: 1 }}>
          <p className="text-gray-400 text-sm">Published</p>
          <p className="text-2xl font-semibold text-green-400">{stats.published}</p>
        </div>
        <div className="rs-card p-4" style={{ borderColor: 'var(--rs-warning)', borderWidth: 1 }}>
          <p className="text-gray-400 text-sm">Drafts</p>
          <p className="text-2xl font-semibold text-yellow-400">{stats.drafts}</p>
        </div>
      </div>

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

      {categoryFilter === "products" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => openProductModal()}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">No products yet</p>
              <button
                onClick={() => openProductModal()}
                className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-medium transition-colors"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product: any) => (
                <motion.div
                  key={product.id}
                  className="rs-card overflow-hidden"
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                      {product.colors?.[0]?.image ? (
                        <img src={product.colors[0].image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.colors?.length || 0} colors</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openProductModal(product)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this product?")) {
                            deleteProduct({ id: product._id });
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
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
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">No resources found</p>
              <button
                onClick={() => handleOpenModal()}
                className="mt-4 px-4 py-2 rs-btn-primary transition-colors"
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
                  className={`bg-[#141417] rounded-[14px] border p-6 hover:border-white/10 transition-colors ${
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
          )}
        </div>
      )}

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
              className="bg-[#141417] border border-white/10 rounded-[14px] w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Resource title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                    placeholder="Describe this resource..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">File Type *</label>
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      {categories.filter(c => c.value !== "products").map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

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
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!formData.isDraft}
                      onChange={(e) => setFormData({ ...formData, isDraft: !e.target.checked, isPublic: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 bg-black/30 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">Publish immediately</span>
                  </label>
                </div>

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
                    className="px-6 py-2 rs-btn-primary transition-colors"
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
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setShowProductModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141417] border border-white/10 rounded-[14px] w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-xl font-semibold text-white">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    placeholder="e.g. Workmen Tee"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    rows={2}
                    value={productFormData.description}
                    onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                    placeholder="Product description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={productFormData.category}
                    onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  >
                    {productCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-300">Colors & Images</label>
                    <button
                      type="button"
                      onClick={addProductColor}
                      className="text-sm text-orange-400 hover:text-orange-300"
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
                          className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm"
                          placeholder="Color name (e.g. Navy)"
                        />
                        {/* Image Preview */}
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                          {color.imageUrl || (color as any).image ? (
                            <img src={color.imageUrl || (color as any).image} alt="preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-600 m-auto" />
                          )}
                        </div>
                        <label className="px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-gray-400 cursor-pointer hover:bg-black/50">
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
                          <span className="text-xs">Upload</span>
                        </label>
                        <input
                          type="url"
                          value={color.imageUrl}
                          onChange={(e) => updateProductColor(index, "imageUrl", e.target.value)}
                          className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm"
                          placeholder="Or paste URL"
                        />
                        <button
                          type="button"
                          onClick={() => removeProductColor(index)}
                          className="p-2 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {productFormData.colors.length === 0 && (
                      <p className="text-gray-500 text-sm">No colors added yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Pricing (ZAR)</label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-500">50 pcs</label>
                      <input
                        type="number"
                        value={productFormData.pricing.price50}
                        onChange={(e) => setProductFormData({ 
                          ...productFormData, 
                          pricing: { ...productFormData.pricing, price50: Number(e.target.value) } 
                        })}
                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">100 pcs</label>
                      <input
                        type="number"
                        value={productFormData.pricing.price100}
                        onChange={(e) => setProductFormData({ 
                          ...productFormData, 
                          pricing: { ...productFormData.pricing, price100: Number(e.target.value) } 
                        })}
                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">500 pcs</label>
                      <input
                        type="number"
                        value={productFormData.pricing.price500}
                        onChange={(e) => setProductFormData({ 
                          ...productFormData, 
                          pricing: { ...productFormData.pricing, price500: Number(e.target.value) } 
                        })}
                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white"
                      />
                    </div>
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
                      className="w-5 h-5 rounded border-white/20 bg-black/30 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-300">Pricing Confirmed</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-medium transition-colors"
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