"use client";

import React, { useState } from "react";
import { useProjects } from "@/lib/projectsContext";
import { ClientInquiry } from "@/lib/types";
import { 
  MessageSquare, 
  MapPin, 
  Clock, 
  Mail, 
  Phone, 
  Send, 
  CheckCircle2, 
  Trash2, 
  AlertCircle,
  FileCheck,
  Filter
} from "lucide-react";

export default function InquiriesTab() {
  const { inquiries, updateInquiryStatus, replyToInquiry, deleteInquiry } = useProjects();
  const [filter, setFilter] = useState<"all" | "new" | "in_review" | "responded">("all");
  const [selectedInquiry, setSelectedInquiry] = useState<ClientInquiry | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  const filteredInquiries = inquiries.filter((inq) => {
    if (filter === "all") return true;
    return inq.status === filter;
  });

  const handleOpenReply = (inq: ClientInquiry) => {
    setSelectedInquiry(inq);
    setReplyText(inq.replyText || "");
    setIsReplyModalOpen(true);
  };

  const handleSendReply = () => {
    if (!selectedInquiry || !replyText.trim()) return;
    replyToInquiry(selectedInquiry.id, replyText.trim());
    setIsReplyModalOpen(false);
  };

  const getStatusBadge = (status: ClientInquiry["status"]) => {
    switch (status) {
      case "new":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-50 text-amber-700 border border-amber-200">
            ● New Lead
          </span>
        );
      case "in_review":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200">
            In Review
          </span>
        );
      case "responded":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            ✓ Responded
          </span>
        );
      case "completed":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-charcoal text-white">
            Completed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-warm-border">
        <div>
          <h2 className="text-2xl font-serif font-normal text-charcoal">
            Client Inquiries & Customization Requests
          </h2>
          <p className="text-xs text-secondaryText font-sans mt-0.5">
            Discerning homeowners requesting site fitments, Vastu orientation checks, and CAD blueprint customizations.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-warm-grey/60 border border-warm-border rounded-xl">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-sans transition-all ${
              filter === "all" ? "bg-white text-charcoal shadow-sm" : "text-secondaryText hover:text-charcoal"
            }`}
          >
            All ({inquiries.length})
          </button>
          <button
            onClick={() => setFilter("new")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-sans transition-all ${
              filter === "new" ? "bg-white text-charcoal shadow-sm" : "text-secondaryText hover:text-charcoal"
            }`}
          >
            New ({inquiries.filter((i) => i.status === "new").length})
          </button>
          <button
            onClick={() => setFilter("in_review")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-sans transition-all ${
              filter === "in_review" ? "bg-white text-charcoal shadow-sm" : "text-secondaryText hover:text-charcoal"
            }`}
          >
            In Review ({inquiries.filter((i) => i.status === "in_review").length})
          </button>
          <button
            onClick={() => setFilter("responded")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-sans transition-all ${
              filter === "responded" ? "bg-white text-charcoal shadow-sm" : "text-secondaryText hover:text-charcoal"
            }`}
          >
            Responded ({inquiries.filter((i) => i.status === "responded").length})
          </button>
        </div>
      </div>

      {/* Inquiry Cards List */}
      <div className="space-y-4">
        {filteredInquiries.length === 0 ? (
          <div className="p-12 text-center bg-white border border-warm-border rounded-3xl">
            <MessageSquare className="w-8 h-8 text-secondaryText/40 mx-auto mb-3" />
            <h3 className="text-base font-serif text-charcoal mb-1">No Inquiries Found</h3>
            <p className="text-xs text-secondaryText font-sans">
              There are no homeowner inquiries matching the selected filter.
            </p>
          </div>
        ) : (
          filteredInquiries.map((inq) => (
            <div
              key={inq.id}
              className="p-6 bg-white border border-warm-border hover:border-copper/40 rounded-3xl transition-all duration-200 shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="text-lg font-serif font-normal text-charcoal">
                      {inq.clientName}
                    </h3>
                    {getStatusBadge(inq.status)}
                    <span className="text-[11px] font-mono text-secondaryText flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {inq.date}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondaryText font-sans">
                    <span className="flex items-center gap-1 text-charcoal font-medium">
                      Project: <span className="text-copper">{inq.projectName}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-copper" />
                      {inq.plotLocation}
                    </span>
                    <span>Plot: {inq.plotDimensions}</span>
                    <span>Budget: {inq.budgetRange}</span>
                  </div>
                </div>

                {/* Status Switcher & Delete */}
                <div className="flex items-center gap-2 self-start">
                  <select
                    value={inq.status}
                    onChange={(e) => updateInquiryStatus(inq.id, e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl border border-warm-border text-xs font-sans bg-white text-charcoal focus:outline-none focus:border-copper"
                  >
                    <option value="new">Mark as New</option>
                    <option value="in_review">Mark In Review</option>
                    <option value="responded">Mark Responded</option>
                    <option value="completed">Mark Completed</option>
                  </select>

                  <button
                    onClick={() => deleteInquiry(inq.id)}
                    className="p-2 rounded-xl text-secondaryText hover:text-red-600 hover:bg-red-50 border border-transparent transition-colors"
                    title="Delete inquiry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Box */}
              <div className="p-4 rounded-2xl bg-warm-grey/50 border border-warm-border/60 mb-4">
                <p className="text-xs text-charcoal leading-relaxed font-sans">
                  &ldquo;{inq.message}&rdquo;
                </p>
              </div>

              {/* Previous Reply if any */}
              {inq.replyText && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 mb-4">
                  <div className="flex items-center justify-between text-[11px] font-mono text-emerald-800 mb-1">
                    <span className="font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Your Studio Reply
                    </span>
                    <span>{inq.respondedAt || "Recently"}</span>
                  </div>
                  <p className="text-xs text-emerald-950 font-sans leading-relaxed">
                    {inq.replyText}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-warm-border/50 text-xs font-sans">
                <div className="flex items-center gap-4 text-secondaryText">
                  <a
                    href={`mailto:${inq.clientEmail}`}
                    className="flex items-center gap-1 hover:text-charcoal transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{inq.clientEmail}</span>
                  </a>
                  <a
                    href={`tel:${inq.clientPhone}`}
                    className="flex items-center gap-1 hover:text-charcoal transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{inq.clientPhone}</span>
                  </a>
                </div>

                <button
                  onClick={() => handleOpenReply(inq)}
                  className="px-4 py-1.5 rounded-full bg-charcoal hover:bg-charcoal/90 text-white font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>{inq.replyText ? "Edit Response" : "Reply & Send Custom Quote"}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {isReplyModalOpen && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-warm-border rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-xl font-normal font-serif text-charcoal mb-1">
              Respond to {selectedInquiry.clientName}
            </h3>
            <p className="text-xs text-secondaryText font-sans mb-4">
              Send a personalized response or custom blueprint adjustment proposal for <strong>{selectedInquiry.projectName}</strong>.
            </p>

            <div className="p-3.5 bg-warm-grey/60 border border-warm-border rounded-xl text-xs text-secondaryText mb-4 font-sans line-clamp-3">
              &ldquo;{selectedInquiry.message}&rdquo;
            </div>

            <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
              Your Architectural Advice & Custom Quote
            </label>
            <textarea
              rows={5}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Dear client, regarding your plot in Wayanad, we can adapt the foundation schedule for the slope. The licensing fee includes 2 revisions..."
              className="w-full p-3.5 rounded-xl border border-warm-border text-xs text-charcoal font-sans leading-relaxed focus:outline-none focus:border-copper mb-4"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsReplyModalOpen(false)}
                className="px-4 py-2 rounded-full border border-warm-border text-xs font-medium text-secondaryText hover:text-charcoal"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendReply}
                className="px-5 py-2 rounded-full bg-copper hover:bg-copper-hover text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Response to Homeowner</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

