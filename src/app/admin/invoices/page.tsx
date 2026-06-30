"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { logoToBase64 } from "@/lib/logoBase64";
import { 
  Save,
  Palette,
  Building,
  FileText,
  CreditCard,
} from "lucide-react";
import { InvoicePreview, type InvoiceData } from "@/components/invoice/InvoicePreview";

const defaultInvoiceData: InvoiceData = {
  invoiceNumber: "0001",
  invoiceDate: new Date().toISOString().split("T")[0],
  clientCompanyName: "Africa Hunt Lodge Pty Ltd",
  clientAddress1: "123 Main Street",
  clientAddress2: "Cape Town, 8001",
  clientVatNumber: "VAT123456789",
  clientEmail: "client@example.com",
  projectSummary: "Custom branded headwear designed for Africa Hunt Lodge Pty Ltd.",
  lineItems: [
    { productName: "100% Cotton Tshirt", productSubtitle: "Black", imageDataUrl: "", unitPrice: 240.50, quantity: 100, amount: 24050 },
    { productName: "Beanie", productSubtitle: "Olive", imageDataUrl: "", unitPrice: 111.00, quantity: 50, amount: 5550 },
  ],
  notes: [
    "Price includes all setup, branding, and finishing — no additional charges.",
    "Estimated production time: 4–6 weeks after final sample approval.",
    "Payment terms: 100% deposit to begin production.",
    "Shipping with tracking and insurance included.",
  ],
  subtotal: 29600,
  total: 29600,
};

