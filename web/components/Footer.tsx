"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Instagram, Youtube, Linkedin, Pin, CheckCircle2 } from "lucide-react";

interface FooterProps {
  onOpenSellerModal?: () => void;
}

export default function Footer({ onOpenSellerModal }: FooterProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-charcoal text-white pt-20 pb-12 border-t border-charcoal-light">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-white/10">
          
          {/* Brand & Description (4 cols) */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-6">
              <div className="relative h-10 w-[138px]">
                <Image
                  src="/logo-white.png"
                  alt="S-ARC Southern Architecture"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>

            <p className="text-[13px] leading-relaxed text-white/60 mb-6 max-w-sm">
              A platform that connects people with exceptional architectural designs, created by professional architects across South India and beyond.
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-4 text-white/60">
              <a
                href="#instagram"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:text-white hover:border-white transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="#youtube"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:text-white hover:border-white transition-colors"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a
                href="#linkedin"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:text-white hover:border-white transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a
                href="#pinterest"
                aria-label="Pinterest"
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:text-white hover:border-white transition-colors"
              >
                <Pin className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Links Column 1: Explore (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-[12px] uppercase tracking-widestExtra text-white font-medium mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-[13px] text-white/65">
              <li>
                <Link href="/designs" className="hover:text-copper transition-colors">
                  Browse Designs
                </Link>
              </li>
              <li>
                <Link href="/styles" className="hover:text-copper transition-colors">
                  Architectural Styles
                </Link>
              </li>
              <li>
                <Link href="/architects" className="hover:text-copper transition-colors">
                  Featured Architects
                </Link>
              </li>
              <li>
                <Link href="/#search-section" className="hover:text-copper transition-colors">
                  Plot Size Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Company (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-[12px] uppercase tracking-widestExtra text-white font-medium mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-[13px] text-white/65">
              <li>
                <Link href="/#why-sarc" className="hover:text-copper transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-copper transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <button
                  onClick={onOpenSellerModal}
                  className="hover:text-copper transition-colors text-left"
                >
                  Become a Seller
                </button>
              </li>
              <li>
                <a href="#why-sarc" className="hover:text-copper transition-colors">
                  Our Story
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-copper transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Support (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-[12px] uppercase tracking-widestExtra text-white font-medium mb-4">
              Support
            </h4>
            <ul className="space-y-2.5 text-[13px] text-white/65">
              <li>
                <a href="#faq" className="hover:text-copper transition-colors">
                  Help Centre
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-copper transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-copper transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-copper transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-copper transition-colors">
                  Client / Architect Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-copper transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-copper transition-colors">
                  Licensing Information
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Stay Updated (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-[12px] uppercase tracking-widestExtra text-white font-medium mb-4">
              Stay Updated
            </h4>
            <p className="text-[13px] leading-relaxed text-white/65 mb-4">
              Get the latest designs and architecture insights.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-copper-light bg-copper/10 p-2.5 border border-copper/30">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-copper" />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="bg-white/10 border border-white/20 text-white placeholder-white/40 text-[12px] px-3 py-2 w-full outline-none focus:border-copper"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="bg-copper hover:bg-copper-hover px-3 flex items-center justify-center text-white transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar matching design.png */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/40 gap-4">
          <div>
            © 2026 S-ARC. All rights reserved.
          </div>

          <div className="flex items-center space-x-6">
            <a href="#sitemap" className="hover:text-white transition-colors">
              Sitemap
            </a>
            <a href="#licensing" className="hover:text-white transition-colors">
              Licensing Information
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}

