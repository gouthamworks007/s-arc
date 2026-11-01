"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  Box, 
  Layers, 
  Ruler, 
  FileText, 
  Palette, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  Maximize2,
  CheckCircle2,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InsideOutExplorer() {
  const [activeTab, setActiveTab] = useState<"3d" | "floorplan" | "dimensions" | "specs" | "materials">("3d");
  const [selectedFloor, setSelectedFloor] = useState<"ground" | "first" | "terrace">("ground");
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  const hotspots = [
    { id: 1, title: "Cantilevered Master Suite", desc: "18-foot clear overhang with floor-to-ceiling thermally broken glazing.", x: "65%", y: "32%" },
    { id: 2, title: "Central Open Courtyard", desc: "Microclimate cooling core drawing cool air through lower louvers.", x: "48%", y: "52%" },
    { id: 3, title: "Linear Reflection Pool", desc: "Integrated rainwater recycling overflow system with bio-filtration.", x: "32%", y: "74%" },
    { id: 4, title: "Solar Pergola Roof", desc: "Integrated 5kW monocrystalline bifacial photovoltaic array.", x: "55%", y: "15%" },
  ];

  return (
    <section id="inside-out" className="py-20 sm:py-24 bg-white border-b border-warm-border">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-normal font-serif tracking-[-0.01em] text-charcoal mb-3">
              Explore Designs Inside Out.
            </h2>
            <p className="text-[15px] leading-relaxed text-secondaryText max-w-xl font-light font-sans">
              View 3D renders, architectural floor plans, precise dimensions and technical specifications before purchasing any design.
            </p>
          </div>

          <a
            href="#explore"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-charcoal hover:text-copper transition-colors group shrink-0"
          >
            <span>See How It Works</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Main Interactive Stage Container matching design.png */}
        <div className="bg-warm-grey border border-warm-border p-5 sm:p-8 rounded-3xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Explorer Mode Switcher Pills */}
            <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              <button
                onClick={() => setActiveTab("3d")}
                className={`flex items-center gap-3 px-4 py-3 text-[13px] font-medium transition-all text-left border shrink-0 rounded-xl ${
                  activeTab === "3d"
                    ? "bg-white text-charcoal border-charcoal shadow-sm"
                    : "bg-transparent text-secondaryText border-transparent hover:text-charcoal hover:bg-white/60"
                }`}
              >
                <Box className={`w-4 h-4 ${activeTab === "3d" ? "text-copper" : "text-mutedText"}`} />
                <span>3D Isometric View</span>
              </button>

              <button
                onClick={() => setActiveTab("floorplan")}
                className={`flex items-center gap-3 px-4 py-3 text-[13px] font-medium transition-all text-left border shrink-0 rounded-xl ${
                  activeTab === "floorplan"
                    ? "bg-white text-charcoal border-charcoal shadow-sm"
                    : "bg-transparent text-secondaryText border-transparent hover:text-charcoal hover:bg-white/60"
                }`}
              >
                <Layers className={`w-4 h-4 ${activeTab === "floorplan" ? "text-copper" : "text-mutedText"}`} />
                <span>Floor Plan</span>
              </button>

              <button
                onClick={() => setActiveTab("dimensions")}
                className={`flex items-center gap-3 px-4 py-3 text-[13px] font-medium transition-all text-left border shrink-0 rounded-xl ${
                  activeTab === "dimensions"
                    ? "bg-white text-charcoal border-charcoal shadow-sm"
                    : "bg-transparent text-secondaryText border-transparent hover:text-charcoal hover:bg-white/60"
                }`}
              >
                <Ruler className={`w-4 h-4 ${activeTab === "dimensions" ? "text-copper" : "text-mutedText"}`} />
                <span>Dimensions & Bylaws</span>
              </button>

              <button
                onClick={() => setActiveTab("specs")}
                className={`flex items-center gap-3 px-4 py-3 text-[13px] font-medium transition-all text-left border shrink-0 rounded-xl ${
                  activeTab === "specs"
                    ? "bg-white text-charcoal border-charcoal shadow-sm"
                    : "bg-transparent text-secondaryText border-transparent hover:text-charcoal hover:bg-white/60"
                }`}
              >
                <FileText className={`w-4 h-4 ${activeTab === "specs" ? "text-copper" : "text-mutedText"}`} />
                <span>Technical Specifications</span>
              </button>

              <button
                onClick={() => setActiveTab("materials")}
                className={`flex items-center gap-3 px-4 py-3 text-[13px] font-medium transition-all text-left border shrink-0 rounded-xl ${
                  activeTab === "materials"
                    ? "bg-white text-charcoal border-charcoal shadow-sm"
                    : "bg-transparent text-secondaryText border-transparent hover:text-charcoal hover:bg-white/60"
                }`}
              >
                <Palette className={`w-4 h-4 ${activeTab === "materials" ? "text-copper" : "text-mutedText"}`} />
                <span>Material Palette</span>
              </button>
            </div>

            {/* Center Area: Visual Model / 3D Axonometric Render */}
            <div className="lg:col-span-5 relative min-h-[360px] sm:min-h-[420px] flex items-center justify-center bg-white border border-warm-border p-4 rounded-2xl overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === "3d" && (
                  <motion.div
                    key="tab-3d"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="relative w-full h-full flex flex-col items-center justify-center"
                  >
                    {/* Isometric Architectural Model Graphic matching design.png */}
                    <div className="relative w-full h-72 sm:h-80">
                      <Image
                        src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80"
                        alt="3D Architectural Axonometric Cutaway Model"
                        fill
                        className="object-contain object-center"
                      />

                      {/* Interactive Hotspot pins matching high-end architectural software */}
                      {hotspots.map((spot) => (
                        <div
                          key={spot.id}
                          style={{ left: spot.x, top: spot.y }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                        >
                          <button
                            onClick={() => setActiveHotspot(activeHotspot === spot.id ? null : spot.id)}
                            className="relative flex items-center justify-center w-6 h-6 rounded-full bg-copper text-white shadow-md hover:scale-125 transition-transform"
                            aria-label={spot.title}
                          >
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-copper opacity-60"></span>
                            <span className="text-[10px] font-bold">{spot.id}</span>
                          </button>

                          {/* Tooltip */}
                          <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-charcoal text-white p-2.5 text-[11px] shadow-xl pointer-events-none transition-all duration-200 ${
                            activeHotspot === spot.id ? "opacity-100 visible" : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
                          }`}>
                            <div className="font-semibold text-copper-light mb-0.5">{spot.title}</div>
                            <div className="text-white/80 leading-tight">{spot.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-mutedText text-center mt-3 flex items-center justify-center gap-2">
                      <Info className="w-3.5 h-3.5 text-copper" />
                      <span>Click numbered points to inspect architectural engineering details</span>
                    </div>
                  </motion.div>
                )}

                {activeTab === "floorplan" && (
                  <motion.div
                    key="tab-floorplan"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex flex-col items-center justify-center p-4"
                  >
                    <div className="text-center mb-4">
                      <div className="text-xs font-semibold text-charcoal uppercase tracking-wider">
                        {selectedFloor === "ground" ? "Ground Floor Plan (1,420 Sq.Ft)" : selectedFloor === "first" ? "First Floor Plan (1,030 Sq.Ft)" : "Rooftop Terrace & Solar Layout"}
                      </div>
                      <div className="text-[11px] text-mutedText">Scale 1:100 • All dimensions in feet & inches</div>
                    </div>

                    {/* Detailed Vector Floor Plan Graphic */}
                    <div className="w-full max-w-[320px] aspect-[4/3] relative border border-warm-border p-2 bg-warm-card">
                      <svg viewBox="0 0 300 220" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="20" y="20" width="260" height="180" stroke="#171717" strokeWidth="2.5" fill="#FAFAF9" />
                        {/* Outer walls */}
                        <line x1="20" y1="110" x2="160" y2="110" stroke="#171717" strokeWidth="2" />
                        <line x1="160" y1="20" x2="160" y2="170" stroke="#171717" strokeWidth="2" />
                        <line x1="100" y1="110" x2="100" y2="200" stroke="#171717" strokeWidth="1.5" />
                        
                        {/* Courtyard */}
                        <rect x="110" y="50" width="40" height="40" stroke="#AD8065" strokeWidth="1.5" strokeDasharray="3 2" fill="#F5F4F1" />
                        <text x="115" y="73" fontSize="7" fill="#AD8065" fontWeight="600">COURT</text>

                        {/* Room labels */}
                        <text x="35" y="55" fontSize="8" fill="#171717" fontWeight="bold">LIVING ROOM</text>
                        <text x="35" y="68" fontSize="7" fill="#777777">18&apos;-0&quot; x 16&apos;-6&quot;</text>

                        <text x="35" y="145" fontSize="8" fill="#171717" fontWeight="bold">DINING & PANTRY</text>
                        <text x="35" y="158" fontSize="7" fill="#777777">14&apos;-0&quot; x 12&apos;-0&quot;</text>

                        <text x="180" y="55" fontSize="8" fill="#171717" fontWeight="bold">MASTER SUITE</text>
                        <text x="180" y="68" fontSize="7" fill="#777777">16&apos;-0&quot; x 15&apos;-0&quot;</text>

                        <text x="180" y="145" fontSize="8" fill="#171717" fontWeight="bold">GUEST SUITE</text>
                        <text x="180" y="158" fontSize="7" fill="#777777">14&apos;-0&quot; x 12&apos;-6&quot;</text>

                        {/* Door swings */}
                        <path d="M 70 110 A 25 25 0 0 1 95 85" stroke="#777777" strokeWidth="0.8" fill="none" strokeDasharray="2 2" />
                        <path d="M 160 80 A 25 25 0 0 1 185 105" stroke="#777777" strokeWidth="0.8" fill="none" strokeDasharray="2 2" />
                      </svg>
                    </div>
                  </motion.div>
                )}

                {activeTab === "dimensions" && (
                  <motion.div
                    key="tab-dim"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full text-left space-y-3 p-4"
                  >
                    <div className="border-b border-warm-border pb-2">
                      <div className="text-xs uppercase tracking-wider text-mutedText">Plot Footprint & Coverage</div>
                      <div className="text-sm font-semibold text-charcoal">Ground Coverage: 38% (Allowed: Up to 50%)</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-warm-grey p-2.5">
                        <span className="text-mutedText block">Front Setback</span>
                        <span className="font-semibold text-charcoal">15 ft (Road width 30ft)</span>
                      </div>
                      <div className="bg-warm-grey p-2.5">
                        <span className="text-mutedText block">Rear Setback</span>
                        <span className="font-semibold text-charcoal">10 ft (Rainwater ditch)</span>
                      </div>
                      <div className="bg-warm-grey p-2.5">
                        <span className="text-mutedText block">Side Setbacks</span>
                        <span className="font-semibold text-charcoal">5 ft Left / 6 ft Right</span>
                      </div>
                      <div className="bg-warm-grey p-2.5">
                        <span className="text-mutedText block">FSI / FAR Ratio</span>
                        <span className="font-semibold text-charcoal">1.25 (Approved Zone)</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "specs" && (
                  <motion.div
                    key="tab-specs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full text-left space-y-3 p-4 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-copper shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-charcoal block">Structural Engineering</span>
                        <span className="text-secondaryText">M25 Grade RCC column-beam framing calculated for Seismic Zone III.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-copper shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-charcoal block">Electrical & Solar Conduit</span>
                        <span className="text-secondaryText">Three-phase wiring conduits with automated hybrid solar-grid changeover.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-copper shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-charcoal block">Plumbing & Greywater</span>
                        <span className="text-secondaryText">Dual plumbing line separating blackwater and greywater for landscape irrigation.</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "materials" && (
                  <motion.div
                    key="tab-mat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full grid grid-cols-2 gap-3 p-4 text-xs"
                  >
                    <div className="border border-warm-border p-2 bg-warm-card">
                      <div className="w-full h-12 bg-[#8c827a] mb-1.5" />
                      <div className="font-semibold text-charcoal">Board-Formed Concrete</div>
                      <div className="text-[10px] text-mutedText">Exterior facade with pine grain finish</div>
                    </div>
                    <div className="border border-warm-border p-2 bg-warm-card">
                      <div className="w-full h-12 bg-[#b87333]/70 mb-1.5" />
                      <div className="font-semibold text-charcoal">Natural Teakwood</div>
                      <div className="text-[10px] text-mutedText">FSC-certified sustainable joinery</div>
                    </div>
                    <div className="border border-warm-border p-2 bg-warm-card">
                      <div className="w-full h-12 bg-[#708090] mb-1.5" />
                      <div className="font-semibold text-charcoal">Kota Stone & Slate</div>
                      <div className="text-[10px] text-mutedText">Thermal mass interior flooring</div>
                    </div>
                    <div className="border border-warm-border p-2 bg-warm-card">
                      <div className="w-full h-12 bg-[#b2533e] mb-1.5" />
                      <div className="font-semibold text-charcoal">Perforated Clay Jaali</div>
                      <div className="text-[10px] text-mutedText">Passive ventilation breeze walls</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column: Architectural Blueprint Card matching design.png */}
            <div className="lg:col-span-4 bg-white border border-warm-border p-5 rounded-2xl">
              {/* Floor Plan Level Selector */}
              <div className="flex items-center justify-between border-b border-warm-border pb-3 mb-4">
                <select
                  value={selectedFloor}
                  onChange={(e) => setSelectedFloor(e.target.value as "ground" | "first" | "terrace")}
                  className="text-[13px] font-semibold text-charcoal bg-transparent outline-none cursor-pointer"
                >
                  <option value="ground">Ground Floor Plan</option>
                  <option value="first">First Floor Plan</option>
                  <option value="terrace">Terrace & Roof Plan</option>
                </select>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedFloor(selectedFloor === "terrace" ? "first" : "ground")}
                    className="w-6 h-6 border border-warm-border rounded-full flex items-center justify-center hover:bg-warm-grey text-charcoal"
                    aria-label="Previous floor"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSelectedFloor(selectedFloor === "ground" ? "first" : "terrace")}
                    className="w-6 h-6 border border-warm-border rounded-full flex items-center justify-center hover:bg-warm-grey text-charcoal"
                    aria-label="Next floor"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Blueprint Graphic */}
              <div className="relative aspect-square w-full bg-[#f8f9fa] border border-warm-border/80 p-3 flex items-center justify-center overflow-hidden rounded-xl">
                <svg viewBox="0 0 200 200" className="w-full h-full text-charcoal/80" fill="none">
                  {/* Grid */}
                  <defs>
                    <pattern id="bp-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#E8E6E2" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="200" height="200" fill="url(#bp-grid)" />

                  {/* Walls and rooms */}
                  <rect x="25" y="25" width="150" height="150" stroke="#171717" strokeWidth="2" fill="#fff" />
                  <line x1="25" y1="95" x2="175" y2="95" stroke="#171717" strokeWidth="1.5" />
                  <line x1="100" y1="25" x2="100" y2="175" stroke="#171717" strokeWidth="1.5" />
                  
                  {/* Center court */}
                  <rect x="75" y="70" width="50" height="50" stroke="#AD8065" strokeWidth="1.2" strokeDasharray="2 2" fill="#F5F4F1" />
                  <circle cx="100" cy="95" r="8" stroke="#AD8065" strokeWidth="0.8" />

                  {/* Compass */}
                  <g transform="translate(160, 45)">
                    <circle cx="0" cy="0" r="7" stroke="#777" strokeWidth="0.5" />
                    <line x1="0" y1="4" x2="0" y2="-4" stroke="#171717" strokeWidth="1" />
                    <text x="-2" y="-7" fontSize="5" fontWeight="bold">N</text>
                  </g>
                </svg>
              </div>

              <div className="mt-4 pt-3 border-t border-warm-border flex items-center justify-between text-[11px] text-mutedText">
                <span>CAD Package • 42 Working Drawings</span>
                <span className="text-copper font-medium">Download Ready</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

