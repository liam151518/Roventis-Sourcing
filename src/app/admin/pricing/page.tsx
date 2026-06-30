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
      <div className="rs-page-header">
        <div>
          <span className="rs-overline">Admin</span>
          <h1 className="rs-page-title mt-1">Pricing Management</h1>
          <p className="rs-page-subtitle">Manage product pricing for quotes and invoices</p>
        </div>
      </div>

      <div className="rs-card p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rs-input w-full pl-11"
          />
        </div>
      </div>

      <div className="rs-card overflow-hidden">
        <table className="rs-table w-full">
          <thead>
            <tr>
              <th>Product</th>
              <th className="text-center">50 pcs</th>
              <th className="text-center">100 pcs</th>
              <th className="text-center">500 pcs</th>
              <th className="text-center">Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product: any) => (
              <tr key={product.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}>
                      <Package className="w-5 h-5" style={{ color: "var(--rs-text-secondary)" }} />
                    </div>
                    <div>
                      <p className="font-medium text-white">{product.name}</p>
                      <p className="text-xs" style={{ color: "var(--rs-text-secondary)" }}>{product.category}</p>
                    </div>
                  </div>
                </td>

                {editingProduct === product.id && editForm ? (
                  <>
                    <td className="text-center">
                      <input
                        type="number"
                        value={editForm["50"]}
                        onChange={(e) => setEditForm({...editForm, "50": e.target.value})}
                        className="rs-input text-center w-24 mx-auto py-1.5"
                      />
                    </td>
                    <td className="text-center">
                      <input
                        type="number"
                        value={editForm["100"]}
                        onChange={(e) => setEditForm({...editForm, "100": e.target.value})}
                        className="rs-input text-center w-24 mx-auto py-1.5"
                      />
                    </td>
                    <td className="text-center">
                      <input
                        type="number"
                        value={editForm["500"]}
                        onChange={(e) => setEditForm({...editForm, "500": e.target.value})}
                        className="rs-input text-center w-24 mx-auto py-1.5"
                      />
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => setEditForm({...editForm, confirmed: !editForm.confirmed})}
                        className="rs-pill text-xs"
                        style={
                          editForm.confirmed
                            ? { background: "rgba(34,197,94,0.10)", color: "rgb(74,222,128)", borderColor: "rgba(34,197,94,0.20)" }
                            : { background: "rgba(255,255,255,0.04)", color: "var(--rs-text-secondary)", borderColor: "var(--rs-border)" }
                        }
                      >
                        {editForm.confirmed ? "Confirmed" : "Unconfirmed"}
                      </button>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={handleSave} className="rs-btn-ghost p-2" style={{ color: "rgb(74,222,128)", background: "rgba(34,197,94,0.10)", borderColor: "rgba(34,197,94,0.20)" }} aria-label="Save">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={handleCancel} className="rs-btn-ghost p-2" style={{ color: "rgb(248,113,113)", background: "rgba(239,68,68,0.10)", borderColor: "rgba(239,68,68,0.20)" }} aria-label="Cancel">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="text-center">
                      {product.pricing?.confirmed ? (
                        <span className="font-medium" style={{ color: "rgb(251,146,60)" }}>{ZAR(product.pricing["50"])}</span>
                      ) : (
                        <span style={{ color: "var(--rs-text-muted)" }}>—</span>
                      )}
                    </td>
                    <td className="text-center">
                      {product.pricing?.confirmed ? (
                        <span className="font-medium" style={{ color: "rgb(74,222,128)" }}>{ZAR(product.pricing["100"])}</span>
                      ) : (
                        <span style={{ color: "var(--rs-text-muted)" }}>—</span>
                      )}
                    </td>
                    <td className="text-center">
                      {product.pricing?.confirmed ? (
                        <span className="font-medium" style={{ color: "rgb(96,165,250)" }}>{ZAR(product.pricing["500"])}</span>
                      ) : (
                        <span style={{ color: "var(--rs-text-muted)" }}>—</span>
                      )}
                    </td>
                    <td className="text-center">
                      {product.pricing?.confirmed ? (
                        <span className="rs-pill text-xs" style={{ background: "rgba(34,197,94,0.10)", color: "rgb(74,222,128)", borderColor: "rgba(34,197,94,0.20)" }}>Confirmed</span>
                      ) : product.pricing ? (
                        <span className="rs-pill text-xs" style={{ background: "rgba(245,158,11,0.10)", color: "rgb(251,191,36)", borderColor: "rgba(245,158,11,0.20)" }}>Pending</span>
                      ) : (
                        <span className="rs-pill text-xs" style={{ background: "rgba(255,255,255,0.04)", color: "var(--rs-text-secondary)", borderColor: "var(--rs-border)" }}>Coming Soon</span>
                      )}
                    </td>
                    <td className="text-right">
                      <button onClick={() => handleEdit(product)} className="rs-btn-ghost p-2" aria-label="Edit">
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

      <div className="flex items-center justify-between text-xs px-1" style={{ color: "var(--rs-text-secondary)" }}>
        <p>Showing {filteredProducts.length} products</p>
        <p>* Prices in ZAR</p>
      </div>
    </div>
  );
}