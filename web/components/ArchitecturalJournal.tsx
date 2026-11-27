"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Plus, CheckCircle2, Home, ChevronLeft, ChevronRight, Maximize, Bed } from "lucide-react";
import { motion } from "framer-motion";
import { useProjects } from "@/lib/projectsContext";

export interface HouseCategory {
  id: string;
  name: string;
  categoryBadge: string;
  tagline: string;
  summary: string;
  idealPlot: string;
  bhkRange: string;
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
    tagline: "Stack-ventilation courtyards for warm, humid climates.",
    summary: "Organized around an open-to-sky central court (Nadumuttam) that draws warm air upward while keeping bedroom wings shaded and private on dense plots.",
    idealPlot: "6 to 15 Cents",
    bhkRange: "3 to 5 BHK",
    climateFeature: "Central convective courtyard supports cross-ventilation",
    tags: ["Nadumuttam Court", "Cross Ventilation", "Private Living"],
    styleParam: "COURTYARD",
    image: "/showcase-courtyard.webp",
    keyHighlights: [
      "Open-to-sky central court aiding passive air circulation",
      "Perimeter verandahs shading private bedroom wings",
      "Daylight access inside inward-facing rooms",
    ],
    materials: "Wire-cut bricks, timber joinery, natural stone, lime plaster",
  },
  {
    id: "modern-tropical",
    name: "Modern Tropical Residences",
    categoryBadge: "BIOPHILIC LIVING",
    tagline: "Deep monsoon roof overhangs and shaded terraces.",
    summary: "Balances modern open plans with extended roof eaves, operable timber louvers, and planted buffers suited to heavy South Indian monsoon rainfall.",
    idealPlot: "10 to 20 Cents",
    bhkRange: "4 to 6 BHK",
    climateFeature: "Deep overhangs help shield walls from driving monsoon rain",
    tags: ["Deep Overhangs", "Timber Louvers", "Garden Terraces"],
    styleParam: "MODERN TROPICAL",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
    keyHighlights: [
      "Operable timber screens filtering harsh tropical sun",
      "Planted buffer courts around ground-floor living zones",
      "Raised plinth detailing for high-rainfall seasons",
    ],
    materials: "Exposed brick, polished concrete, treated timber, local granite",
  },
  {
    id: "traditional",
    name: "Kerala Heritage Nalukettu",
    categoryBadge: "TRADITIONAL VERNACULAR",
    tagline: "Pitched clay-tile roofs, timber colonnades, and laterite walls.",
    summary: "Adapts traditional Nalukettu principles for modern family living with steep Mangalore-tiled roofs, shaded Charupadi sit-outs, and laterite thermal mass.",
    idealPlot: "12 to 25 Cents",
    bhkRange: "3 to 5 BHK",
    climateFeature: "Pitched clay-tile roofs shed heavy monsoon rain quickly",
    tags: ["Clay Tile Roof", "Charupadi", "Laterite Masonry"],
    styleParam: "TRADITIONAL",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80",
    keyHighlights: [
      "Shaded Charupadi perimeter seating overlooking gardens",
      "Thick laterite stone masonry moderating daytime heat",
      "Pitched timber roof trusses with ventilated ridge zones",
    ],
    materials: "Mangalore clay tiles, dressed laterite, teakwood, brass fittings",
  },
  {
    id: "contemporary",
    name: "Contemporary Cantilever Villas",
    categoryBadge: "CONTEMPORARY MASSING",
    tagline: "Cantilevered decks and double-height living spaces.",
    summary: "Suited to wider suburban and corner parcels with shaded exterior balconies, vertical brise-soleil screens, and double-height family lounges.",
    idealPlot: "10 to 22 Cents",
    bhkRange: "4 to 6 BHK",
    climateFeature: "Cantilevered slabs and solar fins reduce western heat gain",
    tags: ["Cantilever Decks", "Solar Fins", "Double-Height"],
    styleParam: "CONTEMPORARY",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
    keyHighlights: [
      "Projected terrace slabs shading lower living rooms",
      "Exterior fins angled against afternoon western sun",
      "Double-height hall connecting ground and upper levels",
    ],
    materials: "Exposed concrete, low-E glass, coated steel, natural stone",
  },
  {
    id: "minimalist",
    name: "Minimalist Compact Homes",
    categoryBadge: "MINIMALIST URBAN",
    tagline: "Clean, efficient plans for 3 to 7 Cent compact urban sites.",
    summary: "Streamlined layouts built for narrow city plots using vertical skylight wells, clean geometric forms, and integrated ground-level parking bays.",
    idealPlot: "3 to 7 Cents",
    bhkRange: "3 to 4 BHK",
    climateFeature: "Top-lit stairwell shaft brings daylight into tight city plots",
    tags: ["Compact Plot", "Sky-Lit Core", "Clean Geometry"],
    styleParam: "MINIMALIST",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80",
    keyHighlights: [
      "Narrow-frontage layouts suited to urban KMBR setbacks",
      "Central skylit stair bringing light without side windows",
      "Integrated covered porch for two-car city parking",
    ],
    materials: "Micro-cement, lime plaster, structural steel, perforated screens",
  },
  {
    id: "mediterranean",
    name: "Mediterranean & Coastal Homes",
    categoryBadge: "MEDITERRANEAN COASTAL",
    tagline: "Lime stucco finishes, shaded arches, and breeze loggias.",
    summary: "Designed with textured lime walls, deep arched corridors, and durable coastal hardware to handle humid sea breezes along South India's shoreline.",
    idealPlot: "12 to 30 Cents",
    bhkRange: "4 to 6 BHK",
    climateFeature: "Shaded loggias channel offshore breezes through rooms",
    tags: ["Arched Loggias", "Lime Stucco", "Coastal Durability"],
    styleParam: "MEDITERRANEAN",
    image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1000&q=80",
    keyHighlights: [
      "Breathable hydraulic lime renders suited to salt humidity",
      "Arched breezeway corridors oriented toward coastal winds",
      "Elevated plinth protection on high-water-table plots",
    ],
    materials: "Hydraulic lime stucco, terracotta tiles, marine-grade fittings",
  },
];

