"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Maximize, Bed, Layers, Compass, Plus, CheckCircle2, Sparkles, Home, Ruler } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface HouseCategory {
  id: string;
  name: string;
  categoryBadge: string;
  tagline: string;
  summary: string;
  idealPlot: string;
  bhkRange: string;
  plansCount: number;
  climateFeature: string;
  tags: string[];
  styleParam: string;
  image: string;
  keyHighlights: string[];
  materials: string;
}

const HOUSE_CATEGORIES: HouseCategory[] = [
  {
    id: "courtyard",
    name: "Courtyard & Nadumuttam Homes",
    categoryBadge: "INWARD MICROCLIMATE",
    tagline: "Natural thermal chimney cooling & inward serene water sanctuaries.",
    summary: "Engineered around an open-to-sky central courtyard (Nadumuttam) that drops ambient indoor temperature by 3°–4°C. Perfect for dense urban plots requiring 100% natural daylight and complete privacy from neighbors.",
    idealPlot: "6 to 15 Cents",
    bhkRange: "3 to 5 BHK",
    plansCount: 78,
    climateFeature: "Central convective stack ventilation exhausts trapped humid air",
    tags: ["Nadumuttam Court", "Rainwater Basin", "Cross Ventilation", "Zero Street Glare"],
    styleParam: "COURTYARD",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    keyHighlights: [
      "Open-to-sky water court creating cool microclimate",
      "Perimeter verandahs shading private bedroom wings",
      "100% natural daylight in every room even on zero-setback sites",
    ],
    materials: "Exposed wire-cut bricks, sandstone, brass spouts, lime plaster",
  },
  {
    id: "modern-tropical",
    name: "Modern Tropical Residences",
    categoryBadge: "BIOPHILIC LIVING",
    tagline: "Deep cantilevered monsoon eaves & breathable operable louvers.",
    summary: "Dissolves the separation between indoor living and lush tropical vegetation. Built with deep 1.8m overhangs to protect glass facades from torrential Kerala monsoons, double-height living pavilions, and integrated garden terraces.",
    idealPlot: "10 to 20 Cents",
    bhkRange: "4 to 6 BHK",
    plansCount: 97,
    climateFeature: "Deep cantilevered eaves shield exterior walls from monsoon rain",
    tags: ["Cantilevered Decks", "Timber Louvers", "Biophilic Terraces", "Double-Height Volumes"],
    styleParam: "MODERN TROPICAL",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    keyHighlights: [
      "Operable timber jaalis admitting breezes while filtering tropical glare",
      "Integrated rainwater harvesting swales and lush buffer gardens",
      "Elevated ground plinth resisting ground moisture during monsoons",
    ],
    materials: "Natural bamboo composite, exposed brick, polished concrete, local granite",
  },
  {
    id: "traditional",
    name: "Kerala Heritage Nalukettu",
    categoryBadge: "TIMELESS VERNACULAR",
    tagline: "Pitched clay tile roofs, handcrafted timber colonnades & laterite stone.",
    summary: "Centuries of South Indian vernacular wisdom re-engineered for modern residential luxury. Features pitched Mangalore tile roofs shedding 3,000mm annual monsoon rains, surrounding Charupadi verandahs, and Vastu Vidya orientation.",
    idealPlot: "12 to 25 Cents",
    bhkRange: "3 to 5 BHK",
    plansCount: 115,
    climateFeature: "Sloping terracotta tiles disperse heavy monsoon rainfall naturally",
    tags: ["Mangalore Clay Tiles", "Charupadi Verandah", "Laterite Masonry", "Vastu Padavinyasa"],
    styleParam: "TRADITIONAL",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    keyHighlights: [
      "Traditional Charupadi perimeter seating offering shaded garden vistas",
      "High thermal mass laterite stone dampening daytime heat gain",
      "Handcrafted teakwood rafters with artisanal brass joinery",
    ],
    materials: "Mangalore clay tiles, laterite stone, teakwood colonnades, brass hardware",
  },
];

interface ArchitecturalJournalProps {
  articles?: any[];
}

