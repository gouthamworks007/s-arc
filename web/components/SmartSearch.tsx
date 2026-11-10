"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Compass, MapPin, Maximize2, Shapes, Navigation, ArrowRight, Check, Sparkles, Layers, Sliders, DollarSign, Bed, Home, Ruler, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SmartSearchProps {
  onSearch: (params: {
    location: string;
    plotSize: string;
    shape: string;
    direction: string;
  }) => void;
}

const PLOT_SIZES = [
  { label: "5 Cents", sqft: "2,178 Sq.Ft", builtUp: "1,200 – 1,400 Sq.Ft", value: "5 Cents / 1,200 Sq.Ft", dimensions: { w: "35 ft", l: "62 ft" } },
  { label: "8 Cents", sqft: "3,485 Sq.Ft", builtUp: "1,800 – 2,200 Sq.Ft", value: "8 Cents / 1,900 Sq.Ft", dimensions: { w: "42 ft", l: "83 ft" } },
  { label: "10 Cents", sqft: "4,356 Sq.Ft", builtUp: "2,400 – 2,800 Sq.Ft", value: "10 Cents / 2,400 Sq.Ft", dimensions: { w: "48 ft", l: "90 ft" } },
  { label: "12 Cents", sqft: "5,227 Sq.Ft", builtUp: "2,900 – 3,400 Sq.Ft", value: "12 Cents / 2,900 Sq.Ft", dimensions: { w: "55 ft", l: "95 ft" } },
  { label: "15 Cents", sqft: "6,534 Sq.Ft", builtUp: "3,600 – 4,200 Sq.Ft", value: "15 Cents / 3,600 Sq.Ft", dimensions: { w: "65 ft", l: "100 ft" } },
  { label: "20+ Cents", sqft: "8,712+ Sq.Ft", builtUp: "4,800 – 6,500 Sq.Ft", value: "20+ Cents / 5,000+ Sq.Ft", dimensions: { w: "80 ft", l: "110 ft" } },
];

const PLOT_SHAPES = [
  { id: "Rectangular", label: "Rectangular", desc: "Standard 1:1.5 Ratio", icon: "⬚" },
  { id: "Square", label: "Square Plot", desc: "Balanced 1:1 Footprint", icon: "⬜" },
  { id: "Corner Plot", label: "Corner Plot", desc: "Dual Road Frontage", icon: "⬡" },
  { id: "Narrow Frontage", label: "Narrow Deep", desc: "Linear Courtyard Site", icon: "▮" },
  { id: "Sloped / Contour", label: "Sloped Contour", desc: "Multi-level Hillside", icon: "〰" },
];

const ROAD_DIRECTIONS = [
  { id: "North Facing", label: "North", deg: 0, desc: "Vaastu Compliant" },
  { id: "East Facing", label: "East", deg: 90, desc: "Morning Sun" },
  { id: "South Facing", label: "South", deg: 180, desc: "Cooling Breeze" },
  { id: "West Facing", label: "West", deg: 270, desc: "Sunset Horizon" },
];

