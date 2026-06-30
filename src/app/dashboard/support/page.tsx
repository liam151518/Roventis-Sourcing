"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  DollarSign,
  ShoppingCart,
  Settings,
  BookOpen,
  LifeBuoy,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { formatDate, formatRelativeTime } from "@/lib/utils";

const faqs = [
  {
    category: "Commissions",
    icon: DollarSign,
    questions: [
      {
        q: "How is my commission calculated?",
        a: "Your commission is calculated based on your tier level. Bronze: 5%, Silver: 7.5%, Gold: 10%, Platinum: 12-15%. Commissions are approved after order delivery/installation.",
      },
      {
        q: "When do I get paid?",
        a: "Commissions are paid monthly via EFT to your registered bank account. You can request a payout once you have R500+ in pending commissions.",
      },
      {
        q: "What's the difference between pending and approved commission?",
        a: "Pending commission is earned but not yet approved - this happens when an order is delivered. Approved commission is ready for payout once you request it.",
      },
    ],
  },
  {
    category: "Orders",
    icon: ShoppingCart,
    questions: [
      {
        q: "How do I create an order?",
        a: "Go to the Orders page and click 'New Order'. You'll need to fill in client details and products. The order will be sent to our suppliers for processing.",
      },
      {
        q: "Can I track my order status?",
        a: "Yes! Visit the Orders page to see real-time status updates: Draft → Submitted → Supplier Confirmed → In Transit → Delivered → Installed.",
      },
      {
        q: "What happens after a deal is closed?",
        a: "Once a deal is marked as 'Closed Won', you can create an order from it. This triggers the fulfillment process and eventually your commission approval.",
      },
    ],
  },
  {
    category: "Training",
    icon: BookOpen,
    questions: [
      {
        q: "Why can't I sell products?",
        a: "You need to complete all required training modules and get approved to sell. Go to Training to start your certification.",
      },
      {
        q: "How do I get approved to sell?",
        a: "Complete all required training modules and pass the assessments. An admin will review and approve your selling privileges.",
      },
    ],
  },
  {
    category: "General",
    icon: HelpCircle,
    questions: [
      {
        q: "How do I upgrade my tier?",
        a: "Visit the Tier page to see requirements. Silver upgrades automatically after your first sale. Gold at R150k sales. Platinum requires R899.69/month subscription.",
      },
      {
        q: "What are the benefits of Platinum tier?",
        a: "Platinum members get 12-15% commission (higher rates on select products), access to exclusive leads, priority support, and advanced training modules.",
      },
    ],
  },
];

const categoryIcons: Record<string, any> = {
  deal: ShoppingCart,
  product: Settings,
  commission: DollarSign,
  technical: Settings,
  other: HelpCircle,
};

const priorityColors: Record<string, { bg: string; color: string }> = {
  low: { bg: "var(--rs-bg-overlay)", color: "var(--rs-text-secondary)" },
  medium: { bg: "rgba(59,130,246,0.10)", color: "var(--rs-info)" },
  high: { bg: "rgba(245,158,11,0.10)", color: "var(--rs-warning)" },
  urgent: { bg: "rgba(239,68,68,0.10)", color: "var(--rs-danger)" },
};

const statusColors: Record<string, { bg: string; color: string }> = {
  open: { bg: "rgba(59,130,246,0.10)", color: "var(--rs-info)" },
  in_progress: { bg: "rgba(245,158,11,0.10)", color: "var(--rs-warning)" },
  resolved: { bg: "rgba(16,185,129,0.10)", color: "var(--rs-success)" },
  closed: { bg: "var(--rs-bg-overlay)", color: "var(--rs-text-secondary)" },
};

const statusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

function StatusPill({ status }: { status: string }) {
  const c = statusColors[status] || statusColors.closed;
  return (
    <span
      className="rs-pill"
      style={{
        background: c.bg,
        color: c.color,
        textTransform: "capitalize",
      }}
    >
      {statusLabels[status] || status}
    </span>
  );
}

function PriorityPill({ priority }: { priority: string }) {
  const c = priorityColors[priority] || priorityColors.medium;
  return (
    <span
      className="rs-pill"
      style={{
        background: c.bg,
        color: c.color,
        textTransform: "capitalize",
      }}
    >
      {priority}
    </span>
  );
}

