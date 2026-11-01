"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InsideOutExplorer from "@/components/InsideOutExplorer";
import SellerModal from "@/components/SellerModal";
import Link from "next/link";
import { 
  FileCheck, 
  Layers, 
  Ruler, 
  ShieldCheck, 
  Download, 
  ArrowRight,
  HardHat,
  Compass,
  Cpu
} from "lucide-react";

export default function HowItWorksPage() {
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [sampleDownloaded, setSampleDownloaded] = useState(false);

  const deliverables = [
    {
      icon: Layers,
      title: "1. Architectural Working CAD Drawings",
      desc: "Comprehensive 1:50 scale floor plans, dimensional layouts, door-window schedules, stair details, and cross-sectional elevations in editable DWG and printable high-res PDF formats.",
    },
    {
      icon: Ruler,
      title: "2. Structural Engineering Drawings",
      desc: "RCC frame detailing, footings, column center-line plans, beam reinforcement schedules, slab rebar drawings, and lintel specifications calibrated for regional seismic and soil conditions.",
    },
    {
      icon: Cpu,
      title: "3. MEP Engineering (Electrical & PHE)",
      desc: "Full plumbing layout with dual sewage/greywater lines, water supply conduit runs, three-phase electrical single-line diagrams, fixture load balancing, and solar changeover conduits.",
    },
    {
      icon: FileCheck,
      title: "4. Detailed BOQ & Material Estimation",
      desc: "Itemized Bill of Quantities with accurate quantities of cement, steel tonnage, sand, brick units, tiles, and woodwork to get precise, un-inflated quotes from local civil contractors.",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar onOpenSellerModal={() => setIsSellerModalOpen(true)} />

      {/* Hero Header */}
      <section className="pt-32 pb-14 bg-warm-grey border-b border-warm-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal font-serif tracking-tight text-charcoal mb-4">
            Explore Designs Inside Out.
          </h1>
          <p className="text-[15px] sm:text-base leading-relaxed text-secondaryText max-w-2xl font-light font-sans">
            S-ARC is not a concept gallery. Every plan you discover is an exhaustive, construction-ready architectural drawing set created and stamped by licensed professionals.
          </p>
        </div>
      </section>

      {/* Interactive Explorer Section */}
      <InsideOutExplorer />

      {/* Drawing Package Breakdown */}
      <section className="py-20 sm:py-24 bg-white border-b border-warm-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="max-w-xl mb-14">
            <div className="text-[11px] font-semibold tracking-widestExtra text-copper uppercase mb-3 font-sans">
              What&apos;s In The Box
            </div>
            <h2 className="text-3xl sm:text-4xl font-normal font-serif tracking-tight text-charcoal mb-4">
              Everything Your Builder Needs to Start Construction
            </h2>
            <p className="text-[15px] leading-relaxed text-secondaryText font-light font-sans">
              No missing details, no guesswork on site. Eliminate builder markups and misinterpretations with our standardized 42-sheet architectural packages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
            {deliverables.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-warm-grey border border-warm-border p-6 sm:p-8 flex flex-col justify-between rounded-2xl"
                >
                  <div>
                    <div className="w-10 h-10 rounded-full bg-white border border-warm-border flex items-center justify-center text-copper mb-5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-normal font-serif text-charcoal mb-3">
                      {item.title}
                    </h3>
                    <p className="text-[14px] leading-relaxed text-secondaryText font-light font-sans">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Download Sample Blueprint Banner */}
          <div className="bg-charcoal text-white p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 rounded-3xl">
            <div className="space-y-2">
              <span className="text-[10px] tracking-widestExtra text-copper uppercase font-sans font-semibold">
                Free Evaluation Sheet
              </span>
              <h3 className="text-2xl sm:text-3xl font-normal font-serif">
                Download a Sample Architectural Sheet
              </h3>
              <p className="text-sm text-white/70 max-w-lg font-light font-sans">
                Inspect a real 3-bedroom villa drawing set including floor plans, section cuts, and structural reinforcement details.
              </p>
            </div>

            <button
              onClick={() => setSampleDownloaded(true)}
              className="px-6 py-3.5 bg-copper hover:bg-copper-hover text-white text-xs font-medium font-sans tracking-wide shrink-0 flex items-center gap-2 transition-colors rounded-full"
            >
              <Download className="w-4 h-4" />
              <span>{sampleDownloaded ? "Sample DWG Downloaded!" : "Download Sample CAD (DWG / PDF)"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4-Step How It Works Process */}
      <section className="py-20 bg-warm-grey">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-normal font-serif text-charcoal">
              From Plot to Finished Residence
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-warm-border p-6 relative rounded-2xl">
              <span className="text-3xl font-serif text-copper/40 font-normal">01</span>
              <h4 className="text-lg font-serif text-charcoal mt-2 mb-2">Input Land Dimensions</h4>
              <p className="text-xs text-secondaryText font-light font-sans leading-relaxed">
                Filter designs calibrated to your exact cents, road frontage direction, and municipal setback requirements.
              </p>
            </div>

            <div className="bg-white border border-warm-border p-6 relative rounded-2xl">
              <span className="text-3xl font-serif text-copper/40 font-normal">02</span>
              <h4 className="text-lg font-serif text-charcoal mt-2 mb-2">3D & CAD Inspection</h4>
              <p className="text-xs text-secondaryText font-light font-sans leading-relaxed">
                Tour isometric views, evaluate sunlight analysis, and study room proportions with our interactive viewer.
              </p>
            </div>

            <div className="bg-white border border-warm-border p-6 relative rounded-2xl">
              <span className="text-3xl font-serif text-copper/40 font-normal">03</span>
              <h4 className="text-lg font-serif text-charcoal mt-2 mb-2">Secure Plan Purchase</h4>
              <p className="text-xs text-secondaryText font-light font-sans leading-relaxed">
                Receive the instant uncompressed CAD, Structural, and MEP package with full copyright building license.
              </p>
            </div>

            <div className="bg-white border border-warm-border p-6 relative rounded-2xl">
              <span className="text-3xl font-serif text-copper/40 font-normal">04</span>
              <h4 className="text-lg font-serif text-charcoal mt-2 mb-2">Direct Architect Access</h4>
              <p className="text-xs text-secondaryText font-light font-sans leading-relaxed">
                Schedule video calls with the original architect for site orientation tweaks or municipal approval assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer onOpenSellerModal={() => setIsSellerModalOpen(true)} />

      <SellerModal
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
      />
    </main>
  );
}