interface ArchitecturalJournalProps {
  articles?: any[];
}

export default function ArchitecturalJournal({ articles }: ArchitecturalJournalProps) {
  const { projects } = useProjects();
  const [activeCategoryId, setActiveCategoryId] = useState<string>(HOUSE_CATEGORIES[0].id);
  const [selectedCategory, setSelectedCategory] = useState<HouseCategory | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobileViewport(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const publishedProjects = projects.filter((p) => p.status !== "draft");
  const getLiveStyleCount = (styleParam: string) =>
    publishedProjects.filter(
      (p) =>
        (p.style || "").toLowerCase().includes(styleParam.toLowerCase()) ||
        styleParam.toLowerCase().includes((p.style || "").toLowerCase())
    ).length;

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
    if (!el || !isMobileViewport) return;
    el.addEventListener("scroll", handleMobileScroll, { passive: true });
    handleMobileScroll();
    return () => el.removeEventListener("scroll", handleMobileScroll);
  }, [handleMobileScroll, isMobileViewport]);

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
            {isMobileViewport && (
            <div className="flex items-center gap-1.5">
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
            )}
          </div>
        </div>

        {/* Single DOM branch per viewport so crawlers and screen readers never see duplicate categories */}
        {isMobileViewport ? (
        <div>
          <div
            ref={mobileScrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar pb-3 pt-1 -mx-4 px-4"
          >
            {HOUSE_CATEGORIES.map((cat) => {
              const liveMatches = getLiveStyleCount(cat.styleParam);
              return (
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
                    loading="lazy"
                    className="object-cover"
                    sizes="(max-width: 640px) 85vw, 360px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20 pointer-events-none" />

                  <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-sm text-white text-[9px] font-mono tracking-widest uppercase px-2.5 py-0.5 font-semibold rounded-full border border-white/10">
                    {cat.categoryBadge}
                  </div>

                  {liveMatches > 0 && (
                    <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-copper" />
                      <span>{liveMatches} {liveMatches === 1 ? "Plan" : "Plans"} Live</span>
                    </div>
                  )}
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
                      <span>{liveMatches > 0 ? `Browse ${liveMatches} ${liveMatches === 1 ? "Plan" : "Plans"}` : "Browse Style"}</span>
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
              );
            })}
          </div>

          {/* Mobile Pagination Footer */}
          <div className="mt-4 flex items-center justify-between px-1">
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

            <div className="text-[11px] font-mono text-mutedText flex items-center gap-1">
              <span className="font-semibold text-charcoal">0{mobileActiveIndex + 1}</span>
              <span>/</span>
              <span>0{HOUSE_CATEGORIES.length}</span>
            </div>
          </div>
        </div>
        ) : (
        <div className="flex flex-row gap-3.5 md:gap-4 items-stretch w-full md:h-[460px] overflow-x-visible pb-2 no-scrollbar">
          {HOUSE_CATEGORIES.map((category) => {
            const isExpanded = activeCategoryId === category.id;
            const liveMatches = getLiveStyleCount(category.styleParam);

            return (
              <div
                key={category.id}
                id={`cat-panel-${category.id}`}
                onMouseEnter={() => setActiveCategoryId(category.id)}
                onClick={() => setActiveCategoryId(category.id)}
                className={`relative rounded-2xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none shrink ${
                  isExpanded
                    ? "flex-[3.5] lg:flex-[3.8] bg-white border border-copper/50 shadow-card"
                    : "flex-1 bg-charcoal border border-warm-border/60 hover:border-charcoal/50 shadow-subtle cursor-pointer min-w-0"
                }`}
              >
                {isExpanded ? (
                  <motion.div
                    key={`expanded-${category.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-row h-full w-full p-5 md:p-6 gap-5 md:gap-6 items-stretch"
                  >
                    <div className="w-[42%] relative h-full rounded-xl overflow-hidden bg-charcoal shrink-0">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        loading="lazy"
                        className="object-cover"
                        sizes="35vw"
                      />
                      <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-sm text-white text-[10px] tracking-widestExtra uppercase px-2.5 py-1 font-semibold rounded-full font-sans truncate max-w-[90%]">
                        {category.categoryBadge}
                      </div>

                      {liveMatches > 0 && (
                        <div className="absolute bottom-2 left-2 bg-black/65 backdrop-blur-sm text-white/95 text-[9px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-copper" />
                          <span>{liveMatches} {liveMatches === 1 ? "Plan" : "Plans"} Live</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1 md:py-2">
                      <div className="min-w-0">
                        <h3 className="text-lg md:text-2xl font-normal font-serif leading-snug text-charcoal mb-1.5 line-clamp-2">
                          {category.name}
                        </h3>
                        <p className="text-xs text-copper font-sans font-medium line-clamp-1 mb-2">
                          {category.tagline}
                        </p>
                        <p className="text-xs md:text-[13px] leading-relaxed text-secondaryText font-light font-sans line-clamp-2 mb-3">
                          {category.summary}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {category.tags.slice(0, 3).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded-full bg-warm-grey text-charcoal/80 text-[10px] font-sans font-medium border border-warm-border"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-warm-border/80 flex items-center justify-between gap-2 shrink-0">
                        <Link
                          href={`/designs?style=${encodeURIComponent(category.styleParam)}`}
                          className="inline-flex items-center gap-1.5 py-2 px-4 bg-copper hover:bg-copper-hover text-white text-xs font-medium font-sans tracking-wide rounded-full transition-all shadow-subtle group/btn shrink-0"
                        >
                          <span>{liveMatches > 0 ? `Browse ${liveMatches} ${liveMatches === 1 ? "Plan" : "Plans"}` : "Browse Style"}</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                        </Link>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(category);
                          }}
                          className="text-xs text-mutedText hover:text-charcoal font-sans transition-colors"
                        >
                          View Specs &rarr;
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="relative w-full h-full cursor-pointer group flex flex-col items-center justify-between p-3">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      loading="lazy"
                      className="object-cover filter brightness-[0.65] group-hover:brightness-[0.8] group-hover:scale-105 transition-all duration-700"
                      sizes="20vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 pointer-events-none" />

                    <div className="relative z-10 w-full flex justify-between items-center">
                      <span className="bg-white/20 backdrop-blur-md text-white text-[9px] tracking-widestExtra uppercase px-2 py-0.5 rounded-full font-semibold truncate max-w-[80px]">
                        {category.categoryBadge}
                      </span>
                      <span className="w-6 h-6 rounded-full bg-white/25 backdrop-blur-md text-white flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-110">
                        <Plus className="w-3 h-3" />
                      </span>
                    </div>

                    <div className="relative z-10 w-full">
                      <div className="text-[10px] text-copper font-mono mb-1 truncate">
                        {category.idealPlot}
                      </div>
                      <h4 className="text-sm font-serif text-white font-normal line-clamp-2 leading-snug group-hover:text-copper-light transition-colors">
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
        )}

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
                {selectedCategory.categoryBadge} • {selectedCategory.idealPlot}
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