export default function SupportPage() {
  const { userId } = useAuth();
  const currentAffiliate = useQuery(
    api.affiliates.getCurrentAffiliate,
    { clerkUserId: userId || undefined }
  );
  const tickets = useQuery(api.support.getMyTickets, {
    affiliateId: currentAffiliate?._id as string,
  });
  const createTicket = useMutation(api.support.createTicket);
  const addTicketMessage = useMutation(api.support.addTicketMessage);

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [view, setView] = useState<"tickets" | "chat">("tickets");

  const newTicket = useState({
    subject: "",
    description: "",
    category: "other" as "deal" | "product" | "commission" | "technical" | "other",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
  });

  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedTicket && tickets) {
      const updated = tickets.find((t: any) => t._id === selectedTicket._id);
      if (updated) {
        setSelectedTicket(updated);
      }
    }
  }, [tickets, selectedTicket?._id]);

  useEffect(() => {
    if (view === "chat" && selectedTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTicket?.messages, view]);

  if (currentAffiliate === null || tickets === null) {
    return (
      <div className="space-y-6">
        <div className="rs-skeleton h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rs-skeleton h-24" />
          <div className="rs-skeleton h-24" />
          <div className="rs-skeleton h-24" />
        </div>
      </div>
    );
  }

  const handleSubmitTicket = async () => {
    if (!currentAffiliate?._id || !newTicket[0].subject || !newTicket[0].description)
      return;
    setSubmitting(true);
    try {
      await createTicket({
        affiliateId: currentAffiliate._id,
        subject: newTicket[0].subject,
        description: newTicket[0].description,
        category: newTicket[0].category,
        priority: newTicket[0].priority,
      });
      setShowTicketModal(false);
      newTicket[1]({
        subject: "",
        description: "",
        category: "other",
        priority: "medium",
      });
    } catch (error) {
      console.error("Failed to create ticket:", error);
    }
    setSubmitting(false);
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    await addTicketMessage({
      ticketId: selectedTicket._id,
      sender: "affiliate",
      content: replyMessage,
    });
    setReplyMessage("");
  };

  const openTickets =
    tickets?.filter((t) => t.status === "open" || t.status === "in_progress").length || 0;
  const resolvedTickets =
    tickets?.filter((t) => t.status === "resolved" || t.status === "closed").length || 0;

  const sortedTickets = [...(tickets || [])].sort(
    (a: any, b: any) => b.updatedAt - a.updatedAt
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="rs-overline">Support</span>
          <h1 className="rs-page-title text-2xl md:text-[28px] mt-1">
            Get help and view your tickets
          </h1>
          <p className="rs-page-subtitle">
            Open a ticket or browse common questions below.
          </p>
        </div>
        <button
          onClick={() => setShowTicketModal(true)}
          className="rs-btn-primary"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rs-card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="rs-icon-tile rs-icon-tile--info">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span className="rs-pill">{openTickets} open</span>
          </div>
          <div className="text-2xl font-semibold text-white rs-stat">{openTickets}</div>
          <div
            className="text-xs mt-1"
            style={{ color: "var(--rs-text-secondary)" }}
          >
            Open tickets
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rs-card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="rs-icon-tile rs-icon-tile--success">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div
            className="text-2xl font-semibold rs-stat"
            style={{ color: "var(--rs-success)" }}
          >
            {resolvedTickets}
          </div>
          <div
            className="text-xs mt-1"
            style={{ color: "var(--rs-text-secondary)" }}
          >
            Resolved
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rs-card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="rs-icon-tile rs-icon-tile--warning">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-white rs-stat">&lt; 24h</div>
          <div
            className="text-xs mt-1"
            style={{ color: "var(--rs-text-secondary)" }}
          >
            Avg response
          </div>
        </motion.div>
      </div>

      {/* Main Content - Tickets List or Chat View */}
      {view === "chat" && selectedTicket ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Back button and ticket list */}
          <div className="lg:col-span-1 space-y-3">
            <button
              onClick={() => {
                setView("tickets");
                setSelectedTicket(null);
              }}
              className="rs-btn-ghost"
              style={{ height: 32 }}
            >
              <ChevronDown className="w-3.5 h-3.5 rotate-90" />
              Back to Tickets
            </button>

            <div className="rs-card overflow-hidden">
              <div className="max-h-[500px] overflow-y-auto">
                {sortedTickets.map((ticket: any) => (
                  <div
                    key={ticket._id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="p-4 cursor-pointer transition-colors"
                    style={{
                      borderBottom: "1px solid var(--rs-border)",
                      background:
                        selectedTicket?._id === ticket._id
                          ? "var(--rs-accent-soft)"
                          : "transparent",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            ticket.status === "closed"
                              ? ""
                              : "text-white"
                          }`}
                          style={{
                            color:
                              ticket.status === "closed"
                                ? "var(--rs-text-muted)"
                                : undefined,
                          }}
                        >
                          {ticket.subject}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: "var(--rs-text-muted)" }}
                        >
                          {ticket.description}
                        </p>
                      </div>
                      <StatusPill status={ticket.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <PriorityPill priority={ticket.priority} />
                      <span
                        className="text-[10px] ml-auto"
                        style={{ color: "var(--rs-text-muted)" }}
                      >
                        {formatRelativeTime(ticket.updatedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat View */}
          <div className="lg:col-span-2 rs-card overflow-hidden flex flex-col">
            <div
              className="p-4"
              style={{ borderBottom: "1px solid var(--rs-border)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {selectedTicket.subject}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <StatusPill status={selectedTicket.status} />
                    <PriorityPill priority={selectedTicket.priority} />
                    <span
                      className="text-[11px]"
                      style={{ color: "var(--rs-text-muted)" }}
                    >
                      Created {formatDate(selectedTicket.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px]">
              <div
                className="rounded-2xl rounded-tl-sm p-4 max-w-[90%]"
                style={{
                  background: "var(--rs-bg-base)",
                  border: "1px solid var(--rs-border)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="rs-icon-tile rs-icon-tile--accent w-6 h-6">
                    <span className="text-[10px] font-semibold">
                      {currentAffiliate?.firstName?.[0]}
                      {currentAffiliate?.lastName?.[0]}
                    </span>
                  </div>
                  <span
                    className="text-xs"
                    style={{ color: "var(--rs-text-secondary)" }}
                  >
                    {currentAffiliate?.firstName} {currentAffiliate?.lastName}
                  </span>
                  <span
                    className="text-[11px]"
                    style={{ color: "var(--rs-text-muted)" }}
                  >
                    · {formatDate(selectedTicket.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-white whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>

              {selectedTicket.messages?.map((msg: any, idx: number) => {
                const isAdmin = msg.sender === "admin";
                return (
                  <div
                    key={idx}
                    className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl p-4 ${
                        isAdmin ? "rounded-tr-sm" : "rounded-tl-sm"
                      }`}
                      style={{
                        background: isAdmin
                          ? "var(--rs-accent)"
                          : "var(--rs-bg-base)",
                        border: isAdmin
                          ? "1px solid var(--rs-accent)"
                          : "1px solid var(--rs-border)",
                        color: "white",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {isAdmin ? (
                          <>
                            <span className="text-xs font-medium">Support Team</span>
                            <span
                              className="text-[11px]"
                              style={{ color: "rgba(255,255,255,0.7)" }}
                            >
                              · {formatRelativeTime(msg.createdAt)}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="rs-icon-tile rs-icon-tile--accent w-6 h-6">
                              <span className="text-[10px] font-semibold">
                                {currentAffiliate?.firstName?.[0]}
                              </span>
                            </div>
                            <span
                              className="text-xs"
                              style={{ color: "var(--rs-text-secondary)" }}
                            >
                              {currentAffiliate?.firstName}
                            </span>
                            <span
                              className="text-[11px]"
                              style={{ color: "var(--rs-text-muted)" }}
                            >
                              · {formatRelativeTime(msg.createdAt)}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {selectedTicket.status !== "closed" ? (
              <div
                className="p-4"
                style={{ borderTop: "1px solid var(--rs-border)" }}
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your reply..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleReply()}
                    className="rs-input flex-1"
                    style={{ height: 42 }}
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyMessage.trim()}
                    className="rs-btn-primary disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="p-4 text-center"
                style={{
                  borderTop: "1px solid var(--rs-border)",
                  background: "var(--rs-bg-overlay)",
                }}
              >
                <p
                  className="text-xs"
                  style={{ color: "var(--rs-text-muted)" }}
                >
                  This ticket is closed. Contact support to reopen.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="rs-section-header-title inline">My Tickets</div>
            <span className="rs-pill">{tickets?.length || 0} total</span>
          </div>
          {tickets && tickets.length > 0 ? (
            <div className="space-y-2">
              {sortedTickets.map((ticket: any, index: number) => {
                const CategoryIcon = categoryIcons[ticket.category] || HelpCircle;
                return (
                  <motion.div
                    key={ticket._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setView("chat");
                    }}
                    className="rs-card p-5 cursor-pointer transition-all hover:border-white/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="rs-icon-tile rs-icon-tile--neutral">
                          <CategoryIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {ticket.status === "closed" && (
                              <span
                                className="text-xs"
                                style={{ color: "var(--rs-text-muted)" }}
                              >
                                ✓
                              </span>
                            )}
                            <h3
                              className="text-sm font-semibold"
                              style={{
                                color:
                                  ticket.status === "closed"
                                    ? "var(--rs-text-muted)"
                                    : "var(--rs-text-primary)",
                              }}
                            >
                              {ticket.subject}
                            </h3>
                          </div>
                          <p
                            className="text-xs line-clamp-2 mt-1"
                            style={{ color: "var(--rs-text-secondary)" }}
                          >
                            {ticket.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <StatusPill status={ticket.status} />
                            <PriorityPill priority={ticket.priority} />
                            <span
                              className="text-[10px]"
                              style={{ color: "var(--rs-text-muted)" }}
                            >
                              {formatRelativeTime(ticket.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronUp
                        className="w-4 h-4 rotate-90 flex-shrink-0"
                        style={{ color: "var(--rs-text-muted)" }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="rs-empty-state py-16">
              <div className="rs-empty-state-icon">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div className="rs-empty-state-title">No support tickets</div>
              <div className="rs-empty-state-description">
                Submit a ticket if you need help.
              </div>
              <button
                onClick={() => setShowTicketModal(true)}
                className="rs-btn-primary mt-3 inline-flex"
              >
                <Plus className="w-3.5 h-3.5" />
                Open your first ticket
              </button>
            </div>
          )}
        </div>
      )}

      {/* FAQ Section */}
      <div className="space-y-4">
        <div className="rs-section-header-title">Frequently Asked Questions</div>
        {faqs.map((category) => (
          <div key={category.category} className="space-y-2">
            <div
              className="flex items-center gap-2 mb-2"
              style={{ color: "var(--rs-text-muted)" }}
            >
              <category.icon className="w-3.5 h-3.5" />
              <span className="text-xs font-medium uppercase tracking-wider">
                {category.category}
              </span>
            </div>
            {category.questions.map((faq, i) => {
              const faqId = `${category.category}-${i}`;
              const isExpanded = expandedFaq === faqId;

              return (
                <motion.div
                  key={faqId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rs-card overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : faqId)}
                    className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-[var(--rs-bg-overlay)]"
                  >
                    <span className="text-sm font-medium text-white pr-4">
                      {faq.q}
                    </span>
                    {isExpanded ? (
                      <ChevronUp
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "var(--rs-text-muted)" }}
                      />
                    ) : (
                      <ChevronDown
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "var(--rs-text-muted)" }}
                      />
                    )}
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="px-4 pb-4 pt-0 text-sm"
                          style={{ borderTop: "1px solid var(--rs-border)", color: "var(--rs-text-secondary)", paddingTop: 12 }}
                        >
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {showTicketModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rs-modal-backdrop"
            onClick={() => setShowTicketModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rs-modal max-w-md w-full p-0"
            >
              <div className="rs-modal-header">
                <h3 className="text-base font-semibold text-white">
                  New Support Ticket
                </h3>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="p-1 rounded-md hover:bg-white/5 transition-colors"
                  style={{ color: "var(--rs-text-secondary)" }}
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="rs-modal-body space-y-3">
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--rs-text-secondary)" }}
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of your issue"
                    value={newTicket[0].subject}
                    onChange={(e) =>
                      newTicket[1]({ ...newTicket[0], subject: e.target.value })
                    }
                    className="rs-input"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--rs-text-secondary)" }}
                  >
                    Category
                  </label>
                  <select
                    value={newTicket[0].category}
                    onChange={(e) =>
                      newTicket[1]({
                        ...newTicket[0],
                        category: e.target.value as any,
                      })
                    }
                    className="rs-input"
                  >
                    <option value="deal">Deal Related</option>
                    <option value="product">Product</option>
                    <option value="commission">Commission</option>
                    <option value="technical">Technical</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--rs-text-secondary)" }}
                  >
                    Priority
                  </label>
                  <select
                    value={newTicket[0].priority}
                    onChange={(e) =>
                      newTicket[1]({
                        ...newTicket[0],
                        priority: e.target.value as any,
                      })
                    }
                    className="rs-input"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--rs-text-secondary)" }}
                  >
                    Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your issue in detail..."
                    value={newTicket[0].description}
                    onChange={(e) =>
                      newTicket[1]({
                        ...newTicket[0],
                        description: e.target.value,
                      })
                    }
                    className="rs-input rs-input--textarea"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowTicketModal(false)}
                    className="rs-btn-ghost flex-1 justify-center"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitTicket}
                    disabled={
                      submitting ||
                      !newTicket[0].subject ||
                      !newTicket[0].description
                    }
                    className="rs-btn-primary flex-1 justify-center disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Submit Ticket
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