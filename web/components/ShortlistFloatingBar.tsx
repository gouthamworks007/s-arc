"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Layers, X, BookmarkCheck } from "lucide-react";
import { useSavedProjects } from "@/lib/savedProjectsContext";

export default function ShortlistFloatingBar() {
  const { savedProjects, setIsCompareOpen, clearAllSaved } = useSavedProjects();

  if (savedProjects.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-charcoal text-white px-5 py-3 shadow-2xl border border-white/10 flex items-center gap-4 sm:gap-6 animate-fadeIn max-w-[90vw] rounded-full">
      {/* Icon & Count */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-copper/20 border border-copper flex items-center justify-center text-copper">
          <BookmarkCheck className="w-4 h-4" />
        </div>
        <div className="text-xs font-sans">
          <span className="font-semibold">{savedProjects.length}</span>
          <span className="text-white/60 ml-1">Shortlisted</span>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="hidden sm:flex items-center -space-x-2 overflow-hidden">
        {savedProjects.map((p) => (
          <div key={p.id} className="relative w-8 h-8 rounded-full border-2 border-charcoal overflow-hidden">
            <Image src={p.image} alt={p.name} fill className="object-cover" />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsCompareOpen(true)}
          className="px-4 py-2 bg-copper hover:bg-copper-hover text-white text-xs font-sans font-medium flex items-center gap-1.5 transition-colors shadow-sm rounded-full"
        >
          <span>Compare Plans</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={clearAllSaved}
          className="text-white/40 hover:text-white transition-colors p-1"
          title="Clear shortlist"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

