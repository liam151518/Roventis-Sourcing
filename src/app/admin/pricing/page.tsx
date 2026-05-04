"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Package,
  Edit2,
  Save,
  X
} from "lucide-react";
import productLibraryData from "@/data/productLibrary.json";

const ZAR = (amount: number): string => {
  return `R${amount.toLocaleString()}`;
};

export default function AdminPricingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    "50": string;
    "100": string;
    "500": string;
    confirmed: boolean;
  } | null>(null);

  const filteredProducts = productLibraryData.products.filter((p: any) => 
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (product: any) => {
    if (product.pricing) {
      setEditForm({
        "50": product.pricing["50"].toString(),
        "100": product.pricing["100"].toString(),
        "500": product.pricing["500"].toString(),
        confirmed: product.pricing.confirmed,
      });
    } else {
      setEditForm({
        "50": "",
        "100": "",
        "500": "",
        confirmed: false,
      });
    }
    setEditingProduct(product.id);
  };

  const handleSave = () => {
    alert("Pricing saved! (This would update the database in production)");
    setEditingProduct(null);
    setEditForm(null);
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setEditForm(null);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-semibold text-white">Pricing Management</h1>
        <p className="text-gray-500 mt-1">Manage product pricing for quotes and invoices</p>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-[#141417] border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>

      <div className="bg-[#0a0a0b] rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase">Product</th>
              <th className="text-center p-4 text-xs font-medium text-gray-400 uppercase">50 pcs</th>
              <th className="text-center p-4 text-xs font-medium text-gray-400 uppercase">100 pcs</th>
              <th className="text-center p-4 text-xs font-medium text-gray-400 uppercase">500 pcs</th>
              <th className="text-center p-4 text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="text-right p-4 text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredProducts.map((product: any) => (
              <tr key={product.id} className="hover:bg-white/5">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                  </div>
                </td>
                
                {editingProduct === product.id && editForm ? (
                  <>
                    <td className="p-4">
                      <input
                        type="number"
                        value={editForm["50"]}
                        onChange={(e) => setEditForm({...editForm, "50": e.target.value})}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-center"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="number"
                        value={editForm["100"]}
                        onChange={(e) => setEditForm({...editForm, "100": e.target.value})}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-center"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="number"
                        value={editForm["500"]}
                        onChange={(e) => setEditForm({...editForm, "500": e.target.value})}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-center"
                      />
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setEditForm({...editForm, confirmed: !editForm.confirmed})}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          editForm.confirmed ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {editForm.confirmed ? "Confirmed" : "Unconfirmed"}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={handleSave} className="p-2 bg-green-500/20 text-green-400 rounded-lg">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={handleCancel} className="p-2 bg-red-500/20 text-red-400 rounded-lg">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4 text-center">
                      {product.pricing?.confirmed ? (
                        <span className="text-orange-400 font-medium">{ZAR(product.pricing["50"])}</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {product.pricing?.confirmed ? (
                        <span className="text-green-400 font-medium">{ZAR(product.pricing["100"])}</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {product.pricing?.confirmed ? (
                        <span className="text-blue-400 font-medium">{ZAR(product.pricing["500"])}</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {product.pricing?.confirmed ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">Confirmed</span>
                      ) : product.pricing ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">Pending</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">Coming Soon</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleEdit(product)} className="p-2 text-gray-500 hover:text-blue-400">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <p>Showing {filteredProducts.length} products</p>
        <p>* Prices in ZAR</p>
      </div>
    </div>
  );
}