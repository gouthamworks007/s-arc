"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SellerModal from "@/components/SellerModal";
import { ArrowLeft, MessageSquare } from "lucide-react";

interface LegalPageShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  lastUpdated?: string;
  legalDraftNotice?: boolean;
  children: React.ReactNode;
}

/** Shared editorial wrapper for policy, licensing, FAQ, and contact pages. */
export default function LegalPageShell({
  eyebrow,
  title,
  subtitle,
  lastUpdated = "November 27, 2026",
  legalDraftNotice = false,
  children,
}: LegalPageShellProps) {
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);

  return (
    <main id="main-content" className="min-h-screen bg-white text-charcoal">
      <Navbar onOpenSellerModal={() => setIsSellerModalOpen(true)} />

      <section className="pt-28 pb-12 sm:pt-32 sm:pb-14 bg-warm-grey border-b border-warm-border">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-sans text-mutedText hover:text-copper transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to S-ARC Home</span>
          </Link>
          <div className="text-[11px] font-mono uppercase tracking-widestExtra text-copper font-semibold mb-2">
            {eyebrow}
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-charcoal mb-3">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-secondaryText font-light leading-relaxed max-w-2xl">
            {subtitle}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-mono text-mutedText">
            <span>Effective / Last Updated: {lastUpdated}</span>
            {legalDraftNotice && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-sans text-[11px]">
                Platform Draft — Subject to counsel review before commercial launch
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 space-y-10 text-[14px] sm:text-[15px] leading-relaxed text-secondaryText font-sans font-light">
          {children}

          <div className="pt-8 border-t border-warm-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-charcoal">Need clarification or studio support?</p>
              <p className="text-xs text-mutedText mt-0.5">
                Reach our team at{" "}
                <a href="mailto:contact@southernarchitecture.in" className="text-copper hover:underline">
                  contact@southernarchitecture.in
                </a>
              </p>
            </div>
            <a
              href="https://wa.me/919446077889?text=Hi%20S-ARC%2C%20I%20have%20a%20question%20regarding%20a%20design%20or%20platform%20policy."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-emerald-600/30 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-medium transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Studio Support</span>
            </a>
          </div>
        </div>
      </section>

      <Footer onOpenSellerModal={() => setIsSellerModalOpen(true)} />
      <SellerModal isOpen={isSellerModalOpen} onClose={() => setIsSellerModalOpen(false)} />
    </main>
  );
}
