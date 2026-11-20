"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Compass, 
  Layers, 
  Users, 
  Package, 
  Home, 
  Sparkles 
} from "lucide-react";

export interface NetworkPortal {
  id: string;
  badge: string;
  title: string;
  desc: string;
  href: string;
  linkText: string;
  image: string;
}

const PORTALS: NetworkPortal[] = [
  {
    id: "designs",
    badge: "500+ DESIGNS",
    title: "Featured Designs",
    desc: "Curated collection of residential architectural plans with dimensioned CAD drawings, structural schedules, and BOQ.",
    href: "/designs",
    linkText: "Explore 500+ Plans",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "plot-intelligence",
    badge: "SATELLITE SURVEY",
    title: "Plot My Land",
    desc: "Top-down satellite mapping, real-time Cent area calculation, and KMBR 2019 statutory setback projections.",
    href: "/plot-my-land",
    linkText: "Launch Satellite Map",
    image: "https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "styles",
    badge: "6 REGIONAL STYLES",
    title: "Architectural Styles",
    desc: "From Traditional Nalukettu courtyards to Modern Tropical, Minimalist Monoliths, and Coastal Residences.",
    href: "/styles",
    linkText: "Discover Styles",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "architects",
    badge: "VERIFIED STUDIOS",
    title: "Featured Architects",
    desc: "Connect with verified, COA-licensed architects and leading residential design practices across South India.",
    href: "/architects",
    linkText: "Meet the Creators",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "packages",
    badge: "FIXED-PRICE TIERS",
    title: "Drawing Packages",
    desc: "Transparent 3-tier deliverables: Municipal Permit Sets, Executive Builder Working Sets, and Comprehensive 3D BIM + BOQ.",
    href: "/designs",
    linkText: "View Deliverable Tiers",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "typologies",
    badge: "CLIMATE RESPONSIVE",
    title: "House Typologies",
    desc: "Regional home designs engineered specifically for Kerala monsoons, narrow city infill parcels, and sloping terrain.",
    href: "/#inspiration",
    linkText: "Explore Typologies",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  },
];

