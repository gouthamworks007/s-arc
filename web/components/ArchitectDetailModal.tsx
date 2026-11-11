"use client";

import React from "react";
import Image from "next/image";
import { X, BadgeCheck, MapPin, Building, Mail, Award, ArrowRight } from "lucide-react";
import { ArchitectProfile } from "@/lib/types";

interface ArchitectDetailModalProps {
  architect: ArchitectProfile | null;
  onClose: () => void;
  onSelectProject: (id: string) => void;
}

export default function ArchitectDetailModal({
  architect,
  onClose,
  onSelectProject,
}: ArchitectDetailModalProps) {
  // Keyboard accessibility and body scroll lock
  React.useEffect(() => {
    if (!architect) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [architect, onClose]);

  if (!architect) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="architect-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn"
    >
      <div className="bg-white max-w-xl w-full max-h-[92vh] overflow-y-auto border border-warm-border shadow-2xl relative rounded-3xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-warm-border z-30 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div>
            <span className="text-[10px] tracking-widestExtra uppercase text-copper font-semibold">
              Verified Architect
            </span>
            <h2 id="architect-modal-title" className="text-xl font-normal text-charcoal flex items-center gap-1.5">
              <span>{architect.name}</span>
              <BadgeCheck className="w-4 h-4 fill-copper text-white" />
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 min-h-[36px] min-w-[36px] rounded-full border border-warm-border hover:bg-warm-grey flex items-center justify-center text-charcoal transition-colors focus-visible:ring-2 focus-visible:ring-copper"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
            <div className="relative w-28 h-28 rounded-full overflow-hidden bg-warm-grey shrink-0 border border-warm-border">
              <Image
                src={architect.image}
                alt={architect.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="text-sm font-semibold text-charcoal">{architect.title}</div>
              <div className="text-xs text-mutedText flex items-center justify-center sm:justify-start gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-copper" />
                <span>{architect.location}</span>
              </div>
              <div className="inline-block mt-3 px-3 py-1 bg-warm-grey border border-warm-border text-[11px] text-charcoal font-medium">
                Specialty: {architect.specialty}
              </div>
            </div>
          </div>

          <div className="border-t border-warm-border pt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-mutedText mb-2">
              Architectural Biography
            </h4>
            <p className="text-[13px] leading-relaxed text-secondaryText">
              {architect.bio}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 bg-warm-grey border border-warm-border text-center text-xs">
            <div>
              <div className="text-mutedText">Published Plans</div>
              <div className="text-lg font-semibold text-charcoal">{architect.projectsCount} Designs</div>
            </div>
            <div>
              <div className="text-mutedText">COA Status</div>
              <div className="text-lg font-semibold text-copper">Verified Active</div>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => {
                onClose();
                onSelectProject("ridge-house");
              }}
              className="w-full py-3 bg-charcoal hover:bg-copper text-white text-xs font-medium tracking-wide flex items-center justify-center gap-2 transition-colors"
            >
              <span>Explore Featured Project by {architect.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

