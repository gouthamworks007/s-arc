"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail, MessageSquare } from "lucide-react";

interface FooterProps {
  onOpenSellerModal?: () => void;
}

export default function Footer({ onOpenSellerModal }: FooterProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Subscription failed.");
      }
      setSubscribed(true);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-charcoal text-white pt-12 sm:pt-14 pb-10 border-t border-charcoal-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-10 sm:pb-12 border-b border-white/10">
          
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

            {/* Direct Studio Contact */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <a
                href="https://wa.me/919446077889?text=Hi%20S-ARC%2C%20I%20would%20like%20to%20enquire%20about%20a%20house%20design."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-400/35 text-emerald-300 hover:bg-emerald-400/10 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Studio</span>
              </a>
              <a
                href="mailto:contact@southernarchitecture.in"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-white/75 hover:text-white hover:border-white/40 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
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
                <Link href="/plot-intelligence" className="hover:text-copper transition-colors">
                  Plot Intelligence &amp; KMBR
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
                <Link href="/#inspiration" className="hover:text-copper transition-colors">
                  House Typologies
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Platform (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-[12px] uppercase tracking-widestExtra text-white font-medium mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-[13px] text-white/65">
              <li>
                {onOpenSellerModal ? (
                  <button
                    type="button"
                    onClick={onOpenSellerModal}
                    className="hover:text-copper transition-colors text-left"
                  >
                    Become a Seller
                  </button>
                ) : (
                  <Link href="/signup?role=architect" className="hover:text-copper transition-colors">
                    Become a Seller
                  </Link>
                )}
              </li>
              <li>
                <Link href="/faq" className="hover:text-copper transition-colors">
                  Help Centre &amp; FAQs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-copper transition-colors">
                  Contact Advisory
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-copper transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-copper transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Legal & Licensing (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-[12px] uppercase tracking-widestExtra text-white font-medium mb-4">
              Policies
            </h4>
            <ul className="space-y-2.5 text-[13px] text-white/65">
              <li>
                <Link href="/licensing" className="hover:text-copper transition-colors">
                  Blueprint Licensing
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-copper transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-copper transition-colors">
                  Privacy Policy (DPDP)
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-copper transition-colors">
                  Refund Policy
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
              <div className="space-y-2">
                <form onSubmit={handleSubscribe} className="flex">
                  <label htmlFor="footer-newsletter-email" className="sr-only">
                    Email address for design updates
                  </label>
                  <input
                    id="footer-newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    aria-label="Email address for design updates"
                    required
                    disabled={isSubmitting}
                    className="bg-white/10 border border-white/20 text-white placeholder-white/40 text-[12px] px-3 py-2 w-full outline-none focus:border-copper disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to newsletter"
                    disabled={isSubmitting}
                    className="bg-copper hover:bg-copper-hover px-3 flex items-center justify-center text-white transition-colors disabled:opacity-50 text-[11px] font-medium"
                  >
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="sr-only">Subscribe</span>
                  </button>
                </form>
                {error && (
                  <p className="text-[11px] text-red-300 font-sans">{error}</p>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Bottom Bar with Geo Authority & Sitemap */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-white/50 gap-4 border-t border-white/10 mt-2">
          <div>
            © 2026 S-ARC — Southern Architecture. Curated for Kerala (KMBR 2019), Tamil Nadu, and Karnataka.
          </div>

          <div className="flex items-center space-x-6">
            <span className="text-white/40 hidden sm:inline">Kochi • Trivandrum • Calicut • Thrissur • Bangalore</span>
            <Link href="/sitemap.xml" className="hover:text-white transition-colors">
              Sitemap
            </Link>
            <Link href="/designs" className="hover:text-white transition-colors">
              Catalog
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

