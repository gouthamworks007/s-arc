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
import { ArrowRight, Compass, Layers, Users } from "lucide-react";

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
      title: "Plot Intelligence GIS",
      desc: "Top-down satellite mapping, real-time Cent area calculation, and KMBR 2019 setback projections.",
      href: "/plot-intelligence",
      linkText: "Launch Satellite Map",
      icon: Compass,
      image: "https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=800&q=80",
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
