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
  FileText,
  DollarSign,
  ShoppingCart,
  Settings,
  BookOpen,
  User
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDate, formatRelativeTime } from "@/lib/utils";

const faqs = [
  {
    category: "Commissions",
    icon: DollarSign,
    questions: [
      {
        q: "How is my commission calculated?",
        a: "Your commission is calculated based on your tier level. Bronze: 5%, Silver: 7.5%, Gold: 10%, Platinum: 12-15%. Commissions are approved after order delivery/installation."
      },
      {
        q: "When do I get paid?",
        a: "Commissions are paid monthly via EFT to your registered bank account. You can request a payout once you have R500+ in pending commissions."
      },
      {
        q: "What's the difference between pending and approved commission?",
        a: "Pending commission is earned but not yet approved - this happens when an order is delivered. Approved commission is ready for payout once you request it."
      },
    ],
  },
  {
    category: "Orders",
    icon: ShoppingCart,
    questions: [
      {
        q: "How do I create an order?",
        a: "Go to the Orders page and click 'New Order'. You'll need to fill in client details and products. The order will be sent to our suppliers for processing."
      },
      {
        q: "Can I track my order status?",
        a: "Yes! Visit the Orders page to see real-time status updates: Draft → Submitted → Supplier Confirmed → In Transit → Delivered → Installed."
      },
      {
        q: "What happens after a deal is closed?",
        a: "Once a deal is marked as 'Closed Won', you can create an order from it. This triggers the fulfillment process and eventually your commission approval."
      },
    ],
  },
  {
    category: "Training",
    icon: BookOpen,
    questions: [
      {
        q: "Why can't I sell products?",
        a: "You need to complete all required training modules and get approved to sell. Go to Training to start your certification."
      },
      {
        q: "How do I get approved to sell?",
        a: "Complete all required training modules and pass the assessments. An admin will review and approve your selling privileges."
      },
    ],
  },
  {
    category: "General",
    icon: HelpCircle,
    questions: [
      {
        q: "How do I upgrade my tier?",
        a: "Visit the Tier page to see requirements. Silver upgrades automatically after your first sale. Gold at R150k sales. Platinum requires R899.69/month subscription."
      },
      {
        q: "What are the benefits of Platinum tier?",
        a: "Platinum members get 12-15% commission (higher rates on select products), access to exclusive leads, priority support, and advanced training modules."
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

const priorityColors: Record<string, string> = {
  low: "bg-gray-500/10 text-gray-400",
  medium: "bg-blue-500/10 text-blue-400",
  high: "bg-amber-500/10 text-amber-400",
  urgent: "bg-red-500/10 text-red-400",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-400",
  in_progress: "bg-amber-500/10 text-amber-400",
  resolved: "bg-emerald-500/10 text-emerald-400",
  closed: "bg-gray-500/10 text-gray-400",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export default function SupportPage() {
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate);
  const tickets = useQuery(api.support.getMyTickets, { 
    affiliateId: currentAffiliate?._id as string 
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

  // Update selected ticket when tickets change
  useEffect(() => {
    if (selectedTicket && tickets) {
      const updated = tickets.find((t: any) => t._id === selectedTicket._id);
      if (updated) {
        setSelectedTicket(updated);
      }
    }
  }, [tickets, selectedTicket?._id]);

  // Auto-scroll to bottom when viewing chat
  useEffect(() => {
    if (view === "chat" && selectedTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTicket?.messages, view]);

  // Loading state
  if (currentAffiliate === null || tickets === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleSubmitTicket = async () => {
    if (!currentAffiliate?._id || !newTicket[0].subject || !newTicket[0].description) return;
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

  const openTickets = tickets?.filter(t => t.status === "open" || t.status === "in_progress").length || 0;

  // Sort tickets by updated time
  const sortedTickets = [...(tickets || [])].sort((a: any, b: any) => b.updatedAt - a.updatedAt);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Support</h1>
          <p className="text-gray-400">Get help and view your tickets</p>
        </div>
        <button 
          onClick={() => setShowTicketModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111113] rounded-2xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-gray-400 text-sm">Open Tickets</span>
          </div>
          <p className="text-2xl font-bold text-white">{openTickets}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#111113] rounded-2xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-gray-400 text-sm">Resolved</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {tickets?.filter(t => t.status === "resolved" || t.status === "closed").length || 0}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111113] rounded-2xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-gray-400 text-sm">Avg Response</span>
          </div>
          <p className="text-2xl font-bold text-white">&lt; 24h</p>
        </motion.div>
      </div>

      {/* Main Content - Tickets List or Chat View */}
      {view === "chat" && selectedTicket ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Back button and ticket list */}
          <div className="lg:col-span-1 space-y-4">
            <button
              onClick={() => { setView("tickets"); setSelectedTicket(null); }}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronDown className="w-4 h-4 rotate-90" />
              Back to Tickets
            </button>
            
            <div className="bg-[#111113] rounded-2xl border border-white/5 overflow-hidden">
              <div className="max-h-[500px] overflow-y-auto">
                {sortedTickets.map((ticket: any) => (
                  <div
                    key={ticket._id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                      selectedTicket?._id === ticket._id ? "bg-blue-600/20" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${
                          ticket.status === "closed" ? "text-gray-500" : "text-white"
                        }`}>
                          {ticket.subject}
                        </p>
                        <p className="text-gray-500 text-sm truncate">
                          {ticket.description}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                        {statusLabels[ticket.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${priorityColors[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                      <span className="text-gray-600 text-xs ml-auto">
                        {formatRelativeTime(ticket.updatedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat View */}
          <div className="lg:col-span-2 bg-[#111113] rounded-2xl border border-white/5 overflow-hidden flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[selectedTicket.status]}`}>
                      {statusLabels[selectedTicket.status]}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${priorityColors[selectedTicket.priority]}`}>
                      {selectedTicket.priority} priority
                    </span>
                    <span className="text-gray-500 text-xs">
                      Created {formatDate(selectedTicket.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
              {/* Original Message */}
              <div className="bg-white/5 rounded-2xl rounded-tl-sm p-4 max-w-[90%]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium text-white">
                    {currentAffiliate?.firstName?.[0]}{currentAffiliate?.lastName?.[0]}
                  </div>
                  <span className="text-gray-400 text-xs">
                    {currentAffiliate?.firstName} {currentAffiliate?.lastName}
                  </span>
                  <span className="text-gray-600 text-xs">· {formatDate(selectedTicket.createdAt)}</span>
                </div>
                <p className="text-white whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {/* Replies */}
              {selectedTicket.messages?.map((msg: any, idx: number) => {
                const isAdmin = msg.sender === "admin";
                return (
                  <div
                    key={idx}
                    className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[90%] rounded-2xl p-4 ${
                      isAdmin 
                        ? "bg-blue-600 text-white rounded-tr-sm" 
                        : "bg-white/5 text-white rounded-tl-sm"
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {isAdmin ? (
                          <>
                            <span className="text-xs text-blue-200 font-medium">Support Team</span>
                            <span className="text-blue-300 text-xs">· {formatRelativeTime(msg.createdAt)}</span>
                          </>
                        ) : (
                          <>
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium text-white">
                              {currentAffiliate?.firstName?.[0]}
                            </div>
                            <span className="text-gray-400 text-xs">
                              {currentAffiliate?.firstName}
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
                    onKeyPress={(e) => e.key === "Enter" && handleReply()}
                    className="flex-1 px-4 py-3 bg-black border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyMessage.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 border-t border-white/5 bg-gray-900/50">
                <p className="text-gray-500 text-sm text-center">This ticket is closed. Contact support to reopen.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* My Tickets List View */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">My Tickets</h2>
            {tickets && tickets.length > 0 ? (
              <div className="space-y-3">
                {sortedTickets.map((ticket: any, index: number) => {
                  const CategoryIcon = categoryIcons[ticket.category] || HelpCircle;
                  return (
                    <motion.div
                      key={ticket._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => { setSelectedTicket(ticket); setView("chat"); }}
                      className="bg-[#111113] rounded-2xl p-5 border border-white/5 cursor-pointer hover:border-white/10 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                            <CategoryIcon className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              {ticket.status === "closed" && (
                                <span className="text-gray-500">✓</span>
                              )}
                              <h3 className={`font-semibold ${ticket.status === "closed" ? "text-gray-500" : "text-white"}`}>
                                {ticket.subject}
                              </h3>
                            </div>
                            <p className="text-gray-400 text-sm line-clamp-2 mt-1">{ticket.description}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[ticket.status]}`}>
                                {statusLabels[ticket.status]}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[ticket.priority]}`}>
                                {ticket.priority}
                              </span>
                              <span className="text-gray-600 text-xs">
                                {formatRelativeTime(ticket.updatedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronUp className="w-5 h-5 text-gray-600 rotate-90 flex-shrink-0" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[#111113] rounded-2xl p-12 border border-white/5 text-center">
                <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No support tickets</p>
                <p className="text-gray-500 text-sm">Submit a ticket if you need help</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Frequently Asked Questions</h2>
        {faqs.map((category) => (
          <div key={category.category} className="space-y-2">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <category.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{category.category}</span>
            </div>
            {category.questions.map((faq, i) => {
              const faqId = `${category.category}-${i}`;
              const isExpanded = expandedFaq === faqId;
              
              return (
                <motion.div
                  key={faqId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#111113] rounded-xl border border-white/5 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : faqId)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="text-white font-medium pr-4">{faq.q}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
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
                        <div className="px-4 pb-4 pt-0">
                          <p className="text-gray-400">{faq.a}</p>
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
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTicketModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111113] rounded-2xl p-6 max-w-md w-full border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">New Support Ticket</h3>
                <button 
                  onClick={() => setShowTicketModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Subject</label>
                  <input
                    type="text"
                    placeholder="Brief description of your issue"
                    value={newTicket[0].subject}
                    onChange={(e) => newTicket[1]({ ...newTicket[0], subject: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Category</label>
                  <select
                    value={newTicket[0].category}
                    onChange={(e) => newTicket[1]({ ...newTicket[0], category: e.target.value as any })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="deal">Deal Related</option>
                    <option value="product">Product</option>
                    <option value="commission">Commission</option>
                    <option value="technical">Technical</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Priority</label>
                  <select
                    value={newTicket[0].priority}
                    onChange={(e) => newTicket[1]({ ...newTicket[0], priority: e.target.value as any })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your issue in detail..."
                    value={newTicket[0].description}
                    onChange={(e) => newTicket[1]({ ...newTicket[0], description: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="flex-1 py-3 border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitTicket}
                  disabled={submitting || !newTicket[0].subject || !newTicket[0].description}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Ticket
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
