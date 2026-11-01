"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Bed, Layers, Maximize, MapPin } from "lucide-react";
import { ArchitecturalProject } from "@/lib/types";

interface FeaturedDesignsProps {
  projects: ArchitecturalProject[];
  onSelectProject: (project: ArchitecturalProject) => void;
}

export default function FeaturedDesigns({ projects, onSelectProject }: FeaturedDesignsProps) {
  // Main featured card (The Ridge House)
  const heroProject = projects.find((p) => p.id === "ridge-house") || projects[0];

  // Right column stacked cards
  const secondaryProjects = [
    projects.find((p) => p.id === "kerala-courtyard") || projects[1],
    projects.find((p) => p.id === "the-green-nest") || projects[2],
    projects.find((p) => p.id === "the-linear-home") || projects[3],
  ].filter(Boolean) as ArchitecturalProject[];

  return (
    <section id="explore" className="py-20 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-normal font-serif tracking-[-0.01em] text-charcoal mb-3">
              Featured Architectural Designs
            </h2>
            <p className="text-[15px] leading-relaxed text-secondaryText max-w-xl font-light font-sans">
              A selection of homes designed for different lifestyles, land sizes and architectural preferences.
            </p>
          </div>

          <a
            href="#explore-styles"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-charcoal hover:text-copper transition-colors group shrink-0"
          >
            <span>View All Designs</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Designs Showcase Grid matching design.png */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* Main Large Hero Card (Left) */}
          <div
            onClick={() => onSelectProject(heroProject)}
            className="lg:col-span-8 group cursor-pointer relative bg-charcoal overflow-hidden min-h-[440px] sm:min-h-[520px] flex flex-col justify-end p-6 sm:p-10"
          >
            <Image
              src={heroProject.image}
              alt={heroProject.name}
              fill
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 65vw"
            />
            {/* Gradient overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

            {/* Content overlay */}
            <div className="relative z-10">
              <div className="text-[10px] tracking-widestExtra text-white/70 uppercase mb-2">
                {heroProject.style}
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-normal font-serif text-white mb-4 tracking-[-0.01em]">
                {heroProject.name}
              </h3>

              {/* Specifications Pills (Space Grotesk 500) */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] sm:text-[13px] text-white/90 font-medium font-sans">
                <span className="flex items-center gap-1.5">
                  <Maximize className="w-3.5 h-3.5 text-copper-light" />
                  {heroProject.plotSize}
                </span>
                <span className="text-white/30">•</span>
                <span className="flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5 text-copper-light" />
                  {heroProject.bedrooms} Bed
                </span>
                <span className="text-white/30">•</span>
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-copper-light" />
                  {heroProject.floors} Floors
                </span>
                <span className="text-white/30">•</span>
                <span>{heroProject.builtUpArea}</span>
              </div>
            </div>

            {/* Circular Arrow Button overlay in corner */}
            <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 z-10 w-11 h-11 rounded-full bg-white text-charcoal flex items-center justify-center transition-all duration-300 group-hover:bg-copper group-hover:text-white group-hover:scale-110 shadow-lg">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Right Column: 3 Stacked Cards */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-5">
            {secondaryProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="group cursor-pointer relative bg-charcoal overflow-hidden h-[160px] sm:h-[164px] flex flex-col justify-end p-5"
              >
                <Image
                  src={project.image}
                  alt={project.name}
                  fill
                  className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 35vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent pointer-events-none" />

                <div className="relative z-10 pr-10">
                  <div className="text-[9px] tracking-widestExtra text-white/70 uppercase mb-1">
                    {project.style}
                  </div>
                  <h4 className="text-base sm:text-lg font-normal text-white tracking-tight">
                    {project.name}
                  </h4>
                </div>

                {/* Circular Arrow Button */}
                <div className="absolute bottom-4 right-4 z-10 w-8 h-8 rounded-full border border-white/30 bg-black/30 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-300 group-hover:bg-copper group-hover:border-copper group-hover:scale-110">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

