"use client";

import React, { useState } from "react";
import { Compass, MapPin, Maximize2, Shapes, Navigation, ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SmartSearchProps {
  onSearch: (params: {
    location: string;
    plotSize: string;
    shape: string;
    direction: string;
  }) => void;
}

export default function SmartSearch({ onSearch }: SmartSearchProps) {
  const [activeTab, setActiveTab] = useState<"plot" | "preferences" | "budget">("plot");
  
  // Plot details state
  const [location, setLocation] = useState("Kochi, Kerala");
  const [plotSize, setPlotSize] = useState("10 Cents / 2,400 Sq.Ft");
  const [plotShape, setPlotShape] = useState("Rectangular");
  const [roadDirection, setRoadDirection] = useState("North Facing");

  // Preferences state
  const [bedrooms, setBedrooms] = useState("3-4 Beds");
  const [stylePreference, setStylePreference] = useState("Contemporary Tropical");

  // Budget state
  const [budgetRange, setBudgetRange] = useState("₹70L - ₹1.2 Cr Construction");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      location,
      plotSize,
      shape: plotShape,
      direction: roadDirection,
    });
  };

  return (
    <section id="search-section" className="py-16 sm:py-20 bg-warm-grey border-y border-warm-border">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Heading and Context */}
          <div className="lg:col-span-4">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-normal font-serif tracking-[-0.01em] text-charcoal mb-4">
              What Are We <br />
              Building On?
            </h2>
            <p className="text-[15px] leading-relaxed text-secondaryText mb-6 max-w-sm font-light font-sans">
              Tell us about your land and get architectural designs that actually fit your topography, orientation, and building bylaws.
            </p>

            <div className="pt-2 space-y-3">
              <a
                href="/plot-intelligence"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-copper text-white text-xs font-sans font-medium hover:bg-copper-dark transition-all shadow-sm group"
              >
                <Compass className="w-4 h-4 text-white" />
                <span>Launch Satellite Plot Intelligence</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </a>
              <div className="text-[11px] text-charcoal/50 font-sans">
                Mark your property corners on live satellite imagery & calculate Cents.
              </div>
            </div>
          </div>

          {/* Right Column: Search Card + Interactive Plot Diagram */}
          <div className="lg:col-span-8 bg-white border border-warm-border shadow-subtle p-6 sm:p-8 rounded-2xl">
            {/* Tabs */}
            <div className="flex border-b border-warm-border pb-3 mb-6 space-x-6 sm:space-x-8 text-[13px]">
              <button
                type="button"
                onClick={() => setActiveTab("plot")}
                className={`font-medium pb-2 transition-colors relative ${
                  activeTab === "plot" ? "text-charcoal" : "text-mutedText hover:text-charcoal"
                }`}
              >
                By Plot Details
                {activeTab === "plot" && (
                  <motion.div
                    layoutId="activeSearchTab"
                    className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-charcoal"
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("preferences")}
                className={`font-medium pb-2 transition-colors relative ${
                  activeTab === "preferences" ? "text-charcoal" : "text-mutedText hover:text-charcoal"
                }`}
              >
                By Preferences
                {activeTab === "preferences" && (
                  <motion.div
                    layoutId="activeSearchTab"
                    className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-charcoal"
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("budget")}
                className={`font-medium pb-2 transition-colors relative ${
                  activeTab === "budget" ? "text-charcoal" : "text-mutedText hover:text-charcoal"
                }`}
              >
                By Budget
                {activeTab === "budget" && (
                  <motion.div
                    layoutId="activeSearchTab"
                    className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-charcoal"
                  />
                )}
              </button>
            </div>

            {/* Tab Form and Plot Diagram Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Form Parameters */}
              <div className="md:col-span-7">
                <form onSubmit={handleSearchSubmit} className="space-y-4">
                  <AnimatePresence mode="wait">
                    {activeTab === "plot" && (
                      <motion.div
                        key="plot-tab"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        {/* Location */}
                        <div className="border border-warm-border p-3 transition-colors focus-within:border-charcoal bg-warm-card rounded-xl">
                          <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-copper" />
                            Location
                          </label>
                          <select
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full bg-transparent text-[13px] font-medium text-charcoal outline-none cursor-pointer"
                          >
                            <option value="Kochi, Kerala">Kochi, Kerala</option>
                            <option value="Bengaluru, Karnataka">Bengaluru, Karnataka</option>
                            <option value="Trivandrum, Kerala">Trivandrum, Kerala</option>
                            <option value="Calicut, Kerala">Calicut, Kerala</option>
                            <option value="Chennai, Tamil Nadu">Chennai, Tamil Nadu</option>
                            <option value="Coimbatore, Tamil Nadu">Coimbatore, Tamil Nadu</option>
                            <option value="Hyderabad, Telangana">Hyderabad, Telangana</option>
                          </select>
                        </div>

                        {/* Plot Size */}
                        <div className="border border-warm-border p-3 transition-colors focus-within:border-charcoal bg-warm-card rounded-xl">
                          <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1 flex items-center gap-1.5">
                            <Maximize2 className="w-3 h-3 text-copper" />
                            Plot Size
                          </label>
                          <select
                            value={plotSize}
                            onChange={(e) => setPlotSize(e.target.value)}
                            className="w-full bg-transparent text-[13px] font-medium text-charcoal outline-none cursor-pointer"
                          >
                            <option value="5 Cents / 1,200 Sq.Ft">Compact Plot (5 Cents / 1,200 Sq.Ft)</option>
                            <option value="8 Cents / 1,900 Sq.Ft">Medium Plot (8 Cents / 1,900 Sq.Ft)</option>
                            <option value="10 Cents / 2,400 Sq.Ft">Standard Plot (10 Cents / 2,400 Sq.Ft)</option>
                            <option value="12 Cents / 2,900 Sq.Ft">Villa Plot (12 Cents / 2,900 Sq.Ft)</option>
                            <option value="15 Cents / 3,600 Sq.Ft">Large Plot (15 Cents / 3,600 Sq.Ft)</option>
                            <option value="20+ Cents / 5,000+ Sq.Ft">Estate Plot (20+ Cents / 5,000+ Sq.Ft)</option>
                          </select>
                        </div>

                        {/* Shape */}
                        <div className="border border-warm-border p-3 transition-colors focus-within:border-charcoal bg-warm-card rounded-xl">
                          <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1 flex items-center gap-1.5">
                            <Shapes className="w-3 h-3 text-copper" />
                            Shape
                          </label>
                          <select
                            value={plotShape}
                            onChange={(e) => setPlotShape(e.target.value)}
                            className="w-full bg-transparent text-[13px] font-medium text-charcoal outline-none cursor-pointer"
                          >
                            <option value="Rectangular">Rectangular (Standard 1:1.5)</option>
                            <option value="Square">Square Plot</option>
                            <option value="Corner Plot">Corner / Dual Road Frontage</option>
                            <option value="Narrow Frontage">Narrow Deep Frontage</option>
                            <option value="Sloped / Contour">Sloped Terrain / Contour</option>
                          </select>
                        </div>

                        {/* Road Direction */}
                        <div className="border border-warm-border p-3 transition-colors focus-within:border-charcoal bg-warm-card rounded-xl">
                          <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1 flex items-center gap-1.5">
                            <Compass className="w-3 h-3 text-copper" />
                            Road Direction
                          </label>
                          <select
                            value={roadDirection}
                            onChange={(e) => setRoadDirection(e.target.value)}
                            className="w-full bg-transparent text-[13px] font-medium text-charcoal outline-none cursor-pointer"
                          >
                            <option value="North Facing">North Facing (Vaastu Compliant)</option>
                            <option value="East Facing">East Facing (Morning Sun)</option>
                            <option value="South Facing">South Facing</option>
                            <option value="West Facing">West Facing (Sunset View)</option>
                          </select>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "preferences" && (
                      <motion.div
                        key="preferences-tab"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <div className="border border-warm-border p-3 bg-warm-card rounded-xl">
                          <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1">
                            Bedrooms & Levels
                          </label>
                          <select
                            value={bedrooms}
                            onChange={(e) => setBedrooms(e.target.value)}
                            className="w-full bg-transparent text-[13px] font-medium text-charcoal outline-none cursor-pointer"
                          >
                            <option value="2-3 Beds (Single Level)">2-3 Beds (Single Level)</option>
                            <option value="3-4 Beds">3-4 Beds (G+1 Villa)</option>
                            <option value="4-5 Beds">4-5 Beds (Luxury G+2 Villa)</option>
                            <option value="Multi-generation">Multi-generational (Separate Units)</option>
                          </select>
                        </div>

                        <div className="border border-warm-border p-3 bg-warm-card rounded-xl">
                          <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1">
                            Architectural Style
                          </label>
                          <select
                            value={stylePreference}
                            onChange={(e) => setStylePreference(e.target.value)}
                            className="w-full bg-transparent text-[13px] font-medium text-charcoal outline-none cursor-pointer"
                          >
                            <option value="Contemporary Tropical">Contemporary Tropical</option>
                            <option value="Kerala Courtyard / Traditional">Kerala Courtyard / Traditional</option>
                            <option value="Minimalist Modern">Minimalist Modern</option>
                            <option value="Exposed Brick / Earth">Exposed Brick / Earth Architecture</option>
                            <option value="Mediterranean Coastal">Mediterranean Coastal</option>
                          </select>
                        </div>

                        <div className="border border-warm-border p-3 bg-warm-card rounded-xl">
                          <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1">
                            Primary Feature
                          </label>
                          <select className="w-full bg-transparent text-[13px] font-medium text-charcoal outline-none cursor-pointer">
                            <option>Central Open Courtyard (Nadumuttam)</option>
                            <option>Plunge Pool & Deck</option>
                            <option>Double-Height Living Space</option>
                            <option>Home Office & Library</option>
                          </select>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "budget" && (
                      <motion.div
                        key="budget-tab"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <div className="border border-warm-border p-3 bg-warm-card rounded-xl">
                          <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1">
                            Estimated Construction Budget
                          </label>
                          <select
                            value={budgetRange}
                            onChange={(e) => setBudgetRange(e.target.value)}
                            className="w-full bg-transparent text-[13px] font-medium text-charcoal outline-none cursor-pointer"
                          >
                            <option value="₹40L - ₹70L">₹40L - ₹70L (Cost-effective)</option>
                            <option value="₹70L - ₹1.2 Cr Construction">₹70L - ₹1.2 Cr (Premium Residential)</option>
                            <option value="₹1.2 Cr - ₹2 Cr">₹1.2 Cr - ₹2 Cr (Luxury Estate)</option>
                            <option value="Above ₹2 Cr">Above ₹2 Cr (Ultra-Luxury Signature)</option>
                          </select>
                        </div>

                        <div className="border border-warm-border p-3 bg-warm-card rounded-xl">
                          <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1">
                            Architectural Plan Package
                          </label>
                          <select className="w-full bg-transparent text-[13px] font-medium text-charcoal outline-none cursor-pointer">
                            <option>Concept Plan + 3D Elevations (₹50,000)</option>
                            <option>Complete Structural, MEP & Working CAD (₹85,000)</option>
                            <option>Turnkey Full Architect Engagement (Custom)</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full mt-2 py-3.5 px-6 bg-charcoal hover:bg-charcoal-light text-white text-[13px] font-medium tracking-wide flex items-center justify-center gap-2 transition-all duration-200 rounded-xl"
                  >
                    <span>Find Matching Designs</span>
                    <ArrowRight className="w-4 h-4 text-copper" />
                  </button>
                </form>
              </div>

              {/* Right Side: Architectural Plot Schematic Diagram */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-warm-card border border-warm-border/60 rounded-xl">
                <div className="relative w-full aspect-square max-w-[240px] flex items-center justify-center">
                  
                  {/* Technical Plot Schematic SVG matching design.png */}
                  <svg
                    viewBox="0 0 240 240"
                    className="w-full h-full text-charcoal/40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Background grid */}
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E8E6E2" strokeWidth="0.8" />
                      </pattern>
                      <pattern id="diagonalHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="0" y2="8" stroke="#AD8065" strokeWidth="1" strokeOpacity="0.25" />
                      </pattern>
                    </defs>

                    <rect width="240" height="240" fill="url(#grid)" />

                    {/* Isometric Plot Outline */}
                    <g transform="translate(10, 10)">
                      {/* Plot Polygon */}
                      <polygon
                        points="80,30 180,60 140,190 40,160"
                        fill="url(#diagonalHatch)"
                        stroke="#171717"
                        strokeWidth="1.5"
                      />

                      {/* Setback line / Building footprint */}
                      <polygon
                        points="85,55 160,78 130,170 55,147"
                        fill="#FFFFFF"
                        fillOpacity="0.85"
                        stroke="#AD8065"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                      />

                      {/* North Arrow / Compass indicator */}
                      <g transform="translate(195, 30)">
                        <circle cx="0" cy="0" r="10" stroke="#777777" strokeWidth="0.8" fill="#FFF" />
                        <line x1="0" y1="6" x2="0" y2="-6" stroke="#171717" strokeWidth="1.2" />
                        <polygon points="0,-7 3,-2 -3,-2" fill="#AD8065" />
                        <text x="-3" y="-10" fontSize="8" fill="#171717" fontWeight="bold">N</text>
                      </g>

                      {/* Dimension Labels matching design.png */}
                      <text x="125" y="40" fontSize="9" fill="#777777" fontFamily="monospace">60 ft</text>
                      <text x="18" y="110" fontSize="9" fill="#777777" fontFamily="monospace">40 ft</text>

                      {/* Footprint text */}
                      <text x="75" y="115" fontSize="8.5" fill="#171717" fontWeight="600" letterSpacing="0.05em">
                        BUILDABLE
                      </text>
                      <text x="78" y="127" fontSize="7.5" fill="#AD8065">
                        ZONE
                      </text>
                    </g>
                  </svg>
                </div>

                <div className="mt-3 text-center">
                  <div className="text-[11px] font-semibold text-charcoal tracking-wide">
                    {plotSize.split("(")[0]}
                  </div>
                  <div className="text-[10px] text-mutedText uppercase tracking-wider mt-0.5">
                    {roadDirection} • {plotShape}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

