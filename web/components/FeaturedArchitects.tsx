"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { ArchitectProfile } from "@/lib/types";

interface FeaturedArchitectsProps {
  architects: ArchitectProfile[];
  onSelectArchitect: (architect: ArchitectProfile) => void;
  onBecomeSeller: () => void;
}

export default function FeaturedArchitects({
  architects,
  onSelectArchitect,
  onBecomeSeller,
}: FeaturedArchitectsProps) {
  return (
    <section id="architects" className="py-20 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-normal font-serif tracking-[-0.01em] text-charcoal mb-3">
              Featured Architects
            </h2>
            <p className="text-[15px] leading-relaxed text-secondaryText max-w-xl font-light font-sans">
              Explore work from verified architects and licensed design studios across South India.
            </p>
          </div>

          <a
            href="#explore"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-charcoal hover:text-copper transition-colors group shrink-0"
          >
            <span>View All Architects</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* 5-Column Grid matching design.png */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {architects.map((architect) => (
            <div
              key={architect.id}
              onClick={() => onSelectArchitect(architect)}
              className="group cursor-pointer bg-warm-grey border border-warm-border p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-card hover:border-charcoal/30"
            >
              {/* Architect Portrait Image */}
              <div className="relative aspect-square w-full mb-4 bg-warm-card overflow-hidden">
                <Image
                  src={architect.image}
                  alt={architect.name}
                  fill
                  className="object-cover object-top filter grayscale contrast-105 group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                />
                {architect.verified && (
                  <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-sm p-1 rounded-full text-copper shadow-sm">
                    <BadgeCheck className="w-3.5 h-3.5 fill-copper text-white" />
                  </div>
                )}
              </div>

              {/* Architect Information */}
              <div>
                <h4 className="text-[15px] font-medium font-serif text-charcoal group-hover:text-copper transition-colors">
                  {architect.name}
                </h4>
                <div className="text-[12px] text-mutedText mt-0.5 font-light font-sans">
                  {architect.location}
                </div>
              </div>

              {/* Bottom stats and arrow */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-warm-border/60">
                <span className="text-[11px] font-medium text-charcoal/80">
                  {architect.projectsCount} Projects
                </span>

                <div className="w-6 h-6 rounded-full border border-warm-border bg-white flex items-center justify-center group-hover:bg-copper group-hover:border-copper transition-colors">
                  <ArrowRight className="w-3 h-3 text-charcoal group-hover:text-white" />
                </div>
              </div>
            </div>
          ))}

          {/* 5th Card: Join Community / Become a Seller CTA */}
          <div className="relative bg-[#201c1a] border border-charcoal/20 p-6 flex flex-col justify-between overflow-hidden group">
            {/* Background design studio image */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80"
                alt="Architecture Studio"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/80 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="text-[10px] tracking-widest uppercase text-copper-light mb-2">
                Join the Network
              </div>
              <h3 className="text-xl sm:text-2xl font-normal font-serif text-white leading-snug">
                Join a growing community of architects.
              </h3>
            </div>

            <div className="relative z-10 pt-6">
              <button
                onClick={onBecomeSeller}
                className="w-full py-3 px-4 bg-copper hover:bg-copper-hover text-white text-[13px] font-medium tracking-wide flex items-center justify-center gap-2 transition-all duration-200 shadow-sm"
              >
                <span>Become a Seller</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

