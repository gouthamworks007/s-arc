"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, ArrowRight, Check, Maximize, Bed, Layers, ShieldCheck } from "lucide-react";
import { useSavedProjects } from "@/lib/savedProjectsContext";

export default function CompareModal() {
  const { savedProjects, isCompareOpen, setIsCompareOpen, toggleSave, clearAllSaved } = useSavedProjects();

  if (!isCompareOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white max-w-6xl w-full max-h-[92vh] overflow-y-auto border border-warm-border shadow-2xl relative flex flex-col rounded-3xl">
        
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-warm-border z-30 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div>
            <span className="text-[10px] tracking-widestExtra uppercase text-copper font-semibold font-sans">
              Side-by-Side Blueprint Comparison
            </span>
            <h2 className="text-xl sm:text-2xl font-normal font-serif text-charcoal">
              Compare Shortlisted Designs ({savedProjects.length}/4)
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {savedProjects.length > 0 && (
              <button
                onClick={clearAllSaved}
                className="text-xs text-mutedText hover:text-red-500 font-sans flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Shortlist
              </button>
            )}

            <button
              onClick={() => setIsCompareOpen(false)}
              className="w-8 h-8 rounded-full border border-warm-border hover:bg-warm-grey flex items-center justify-center text-charcoal transition-colors"
              aria-label="Close comparison"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comparison Table / Grid */}
        <div className="p-6 sm:p-8 flex-1 overflow-x-auto">
          {savedProjects.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-14 h-14 rounded-full bg-warm-grey border border-warm-border flex items-center justify-center mx-auto text-mutedText">
                <Maximize className="w-6 h-6 text-copper" />
              </div>
              <h3 className="text-2xl font-serif text-charcoal">No Designs Shortlisted Yet</h3>
              <p className="text-sm text-secondaryText font-light font-sans max-w-md mx-auto">
                Browse our architectural catalog and click the bookmark icon on any design card to compare specifications side-by-side.
              </p>
              <div className="pt-2">
                <Link
                  href="/designs"
                  onClick={() => setIsCompareOpen(false)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-charcoal text-white hover:bg-copper text-xs font-sans font-medium transition-colors rounded-full"
                >
                  <span>Explore Designs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="min-w-[700px]">
              {/* Projects Columns */}
              <div className="grid grid-cols-5 gap-4 pb-6 border-b border-warm-border">
                <div className="col-span-1 pt-6 font-sans">
                  <span className="text-xs uppercase tracking-wider text-mutedText block font-medium">Design Overview</span>
                </div>

                {savedProjects.map((project) => (
                  <div key={project.id} className="col-span-1 space-y-3 relative group">
                    <button
                      onClick={() => toggleSave(project.id)}
                      className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-charcoal hover:text-red-500 shadow-sm"
                      title="Remove from comparison"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div className="relative aspect-[16/11] w-full overflow-hidden bg-charcoal rounded-xl">
                      <Image src={project.image} alt={project.name} fill className="object-cover" />
                    </div>

                    <div>
                      <span className="text-[10px] tracking-widest text-copper uppercase font-sans font-semibold">
                        {project.style}
                      </span>
                      <h4 className="text-lg font-serif font-normal text-charcoal">{project.name}</h4>
                      <div className="text-xs font-semibold text-charcoal font-sans mt-0.5">{project.price}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Technical Comparison Rows */}
              <div className="divide-y divide-warm-border text-xs font-sans">
                {/* Built-up Area */}
                <div className="grid grid-cols-5 gap-4 py-3.5 items-center">
                  <span className="col-span-1 text-mutedText uppercase tracking-wider text-[11px]">Built-up Area</span>
                  {savedProjects.map((p) => (
                    <span key={p.id} className="col-span-1 font-semibold text-charcoal">{p.builtUpArea}</span>
                  ))}
                </div>

                {/* Plot Size */}
                <div className="grid grid-cols-5 gap-4 py-3.5 items-center">
                  <span className="col-span-1 text-mutedText uppercase tracking-wider text-[11px]">Plot Size (Cents)</span>
                  {savedProjects.map((p) => (
                    <span key={p.id} className="col-span-1 font-medium text-charcoal">{p.plotSize}</span>
                  ))}
                </div>

                {/* Bedrooms & Floors */}
                <div className="grid grid-cols-5 gap-4 py-3.5 items-center">
                  <span className="col-span-1 text-mutedText uppercase tracking-wider text-[11px]">Configuration</span>
                  {savedProjects.map((p) => (
                    <span key={p.id} className="col-span-1 font-medium text-charcoal">{p.bedrooms} BHK • {p.floors} Floors</span>
                  ))}
                </div>

                {/* Plot Dimensions */}
                <div className="grid grid-cols-5 gap-4 py-3.5 items-center">
                  <span className="col-span-1 text-mutedText uppercase tracking-wider text-[11px]">Plot Dimensions</span>
                  {savedProjects.map((p) => (
                    <span key={p.id} className="col-span-1 text-secondaryText">{p.dimensions.plotWidth} x {p.dimensions.plotLength}</span>
                  ))}
                </div>

                {/* Setback Requirements */}
                <div className="grid grid-cols-5 gap-4 py-3.5 items-center">
                  <span className="col-span-1 text-mutedText uppercase tracking-wider text-[11px]">Setback Buffer</span>
                  {savedProjects.map((p) => (
                    <span key={p.id} className="col-span-1 text-secondaryText text-[11px] leading-tight">{p.dimensions.setbacks}</span>
                  ))}
                </div>

                {/* Lead Architect */}
                <div className="grid grid-cols-5 gap-4 py-3.5 items-center">
                  <span className="col-span-1 text-mutedText uppercase tracking-wider text-[11px]">Lead Architect</span>
                  {savedProjects.map((p) => (
                    <div key={p.id} className="col-span-1">
                      <div className="font-medium text-charcoal flex items-center gap-1">
                        <span>{p.architect.name}</span>
                        <ShieldCheck className="w-3 h-3 text-copper" />
                      </div>
                      <div className="text-[10px] text-mutedText">{p.architect.studio}</div>
                    </div>
                  ))}
                </div>

                {/* Action Row */}
                <div className="grid grid-cols-5 gap-4 py-5 items-center bg-warm-card px-2 rounded-xl">
                  <span className="col-span-1 text-mutedText font-medium">Action</span>
                  {savedProjects.map((p) => (
                    <div key={p.id} className="col-span-1">
                      <Link
                        href={`/designs/${p.id}`}
                        onClick={() => setIsCompareOpen(false)}
                        className="w-full py-2.5 px-3 bg-charcoal hover:bg-copper text-white text-[11px] font-sans font-medium tracking-wide flex items-center justify-center gap-1.5 transition-colors rounded-full"
                      >
                        <span>View Project</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

