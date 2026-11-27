"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProjects } from "@/lib/projectsContext";

interface HeroProps {
  onWatchStory?: () => void;
  onExploreClick: () => void;
  onProjectClick: (id: string) => void;
}

const HERO_SLIDES = [
  {
    id: "ridge-house",
    title: "Courtyard & Tropical Style",
    subtitle: "Style Showcase • Cross-Ventilation & Brick",
    image: "/showcase-courtyard.webp",
    alt: "Twilight courtyard tropical residence architectural render",
  },
  {
    id: "ridge-house",
    title: "Contemporary Cantilever Style",
    subtitle: "Style Showcase • Extended Roof Overhangs",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80",
    alt: "Contemporary cantilevered concrete residential design",
  },
  {
    id: "kerala-courtyard",
    title: "Vernacular Sloping Roof Style",
    subtitle: "Style Showcase • Deep Verandahs & Pitched Roof",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1400&q=80",
    alt: "Pitched roof vernacular residential architecture",
  },
  {
    id: "the-green-nest",
    title: "Biophilic Garden Residence",
    subtitle: "Style Showcase • Indoor-Outdoor Courtyard",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
    alt: "Biophilic garden residential architecture",
  },
  {
    id: "the-linear-home",
    title: "Minimalist Linear Residence",
    subtitle: "Style Showcase • Compact Plot Planning",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80",
    alt: "Minimalist linear modern home exterior",
  },
  {
    id: "mediterranean-villa",
    title: "Mediterranean & Warm Stucco",
    subtitle: "Style Showcase • Shaded Loggias & Arches",
    image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
    alt: "Mediterranean residential villa exterior",
  },
];

