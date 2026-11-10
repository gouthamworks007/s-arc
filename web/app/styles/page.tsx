"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SellerModal from "@/components/SellerModal";
import { ARCHITECTURAL_STYLES, FEATURED_PROJECTS } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, CheckCircle2 } from "lucide-react";

export default function StylesPage() {
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);

  const styleDetails = [
    {
      id: "contemporary",
      name: "Contemporary",
      headline: "Volumetric cantilevered forms and transparent spatial connections.",
      description: "Contemporary residential architecture in South India prioritizes crisp geometric massing, exposed cast-in-place concrete, and deep glass facades that bridge climate-conditioned living with shaded exterior verandahs.",
      climateFeatures: [
        "Calibrated solar louvers to control glare while admitting natural daylight",
        "Deep cantilevered overhangs providing passive monsoon protection",
        "Open double-height volumes inducing natural stack ventilation",
      ],
      idealPlots: "10 to 20 Cents (Corner & Rectangular plots)",
      materials: "Board-formed concrete, structural steel, low-E solar glass, Kota stone",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "minimalist",
      name: "Modern Minimalist",
      headline: "Disciplined purity, tactile textures, and sculpted daylight.",
      description: "Stripping away all superficial decoration to let pure structural geometry, shadow play, and authentic materials take center stage. Built-in joinery and concealed systems eliminate clutter.",
      climateFeatures: [
        "Narrow floor plates allowing uninterrupted cross-breezes across rooms",
        "Carefully positioned skylights washing raw textured walls with diffused daylight",
        "High thermal mass exterior envelope stabilizing internal temperatures",
      ],
      idealPlots: "8 to 15 Cents (Urban & Narrow Frontage sites)",
      materials: "Smooth micro-cement, white architectural plaster, oak timber, black steel",
      image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "traditional",
      name: "Traditional Vernacular",
      headline: "Heritage Kerala Nalukettu craftsmanship adapted for contemporary living.",
      description: "Rooted in centuries of regional response to high humidity and intense monsoon rainfall. Centralized open-to-sky Nadumuttams (courtyards), pitched clay-tiled roofs, and handcrafted timber colonnades.",
      climateFeatures: [
        "Mangalore clay tile roofs naturally shedding 3,000mm annual monsoon downpours",
        "Central Nadumuttam creating a thermal chimney that exhausts warm rising air",
        "Continuous surrounding verandahs (Charupadi) shielding walls from direct sun",
      ],
      idealPlots: "12 to 25 Cents (Rural, Suburban & Estate plots)",
      materials: "Reclaimed teakwood, terracotta roofing tiles, laterite stone, brass hardware",
      image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "modern-tropical",
      name: "Modern Tropical",
      headline: "Biophilic porous architecture living in harmony with nature.",
      description: "Dissolving the separation between interior sanctuaries and lush tropical vegetation. Characterized by hanging vertical gardens, timber louver screens, and natural water channels.",
      climateFeatures: [
        "Breathable operable timber jaalis regulating air currents and privacy",
        "Integrated rainwater retention swales and vegetative heat buffers",
        "Elevated ground floor plinths dampening soil moisture during monsoon seasons",
      ],
      idealPlots: "8 to 18 Cents (Sloped, contoured, or tree-dense sites)",
      materials: "Natural bamboo composites, exposed red brick, polished concrete, local granite",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "courtyard",
      name: "Courtyard Architecture",
      headline: "Private interior oases providing serene inward-looking sanctuaries.",
      description: "Designed for dense urban settings where privacy from street noise and neighboring plots is paramount. Rooms wrap around an internal open court with reflecting pools and vegetation.",
      climateFeatures: [
        "Creates a controlled microclimate up to 4°C cooler than ambient urban heat",
        "Rainwater harvesting collection basin integrated into central court design",
        "100% natural daylit interior spaces even on compact zero-setback sites",
      ],
      idealPlots: "6 to 15 Cents (Urban infill & high-density streets)",
      materials: "Exposed wire-cut bricks, sandstone, copper water spouts, lime plaster",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "mediterranean",
      name: "Mediterranean Coastal",
      headline: "Whitewashed lime, arched loggias, and breezy seaside terraces.",
      description: "Inspired by coastal Pondicherry and Mediterranean traditions. Thick insulating masonry, sun-drenched arches, terracotta patio flooring, and vibrant bougainvillea pergolas.",
      climateFeatures: [
        "Thick hydraulic lime-washed walls deflecting intense maritime solar radiation",
        "Deep arched loggias funneling cooling coastal breezes into the living spaces",
        "Expansive rooftop terraces capturing night breezes for outdoor living",
      ],
      idealPlots: "15 to 30 Cents (Coastal, hillside, and vacation home properties)",
      materials: "Hydraulic lime stucco, terracotta tiles, wrought iron, encaustic cement floor",
      image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar onOpenSellerModal={() => setIsSellerModalOpen(true)} />

      {/* Hero Header */}
      <section className="pt-32 pb-14 bg-warm-grey border-b border-warm-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-copper/10 border border-copper/20 text-copper text-[11px] font-mono tracking-wider uppercase mb-4">
            <Compass className="w-3.5 h-3.5 text-copper" />
            <span>Architectural Taxonomy &amp; Vernacular Philosophy</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal font-serif tracking-tight text-charcoal mb-4">
            Find Your Architectural Language.
          </h1>
          <p className="text-[15px] sm:text-base leading-relaxed text-secondaryText max-w-2xl font-light font-sans mb-8">
            Every architectural style on S-ARC represents a distinct philosophy of living, structural system, and climate response engineered for Southern Indian geography.
          </p>

          {/* Quick Anchor Navigation Pills */}
          <div className="flex flex-wrap gap-2">
            {styleDetails.map((style) => (
              <a
                key={style.id}
                href={`#${style.id}`}
                className="px-4 py-2 text-xs font-sans font-medium bg-white text-charcoal border border-warm-border hover:border-charcoal hover:bg-warm-grey transition-all rounded-full"
              >
                {style.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Styles Showcase */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-24">
          {styleDetails.map((style, idx) => (
            <div
              key={style.id}
              id={style.id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pb-20 border-b border-warm-border scroll-mt-28 ${
                idx % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Image Column */}
              <div className={`lg:col-span-6 relative aspect-[16/11] bg-charcoal overflow-hidden rounded-2xl shadow-card group ${
                idx % 2 === 1 ? "lg:order-2" : "lg:order-1"
              }`}>
                <Image
                  src={style.image}
                  alt={style.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute top-4 left-4 bg-charcoal/85 backdrop-blur-sm text-white text-[10px] tracking-widestExtra uppercase px-3.5 py-1.5 font-sans rounded-full border border-white/10">
                  Style 0{idx + 1}
                </div>
              </div>

              {/* Text Column */}
              <div className={`lg:col-span-6 space-y-5 ${
                idx % 2 === 1 ? "lg:order-1" : "lg:order-2"
              }`}>
                <div>
                  <h2 className="text-3xl sm:text-4xl font-normal font-serif text-charcoal mb-2">
                    {style.name}
                  </h2>
                  <p className="text-sm font-medium text-copper font-sans">
                    {style.headline}
                  </p>
                </div>

                <p className="text-[14px] leading-relaxed text-secondaryText font-light font-sans">
                  {style.description}
                </p>

                {/* Climate Response Features */}
                <div className="bg-warm-grey p-5 border border-warm-border space-y-3 rounded-2xl">
                  <div className="text-[11px] font-semibold text-charcoal uppercase tracking-wider font-sans flex items-center justify-between">
                    <span>Climate &amp; Vernacular Adaptations</span>
                    <span className="text-[10px] font-normal text-mutedText lowercase">kerala &amp; south india</span>
                  </div>
                  <ul className="space-y-2 text-xs text-secondaryText font-sans">
                    {style.climateFeatures.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-copper mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                  <div className="border border-warm-border p-3.5 rounded-xl bg-white">
                    <span className="text-mutedText block text-[10px] uppercase font-mono mb-1">Recommended Plot Size</span>
                    <span className="font-medium text-charcoal">{style.idealPlots}</span>
                  </div>
                  <div className="border border-warm-border p-3.5 rounded-xl bg-white">
                    <span className="text-mutedText block text-[10px] uppercase font-mono mb-1">Primary Materiality</span>
                    <span className="font-medium text-charcoal block line-clamp-2">{style.materials}</span>
                  </div>
                </div>

                {/* Explore actions */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/designs?style=${encodeURIComponent(style.name)}`}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-charcoal text-white hover:bg-copper text-xs font-medium tracking-wide transition-all font-sans rounded-full shadow-subtle group"
                  >
                    <span>Browse {style.name} Plans</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href="/plot-intelligence"
                    className="inline-flex items-center gap-1.5 px-4 py-3 bg-warm-grey hover:bg-warm-border/60 text-charcoal text-xs font-medium font-sans rounded-full border border-warm-border transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5 text-copper" />
                    <span>Test on Satellite Plot</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer onOpenSellerModal={() => setIsSellerModalOpen(true)} />

      <SellerModal
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
      />
    </main>
  );
}

