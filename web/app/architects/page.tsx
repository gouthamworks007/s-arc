"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SellerModal from "@/components/SellerModal";
import ArchitectDetailModal from "@/components/ArchitectDetailModal";
import { FEATURED_ARCHITECTS } from "@/lib/data";
import { ArchitectProfile } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, MapPin, ArrowRight, ShieldCheck, Award } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ArchitectsPage() {
  const router = useRouter();
  const [selectedArchitect, setSelectedArchitect] = useState<ArchitectProfile | null>(null);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("All");

  const filteredArchitects = FEATURED_ARCHITECTS.filter((arch) => {
    if (selectedCity === "All") return true;
    return arch.location.toLowerCase().includes(selectedCity.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-white">
      <Navbar onOpenSellerModal={() => setIsSellerModalOpen(true)} />

      {/* Hero Header */}
      <section className="pt-32 pb-14 bg-warm-grey border-b border-warm-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal font-serif tracking-tight text-charcoal mb-4">
            Meet the Minds Behind the Spaces.
          </h1>
          <p className="text-[15px] sm:text-base leading-relaxed text-secondaryText max-w-2xl font-light font-sans">
            Every architectural creator on S-ARC is thoroughly vetted, licensed with the Council of Architecture (India), and has built a portfolio of climate-responsive residential spaces.
          </p>

          {/* City filter pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {["All", "Kochi", "Trivandrum", "Calicut", "Kottayam"].map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-2 text-xs font-sans font-medium transition-all rounded-full ${
                  selectedCity === city
                    ? "bg-charcoal text-white"
                    : "bg-white text-charcoal border border-warm-border hover:border-charcoal/40"
                }`}
              >
                {city === "All" ? "All Locations" : `${city}, Kerala`}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Architects Grid */}
      <section className="py-16 sm:py-24 bg-white border-b border-warm-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArchitects.map((architect) => (
              <div
                key={architect.id}
                onClick={() => setSelectedArchitect(architect)}
                className="group cursor-pointer bg-white border border-warm-border p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-card hover:border-charcoal/30 rounded-2xl"
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
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 text-[11px] font-sans font-semibold text-copper shadow-sm flex items-center gap-1 rounded-full">
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
                  For Architects & Studios
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

