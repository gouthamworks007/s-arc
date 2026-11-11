"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Check, Bed, Layers, Maximize, MapPin, Download, MessageSquare, ShieldCheck, FileCheck, ArrowRight } from "lucide-react";
import { ArchitecturalProject } from "@/lib/types";

interface ProjectModalProps {
  project: ArchitecturalProject | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [consultRequested, setConsultRequested] = useState(false);

  // Keyboard accessibility (Escape key) and body scroll lock
  React.useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const currentImage = project.gallery[activeImageIndex] || project.image;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn"
    >
      <div className="bg-white max-w-5xl w-full max-h-[92vh] overflow-y-auto border border-warm-border shadow-2xl relative rounded-3xl">
        
        {/* Sticky Header with Close Button */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-warm-border z-30 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div>
            <span className="text-[10px] tracking-widestExtra uppercase text-copper font-semibold">
              {project.style}
            </span>
            <h2 id="project-modal-title" className="text-xl sm:text-2xl font-normal text-charcoal">
              {project.name}
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

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Main Gallery Showcase */}
          <div>
            <div className="relative aspect-[16/9] w-full bg-charcoal overflow-hidden mb-3 rounded-2xl">
              <Image
                src={currentImage}
                alt={project.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] px-3 py-1 rounded-full">
                {project.location}
              </div>
            </div>

            {/* Thumbnail selector */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {project.gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`relative w-20 h-14 shrink-0 overflow-hidden border-2 transition-all rounded-lg ${
                    activeImageIndex === i ? "border-copper" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${i}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-warm-grey border border-warm-border text-center rounded-2xl">
            <div>
              <div className="text-[11px] text-mutedText uppercase tracking-wider">Plot Size</div>
              <div className="text-sm font-semibold text-charcoal mt-0.5">{project.plotSize}</div>
            </div>
            <div>
              <div className="text-[11px] text-mutedText uppercase tracking-wider">Built-up Area</div>
              <div className="text-sm font-semibold text-charcoal mt-0.5">{project.builtUpArea}</div>
            </div>
            <div>
              <div className="text-[11px] text-mutedText uppercase tracking-wider">Bedrooms</div>
              <div className="text-sm font-semibold text-charcoal mt-0.5">{project.bedrooms} BHK Suites</div>
            </div>
            <div>
              <div className="text-[11px] text-mutedText uppercase tracking-wider">Floors</div>
              <div className="text-sm font-semibold text-charcoal mt-0.5">{project.floors} Levels</div>
            </div>
          </div>

          {/* Description & Technical Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-lg font-medium text-charcoal">Design Concept</h3>
              <p className="text-[14px] leading-relaxed text-secondaryText">
                {project.description}
              </p>

              <h4 className="text-sm font-semibold text-charcoal uppercase tracking-wider pt-2">
                Architectural Highlights
              </h4>
              <ul className="space-y-2">
                {project.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-[13px] text-secondaryText">
                    <span className="w-1.5 h-1.5 rounded-full bg-copper mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 text-xs text-mutedText">
                <strong>Plot Dimensions:</strong> {project.dimensions.plotWidth} x {project.dimensions.plotLength} ({project.dimensions.setbacks})
              </div>
            </div>

            {/* Architect Card & Purchasing Actions */}
            <div className="lg:col-span-5 bg-warm-card border border-warm-border p-6 flex flex-col justify-between rounded-2xl">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-mutedText mb-3">
                  Lead Architect
                </div>
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-warm-grey">
                    <Image
                      src={project.architect.image}
                      alt={project.architect.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-charcoal flex items-center gap-1.5">
                      <span>{project.architect.name}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-copper" />
                    </div>
                    <div className="text-xs text-mutedText">{project.architect.studio}</div>
                    <div className="text-xs text-mutedText">{project.architect.location}</div>
                  </div>
                </div>

                <div className="border-t border-warm-border pt-4 mb-6">
                  <div className="text-[11px] uppercase tracking-wider text-mutedText mb-1">
                    Complete Architectural Drawing Package
                  </div>
                  <div className="text-2xl font-light text-charcoal">
                    {project.price}
                    <span className="text-xs text-mutedText font-normal ml-1">incl. taxes</span>
                  </div>
                  <div className="text-[11px] text-mutedText mt-1 flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5 text-copper" />
                    Includes CAD DWG, Structural, Plumbing, Electrical & 3D Renders
                  </div>
                </div>
              </div>

                {/* Actions */}
                <div className="space-y-2.5">
                  <Link
                    href={`/designs/${project.id}`}
                    onClick={onClose}
                    className="w-full py-3.5 min-h-[44px] bg-charcoal hover:bg-copper text-white text-xs font-medium tracking-wide flex items-center justify-center gap-2 transition-colors font-sans rounded-full shadow-sm"
                  >
                    <span>Open Full Project Showcase</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setDownloadSuccess(true)}
                    className="w-full py-3.5 min-h-[44px] bg-copper hover:bg-copper-hover text-white text-xs font-medium tracking-wide flex items-center justify-center gap-2 transition-colors rounded-full shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadSuccess ? "Sample Package Downloaded!" : "Download Sample Drawings"}</span>
                  </button>

                  {consultRequested ? (
                    <div className="w-full py-3 px-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-full text-center flex items-center justify-center gap-1.5 animate-fadeIn">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Consultation requested with Ar. {project.architect.name}!</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConsultRequested(true)}
                      className="w-full py-3.5 min-h-[44px] border border-charcoal hover:bg-charcoal hover:text-white text-charcoal text-xs font-medium tracking-wide flex items-center justify-center gap-2 transition-colors rounded-full"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Request Architect Consultation</span>
                    </button>
                  )}
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

