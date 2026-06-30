"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Ticket, Send, X, CheckCircle, AlertCircle, 
  Clock, ChevronDown, ChevronUp, Trash2, MessageCircle
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDate, formatRelativeTime } from "@/lib/utils";

const ticketStatuses = [
  { value: "open", label: "Open", color: "bg-red-500/20 text-red-400", icon: AlertCircle },
  { value: "in_progress", label: "In Progress", color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  { value: "resolved", label: "Resolved", color: "bg-green-500/20 text-green-400", icon: CheckCircle },
  { value: "closed", label: "Closed", color: "bg-gray-500/20 text-gray-400", icon: CheckCircle },
];

const categoryLabels: Record<string, string> = {
  deal: "Deal",
  product: "Product",
  commission: "Commission",
  technical: "Technical",
  other: "Other",
};

export default function AdminTicketsPage() {
  const tickets = useQuery(api.admin.getAllSupportTicketsAdmin);
  const replyToTicket = useMutation(api.admin.replyToSupportTicket);
  const updateTicketStatus = useMutation(api.admin.updateSupportTicketStatus);
  const resolveAndCloseTicket = useMutation(api.admin.resolveAndCloseTicket);
  const deleteClosedTicket = useMutation(api.admin.deleteClosedTicket);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const [showClosed, setShowClosed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Refresh selected ticket when tickets change
  useEffect(() => {
    if (selectedTicket && tickets) {
      const updated = tickets.find((t: any) => t._id === selectedTicket._id);
      if (updated) {
        setSelectedTicket(updated);
      }
    }
  }, [tickets, selectedTicket?._id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.messages]);

  const filteredTickets = (tickets || []).filter((ticket: any) => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.affiliate && ticket.affiliate.firstName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesClosed = showClosed || ticket.status !== "closed";
    
    return matchesSearch && matchesStatus && matchesClosed;
  });

  // Sort tickets: open first, then by date
  const sortedTickets = [...filteredTickets].sort((a: any, b: any) => {
    const statusOrder: Record<string, number> = { open: 0, in_progress: 1, resolved: 2, closed: 3 };
    const aStatus = a.status as keyof typeof statusOrder;
    const bStatus = b.status as keyof typeof statusOrder;
    if (statusOrder[aStatus] !== statusOrder[bStatus]) {
      return statusOrder[aStatus] - statusOrder[bStatus];
    }
    return b.updatedAt - a.updatedAt;
  });

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    await replyToTicket({ ticketId: selectedTicket._id, message: replyMessage });
    setReplyMessage("");
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateTicketStatus({ ticketId: id, status: status as any });
  };

  const handleResolveAndClose = async (id: string) => {
    await resolveAndCloseTicket({ ticketId: id });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this ticket?")) {
      await deleteClosedTicket({ ticketId: id });
      if (selectedTicket?._id === id) {
        setSelectedTicket(null);
      }
    }
  };

  const toggleThread = (ticketId: string) => {
    setExpandedThreads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ticketId)) {
        newSet.delete(ticketId);
      } else {
        newSet.add(ticketId);
      }
      return newSet;
    });
  };

  const getStatusInfo = (status: string) => {
    return ticketStatuses.find(s => s.value === status) || ticketStatuses[0];
  };

  if (!tickets) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--rs-bg-base)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: "var(--rs-accent)" }} />
      </div>
    );
  }

  const openTickets = tickets.filter((t: any) => t.status === "open" || t.status === "in_progress").length;
  const closedTickets = tickets.filter((t: any) => t.status === "closed").length;

  return (
    <div className="space-y-6">
      <div className="rs-page-header flex items-center justify-between gap-4">
        <div>
          <span className="rs-overline">Admin</span>
          <h1 className="rs-page-title mt-1">Support Tickets</h1>
          <p className="rs-page-subtitle">Manage and respond to affiliate support requests</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="rs-pill"
            style={{ background: "rgba(239,68,68,0.10)", color: "rgb(248,113,113)", borderColor: "rgba(239,68,68,0.25)" }}
          >
            {openTickets} open
          </span>
          <button
            onClick={() => setShowClosed(!showClosed)}
            className={showClosed ? "rs-btn-primary" : "rs-btn-ghost"}
          >
            {showClosed ? "Hide Closed" : "Show Closed"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ticketStatuses.map(status => {
          const count = tickets.filter((t: any) => t.status === status.value).length;
          return (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value)}
              className="rs-card rs-card-interactive p-4 text-left"
              style={statusFilter === status.value ? { borderColor: "var(--rs-border-strong)" } : undefined}
            >
              <div className="flex items-center gap-2">
                <status.icon className="w-4 h-4" style={{ color: "var(--rs-text-secondary)" }} />
                <span className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>{status.label}</span>
              </div>
              <p className="rs-stat mt-2">{count}</p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--rs-text-muted)" }} />
          <input
            type="text"
            placeholder="Search tickets by subject or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rs-input w-full pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rs-input md:w-48"
        >
          <option value="all">All Status</option>
          {ticketStatuses.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1 rs-card overflow-hidden p-0">
          <div className="max-h-[700px] overflow-y-auto">
            {sortedTickets.length === 0 ? (
              <div className="rs-empty-state py-12">
                <Ticket className="rs-empty-state-icon" style={{ width: 48, height: 48 }} />
                <p className="rs-empty-state-title">No tickets found</p>
                <p className="rs-empty-state-description">Try a different search or filter.</p>
              </div>
            ) : (
              sortedTickets.map((ticket: any) => {
                const isExpanded = expandedThreads.has(ticket._id);
                const isSelected = selectedTicket?._id === ticket._id;
                const statusInfo = getStatusInfo(ticket.status);
                const messageCount = (ticket.messages?.length || 0) + 1;

                return (
                  <div
                    key={ticket._id}
                    className="border-b"
                    style={{
                      borderColor: "var(--rs-border)",
                      background: isSelected ? "var(--rs-accent-soft)" : "transparent",
                    }}
                  >
                    <div
                      onClick={() => setSelectedTicket(ticket)}
                      className="p-4 cursor-pointer transition-colors"
                      style={!isSelected ? { cursor: "pointer" } : undefined}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {ticket.status === "closed" && (
                              <span style={{ color: "var(--rs-text-muted)" }}>✓</span>
                            )}
                            <p
                              className="font-medium truncate"
                              style={ticket.status === "closed" ? { color: "var(--rs-text-muted)" } : { color: "var(--rs-text-primary)" }}
                            >
                              {ticket.subject}
                            </p>
                          </div>
                          <p className="text-sm truncate" style={{ color: "var(--rs-text-muted)" }}>
                            {ticket.affiliate?.firstName} {ticket.affiliate?.lastName}
                          </p>
                        </div>
                        <span
                          className="rs-pill"
                          style={
                            ticket.status === "open"
                              ? { background: "rgba(239,68,68,0.10)", color: "rgb(248,113,113)", borderColor: "rgba(239,68,68,0.25)" }
                              : ticket.status === "in_progress"
                              ? { background: "rgba(245,158,11,0.10)", color: "rgb(251,191,36)", borderColor: "rgba(245,158,11,0.25)" }
                              : ticket.status === "resolved"
                              ? { background: "rgba(16,185,129,0.10)", color: "rgb(74,222,128)", borderColor: "rgba(16,185,129,0.25)" }
                              : { background: "rgba(255,255,255,0.04)", color: "var(--rs-text-secondary)", borderColor: "var(--rs-border)" }
                          }
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className="rs-pill"
                          style={
                            ticket.priority === "high" || ticket.priority === "urgent"
                              ? { background: "rgba(239,68,68,0.10)", color: "rgb(248,113,113)", borderColor: "rgba(239,68,68,0.25)" }
                              : ticket.priority === "medium"
                              ? { background: "rgba(245,158,11,0.10)", color: "rgb(251,191,36)", borderColor: "rgba(245,158,11,0.25)" }
                              : { background: "rgba(59,130,246,0.10)", color: "rgb(96,165,250)", borderColor: "rgba(59,130,246,0.25)" }
                          }
                        >
                          {ticket.priority}
                        </span>
                        <span className="text-xs" style={{ color: "var(--rs-text-muted)" }}>
                          {categoryLabels[ticket.category]}
                        </span>
                        <span className="text-xs ml-auto" style={{ color: "var(--rs-text-muted)" }}>
                          {formatRelativeTime(ticket.updatedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Collapsible Message Preview */}
                    <div className="px-4 pb-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleThread(ticket._id);
                        }}
                        className="flex items-center gap-1 text-xs"
                        style={{ color: "var(--rs-text-muted)" }}
                      >
                        <MessageCircle className="w-3 h-3" />
                        {messageCount} message{messageCount !== 1 ? "s" : ""}
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-2 space-y-2 overflow-hidden"
                          >
                            {/* Original message */}
                            <div className="rounded-lg p-3" style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}>
                              <p className="text-xs mb-1" style={{ color: "var(--rs-text-muted)" }}>
                                {ticket.affiliate?.firstName} · Original
                              </p>
                              <p className="text-sm line-clamp-3" style={{ color: "var(--rs-text-secondary)" }}>{ticket.description}</p>
                            </div>
                            {/* Last few messages */}
                            {ticket.messages?.slice(-3).map((msg: any, idx: number) => (
                              <div
                                key={idx}
                                className="rounded-lg p-3"
                                style={
                                  msg.sender === "admin"
                                    ? { background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", marginLeft: 16 }
                                    : { background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)", marginRight: 16 }
                                }
                              >
                                <p className="text-xs mb-1" style={{ color: "var(--rs-text-muted)" }}>
                                  {msg.sender === "admin" ? "Admin" : ticket.affiliate?.firstName} · {formatRelativeTime(msg.createdAt)}
                                </p>
                                <p className="text-sm line-clamp-2" style={{ color: "var(--rs-text-secondary)" }}>{msg.content}</p>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Ticket Detail / Chat View */}
        <div className="lg:col-span-2 rs-card overflow-hidden p-0">
          {selectedTicket ? (
            <div className="h-[700px] flex flex-col">
              {/* Header */}
              <div className="p-4" style={{ borderBottom: "1px solid var(--rs-border)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{selectedTicket.subject}</h3>
                      <span
                        className="rs-pill"
                        style={
                          selectedTicket.status === "open"
                            ? { background: "rgba(239,68,68,0.10)", color: "rgb(248,113,113)", borderColor: "rgba(239,68,68,0.25)" }
                            : selectedTicket.status === "in_progress"
                            ? { background: "rgba(245,158,11,0.10)", color: "rgb(251,191,36)", borderColor: "rgba(245,158,11,0.25)" }
                            : selectedTicket.status === "resolved"
                            ? { background: "rgba(16,185,129,0.10)", color: "rgb(74,222,128)", borderColor: "rgba(16,185,129,0.25)" }
                            : { background: "rgba(255,255,255,0.04)", color: "var(--rs-text-secondary)", borderColor: "var(--rs-border)" }
                        }
                      >
                        {getStatusInfo(selectedTicket.status).label}
                      </span>
                    </div>
                    <p className="text-sm mt-1" style={{ color: "var(--rs-text-muted)" }}>
                      From: {selectedTicket.affiliate?.firstName} {selectedTicket.affiliate?.lastName} · {selectedTicket.affiliate?.email}
                    </p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span
                        className="rs-pill"
                        style={
                          selectedTicket.priority === "high" || selectedTicket.priority === "urgent"
                            ? { background: "rgba(239,68,68,0.10)", color: "rgb(248,113,113)", borderColor: "rgba(239,68,68,0.25)" }
                            : selectedTicket.priority === "medium"
                            ? { background: "rgba(245,158,11,0.10)", color: "rgb(251,191,36)", borderColor: "rgba(245,158,11,0.25)" }
                            : { background: "rgba(59,130,246,0.10)", color: "rgb(96,165,250)", borderColor: "rgba(59,130,246,0.25)" }
                        }
                      >
                        {selectedTicket.priority} priority
                      </span>
                      <span className="text-xs" style={{ color: "var(--rs-text-muted)" }}>
                        {categoryLabels[selectedTicket.category]}
                      </span>
                      <span className="text-xs" style={{ color: "var(--rs-text-muted)" }}>
                        Created: {formatDate(selectedTicket.createdAt)}
                      </span>
                      {selectedTicket.resolvedAt && (
                        <span className="text-xs" style={{ color: "rgb(74,222,128)" }}>
                          Resolved: {formatDate(selectedTicket.resolvedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedTicket.status !== "closed" && (
                      <>
                        <select
                          value={selectedTicket.status}
                          onChange={(e) => handleStatusChange(selectedTicket._id, e.target.value)}
                          className="rs-input text-sm py-2"
                        >
                          {ticketStatuses.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleResolveAndClose(selectedTicket._id)}
                          className="rs-btn-primary"
                          style={{ background: "rgb(16,185,129)", color: "white" }}
                        >
                          Resolve & Close
                        </button>
                      </>
                    )}
                    {selectedTicket.status === "closed" && (
                      <button
                        onClick={() => handleDelete(selectedTicket._id)}
                        className="rs-btn-ghost p-2"
                        style={{ color: "rgb(248,113,113)", background: "rgba(239,68,68,0.10)", borderColor: "rgba(239,68,68,0.20)" }}
                        title="Delete ticket"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages / Chat */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Original Message */}
                <div
                  className="rounded-2xl rounded-tl-sm p-4 max-w-[85%]"
                  style={{ background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                      style={{ background: "var(--rs-accent)" }}
                    >
                      {selectedTicket.affiliate?.firstName?.[0]}{selectedTicket.affiliate?.lastName?.[0]}
                    </div>
                    <span className="text-xs" style={{ color: "var(--rs-text-secondary)" }}>
                      {selectedTicket.affiliate?.firstName} {selectedTicket.affiliate?.lastName}
                    </span>
                    <span className="text-xs" style={{ color: "var(--rs-text-muted)" }}>· {formatDate(selectedTicket.createdAt)}</span>
                  </div>
                  <p className="whitespace-pre-wrap" style={{ color: "var(--rs-text-primary)" }}>{selectedTicket.description}</p>
                </div>

                {/* Chat Messages */}
                {selectedTicket.messages?.map((msg: any, idx: number) => {
                  const isAdmin = msg.sender === "admin";
                  return (
                    <div
                      key={idx}
                      className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 ${
                          isAdmin ? "rounded-tr-sm" : "rounded-tl-sm"
                        }`}
                        style={
                          isAdmin
                            ? { background: "var(--rs-accent)", color: "white" }
                            : { background: "var(--rs-bg-base)", border: "1px solid var(--rs-border)", color: "var(--rs-text-primary)" }
                        }
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {isAdmin ? (
                            <>
                              <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>You (Admin)</span>
                              <span className="text-xs" style={{ color: "rgba(255,255,255,0.70)" }}>· {formatRelativeTime(msg.createdAt)}</span>
                            </>
                          ) : (
                            <>
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                                style={{ background: "var(--rs-accent)" }}
                              >
                                {selectedTicket.affiliate?.firstName?.[0]}
                              </div>
                              <span className="text-xs" style={{ color: "var(--rs-text-secondary)" }}>
                                {selectedTicket.affiliate?.firstName}
                              </span>
                              <span className="text-xs" style={{ color: "var(--rs-text-muted)" }}>· {formatRelativeTime(msg.createdAt)}</span>
                            </>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input */}
              {selectedTicket.status !== "closed" ? (
                <div className="p-4" style={{ borderTop: "1px solid var(--rs-border)" }}>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Type your reply..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleReply()}
                      className="rs-input flex-1"
                    />
                    <button
                      onClick={handleReply}
                      disabled={!replyMessage.trim()}
                      className="rs-btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                      Send
                    </button>
                  </div>
                  <p className="text-xs mt-2" style={{ color: "var(--rs-text-muted)" }}>Press Enter to send, Shift+Enter for new line</p>
                </div>
              ) : (
                <div className="p-4 text-center" style={{ borderTop: "1px solid var(--rs-border)", background: "rgba(255,255,255,0.02)" }}>
                  <p className="text-sm" style={{ color: "var(--rs-text-muted)" }}>This ticket is closed. Reply to reopen.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[700px] flex items-center justify-center">
              <div className="rs-empty-state">
                <Ticket className="rs-empty-state-icon" style={{ width: 64, height: 64 }} />
                <p className="rs-empty-state-title">Select a Ticket</p>
                <p className="rs-empty-state-description">Choose a ticket from the list to view the conversation.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
