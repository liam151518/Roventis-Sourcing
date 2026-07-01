"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  X, 
  Building, 
  Building2,
  Mail, 
  Phone, 
  Calendar, 
  DollarSign,
  Search,
  Filter,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Edit,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  GripVertical,
  User,
  Image,
  FileText,
  Target,
  MapPin,
  Pencil,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatCurrency, formatDate, dealStatuses, getTierCommissionRate } from "@/lib/utils";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const columns = [
  { id: "prospect", label: "Prospect", color: "bg-[var(--rs-text-muted)]" },
  { id: "qualified", label: "Qualified", color: "bg-[var(--rs-info)]" },
  { id: "proposal_sent", label: "Proposal", color: "bg-amber-400" },
  { id: "negotiation", label: "Negotiation", color: "bg-orange-400" },
  { id: "closed_won", label: "Closed Won", color: "bg-emerald-400" },
  { id: "closed_lost", label: "Closed Lost", color: "bg-rose-400" },
];

// Countdown Badge for leads
function CountdownBadge({ expiresAt }: { expiresAt: number }) {
  const [timeLeft, setTimeLeft] = useState("");
  
  useEffect(() => {
    const update = () => {
      const diff = expiresAt - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }
      const hours = Math.floor(diff / (60 * 60 * 1000));
      const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      setTimeLeft(`${hours}h ${mins}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [expiresAt]);
  
  const urgency = expiresAt - Date.now();
  const color = urgency < 6 * 60 * 60 * 1000 ? "text-red-400" : 
               urgency < 24 * 60 * 60 * 1000 ? "text-amber-400" : 
               "text-blue-400";

  return (
    <span className={`flex items-center gap-1 px-2 py-1 rounded-lg ${color} bg-current/10 text-xs font-medium`}>
      <Clock className="w-3 h-3" />
      {timeLeft}
    </span>
  );
}

// Sortable Deal Card Component
function SortableDealCard({ deal, onClick, searchQuery }: { deal: any; onClick: () => void; searchQuery?: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Check if this deal came from a lead
  const isFromLead = !!deal.fromLeadId;
  const leadExpiringSoon = deal.leadClaimExpiresAt && (deal.leadClaimExpiresAt - Date.now()) < 24 * 60 * 60 * 1000;
  const leadUrgent = deal.leadClaimExpiresAt && (deal.leadClaimExpiresAt - Date.now()) < 6 * 60 * 60 * 1000;

  // Highlight matching text
  const highlightMatch = (text: string) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-blue-500/40 text-blue-300 rounded px-0.5">
          {part}
        </mark>
      ) : part
    );
  };

  const isMatch = searchQuery && (
    deal.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.clientCompany?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: "var(--rs-bg-base)",
        borderColor: isFromLead
          ? leadUrgent
            ? "rgba(239,68,68,0.5)"
            : leadExpiringSoon
              ? "rgba(245,158,11,0.5)"
              : "var(--rs-border-focus)"
          : isMatch
            ? "var(--rs-border-focus)"
            : "var(--rs-border)",
      }}
      className={`group rounded-lg p-3 border transition-all hover:shadow-lg hover:shadow-black/20 cursor-pointer ${
        isDragging ? "opacity-50 z-50" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start">
        {isFromLead && (
          <div className="mr-1" title="From Lead">
            <Target className="w-3 h-3" style={{ color: "var(--rs-text-accent)" }} />
          </div>
        )}
        <button
          {...attributes}
          {...listeners}
          className="p-1 rounded hover:bg-white/5 cursor-grab active:cursor-grabbing mr-1"
          style={{ color: "var(--rs-text-muted)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate group-hover:text-[var(--rs-text-accent)] transition-colors">
            {highlightMatch(deal.clientName)}
          </h3>
          {deal.clientCompany && (
            <p className="text-xs mt-0.5 truncate" style={{ color: "var(--rs-text-muted)" }}>
              {highlightMatch(deal.clientCompany)}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 ml-5">
        <span className="font-bold text-white text-sm rs-stat">{formatCurrency(deal.dealValue)}</span>
        {deal.expectedCloseDate && (
          <span className="text-xs flex items-center gap-1" style={{ color: "var(--rs-text-muted)" }}>
            <Calendar className="w-3 h-3" />
            {formatDate(deal.expectedCloseDate)}
          </span>
        )}
      </div>
      
      {/* Commission status badges for Closed Won deals */}
      {deal.status === "closed_won" && (
        <div className="flex flex-wrap gap-1 mt-2 ml-5">
          {!deal.orderSubmitted && (
            <span className="rs-pill animate-pulse" style={{
              background: "rgba(245,158,11,0.10)",
              borderColor: "rgba(245,158,11,0.25)",
              color: "var(--rs-warning)",
            }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--rs-warning)" }} />
              Submit Order
            </span>
          )}
          {deal.orderSubmitted && deal.commissionStatus === "pending" && (
            <span className="rs-pill rs-pill--info">
              Awaiting Approval
            </span>
          )}
          {deal.commissionStatus === "approved" && (
            <span className="rs-pill rs-pill--info">
              Approved
            </span>
          )}
          {deal.commissionStatus === "paid" && (
            <span className="rs-pill" style={{
              background: "rgba(16,185,129,0.10)",
              borderColor: "rgba(16,185,129,0.25)",
              color: "var(--rs-success)",
            }}>
              Commission Paid
            </span>
          )}
        </div>
      )}

      {deal.productCategory && deal.productCategory.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 ml-5">
          {deal.productCategory.slice(0, 2).map((cat: string) => (
            <span key={cat} className="rs-pill">
              {cat}
            </span>
          ))}
          {deal.productCategory.length > 2 && (
            <span className="rs-pill">
              +{deal.productCategory.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Drag Overlay Deal Card
function DealCardOverlay({ deal }: { deal: any }) {
  return (
    <div
      className="rounded-lg p-3 border-2 shadow-2xl cursor-grabbing"
      style={{
        background: "var(--rs-bg-base)",
        borderColor: "var(--rs-text-accent)",
      }}
    >
      <div className="flex items-start">
        <GripVertical className="w-3.5 h-3.5 mr-1" style={{ color: "var(--rs-text-muted)" }} />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate">
            {deal.clientName}
          </h3>
          {deal.clientCompany && (
            <p className="text-xs mt-0.5 truncate" style={{ color: "var(--rs-text-muted)" }}>
              {deal.clientCompany}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 ml-5">
        <span className="font-bold text-white text-sm rs-stat">{formatCurrency(deal.dealValue)}</span>
      </div>
    </div>
  );
}

// Droppable Column Component
function DroppableColumn({ 
  columnId, 
  children 
}: { 
  columnId: string; 
  children: React.ReactNode 
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
  });

  return (
    <div
      ref={setNodeRef}
      className="transition-colors"
      style={{
        background: isOver ? "var(--rs-accent-soft)" : "transparent",
        borderRadius: 10,
      }}
    >
      {children}
    </div>
  );
}

export default function DealsPage() {
  const deals = useQuery(api.deals.getAllDeals);
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate, {});
  const myClaimedLeads = useQuery(
    api.leads.getMyClaimedLeads,
    currentAffiliate?._id ? { affiliateId: currentAffiliate._id as string } : "skip"
  );
  const createDeal = useMutation(api.deals.createDeal);
  const updateDeal = useMutation(api.deals.updateDeal);
  const deleteDeal = useMutation(api.deals.deleteDeal);
  const submitOrder = useMutation(api.deals.submitOrder);
  const convertLeadToDeal = useMutation(api.leads.convertLeadToDeal);
  const releaseLead = useMutation(api.leads.releaseLead);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    clientName: "",
    clientCompany: "",
    clientEmail: "",
    clientPhone: "",
    dealValue: 0,
    productCategory: [] as string[],
    description: "",
    expectedCloseDate: null as number | null,
  });
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({
    // Client Info
    clientName: "",
    clientCompany: "",
    clientEmail: "",
    clientPhone: "",
    deliveryAddress: "",
    // Company Details
    companyName: "",
    companyRegistrationNumber: "",
    companyVATNumber: "",
    companyWebsite: "",
    companyAddress: "",
    contactPersonName: "",
    contactPersonEmail: "",
    contactPersonPhone: "",
    // Documents
    invoiceDocument: "",
    legalDocument: "",
    paymentProof: "",
    customLogo: "",
    productImages: [] as string[],
    mockupPhotos: [] as string[],
    // Notes
    orderNotes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDeal, setActiveDeal] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "" as string,
    minValue: "" as string,
    maxValue: "" as string,
  });

  // Helper functions for URL arrays
  const handleAddUrl = (field: "productImages" | "mockupPhotos", url: string) => {
    if (url.trim()) {
      setOrderForm({
        ...orderForm,
        [field]: [...orderForm[field], url.trim()]
      });
    }
  };

  const handleRemoveUrl = (field: "productImages" | "mockupPhotos", index: number) => {
    const newUrls = [...orderForm[field]];
    newUrls.splice(index, 1);
    setOrderForm({
      ...orderForm,
      [field]: newUrls
    });
  };
  
  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const deal = filteredDeals.find(d => d._id === active.id);
    if (deal) {
      setActiveDeal(deal);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const activeDealId = active.id as string;
    const overId = over.id as string;

    // Check if over is a column (column header)
    let destColumn = columns.find(col => col.id === overId)?.id;
    
    // If not a column, check if over is a deal and find its column
    if (!destColumn) {
      const overDeal = filteredDeals.find(d => d._id === overId);
      if (overDeal) {
        destColumn = overDeal.status;
      }
    }

    // Find source column
    const sourceDeal = filteredDeals.find(d => d._id === activeDealId);
    const sourceColumn = sourceDeal?.status;

    if (sourceColumn && destColumn && sourceColumn !== destColumn) {
      // Update the deal status
      updateDeal({ id: activeDealId, status: destColumn as any });
    }
  };
  
  const affiliateId = currentAffiliate?._id as string;
  const userDeals = currentAffiliate ? (deals || []).filter(d => d.affiliateId === currentAffiliate._id) : [];
  
  const filteredDeals = userDeals.filter(d => {
    // Search filter
    const matchesSearch = !searchQuery || 
      d.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.clientCompany?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = !filters.status || d.status === filters.status;
    
    // Value filters
    const matchesMinValue = !filters.minValue || d.dealValue >= Number(filters.minValue);
    const matchesMaxValue = !filters.maxValue || d.dealValue <= Number(filters.maxValue);
    
    return matchesSearch && matchesStatus && matchesMinValue && matchesMaxValue;
  }).sort((a, b) => {
    // Sort matching results to top when searching
    if (!searchQuery) return 0;
    
    const aMatches = a.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                     a.clientCompany?.toLowerCase().includes(searchQuery.toLowerCase());
    const bMatches = b.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                     b.clientCompany?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (aMatches && !bMatches) return -1;
    if (!aMatches && bMatches) return 1;
    return 0;
  });

  // Clear filters
  const clearFilters = () => {
    setFilters({ status: "", minValue: "", maxValue: "" });
    setSearchQuery("");
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || filters.status || filters.minValue || filters.maxValue;

  const getDealsByStatus = (status: string) => 
    filteredDeals.filter(d => d.status === status);

  // Filter columns to show only those with deals when filters are active
  const visibleColumns = hasActiveFilters 
    ? columns.filter(col => getDealsByStatus(col.id).length > 0)
    : columns;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "closed_won": return "bg-emerald-500/10 text-emerald-400";
      case "closed_lost": return "bg-red-500/10 text-red-400";
      case "negotiation": return "bg-orange-500/10 text-orange-400";
      case "proposal_sent": return "bg-amber-500/10 text-amber-400";
      case "qualified": return "bg-blue-500/10 text-blue-400";
      default: return "bg-slate-500/10 text-slate-400";
    }
  };

  const getOrderStatusBadge = (status?: string) => {
    switch (status) {
      case "submitted": return { bg: "bg-blue-500/10", text: "text-blue-400", icon: Clock, label: "Awaiting Approval" };
      case "approved": return { bg: "bg-emerald-500/10", text: "text-emerald-400", icon: CheckCircle, label: "Approved" };
      case "rejected": return { bg: "bg-red-500/10", text: "text-red-400", icon: AlertCircle, label: "Rejected" };
      default: return { bg: "bg-slate-500/10", text: "text-slate-400", icon: AlertCircle, label: "Not Submitted" };
    }
  };

  const handleSubmitOrder = async () => {
    // Check required fields
    const hasClientInfo = orderForm.clientName && orderForm.clientEmail && orderForm.deliveryAddress;
    // Company details required: companyName OR (contactPersonName AND (contactPersonPhone OR contactPersonEmail))
    const hasCompanyName = orderForm.companyName;
    const hasContactPerson = orderForm.contactPersonName && (orderForm.contactPersonPhone || orderForm.contactPersonEmail);
    const hasCompanyDetails = hasCompanyName || hasContactPerson;
    
    if (!selectedDeal || !hasClientInfo || !hasCompanyDetails) return;
    setSubmitting(true);
    try {
      await submitOrder({
        dealId: selectedDeal._id,
        // Client Info
        clientName: orderForm.clientName,
        clientCompany: orderForm.clientCompany || undefined,
        clientEmail: orderForm.clientEmail,
        clientPhone: orderForm.clientPhone || undefined,
        deliveryAddress: orderForm.deliveryAddress,
        // Company Details
        companyName: orderForm.companyName || undefined,
        companyRegistrationNumber: orderForm.companyRegistrationNumber || undefined,
        companyVATNumber: orderForm.companyVATNumber || undefined,
        companyWebsite: orderForm.companyWebsite || undefined,
        companyAddress: orderForm.companyAddress || undefined,
        contactPersonName: orderForm.contactPersonName || undefined,
        contactPersonEmail: orderForm.contactPersonEmail || undefined,
        contactPersonPhone: orderForm.contactPersonPhone || undefined,
        // Documents
        invoiceDocument: orderForm.invoiceDocument || undefined,
        legalDocument: orderForm.legalDocument || undefined,
        paymentProof: orderForm.paymentProof || undefined,
        customLogo: orderForm.customLogo || undefined,
        productImages: orderForm.productImages.length > 0 ? orderForm.productImages : undefined,
        mockupPhotos: orderForm.mockupPhotos.length > 0 ? orderForm.mockupPhotos : undefined,
        // Notes
        orderNotes: orderForm.orderNotes || undefined,
      });
      setShowOrderModal(false);
      setOrderForm({
        clientName: "",
        clientCompany: "",
        clientEmail: "",
        clientPhone: "",
        deliveryAddress: "",
        companyName: "",
        companyRegistrationNumber: "",
        companyVATNumber: "",
        companyWebsite: "",
        companyAddress: "",
        contactPersonName: "",
        contactPersonEmail: "",
        contactPersonPhone: "",
        invoiceDocument: "",
        legalDocument: "",
        paymentProof: "",
        customLogo: "",
        productImages: [],
        mockupPhotos: [],
        orderNotes: "",
      });
      setSelectedDeal(null);
    } catch (error) {
      console.error("Failed to submit order:", error);
    }
    setSubmitting(false);
  };

  const handleCloseWon = async (dealId: string) => {
    await updateDeal({ id: dealId, status: "closed_won", commissionStatus: "pending" });
    setSelectedDeal(null);
  };

  if (!deals || !currentAffiliate) {
    return (
      <div className="space-y-6">
        <div className="rs-skeleton h-8 w-48" />
        <div className="flex gap-3 overflow-x-auto pb-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rs-card p-3 w-64 flex-shrink-0">
              <div className="rs-skeleton h-4 w-32 mb-3" />
              <div className="rs-skeleton h-3 w-20 mb-4" />
              <div className="space-y-2">
                <div className="rs-skeleton h-16" />
                <div className="rs-skeleton h-16" />
                <div className="rs-skeleton h-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <span className="rs-overline">Pipeline</span>
          <h1 className="rs-page-title text-2xl md:text-[28px] mt-1">Deals Pipeline</h1>
          <p className="rs-page-subtitle">Track and manage your sales opportunities</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="rs-btn-primary"
        >
          <Plus className="w-4 h-4" />
          New Deal
        </button>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--rs-text-muted)" }} />
            <input
              type="text"
              placeholder="Search by client name or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rs-input rs-input--search pr-10"
              style={{ height: 38 }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/5"
                style={{ color: "var(--rs-text-muted)" }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter Pill */}
            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="appearance-none pl-3 pr-9 text-xs font-medium rounded-lg transition-all rs-input"
                style={{
                  height: 38,
                  background: filters.status ? "var(--rs-accent-soft)" : "var(--rs-bg-raised)",
                  color: filters.status ? "var(--rs-text-accent)" : "var(--rs-text-secondary)",
                  borderColor: filters.status ? "var(--rs-text-accent)" : "var(--rs-border)",
                  width: "auto",
                  minWidth: 140,
                }}
              >
                <option value="">Status</option>
                <option value="prospect">Prospect</option>
                <option value="qualified">Qualified</option>
                <option value="proposal_sent">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed_won">Closed Won</option>
                <option value="closed_lost">Closed Lost</option>
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none rotate-90" style={{ color: "var(--rs-text-muted)" }} />
            </div>

            {/* Min Value */}
            <div className="relative w-28">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--rs-text-muted)" }}>R</span>
              <input
                type="number"
                placeholder="Min"
                value={filters.minValue}
                onChange={(e) => setFilters({ ...filters, minValue: e.target.value })}
                className="rs-input pl-7 text-xs"
                style={{ height: 38 }}
              />
            </div>

            {/* Max Value */}
            <div className="relative w-28">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--rs-text-muted)" }}>R</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxValue}
                onChange={(e) => setFilters({ ...filters, maxValue: e.target.value })}
                className="rs-input pl-7 text-xs"
                style={{ height: 38 }}
              />
            </div>

            {/* Clear All */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="rs-btn-ghost"
                style={{
                  height: 38,
                  color: "var(--rs-danger)",
                  borderColor: "rgba(239,68,68,0.25)",
                  background: "rgba(239,68,68,0.06)",
                }}
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-xs">
            <span style={{ color: "var(--rs-text-muted)" }}>Showing</span>
            <span className="text-white font-semibold">{filteredDeals.length}</span>
            <span style={{ color: "var(--rs-text-muted)" }}>of</span>
            <span className="text-white font-semibold">{userDeals.length}</span>
            <span style={{ color: "var(--rs-text-muted)" }}>deals</span>
            <div className="flex gap-1.5 ml-1">
              {searchQuery && (
                <span className="rs-pill rs-pill--violet">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery("")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.status && (
                <span className="rs-pill rs-pill--violet capitalize">
                  {filters.status.replace("_", " ")}
                  <button onClick={() => setFilters({ ...filters, status: "" })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {(filters.minValue || filters.maxValue) && (
                <span className="rs-pill rs-pill--violet">
                  R {filters.minValue || "0"} – R {filters.maxValue || "∞"}
                  <button onClick={() => setFilters({ ...filters, minValue: "", maxValue: "" })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {visibleColumns.map((column, colIndex) => {
            const columnDeals = getDealsByStatus(column.id);
            const totalValue = columnDeals.reduce((sum, d) => sum + d.dealValue, 0);
            
            return (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: colIndex * 0.05 }}
                className="flex-shrink-0 w-64 sm:w-72"
              >
                <div className="rs-card p-3">
                  {/* Column Header - Drop Target */}
                  <DroppableColumn columnId={column.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${column.color}`} />
                        <span className="font-medium text-white text-xs">{column.label}</span>
                        <span className="rs-pill text-[10px]" style={{ padding: "0.05rem 0.4rem" }}>
                          {columnDeals.length}
                        </span>
                      </div>
                    </div>

                    {/* Column Total */}
                    <div className="text-[10px] mb-3 font-mono" style={{ color: "var(--rs-text-muted)" }}>
                      {formatCurrency(totalValue)}
                    </div>

                    {/* Cards */}
                    <SortableContext
                      items={columnDeals.map(d => d._id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2 max-h-[calc(100vh-380px)] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-white/10">
                        {columnDeals.map((deal) => (
                          <SortableDealCard
                            key={deal._id}
                            deal={deal}
                            onClick={() => {
              setSelectedDeal(deal);
              setEditForm({
                clientName: deal.clientName || "",
                clientCompany: deal.clientCompany || "",
                clientEmail: deal.clientEmail || "",
                clientPhone: deal.clientPhone || "",
                dealValue: deal.dealValue || 0,
                productCategory: deal.productCategory || [],
                description: deal.description || "",
                expectedCloseDate: deal.expectedCloseDate || null,
              });
              setIsEditing(false);
            }}
                            searchQuery={searchQuery}
                          />
                        ))}
                        
{columnDeals.length === 0 && (
  <div
    className="text-center py-6 text-xs rounded-xl border-2 border-dashed"
    style={{
      color: "var(--rs-text-muted)",
      borderColor: "var(--rs-border)",
    }}
  >
    Drag deals here
  </div>
)}
                      </div>
                    </SortableContext>
                  </DroppableColumn>
                </div>
              </motion.div>
            );
          })}
        </div>

        <DragOverlay>
          {activeDeal ? <DealCardOverlay deal={activeDeal} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Deal Detail Modal */}
      <AnimatePresence>
        {selectedDeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rs-modal-backdrop"
            onClick={() => setSelectedDeal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="rs-modal max-w-2xl w-full p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rs-modal-header">
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.clientName}
                      onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })}
                      className="bg-[var(--rs-bg-base)] text-base font-semibold text-white border border-[var(--rs-border)] rounded-lg px-3 py-2 w-full focus:outline-none focus:border-[var(--rs-border-focus)]"
                      placeholder="Client Name"
                    />
                  ) : (
                    <>
                      <h2 className="text-base font-semibold text-white">{selectedDeal.clientName}</h2>
                      {selectedDeal.clientCompany && (
                        <p className="text-xs mt-1" style={{ color: "var(--rs-text-muted)" }}>
                          {selectedDeal.clientCompany}
                        </p>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
                      style={{ color: "var(--rs-text-secondary)" }}
                      title="Edit deal"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedDeal(null);
                      setIsEditing(false);
                    }}
                    className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
                    style={{ color: "var(--rs-text-secondary)" }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="rs-modal-body space-y-5">
                {/* Deal Value - Editable */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="rounded-xl p-4"
                    style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}
                  >
                    <div className="text-xs mb-1" style={{ color: "var(--rs-text-muted)" }}>
                      {isEditing ? "Deal Value (R)" : "Deal Value"}
                    </div>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.dealValue}
                        onChange={(e) => setEditForm({ ...editForm, dealValue: Number(e.target.value) })}
                        className="bg-[var(--rs-bg-overlay)] text-xl font-semibold text-white border border-[var(--rs-border)] rounded-lg px-3 py-2 w-full focus:outline-none focus:border-[var(--rs-border-focus)]"
                      />
                    ) : (
                      <div className="text-xl font-semibold text-white rs-stat">{formatCurrency(selectedDeal.dealValue)}</div>
                    )}
                  </div>
                  <div
                    className="rounded-xl p-4"
                    style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}
                  >
                    <div className="text-xs mb-1" style={{ color: "var(--rs-text-muted)" }}>
                      Commission
                    </div>
                    <div
                      className="text-xl font-semibold rs-stat"
                      style={{ color: "var(--rs-success)" }}
                    >
                      {formatCurrency(selectedDeal.commissionAmount)}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <div className="text-xs mb-2" style={{ color: "var(--rs-text-muted)" }}>
                    Status
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium uppercase tracking-wider ${getStatusBadge(selectedDeal.status)}`}>
                    {selectedDeal.status.replace("_", " ")}
                  </span>
                </div>

                {/* Description - Editable */}
                <div>
                  <div className="text-xs mb-2" style={{ color: "var(--rs-text-muted)" }}>
                    Notes / Description
                  </div>
                  {isEditing ? (
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="rs-input rs-input--textarea"
                      style={{ height: 96 }}
                      placeholder="Add notes about what you want to sell them..."
                    />
                  ) : (
                    <p className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>
                      {selectedDeal.description || "No notes yet"}
                    </p>
                  )}
                </div>

                {/* Product Category - Editable */}
                <div>
                  <div className="text-xs mb-2" style={{ color: "var(--rs-text-muted)" }}>
                    Product Interest
                  </div>
                  {isEditing ? (
                    <div className="flex flex-wrap gap-2">
                      {["Roventis Pro", "Roventis Enterprise", "Roventis Lite", "Custom Solution"].map((product) => (
                        <button
                          key={product}
                          onClick={() => {
                            const current = editForm.productCategory || [];
                            const newCategory = current.includes(product)
                              ? current.filter((c: string) => c !== product)
                              : [...current, product];
                            setEditForm({ ...editForm, productCategory: newCategory });
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            (editForm.productCategory || []).includes(product)
                              ? "bg-violet-600 text-white"
                              : "bg-[var(--rs-bg-base)] text-[var(--rs-text-secondary)] border border-[var(--rs-border)]"
                          }`}
                        >
                          {product}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(selectedDeal.productCategory || []).map((product: string) => (
                        <span
                          key={product}
                          className="px-3 py-1.5 rounded-full text-xs font-medium"
                          style={{
                            background: "var(--rs-accent-soft)",
                            color: "var(--rs-text-accent)",
                          }}
                        >
                          {product}
                        </span>
                      ))}
                      {(!selectedDeal.productCategory || selectedDeal.productCategory.length === 0) && (
                        <span className="text-xs" style={{ color: "var(--rs-text-muted)" }}>
                          No product interest specified
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Client Contact - Editable */}
                <div>
                  <div className="text-xs mb-2" style={{ color: "var(--rs-text-muted)" }}>
                    Client Contact
                  </div>
                  <div className="space-y-2">
                    {isEditing ? (
                      <>
                        <input
                          type="email"
                          value={editForm.clientEmail || ""}
                          onChange={(e) => setEditForm({ ...editForm, clientEmail: e.target.value })}
                          className="rs-input"
                          placeholder="Client email"
                        />
                        <input
                          type="tel"
                          value={editForm.clientPhone || ""}
                          onChange={(e) => setEditForm({ ...editForm, clientPhone: e.target.value })}
                          className="rs-input"
                          placeholder="Client phone"
                        />
                      </>
                    ) : (
                      <div className="space-y-2">
                        {selectedDeal.clientEmail && (
                          <div className="flex items-center gap-3 text-sm" style={{ color: "var(--rs-text-secondary)" }}>
                            <Mail className="w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
                            {selectedDeal.clientEmail}
                          </div>
                        )}
                        {selectedDeal.clientPhone && (
                          <div className="flex items-center gap-3 text-sm" style={{ color: "var(--rs-text-secondary)" }}>
                            <Phone className="w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
                            {selectedDeal.clientPhone}
                          </div>
                        )}
                        {!selectedDeal.clientEmail && !selectedDeal.clientPhone && (
                          <span className="text-xs" style={{ color: "var(--rs-text-muted)" }}>
                            No contact info
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs mb-1" style={{ color: "var(--rs-text-muted)" }}>
                      Created
                    </div>
                    <div className="text-white">{formatDate(selectedDeal.createdAt)}</div>
                  </div>
                  {selectedDeal.expectedCloseDate && (
                    <div>
                      <div className="text-xs mb-1" style={{ color: "var(--rs-text-muted)" }}>
                        Expected Close
                      </div>
                      <div className="text-white">{formatDate(selectedDeal.expectedCloseDate)}</div>
                    </div>
                  )}
                </div>

                {/* Order Status - Show for Closed Won deals */}
                {selectedDeal.status === "closed_won" && (
                  <div
                    className="pt-5"
                    style={{ borderTop: "1px solid var(--rs-border)" }}
                  >
                    <div className="text-xs mb-2" style={{ color: "var(--rs-text-muted)" }}>
                      Order Status
                    </div>
                    <div
                      className="rounded-xl p-4"
                      style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}
                    >
                      {selectedDeal.orderSubmitted ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${getOrderStatusBadge(selectedDeal.orderStatus).bg} ${getOrderStatusBadge(selectedDeal.orderStatus).text}`}>
                              {(() => {
                                const Icon = getOrderStatusBadge(selectedDeal.orderStatus).icon;
                                return <Icon className="w-4 h-4" />;
                              })()}
                              {getOrderStatusBadge(selectedDeal.orderStatus).label}
                            </span>
                            {selectedDeal.orderReference && (
                              <span className="text-xs font-mono" style={{ color: "var(--rs-text-muted)" }}>
                                {selectedDeal.orderReference}
                              </span>
                            )}
                          </div>
                          {selectedDeal.deliveryAddress && (
                            <div className="text-xs" style={{ color: "var(--rs-text-secondary)" }}>
                              <span style={{ color: "var(--rs-text-muted)" }}>Delivery:</span>{" "}
                              {selectedDeal.deliveryAddress}
                            </div>
                          )}
                          {selectedDeal.orderSubmittedAt && (
                            <div className="text-[10px]" style={{ color: "var(--rs-text-muted)" }}>
                              Submitted: {formatDate(selectedDeal.orderSubmittedAt)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <p className="text-sm mb-3" style={{ color: "var(--rs-text-secondary)" }}>
                            Submit order details to receive your commission
                          </p>
                          <button
                            onClick={() => setShowOrderModal(true)}
                            className="rs-btn-primary inline-flex"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Submit Order
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Commission Status - Show for Closed Won deals */}
                {selectedDeal.status === "closed_won" && (
                  <div
                    className="pt-5"
                    style={{ borderTop: "1px solid var(--rs-border)" }}
                  >
                    <div className="text-xs mb-2" style={{ color: "var(--rs-text-muted)" }}>
                      Commission Status
                    </div>
                    <div
                      className="rounded-xl p-4"
                      style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        {(() => {
                          let statusLabel = "";
                          let statusClass = "";
                          let statusBg = "";

                          if (!selectedDeal.orderSubmitted) {
                            statusLabel = " Deal Closed — No Order";
                            statusClass = "text-gray-400";
                            statusBg = "bg-gray-500/20";
                          } else if (selectedDeal.commissionStatus === "pending") {
                            statusLabel = " Pending Approval";
                            statusClass = "text-amber-400";
                            statusBg = "bg-amber-500/20";
                          } else if (selectedDeal.commissionStatus === "approved") {
                            statusLabel = " Approved";
                            statusClass = "text-blue-400";
                            statusBg = "bg-blue-500/20";
                          } else if (selectedDeal.commissionStatus === "paid") {
                            statusLabel = " Paid";
                            statusClass = "text-emerald-400";
                            statusBg = "bg-emerald-500/20";
                          }

                          return (
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${statusBg} ${statusClass}`}>
                              {statusLabel}
                            </span>
                          );
                        })()}
                        <span className="text-white font-medium rs-stat">{formatCurrency(selectedDeal.commissionAmount)}</span>
                      </div>

                      {/* Next steps messaging */}
                      <div className="text-xs" style={{ color: "var(--rs-text-secondary)" }}>
                        {!selectedDeal.orderSubmitted && (
                          <p>Submit your order below to start the commission approval process.</p>
                        )}
                        {selectedDeal.orderSubmitted && selectedDeal.commissionStatus === "pending" && (
                          <p>Your order has been submitted. Roventis will verify and approve your commission within 2–3 business days.</p>
                        )}
                        {selectedDeal.commissionStatus === "approved" && (
                          <p>Your commission has been approved and will be paid within 8–10 business days.</p>
                        )}
                        {selectedDeal.commissionStatus === "paid" && (
                          <p>Commission paid. Reference: {selectedDeal.paymentReference || "N/A"}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Delete Deal */}
                <div
                  className="pt-5"
                  style={{ borderTop: "1px solid var(--rs-border)" }}
                >
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this deal?")) {
                        deleteDeal({ id: selectedDeal._id });
                        setSelectedDeal(null);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background: "rgba(239,68,68,0.08)",
                      color: "var(--rs-danger)",
                      border: "1px solid rgba(239,68,68,0.20)",
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Deal
                  </button>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div
                    className="pt-5 space-y-3"
                    style={{ borderTop: "1px solid var(--rs-border)" }}
                  >
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          const currentAffiliate2 = currentAffiliate;
                          let commissionRate = 0.05;
                          if (currentAffiliate2?.tier === "silver") commissionRate = 0.10;
                          if (currentAffiliate2?.tier === "gold") commissionRate = 0.15;
                          if (currentAffiliate2?.tier === "platinum") commissionRate = 0.25;

                          const newCommissionAmount = editForm.dealValue * commissionRate;

                          const updateFields: any = {
                            id: selectedDeal._id,
                            clientName: editForm.clientName,
                            clientCompany: editForm.clientCompany,
                            clientEmail: editForm.clientEmail,
                            clientPhone: editForm.clientPhone,
                            dealValue: editForm.dealValue,
                            productCategory: editForm.productCategory,
                            description: editForm.description,
                            commissionAmount: newCommissionAmount,
                            commissionRate: commissionRate,
                          };

                          if (editForm.expectedCloseDate) {
                            updateFields.expectedCloseDate = editForm.expectedCloseDate;
                          }

                          await updateDeal(updateFields);
                          setIsEditing(false);
                          setSelectedDeal(null);
                        }}
                        className="rs-btn-primary flex-1 justify-center"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="rs-btn-ghost flex-1 justify-center"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {!isEditing && selectedDeal.status !== "closed_won" && selectedDeal.status !== "closed_lost" && (
                  <div
                    className="pt-5 space-y-3"
                    style={{ borderTop: "1px solid var(--rs-border)" }}
                  >
                    <div className="text-xs mb-2" style={{ color: "var(--rs-text-muted)" }}>
                      Quick Actions
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {selectedDeal.status === "prospect" && (
                        <button
                          onClick={() => updateDeal({ id: selectedDeal._id, status: "qualified" })}
                          className="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                          style={{
                            background: "rgba(59,130,246,0.10)",
                            color: "var(--rs-info)",
                            border: "1px solid rgba(59,130,246,0.20)",
                          }}
                        >
                          Move to Qualified
                        </button>
                      )}
                      {selectedDeal.status === "qualified" && (
                        <button
                          onClick={() => updateDeal({ id: selectedDeal._id, status: "proposal_sent" })}
                          className="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                          style={{
                            background: "rgba(245,158,11,0.10)",
                            color: "var(--rs-warning)",
                            border: "1px solid rgba(245,158,11,0.20)",
                          }}
                        >
                          Move to Proposal
                        </button>
                      )}
                      {selectedDeal.status === "proposal_sent" && (
                        <button
                          onClick={() => updateDeal({ id: selectedDeal._id, status: "negotiation" })}
                          className="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                          style={{
                            background: "rgba(249,115,22,0.10)",
                            color: "rgb(249,115,22)",
                            border: "1px solid rgba(249,115,22,0.20)",
                          }}
                        >
                          Move to Negotiation
                        </button>
                      )}
                      {selectedDeal.status === "negotiation" && (
                        <button
                          onClick={() => handleCloseWon(selectedDeal._id)}
                          className="rs-btn-primary inline-flex"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Close Deal
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => updateDeal({ id: selectedDeal._id, status: "closed_lost" })}
                        className="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                        style={{
                          background: "rgba(239,68,68,0.08)",
                          color: "var(--rs-danger)",
                          border: "1px solid rgba(239,68,68,0.20)",
                        }}
                      >
                        Mark as Lost
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Deal Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rs-modal-backdrop"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="rs-modal max-w-xl w-full p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rs-modal-header">
                <h2 className="text-base font-semibold text-white">Create New Deal</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
                  style={{ color: "var(--rs-text-secondary)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form className="rs-modal-body space-y-3" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const productCategories = (formData.get("productCategory") as string).split(",").map(s => s.trim()).filter(Boolean);
                const tierRate = currentAffiliate ? getTierCommissionRate(currentAffiliate.tier) : 5;
                createDeal({
                  affiliateId,
                  clientName: formData.get("clientName") as string,
                  clientCompany: formData.get("clientCompany") as string || undefined,
                  clientEmail: formData.get("clientEmail") as string || undefined,
                  clientPhone: formData.get("clientPhone") as string || undefined,
                  dealValue: Number(formData.get("dealValue")),
                  productCategory: productCategories.length > 0 ? productCategories : ["General"],
                  description: formData.get("description") as string || undefined,
                  status: "prospect",
                  commissionRate: tierRate,
                });
                setShowModal(false);
              }}>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Client Name *</label>
                  <input
                    name="clientName"
                    required
                    className="rs-input"
                    placeholder="Enter client name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Company</label>
                  <input
                    name="clientCompany"
                    className="rs-input"
                    placeholder="Company name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                    <input
                      name="clientEmail"
                      type="email"
                      className="rs-input"
                      placeholder="client@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
                    <input
                      name="clientPhone"
                      className="rs-input"
                      placeholder="+27..."
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Deal Value (ZAR) *</label>
                  <input
                    name="dealValue"
                    type="number"
                    required
                    className="rs-input"
                    placeholder="50000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Product Categories</label>
                  <input
                    name="productCategory"
                    className="rs-input"
                    placeholder="workwear, corporate merch"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate categories with commas</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="rs-input rs-input--textarea"
                    placeholder="Describe the deal..."
                  />
                </div>
                
                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rs-btn-ghost flex-1 justify-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rs-btn-primary flex-1 justify-center"
                  >
                    Create Deal
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Submission Modal */}
      <AnimatePresence>
        {showOrderModal && selectedDeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rs-modal-backdrop items-start overflow-y-auto py-8"
            onClick={() => setShowOrderModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="rs-modal max-w-4xl w-full p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rs-modal-header sticky top-0" style={{ background: "var(--rs-bg-raised)" }}>
                <div>
                  <h2 className="text-base font-semibold text-white">Submit Order</h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rs-text-muted)" }}>
                    {selectedDeal.clientName} · {formatCurrency(selectedDeal.dealValue)}
                  </p>
                </div>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
                  style={{ color: "var(--rs-text-secondary)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="rs-modal-body space-y-6">
                <div className="rs-callout rs-callout--info">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Fill in all required details below. Your commission will be
                    approved within 8–10 business days after order is processed.
                  </span>
                </div>

                {/* Client Information */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white flex items-center gap-2">
                    <User className="w-4 h-4" style={{ color: "var(--rs-text-accent)" }} /> Client Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Client Name *</label>
                      <input
                        type="text"
                        value={orderForm.clientName}
                        onChange={(e) => setOrderForm({ ...orderForm, clientName: e.target.value })}
                        className="rs-input"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Company Name</label>
                      <input
                        type="text"
                        value={orderForm.clientCompany}
                        onChange={(e) => setOrderForm({ ...orderForm, clientCompany: e.target.value })}
                        className="rs-input"
                        placeholder="Acme Corp"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Email *</label>
                      <input
                        type="email"
                        value={orderForm.clientEmail}
                        onChange={(e) => setOrderForm({ ...orderForm, clientEmail: e.target.value })}
                        className="rs-input"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={orderForm.clientPhone}
                        onChange={(e) => setOrderForm({ ...orderForm, clientPhone: e.target.value })}
                        className="rs-input"
                        placeholder="+27 82 123 4567"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Delivery Address *</label>
                      <textarea
                        value={orderForm.deliveryAddress}
                        onChange={(e) => setOrderForm({ ...orderForm, deliveryAddress: e.target.value })}
                        rows={2}
                        required
                        className="rs-input rs-input--textarea"
                        placeholder="123 Main Street, City, 8001"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Details (For Manufacturing) */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4" style={{ color: "var(--rs-text-accent)" }} /> Company Details (For Manufacturing)
                  </h3>
                  <p className="text-xs" style={{ color: "var(--rs-text-muted)" }}>
                    At least Company Name OR (Contact Person Name + Phone/Email) is required
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Company Name *</label>
                      <input
                        type="text"
                        value={orderForm.companyName}
                        onChange={(e) => setOrderForm({ ...orderForm, companyName: e.target.value })}
                        className="rs-input"
                        placeholder="Acme Manufacturing"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Registration Number</label>
                      <input
                        type="text"
                        value={orderForm.companyRegistrationNumber}
                        onChange={(e) => setOrderForm({ ...orderForm, companyRegistrationNumber: e.target.value })}
                        className="rs-input"
                        placeholder="2021/123456/07"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">VAT Number</label>
                      <input
                        type="text"
                        value={orderForm.companyVATNumber}
                        onChange={(e) => setOrderForm({ ...orderForm, companyVATNumber: e.target.value })}
                        className="rs-input"
                        placeholder="4120185361"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Website</label>
                      <input
                        type="url"
                        value={orderForm.companyWebsite}
                        onChange={(e) => setOrderForm({ ...orderForm, companyWebsite: e.target.value })}
                        className="rs-input"
                        placeholder="https://acme.co.za"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Company Address</label>
                      <input
                        type="text"
                        value={orderForm.companyAddress}
                        onChange={(e) => setOrderForm({ ...orderForm, companyAddress: e.target.value })}
                        className="rs-input"
                        placeholder="Factory Address for Manufacturing"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Contact Person Name *</label>
                      <input
                        type="text"
                        value={orderForm.contactPersonName}
                        onChange={(e) => setOrderForm({ ...orderForm, contactPersonName: e.target.value })}
                        className="rs-input"
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Contact Person Email</label>
                      <input
                        type="email"
                        value={orderForm.contactPersonEmail}
                        onChange={(e) => setOrderForm({ ...orderForm, contactPersonEmail: e.target.value })}
                        className="rs-input"
                        placeholder="jane@acme.co.za"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Contact Person Phone</label>
                      <input
                        type="tel"
                        value={orderForm.contactPersonPhone}
                        onChange={(e) => setOrderForm({ ...orderForm, contactPersonPhone: e.target.value })}
                        className="rs-input"
                        placeholder="+27 82 987 6543"
                      />
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white flex items-center gap-2">
                    <FileText className="w-4 h-4" style={{ color: "var(--rs-text-accent)" }} /> Documents & Files
                  </h3>
                  <p className="text-xs" style={{ color: "var(--rs-text-muted)" }}>
                    Upload your files to cloud storage and paste the links below
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Invoice Document URL</label>
                      <input
                        type="url"
                        value={orderForm.invoiceDocument}
                        onChange={(e) => setOrderForm({ ...orderForm, invoiceDocument: e.target.value })}
                        className="rs-input"
                        placeholder="https://storage.example.com/invoice.pdf"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Legal Document URL (Signed)</label>
                      <input
                        type="url"
                        value={orderForm.legalDocument}
                        onChange={(e) => setOrderForm({ ...orderForm, legalDocument: e.target.value })}
                        className="rs-input"
                        placeholder="https://storage.example.com/contract.pdf"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Payment Proof URL</label>
                      <input
                        type="url"
                        value={orderForm.paymentProof}
                        onChange={(e) => setOrderForm({ ...orderForm, paymentProof: e.target.value })}
                        className="rs-input"
                        placeholder="https://storage.example.com/payment.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Custom Logo URL</label>
                      <input
                        type="url"
                        value={orderForm.customLogo}
                        onChange={(e) => setOrderForm({ ...orderForm, customLogo: e.target.value })}
                        className="rs-input"
                        placeholder="https://storage.example.com/logo.png"
                      />
                    </div>
                  </div>

                  {/* Product Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Product Images URLs</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        id="productImageUrl"
                        className="rs-input" style={{ height: 36 }}
                        placeholder="https://storage.example.com/product1.jpg"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            const input = document.getElementById("productImageUrl") as HTMLInputElement;
                            handleAddUrl("productImages", input.value);
                            input.value = "";
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById("productImageUrl") as HTMLInputElement;
                          handleAddUrl("productImages", input.value);
                          input.value = "";
                        }}
                        className="rs-btn-ghost" style={{ height: 36 }}
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {orderForm.productImages.map((url, idx) => (
                        <div key={idx} className="rs-pill">
                          <Image className="w-4 h-4 text-pink-400" />
                          <span className="text-white text-sm">{idx + 1}</span>
                          <button type="button" onClick={() => handleRemoveUrl("productImages", idx)} className="text-gray-400 hover:text-red-400">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mockup Photos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Mockup Photos URLs</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        id="mockupUrl"
                        className="rs-input" style={{ height: 36 }}
                        placeholder="https://storage.example.com/mockup1.jpg"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            const input = document.getElementById("mockupUrl") as HTMLInputElement;
                            handleAddUrl("mockupPhotos", input.value);
                            input.value = "";
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById("mockupUrl") as HTMLInputElement;
                          handleAddUrl("mockupPhotos", input.value);
                          input.value = "";
                        }}
                        className="rs-btn-ghost" style={{ height: 36 }}
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {orderForm.mockupPhotos.map((url, idx) => (
                        <div key={idx} className="rs-pill">
                          <Image className="w-4 h-4 text-cyan-400" />
                          <span className="text-white text-sm">{idx + 1}</span>
                          <button type="button" onClick={() => handleRemoveUrl("mockupPhotos", idx)} className="text-gray-400 hover:text-red-400">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Order Notes</label>
                  <textarea
                    value={orderForm.orderNotes}
                    onChange={(e) => setOrderForm({ ...orderForm, orderNotes: e.target.value })}
                    rows={3}
                    className="rs-input rs-input--textarea"
                    placeholder="Any special instructions..."
                  />
                </div>

                <div
                  className="flex gap-2 pt-4"
                  style={{ borderTop: "1px solid var(--rs-border)" }}
                >
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="rs-btn-ghost flex-1 justify-center"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitOrder}
                    disabled={submitting || !orderForm.clientName || !orderForm.clientEmail || !orderForm.deliveryAddress || !(orderForm.companyName || (orderForm.contactPersonName && (orderForm.contactPersonPhone || orderForm.contactPersonEmail)))}
                    className="rs-btn-primary flex-1 justify-center disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Submit Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
