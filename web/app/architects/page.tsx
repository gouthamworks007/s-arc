"use client";

import React, { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SellerModal from "@/components/SellerModal";
import ArchitectDetailModal from "@/components/ArchitectDetailModal";
import { FEATURED_ARCHITECTS } from "@/lib/data";
import { ArchitectProfile } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, MapPin, ArrowRight, ShieldCheck, Award, Search, X, CheckCircle2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ArchitectsPage() {
  const router = useRouter();
  const [selectedArchitect, setSelectedArchitect] = useState<ArchitectProfile | null>(null);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const KERALA_DISTRICT_HUBS = [
    { id: "All", label: "All Kerala Hubs" },
    { id: "Kochi", label: "Kochi (Ernakulam)" },
    { id: "Trivandrum", label: "Trivandrum" },
    { id: "Calicut", label: "Calicut (Kozhikode)" },
    { id: "Thrissur", label: "Thrissur" },
    { id: "Kottayam", label: "Kottayam" },
    { id: "Kannur", label: "Kannur" },
  ];

  const filteredArchitects = useMemo(() => {
    return FEATURED_ARCHITECTS.filter((arch) => {
      // City Filter
      if (selectedCity !== "All") {
        const loc = arch.location.toLowerCase();
        if (selectedCity === "Kochi" && !loc.includes("kochi") && !loc.includes("ernakulam")) return false;
        else if (selectedCity === "Trivandrum" && !loc.includes("trivandrum") && !loc.includes("thiruvananthapuram")) return false;
        else if (selectedCity === "Calicut" && !loc.includes("calicut") && !loc.includes("kozhikode")) return false;
        else if (selectedCity === "Thrissur" && !loc.includes("thrissur")) return false;
        else if (selectedCity === "Kottayam" && !loc.includes("kottayam")) return false;
        else if (selectedCity === "Kannur" && !loc.includes("kannur")) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = arch.name.toLowerCase().includes(query);
        const matchesTitle = arch.title.toLowerCase().includes(query);
        const matchesSpecialty = arch.specialty.toLowerCase().includes(query);
        const matchesBio = arch.bio.toLowerCase().includes(query);
        const matchesLoc = arch.location.toLowerCase().includes(query);
        if (!matchesName && !matchesTitle && !matchesSpecialty && !matchesBio && !matchesLoc) return false;
      }

      return true;
    });
  }, [selectedCity, searchQuery]);

  return (
    <main id="main-content" className="min-h-screen bg-white">
      <Navbar onOpenSellerModal={() => setIsSellerModalOpen(true)} />

      {/* Hero Header */}
      <section className="pt-32 pb-14 bg-warm-grey border-b border-warm-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-copper/10 border border-copper/20 text-copper text-[11px] font-mono tracking-wider uppercase mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-copper" />
            <span>COA Verified Architects &amp; Studios</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal font-serif tracking-tight text-charcoal mb-4">
            Meet the Minds Behind the Spaces.
          </h1>
          <p className="text-[15px] sm:text-base leading-relaxed text-secondaryText max-w-2xl font-light font-sans mb-8">
            Every architectural creator on S-ARC is thoroughly vetted, licensed with the Council of Architecture (India), and has built a portfolio of climate-responsive residential spaces conforming to Kerala KMBR regulations.
          </p>

          {/* Search & Location Hub Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pt-2">
            {/* City filter pills */}
            <div className="flex flex-wrap gap-2">
              {KERALA_DISTRICT_HUBS.map((hub) => (
                <button
                  key={hub.id}
                  onClick={() => setSelectedCity(hub.id)}
                  className={`px-4 py-2 text-xs font-sans font-medium transition-all rounded-full ${
                    selectedCity === hub.id
                      ? "bg-charcoal text-white shadow-sm"
                      : "bg-white text-charcoal border border-warm-border hover:border-charcoal/40"
                  }`}
                >
                  {hub.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px] flex items-center bg-white border border-warm-border px-3 py-2 rounded-xl shadow-subtle">
              <Search className="w-4 h-4 text-mutedText mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search architects or styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-[13px] text-charcoal outline-none placeholder:text-mutedText font-sans"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-mutedText hover:text-charcoal p-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Architects Grid */}
      <section className="py-16 sm:py-24 bg-white border-b border-warm-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          
          {/* Results count & reset */}
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-warm-border text-xs font-sans text-secondaryText">
            <div>
              Showing <strong className="text-charcoal font-semibold">{filteredArchitects.length}</strong> verified architecture studios
            </div>
            {(selectedCity !== "All" || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCity("All");
                  setSearchQuery("");
                }}
                className="text-copper font-medium hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArchitects.map((architect) => (
              <div
                key={architect.id}
                role="button"
                tabIndex={0}
                aria-label={`View profile for ${architect.name}, ${architect.title}`}
                onClick={() => setSelectedArchitect(architect)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedArchitect(architect);
                  }
                }}
                className="group cursor-pointer bg-white border border-warm-border p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-card hover:border-charcoal/40 rounded-2xl focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2"
              >
                <div>
                  {/* Portrait */}
                  <div className="relative aspect-square w-full mb-5 bg-warm-grey overflow-hidden rounded-xl">
                    <Image
                      src={architect.image}
                      alt={architect.name}
                      fill
                      className="object-cover object-top filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {architect.verified && (
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 text-[11px] font-sans font-semibold text-copper shadow-sm flex items-center gap-1 rounded-full border border-warm-border/50">
                        <BadgeCheck className="w-3.5 h-3.5 fill-copper text-white" />
                        <span>COA Verified</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-normal font-serif text-charcoal group-hover:text-copper transition-colors">
                      {architect.name}
                    </h3>
                  </div>

                  <div className="text-xs text-mutedText font-sans mb-3 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-copper shrink-0" />
                    <span>{architect.title} • {architect.location}</span>
                  </div>

                  <p className="text-[13px] text-secondaryText font-light font-sans leading-relaxed line-clamp-3 mb-4">
                    {architect.bio}
                  </p>
                </div>

                <div className="pt-4 border-t border-warm-border/80 flex items-center justify-between text-xs font-sans">
                  <span className="bg-warm-grey px-2.5 py-1 text-charcoal font-medium rounded-full">
                    {architect.specialty}
                  </span>

                  <span className="text-copper font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {architect.projectsCount} Plans
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}

            {/* Join Network Card */}
            <div className="bg-[#201c1a] text-white p-8 flex flex-col justify-between relative overflow-hidden group rounded-2xl">
              <div className="space-y-4 relative z-10">
                <span className="text-[10px] tracking-widestExtra text-copper-light uppercase font-sans font-semibold">
                  For Architects &amp; Studios
                </span>
                <h3 className="text-2xl sm:text-3xl font-normal font-serif leading-snug">
                  Publish Your Architectural Work to Thousands of Landowners
                </h3>
                <p className="text-xs text-white/70 font-light font-sans leading-relaxed">
                  Join our curated network. Monetize your verified CAD drawings, retain copyright, and connect with clients looking for custom architecture.
                </p>
              </div>

              <div className="pt-8 relative z-10">
                <button
                  onClick={() => setIsSellerModalOpen(true)}
                  className="w-full py-3.5 px-4 bg-copper hover:bg-copper-hover text-white text-xs font-medium font-sans tracking-wide flex items-center justify-center gap-2 transition-colors shadow-sm rounded-full"
                >
                  <span>Apply to Become a Seller</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {filteredArchitects.length === 0 && (
            <div className="text-center py-20 bg-warm-grey border border-warm-border p-8 rounded-2xl">
              <h3 className="text-2xl font-serif text-charcoal mb-2">No Architects Found</h3>
              <p className="text-sm text-mutedText font-sans max-w-md mx-auto mb-6">
                Try selecting a different district hub or modifying your search query to see verified creators.
              </p>
              <button
                onClick={() => {
                  setSelectedCity("All");
                  setSearchQuery("");
                }}
                className="px-6 py-2.5 bg-copper text-white text-xs font-medium font-sans hover:bg-copper-hover transition-colors rounded-full"
              >
                Show All Architects
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer onOpenSellerModal={() => setIsSellerModalOpen(true)} />

      {/* Architect Detail Modal */}
      <ArchitectDetailModal
        architect={selectedArchitect}
        onClose={() => setSelectedArchitect(null)}
        onSelectProject={() => {
          if (selectedArchitect) {
            router.push(`/designs?architect=${encodeURIComponent(selectedArchitect.name)}`);
          } else {
            router.push("/designs");
          }
        }}
      />

      {/* Seller Application Modal */}
      <SellerModal
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
      />
    </main>
  );
}

