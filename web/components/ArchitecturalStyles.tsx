"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ArchitecturalStyle } from "@/lib/types";

interface ArchitecturalStylesProps {
  styles: ArchitecturalStyle[];
  onSelectStyle: (styleName: string) => void;
}

export default function ArchitecturalStyles({ styles, onSelectStyle }: ArchitecturalStylesProps) {
  return (
    <section id="explore-styles" className="py-20 sm:py-24 bg-warm-grey border-b border-warm-border">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="mb-12 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-normal font-serif tracking-[-0.01em] text-charcoal mb-3">
            Find Your Architectural Language.
          </h2>
          <p className="text-[15px] leading-relaxed text-secondaryText max-w-xl font-light font-sans">
            Explore designs based on your preferred architectural style and regional environmental response.
          </p>
        </div>

        {/* 6 Grid Cards matching design.png */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {styles.map((style) => (
            <div
              key={style.id}
              onClick={() => onSelectStyle(style.name)}
              className="group cursor-pointer relative bg-charcoal overflow-hidden aspect-[3/5] sm:aspect-[2/3.5] flex flex-col justify-end p-4 transition-all duration-300 shadow-sm hover:shadow-card"
            >
              <Image
                src={style.image}
                alt={style.name}
                fill
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />
              {/* Subtle darkened gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between gap-1">
                <span className="text-white text-[13px] sm:text-[14px] font-medium tracking-tight group-hover:text-copper-light transition-colors">
                  {style.name}
                </span>

                <div className="w-6 h-6 rounded-full border border-white/30 bg-black/20 flex items-center justify-center shrink-0 group-hover:bg-copper group-hover:border-copper transition-all duration-200">
                  <ArrowRight className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