export default function Hero({ onExploreClick, onProjectClick }: HeroProps) {
  const { projects } = useProjects();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const publishedProjects = projects.filter((p) => p.status !== "draft");
  const liveCount = publishedProjects.length;
  const minBuyerPrice = publishedProjects.reduce((min, p) => {
    const val = Number(p.priceNumeric) || parseInt(String(p.price || "").replace(/[^\d]/g, ""), 10) || 0;
    return val > 0 && val < min ? val : min;
  }, Infinity);
  const minPriceLabel = Number.isFinite(minBuyerPrice)
    ? `₹${Math.round(minBuyerPrice).toLocaleString("en-IN")}`
    : "Fixed Tiers";
  const distinctStyles = new Set(publishedProjects.map((p) => p.style).filter(Boolean)).size || 3;

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
  };

  // Continuous scrolling animation in loop every 5.5 seconds (5500ms) with calm ease
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [isPaused]);

  const activeSlide = HERO_SLIDES[currentSlide];

  // Slide animation variants for continuous scrolling
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
    }),
    center: {
      x: "0%",
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
    }),
  };

  return (
    <section className="relative pt-20 sm:pt-24 pb-10 sm:pb-12 lg:pb-14 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-stretch">
          
          {/* Left Column: Editorial Typography & Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col justify-between pt-2 lg:pt-4"
          >
            <div>
              {/* Overline tag */}
              <div className="text-[11px] font-semibold tracking-widestExtra text-copper uppercase mb-3">
                Architecture for a better tomorrow
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[62px] leading-[1.04] font-normal tracking-[-0.01em] text-charcoal mb-4 font-serif">
                Turn Your <br />
                Land Into <br />
                <span className="italic font-normal">A Home.</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-[15px] sm:text-base leading-relaxed text-secondaryText max-w-md mb-6 font-light font-sans">
                Discover, customise and purchase architectural designs from verified architects across South India.
              </p>

              {/* Primary & Secondary Action CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5 mb-7 sm:mb-8">
                <button
                  onClick={onExploreClick}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-copper hover:bg-copper-hover text-white text-xs font-medium font-sans tracking-wide rounded-full shadow-subtle hover:shadow transition-all group min-h-[44px] w-full sm:w-auto"
                >
                  <span>Explore Designs</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>

                <Link
                  href="/plot-intelligence"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-warm-grey hover:bg-warm-border/50 text-charcoal border border-warm-border text-xs font-medium font-sans tracking-wide rounded-full transition-all group min-h-[44px] w-full sm:w-auto"
                >
                  <Compass className="w-3.5 h-3.5 text-copper" />
                  <span>Plot Intelligence</span>
                </Link>
              </div>
            </div>

            {/* Live Catalog Highlights */}
            <div className="pt-4 sm:pt-6 border-t border-warm-border/80 grid grid-cols-4 gap-1.5 sm:gap-4">
              <div>
                <div className="text-lg sm:text-2xl font-medium tracking-tight text-charcoal">
                  {liveCount}
                </div>
                <div className="text-[10px] sm:text-[11px] text-mutedText tracking-wider uppercase mt-0.5 sm:mt-1 truncate">
                  Curated Plans
                </div>
              </div>

              <div>
                <div className="text-lg sm:text-2xl font-medium tracking-tight text-charcoal">
                  {minPriceLabel}
                </div>
                <div className="text-[10px] sm:text-[11px] text-mutedText tracking-wider uppercase mt-0.5 sm:mt-1 truncate">
                  Starting From
                </div>
              </div>

              <div>
                <div className="text-lg sm:text-2xl font-medium tracking-tight text-charcoal">
                  {distinctStyles}
                </div>
                <div className="text-[10px] sm:text-[11px] text-mutedText tracking-wider uppercase mt-0.5 sm:mt-1 truncate">
                  Style Categories
                </div>
              </div>

              <div>
                <div className="text-lg sm:text-2xl font-medium tracking-tight text-charcoal">
                  COA
                </div>
                <div className="text-[10px] sm:text-[11px] text-mutedText tracking-wider uppercase mt-0.5 sm:mt-1 truncate">
                  Reviewed Studios
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Continuous Scrolling Carousel (Looping every 5.5s + Swipeable on Mobile) */}
          <div 
            className="lg:col-span-7 relative min-h-[330px] sm:min-h-[460px] md:min-h-[540px] lg:min-h-[620px] h-[340px] sm:h-auto w-full select-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative w-full h-full overflow-hidden rounded-2xl sm:rounded-3xl bg-charcoal group shadow-card">
              
              {/* Continuous scrolling track with side-by-side exit & enter */}
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={currentSlide}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { duration: 0.65, ease: [0.25, 1, 0.5, 1] },
                  }}
                  className="absolute inset-0 w-full h-full"
                >
                  <Image
                    src={activeSlide.image}
                    alt={activeSlide.alt}
                    fill
                    priority={currentSlide === 0}
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Architectural Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />

              {/* Animated Moving Dot Indicators */}
              <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-20 pointer-events-auto">
                <div className="flex items-center gap-1">
                  {HERO_SLIDES.map((_, idx) => {
                    const isActive = currentSlide === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setDirection(idx >= currentSlide ? 1 : -1);
                          setCurrentSlide(idx);
                        }}
                        aria-label={`Go to slide ${idx + 1}`}
                        className="relative w-8 h-8 flex items-center justify-center focus:outline-none group min-h-[32px] min-w-[32px]"
                      >
                        {/* Base Inactive Dot */}
                        <span className="w-2 h-2 rounded-full bg-white/40 group-hover:bg-white/80 transition-colors drop-shadow" />

                        {/* Moving Active Dot Animation */}
                        {isActive && (
                          <motion.span
                            layoutId="activeHeroDot"
                            className="absolute w-2.5 h-2.5 rounded-full bg-copper shadow-[0_0_10px_rgba(173,128,101,1)]"
                            transition={{
                              type: "spring",
                              stiffness: 450,
                              damping: 32,
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Arrow Controls (Previous / Next) */}
              <div className="absolute inset-y-0 left-2 sm:left-6 flex items-center z-20">
                <button
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-200 hover:scale-105"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="absolute inset-y-0 right-2 sm:right-6 flex items-center z-20">
                <button
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-200 hover:scale-105"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Bottom Right Dynamic Project Badge */}
              <AnimatePresence mode="wait">
                <motion.button
                  key={activeSlide.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => onProjectClick(activeSlide.id)}
                  className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-8 sm:bottom-8 bg-charcoal/85 hover:bg-charcoal text-white backdrop-blur-md px-3.5 py-2.5 sm:px-4 sm:py-3 text-left border border-white/15 transition-all duration-300 group sm:max-w-[270px] z-20 shadow-lg rounded-xl"
                >
                  <div className="text-[9px] sm:text-[10px] tracking-widest uppercase text-white/60 mb-0.5">
                    Style Preview
                  </div>
                  <div className="text-xs sm:text-[13px] font-medium tracking-wide flex items-center justify-between gap-3 text-white group-hover:text-copper transition-colors">
                    <div className="truncate">
                      <div>{activeSlide.title}</div>
                      <div className="text-[10px] text-white/50 font-normal tracking-normal truncate">{activeSlide.subtitle}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.button>
              </AnimatePresence>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
