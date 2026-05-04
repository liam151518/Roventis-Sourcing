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
    <div className="flex h-full bg-[#0a0a0b]">
      {/* Left Panel - Invoice Builder */}
      <div className="w-[55%] border-r border-white/5 overflow-y-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-2">Invoice Generator</h1>
          <p className="text-gray-400 mb-6">Create professional invoices for your clients</p>

          {/* Invoice Details Section */}
          <div className="mb-4 bg-[#0a0a0b] rounded-xl border border-white/5 overflow-hidden">
            <button
              onClick={() => toggleSection("invoiceDetails")}
              className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="font-semibold text-white">Invoice Details</span>
              {sections.invoiceDetails ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {sections.invoiceDetails && (
              <div className="p-4 border-t border-white/5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Invoice Number</label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="0001"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Invoice Date</label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bill To Section */}
          <div className="mb-4 bg-[#0a0a0b] rounded-xl border border-white/5 overflow-hidden">
            <button
              onClick={() => toggleSection("billTo")}
              className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="font-semibold text-white">Bill To (Client Details)</span>
              {sections.billTo ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {sections.billTo && (
              <div className="p-4 border-t border-white/5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Company Name *</label>
                  <input
                    type="text"
                    value={clientCompanyName}
                    onChange={(e) => setClientCompanyName(e.target.value)}
                    placeholder="Africa Hunt Lodge Pty Ltd"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Address Line 1</label>
                  <input
                    type="text"
                    value={clientAddress1}
                    onChange={(e) => setClientAddress1(e.target.value)}
                    placeholder="123 Main Street"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Address Line 2</label>
                  <input
                    type="text"
                    value={clientAddress2}
                    onChange={(e) => setClientAddress2(e.target.value)}
                    placeholder="Cape Town, 8001"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">VAT Number</label>
                    <input
                      type="text"
                      value={clientVatNumber}
                      onChange={(e) => setClientVatNumber(e.target.value)}
                      placeholder="VAT123456789"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Project Summary Section */}
          <div className="mb-4 bg-[#0a0a0b] rounded-xl border border-white/5 overflow-hidden">
            <button
              onClick={() => toggleSection("projectSummary")}
              className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="font-semibold text-white">Project Summary</span>
              {sections.projectSummary ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {sections.projectSummary && (
              <div className="p-4 border-t border-white/5">
                <textarea
                  value={projectSummary}
                  onChange={(e) => setProjectSummary(e.target.value)}
                  placeholder="Custom branded headwear designed for Africa Hunt Lodge Pty Ltd."
                  rows={3}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            )}
          </div>

          {/* Line Items Section */}
          <div className="mb-4 bg-[#0a0a0b] rounded-xl border border-white/5 overflow-hidden">
            <button
              onClick={() => toggleSection("lineItems")}
              className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="font-semibold text-white">Line Items</span>
              {sections.lineItems ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {sections.lineItems && (
              <div className="p-4 border-t border-white/5">
                {lineItems.map((item, index) => (
                  <div key={item.id} className="mb-4 p-4 bg-white/5 rounded-lg">
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
                              className="absolute -top-2 -right-2 p-1 bg-red-500/80 text-white rounded-full hover:bg-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-20 h-20 flex flex-col gap-1">
                            <button
                              onClick={() => handleOpenProductLibrary(item.id)}
                              className="flex-1 flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-lg hover:border-blue-500/50 transition-colors"
                            >
                              <ImageIcon className="w-5 h-5 text-gray-500" />
                              <span className="text-xs text-gray-500">Select</span>
                            </button>
                            <label className="flex-1 flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-lg hover:border-blue-500/50 cursor-pointer transition-colors">
                              <Upload className="w-5 h-5 text-gray-500" />
                              <span className="text-xs text-gray-500">Upload</span>
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
                          <label className="block text-xs font-medium text-gray-500 mb-1">Product Name</label>
                          <input
                            type="text"
                            value={item.productName}
                            onChange={(e) => updateLineItem(item.id, "productName", e.target.value)}
                            placeholder="Olive Green Hat"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Subtitle</label>
                          <input
                            type="text"
                            value={item.productSubtitle}
                            onChange={(e) => updateLineItem(item.id, "productSubtitle", e.target.value)}
                            placeholder="Custom Leather Patch"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Unit Price (R)</label>
                          <input
                            type="number"
                            value={item.unitPrice || ""}
                            onChange={(e) => updateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                            min={1}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-between bg-white/5 p-2 rounded-lg">
                          <span className="text-sm text-gray-500">Amount:</span>
                          <span className="text-sm font-semibold text-white">
                            R{item.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => removeLineItem(item.id)}
                        disabled={lineItems.length === 1}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addLineItem}
                  className="w-full py-3 border-2 border-dashed border-white/10 rounded-lg text-gray-500 hover:border-blue-500/50 hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Line Item
                </button>
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="mb-4 bg-[#0a0a0b] rounded-xl border border-white/5 overflow-hidden">
            <button
              onClick={() => toggleSection("notes")}
              className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="font-semibold text-white">Notes</span>
              {sections.notes ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {sections.notes && (
              <div className="p-4 border-t border-white/5 space-y-2">
                {notes.map((note, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-gray-500">•</span>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => updateNote(index, e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button
                      onClick={() => removeNote(index)}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addNote}
                  className="w-full py-2 border-2 border-dashed border-white/10 rounded-lg text-gray-500 hover:border-blue-500/50 hover:text-blue-400 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Note
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 p-4 bg-[#0a0a0b] border-t border-white/5 flex gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isDownloading ? "Generating..." : "Download PDF"}
          </button>
          <button className="flex-1 py-3 px-4 bg-white/5 text-white border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            Save Invoice
          </button>
          <button
            onClick={() => setIsLoadFromDealOpen(true)}
            className="flex-1 py-3 px-4 bg-white/5 text-white border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <FolderOpen className="w-4 h-4" />
            Load from Deal
          </button>
        </div>
      </div>

      {/* Right Panel - Live Preview */}
      <div className="w-[45%] overflow-hidden bg-[#0a0a0b] flex flex-col">
        {/* Preview header */}
        <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Live Preview
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewScale((s) => Math.max(0.3, s - 0.05))}
              className="p-2 hover:bg-white/10 rounded-lg"
            >
              <ZoomOut className="w-4 h-4 text-gray-400" />
            </button>
            <span className="text-sm text-gray-400">{Math.round(previewScale * 100)}%</span>
            <button
              onClick={() => setPreviewScale((s) => Math.min(1, s + 0.05))}
              className="p-2 hover:bg-white/10 rounded-lg"
            >
              <ZoomIn className="w-4 h-4 text-gray-400" />
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
        onSelectProduct={(product, lineItemId, colorName, colorImage, quantity, unitPrice) => handleProductSelect(product, lineItemId, colorName, colorImage, quantity, unitPrice)}
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