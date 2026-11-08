"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, ArrowRight, Bookmark, Key, LogOut, User } from "lucide-react";
import { useSavedProjects } from "@/lib/savedProjectsContext";
import { useAuth } from "@/lib/authContext";

interface NavbarProps {
  onOpenSellerModal?: () => void;
  onOpenSearch?: () => void;
}

export default function Navbar({ onOpenSellerModal, onOpenSearch }: NavbarProps) {
  const pathname = usePathname();
  const { savedProjects, setIsCompareOpen } = useSavedProjects();
  const { role, currentUser, isLoggedIn, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Public navigation: Dashboard is protected and accessible only with an account
  const navLinks = [
    { name: "Explore Designs", href: "/designs", active: pathname === "/designs" },
    { name: "Plot Intelligence", href: "/plot-intelligence", active: pathname === "/plot-intelligence", isNew: true },
    { name: "Styles", href: "/styles", active: pathname === "/styles" },
    { name: "Architects", href: "/architects", active: pathname === "/architects" },
    { name: "How It Works", href: "/how-it-works", active: pathname === "/how-it-works" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-warm-border/80 py-3 shadow-subtle"
          : "bg-white/90 backdrop-blur-sm border-b border-warm-border/40 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center group">
          <div className="relative h-9 w-[124px] sm:h-10 sm:w-[138px] flex items-center">
            <Image
              src="/logo.png"
              alt="S-ARC Southern Architecture"
              fill
              className="object-contain object-left transition-opacity group-hover:opacity-85"
              priority
            />
          </div>
        </Link>

        {/* Center Navigation Links with Active State */}
        <nav className="hidden md:flex items-center space-x-7 text-[13px] tracking-wide font-medium font-sans">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`py-1 relative group transition-colors flex items-center ${
                link.active ? "text-copper font-semibold" : "text-charcoal/80 hover:text-copper"
              }`}
            >
              <span>{link.name}</span>
              {link.isNew && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] bg-copper-subtle text-copper font-mono uppercase font-bold border border-copper/30">
                  GIS
                </span>
              )}
              <span
                className={`absolute bottom-0 left-0 h-[1.5px] bg-copper transition-all duration-300 ${
                  link.active ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center space-x-5 text-[13px] font-sans">
          <button
            onClick={onOpenSearch}
            aria-label="Search designs"
            className="text-charcoal/70 hover:text-charcoal p-1.5 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Shortlist Badge Trigger */}
          <button
            onClick={() => setIsCompareOpen(true)}
            className="relative text-charcoal/70 hover:text-charcoal p-1.5 transition-colors"
            title="View shortlisted designs"
          >
            <Bookmark className="w-4 h-4" />
            {savedProjects.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-copper text-white text-[9px] font-bold flex items-center justify-center font-mono">
                {savedProjects.length}
              </span>
            )}
          </button>

          {/* Account Authentication or Dashboard Action */}
          {isLoggedIn && currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium flex items-center gap-2 transition-all shadow-sm ${
                  role === "admin"
                    ? "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
                    : "bg-warm-grey text-charcoal border border-warm-border hover:border-copper"
                }`}
                title="Open Private Dashboard"
              >
                <span className={`w-2 h-2 rounded-full ${
                  role === "admin" ? "bg-amber-500" : "bg-copper"
                }`} />
                <span>
                  {role === "admin"
                    ? "Admin"
                    : currentUser.subRole === "homeowner"
                    ? "Client"
                    : "Architect"}
                </span>
              </Link>

              <button
                onClick={logout}
                className="p-1.5 rounded-full text-secondaryText hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-full border border-warm-border text-xs font-sans font-medium text-charcoal hover:border-copper hover:text-copper transition-all flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5 text-copper" />
              <span>Sign In</span>
            </Link>
          )}

          <Link
            href="/designs"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-copper hover:bg-copper-hover text-white font-medium text-[13px] tracking-wide rounded-full transition-all duration-200 shadow-sm"
          >
            <span>Start Exploring</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={() => setIsCompareOpen(true)}
            className="relative text-charcoal p-1.5"
            aria-label="Shortlist"
          >
            <Bookmark className="w-4 h-4" />
            {savedProjects.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-copper text-white text-[9px] font-bold flex items-center justify-center font-mono">
                {savedProjects.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-charcoal p-1.5"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-warm-border px-6 py-6 shadow-lg animate-fadeIn font-sans rounded-b-2xl">
          <div className="flex flex-col space-y-4 text-sm font-medium text-charcoal">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-1 transition-colors flex items-center justify-between ${
                  link.active ? "text-copper font-semibold" : "hover:text-copper"
                }`}
              >
                <span>{link.name}</span>
                {link.isNew && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] bg-copper-subtle text-copper font-mono uppercase font-bold border border-copper/30">
                    GIS Tool
                  </span>
                )}
              </Link>
            ))}

            <div className="pt-4 border-t border-warm-border flex flex-col gap-3">
              {isLoggedIn && currentUser ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 px-3 bg-warm-grey rounded-xl text-charcoal font-medium text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${role === "admin" ? "bg-copper" : "bg-charcoal"}`} />
                      <span>{currentUser.name} ({role === "admin" ? "Admin" : "User"})</span>
                    </div>
                    <span className="font-mono text-copper text-[11px]">Dashboard →</span>
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-1.5 px-1 text-xs text-red-600 font-sans flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out of Account</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs py-1">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-charcoal font-medium hover:text-copper flex items-center gap-1"
                  >
                    <Key className="w-3.5 h-3.5 text-copper" />
                    <span>Sign In</span>
                  </Link>
                  <span className="text-warm-border">•</span>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-copper font-medium hover:underline"
                  >
                    Create Account
                  </Link>
                </div>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenSellerModal) onOpenSellerModal();
                }}
                className="w-full text-left py-2 text-sm text-copper font-medium"
              >
                Become an Architect Seller →
              </button>
              <Link
                href="/designs"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-copper text-white text-sm font-medium rounded-full"
              >
                <span>Start Exploring</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
