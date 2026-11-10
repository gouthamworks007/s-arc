"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Compass, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroProps {
  onWatchStory?: () => void;
  onExploreClick: () => void;
  onProjectClick: (id: string) => void;
}

const HERO_SLIDES = [
  {
    id: "ridge-house",
    title: "The Courtyard House",
    subtitle: "Contemporary Tropical • Kochi",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85",
    alt: "Contemporary Luxury South Indian Residential Architecture",
  },
  {
    id: "ridge-house",
    title: "The Ridge House",
    subtitle: "Cantilevered Concrete • Wayanad",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1800&q=85",
    alt: "The Ridge House Brutalist Residential Architecture",
  },
  {
    id: "kerala-courtyard",
    title: "Kerala Heritage Courtyard",
    subtitle: "Vernacular Nalukettu • Thrissur",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1800&q=85",
    alt: "Traditional Kerala Courtyard Architecture",
  },
  {
    id: "the-green-nest",
    title: "The Green Nest",
    subtitle: "Modern Biophilic Villa • Calicut",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1800&q=85",
    alt: "Biophilic Tropical Architecture",
  },
  {
    id: "the-linear-home",
    title: "The Linear Pavilion",
    subtitle: "Minimalist Monolith • Bengaluru",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=85",
    alt: "Minimalist Monolith Villa",
  },
  {
    id: "mediterranean-villa",
    title: "Villa Terracota",
    subtitle: "Mediterranean Coastal • Pondicherry",
    image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1800&q=85",
    alt: "Mediterranean Coastal Villa",
  },
];

export default function Hero({ onExploreClick, onProjectClick }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

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
    <section className="relative pt-24 sm:pt-28 pb-16 lg:pb-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-stretch">
          
          {/* Left Column: Editorial Typography & Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col justify-between pt-4 lg:pt-8"
          >
            <div>
              {/* Overline tag */}
              <div className="text-[11px] font-semibold tracking-widestExtra text-copper uppercase mb-5">
                Architecture for a better tomorrow
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[62px] leading-[1.04] font-normal tracking-[-0.01em] text-charcoal mb-6 font-serif">
                Turn Your <br />
                Land Into <br />
                <span className="italic font-normal">A Home.</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-[15px] sm:text-base leading-relaxed text-secondaryText max-w-md mb-8 font-light font-sans">
                Discover, customise and purchase architectural designs from verified architects across South India.
              </p>

              {/* Primary & Secondary Action CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 mb-10">
                <button
                  onClick={onExploreClick}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-copper hover:bg-copper-hover text-white text-xs font-medium font-sans tracking-wide rounded-full shadow-subtle hover:shadow transition-all group"
                >
                  <span>Explore 500+ Designs</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>

                <Link
                  href="/plot-intelligence"
                  className="inline-flex items-center gap-2 px-5 py-3.5 bg-warm-grey hover:bg-warm-border/50 text-charcoal border border-warm-border text-xs font-medium font-sans tracking-wide rounded-full transition-all group"
                >
                  <Compass className="w-3.5 h-3.5 text-copper" />
                  <span>Plot Intelligence GIS</span>
                  <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] bg-copper-subtle text-copper font-mono uppercase font-bold border border-copper/30">
                    Live
                  </span>
                </Link>
              </div>
            </div>

            {/* Platform Metrics / Statistics */}
            <div className="pt-8 border-t border-warm-border/80 grid grid-cols-4 gap-2 sm:gap-4">
              <div>
                <div className="text-xl sm:text-2xl font-medium tracking-tight text-charcoal">
                  500<span className="text-copper">+</span>
                </div>
                <div className="text-[11px] text-mutedText tracking-wider uppercase mt-1">
                  Designs
                </div>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-medium tracking-tight text-charcoal">
                  100<span className="text-copper">+</span>
                </div>
                <div className="text-[11px] text-mutedText tracking-wider uppercase mt-1">
                  Architects
                </div>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-medium tracking-tight text-charcoal">
                  12<span className="text-copper">+</span>
                </div>
                <div className="text-[11px] text-mutedText tracking-wider uppercase mt-1">
                  Cities
                </div>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-medium tracking-tight text-charcoal">
                  10K<span className="text-copper">+</span>
                </div>
                <div className="text-[11px] text-mutedText tracking-wider uppercase mt-1">
                  Builders
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Continuous Scrolling Carousel (Looping every 1.5s) */}
          <div 
            className="lg:col-span-7 relative min-h-[460px] sm:min-h-[540px] lg:min-h-[620px] w-full"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
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

              {/* Slide Progress Indicator Bar */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/10 z-20 overflow-hidden pointer-events-none">
                <motion.div
                  key={currentSlide}
                  initial={{ width: "0%" }}
                  animate={{ width: isPaused ? "0%" : "100%" }}
                  transition={{ duration: 5.5, ease: "linear" }}
                  className="h-full bg-copper shadow-[0_0_10px_rgba(173,128,101,0.9)]"
                />
              </div>

              {/* Animated Moving Dot Indicators */}
              <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-20 pointer-events-auto">
                <div className="flex items-center gap-1.5">
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
                        className="relative w-4 h-4 flex items-center justify-center focus:outline-none group"
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
              <div className="absolute inset-y-0 left-4 sm:left-6 flex items-center z-20">
                <button
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-200 hover:scale-105"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="absolute inset-y-0 right-4 sm:right-6 flex items-center z-20">
                <button
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-200 hover:scale-105"
                >
                  <ChevronRight className="w-5 h-5" />
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
                  className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 bg-charcoal/85 hover:bg-charcoal text-white backdrop-blur-md px-4 py-3 text-left border border-white/15 transition-all duration-300 group max-w-[270px] z-20 shadow-lg rounded-xl"
                >
                  <div className="text-[10px] tracking-widest uppercase text-white/60 mb-0.5">
                    Featured Project
                  </div>
                  <div className="text-[13px] font-medium tracking-wide flex items-center justify-between gap-3 text-white group-hover:text-copper transition-colors">
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
