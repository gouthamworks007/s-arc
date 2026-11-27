"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";

export default function PreFooterBanner() {
  return (
    <section className="relative bg-charcoal text-white overflow-hidden py-14 sm:py-18">
      {/* Background Architectural Atmosphere */}
      <div className="absolute inset-0 opacity-40">
        <Image
          src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80"
          alt="Residential living space backdrop"
          fill
          loading="lazy"
          className="object-cover object-center"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/60" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center justify-between">
          
          {/* Left: Typography */}
          <div className="lg:col-span-7">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal font-serif leading-[1.08] tracking-[-0.01em] mb-4 sm:mb-5">
              Design <br />
              Build <br />
              Belong.
            </h2>
            <p className="text-[16px] text-white/70 font-light font-sans tracking-wide max-w-md">
              Exceptional design. Real places. Better living.
            </p>
          </div>

          {/* Right: Quick Action Links */}
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

            <a
              href="https://wa.me/919446077889?text=Hi%20S-ARC%2C%20I%20would%20like%20help%20choosing%20a%20house%20plan%20for%20my%20plot."
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-6 py-4 border border-emerald-400/35 bg-emerald-500/10 backdrop-blur-md hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-300 group rounded-2xl"
            >
              <span className="text-[14px] font-medium tracking-wide flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-300 group-hover:text-white" />
                <span>Talk on WhatsApp</span>
              </span>
              <div className="w-7 h-7 rounded-full border border-emerald-300/40 flex items-center justify-center group-hover:border-white group-hover:bg-white group-hover:text-emerald-700 transition-colors">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}

