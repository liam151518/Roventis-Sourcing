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
  { id: "prospect", label: "Prospect", color: "bg-slate-500" },
  { id: "qualified", label: "Qualified", color: "bg-blue-500" },
  { id: "proposal_sent", label: "Proposal", color: "bg-amber-500" },
  { id: "negotiation", label: "Negotiation", color: "bg-orange-500" },
  { id: "closed_won", label: "Closed Won", color: "bg-emerald-500" },
  { id: "closed_lost", label: "Closed Lost", color: "bg-red-500" },
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
      style={style}
      className={`group bg-[#0a0a0b] rounded-xl p-3 border transition-all hover:shadow-lg hover:shadow-black/20 cursor-pointer ${
        isDragging ? "opacity-50 z-50" : ""
      } ${
        // Different styling for deals from leads
        isFromLead 
          ? leadUrgent 
            ? "border-red-500/50 ring-1 ring-red-500/30" 
            : leadExpiringSoon 
              ? "border-amber-500/50 ring-1 ring-amber-500/30"
              : "border-blue-500/30 ring-1 ring-blue-500/20"
          : isMatch 
            ? "border-blue-500/50 ring-1 ring-blue-500/30" 
            : "border-white/5 hover:border-white/10"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start">
        {isFromLead && (
          <div className="mr-1" title="From Lead">
            <Target className="w-3 h-3 text-blue-400" />
          </div>
        )}
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing mr-1"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate group-hover:text-blue-400 transition-colors">
            {highlightMatch(deal.clientName)}
          </h3>
          {deal.clientCompany && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {highlightMatch(deal.clientCompany)}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-2 ml-5">
        <span className="font-bold text-white text-sm">{formatCurrency(deal.dealValue)}</span>
        {deal.expectedCloseDate && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(deal.expectedCloseDate)}
          </span>
        )}
      </div>
      
      {deal.productCategory && deal.productCategory.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 ml-5">
          {deal.productCategory.slice(0, 2).map((cat: string) => (
            <span key={cat} className="text-xs px-1.5 py-0.5 bg-white/5 text-gray-400 rounded">
              {cat}
            </span>
          ))}
          {deal.productCategory.length > 2 && (
            <span className="text-xs px-1.5 py-0.5 bg-white/5 text-gray-400 rounded">
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
    <div className="bg-[#0a0a0b] rounded-xl p-3 border-2 border-blue-500 shadow-2xl cursor-grabbing">
      <div className="flex items-start">
        <GripVertical className="w-4 h-4 text-gray-500 mr-1" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate">
            {deal.clientName}
          </h3>
          {deal.clientCompany && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{deal.clientCompany}</p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 ml-5">
        <span className="font-bold text-white text-sm">{formatCurrency(deal.dealValue)}</span>
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
      className={`transition-colors ${isOver ? 'bg-blue-500/10' : ''}`}
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
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold text-white">Deals Pipeline</h1>
          <p className="text-gray-500 mt-1">Track and manage your sales opportunities</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Deal
        </button>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by client name or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-2.5 bg-[#141417] border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
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
                className={`appearance-none pl-4 pr-10 py-2.5 bg-[#141417] border rounded-xl text-sm font-medium cursor-pointer transition-all ${
                  filters.status 
                    ? "border-blue-500 text-blue-400 bg-blue-500/10" 
                    : "border-white/5 text-gray-400 hover:border-white/10 hover:text-white"
                }`}
              >
                <option value="">Status</option>
                <option value="prospect">Prospect</option>
                <option value="qualified">Qualified</option>
                <option value="proposal_sent">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed_won">Closed Won</option>
                <option value="closed_lost">Closed Lost</option>
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none rotate-90" />
            </div>

            {/* Min Value */}
            <div className="relative w-32">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R</span>
              <input
                type="number"
                placeholder="Min"
                value={filters.minValue}
                onChange={(e) => setFilters({ ...filters, minValue: e.target.value })}
                className={`w-full pl-8 pr-3 py-2.5 bg-[#141417] border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                  filters.minValue ? "border-blue-500" : "border-white/5"
                }`}
              />
            </div>

            {/* Max Value */}
            <div className="relative w-32">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxValue}
                onChange={(e) => setFilters({ ...filters, maxValue: e.target.value })}
                className={`w-full pl-8 pr-3 py-2.5 bg-[#141417] border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                  filters.maxValue ? "border-blue-500" : "border-white/5"
                }`}
              />
            </div>

            {/* Clear All */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-sm font-medium rounded-xl transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">Showing</span>
            <span className="text-white font-semibold">{filteredDeals.length}</span>
            <span className="text-gray-500">of</span>
            <span className="text-white font-semibold">{userDeals.length}</span>
            <span className="text-gray-500">deals</span>
            <div className="flex gap-2 ml-2">
              {searchQuery && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg flex items-center gap-1">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.status && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg flex items-center gap-1 capitalize">
                  {filters.status.replace("_", " ")}
                  <button onClick={() => setFilters({ ...filters, status: "" })} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {(filters.minValue || filters.maxValue) && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg flex items-center gap-1">
                  R {filters.minValue || "0"} - R {filters.maxValue || "∞"}
                  <button onClick={() => setFilters({ ...filters, minValue: "", maxValue: "" })} className="hover:text-white">
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
                <div className="bg-[#141417] rounded-2xl p-3 border border-white/5">
                  {/* Column Header - Drop Target */}
                  <DroppableColumn columnId={column.id}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                        <span className="font-medium text-white text-sm">{column.label}</span>
                        <span className="bg-white/5 text-gray-400 text-xs px-1.5 py-0.5 rounded-full">
                          {columnDeals.length}
                        </span>
                      </div>
                    </div>
                    
                    {/* Column Total */}
                    <div className="text-xs text-gray-500 mb-3 font-mono">
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
                          <div className="text-center py-6 text-gray-500 text-xs border-2 border-dashed border-white/5 rounded-xl">
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDeal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#141417] rounded-2xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.clientName}
                      onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })}
                      className="bg-[#0a0a0b] text-xl font-semibold text-white border border-white/10 rounded-lg px-3 py-2 w-full"
                      placeholder="Client Name"
                    />
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold text-white">{selectedDeal.clientName}</h2>
                      {selectedDeal.clientCompany && (
                        <p className="text-gray-500 mt-1">{selectedDeal.clientCompany}</p>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Edit deal"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedDeal(null);
                      setIsEditing(false);
                    }}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Deal Value - Editable */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0a0a0b] rounded-xl p-4">
                    <div className="text-gray-500 text-sm mb-1">
                      {isEditing ? "Deal Value (R)" : "Deal Value"}
                    </div>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.dealValue}
                        onChange={(e) => setEditForm({ ...editForm, dealValue: Number(e.target.value) })}
                        className="bg-[#1a1a1b] text-2xl font-semibold text-white border border-white/10 rounded-lg px-3 py-2 w-full"
                      />
                    ) : (
                      <div className="text-2xl font-semibold text-white">{formatCurrency(selectedDeal.dealValue)}</div>
                    )}
                  </div>
                  <div className="bg-[#0a0a0b] rounded-xl p-4">
                    <div className="text-gray-500 text-sm mb-1">Commission</div>
                    <div className="text-2xl font-semibold text-emerald-400">{formatCurrency(selectedDeal.commissionAmount)}</div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <div className="text-gray-500 text-sm mb-2">Status</div>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusBadge(selectedDeal.status)}`}>
                    {selectedDeal.status.replace("_", " ")}
                  </span>
                </div>

                {/* Description - Editable */}
                <div>
                  <div className="text-gray-500 text-sm mb-2">Notes / Description</div>
                  {isEditing ? (
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="bg-[#1a1a1b] text-gray-300 border border-white/10 rounded-lg px-3 py-2 w-full h-24 resize-none"
                      placeholder="Add notes about what you want to sell them..."
                    />
                  ) : (
                    <p className="text-gray-300">{selectedDeal.description || "No notes yet"}</p>
                  )}
                </div>

                {/* Product Category - Editable */}
                <div>
                  <div className="text-gray-500 text-sm mb-2">Product Interest</div>
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
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            (editForm.productCategory || []).includes(product)
                              ? "bg-blue-600 text-white"
                              : "bg-[#1a1a1b] text-gray-400 border border-white/10"
                          }`}
                        >
                          {product}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(selectedDeal.productCategory || []).map((product: string) => (
                        <span key={product} className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-600/20 text-blue-400">
                          {product}
                        </span>
                      ))}
                      {(!selectedDeal.productCategory || selectedDeal.productCategory.length === 0) && (
                        <span className="text-gray-500">No product interest specified</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Client Contact - Editable */}
                <div>
                  <div className="text-gray-500 text-sm mb-2">Client Contact</div>
                  <div className="space-y-3">
                    {isEditing ? (
                      <>
                        <input
                          type="email"
                          value={editForm.clientEmail || ""}
                          onChange={(e) => setEditForm({ ...editForm, clientEmail: e.target.value })}
                          className="bg-[#1a1a1b] text-gray-300 border border-white/10 rounded-lg px-3 py-2 w-full"
                          placeholder="Client email"
                        />
                        <input
                          type="tel"
                          value={editForm.clientPhone || ""}
                          onChange={(e) => setEditForm({ ...editForm, clientPhone: e.target.value })}
                          className="bg-[#1a1a1b] text-gray-300 border border-white/10 rounded-lg px-3 py-2 w-full"
                          placeholder="Client phone"
                        />
                      </>
                    ) : (
                      <div className="space-y-2">
                        {selectedDeal.clientEmail && (
                          <div className="flex items-center gap-3 text-gray-300">
                            <Mail className="w-4 h-4 text-gray-500" />
                            {selectedDeal.clientEmail}
                          </div>
                        )}
                        {selectedDeal.clientPhone && (
                          <div className="flex items-center gap-3 text-gray-300">
                            <Phone className="w-4 h-4 text-gray-500" />
                            {selectedDeal.clientPhone}
                          </div>
                        )}
                        {!selectedDeal.clientEmail && !selectedDeal.clientPhone && (
                          <span className="text-gray-500">No contact info</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 mb-1">Created</div>
                    <div className="text-white">{formatDate(selectedDeal.createdAt)}</div>
                  </div>
                  {selectedDeal.expectedCloseDate && (
                    <div>
                      <div className="text-gray-500 mb-1">Expected Close</div>
                      <div className="text-white">{formatDate(selectedDeal.expectedCloseDate)}</div>
                    </div>
                  )}
                </div>

                {/* Order Status - Show for Closed Won deals */}
                {selectedDeal.status === "closed_won" && (
                  <div className="border-t border-white/10 pt-6">
                    <div className="text-gray-500 text-sm mb-3">Order Status</div>
                    <div className="bg-[#0a0a0b] rounded-xl p-4">
                      {selectedDeal.orderSubmitted ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getOrderStatusBadge(selectedDeal.orderStatus).bg} ${getOrderStatusBadge(selectedDeal.orderStatus).text}`}>
                              {(() => {
                                const Icon = getOrderStatusBadge(selectedDeal.orderStatus).icon;
                                return <Icon className="w-4 h-4" />;
                              })()}
                              {getOrderStatusBadge(selectedDeal.orderStatus).label}
                            </span>
                            {selectedDeal.orderReference && (
                              <span className="text-gray-500 font-mono text-sm">{selectedDeal.orderReference}</span>
                            )}
                          </div>
                          {selectedDeal.deliveryAddress && (
                            <div className="text-gray-400 text-sm">
                              <span className="text-gray-500">Delivery:</span> {selectedDeal.deliveryAddress}
                            </div>
                          )}
                          {selectedDeal.orderSubmittedAt && (
                            <div className="text-gray-500 text-xs">
                              Submitted: {formatDate(selectedDeal.orderSubmittedAt)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-gray-400 mb-4">Submit order details to receive your commission</p>
                          <button
                            onClick={() => setShowOrderModal(true)}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors inline-flex items-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            Submit Order
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Delete Deal */}
                <div className="border-t border-white/10 pt-6">
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this deal?")) {
                        deleteDeal({ id: selectedDeal._id });
                        setSelectedDeal(null);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-sm font-medium rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Deal
                  </button>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="border-t border-white/10 pt-6 space-y-3">
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
                          
                          // Only include expectedCloseDate if it has a value
                          if (editForm.expectedCloseDate) {
                            updateFields.expectedCloseDate = editForm.expectedCloseDate;
                          }
                          
                          await updateDeal(updateFields);
                          setIsEditing(false);
                          setSelectedDeal(null);
                        }}
                        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2.5 bg-[#1a1a1b] hover:bg-[#2a2a2b] text-gray-300 font-medium rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {!isEditing && selectedDeal.status !== "closed_won" && selectedDeal.status !== "closed_lost" && (
                  <div className="border-t border-white/10 pt-6 space-y-3">
                    <div className="text-gray-500 text-sm mb-2">Quick Actions</div>
                    <div className="flex gap-2 flex-wrap">
                      {selectedDeal.status === "prospect" && (
                        <button
                          onClick={() => updateDeal({ id: selectedDeal._id, status: "qualified" })}
                          className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm font-medium rounded-lg transition-colors"
                        >
                          Move to Qualified
                        </button>
                      )}
                      {selectedDeal.status === "qualified" && (
                        <button
                          onClick={() => updateDeal({ id: selectedDeal._id, status: "proposal_sent" })}
                          className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 text-sm font-medium rounded-lg transition-colors"
                        >
                          Move to Proposal
                        </button>
                      )}
                      {selectedDeal.status === "proposal_sent" && (
                        <button
                          onClick={() => updateDeal({ id: selectedDeal._id, status: "negotiation" })}
                          className="px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 text-sm font-medium rounded-lg transition-colors"
                        >
                          Move to Negotiation
                        </button>
                      )}
                      {selectedDeal.status === "negotiation" && (
                        <button
                          onClick={() => handleCloseWon(selectedDeal._id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Close Deal
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => updateDeal({ id: selectedDeal._id, status: "closed_lost" })}
                        className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-sm font-medium rounded-lg transition-colors"
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#141417] rounded-2xl border border-white/10 max-w-xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-xl font-semibold text-white">Create New Deal</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form className="p-6 space-y-4" onSubmit={(e) => {
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
                    className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Enter client name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Company</label>
                  <input
                    name="clientCompany"
                    className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Company name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                    <input
                      name="clientEmail"
                      type="email"
                      className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="client@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
                    <input
                      name="clientPhone"
                      className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                    className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="50000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Product Categories</label>
                  <input
                    name="productCategory"
                    className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="workwear, corporate merch"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate categories with commas</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Describe the deal..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-5 py-3 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
            onClick={() => setShowOrderModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#141417] rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-[#141417]">
                <div>
                  <h2 className="text-xl font-semibold text-white">Submit Order</h2>
                  <p className="text-gray-500 text-sm mt-1">{selectedDeal.clientName} - {formatCurrency(selectedDeal.dealValue)}</p>
                </div>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-blue-400 text-sm">
                    Fill in all required details below. Your commission will be approved within 8-10 business days after order is processed.
                  </p>
                </div>

                {/* Client Information */}
                <div className="space-y-4">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <User className="w-4 h-4" /> Client Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Client Name *</label>
                      <input
                        type="text"
                        value={orderForm.clientName}
                        onChange={(e) => setOrderForm({ ...orderForm, clientName: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Company Name</label>
                      <input
                        type="text"
                        value={orderForm.clientCompany}
                        onChange={(e) => setOrderForm({ ...orderForm, clientCompany: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Acme Corp"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Email *</label>
                      <input
                        type="email"
                        value={orderForm.clientEmail}
                        onChange={(e) => setOrderForm({ ...orderForm, clientEmail: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={orderForm.clientPhone}
                        onChange={(e) => setOrderForm({ ...orderForm, clientPhone: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                        className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="123 Main Street, City, 8001"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Details (For Manufacturing) */}
                <div className="space-y-4">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Company Details (For Manufacturing)
                  </h3>
                  <p className="text-gray-500 text-sm">At least Company Name OR (Contact Person Name + Phone/Email) is required</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Company Name *</label>
                      <input
                        type="text"
                        value={orderForm.companyName}
                        onChange={(e) => setOrderForm({ ...orderForm, companyName: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Acme Manufacturing"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Registration Number</label>
                      <input
                        type="text"
                        value={orderForm.companyRegistrationNumber}
                        onChange={(e) => setOrderForm({ ...orderForm, companyRegistrationNumber: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="2021/123456/07"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">VAT Number</label>
                      <input
                        type="text"
                        value={orderForm.companyVATNumber}
                        onChange={(e) => setOrderForm({ ...orderForm, companyVATNumber: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="4120185361"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Website</label>
                      <input
                        type="url"
                        value={orderForm.companyWebsite}
                        onChange={(e) => setOrderForm({ ...orderForm, companyWebsite: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="https://acme.co.za"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Company Address</label>
                      <input
                        type="text"
                        value={orderForm.companyAddress}
                        onChange={(e) => setOrderForm({ ...orderForm, companyAddress: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Factory Address for Manufacturing"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Contact Person Name *</label>
                      <input
                        type="text"
                        value={orderForm.contactPersonName}
                        onChange={(e) => setOrderForm({ ...orderForm, contactPersonName: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Contact Person Email</label>
                      <input
                        type="email"
                        value={orderForm.contactPersonEmail}
                        onChange={(e) => setOrderForm({ ...orderForm, contactPersonEmail: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="jane@acme.co.za"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Contact Person Phone</label>
                      <input
                        type="tel"
                        value={orderForm.contactPersonPhone}
                        onChange={(e) => setOrderForm({ ...orderForm, contactPersonPhone: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="+27 82 987 6543"
                      />
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-4">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Documents & Files
                  </h3>
                  <p className="text-gray-500 text-sm">Upload your files to cloud storage and paste the links below</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Invoice Document URL</label>
                      <input
                        type="url"
                        value={orderForm.invoiceDocument}
                        onChange={(e) => setOrderForm({ ...orderForm, invoiceDocument: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="https://storage.example.com/invoice.pdf"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Legal Document URL (Signed)</label>
                      <input
                        type="url"
                        value={orderForm.legalDocument}
                        onChange={(e) => setOrderForm({ ...orderForm, legalDocument: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="https://storage.example.com/contract.pdf"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Payment Proof URL</label>
                      <input
                        type="url"
                        value={orderForm.paymentProof}
                        onChange={(e) => setOrderForm({ ...orderForm, paymentProof: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="https://storage.example.com/payment.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Custom Logo URL</label>
                      <input
                        type="url"
                        value={orderForm.customLogo}
                        onChange={(e) => setOrderForm({ ...orderForm, customLogo: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                        className="flex-1 px-4 py-2 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                        className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {orderForm.productImages.map((url, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg">
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
                        className="flex-1 px-4 py-2 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                        className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {orderForm.mockupPhotos.map((url, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg">
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
                    className="w-full px-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Any special instructions..."
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="flex-1 px-5 py-3 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitOrder}
                    disabled={submitting || !orderForm.clientName || !orderForm.clientEmail || !orderForm.deliveryAddress || !(orderForm.companyName || (orderForm.contactPersonName && (orderForm.contactPersonPhone || orderForm.contactPersonEmail)))}
                    className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
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
