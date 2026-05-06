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

const priorityColors: Record<string, string> = {
  low: "bg-blue-500/20 text-blue-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  high: "bg-orange-500/20 text-orange-400",
  urgent: "bg-red-500/20 text-red-400",
};

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const openTickets = tickets.filter((t: any) => t.status === "open" || t.status === "in_progress").length;
  const closedTickets = tickets.filter((t: any) => t.status === "closed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Support Tickets</h1>
          <p className="text-gray-500 mt-1">Manage and respond to affiliate support requests</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-red-500/20 rounded-xl">
            <span className="text-red-400 font-medium">{openTickets} open</span>
          </div>
          <button
            onClick={() => setShowClosed(!showClosed)}
            className={`px-4 py-2 rounded-xl transition-colors ${
              showClosed ? "bg-gray-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {showClosed ? "Hide Closed" : "Show Closed"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {ticketStatuses.map(status => {
          const count = tickets.filter((t: any) => t.status === status.value).length;
          return (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value)}
              className={`p-4 rounded-xl border transition-all ${
                statusFilter === status.value 
                  ? "border-white/20 bg-white/5" 
                  : "border-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-2">
                <status.icon className={`w-4 h-4 ${status.color.replace("bg-", "text-").replace("/20", "")}`} />
                <span className="text-gray-400 text-sm">{status.label}</span>
              </div>
              <p className="text-2xl font-semibold text-white mt-1">{count}</p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search tickets by subject or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#141417] border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-[#141417] border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Status</option>
          {ticketStatuses.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1 bg-[#141417] rounded-2xl border border-white/5 overflow-hidden">
          <div className="max-h-[700px] overflow-y-auto">
            {sortedTickets.length === 0 ? (
              <div className="p-8 text-center">
                <Ticket className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">No tickets found</p>
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
                    className={`border-b border-white/5 ${
                      isSelected ? "bg-blue-600/20" : "hover:bg-white/5"
                    }`}
                  >
                    <div
                      onClick={() => setSelectedTicket(ticket)}
                      className="p-4 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {ticket.status === "closed" && (
                              <span className="text-gray-500">✓</span>
                            )}
                            <p className={`font-medium truncate ${
                              ticket.status === "closed" ? "text-gray-500" : "text-white"
                            }`}>
                              {ticket.subject}
                            </p>
                          </div>
                          <p className="text-gray-500 text-sm truncate">
                            {ticket.affiliate?.firstName} {ticket.affiliate?.lastName}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${priorityColors[ticket.priority]}`}>
                          {ticket.priority}
                        </span>
                        <span className="text-gray-600 text-xs">
                          {categoryLabels[ticket.category]}
                        </span>
                        <span className="text-gray-600 text-xs ml-auto">
                          {formatRelativeTime(ticket.updatedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Collapsible Message Preview */}
                    <div className="px-4 pb-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleThread(ticket._id);
                        }}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-400"
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
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-gray-400 text-xs mb-1">
                                {ticket.affiliate?.firstName} · Original
                              </p>
                              <p className="text-gray-300 text-sm line-clamp-3">{ticket.description}</p>
                            </div>
                            {/* Last few messages */}
                            {ticket.messages?.slice(-3).map((msg: any, idx: number) => (
                              <div 
                                key={idx} 
                                className={`rounded-lg p-3 ${
                                  msg.sender === "admin" ? "bg-green-600/10 ml-4" : "bg-white/5 mr-4"
                                }`}
                              >
                                <p className="text-gray-400 text-xs mb-1">
                                  {msg.sender === "admin" ? "Admin" : ticket.affiliate?.firstName} · {formatRelativeTime(msg.createdAt)}
                                </p>
                                <p className="text-gray-300 text-sm line-clamp-2">{msg.content}</p>
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
        <div className="lg:col-span-2 bg-[#141417] rounded-2xl border border-white/5 overflow-hidden">
          {selectedTicket ? (
            <div className="h-[700px] flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{selectedTicket.subject}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(selectedTicket.status).color}`}>
                        {getStatusInfo(selectedTicket.status).label}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      From: {selectedTicket.affiliate?.firstName} {selectedTicket.affiliate?.lastName} · {selectedTicket.affiliate?.email}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${priorityColors[selectedTicket.priority]}`}>
                        {selectedTicket.priority} priority
                      </span>
                      <span className="text-gray-600 text-xs">
                        {categoryLabels[selectedTicket.category]}
                      </span>
                      <span className="text-gray-600 text-xs">
                        Created: {formatDate(selectedTicket.createdAt)}
                      </span>
                      {selectedTicket.resolvedAt && (
                        <span className="text-green-500 text-xs">
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
                          className="bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                        >
                          {ticketStatuses.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleResolveAndClose(selectedTicket._id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Resolve & Close
                        </button>
                      </>
                    )}
                    {selectedTicket.status === "closed" && (
                      <button
                        onClick={() => handleDelete(selectedTicket._id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
                <div className="bg-white/5 rounded-2xl rounded-tl-sm p-4 max-w-[85%]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium text-white">
                      {selectedTicket.affiliate?.firstName?.[0]}{selectedTicket.affiliate?.lastName?.[0]}
                    </div>
                    <span className="text-gray-400 text-xs">
                      {selectedTicket.affiliate?.firstName} {selectedTicket.affiliate?.lastName}
                    </span>
                    <span className="text-gray-600 text-xs">· {formatDate(selectedTicket.createdAt)}</span>
                  </div>
                  <p className="text-white whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>

                {/* Chat Messages */}
                {selectedTicket.messages?.map((msg: any, idx: number) => {
                  const isAdmin = msg.sender === "admin";
                  return (
                    <div
                      key={idx}
                      className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-4 ${
                        isAdmin 
                          ? "bg-blue-600 text-white rounded-tr-sm" 
                          : "bg-white/5 text-white rounded-tl-sm"
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          {isAdmin ? (
                            <>
                              <span className="text-xs text-blue-200 font-medium">You (Admin)</span>
                              <span className="text-blue-300 text-xs">· {formatRelativeTime(msg.createdAt)}</span>
                            </>
                          ) : (
                            <>
                              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium text-white">
                                {selectedTicket.affiliate?.firstName?.[0]}
                              </div>
                              <span className="text-gray-400 text-xs">
                                {selectedTicket.affiliate?.firstName}
                              </span>
                              <span className="text-gray-600 text-xs">· {formatRelativeTime(msg.createdAt)}</span>
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
                <div className="p-4 border-t border-white/5">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Type your reply..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleReply()}
                      className="flex-1 px-4 py-3 bg-black border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <button
                      onClick={handleReply}
                      disabled={!replyMessage.trim()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Send
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">Press Enter to send, Shift+Enter for new line</p>
                </div>
              ) : (
                <div className="p-4 border-t border-white/5 bg-gray-900/50">
                  <p className="text-gray-500 text-sm text-center">This ticket is closed. Reply to reopen.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[700px] flex items-center justify-center">
              <div className="text-center">
                <Ticket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Select a Ticket</h3>
                <p className="text-gray-500">Choose a ticket from the list to view the conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