export default function AdminInvoicesPage() {
  const [activeTab, setActiveTab] = useState<"company" | "colors" | "notes">("company");
  const [isLoading, setIsLoading] = useState(true);
  const [logoBase64, setLogoBase64] = useState<string>("");
  
  // Load logo on mount
  useEffect(() => {
    logoToBase64()
      .then(setLogoBase64)
      .catch(console.error);
  }, []);
  
  // Fetch existing settings from Convex
  const existingSettings = useQuery(api.invoices.getInvoiceSettings);
  const saveSettings = useMutation(api.invoices.updateInvoiceSettings);
  const createSettings = useMutation(api.invoices.createInvoiceSettings);
  
  // Company Info State
  const [companyInfo, setCompanyInfo] = useState({
    name: "Roventis (pty) Ltd",
    email: "roventis.io@gmail.com",
    phone: "+27 (81) 418 3491",
    website: "www.roventis.co.za",
    social: "@roventis.co.za",
    bankName: "FNB/RMB",
    accountType: "Gold Business Account",
    accountNumber: "63197083280",
    branchCode: "250655",
    accountHolder: "Roventis (pty) Ltd",
    tagline: "Thank you for choosing Roventis. Built to endure. Made for those who live the outdoor life.",
  });

  // Colors State
  const [colors, setColors] = useState({
    primary: "#F97316", // Orange
    secondary: "#1f2937", // Dark gray
    accent: "#3b82f6", // Blue
    divider: "#F97316",
  });

  // Default Notes State
  const [defaultNotes, setDefaultNotes] = useState([
    "Price includes all setup, branding, and finishing — no additional charges.",
    "Estimated production time: 4–6 weeks after final sample approval.",
    "Payment terms: 100% deposit to begin production.",
    "Shipping with tracking and insurance included.",
  ]);

  // Load existing settings on mount
  useEffect(() => {
    if (existingSettings) {
      setCompanyInfo({
        name: existingSettings.companyName,
        email: existingSettings.companyEmail,
        phone: existingSettings.companyPhone,
        website: existingSettings.companyWebsite,
        social: existingSettings.companySocial,
        bankName: existingSettings.bankName,
        accountType: existingSettings.accountType,
        accountNumber: existingSettings.accountNumber,
        branchCode: existingSettings.branchCode,
        accountHolder: existingSettings.accountHolder,
        tagline: existingSettings.tagline,
      });
      setColors({
        primary: existingSettings.primaryColor,
        secondary: existingSettings.secondaryColor,
        accent: existingSettings.accentColor,
        divider: existingSettings.dividerColor,
      });
      setDefaultNotes(existingSettings.defaultNotes);
    }
    setIsLoading(false);
  }, [existingSettings]);

  const handleSave = async () => {
    try {
      if (existingSettings) {
        // Update existing
        await saveSettings({
          id: existingSettings._id,
          companyName: companyInfo.name,
          companyEmail: companyInfo.email,
          companyPhone: companyInfo.phone,
          companyWebsite: companyInfo.website,
          companySocial: companyInfo.social,
          bankName: companyInfo.bankName,
          accountType: companyInfo.accountType,
          accountNumber: companyInfo.accountNumber,
          branchCode: companyInfo.branchCode,
          accountHolder: companyInfo.accountHolder,
          tagline: companyInfo.tagline,
          defaultNotes: defaultNotes,
          primaryColor: colors.primary,
          secondaryColor: colors.secondary,
          accentColor: colors.accent,
          dividerColor: colors.divider,
        });
      } else {
        // Create new
        await createSettings({
          companyName: companyInfo.name,
          companyEmail: companyInfo.email,
          companyPhone: companyInfo.phone,
          companyWebsite: companyInfo.website,
          companySocial: companyInfo.social,
          bankName: companyInfo.bankName,
          accountType: companyInfo.accountType,
          accountNumber: companyInfo.accountNumber,
          branchCode: companyInfo.branchCode,
          accountHolder: companyInfo.accountHolder,
          tagline: companyInfo.tagline,
          defaultNotes: defaultNotes,
          primaryColor: colors.primary,
          secondaryColor: colors.secondary,
          accentColor: colors.accent,
          dividerColor: colors.divider,
        });
      }
      alert("Invoice settings saved! All affiliate invoices will now use these settings.");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings. Please try again.");
    }
  };

  const tabs = [
    { id: "company", label: "Company Info", icon: Building },
    { id: "colors", label: "Colors", icon: Palette },
    { id: "notes", label: "Default Notes", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rs-page-header flex items-center justify-between gap-4">
        <div>
          <span className="rs-overline">Admin</span>
          <h1 className="rs-page-title mt-1">Invoice Settings</h1>
          <p className="rs-page-subtitle">Customize your invoice template and company details</p>
        </div>
        <button
          onClick={handleSave}
          className="rs-btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 pb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "rs-btn-primary"
                : "rs-btn-ghost"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <div className="rs-card p-6">
          {activeTab === "company" && (
            <div className="space-y-4">
              <h3 className="rs-section-header-title text-lg">Company Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wide mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Company Name</label>
                  <input
                    type="text"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                    className="rs-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Email</label>
                  <input
                    type="text"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                    className="rs-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Phone</label>
                  <input
                    type="text"
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                    className="rs-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Website</label>
                  <input
                    type="text"
                    value={companyInfo.website}
                    onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                    className="rs-input w-full"
                  />
                </div>
              </div>

              <h3 className="rs-section-header-title text-lg pt-4">Bank Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wide mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Bank</label>
                  <input
                    type="text"
                    value={companyInfo.bankName}
                    onChange={(e) => setCompanyInfo({...companyInfo, bankName: e.target.value})}
                    className="rs-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Account Number</label>
                  <input
                    type="text"
                    value={companyInfo.accountNumber}
                    onChange={(e) => setCompanyInfo({...companyInfo, accountNumber: e.target.value})}
                    className="rs-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Branch Code</label>
                  <input
                    type="text"
                    value={companyInfo.branchCode}
                    onChange={(e) => setCompanyInfo({...companyInfo, branchCode: e.target.value})}
                    className="rs-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Account Holder</label>
                  <input
                    type="text"
                    value={companyInfo.accountHolder}
                    onChange={(e) => setCompanyInfo({...companyInfo, accountHolder: e.target.value})}
                    className="rs-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>Tagline (Footer)</label>
                <input
                  type="text"
                  value={companyInfo.tagline}
                  onChange={(e) => setCompanyInfo({...companyInfo, tagline: e.target.value})}
                  className="rs-input w-full"
                />
              </div>
            </div>
          )}

          {activeTab === "colors" && (
            <div className="space-y-4">
              <h3 className="rs-section-header-title text-lg">Invoice Colors</h3>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Primary Color", key: "primary" as const },
                  { label: "Divider Color", key: "divider" as const },
                  { label: "Secondary Color", key: "secondary" as const },
                  { label: "Accent Color", key: "accent" as const },
                ].map((c) => (
                  <div key={c.key}>
                    <label className="block text-xs uppercase tracking-wide mb-1.5" style={{ color: "var(--rs-text-secondary)" }}>{c.label}</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={colors[c.key]}
                        onChange={(e) => setColors({...colors, [c.key]: e.target.value})}
                        className="w-12 h-10 rounded-lg cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={colors[c.key]}
                        onChange={(e) => setColors({...colors, [c.key]: e.target.value})}
                        className="rs-input flex-1"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rs-card p-4 mt-6">
                <h4 className="text-sm font-medium text-white mb-3">Preview</h4>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded" style={{backgroundColor: colors.primary}}></div>
                  <div className="w-10 h-10 rounded" style={{backgroundColor: colors.divider}}></div>
                  <div className="w-10 h-10 rounded" style={{backgroundColor: colors.secondary}}></div>
                  <div className="w-10 h-10 rounded" style={{backgroundColor: colors.accent}}></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <h3 className="rs-section-header-title text-lg">Default Notes</h3>
              <p className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>These notes will appear on all invoices by default</p>

              {defaultNotes.map((note, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => {
                      const newNotes = [...defaultNotes];
                      newNotes[index] = e.target.value;
                      setDefaultNotes(newNotes);
                    }}
                    className="rs-input flex-1"
                  />
                  <button
                    onClick={() => setDefaultNotes(defaultNotes.filter((_, i) => i !== index))}
                    className="rs-btn-ghost p-2"
                    style={{ color: "rgb(248,113,113)", background: "rgba(239,68,68,0.10)", borderColor: "rgba(239,68,68,0.20)" }}
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}

              <button
                onClick={() => setDefaultNotes([...defaultNotes, ""])}
                className="w-full py-2.5 border-2 border-dashed rounded-xl text-sm font-medium transition-colors"
                style={{ borderColor: "var(--rs-border)", color: "var(--rs-text-secondary)" }}
              >
                + Add Note
              </button>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="rs-card p-4 overflow-auto max-h-[80vh]">
          <h3 className="rs-section-header-title text-lg mb-4 sticky top-0 py-2 z-10" style={{ background: "var(--rs-bg-raised)" }}>Live Preview</h3>
          <div className="bg-white shadow-lg scale-[0.45] origin-top">
            <InvoicePreview
              invoiceData={defaultInvoiceData}
              logoBase64={logoBase64}
              scale={1}
              settings={{
                companyName: companyInfo.name,
                companyEmail: companyInfo.email,
                companyPhone: companyInfo.phone,
                companyWebsite: companyInfo.website,
                companySocial: companyInfo.social,
                bankName: companyInfo.bankName,
                accountType: companyInfo.accountType,
                accountNumber: companyInfo.accountNumber,
                branchCode: companyInfo.branchCode,
                accountHolder: companyInfo.accountHolder,
                tagline: companyInfo.tagline,
                defaultNotes: defaultNotes,
                primaryColor: colors.primary,
                secondaryColor: colors.secondary,
                accentColor: colors.accent,
                dividerColor: colors.divider,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}