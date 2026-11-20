"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, MapPin, Bookmark, User, Globe } from "lucide-react";
import { useSavedProjects } from "@/lib/savedProjectsContext";
import { useAuth } from "@/lib/authContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { savedProjects, setIsCompareOpen } = useSavedProjects();
  const { isLoggedIn, currentUser, role } = useAuth();

  // Jakob's Law: On design detail pages (/designs/[id]), hide tab bar so sticky purchase/consult action has 100% focus (Airbnb listing pattern)
  const isProjectDetail = pathname.startsWith("/designs/") && pathname.split("/").length > 2;
  if (isProjectDetail) return null;

  // Jakob's Law: 5 primary thumb-zone destinations matching industry standards (Airbnb, Instagram, YouTube)
  const isHome = pathname === "/";
  const isDesigns = pathname.startsWith("/designs");
  const isPlot = pathname.startsWith("/plot-my-land") || pathname.startsWith("/plot-intelligence");
  const isAccount = pathname.startsWith("/dashboard") || pathname.startsWith("/login") || pathname.startsWith("/signup");

  const savedCount = savedProjects.length;

  return (
    <aside 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-warm-border/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <nav className="flex items-center justify-around max-w-md mx-auto">
        
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all duration-200 group ${
            isHome ? "text-copper" : "text-charcoal/60 hover:text-charcoal"
          }`}
        >
          <div className="relative p-1">
            <Home className={`w-5 h-5 transition-transform duration-200 ${isHome ? "scale-110" : "group-hover:scale-105"}`} />
            {isHome && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-copper" />
            )}
          </div>
          <span className={`text-[10px] font-sans font-medium tracking-tight mt-0.5 ${isHome ? "font-semibold" : ""}`}>
            Home
          </span>
        </Link>

        {/* 2. Explore Designs */}
        <Link
          href="/designs"
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all duration-200 group ${
            isDesigns ? "text-copper" : "text-charcoal/60 hover:text-charcoal"
          }`}
        >
          <div className="relative p-1">
            <Compass className={`w-5 h-5 transition-transform duration-200 ${isDesigns ? "scale-110" : "group-hover:scale-105"}`} />
            {isDesigns && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-copper" />
            )}
          </div>
          <span className={`text-[10px] font-sans font-medium tracking-tight mt-0.5 ${isDesigns ? "font-semibold" : ""}`}>
            Designs
          </span>
        </Link>

        {/* 3. My Plot (Center Hero Tab) */}
        <Link
          href="/plot-my-land"
          className={`flex flex-col items-center justify-center min-w-[62px] py-1 transition-all duration-200 group ${
            isPlot ? "text-copper" : "text-charcoal/70 hover:text-charcoal"
          }`}
        >
          <div className="relative">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-200 ${
              isPlot 
                ? "bg-copper text-white shadow-md shadow-copper/30 scale-105" 
                : "bg-warm-grey border border-warm-border text-charcoal group-hover:border-copper"
            }`}>
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <span className={`text-[10px] font-sans font-medium tracking-tight mt-0.5 ${isPlot ? "text-copper font-semibold" : ""}`}>
            My Plot
          </span>
        </Link>

        {/* 4. Shortlist (Opens Compare Modal with live badge) */}
        <button
          onClick={() => setIsCompareOpen(true)}
          className="flex flex-col items-center justify-center min-w-[56px] py-1 text-charcoal/60 hover:text-charcoal transition-all duration-200 group relative"
          aria-label={`View Shortlist (${savedCount} designs)`}
        >
          <div className="relative p-1">
            <Bookmark className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-copper text-white text-[9px] font-bold font-mono flex items-center justify-center animate-scaleIn shadow-sm">
                {savedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-sans font-medium tracking-tight mt-0.5">
            Shortlist
          </span>
        </button>

        {/* 5. Account / Sign In */}
        <Link
          href={isLoggedIn ? "/dashboard" : "/login"}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all duration-200 group ${
            isAccount ? "text-copper" : "text-charcoal/60 hover:text-charcoal"
          }`}
        >
          <div className="relative p-1">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              isLoggedIn ? "ring-1 ring-copper/60" : ""
            }`}>
              <User className={`w-5 h-5 transition-transform duration-200 ${isAccount ? "scale-110" : "group-hover:scale-105"}`} />
            </div>
            {isLoggedIn && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
            )}
            {isAccount && !isLoggedIn && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-copper" />
            )}
          </div>
          <span className={`text-[10px] font-sans font-medium tracking-tight mt-0.5 ${isAccount ? "font-semibold" : ""}`}>
            {isLoggedIn ? (role === "admin" ? "Admin" : "Account") : "Sign In"}
          </span>
        </Link>

      </nav>
    </aside>
  );
}
