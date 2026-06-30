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
  Square,
  CheckSquare,
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
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState<{ open: boolean; count: number }>({ open: false, count: 0 });
  const [bulkDeleting, setBulkDeleting] = useState(false);

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
  const adminBulkDeleteLeads = useMutation(api.leads.adminBulkDeleteLeads);
  const adminReassignLead = useMutation(api.leads.adminReassignLead);

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

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) {
        next.delete(leadId);
      } else {
        next.add(leadId);
      }
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleLeadIds.forEach((id) => next.delete(id));
      } else {
        visibleLeadIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedLeadIds(new Set());

  const handleBulkDeleteClick = () => {
    if (selectedLeadIds.size === 0) return;
    setBulkDeleteConfirm({ open: true, count: selectedLeadIds.size });
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedLeadIds.size === 0) return;
    setBulkDeleting(true);
    try {
      const ids = Array.from(selectedLeadIds);
      // Chunk to avoid the 16k-arg Convex limit and to keep responses snappy
      const CHUNK = 100;
      let totalDeleted = 0;
      let totalSkipped = 0;
      for (let i = 0; i < ids.length; i += CHUNK) {
        const batch = ids.slice(i, i + CHUNK);
        const result = await adminBulkDeleteLeads({
          leadIds: batch,
          confirm: "DELETE" as const,
        });
        totalDeleted += result.deleted;
        totalSkipped += result.skipped;
      }
      console.log(
        `[bulk delete] removed ${totalDeleted} leads (${totalSkipped} skipped)`,
      );
      setSelectedLeadIds(new Set());
      setBulkDeleteConfirm({ open: false, count: 0 });
    } catch (error) {
      console.error("Bulk delete failed:", error);
      alert(`Bulk delete failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setBulkDeleting(false);
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

  const visibleLeadIds = filteredLeads.slice(0, 50).map((l) => l._id);
  const allVisibleSelected =
    visibleLeadIds.length > 0 && visibleLeadIds.every((id) => selectedLeadIds.has(id));
  const someVisibleSelected =
    visibleLeadIds.some((id) => selectedLeadIds.has(id)) && !allVisibleSelected;

  const tabs = [
    { id: "upload", label: "Upload", icon: Upload },
    { id: "pool", label: "Active Pool", icon: Table },
    { id: "activity", label: "Activity Log", icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rs-page-header">
        <div>
          <span className="rs-overline">Admin</span>
          <h1 className="rs-page-title mt-1">Lead Management</h1>
          <p className="rs-page-subtitle">Manage leads, bulk upload, and track activity</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: "var(--rs-border)" }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                isActive ? "text-white" : ""
              }`}
              style={isActive ? undefined : { color: "var(--rs-text-secondary)" }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: "var(--rs-accent)" }}
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
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-white font-semibold">CSV Template</h3>
                  <p className="text-sm mt-1" style={{ color: "var(--rs-text-secondary)" }}>
                    Download this template and fill in your leads data
                  </p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="rs-btn-ghost flex items-center gap-2 px-4 py-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
            </div>

            {/* File drop zone */}
            <div
              onClick={() => document.getElementById("fileInput")?.click()}
              className="rs-card border-2 border-dashed p-10 transition-colors cursor-pointer text-center"
              style={{ borderColor: "var(--rs-border)" }}
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
                  <FileSpreadsheet className="w-10 h-10" style={{ color: "rgb(74,222,128)" }} />
                  <div className="text-left">
                    <p className="text-white font-medium">{uploadedFile.name}</p>
                    <p className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>{parsedLeads.length} leads detected</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--rs-text-muted)" }} />
                  <p className="text-white font-medium">
                    Drop your CSV or Excel file here
                  </p>
                  <p className="text-sm mt-1" style={{ color: "var(--rs-text-secondary)" }}>
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
                    className="rs-btn-primary flex items-center gap-2 text-sm disabled:opacity-60"
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
                    <table className="rs-table w-full">
                      <thead>
                        <tr>
                          <th>Company</th>
                          <th>Contact</th>
                          <th>Location</th>
                          <th>Industry</th>
                          <th>Pool</th>
                          <th>Budget</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedLeads.slice(0, 20).map((lead, i) => (
                          <tr key={i}>
                            <td>{lead.companyName}</td>
                            <td>{lead.contactName}</td>
                            <td>
                              {lead.city}
                              {lead.province && `, ${lead.province}`}
                            </td>
                            <td>{lead.industry}</td>
                            <td>
                              <span
                                className="rs-pill"
                                style={
                                  lead.poolTier === "premium"
                                    ? { background: "rgba(124,58,237,0.10)", color: "var(--rs-text-accent)", borderColor: "rgba(124,58,237,0.20)" }
                                    : lead.poolTier === "priority"
                                    ? { background: "rgba(59,130,246,0.10)", color: "rgb(96,165,250)", borderColor: "rgba(59,130,246,0.20)" }
                                    : { background: "rgba(255,255,255,0.04)", color: "var(--rs-text-secondary)", borderColor: "var(--rs-border)" }
                                }
                              >
                                {lead.poolTier}
                              </span>
                            </td>
                            <td>
                              {lead.estimatedBudget && formatCurrency(lead.estimatedBudget)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedLeads.length > 20 && (
                    <div className="p-4 text-center text-sm" style={{ color: "var(--rs-text-secondary)" }}>
                      ...and {parsedLeads.length - 20} more leads
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Result */}
            {uploadResult && (
              <div className="rs-callout rs-callout--success">
                <div className="flex items-center gap-3">
                  <div className="rs-icon-tile rs-icon-tile--success">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Upload Complete</p>
                    <p className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>
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
            <div className="rs-card p-4">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
                    <input
                      type="text"
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="rs-input w-full pl-10"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rs-input md:w-44"
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
                  className="rs-input md:w-44"
                >
                  <option value="">All Pools</option>
                  <option value="standard">Standard</option>
                  <option value="priority">Priority</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="rs-card p-4">
                <p className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--rs-text-muted)" }}>Total</p>
                <p className="rs-stat text-2xl text-white mt-1">{allLeads?.length || 0}</p>
              </div>
              <div className="rs-card p-4">
                <p className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--rs-text-muted)" }}>Available</p>
                <p className="rs-stat text-2xl mt-1" style={{ color: "rgb(74,222,128)" }}>
                  {allLeads?.filter((l) => l.status === "available").length || 0}
                </p>
              </div>
              <div className="rs-card p-4">
                <p className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--rs-text-muted)" }}>Claimed</p>
                <p className="rs-stat text-2xl mt-1" style={{ color: "rgb(96,165,250)" }}>
                  {allLeads?.filter((l) => l.status === "claimed").length || 0}
                </p>
              </div>
              <div className="rs-card p-4">
                <p className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--rs-text-muted)" }}>Converted</p>
                <p className="rs-stat text-2xl mt-1" style={{ color: "var(--rs-text-accent)" }}>
                  {allLeads?.filter((l) => l.status === "converted").length || 0}
                </p>
              </div>
              <div className="rs-card p-4">
                <p className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--rs-text-muted)" }}>Retired</p>
                <p className="rs-stat text-2xl mt-1" style={{ color: "var(--rs-text-secondary)" }}>
                  {allLeads?.filter((l) => l.status === "retired").length || 0}
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="rs-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="rs-table w-full">
                  <thead>
                    <tr>
                      <th className="w-10">
                        <button
                          onClick={toggleSelectAllVisible}
                          className="flex items-center justify-center hover:text-white transition-colors"
                          style={{ color: "var(--rs-text-secondary)" }}
                          title={allVisibleSelected ? "Deselect all" : "Select all visible"}
                        >
                          {allVisibleSelected ? (
                            <CheckSquare className="w-4 h-4" style={{ color: "var(--rs-text-accent)" }} />
                          ) : someVisibleSelected ? (
                            <CheckSquare className="w-4 h-4" style={{ color: "rgba(124,58,237,0.55)" }} />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th>Company</th>
                      <th>Location</th>
                      <th>Industry</th>
                      <th>Pool</th>
                      <th>Status</th>
                      <th>Budget</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.slice(0, 50).map((lead) => (
                      <tr
                        key={lead._id}
                        style={selectedLeadIds.has(lead._id) ? { background: "var(--rs-accent-soft)" } : undefined}
                      >
                        <td className="w-10">
                          <button
                            onClick={() => toggleLeadSelection(lead._id)}
                            className="flex items-center justify-center hover:text-white transition-colors"
                            style={{ color: "var(--rs-text-secondary)" }}
                            title={selectedLeadIds.has(lead._id) ? "Deselect" : "Select"}
                          >
                            {selectedLeadIds.has(lead._id) ? (
                              <CheckSquare className="w-4 h-4" style={{ color: "var(--rs-text-accent)" }} />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td>
                          <p className="font-medium text-white">{lead.companyName}</p>
                          <p className="text-xs" style={{ color: "var(--rs-text-secondary)" }}>{lead.contactName}</p>
                        </td>
                        <td style={{ color: "var(--rs-text-secondary)" }}>
                          {lead.city}
                          {lead.province && `, ${lead.province}`}
                        </td>
                        <td style={{ color: "var(--rs-text-secondary)" }}>{lead.industry}</td>
                        <td>
                          <span
                            className="rs-pill"
                            style={
                              lead.poolTier === "premium"
                                ? { background: "rgba(124,58,237,0.10)", color: "var(--rs-text-accent)", borderColor: "rgba(124,58,237,0.20)" }
                                : lead.poolTier === "priority"
                                ? { background: "rgba(59,130,246,0.10)", color: "rgb(96,165,250)", borderColor: "rgba(59,130,246,0.20)" }
                                : { background: "rgba(255,255,255,0.04)", color: "var(--rs-text-secondary)", borderColor: "var(--rs-border)" }
                            }
                          >
                            {lead.poolTier}
                          </span>
                        </td>
                        <td>
                          <span
                            className="rs-pill"
                            style={
                              lead.status === "available"
                                ? { background: "rgba(34,197,94,0.10)", color: "rgb(74,222,128)", borderColor: "rgba(34,197,94,0.20)" }
                                : lead.status === "claimed"
                                ? { background: "rgba(59,130,246,0.10)", color: "rgb(96,165,250)", borderColor: "rgba(59,130,246,0.20)" }
                                : lead.status === "converted"
                                ? { background: "rgba(124,58,237,0.10)", color: "var(--rs-text-accent)", borderColor: "rgba(124,58,237,0.20)" }
                                : lead.status === "retired"
                                ? { background: "rgba(255,255,255,0.04)", color: "var(--rs-text-secondary)", borderColor: "var(--rs-border)" }
                                : { background: "rgba(239,68,68,0.10)", color: "rgb(248,113,113)", borderColor: "rgba(239,68,68,0.20)" }
                            }
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td style={{ color: "var(--rs-text-secondary)" }}>
                          {lead.estimatedBudget && formatCurrency(lead.estimatedBudget)}
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            {lead.status === "claimed" && (
                              <button
                                onClick={() =>
                                  adminReleaseLead({
                                    leadId: lead._id,
                                    adminClerkUserId: currentUserId,
                                  })
                                }
                                className="rs-btn-ghost p-2"
                                style={{ color: "var(--rs-warning)" }}
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
                              className="rs-btn-ghost p-2"
                              style={{ color: "rgb(251,146,60)" }}
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
                              className="rs-btn-ghost p-2"
                              style={{ color: "rgb(248,113,113)" }}
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
                <div className="rs-empty-state">
                  <p className="rs-empty-state-title">No leads found</p>
                  <p className="rs-empty-state-description">Upload a CSV or adjust filters.</p>
                </div>
              )}
            </div>

            {/* Floating action bar */}
            <AnimatePresence>
              {selectedLeadIds.size > 0 && (
                <motion.div
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 80, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
                >
                  <div className="rs-card flex items-center gap-3 px-4 py-3 shadow-2xl" style={{ boxShadow: "0 12px 32px rgba(0,0,0,0.6)" }}>
                    <span className="text-white text-sm font-medium">
                      {selectedLeadIds.size} lead{selectedLeadIds.size === 1 ? "" : "s"} selected
                    </span>
                    <div className="h-5 w-px" style={{ background: "var(--rs-border)" }} />
                    <button
                      onClick={clearSelection}
                      className="rs-btn-ghost text-sm px-3 py-1.5"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleBulkDeleteClick}
                      className="rs-btn-primary flex items-center gap-2 px-4 py-2 text-sm"
                      style={{ background: "rgba(239,68,68,0.85)" }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete selected
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bulk delete confirmation modal */}
            <AnimatePresence>
              {bulkDeleteConfirm.open && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rs-modal-backdrop"
                  onClick={() => !bulkDeleting && setBulkDeleteConfirm({ open: false, count: 0 })}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="rs-modal max-w-md w-full p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rs-icon-tile rs-icon-tile--danger">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">Delete {bulkDeleteConfirm.count} lead{bulkDeleteConfirm.count === 1 ? "" : "s"}?</h3>
                        <p className="text-sm mt-2" style={{ color: "var(--rs-text-secondary)" }}>
                          This action cannot be undone. Any deals previously created from these leads
                          will keep their data, but lose the link back to the lead.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => setBulkDeleteConfirm({ open: false, count: 0 })}
                        disabled={bulkDeleting}
                        className="rs-btn-ghost text-sm disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleBulkDeleteConfirm}
                        disabled={bulkDeleting}
                        className="rs-btn-primary flex items-center gap-2 text-sm disabled:opacity-60"
                        style={{ background: "rgba(239,68,68,0.85)" }}
                      >
                        {bulkDeleting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            Delete {bulkDeleteConfirm.count} lead{bulkDeleteConfirm.count === 1 ? "" : "s"}
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
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
                <table className="rs-table w-full">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Action</th>
                      <th>Lead</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allActivity?.slice(0, 50).map((activity) => (
                      <tr key={activity._id}>
                        <td style={{ color: "var(--rs-text-secondary)" }}>
                          {new Date(activity.createdAt).toLocaleString()}
                        </td>
                        <td>
                          <span
                            className="rs-pill"
                            style={
                              activity.action === "uploaded"
                                ? { background: "rgba(34,197,94,0.10)", color: "rgb(74,222,128)", borderColor: "rgba(34,197,94,0.20)" }
                                : activity.action === "claimed"
                                ? { background: "rgba(59,130,246,0.10)", color: "rgb(96,165,250)", borderColor: "rgba(59,130,246,0.20)" }
                                : activity.action === "converted"
                                ? { background: "rgba(124,58,237,0.10)", color: "var(--rs-text-accent)", borderColor: "rgba(124,58,237,0.20)" }
                                : activity.action === "released" || activity.action === "expired"
                                ? { background: "rgba(245,158,11,0.10)", color: "rgb(251,191,36)", borderColor: "rgba(245,158,11,0.20)" }
                                : activity.action === "retired"
                                ? { background: "rgba(255,255,255,0.04)", color: "var(--rs-text-secondary)", borderColor: "var(--rs-border)" }
                                : { background: "rgba(249,115,22,0.10)", color: "rgb(251,146,60)", borderColor: "rgba(249,115,22,0.20)" }
                            }
                          >
                            {activity.action}
                          </span>
                        </td>
                        <td className="text-white">
                          {allLeads?.find((l) => l._id === activity.leadId)?.companyName ||
                           activity.leadId.slice(0, 8)}
                        </td>
                        <td className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>
                          {activity.meta && JSON.stringify(JSON.parse(activity.meta))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(!allActivity || allActivity.length === 0) && (
                <div className="rs-empty-state">
                  <p className="rs-empty-state-title">No activity yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}