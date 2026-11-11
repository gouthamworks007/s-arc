"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, MessageSquare, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { ArchitecturalProject, PlotAnalysisData } from "@/lib/types";
import { useAuth } from "@/lib/authContext";

interface ConsultArchitectModalProps {
  project: ArchitecturalProject | null;
  analysis?: PlotAnalysisData | null;
  locationName?: string;
  onClose: () => void;
}

export default function ConsultArchitectModal({
  project,
  analysis = null,
  locationName = "Kerala",
  onClose,
}: ConsultArchitectModalProps) {
  const { currentUser } = useAuth();

  const [clientName, setClientName] = useState(currentUser?.name || "");
  const [clientEmail, setClientEmail] = useState(currentUser?.email || "");
  const [clientPhone, setClientPhone] = useState(currentUser?.phone || "");
  const [budgetRange, setBudgetRange] = useState("₹50L - ₹80L");
  const [message, setMessage] = useState(
    analysis
      ? `I measured my plot (${analysis.areaCents.toFixed(1)} Cents, approx ${analysis.frontageFeet.toFixed(0)}ft frontage) using S-ARC Plot Intelligence. I would like to consult with Ar. ${project?.architect.name} regarding adapting ${project?.name} to our site contour and local setback clearance.`
      : `I am interested in consulting with Ar. ${project?.architect.name} regarding ${project?.name} for site contour adaptation and municipal clearances in ${locationName}.`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state if currentUser loads after mount
  useEffect(() => {
    if (currentUser) {
      if (!clientName) setClientName(currentUser.name || "");
      if (!clientEmail) setClientEmail(currentUser.email || "");
      if (!clientPhone && currentUser.phone) setClientPhone(currentUser.phone);
    }
  }, [currentUser, clientName, clientEmail, clientPhone]);

  // Accessibility: Escape key listener and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError("Please sign in to submit a consultation request.");
      return;
    }

    if (!message || message.trim().length < 5) {
      setError("Please provide a message with at least 5 characters.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const plotDimensions = analysis
      ? `${analysis.frontageFeet.toFixed(0)}ft frontage x ${analysis.depthFeet.toFixed(0)}ft depth (${analysis.areaCents.toFixed(1)} Cents)`
      : `${project.plotSize || "Standard Plot"}`;

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: clientName.trim() || currentUser.name,
          clientEmail: currentUser.email,
          clientPhone: clientPhone.trim() || undefined,
          projectName: project.name,
          projectId: project.id,
          plotLocation: locationName || project.location || "Kerala",
          plotDimensions,
          budgetRange,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit consultation request.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Failed to submit consultation request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consult-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto"
    >
      <div className="bg-white max-w-lg w-full rounded-3xl border border-warm-border p-6 sm:p-8 shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 w-8 h-8 rounded-full border border-warm-border hover:bg-warm-grey flex items-center justify-center text-charcoal transition-colors focus-visible:ring-2 focus-visible:ring-copper"
        >
          <X className="w-4 h-4" />
        </button>

        {!currentUser ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-copper/10 text-copper mx-auto flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 id="consult-modal-title" className="text-xl font-serif text-charcoal">
              Sign In to Consult With Ar. {project.architect.name}
            </h3>
            <p className="text-xs text-secondaryText font-sans max-w-sm mx-auto leading-relaxed">
              To protect site survey telemetry and facilitate direct communication with licensed studios, an authenticated account is required.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-warm-border text-xs font-sans text-charcoal hover:bg-warm-grey transition-colors"
              >
                Cancel
              </button>
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-copper hover:bg-copper-hover text-white text-xs font-sans font-medium transition-colors shadow-sm"
              >
                Sign In to Continue
              </Link>
            </div>
          </div>
        ) : submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 id="consult-modal-title" className="text-2xl font-serif text-charcoal">
              Consultation Dispatched
            </h3>
            <p className="text-xs text-charcoal/60 font-sans max-w-sm mx-auto leading-relaxed">
              Your inquiry and requirements have been transmitted to <strong>{project.architect.name}</strong> ({project.architect.studio}). The studio will reach out to you at {currentUser.email}.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-charcoal text-white text-xs font-sans font-medium hover:bg-black transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Architect Header */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-warm-border">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-warm-grey shrink-0 border border-warm-border">
                <Image
                  src={project.architect.image}
                  alt={project.architect.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] tracking-wider uppercase text-copper font-semibold font-sans">
                  Direct Architect Consultation
                </span>
                <h3 id="consult-modal-title" className="text-base font-serif text-charcoal flex items-center gap-1.5">
                  <span>{project.architect.name}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-copper" />
                </h3>
                <p className="text-[11px] text-charcoal/50 font-sans">
                  {project.architect.studio} • For {project.name}
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-sans border border-red-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-sans text-charcoal/70 mb-1 font-medium">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Anand Menon"
                  className="w-full px-3.5 py-2 rounded-xl border border-warm-border text-xs font-sans focus:outline-none focus:border-copper"
                />
              </div>

              <div>
                <label className="block text-[11px] font-sans text-charcoal/70 mb-1 font-medium">
                  Verified Account Email
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full px-3.5 py-2 rounded-xl border border-warm-border text-xs font-sans bg-warm-grey/50 text-charcoal/60 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-sans text-charcoal/70 mb-1 font-medium">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+91 98470 12345"
                  className="w-full px-3.5 py-2 rounded-xl border border-warm-border text-xs font-sans focus:outline-none focus:border-copper"
                />
              </div>

              <div>
                <label className="block text-[11px] font-sans text-charcoal/70 mb-1 font-medium">
                  Estimated Construction Budget
                </label>
                <select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-warm-border text-xs font-sans bg-white focus:outline-none focus:border-copper"
                >
                  <option value="₹35L - ₹50L">₹35L - ₹50L</option>
                  <option value="₹50L - ₹80L">₹50L - ₹80L</option>
                  <option value="₹80L - ₹1.2 Cr">₹80L - ₹1.2 Cr</option>
                  <option value="₹1.2 Cr - ₹2 Cr">₹1.2 Cr - ₹2 Cr</option>
                  <option value="Above ₹2 Cr">Above ₹2 Cr</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-sans text-charcoal/70 mb-1 font-medium">
                Message &amp; Site Adaptation Queries *
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-warm-border text-xs font-sans focus:outline-none focus:border-copper"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-sans font-medium text-charcoal/70 hover:bg-warm-grey transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-copper text-white text-xs font-sans font-medium hover:bg-copper-hover transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <span>Send Consultation Request</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
