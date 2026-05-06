"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { nanoid } from "nanoid";
import {
  Upload,
  Table,
  Activity,
  Download,
  FileSpreadsheet,
  Trash2,
  RefreshCw,
  Users,
  MapPin,
  Calendar,
  Building,
  Tag,
  DollarSign,
  Check,
  X,
  ChevronRight,
  AlertCircle,
  Lock,
  Search,
  Filter,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatCurrency } from "@/lib/utils";

interface ParsedLead {
  companyName: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  city?: string;
  province?: string;
  industry?: string;
  productInterest?: string[];
  estimatedBudget?: number;
  notes?: string;
  source?: string;
  poolTier?: "standard" | "priority" | "premium";
}

const CSV_TEMPLATE = `companyName,contactName,contactEmail,contactPhone,city,province,industry,productInterest,estimatedBudget,notes,source,poolTier
"Kruger Bush Lodge","Jan van der Merwe","jan@krugerbuslodge.co.za","+27 82 111 2222","Nelspruit","Mpumalanga","Lodge","workwear;merchandise",75000,"Looking for workwear","google_maps",standard
"Highveld Mining Co","Pieter Smit","pieter@highveldmining.com","+27 83 222 3333","Secunda","Mpumalanga","Mining","workwear;safety",150000,"Large mining operation",directory,priority
"Sun International Hotels","James Wilson","james@sunintl.co.za","+27 84 222 3333","Johannesburg","Gauteng","Hospitality","workwear;merchandise",250000,"Hotel chain",referral,priority`;