export default function ArchitecturalJournal({ articles }: ArchitecturalJournalProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(HOUSE_CATEGORIES[0].id);
  const [selectedCategory, setSelectedCategory] = useState<HouseCategory | null>(null);

  return (
    <section id="inspiration" className="py-12 sm:py-20 md:py-24 bg-warm-grey border-y border-warm-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-copper/10 border border-copper/20 text-copper text-[10px] sm:text-[11px] font-mono tracking-wider uppercase mb-2 sm:mb-3">
              <Home className="w-3.5 h-3.5" />
              <span>Residential Typologies &amp; House Categories</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-normal font-serif tracking-[-0.01em] text-charcoal mb-2 sm:mb-3">
              Find the House Category Built for Your Land.
            </h2>
            <p className="text-xs sm:text-[15px] leading-relaxed text-secondaryText max-w-2xl font-light font-sans">
              Discover verified residential blueprints categorized by architectural style, regional climate adaptability, and South Indian land parcels.
            </p>
          </div>

          <Link
            href="/styles"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-[13px] font-medium text-charcoal hover:text-copper transition-colors group shrink-0"
          >
            <span>Explore All Styles &amp; Plans</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Retractable Expanding Panels (In a Line Side by Side, Compact on Mobile) */}
        <div className="flex flex-row gap-2 sm:gap-4 md:gap-5 items-stretch w-full h-[320px] sm:h-[390px] md:h-[450px]">
          {HOUSE_CATEGORIES.map((category) => {
            const isExpanded = activeCategoryId === category.id;

            return (
              <div
                key={category.id}
                onMouseEnter={() => setActiveCategoryId(category.id)}
                onClick={() => setActiveCategoryId(category.id)}
                className={`relative rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
                  isExpanded
                    ? "flex-[5] sm:flex-[3.2] bg-white border border-copper/50 shadow-card"
                    : "flex-1 sm:flex-1 bg-charcoal border border-warm-border/60 hover:border-charcoal/50 shadow-subtle cursor-pointer min-w-[36px] sm:min-w-[50px] md:min-w-0"
                }`}
              >
                {/* EXPANDED VIEW: Image & Content Side-by-Side in a Line */}
                {isExpanded ? (
                  <motion.div
                    key={`expanded-${category.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-row h-full w-full p-2.5 sm:p-4 md:p-6 gap-2.5 sm:gap-4 md:gap-6 items-stretch"
                  >
                    {/* Left Column: Image with Typology Badge */}
                    <div className="w-[38%] sm:w-[40%] md:w-[42%] relative h-full rounded-lg sm:rounded-xl overflow-hidden bg-charcoal shrink-0">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 40vw, 35vw"
                      />
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black/75 backdrop-blur-sm text-white text-[8px] sm:text-[10px] tracking-widestExtra uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 font-semibold rounded-full font-sans truncate max-w-[90%]">
                        {category.categoryBadge}
                      </div>

                      {/* Plans count pill */}
                      <div className="absolute bottom-2 left-2 bg-black/65 backdrop-blur-sm text-white/95 text-[9px] font-mono px-2 py-0.5 rounded-full hidden sm:flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-copper" />
                        <span>{category.plansCount} Plans Vetted</span>
                      </div>
                    </div>

                    {/* Right Column: Typology Specifications Side by Side */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 sm:py-1 md:py-2">
                      <div className="min-w-0">
                        {/* Specs Pill Header */}
                        <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[11px] text-mutedText font-mono uppercase tracking-wider mb-1 sm:mb-2">
                          <span className="text-copper font-medium flex items-center gap-1">
                            <Maximize className="w-3 h-3 text-copper" />
                            {category.idealPlot}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Bed className="w-3 h-3 text-copper" />
                            {category.bhkRange}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm sm:text-lg md:text-2xl font-normal font-serif leading-snug text-charcoal mb-1 sm:mb-1.5 line-clamp-1 sm:line-clamp-2">
                          {category.name}
                        </h3>

                        {/* Tagline */}
                        <p className="text-[10px] sm:text-xs text-copper font-sans font-medium line-clamp-1 mb-1.5 sm:mb-2">
                          {category.tagline}
                        </p>

                        {/* Summary */}
                        <p className="text-[11px] sm:text-xs md:text-[13px] leading-relaxed text-secondaryText font-light font-sans line-clamp-2 sm:line-clamp-3 md:line-clamp-3 mb-2 sm:mb-3">
                          {category.summary}
                        </p>

                        {/* Topic Tags */}
                        <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                          {category.tags.slice(0, 2).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded-full bg-warm-grey text-charcoal/80 text-[9px] sm:text-[10px] font-sans font-medium border border-warm-border"
                            >
                              #{tag}
                            </span>
                          ))}
                          <span className="hidden md:inline px-2 py-0.5 rounded-full bg-warm-grey text-charcoal/80 text-[10px] font-sans font-medium border border-warm-border">
                            #{category.tags[2]}
                          </span>
                        </div>
                      </div>

                      {/* Bottom CTA Bar */}
                      <div className="pt-2 border-t border-warm-border/80 flex items-center justify-between gap-2">
                        <Link
                          href={`/designs?style=${encodeURIComponent(category.styleParam)}`}
                          className="inline-flex items-center gap-1.5 py-1.5 px-3 sm:py-2 sm:px-4 bg-copper hover:bg-copper-hover text-white text-[10px] sm:text-xs font-medium font-sans tracking-wide rounded-full transition-all shadow-subtle group/btn shrink-0"
                        >
                          <span>Explore {category.plansCount}+ Plans</span>
                          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover/btn:translate-x-1" />
                        </Link>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(category);
                          }}
                          className="text-[10px] sm:text-xs text-mutedText hover:text-charcoal font-sans transition-colors hidden sm:inline"
                        >
                          View Specs &rarr;
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* RETRACTED / COLLAPSED VIEW: Slim & Compact tab in the Line */
                  <div className="relative w-full h-full cursor-pointer group flex flex-col items-center justify-between p-2 sm:p-3">
                    {/* Background photo */}
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover filter brightness-[0.65] group-hover:brightness-[0.8] group-hover:scale-105 transition-all duration-700"
                      sizes="(max-width: 640px) 15vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 pointer-events-none" />

                    {/* Top: Plus Icon */}
                    <div className="relative z-10 w-full flex justify-center sm:justify-between items-center">
                      <span className="hidden sm:inline bg-white/20 backdrop-blur-md text-white text-[9px] tracking-widestExtra uppercase px-2 py-0.5 rounded-full font-semibold truncate max-w-[80px]">
                        {category.categoryBadge}
                      </span>
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/25 backdrop-blur-md text-white flex items-center justify-center text-[10px] sm:text-xs font-bold transition-transform group-hover:scale-110">
                        <Plus className="w-3 h-3" />
                      </span>
                    </div>

                    {/* Middle on mobile: Vertical Category name */}
                    <div className="relative z-10 sm:hidden my-auto">
                      <span className="[writing-mode:vertical-rl] rotate-180 text-[9px] font-mono tracking-widest uppercase text-white/80 font-medium truncate max-h-[140px]">
                        {category.categoryBadge}
                      </span>
                    </div>

                    {/* Bottom: Title & Hint (desktop/tablet) */}
                    <div className="relative z-10 w-full hidden sm:block">
                      <div className="text-[10px] text-copper font-mono mb-1 truncate">
                        {category.plansCount} Plans
                      </div>
                      <h4 className="text-xs sm:text-sm font-serif text-white font-normal line-clamp-2 leading-snug group-hover:text-copper-light transition-colors">
                        {category.name}
                      </h4>
                      <div className="mt-1.5 text-[9px] font-sans text-copper-light uppercase tracking-wider font-semibold flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <span>Explore</span>
                        <ArrowRight className="w-2.5 h-2.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Typology Specifications Detail Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white max-w-2xl w-full p-5 sm:p-8 max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-card">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <span className="text-xs font-semibold text-copper uppercase tracking-widest font-mono">
                {selectedCategory.categoryBadge} • {selectedCategory.plansCount} Vetted Plans
              </span>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-mutedText hover:text-charcoal text-sm p-1 rounded-full hover:bg-warm-grey transition-colors"
              >
                ✕ Close
              </button>
            </div>
            
            <h2 className="text-xl sm:text-3xl font-normal text-charcoal mb-1 sm:mb-2 font-serif">
              {selectedCategory.name}
            </h2>
            <p className="text-xs sm:text-sm text-copper font-sans font-medium mb-4">
              {selectedCategory.tagline}
            </p>

            <div className="relative aspect-[16/9] w-full mb-4 sm:mb-6 rounded-xl sm:rounded-2xl overflow-hidden bg-charcoal">
              <Image
                src={selectedCategory.image}
                alt={selectedCategory.name}
                fill
                className="object-cover"
              />
            </div>

            <p className="text-xs sm:text-[14px] leading-relaxed text-secondaryText mb-5 font-sans font-light">
              {selectedCategory.summary}
            </p>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 font-sans text-xs">
              <div className="border border-warm-border p-3 rounded-xl bg-warm-grey">
                <span className="text-[10px] text-mutedText uppercase font-mono block">Recommended Plot</span>
                <span className="font-medium text-charcoal">{selectedCategory.idealPlot}</span>
              </div>
              <div className="border border-warm-border p-3 rounded-xl bg-warm-grey">
                <span className="text-[10px] text-mutedText uppercase font-mono block">Typical Bedrooms</span>
                <span className="font-medium text-charcoal">{selectedCategory.bhkRange}</span>
              </div>
              <div className="border border-warm-border p-3 rounded-xl bg-warm-grey col-span-2 sm:col-span-1">
                <span className="text-[10px] text-mutedText uppercase font-mono block">Materiality</span>
                <span className="font-medium text-charcoal truncate block">{selectedCategory.materials}</span>
              </div>
            </div>

            {/* Climate & Vernacular Highlights */}
            <div className="mb-6 space-y-2">
              <div className="text-xs font-semibold text-charcoal uppercase tracking-wider font-sans">
                Climate Adaptations:
              </div>
              <ul className="space-y-1.5 text-xs text-secondaryText font-sans">
                {selectedCategory.keyHighlights.map((hl, hIdx) => (
                  <li key={hIdx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-copper mt-0.5 shrink-0" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal Footer CTA */}
            <div className="pt-4 border-t border-warm-border flex items-center justify-between">
              <span className="text-xs text-mutedText font-sans">
                Ready to review construction drawing sets?
              </span>
              <Link
                href={`/designs?style=${encodeURIComponent(selectedCategory.styleParam)}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-copper hover:bg-copper-hover text-white text-xs font-medium font-sans rounded-full shadow-sm"
              >
                <span>Browse {selectedCategory.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
