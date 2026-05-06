"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Image as ImageIcon, Package, Check } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface Product {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  colors: Array<{
    name: string;
    imageUrl: string;
  }>;
  pricing?: {
    price50: number;
    price100: number;
    price500: number;
    confirmed: boolean;
  } | null;
}

interface ProductLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product, lineItemId: string, colorName: string, colorImage: string, quantity: number, unitPrice: number) => void;
  targetLineItemId: string | null;
  lineItemIds: string[];
}

const ZAR = (amount: number): string => {
  return `R${amount.toLocaleString()}`;
};

export function ProductLibraryModal({
  isOpen,
  onClose,
  onSelectProduct,
  targetLineItemId,
  lineItemIds,
}: ProductLibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(100);

  // Fetch products from Convex database
  const products = useQuery(api.products.getAllProducts);

  const productsData = products || [];
  
  const categories = Array.from(new Set(productsData.map((p: Product) => p.category || "other")));

  const filteredProducts = productsData.filter((product: Product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategory || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setSelectedQuantity(100); // Default to 100
  };

  const handleColorSelect = (colorName: string, colorImage: string) => {
    if (targetLineItemId && selectedProduct) {
      let unitPrice = 0;
      if (selectedProduct.pricing?.confirmed) {
        // Use the new pricing structure
        if (selectedQuantity === 50) unitPrice = selectedProduct.pricing.price50;
        else if (selectedQuantity === 100) unitPrice = selectedProduct.pricing.price100;
        else if (selectedQuantity === 500) unitPrice = selectedProduct.pricing.price500;
      }
      onSelectProduct(selectedProduct, targetLineItemId, colorName, colorImage, selectedQuantity, unitPrice);
      onClose();
      setSelectedProduct(null);
    }
  };

  const handleBack = () => {
    setSelectedProduct(null);
  };

  if (!isOpen) return null;

  // Get current price for display
  const getCurrentPrice = () => {
    if (!selectedProduct?.pricing?.confirmed) return null;
    if (selectedQuantity === 50) return selectedProduct.pricing.price50;
    if (selectedQuantity === 100) return selectedProduct.pricing.price100;
    if (selectedQuantity === 500) return selectedProduct.pricing.price500;
    return null;
  };
  const currentPrice = getCurrentPrice();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#0a0a0b] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              {selectedProduct && (
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}
              <h2 className="text-lg font-semibold text-white">
                {selectedProduct ? `Select Color - ${selectedProduct.name}` : "Select Product"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Search and Categories */}
          {!selectedProduct && (
            <div className="p-4 border-b border-white/10">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                    activeCategory === null
                      ? "bg-blue-500 text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                      activeCategory === category
                        ? "bg-blue-500 text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products Grid */}
          {!selectedProduct ? (
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product: Product) => (
                  <button
                    key={(product as any).id}
                    onClick={() => handleProductClick(product)}
                    disabled={!targetLineItemId}
                    className="bg-white/5 rounded-xl border border-white/5 overflow-hidden hover:border-blue-500/50 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
                  >
                    <div className="h-32 bg-white/5 p-2 relative">
                      <img
                        src={product.colors[0]?.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain"
                        crossOrigin="anonymous"
                      />
                      {product.pricing?.confirmed && (
                        <div className="absolute top-2 right-2 bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                          Priced
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-white/5">
                      <p className="text-sm font-semibold text-white truncate">{product.name}</p>
                      <p className="text-xs text-gray-500 truncate">{product.colors.length} colors</p>
                    </div>
                  </button>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                  <p>No products found</p>
                </div>
              )}
            </div>
          ) : (
            /* Color Selection with Pricing */
            <div className="p-4">
              {/* Pricing Section */}
              {selectedProduct.pricing?.confirmed ? (
                <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">Select Quantity</span>
                    <span className="text-sm text-green-400 font-semibold">
                      Current: {ZAR(Number((selectedProduct.pricing as any)?.[selectedQuantity] ?? 0))}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {[50, 100, 500].map((qty) => (
                      <button
                        key={qty}
                        onClick={() => setSelectedQuantity(qty)}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                          selectedQuantity === qty
                            ? qty === 50 ? "bg-orange-500 text-white"
                              : qty === 100 ? "bg-green-500 text-white"
                              : "bg-blue-500 text-white"
                            : "bg-white/10 text-gray-400 hover:bg-white/20"
                        }`}
                      >
                        {qty} pcs
                        <div className="text-xs opacity-80">
                          {ZAR(Number((selectedProduct.pricing as any)?.[qty] ?? 0))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Package className="w-5 h-5" />
                    <span className="text-sm">Coming Soon - Price not yet confirmed</span>
                  </div>
                </div>
              )}

              {/* Color Grid */}
              <p className="text-sm text-gray-400 mb-3">Select Color:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[40vh] overflow-y-auto">
                {selectedProduct.colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorSelect(color.name, color.imageUrl)}
                    disabled={!targetLineItemId}
                    className="bg-white/5 rounded-xl border border-white/5 overflow-hidden hover:border-green-500/50 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="h-32 bg-white/5 p-2">
                      <img
                        src={color.imageUrl}
                        alt={`${selectedProduct.name} - ${color.name}`}
                        className="w-full h-full object-contain rounded-md"
                        crossOrigin="anonymous"
                      />
                    </div>
                    <div className="p-3 border-t border-white/5 text-center">
                      <p className="text-sm font-medium text-white">{color.name}</p>
                      {selectedProduct.pricing?.confirmed ? (
                        <p className="text-xs text-green-400 mt-1">Select</p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">Coming Soon</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="p-4 border-t border-white/10 bg-white/5">
            <p className="text-sm text-gray-400">
              {!targetLineItemId
                ? "Select a line item first, then choose a product."
                : selectedProduct
                  ? selectedProduct.pricing?.confirmed
                    ? `Click a color to add ${selectedProduct.name} at ${ZAR(currentPrice ?? 0)} per unit.`
                    : "This product's price is not confirmed yet."
                  : "Select a product to see available colors."}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}