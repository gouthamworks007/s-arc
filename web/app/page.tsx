"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SmartSearch from "@/components/SmartSearch";
import ArchitecturalJournal from "@/components/ArchitecturalJournal";
import PreFooterBanner from "@/components/PreFooterBanner";
import Footer from "@/components/Footer";

import SellerModal from "@/components/SellerModal";
import StoryModal from "@/components/StoryModal";

import { JOURNAL_ARTICLES } from "@/lib/data";
import { ArrowRight, Compass, Layers, Users, Box, Ruler, ShieldCheck, Navigation, Sparkles } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  // Transfer search parameters seamlessly to the /designs page
  const handleSearch = (params: {
    location: string;
    plotSize: string;
    shape: string;
    direction: string;
  }) => {
    const query = new URLSearchParams();
    if (params.location) query.set("location", params.location);
    if (params.plotSize) query.set("plot", params.plotSize);
    if (params.shape) query.set("shape", params.shape);
    if (params.direction) query.set("direction", params.direction);
    router.push(`/designs?${query.toString()}`);
  };

  const handleOpenProject = (id: string) => {
    router.push(`/designs?project=${id}`);
  };

  const directoryPortals = [
    {
      title: "Featured Designs",
      desc: "Curated collection of residential architectural plans with CAD drawings and structural BOQ.",
      href: "/designs",
      linkText: "Explore 500+ Plans",
      icon: Layers,
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Architectural Styles",
      desc: "From Traditional Nalukettu courtyards to Modern Tropical and Minimalist concrete forms.",
      href: "/styles",
      linkText: "Discover Styles",
      icon: Compass,
      image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Inside Out (How It Works)",
      desc: "Inspect 3D axonometric renders, floor plans, setbacks, and complete technical specifications.",
      href: "/how-it-works",
      linkText: "Tour 3D & Plans",
      icon: Box,
      image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Featured Architects",
      desc: "Connect with verified, COA-licensed architects and studios across South India.",
      href: "/architects",
      linkText: "Meet the Creators",
      icon: Users,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* 1. Header & Navigation */}
      <Navbar
        onOpenSellerModal={() => setIsSellerModalOpen(true)}
        onOpenSearch={() => {
          const el = document.getElementById("search-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* 2. Hero Section */}
      <Hero
        onWatchStory={() => setIsStoryModalOpen(true)}
        onExploreClick={() => router.push("/designs")}
        onProjectClick={handleOpenProject}
      />

      {/* 3. Smart Design Search (What Are We Building On?) */}
      <SmartSearch onSearch={handleSearch} />

      {/* 4. Flagship GIS Engine: Plot Intelligence */}
      <section className="py-20 sm:py-28 bg-[#161413] text-white relative overflow-hidden border-b border-charcoal-light">
        {/* Subtle architectural grid pattern background */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            
            {/* Left Column: Context & Capabilities */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-copper/15 border border-copper/30 text-copper-light text-[11px] font-mono tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-copper animate-pulse" />
                <span>Kerala Satellite GIS Engine • KMBR 2019</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-normal font-serif leading-[1.1] tracking-tight text-white">
                Map Your Plot on Satellite. <br className="hidden sm:inline" />
                <span className="text-copper italic">Match Plans Down to the Cent.</span>
              </h2>

              <p className="text-[15px] sm:text-base leading-relaxed text-white/70 font-light font-sans max-w-xl">
                Eliminate spatial guesswork. Map any parcel of land anywhere across Kerala&apos;s 14 districts on high-resolution satellite imagery. Our GIS engine calculates precise geodesic area in Cents &amp; Sq.Ft, projects mandatory KMBR setbacks, and automatically filters verified CAD drawings that conform to your site.
              </p>

              {/* 4 Feature Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 pb-2">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-copper/40 transition-colors">
                  <Ruler className="w-4 h-4 text-copper shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-white font-sans">Geodesic Cent Precision</div>
                    <div className="text-[11px] text-white/50 font-light mt-0.5">Accurate Kerala survey standard (1 Cent = 435.6 sq.ft)</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-copper/40 transition-colors">
                  <ShieldCheck className="w-4 h-4 text-copper shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-white font-sans">KMBR 2019 Setbacks</div>
                    <div className="text-[11px] text-white/50 font-light mt-0.5">Automated 3m front, 1.5m rear &amp; side yard clearance</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-copper/40 transition-colors">
                  <Navigation className="w-4 h-4 text-copper shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-white font-sans">10+ Point Boundary Tool</div>
                    <div className="text-[11px] text-white/50 font-light mt-0.5">Plot irregular, contoured, or multi-corner parcel shapes</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-copper/40 transition-colors">
                  <Layers className="w-4 h-4 text-copper shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-white font-sans">Instant CAD Filtering</div>
                    <div className="text-[11px] text-white/50 font-light mt-0.5">Matches 500+ verified architectural layouts to your envelope</div>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/plot-intelligence"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-copper hover:bg-copper-hover text-white text-xs font-medium font-sans tracking-wide rounded-full shadow-lg transition-all group"
                >
                  <Compass className="w-4 h-4" />
                  <span>Launch Satellite GIS Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/plot-intelligence"
                  className="inline-flex items-center gap-2 px-5 py-3.5 bg-white/5 hover:bg-white/10 text-white/90 border border-white/15 text-xs font-medium font-sans tracking-wide rounded-full transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-copper" />
                  <span>Try Sample Plot in Kerala</span>
                </Link>
              </div>
            </div>

            {/* Right Column: High-Fidelity Satellite GIS Mockup Preview */}
            <div className="lg:col-span-5">
              <Link
                href="/plot-intelligence"
                className="block group relative rounded-2xl overflow-hidden border border-white/15 bg-[#0f0e0d] shadow-2xl hover:border-copper/60 transition-all duration-300"
              >
                {/* Header bar */}
                <div className="px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-white/80">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-medium">KERALA_GIS // TOP-DOWN SATELLITE</span>
                  </div>
                  <span className="text-[10px] text-white/50 font-mono">10.0159° N, 76.3419° E</span>
                </div>

                {/* Simulated Map Canvas */}
                <div className="relative aspect-[4/3] w-full bg-[#1b2219] overflow-hidden">
                  {/* Stylized Satellite Texture Map */}
                  <Image
                    src="https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=1000&q=80"
                    alt="Kerala Satellite Plot Mapping Interface"
                    fill
                    className="object-cover opacity-60 filter contrast-125 saturate-75 group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* SVG Plot Boundary Overlay */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300">
                    {/* Road line */}
                    <line x1="20" y1="260" x2="380" y2="260" stroke="#f5f4f1" strokeWidth="6" strokeOpacity="0.4" />
                    <text x="140" y="278" fill="#ffffff" fontSize="9" fontFamily="monospace" opacity="0.7">
                      PWD ACCESS ROAD (4.5M)
                    </text>

                    {/* Outer Boundary Polygon */}
                    <polygon
                      points="80,70 320,60 300,240 100,240"
                      fill="rgba(173, 128, 101, 0.22)"
                      stroke="#ad8065"
                      strokeWidth="2.5"
                    />

                    {/* Inner KMBR Buildable Footprint */}
                    <polygon
                      points="110,95 290,88 275,200 125,200"
                      fill="rgba(16, 185, 129, 0.15)"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />

                    {/* Corner Markers */}
                    <circle cx="80" cy="70" r="4.5" fill="#ffffff" stroke="#ad8065" strokeWidth="2" />
                    <circle cx="320" cy="60" r="4.5" fill="#ffffff" stroke="#ad8065" strokeWidth="2" />
                    <circle cx="300" cy="240" r="4.5" fill="#ffffff" stroke="#ad8065" strokeWidth="2" />
                    <circle cx="100" cy="240" r="4.5" fill="#ffffff" stroke="#ad8065" strokeWidth="2" />

                    {/* Labels */}
                    <text x="145" y="145" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                      7.45 CENTS
                    </text>
                    <text x="145" y="162" fill="#10b981" fontSize="9" fontFamily="monospace">
                      KMBR BUILDABLE AREA
                    </text>
                  </svg>

                  {/* Floating Live Badge */}
                  <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-[11px] font-mono shadow-lg">
                    <span className="text-copper font-semibold">Area:</span> 3,245 Sq.Ft (7.45 Cents)
                  </div>

                  {/* Orientation Compass */}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-[9px] font-mono text-white font-bold">
                    <span className="text-copper">N</span>
                    <span className="text-[7px] text-white/60">↑</span>
                  </div>

                  {/* Bottom Overlay Pill */}
                  <div className="absolute bottom-3 inset-x-3 bg-charcoal/90 backdrop-blur-md p-3 rounded-xl border border-white/15 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-white/90 font-sans text-[11px]">
                        <strong>14 Matching Plans</strong> fit this boundary
                      </span>
                    </div>
                    <span className="text-copper text-[11px] font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Open GIS Engine →
                    </span>
                  </div>
                </div>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Architectural Gateway: Clean portal to the 4 dedicated pages */}
      <section className="py-20 sm:py-24 bg-white border-b border-warm-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
            <div>
              <div className="text-[11px] font-semibold tracking-widestExtra text-copper uppercase mb-3 font-sans">
                The Architecture Platform
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-normal font-serif tracking-tight text-charcoal mb-3">
                Explore the S-ARC Network.
              </h2>
              <p className="text-[15px] leading-relaxed text-secondaryText max-w-xl font-light font-sans">
                Navigate our specialized directories — from construction-ready drawing sets to verified architect profiles and regional styles.
              </p>
            </div>

            <Link
              href="/designs"
              className="inline-flex items-center gap-2 text-[13px] font-medium font-sans text-charcoal hover:text-copper transition-colors group shrink-0"
            >
              <span>View All 500+ Designs</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* 4 Gateway Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {directoryPortals.map((portal) => (
              <Link
                key={portal.title}
                href={portal.href}
                className="group cursor-pointer bg-warm-grey border border-warm-border flex flex-col justify-between transition-all duration-300 hover:shadow-card hover:border-charcoal/40 rounded-2xl overflow-hidden"
              >
                <div>
                  {/* Image */}
                  <div className="relative aspect-[16/11] w-full bg-charcoal overflow-hidden rounded-t-2xl">
                    <Image
                      src={portal.image}
                      alt={portal.title}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <h3 className="text-xl font-normal font-serif text-charcoal group-hover:text-copper transition-colors mb-2">
                      {portal.title}
                    </h3>
                    <p className="text-xs text-secondaryText font-light font-sans leading-relaxed line-clamp-3">
                      {portal.desc}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-warm-border/80 flex items-center justify-between text-xs font-sans font-medium text-charcoal group-hover:text-copper transition-colors">
                    <span>{portal.linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Architectural Journal (Ideas, Insights and Stories) */}
      <ArchitecturalJournal articles={JOURNAL_ARTICLES} />

      {/* 10. Pre-Footer Banner (Design. Build. Belong.) */}
      <PreFooterBanner />

      {/* 11. Footer */}
      <Footer onOpenSellerModal={() => setIsSellerModalOpen(true)} />

      {/* Modals */}
      <SellerModal
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
      />

      <StoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
      />
    </main>
  );
}