export default function AdminLeadsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"upload" | "pool" | "activity">("pool");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedLeads, setParsedLeads] = useState<ParsedLead[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ inserted: number; skipped: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [poolFilter, setPoolFilter] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Queries
  const allLeads = useQuery(
    api.leads.getAllLeadsAdmin, 
    { status: statusFilter as any || undefined, poolTier: poolFilter as any || undefined }
  );
  const allActivity = useQuery(api.leads.getAllLeadActivity);
  // Queries - pass empty object to match Convex args
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate, {});

  // Mutations
  const bulkUploadLeads = useMutation(api.leads.bulkUploadLeads);
  const adminReleaseLead = useMutation(api.leads.adminReleaseLead);
  const adminRetireLead = useMutation(api.leads.adminRetireLead);
  const adminDeleteLead = useMutation(api.leads.adminDeleteLead);
  const adminReassignLead = useMutation(api.leads.adminReassignLead);
  const seedDemoLeads = useMutation(api.leads.seedDemoLeads);

  // Get user ID on mount
  useMemo(() => {
    if (typeof window !== "undefined") {
      const userIdElement = document.querySelector('[data-clerk-user-id]');
      if (userIdElement) {
        setCurrentUserId(userIdElement.getAttribute("data-clerk-user-id") || "");
      }
    }
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    setUploadedFile(file);
    setUploadResult(null);

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const leads: ParsedLead[] = results.data.map((row: any) => ({
            companyName: row.companyName || "",
            contactName: row.contactName || undefined,
            contactEmail: row.contactEmail || undefined,
            contactPhone: row.contactPhone || undefined,
            city: row.city || undefined,
            province: row.province || undefined,
            industry: row.industry || undefined,
            productInterest: row.productInterest ? row.productInterest.split(";").map((p: string) => p.trim()) : undefined,
            estimatedBudget: row.estimatedBudget ? parseInt(row.estimatedBudget) : undefined,
            notes: row.notes || undefined,
            source: row.source || undefined,
            poolTier: row.poolTier as any || "standard",
          })).filter((l: ParsedLead) => l.companyName);
          setParsedLeads(leads);
        },
      });
    } else if (extension === "xlsx" || extension === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        const leads: ParsedLead[] = json.map((row: any) => ({
          companyName: row.companyName || "",
          contactName: row.contactName || undefined,
          contactEmail: row.contactEmail || undefined,
          contactPhone: row.contactPhone || undefined,
          city: row.city || undefined,
          province: row.province || undefined,
          industry: row.industry || undefined,
          productInterest: row.productInterest ? row.productInterest.split(";").map((p: string) => p.trim()) : undefined,
          estimatedBudget: row.estimatedBudget ? parseInt(row.estimatedBudget) : undefined,
          notes: row.notes || undefined,
          source: row.source || undefined,
          poolTier: row.poolTier || "standard",
        })).filter((l: ParsedLead) => l.companyName);
        setParsedLeads(leads);
      };
      reader.readAsBinaryString(file);
    }
  }, []);

  const handleUploadBatch = async () => {
    if (parsedLeads.length === 0) return;
    setUploading(true);

    try {
      const uploadBatchId = nanoid();
      const result = await bulkUploadLeads({
        leads: parsedLeads,
        uploadBatchId,
        adminClerkUserId: currentUserId,
      });
      setUploadResult({ inserted: result.inserted, skipped: result.skippedDuplicates });
      setParsedLeads([]);
      setUploadedFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
    }

    setUploading(false);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads_template.csv";
    a.click();
  };

  const handleSeedDemo = async () => {
    if (confirm("Seed demo leads? This will fail if leads already exist.")) {
      await seedDemoLeads({ adminClerkUserId: currentUserId });
    }
  };

  const filteredLeads = allLeads?.filter((lead) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        lead.companyName.toLowerCase().includes(term) ||
        lead.city?.toLowerCase().includes(term) ||
        lead.industry?.toLowerCase().includes(term)
      );
    }
    return true;
  }) || [];

  const tabs = [
    { id: "upload", label: "Upload", icon: Upload },
    { id: "pool", label: "Active Pool", icon: Table },
    { id: "activity", label: "Activity Log", icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div>
          <p className="rs-overline">Admin</p>
          <h1 className="rs-page-title">Lead Management</h1>
          <p className="text-gray-400">Manage leads, bulk upload, and track activity</p>
        </div>
        <button
          onClick={handleSeedDemo}
          className="px-4 py-2 rs-btn-primary text-sm font-medium transition-colors"
        >
          Seed Demo Leads
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                isActive ? "text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--rs-accent)]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Template download */}
            <div className="rs-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">CSV Template</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Download this template and fill in your leads data
                  </p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
            </div>

            {/* File drop zone */}
            <div
              onClick={() => document.getElementById("fileInput")?.click()}
              className="rs-card border-2 border-dashed border-white/10 hover:border-[var(--rs-accent)]/50 transition-colors cursor-pointer text-center"
            >
              <input
                id="fileInput"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />
              {uploadedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileSpreadsheet className="w-10 h-10 text-green-400" />
                  <div className="text-left">
                    <p className="text-white font-medium">{uploadedFile.name}</p>
                    <p className="text-gray-400 text-sm">{parsedLeads.length} leads detected</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-white font-medium">
                    Drop your CSV or Excel file here
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    or click to browse
                  </p>
                </>
              )}
            </div>

            {/* Preview */}
            {parsedLeads.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">
                    Preview ({parsedLeads.length} leads)
                  </h3>
                  <button
                    onClick={handleUploadBatch}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    {uploading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Upload Batch
                  </button>
                </div>

                <div className="rs-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left p-4 text-gray-400 text-sm font-medium">Company</th>
                          <th className="text-left p-4 text-gray-400 text-sm font-medium">Contact</th>
                          <th className="text-left p-4 text-gray-400 text-sm font-medium">Location</th>
                          <th className="text-left p-4 text-gray-400 text-sm font-medium">Industry</th>
                          <th className="text-left p-4 text-gray-400 text-sm font-medium">Pool</th>
                          <th className="text-left p-4 text-gray-400 text-sm font-medium">Budget</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedLeads.slice(0, 20).map((lead, i) => (
                          <tr key={i} className="border-b border-white/5">
                            <td className="p-4 text-white">{lead.companyName}</td>
                            <td className="p-4 text-gray-300">{lead.contactName}</td>
                            <td className="p-4 text-gray-300">
                              {lead.city}
                              {lead.province && `, ${lead.province}`}
                            </td>
                            <td className="p-4 text-gray-300">{lead.industry}</td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  lead.poolTier === "premium"
                                    ? "bg-[var(--rs-info)]/10 text-[var(--rs-info)]"
                                    : lead.poolTier === "priority"
                                    ? "bg-[var(--rs-info)]/10 text-[var(--rs-info)]"
                                    : "bg-gray-500/10 text-gray-400"
                                }`}
                              >
                                {lead.poolTier}
                              </span>
                            </td>
                            <td className="p-4 text-gray-300">
                              {lead.estimatedBudget && formatCurrency(lead.estimatedBudget)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedLeads.length > 20 && (
                    <div className="p-4 text-center text-gray-400 text-sm">
                      ...and {parsedLeads.length - 20} more leads
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Result */}
            {uploadResult && (
              <div className="rs-card p-6" style={{ borderColor: 'var(--rs-success)', borderWidth: 1 }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Upload Complete</p>
                    <p className="text-gray-400 text-sm">
                      {uploadResult.inserted} inserted, {uploadResult.skipped} duplicates skipped
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "pool" && (
          <motion.div
            key="pool"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#141417] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-[#141417] border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="claimed">Claimed</option>
                <option value="converted">Converted</option>
                <option value="expired">Expired</option>
                <option value="retired">Retired</option>
              </select>
              <select
                value={poolFilter}
                onChange={(e) => setPoolFilter(e.target.value)}
                className="px-4 py-2 bg-[#141417] border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">All Pools</option>
                <option value="standard">Standard</option>
                <option value="priority">Priority</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="rs-card p-4">
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-white">{allLeads?.length || 0}</p>
              </div>
              <div className="rs-card p-4">
                <p className="text-gray-400 text-sm">Available</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {allLeads?.filter((l) => l.status === "available").length || 0}
                </p>
              </div>
              <div className="rs-card p-4">
                <p className="text-gray-400 text-sm">Claimed</p>
                <p className="text-2xl font-bold text-blue-400">
                  {allLeads?.filter((l) => l.status === "claimed").length || 0}
                </p>
              </div>
              <div className="rs-card p-4">
                <p className="text-gray-400 text-sm">Converted</p>
                <p className="text-2xl font-bold text-purple-400">
                  {allLeads?.filter((l) => l.status === "converted").length || 0}
                </p>
              </div>
              <div className="rs-card p-4">
                <p className="text-gray-400 text-sm">Retired</p>
                <p className="text-2xl font-bold text-gray-400">
                  {allLeads?.filter((l) => l.status === "retired").length || 0}
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="rs-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">Company</th>
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">Location</th>
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">Industry</th>
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">Pool</th>
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">Status</th>
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">Budget</th>
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.slice(0, 50).map((lead) => (
                      <tr key={lead._id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-4">
                          <p className="text-white font-medium">{lead.companyName}</p>
                          <p className="text-gray-400 text-sm">{lead.contactName}</p>
                        </td>
                        <td className="p-4 text-gray-300">
                          {lead.city}
                          {lead.province && `, ${lead.province}`}
                        </td>
                        <td className="p-4 text-gray-300">{lead.industry}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              lead.poolTier === "premium"
                                ? "bg-[var(--rs-info)]/10 text-[var(--rs-info)]"
                                : lead.poolTier === "priority"
                                ? "bg-[var(--rs-info)]/10 text-[var(--rs-info)]"
                                : "bg-gray-500/10 text-gray-400"
                            }`}
                          >
                            {lead.poolTier}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              lead.status === "available"
                                ? "bg-[var(--rs-success)]/10 text-[var(--rs-success)]"
                                : lead.status === "claimed"
                                ? "bg-[var(--rs-info)]/10 text-[var(--rs-info)]"
                                : lead.status === "converted"
                                ? "bg-[var(--rs-info)]/10 text-[var(--rs-info)]"
                                : lead.status === "retired"
                                ? "bg-gray-500/10 text-gray-400"
                                : "bg-[var(--rs-danger)]/10 text-[var(--rs-danger)]"
                            }`}
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-300">
                          {lead.estimatedBudget && formatCurrency(lead.estimatedBudget)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {lead.status === "claimed" && (
                              <button
                                onClick={() =>
                                  adminReleaseLead({
                                    leadId: lead._id,
                                    adminClerkUserId: currentUserId,
                                  })
                                }
                                className="p-2 text-gray-400 hover:text-[var(--rs-warning)] hover:bg-[var(--rs-warning)]/10 rounded-lg transition-colors"
                                title="Force Release"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                adminRetireLead({
                                  leadId: lead._id,
                                  adminClerkUserId: currentUserId,
                                })
                              }
                              className="p-2 text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"
                              title="Retire"
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                adminDeleteLead({
                                  leadId: lead._id,
                                  adminClerkUserId: currentUserId,
                                })
                              }
                              className="p-2 text-gray-400 hover:text-[var(--rs-danger)] hover:bg-[var(--rs-danger)]/10 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredLeads.length === 0 && (
                <div className="p-12 text-center text-gray-400">
                  No leads found
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "activity" && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="rs-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">Time</th>
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">Action</th>
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">Lead</th>
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allActivity?.slice(0, 50).map((activity) => (
                      <tr key={activity._id} className="border-b border-white/5">
                        <td className="p-4 text-gray-300">
                          {new Date(activity.createdAt).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              activity.action === "uploaded"
                                ? "bg-green-500/10 text-green-400"
                                : activity.action === "claimed"
                                ? "bg-[var(--rs-info)]/10 text-[var(--rs-info)]"
                                : activity.action === "converted"
                                ? "bg-[var(--rs-info)]/10 text-[var(--rs-info)]"
                                : activity.action === "released" ||
                                  activity.action === "expired"
                                ? "bg-[var(--rs-warning)]/10 text-[var(--rs-warning)]"
                                : activity.action === "retired"
                                ? "bg-gray-500/10 text-gray-400"
                                : "bg-orange-500/10 text-orange-400"
                            }`}
                          >
                            {activity.action}
                          </span>
                        </td>
                        <td className="p-4 text-white">
                          {allLeads?.find((l) => l._id === activity.leadId)?.companyName || 
                           activity.leadId.slice(0, 8)}
                        </td>
                        <td className="p-4 text-gray-300 text-sm">
                          {activity.meta && JSON.stringify(JSON.parse(activity.meta))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(!allActivity || allActivity.length === 0) && (
                <div className="p-12 text-center text-gray-400">
                  No activity yet
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}