const LOCATIONS = [
  "Kochi, Kerala",
  "Trivandrum, Kerala",
  "Calicut, Kerala",
  "Thrissur, Kerala",
  "Kottayam, Kerala",
  "Kannur, Kerala",
  "Bengaluru, Karnataka",
  "Chennai, Tamil Nadu",
  "Coimbatore, Tamil Nadu",
];

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
  const [primaryFeature, setPrimaryFeature] = useState("Central Open Courtyard (Nadumuttam)");

  // Budget state
  const [budgetRange, setBudgetRange] = useState("₹70L - ₹1.2 Cr Construction");

  // Selected plot size details
  const currentSizeObj = useMemo(() => {
    return PLOT_SIZES.find((s) => s.value === plotSize) || PLOT_SIZES[2];
  }, [plotSize]);

  // Selected direction rotation degree
  const currentDirectionObj = useMemo(() => {
    return ROAD_DIRECTIONS.find((d) => d.id === roadDirection) || ROAD_DIRECTIONS[0];
  }, [roadDirection]);

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
    <section id="search-section" className="py-14 sm:py-20 bg-warm-grey border-y border-warm-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Heading and Context */}
          <div className="lg:col-span-4 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-copper/10 border border-copper/20 text-copper text-[10px] sm:text-[11px] font-mono tracking-wider uppercase">
              <Compass className="w-3.5 h-3.5" />
              <span>Smart Plot Matcher</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-normal font-serif tracking-[-0.01em] text-charcoal leading-[1.08]">
              What Are We <br className="hidden sm:inline" />
              Building On?
            </h2>

            <p className="text-[14px] sm:text-[15px] leading-relaxed text-secondaryText max-w-sm font-light font-sans">
              Enter your land dimensions, road orientation, and shape. Our interactive CAD simulator computes your buildable zone and matches architect-drawn plans.
            </p>

            <div className="pt-2 space-y-3">
              <Link
                href="/plot-intelligence"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-copper text-white text-xs font-sans font-medium hover:bg-copper-hover transition-all shadow-sm group"
              >
                <Compass className="w-4 h-4 text-white" />
                <span>Launch Satellite GIS Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <div className="text-[11px] text-charcoal/60 font-sans flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Supports GPS polygon mapping &amp; KMBR 2019 setbacks</span>
              </div>
            </div>
          </div>

          {/* Right Column: Search Card + Interactive Plot Diagram */}
          <div className="lg:col-span-8 bg-white border border-warm-border shadow-subtle p-5 sm:p-7 md:p-8 rounded-2xl">
            {/* Tabs */}
            <div className="flex border-b border-warm-border pb-3 mb-6 space-x-6 sm:space-x-8 text-[13px] font-sans">
              <button
                type="button"
                onClick={() => setActiveTab("plot")}
                className={`font-medium pb-2 transition-colors relative flex items-center gap-1.5 ${
                  activeTab === "plot" ? "text-charcoal" : "text-mutedText hover:text-charcoal"
                }`}
              >
                <Shapes className="w-3.5 h-3.5 text-copper" />
                <span>By Plot Details</span>
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
                className={`font-medium pb-2 transition-colors relative flex items-center gap-1.5 ${
                  activeTab === "preferences" ? "text-charcoal" : "text-mutedText hover:text-charcoal"
                }`}
              >
                <Bed className="w-3.5 h-3.5 text-copper" />
                <span>By Preferences</span>
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
                className={`font-medium pb-2 transition-colors relative flex items-center gap-1.5 ${
                  activeTab === "budget" ? "text-charcoal" : "text-mutedText hover:text-charcoal"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-copper" />
                <span>By Budget</span>
                {activeTab === "budget" && (
                  <motion.div
                    layoutId="activeSearchTab"
                    className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-charcoal"
                  />
                )}
              </button>
            </div>

            {/* Tab Form and Plot Diagram Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">
              
              {/* Form Parameters */}
              <div className="md:col-span-7">
                <form onSubmit={handleSearchSubmit} className="space-y-4">
                  <AnimatePresence mode="wait">
                    {/* TAB 1: PLOT DETAILS */}
                    {activeTab === "plot" && (
                      <motion.div
                        key="plot-tab"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        {/* Location Dropdown */}
                        <div className="border border-warm-border p-2.5 sm:p-3 transition-colors focus-within:border-charcoal bg-warm-card rounded-xl">
                          <label className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-mutedText mb-1 flex items-center gap-1.5 font-sans font-medium">
                            <MapPin className="w-3.5 h-3.5 text-copper" />
                            Location / District Hub
                          </label>
                          <select
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full bg-transparent text-[13px] font-medium text-charcoal outline-none cursor-pointer font-sans"
                          >
                            {LOCATIONS.map((loc) => (
                              <option key={loc} value={loc}>
                                {loc}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Interactive Plot Size Chips */}
                        <div className="border border-warm-border p-2.5 sm:p-3 bg-warm-card rounded-xl">
                          <label className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-mutedText mb-2 flex items-center justify-between font-sans font-medium">
                            <span className="flex items-center gap-1.5">
                              <Maximize2 className="w-3.5 h-3.5 text-copper" />
                              Plot Area (Cent &amp; Sq.Ft)
                            </span>
                            <span className="text-charcoal font-semibold font-mono text-[11px]">
                              {currentSizeObj.sqft}
                            </span>
                          </label>
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                            {PLOT_SIZES.map((size) => (
                              <button
                                key={size.value}
                                type="button"
                                onClick={() => setPlotSize(size.value)}
                                className={`py-1.5 px-2 rounded-lg text-xs font-sans font-medium transition-all text-center ${
                                  plotSize === size.value
                                    ? "bg-charcoal text-white shadow-sm"
                                    : "bg-white text-charcoal border border-warm-border hover:border-charcoal/40"
                                }`}
                              >
                                {size.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Shape Selector */}
                        <div className="border border-warm-border p-2.5 sm:p-3 bg-warm-card rounded-xl">
                          <label className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-mutedText mb-2 flex items-center gap-1.5 font-sans font-medium">
                            <Shapes className="w-3.5 h-3.5 text-copper" />
                            Parcel Geometry / Shape
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                            {PLOT_SHAPES.map((shape) => (
                              <button
                                key={shape.id}
                                type="button"
                                onClick={() => setPlotShape(shape.id)}
                                className={`py-2 px-2.5 rounded-lg text-left transition-all ${
                                  plotShape === shape.id
                                    ? "bg-charcoal text-white shadow-sm"
                                    : "bg-white text-charcoal border border-warm-border hover:border-charcoal/40"
                                }`}
                              >
                                <div className="text-xs font-medium font-sans flex items-center gap-1.5">
                                  <span>{shape.icon}</span>
                                  <span>{shape.label}</span>
                                </div>
                                <div className={`text-[10px] truncate mt-0.5 ${plotShape === shape.id ? "text-white/70" : "text-mutedText"}`}>
                                  {shape.desc}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Road Facing Direction */}
                        <div className="border border-warm-border p-2.5 sm:p-3 bg-warm-card rounded-xl">
                          <label className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-mutedText mb-2 flex items-center justify-between font-sans font-medium">
                            <span className="flex items-center gap-1.5">
                              <Compass className="w-3.5 h-3.5 text-copper" />
                              Road Frontage &amp; Orientation
                            </span>
                            <span className="text-copper font-medium text-[11px]">
                              {currentDirectionObj.desc}
                            </span>
                          </label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {ROAD_DIRECTIONS.map((dir) => (
                              <button
                                key={dir.id}
                                type="button"
                                onClick={() => setRoadDirection(dir.id)}
                                className={`py-1.5 px-2 rounded-lg text-xs font-sans font-medium transition-all text-center flex items-center justify-center gap-1 ${
                                  roadDirection === dir.id
                                    ? "bg-copper text-white shadow-sm"
                                    : "bg-white text-charcoal border border-warm-border hover:border-charcoal/40"
                                }`}
                              >
                                <span>{dir.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* TAB 2: PREFERENCES */}
                    {activeTab === "preferences" && (
                      <motion.div
                        key="preferences-tab"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        {/* Bedrooms */}
                        <div className="border border-warm-border p-3 bg-warm-card rounded-xl">
                          <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-2 font-sans font-medium">
                            Bedrooms &amp; Levels
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {["2-3 Beds (Single Level)", "3-4 Beds (G+1 Villa)", "4-5 Beds (Luxury G+2)", "Multi-generational"].map((bhk) => (
                              <button
                                key={bhk}
                                type="button"
                                onClick={() => setBedrooms(bhk)}
                                className={`p-2.5 rounded-lg text-xs font-sans text-left transition-all ${
                                  bedrooms === bhk
                                    ? "bg-charcoal text-white"
                                    : "bg-white text-charcoal border border-warm-border hover:border-charcoal/40"
                                }`}
                              >
                                {bhk}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Architectural Style */}
                        <div className="border border-warm-border p-3 bg-warm-card rounded-xl">
                          <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-2 font-sans font-medium">
                            Architectural Style
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {["Contemporary Tropical", "Kerala Courtyard / Traditional", "Minimalist Modern", "Mediterranean Coastal"].map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => setStylePreference(st)}
                                className={`p-2.5 rounded-lg text-xs font-sans text-left transition-all ${
                                  stylePreference === st
                                    ? "bg-copper text-white"
                                    : "bg-white text-charcoal border border-warm-border hover:border-charcoal/40"
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Primary Feature */}
                        <div className="border border-warm-border p-3 bg-warm-card rounded-xl">
                          <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-2 font-sans font-medium">
                            Signature Lifestyle Feature
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              "Central Open Courtyard (Nadumuttam)",
                              "Plunge Pool & Deck",
                              "Double-Height Living Space",
                              "Covered Charupadi Verandah",
                            ].map((feat) => (
                              <button
                                key={feat}
                                type="button"
                                onClick={() => setPrimaryFeature(feat)}
                                className={`p-2.5 rounded-lg text-xs font-sans text-left transition-all ${
                                  primaryFeature === feat
                                    ? "bg-charcoal text-white"
                                    : "bg-white text-charcoal border border-warm-border hover:border-charcoal/40"
                                }`}
                              >
                                {feat}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* TAB 3: BUDGET */}
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
                          <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-2 font-sans font-medium">
                            Target Construction Budget
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {[
                              { label: "₹40L – ₹70L", desc: "Economical / Compact Planning", val: "₹40L - ₹70L" },
                              { label: "₹70L – ₹1.2 Cr", desc: "Premium Residential Villa", val: "₹70L - ₹1.2 Cr Construction" },
                              { label: "₹1.2 Cr – ₹2 Cr", desc: "Luxury Architectural Estate", val: "₹1.2 Cr - ₹2 Cr" },
                              { label: "Above ₹2 Cr", desc: "Ultra-Luxury Signature Compound", val: "Above ₹2 Cr" },
                            ].map((b) => (
                              <button
                                key={b.val}
                                type="button"
                                onClick={() => setBudgetRange(b.val)}
                                className={`p-3 rounded-xl text-left transition-all ${
                                  budgetRange === b.val
                                    ? "bg-charcoal text-white shadow-sm"
                                    : "bg-white text-charcoal border border-warm-border hover:border-charcoal/40"
                                }`}
                              >
                                <div className="text-xs font-semibold font-sans">{b.label}</div>
                                <div className={`text-[10px] mt-0.5 ${budgetRange === b.val ? "text-white/70" : "text-mutedText"}`}>
                                  {b.desc}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="border border-warm-border p-3 bg-warm-card rounded-xl">
                          <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1.5 font-sans font-medium">
                            Estimated Cost Analytics
                          </label>
                          <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                            <div className="p-2.5 bg-white rounded-lg border border-warm-border">
                              <span className="text-[10px] text-mutedText block">Typical Rate / Sq.Ft</span>
                              <span className="font-semibold text-charcoal">₹2,400 – ₹3,200</span>
                            </div>
                            <div className="p-2.5 bg-white rounded-lg border border-warm-border">
                              <span className="text-[10px] text-mutedText block">Drawing Set Cost</span>
                              <span className="font-semibold text-copper">₹50,000 – ₹85,000</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full mt-2 py-3.5 px-6 bg-charcoal hover:bg-copper text-white text-[13px] font-medium tracking-wide flex items-center justify-center gap-2 transition-all duration-300 rounded-xl shadow-sm group"
                  >
                    <span>Find Matching Designs</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </div>

              {/* Right Side: Advanced Interactive CAD Plot Simulator Diagram */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-4 sm:p-5 bg-warm-card border border-warm-border/70 rounded-2xl relative overflow-hidden">
                {/* Simulator Header */}
                <div className="w-full flex items-center justify-between text-[10px] font-mono text-mutedText pb-2 mb-2 border-b border-warm-border/60">
                  <span className="flex items-center gap-1.5 text-charcoal font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>CAD SIMULATOR</span>
                  </span>
                  <span>{currentDirectionObj.id.toUpperCase()}</span>
                </div>

                {/* Dynamic SVG Drawing Canvas */}
                <div className="relative w-full aspect-square max-w-[250px] flex items-center justify-center">
                  <svg
                    viewBox="0 0 260 260"
                    className="w-full h-full"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Grid Pattern */}
                    <defs>
                      <pattern id="cadGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                        <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#E5E2DC" strokeWidth="0.7" />
                      </pattern>
                      <pattern id="buildableHatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="0" y2="6" stroke="#AD8065" strokeWidth="1" strokeOpacity="0.3" />
                      </pattern>
                    </defs>

                    <rect width="260" height="260" fill="url(#cadGrid)" rx="12" />

                    {/* Access Road Indicator Line */}
                    <g className="transition-all duration-500">
                      {roadDirection === "North Facing" && (
                        <g>
                          <line x1="20" y1="20" x2="240" y2="20" stroke="#171717" strokeWidth="5" strokeOpacity="0.7" />
                          <text x="130" y="14" fill="#777777" fontSize="7.5" textAnchor="middle" fontFamily="monospace">
                            ACCESS ROAD (12M PWD)
                          </text>
                        </g>
                      )}
                      {roadDirection === "East Facing" && (
                        <g>
                          <line x1="242" y1="20" x2="242" y2="240" stroke="#171717" strokeWidth="5" strokeOpacity="0.7" />
                          <text x="248" y="130" fill="#777777" fontSize="7" transform="rotate(90 248 130)" textAnchor="middle" fontFamily="monospace">
                            ACCESS ROAD (12M)
                          </text>
                        </g>
                      )}
                      {roadDirection === "South Facing" && (
                        <g>
                          <line x1="20" y1="245" x2="240" y2="245" stroke="#171717" strokeWidth="5" strokeOpacity="0.7" />
                          <text x="130" y="254" fill="#777777" fontSize="7.5" textAnchor="middle" fontFamily="monospace">
                            ACCESS ROAD (12M PWD)
                          </text>
                        </g>
                      )}
                      {roadDirection === "West Facing" && (
                        <g>
                          <line x1="16" y1="20" x2="16" y2="240" stroke="#171717" strokeWidth="5" strokeOpacity="0.7" />
                          <text x="10" y="130" fill="#777777" fontSize="7" transform="rotate(-90 10 130)" textAnchor="middle" fontFamily="monospace">
                            ACCESS ROAD (12M)
                          </text>
                        </g>
                      )}
                    </g>

                    {/* Main Morphing Plot Boundary Polygon */}
                    <g transform="translate(10, 10)">
                      {plotShape === "Rectangular" && (
                        <g>
                          <polygon
                            points="45,45 195,45 195,205 45,205"
                            fill="#FFFFFF"
                            stroke="#171717"
                            strokeWidth="1.8"
                          />
                          {/* Inner Buildable Zone */}
                          <polygon
                            points="65,70 175,70 175,185 65,185"
                            fill="url(#buildableHatch)"
                            stroke="#AD8065"
                            strokeWidth="1.4"
                            strokeDasharray="4 3"
                          />
                        </g>
                      )}

                      {plotShape === "Square" && (
                        <g>
                          <polygon
                            points="45,45 195,45 195,195 45,195"
                            fill="#FFFFFF"
                            stroke="#171717"
                            strokeWidth="1.8"
                          />
                          <polygon
                            points="65,65 175,65 175,175 65,175"
                            fill="url(#buildableHatch)"
                            stroke="#AD8065"
                            strokeWidth="1.4"
                            strokeDasharray="4 3"
                          />
                        </g>
                      )}

                      {plotShape === "Corner Plot" && (
                        <g>
                          {/* Splayed corner */}
                          <polygon
                            points="45,45 170,45 200,75 200,205 45,205"
                            fill="#FFFFFF"
                            stroke="#171717"
                            strokeWidth="1.8"
                          />
                          <polygon
                            points="65,70 155,70 178,92 178,185 65,185"
                            fill="url(#buildableHatch)"
                            stroke="#AD8065"
                            strokeWidth="1.4"
                            strokeDasharray="4 3"
                          />
                          {/* Dual Road Badge */}
                          <line x1="200" y1="20" x2="200" y2="215" stroke="#171717" strokeWidth="4" strokeOpacity="0.4" />
                        </g>
                      )}

                      {plotShape === "Narrow Frontage" && (
                        <g>
                          <polygon
                            points="75,30 165,30 165,220 75,220"
                            fill="#FFFFFF"
                            stroke="#171717"
                            strokeWidth="1.8"
                          />
                          <polygon
                            points="90,55 150,55 150,195 90,195"
                            fill="url(#buildableHatch)"
                            stroke="#AD8065"
                            strokeWidth="1.4"
                            strokeDasharray="4 3"
                          />
                        </g>
                      )}

                      {plotShape === "Sloped / Contour" && (
                        <g>
                          <polygon
                            points="45,45 195,45 195,205 45,205"
                            fill="#FFFFFF"
                            stroke="#171717"
                            strokeWidth="1.8"
                          />
                          {/* Contour Lines */}
                          <path d="M 45,80 Q 120,60 195,85" stroke="#AD8065" strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
                          <path d="M 45,125 Q 120,105 195,130" stroke="#AD8065" strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
                          <path d="M 45,170 Q 120,150 195,175" stroke="#AD8065" strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
                          
                          <polygon
                            points="65,75 175,75 175,180 65,180"
                            fill="url(#buildableHatch)"
                            stroke="#AD8065"
                            strokeWidth="1.4"
                            strokeDasharray="4 3"
                          />
                          <text x="50" y="78" fontSize="6.5" fill="#AD8065" fontFamily="monospace">+1.5m</text>
                          <text x="50" y="123" fontSize="6.5" fill="#AD8065" fontFamily="monospace">+3.0m</text>
                        </g>
                      )}

                      {/* Dimension Labels */}
                      <text x="120" y="38" fontSize="8" fill="#777777" textAnchor="middle" fontFamily="monospace">
                        {currentSizeObj.dimensions.w}
                      </text>
                      <text x="32" y="130" fontSize="8" fill="#777777" textAnchor="middle" transform="rotate(-90 32 130)" fontFamily="monospace">
                        {currentSizeObj.dimensions.l}
                      </text>

                      {/* Center Buildable Label */}
                      <text x="120" y="120" fontSize="9" fill="#171717" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                        BUILDABLE ZONE
                      </text>
                      <text x="120" y="133" fontSize="7.5" fill="#AD8065" textAnchor="middle" fontFamily="monospace">
                        KMBR 2019 COMPLIANT
                      </text>

                      {/* Animated Rotating Compass Dial in Top Right */}
                      <g
                        transform="translate(210, 30)"
                        className="transition-transform duration-700 ease-out"
                        style={{
                          transform: `translate(210px, 30px) rotate(${currentDirectionObj.deg}deg)`,
                          transformOrigin: "center",
                        }}
                      >
                        <circle cx="0" cy="0" r="11" stroke="#D1CDC7" strokeWidth="1" fill="#FFFFFF" />
                        <line x1="0" y1="7" x2="0" y2="-7" stroke="#171717" strokeWidth="1.2" />
                        <polygon points="0,-8 3.5,-2 -3.5,-2" fill="#AD8065" />
                        <polygon points="0,8 3,2 -3,2" fill="#171717" />
                        <text x="-3" y="-12" fontSize="7.5" fill="#171717" fontWeight="bold" fontFamily="monospace">
                          N
                        </text>
                      </g>
                    </g>
                  </svg>
                </div>

                {/* Live Telemetry Info Footer */}
                <div className="w-full mt-3 pt-3 border-t border-warm-border/60 text-center space-y-1">
                  <div className="text-xs font-semibold text-charcoal font-sans flex items-center justify-center gap-1.5">
                    <span>{currentSizeObj.label}</span>
                    <span className="text-mutedText font-normal">({currentSizeObj.sqft})</span>
                  </div>
                  <div className="text-[10px] text-mutedText font-mono uppercase tracking-wide">
                    {roadDirection} • {plotShape}
                  </div>
                  <div className="text-[10px] text-copper font-medium font-sans">
                    Estimated Max BUA: {currentSizeObj.builtUp}
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