export default function NetworkCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Update scroll bounds and active index on scroll
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const firstCard = scrollRef.current.firstElementChild as HTMLElement;
    if (firstCard) {
      const cardWidth = firstCard.offsetWidth;
      const gap = 24; // gap-6 is 24px
      const index = Math.round(scrollLeft / (cardWidth + gap));
      setActiveIndex(Math.min(Math.max(index, 0), PORTALS.length - 1));
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollPrev = () => {
    if (!scrollRef.current) return;
    const firstCard = scrollRef.current.firstElementChild as HTMLElement;
    const scrollAmount = firstCard ? firstCard.offsetWidth + 24 : 340;
    scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };

  const scrollNext = () => {
    if (!scrollRef.current) return;
    const firstCard = scrollRef.current.firstElementChild as HTMLElement;
    const scrollAmount = firstCard ? firstCard.offsetWidth + 24 : 340;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const scrollToIndex = (idx: number) => {
    if (!scrollRef.current) return;
    const firstCard = scrollRef.current.firstElementChild as HTMLElement;
    const cardWidth = firstCard ? firstCard.offsetWidth : 320;
    const gap = 24;
    scrollRef.current.scrollTo({ left: idx * (cardWidth + gap), behavior: "smooth" });
  };

  return (
    <section className="py-10 sm:py-14 md:py-16 bg-white border-b border-warm-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 md:mb-10 gap-4 sm:gap-6">
          <div>
            <div className="text-[10px] sm:text-[11px] font-semibold tracking-widestExtra text-copper uppercase mb-2 sm:mb-2.5 font-mono">
              The Architecture Platform
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-normal font-serif tracking-tight text-charcoal mb-2 sm:mb-2.5">
              Explore the S-ARC Network.
            </h2>
            <p className="text-xs sm:text-sm md:text-[15px] leading-relaxed text-secondaryText max-w-xl font-light font-sans">
              Navigate our specialized directories — from construction-ready drawing sets to verified architect profiles and regional styles.
            </p>
          </div>

          {/* Right Header Controls: Direct link + Carousel Arrows */}
          <div className="flex items-center justify-between sm:justify-end gap-3.5 sm:gap-4 shrink-0">
            <Link
              href="/designs"
              className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-[13px] font-medium font-sans text-charcoal hover:text-copper transition-colors group shrink-0"
            >
              <span>View All 500+ Designs</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>

            {/* Carousel Previous / Next Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={scrollPrev}
                disabled={!canScrollLeft}
                aria-label="Previous slide"
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-all ${
                  canScrollLeft
                    ? "border-warm-border bg-white text-charcoal hover:border-copper hover:text-copper shadow-xs active:scale-95"
                    : "border-warm-border/50 bg-warm-grey/50 text-charcoal/30 cursor-not-allowed"
                }`}
              >
                <ChevronLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>

              <button
                type="button"
                onClick={scrollNext}
                disabled={!canScrollRight}
                aria-label="Next slide"
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-all ${
                  canScrollRight
                    ? "border-warm-border bg-white text-charcoal hover:border-copper hover:text-copper shadow-xs active:scale-95"
                    : "border-warm-border/50 bg-warm-grey/50 text-charcoal/30 cursor-not-allowed"
                }`}
              >
                <ChevronRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Scroll Track (Touch Swipeable & Smooth Snap) */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar pb-3 pt-1 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {PORTALS.map((portal, idx) => (
            <Link
              key={portal.id}
              href={portal.href}
              className="w-[82vw] sm:w-[300px] md:w-[330px] lg:w-[360px] shrink-0 snap-start group cursor-pointer bg-warm-grey border border-warm-border flex flex-col justify-between transition-all duration-300 hover:shadow-card hover:border-copper/50 rounded-2xl overflow-hidden"
            >
              <div>
                {/* Image Banner with Badge */}
                <div className="relative aspect-[16/10] sm:aspect-[16/11] w-full bg-charcoal overflow-hidden rounded-t-2xl">
                  <Image
                    src={portal.image}
                    alt={portal.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 85vw, (max-width: 1024px) 350px, 360px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Badge */}
                  <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-black/75 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 sm:py-1 font-semibold rounded-full border border-white/10">
                    {portal.badge}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5">
                  <h3 className="text-lg sm:text-xl font-normal font-serif text-charcoal group-hover:text-copper transition-colors mb-1.5 sm:mb-2">
                    {portal.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-secondaryText font-light font-sans leading-relaxed line-clamp-3">
                    {portal.desc}
                  </p>
                </div>
              </div>

              {/* Bottom Link Action */}
              <div className="p-4 sm:p-5 pt-0">
                <div className="pt-3 border-t border-warm-border/80 flex items-center justify-between text-xs font-sans font-medium text-charcoal group-hover:text-copper transition-colors">
                  <span>{portal.linkText}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Carousel Footer: Dot Indicators & Counter */}
        <div className="mt-4 sm:mt-6 flex items-center justify-between pt-2">
          {/* Dot Indicators */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {PORTALS.map((_, idx) => {
              const isActive = activeIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => scrollToIndex(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className="p-1 focus:outline-none"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-300 ${
                      isActive ? "w-6 sm:w-8 bg-copper" : "w-1.5 sm:w-2 bg-charcoal/20 hover:bg-charcoal/40"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Slide Progress Counter (e.g. 01 / 06) */}
          <div className="text-[11px] font-mono text-mutedText flex items-center gap-1.5">
            <span className="font-semibold text-charcoal">0{activeIndex + 1}</span>
            <span>/</span>
            <span>0{PORTALS.length}</span>
          </div>
        </div>

      </div>
    </section>
  );
}
