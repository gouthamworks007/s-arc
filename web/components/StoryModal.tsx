"use client";

import React from "react";
import Image from "next/image";
import { X, Play, Compass, Award } from "lucide-react";

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StoryModal({ isOpen, onClose }: StoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-warm-border shadow-2xl relative">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-warm-border z-30 px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] tracking-widestExtra uppercase text-copper font-semibold">
              Our Vision
            </span>
            <h2 className="text-xl sm:text-2xl font-normal text-charcoal">
              Less Decoration, More Architecture
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-warm-border hover:bg-warm-grey flex items-center justify-center text-charcoal transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Story Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="relative aspect-[16/9] w-full bg-charcoal overflow-hidden flex items-center justify-center">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
              alt="S-ARC Architecture Philosophy"
              fill
              className="object-cover opacity-80"
            />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-white/90 text-charcoal flex items-center justify-center shadow-lg">
                <Play className="w-5 h-5 ml-1 fill-current" />
              </div>
              <span className="text-xs text-white uppercase tracking-widest font-medium mt-3 bg-black/40 px-3 py-1 backdrop-blur-sm">
                Short Architectural Documentary (3:45)
              </span>
            </div>
          </div>

          <div className="space-y-4 text-[14px] leading-relaxed text-secondaryText">
            <p>
              Southern India possesses one of the world&apos;s most ecologically sensible vernacular architectural traditions. From the open rainwater courtyards of Kerala to the stone colonnades of Chettinad, buildings were crafted to breathe with the land.
            </p>
            <p>
              Yet in recent decades, cookie-cutter builder houses and generic glass-and-plaster boxes have dominated the landscape. <strong>S-ARC was established to return architecture to people.</strong>
            </p>
            <p>
              By bringing together the finest independent architects, we allow prospective homeowners to purchase thoroughly engineered, climate-responsive architectural designs tailored to their exact plot dimensions at a fraction of the traditional cost and timeline.
            </p>
          </div>

          <div className="pt-4 border-t border-warm-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-mutedText">
            <div>Founded in 2024 • Kochi & Bengaluru</div>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-charcoal text-white hover:bg-copper transition-colors"
            >
              Explore Our Curated Catalog
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

