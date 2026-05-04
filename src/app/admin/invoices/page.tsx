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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold text-white">Invoice Settings</h1>
          <p className="text-gray-500 mt-1">Customize your invoice template and company details</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
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
        <div className="bg-[#0a0a0b] rounded-xl border border-white/5 p-6">
          {activeTab === "company" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Company Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input
                    type="text"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Website</label>
                  <input
                    type="text"
                    value={companyInfo.website}
                    onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white pt-4">Bank Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Bank</label>
                  <input
                    type="text"
                    value={companyInfo.bankName}
                    onChange={(e) => setCompanyInfo({...companyInfo, bankName: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={companyInfo.accountNumber}
                    onChange={(e) => setCompanyInfo({...companyInfo, accountNumber: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Branch Code</label>
                  <input
                    type="text"
                    value={companyInfo.branchCode}
                    onChange={(e) => setCompanyInfo({...companyInfo, branchCode: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Account Holder</label>
                  <input
                    type="text"
                    value={companyInfo.accountHolder}
                    onChange={(e) => setCompanyInfo({...companyInfo, accountHolder: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Tagline (Footer)</label>
                <input
                  type="text"
                  value={companyInfo.tagline}
                  onChange={(e) => setCompanyInfo({...companyInfo, tagline: e.target.value})}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>
            </div>
          )}

          {activeTab === "colors" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Invoice Colors</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={colors.primary}
                      onChange={(e) => setColors({...colors, primary: e.target.value})}
                      className="w-12 h-10 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={colors.primary}
                      onChange={(e) => setColors({...colors, primary: e.target.value})}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Divider Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={colors.divider}
                      onChange={(e) => setColors({...colors, divider: e.target.value})}
                      className="w-12 h-10 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={colors.divider}
                      onChange={(e) => setColors({...colors, divider: e.target.value})}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Secondary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={colors.secondary}
                      onChange={(e) => setColors({...colors, secondary: e.target.value})}
                      className="w-12 h-10 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={colors.secondary}
                      onChange={(e) => setColors({...colors, secondary: e.target.value})}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Accent Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={colors.accent}
                      onChange={(e) => setColors({...colors, accent: e.target.value})}
                      className="w-12 h-10 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={colors.accent}
                      onChange={(e) => setColors({...colors, accent: e.target.value})}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-2">Preview</h4>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded" style={{backgroundColor: colors.primary}}></div>
                  <div className="w-8 h-8 rounded" style={{backgroundColor: colors.divider}}></div>
                  <div className="w-8 h-8 rounded" style={{backgroundColor: colors.secondary}}></div>
                  <div className="w-8 h-8 rounded" style={{backgroundColor: colors.accent}}></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Default Notes</h3>
              <p className="text-sm text-gray-400">These notes will appear on all invoices by default</p>
              
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
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                  <button
                    onClick={() => setDefaultNotes(defaultNotes.filter((_, i) => i !== index))}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => setDefaultNotes([...defaultNotes, ""])}
                className="w-full py-2 border-2 border-dashed border-white/10 rounded-lg text-gray-400 hover:border-white/20 hover:text-white transition-colors"
              >
                + Add Note
              </button>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="bg-[#141417] rounded-xl border border-white/5 p-4 overflow-auto max-h-[80vh]">
          <h3 className="text-lg font-semibold text-white mb-4 sticky top-0 bg-[#141417] py-2">Live Preview</h3>
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