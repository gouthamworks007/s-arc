"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Layers, Compass, Plus, CheckCircle2, Sparkles, Home, Ruler, ChevronLeft, ChevronRight, Maximize, Bed } from "lucide-react";
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
  {
    id: "contemporary",
    name: "Contemporary Cantilever Villas",
    categoryBadge: "VOLUMETRIC MODERNISM",
    tagline: "Cast-in-place board-formed concrete & double-height panoramic living.",
    summary: "Architectural massing engineered for open suburban and corner plots with dramatic floating cantilevers, solar-shielded glass curtain walls, and seamless indoor-outdoor living pavilions that frame private garden lawns.",
    idealPlot: "10 to 22 Cents",
    bhkRange: "4 to 6 BHK",
    plansCount: 84,
    climateFeature: "Calibrated horizontal solar louvers block direct afternoon infrared radiation",
    tags: ["Floating Cantilevers", "Board-Formed Concrete", "Double-Height Lounge", "Corner Plot Edge"],
    styleParam: "CONTEMPORARY",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    keyHighlights: [
      "Dramatic 3.5m cantilevered terrace shading ground-level living pavilions",
      "Solar-calibrated exterior fins preventing internal heat buildup",
      "Double-height central living volume inducing passive thermal updraft",
    ],
    materials: "Board-formed concrete, low-E solar glass, black architectural steel, Kota stone",
  },
  {
    id: "urban-infill",
    name: "High-Efficiency Urban Infill",
    categoryBadge: "COMPACT URBAN SITES",
    tagline: "Engineered for 3 to 7 Cent narrow-frontage city parcels with zero dead space.",
    summary: "Mastercrafted spatial efficiency tailored for compact city plots and tight municipal setbacks. Incorporates vertical light shafts, split-level living plates, and internal pocket courts to maximize daylight without exposing interiors to street noise.",
    idealPlot: "3 to 7 Cents",
    bhkRange: "3 to 4 BHK",
    plansCount: 62,
    climateFeature: "Vertical skylight shafts channel natural daylight deep into narrow floor plates",
    tags: ["Narrow Frontage", "Vertical Lightwell", "Pocket Garden", "Split-Level Flow"],
    styleParam: "MINIMALIST",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    keyHighlights: [
      "Calibrated 5m–8m frontage blueprints complying with Kerala municipal KMBR setbacks",
      "Skylit triple-height lightwell illuminating central stair core without boundary windows",
      "Concealed dual car porch integrated cleanly beneath upper residential levels",
    ],
    materials: "Smooth micro-cement, white lime wash, structural steel frame, perforated metal screens",
  },
  {
    id: "coastal",
    name: "Coastal & Waterfront Residences",
    categoryBadge: "COASTAL RESILIENCE",
    tagline: "Salt-resistant hydraulic lime, arched loggias & wind-funneling terraces.",
    summary: "Custom-engineered for South India's coastal belt and waterfront terrains. Features thick lime-washed thermal mass, arched breezeway loggias that capture marine currents, and elevated plinths resilient against coastal dampness.",
    idealPlot: "12 to 30 Cents",
    bhkRange: "4 to 6 BHK",
    plansCount: 53,
    climateFeature: "Hydraulic lime stucco deflects maritime salt humidity and intense solar radiation",
    tags: ["Salt-Air Resilience", "Arched Loggias", "Wind Breezeway", "Rooftop Belvederes"],
    styleParam: "MEDITERRANEAN",
    image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80",
    keyHighlights: [
      "Weathered lime stucco and marine-grade stainless hardware impervious to coastal salt air",
      "Deep shaded loggias funneling cooling offshore breezes through living quarters",
      "Reinforced high-plinth foundations engineered for high-water-table coastal soils",
    ],
    materials: "Hydraulic lime plaster, terracotta pavers, marine-grade 316 fittings, solid teakwood",
  },
];

interface ArchitecturalJournalProps {
  articles?: any[];
}

