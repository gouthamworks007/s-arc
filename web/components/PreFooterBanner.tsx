"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PreFooterBanner() {
  return (
    <section className="relative bg-charcoal text-white overflow-hidden py-24 sm:py-28">
      {/* Background Architectural Atmosphere */}
      <div className="absolute inset-0 opacity-40">
        <Image
          src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2000&q=85"
          alt="Luxury Architecture Living Space"
          fill
          className="object-cover object-center"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/60" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center justify-between">
          
          {/* Left: Typography */}
          <div className="lg:col-span-7">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-normal font-serif leading-[1.08] tracking-[-0.01em] mb-5">
              Design <br />
              Build <br />
              Belong.
            </h2>
            <p className="text-[16px] text-white/70 font-light font-sans tracking-wide max-w-md">
              Exceptional design. Real places. Better living.
            </p>
          </div>

          {/* Right: Quick Action Links matching design.png */}
          <div className="lg:col-span-5 flex flex-col space-y-4 max-w-sm ml-auto w-full">
            <Link
              href="/designs"
              className="flex items-center justify-between px-6 py-4 border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white hover:text-charcoal hover:border-white transition-all duration-300 group rounded-2xl"
            >
              <span className="text-[14px] font-medium tracking-wide">Discover Designs</span>
              <div className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center group-hover:border-charcoal group-hover:bg-charcoal group-hover:text-white transition-colors">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/architects"
              className="flex items-center justify-between px-6 py-4 border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white hover:text-charcoal hover:border-white transition-all duration-300 group rounded-2xl"
            >
              <span className="text-[14px] font-medium tracking-wide">Find Architects</span>
              <div className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center group-hover:border-charcoal group-hover:bg-charcoal group-hover:text-white transition-colors">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/#inspiration"
              className="flex items-center justify-between px-6 py-4 border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white hover:text-charcoal hover:border-white transition-all duration-300 group rounded-2xl"
            >
              <span className="text-[14px] font-medium tracking-wide">Read Stories</span>
              <div className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center group-hover:border-charcoal group-hover:bg-charcoal group-hover:text-white transition-colors">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}

