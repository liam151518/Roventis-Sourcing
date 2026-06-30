"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Save,
  FolderOpen,
  Image as ImageIcon,
  Upload,
  ChevronDown,
  ChevronUp,
  Eye,
  ZoomIn,
  ZoomOut,
  X,
} from "lucide-react";
import { InvoicePreview, type InvoiceData, type LineItem } from "@/components/invoice/InvoicePreview";
import { ProductLibraryModal } from "@/components/invoice/ProductLibraryModal";
import { LoadFromDealModal } from "@/components/invoice/LoadFromDealModal";
import { ROVENTIS_COMPANY } from "@/lib/roventisConstants";
import { logoToBase64 } from "@/lib/logoBase64";
import { generateInvoicePdf } from "@/lib/generateInvoicePdf";

interface LineItemState {
  id: string;
  productName: string;
  productSubtitle: string;
  imageDataUrl: string;
  unitPrice: number;
  quantity: number;
  amount: number;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const calculateTotal = (items: LineItemState[]) => {
  return items.reduce((sum, item) => sum + item.amount, 0);
};

const calculateSubtotal = (items: LineItemState[]) => {
  return items.reduce((sum, item) => sum + item.amount, 0);
};

function formatDateForInput(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function InvoicePage() {
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate, {});
  const invoiceSettings = useQuery(api.invoices.getInvoiceSettings);

  const [logoBase64, setLogoBase64] = useState<string>("");
  const [previewScale, setPreviewScale] = useState(0.45);
  const [isLoadingLogo, setIsLoadingLogo] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState<string>("0001");

  // Collapsible sections
  const [sections, setSections] = useState({
    invoiceDetails: true,
    billTo: true,
    projectSummary: true,
    lineItems: true,
    notes: true,
  });

  // Invoice data
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(formatDateForInput(new Date()));
  const [clientCompanyName, setClientCompanyName] = useState("");
  const [clientAddress1, setClientAddress1] = useState("");
  const [clientAddress2, setClientAddress2] = useState("");
  const [clientVatNumber, setClientVatNumber] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [projectSummary, setProjectSummary] = useState("");
  const [lineItems, setLineItems] = useState<LineItemState[]>([
    { id: generateId(), productName: "", productSubtitle: "", imageDataUrl: "", unitPrice: 0, quantity: 1, amount: 0 },
  ]);
  const [notes, setNotes] = useState<string[]>([...ROVENTIS_COMPANY.defaultNotes]);

  // Modals
  const [isProductLibraryOpen, setIsProductLibraryOpen] = useState(false);
  const [isLoadFromDealOpen, setIsLoadFromDealOpen] = useState(false);
  const [selectedLineItemId, setSelectedLineItemId] = useState<string | null>(null);

  // Load logo
  useEffect(() => {
    logoToBase64()
      .then(setLogoBase64)
      .catch(console.error)
      .finally(() => setIsLoadingLogo(false));
  }, []);

  // Get next invoice number
  useEffect(() => {
    if (currentAffiliate?._id) {
      // This will be populated when we can query
    }
  }, [currentAffiliate?._id]);

  // Update amount when quantity or price changes
  const updateLineItem = (id: string, field: keyof LineItemState, value: string | number) => {
    setLineItems((items) =>
      items.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };
        if (field === "unitPrice" || field === "quantity") {
          updated.amount = updated.unitPrice * updated.quantity;
        }
        return updated;
      })
    );
  };

  const addLineItem = () => {
    setLineItems((items) => [
      ...items,
      { id: generateId(), productName: "", productSubtitle: "", imageDataUrl: "", unitPrice: 0, quantity: 1, amount: 0 },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems((items) => items.filter((item) => item.id !== id));
    }
  };

  const toggleSection = (section: keyof typeof sections) => {
    setSections((s) => ({ ...s, [section]: !s[section] }));
  };

  const subtotal = calculateSubtotal(lineItems);
  const total = calculateTotal(lineItems);

  const invoiceData: InvoiceData = {
    invoiceNumber,
    invoiceDate,
    clientCompanyName: clientCompanyName || "Client Name",
    clientAddress1: clientAddress1 || undefined,
    clientAddress2: clientAddress2 || undefined,
    clientVatNumber: clientVatNumber || undefined,
    clientEmail: clientEmail || undefined,
    projectSummary: projectSummary || undefined,
    lineItems: lineItems.map((item) => ({
      productName: item.productName,
      productSubtitle: item.productSubtitle || undefined,
      imageDataUrl: item.imageDataUrl || undefined,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      amount: item.amount,
    })),
    notes,
    subtotal,
    total,
  };

  const handleProductSelect = (product: { name: string; colors: Array<{ name: string; image: string }> }, lineItemId: string, colorName: string = "", colorImage: string = "", quantity: number = 100, unitPrice: number = 0) => {
    setLineItems((items) =>
      items.map((item) => {
        if (item.id !== lineItemId) return item;
        return {
          ...item,
          productName: product.name,
          productSubtitle: colorName || "",
          imageDataUrl: colorImage || product.colors[0]?.image || "",
          unitPrice: unitPrice,
          quantity: quantity,
          amount: unitPrice * quantity,
        };
      })
    );
    setIsProductLibraryOpen(false);
  };

  const handleImageUpload = (lineItemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setLineItems((items) =>
        items.map((item) => {
          if (item.id !== lineItemId) return item;
          return { ...item, imageDataUrl: reader.result as string };
        })
      );
    };
    reader.readAsDataURL(file);
  };

  const handleOpenProductLibrary = (lineItemId: string) => {
    setSelectedLineItemId(lineItemId);
    setIsProductLibraryOpen(true);
  };

  const handleDealSelect = (deal: any) => {
    setClientCompanyName(deal.clientCompany || deal.clientName);
    setClientEmail(deal.clientEmail || "");
    setProjectSummary(deal.description || "");

    // Add one line item per product category
    const newLineItems = deal.productCategory.map((category: string) => ({
      id: generateId(),
      productName: category,
      productSubtitle: "",
      imageDataUrl: "",
      unitPrice: 0,
      quantity: 1,
      amount: 0,
    }));

    if (newLineItems.length > 0) {
      setLineItems(newLineItems);
    }
  };

  const handleDownloadPdf = async () => {
    if (!logoBase64) {
      console.error("Logo not loaded");
      return;
    }

    setIsDownloading(true);
    try {
      await generateInvoicePdf(invoiceData, logoBase64);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Add/remove note
  const addNote = () => {
    setNotes([...notes, ""]);
  };

  const updateNote = (index: number, value: string) => {
    setNotes((n) => n.map((note, i) => (i === index ? value : note)));
  };

  const removeNote = (index: number) => {
    setNotes((n) => n.filter((_, i) => i !== index));
  };

  return (
    <div className="flex h-full" style={{ background: "var(--rs-bg-base)" }}>
      {/* Left Panel - Invoice Builder */}
      <div className="w-[55%] overflow-y-auto" style={{ borderRight: "1px solid var(--rs-border)" }}>
        <div className="p-6">
          <span className="rs-overline">Invoicing</span>
          <h1 className="rs-page-title text-2xl md:text-[28px] mt-1">Invoice Generator</h1>
          <p className="rs-page-subtitle">Create professional invoices for your clients</p>

          {/* Invoice Details Section */}
          <div className="mb-4 rs-card overflow-hidden">
            <button
              onClick={() => toggleSection("invoiceDetails")}
              className="w-full flex items-center justify-between p-4 transition-colors hover:bg-[var(--rs-bg-overlay)]"
              style={{ borderBottom: "1px solid var(--rs-border)" }}
            >
              <span className="text-sm font-semibold text-white">Invoice Details</span>
              {sections.invoiceDetails ? (
                <ChevronUp className="w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
              ) : (
                <ChevronDown className="w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
              )}
            </button>
            {sections.invoiceDetails && (
              <div className="p-4 space-y-3" style={{ borderTop: "1px solid var(--rs-border)" }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5"
                      style={{ color: "var(--rs-text-secondary)" }}>Invoice Number</label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="0001"
                      className="rs-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5"
                      style={{ color: "var(--rs-text-secondary)" }}>Invoice Date</label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="rs-input"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bill To Section */}
          <div className="mb-4 rs-card overflow-hidden">
            <button
              onClick={() => toggleSection("billTo")}
              className="w-full flex items-center justify-between p-4 transition-colors hover:bg-[var(--rs-bg-overlay)]"
            >
              <span className="text-sm font-semibold text-white">Bill To (Client Details)</span>
              {sections.billTo ? (
                <ChevronUp className="w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
              ) : (
                <ChevronDown className="w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
              )}
            </button>
            {sections.billTo && (
              <div className="p-4 space-y-3" style={{ borderTop: "1px solid var(--rs-border)" }}>
                <div>
                  <label className="block text-xs font-medium mb-1.5"
                      style={{ color: "var(--rs-text-secondary)" }}>Company Name *</label>
                  <input
                    type="text"
                    value={clientCompanyName}
                    onChange={(e) => setClientCompanyName(e.target.value)}
                    placeholder="Africa Hunt Lodge Pty Ltd"
                    className="rs-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5"
                      style={{ color: "var(--rs-text-secondary)" }}>Address Line 1</label>
                  <input
                    type="text"
                    value={clientAddress1}
                    onChange={(e) => setClientAddress1(e.target.value)}
                    placeholder="123 Main Street"
                    className="rs-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5"
                      style={{ color: "var(--rs-text-secondary)" }}>Address Line 2</label>
                  <input
                    type="text"
                    value={clientAddress2}
                    onChange={(e) => setClientAddress2(e.target.value)}
                    placeholder="Cape Town, 8001"
                    className="rs-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5"
                      style={{ color: "var(--rs-text-secondary)" }}>VAT Number</label>
                    <input
                      type="text"
                      value={clientVatNumber}
                      onChange={(e) => setClientVatNumber(e.target.value)}
                      placeholder="VAT123456789"
                      className="rs-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5"
                      style={{ color: "var(--rs-text-secondary)" }}>Email</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="rs-input"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Project Summary Section */}
          <div className="mb-4 rs-card overflow-hidden">
            <button
              onClick={() => toggleSection("projectSummary")}
              className="w-full flex items-center justify-between p-4 transition-colors hover:bg-[var(--rs-bg-overlay)]"
            >
              <span className="text-sm font-semibold text-white">Project Summary</span>
              {sections.projectSummary ? (
                <ChevronUp className="w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
              ) : (
                <ChevronDown className="w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
              )}
            </button>
            {sections.projectSummary && (
              <div className="p-4" style={{ borderTop: "1px solid var(--rs-border)" }}>
                <textarea
                  value={projectSummary}
                  onChange={(e) => setProjectSummary(e.target.value)}
                  placeholder="Custom branded headwear designed for Africa Hunt Lodge Pty Ltd."
                  rows={3}
                  className="rs-input rs-input--textarea"
                />
              </div>
            )}
          </div>

          {/* Line Items Section */}
          <div className="mb-4 rs-card overflow-hidden">
            <button
              onClick={() => toggleSection("lineItems")}
              className="w-full flex items-center justify-between p-4 transition-colors hover:bg-[var(--rs-bg-overlay)]"
            >
              <span className="text-sm font-semibold text-white">Line Items</span>
              {sections.lineItems ? (
                <ChevronUp className="w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
              ) : (
                <ChevronDown className="w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
              )}
            </button>
            {sections.lineItems && (
              <div className="p-4" style={{ borderTop: "1px solid var(--rs-border)" }}>
                {lineItems.map((item, index) => (
                  <div key={item.id} className="mb-4 p-4 rounded-lg" style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}>
                    <div className="flex items-start gap-4">
                      {/* Image */}
                      <div className="shrink-0">
                        {item.imageDataUrl ? (
                          <div className="relative w-20 h-20">
                            <img
                              src={item.imageDataUrl}
                              alt={item.productName}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => updateLineItem(item.id, "imageDataUrl", "")}
                              className="absolute -top-2 -right-2 p-1 rounded-full transition-colors"
                              style={{
                                background: "var(--rs-danger)",
                                color: "white",
                              }}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-20 h-20 flex flex-col gap-1">
                            <button
                              onClick={() => handleOpenProductLibrary(item.id)}
                              className="flex-1 flex flex-col items-center justify-center rounded-lg transition-colors hover:border-[var(--rs-border-focus)]"
                              style={{
                                background: "var(--rs-bg-base)",
                                border: "1px solid var(--rs-border)",
                              }}
                            >
                              <ImageIcon className="w-5 h-5" style={{ color: "var(--rs-text-muted)" }} />
                              <span className="text-xs" style={{ color: "var(--rs-text-muted)" }}>Select</span>
                            </button>
                            <label
                              className="flex-1 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-colors hover:border-[var(--rs-border-focus)]"
                              style={{
                                background: "var(--rs-bg-base)",
                                border: "1px solid var(--rs-border)",
                              }}
                            >
                              <Upload className="w-5 h-5" style={{ color: "var(--rs-text-muted)" }} />
                              <span className="text-xs" style={{ color: "var(--rs-text-muted)" }}>Upload</span>
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                onChange={(e) => handleImageUpload(item.id, e)}
                              />
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Product fields */}
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-[11px] font-medium mb-1.5"
                      style={{ color: "var(--rs-text-muted)" }}>Product Name</label>
                          <input
                            type="text"
                            value={item.productName}
                            onChange={(e) => updateLineItem(item.id, "productName", e.target.value)}
                            placeholder="Olive Green Hat"
                            className="rs-input" style={{ height: 36, fontSize: "0.8125rem", fontWeight: 500 }}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[11px] font-medium mb-1.5"
                      style={{ color: "var(--rs-text-muted)" }}>Subtitle</label>
                          <input
                            type="text"
                            value={item.productSubtitle}
                            onChange={(e) => updateLineItem(item.id, "productSubtitle", e.target.value)}
                            placeholder="Custom Leather Patch"
                            className="rs-input" style={{ height: 36, fontSize: "0.8125rem" }}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium mb-1.5"
                      style={{ color: "var(--rs-text-muted)" }}>Unit Price (R)</label>
                          <input
                            type="number"
                            value={item.unitPrice || ""}
                            onChange={(e) => updateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="rs-input" style={{ height: 36, fontSize: "0.8125rem" }}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium mb-1.5"
                      style={{ color: "var(--rs-text-muted)" }}>Qty</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                            min={1}
                            className="rs-input" style={{ height: 36, fontSize: "0.8125rem" }}
                          />
                        </div>
                        <div
                          className="col-span-2 flex items-center justify-between p-2 rounded-lg"
                          style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}
                        >
                          <span className="text-xs" style={{ color: "var(--rs-text-muted)" }}>Amount:</span>
                          <span className="text-sm font-semibold text-white rs-stat">
                            R{item.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => removeLineItem(item.id)}
                        disabled={lineItems.length === 1}
                        className="p-2 transition-colors disabled:opacity-50"
                        style={{ color: "var(--rs-text-muted)" }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addLineItem}
                  className="w-full py-3 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2"
                  style={{
                    borderColor: "var(--rs-border)",
                    color: "var(--rs-text-muted)",
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add Line Item
                </button>
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="mb-4 rs-card overflow-hidden">
            <button
              onClick={() => toggleSection("notes")}
              className="w-full flex items-center justify-between p-4 transition-colors hover:bg-[var(--rs-bg-overlay)]"
            >
              <span className="text-sm font-semibold text-white">Notes</span>
              {sections.notes ? (
                <ChevronUp className="w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
              ) : (
                <ChevronDown className="w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
              )}
            </button>
            {sections.notes && (
              <div className="p-4 space-y-2" style={{ borderTop: "1px solid var(--rs-border)" }}>
                {notes.map((note, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span style={{ color: "var(--rs-text-muted)" }}>•</span>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => updateNote(index, e.target.value)}
                      className="rs-input flex-1" style={{ height: 36, fontSize: "0.8125rem" }}
                    />
                    <button
                      onClick={() => removeNote(index)}
                      className="p-2 transition-colors"
                      style={{ color: "var(--rs-text-muted)" }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addNote}
                  className="w-full py-2 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2 text-xs"
                  style={{
                    borderColor: "var(--rs-border)",
                    color: "var(--rs-text-muted)",
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add Note
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="sticky bottom-0 p-4 flex gap-2"
          style={{ background: "var(--rs-bg-base)", borderTop: "1px solid var(--rs-border)" }}
        >
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="rs-btn-primary flex-1 justify-center disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {isDownloading ? "Generating..." : "Download PDF"}
          </button>
          <button className="rs-btn-ghost flex-1 justify-center">
            <Save className="w-3.5 h-3.5" />
            Save Invoice
          </button>
          <button
            onClick={() => setIsLoadFromDealOpen(true)}
            className="rs-btn-ghost flex-1 justify-center"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Load from Deal
          </button>
        </div>
      </div>

      {/* Right Panel - Live Preview */}
      <div className="w-[45%] overflow-hidden flex flex-col" style={{ background: "var(--rs-bg-base)" }}>
        {/* Preview header */}
        <div
          className="p-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--rs-border)" }}
        >
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Eye className="w-4 h-4" style={{ color: "var(--rs-text-accent)" }} />
            Live Preview
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPreviewScale((s) => Math.max(0.3, s - 0.05))}
              className="p-1.5 rounded-md hover:bg-[var(--rs-bg-overlay)] transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" style={{ color: "var(--rs-text-muted)" }} />
            </button>
            <span className="text-xs px-1.5" style={{ color: "var(--rs-text-muted)" }}>
              {Math.round(previewScale * 100)}%
            </span>
            <button
              onClick={() => setPreviewScale((s) => Math.min(1, s + 0.05))}
              className="p-1.5 rounded-md hover:bg-[var(--rs-bg-overlay)] transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" style={{ color: "var(--rs-text-muted)" }} />
            </button>
          </div>
        </div>

        {/* Preview content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white shadow-lg" style={{ transform: `scale(${previewScale})`, transformOrigin: "top center" }}>
            {isLoadingLogo ? (
              <div className="w-[794px] h-[1123px] flex items-center justify-center">
                <p className="text-gray-500">Loading preview...</p>
              </div>
            ) : (
              <InvoicePreview 
                invoiceData={invoiceData} 
                logoBase64={logoBase64} 
                scale={1} 
                settings={invoiceSettings}
              />
            )}
          </div>
        </div>
      </div>

      {/* Product Library Modal */}
      <ProductLibraryModal
        isOpen={isProductLibraryOpen}
        onClose={() => setIsProductLibraryOpen(false)}
        onSelectProduct={(product, lineItemId, colorName, colorImage, quantity, unitPrice) => handleProductSelect({ name: product.name, colors: product.colors.map(c => ({ name: c.name, image: c.imageUrl })) }, lineItemId, colorName, colorImage, quantity, unitPrice)}
        targetLineItemId={selectedLineItemId}
        lineItemIds={lineItems.map((item) => item.id)}
      />

      {/* Load from Deal Modal */}
      <LoadFromDealModal
        isOpen={isLoadFromDealOpen}
        onClose={() => setIsLoadFromDealOpen(false)}
        onSelectDeal={handleDealSelect}
      />
    </div>
  );
}