export default function ArchitecturalJournal({ articles }: ArchitecturalJournalProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(HOUSE_CATEGORIES[0].id);
  const [selectedCategory, setSelectedCategory] = useState<HouseCategory | null>(null);

  // Mobile Carousel State & Navigation
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const [canScrollMobileLeft, setCanScrollMobileLeft] = useState(false);
  const [canScrollMobileRight, setCanScrollMobileRight] = useState(true);

  const handleMobileScroll = useCallback(() => {
    if (!mobileScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = mobileScrollRef.current;
    setCanScrollMobileLeft(scrollLeft > 10);
    setCanScrollMobileRight(scrollLeft < scrollWidth - clientWidth - 10);

    const firstCard = mobileScrollRef.current.firstElementChild as HTMLElement;
    if (firstCard) {
      const cardWidth = firstCard.offsetWidth;
      const gap = 16;
      const index = Math.round(scrollLeft / (cardWidth + gap));
      setMobileActiveIndex(Math.min(Math.max(index, 0), HOUSE_CATEGORIES.length - 1));
    }
  }, []);

  useEffect(() => {
    const el = mobileScrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleMobileScroll, { passive: true });
    handleMobileScroll();
    return () => el.removeEventListener("scroll", handleMobileScroll);
  }, [handleMobileScroll]);

  const scrollMobilePrev = () => {
    if (!mobileScrollRef.current) return;
    const firstCard = mobileScrollRef.current.firstElementChild as HTMLElement;
    const scrollAmount = firstCard ? firstCard.offsetWidth + 16 : 300;
    mobileScrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };

  const scrollMobileNext = () => {
    if (!mobileScrollRef.current) return;
    const firstCard = mobileScrollRef.current.firstElementChild as HTMLElement;
    const scrollAmount = firstCard ? firstCard.offsetWidth + 16 : 300;
    mobileScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const scrollToMobileIndex = (idx: number) => {
    if (!mobileScrollRef.current) return;
    const firstCard = mobileScrollRef.current.firstElementChild as HTMLElement;
    const cardWidth = firstCard ? firstCard.offsetWidth : 300;
    const gap = 16;
    mobileScrollRef.current.scrollTo({ left: idx * (cardWidth + gap), behavior: "smooth" });
  };

  // Keyboard accessibility and body lock for specifications modal
  useEffect(() => {
    if (!selectedCategory) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedCategory(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedCategory]);

  return (
    <section id="inspiration" className="py-10 sm:py-14 lg:py-16 bg-warm-grey border-y border-warm-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 sm:mb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-copper/10 border border-copper/20 text-copper text-[10px] sm:text-[11px] font-mono tracking-wider uppercase mb-2 sm:mb-3">
              <Home className="w-3.5 h-3.5" />
              <span>House Typologies</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-normal font-serif tracking-[-0.01em] text-charcoal mb-2 sm:mb-3">
              Find the House Category Built for Your Land.
            </h2>
            <p className="text-xs sm:text-[15px] leading-relaxed text-secondaryText max-w-2xl font-light font-sans">
              Curated residential blueprints categorized by architectural style, regional climate, and plot size.
            </p>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
            <Link
              href="/styles"
              className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-[13px] font-medium text-charcoal hover:text-copper transition-colors group shrink-0"
            >
              <span>Explore All Styles &amp; Plans</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>

            {/* Mobile Carousel Navigation Arrows (< >) */}
            <div className="flex md:hidden items-center gap-1.5">
              <button
                type="button"
                onClick={scrollMobilePrev}
                disabled={!canScrollMobileLeft}
                aria-label="Previous category"
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                  canScrollMobileLeft
                    ? "border-warm-border bg-white text-charcoal shadow-xs active:scale-95"
                    : "border-warm-border/50 bg-warm-grey/50 text-charcoal/30 cursor-not-allowed"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={scrollMobileNext}
                disabled={!canScrollMobileRight}
                aria-label="Next category"
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                  canScrollMobileRight
                    ? "border-warm-border bg-white text-charcoal shadow-xs active:scale-95"
                    : "border-warm-border/50 bg-warm-grey/50 text-charcoal/30 cursor-not-allowed"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE VIEW (< md): Clean full-card swipeable carousel showing ALL 6 categories */}
        <div className="md:hidden">
          <div
            ref={mobileScrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar pb-3 pt-1 -mx-4 px-4"
          >
            {HOUSE_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="w-[84vw] max-w-[360px] shrink-0 snap-center bg-white border border-warm-border rounded-2xl shadow-card overflow-hidden flex flex-col justify-between"
              >
                {/* Card Top Image */}
                <div className="relative aspect-[16/10] w-full bg-charcoal">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 85vw, 360px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20 pointer-events-none" />

                  <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-sm text-white text-[9px] font-mono tracking-widest uppercase px-2.5 py-0.5 font-semibold rounded-full border border-white/10">
                    {cat.categoryBadge}
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-copper" />
                    <span>{cat.plansCount} Plans Vetted</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Specs Header */}
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-mutedText mb-1.5">
                      <span className="text-copper font-semibold flex items-center gap-1">
                        <Maximize className="w-3 h-3 text-copper" />
                        {cat.idealPlot}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Bed className="w-3 h-3 text-copper" />
                        {cat.bhkRange}
                      </span>
                    </div>

                    {/* Title & Tagline */}
                    <h3 className="text-lg font-serif text-charcoal font-normal line-clamp-1 mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-copper font-sans font-medium line-clamp-1 mb-2">
                      {cat.tagline}
                    </p>

                    {/* Summary */}
                    <p className="text-xs text-secondaryText font-light font-sans leading-relaxed line-clamp-2 mb-2.5">
                      {cat.summary}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {cat.tags.slice(0, 2).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-full bg-warm-grey text-charcoal/80 text-[9px] font-sans font-medium border border-warm-border"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-2.5 border-t border-warm-border/80 flex items-center justify-between gap-2 shrink-0">
                    <Link
                      href={`/designs?style=${encodeURIComponent(cat.styleParam)}`}
                      className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-copper hover:bg-copper-hover text-white text-[11px] font-medium font-sans tracking-wide rounded-full transition-all shadow-subtle shrink-0"
                    >
                      <span>Explore {cat.plansCount}+ Plans</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className="text-[11px] text-mutedText hover:text-charcoal font-sans transition-colors"
                    >
                      View Specs &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Pagination Footer */}
          <div className="mt-4 flex items-center justify-between px-1">
            {/* 6 Dots */}
            <div className="flex items-center gap-1.5">
              {HOUSE_CATEGORIES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToMobileIndex(idx)}
                  aria-label={`Go to category ${idx + 1}`}
                  className="p-1"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-300 ${
                      mobileActiveIndex === idx ? "w-6 bg-copper" : "w-1.5 bg-charcoal/20"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Slide counter */}
            <div className="text-[11px] font-mono text-mutedText flex items-center gap-1">
              <span className="font-semibold text-charcoal">0{mobileActiveIndex + 1}</span>
              <span>/</span>
              <span>0{HOUSE_CATEGORIES.length}</span>
            </div>
          </div>
        </div>

        {/* DESKTOP VIEW (>= md): Retractable Expanding Panels */}
        <div className="hidden md:flex flex-row gap-3.5 md:gap-4 items-stretch w-full md:h-[460px] overflow-x-visible pb-2 no-scrollbar">
          {HOUSE_CATEGORIES.map((category) => {
            const isExpanded = activeCategoryId === category.id;

            return (
              <div
                key={category.id}
                id={`cat-panel-${category.id}`}
                onMouseEnter={() => setActiveCategoryId(category.id)}
                onClick={() => {
                  setActiveCategoryId(category.id);
                  if (typeof window !== "undefined" && window.innerWidth < 768) {
                    const el = document.getElementById(`cat-panel-${category.id}`);
                    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                  }
                }}
                className={`relative rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none shrink-0 md:shrink ${
                  isExpanded
                    ? "w-[84vw] sm:w-[72vw] md:w-auto md:flex-[3.5] lg:flex-[3.8] bg-white border border-copper/50 shadow-card"
                    : "w-[44px] sm:w-[54px] md:w-auto md:flex-1 bg-charcoal border border-warm-border/60 hover:border-charcoal/50 shadow-subtle cursor-pointer min-w-[40px] sm:min-w-[50px] md:min-w-0"
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
                    <div className="w-[36%] sm:w-[40%] md:w-[42%] relative h-full rounded-lg sm:rounded-xl overflow-hidden bg-charcoal shrink-0">
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
                        {/* Title */}
                        <h3 className="text-sm sm:text-lg md:text-2xl font-normal font-serif leading-snug text-charcoal mb-1 sm:mb-1.5 line-clamp-1 sm:line-clamp-2">
                          {category.name}
                        </h3>

                        {/* Tagline */}
                        <p className="text-[10px] sm:text-xs text-copper font-sans font-medium line-clamp-1 mb-1.5 sm:mb-2">
                          {category.tagline}
                        </p>

                        {/* Summary */}
                        <p className="text-[11px] sm:text-xs md:text-[13px] leading-relaxed text-secondaryText font-light font-sans line-clamp-2 mb-2 sm:mb-3">
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
                      <div className="pt-2 border-t border-warm-border/80 flex items-center justify-between gap-2 shrink-0">
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
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCategory(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
        >
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
