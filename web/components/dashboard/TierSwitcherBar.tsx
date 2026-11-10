"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { 
  ShieldCheck, 
  Building, 
  Home, 
  LogOut, 
  MapPin, 
  Layers, 
  Phone, 
  Mail, 
  Calendar,
  Compass
} from "lucide-react";

export default function TierSwitcherBar() {
  const { currentUser, role, logout } = useAuth();

  if (!currentUser) return null;

  const isArchitect = role === "user" && currentUser.subRole === "architect";
  const isHomeowner = role === "user" && (currentUser.subRole === "homeowner" || !currentUser.subRole);
  const isAdmin = role === "admin";

  return (
    <div className="bg-charcoal text-white rounded-3xl p-5 sm:p-7 mb-8 shadow-xl border border-white/10 relative overflow-hidden">
      {/* Subtle warm ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-copper/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Left: User Account Identity */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-copper bg-white/10 shrink-0 shadow-md">
            {currentUser.avatar ? (
              <Image 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                fill 
                className="object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-serif text-2xl text-copper font-medium">
                {currentUser.name ? currentUser.name.charAt(0) : "U"}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-serif text-xl sm:text-2xl text-white font-normal">
                {currentUser.name}
              </h1>

              {/* Account Role Badge */}
              {isAdmin && (
                <span className="px-3 py-0.5 rounded-full text-[11px] font-mono tracking-wider font-semibold uppercase bg-copper text-white flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-copper-light" />
                  <span>Platform Administrator</span>
                </span>
              )}

              {isArchitect && (
                <span className="px-3 py-0.5 rounded-full text-[11px] font-mono tracking-wider font-semibold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5 shadow-sm">
                  <Building className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{currentUser.studioName ? `${currentUser.studioName}` : "Architect Studio"}</span>
                </span>
              )}

              {isHomeowner && (
                <span className="px-3 py-0.5 rounded-full text-[11px] font-mono tracking-wider font-semibold uppercase bg-copper/20 text-copper-light border border-copper/40 flex items-center gap-1.5 shadow-sm">
                  <Home className="w-3.5 h-3.5 text-copper" />
                  <span>Landowner & Client Account</span>
                </span>
              )}

              {currentUser.status === "pending_verification" && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  Verification Pending
                </span>
              )}
            </div>

            {/* Account Metadata Row */}
            <div className="flex items-center gap-y-1 gap-x-4 flex-wrap text-xs text-white/70 font-sans">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-copper/80" />
                <span>{currentUser.email}</span>
              </span>

              {currentUser.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-copper/80" />
                  <span>{currentUser.phone}</span>
                </span>
              )}

              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-copper/80" />
                <span>{currentUser.location || "South India"}</span>
              </span>

              {currentUser.joinedDate && (
                <span className="flex items-center gap-1.5 text-white/50">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined {currentUser.joinedDate}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Account Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Landowner & Client Actions */}
          {isHomeowner && (
            <>
              <Link
                href="/plot-intelligence"
                className="px-4 py-2.5 rounded-2xl bg-copper hover:bg-copper-hover text-white text-xs font-sans font-medium flex items-center gap-2 transition-all shadow-md group shrink-0"
              >
                <Compass className="w-4 h-4 text-white group-hover:rotate-45 transition-transform" />
                <span>Plot Intelligence (GIS)</span>
              </Link>

              <Link
                href="/designs"
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-sans font-medium flex items-center gap-2 transition-all shrink-0 border border-white/10"
              >
                <Layers className="w-3.5 h-3.5 text-copper-light" />
                <span>Browse 500+ Plans</span>
              </Link>
            </>
          )}

          {/* Architect Studio Actions */}
          {isArchitect && (
            <Link
              href="/designs"
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-sans font-medium flex items-center gap-2 transition-all shrink-0 border border-white/10"
            >
              <Layers className="w-3.5 h-3.5 text-copper-light" />
              <span>Public Marketplace</span>
            </Link>
          )}

          {/* Sign Out Button */}
          <button
            onClick={logout}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-red-500/20 text-white/80 hover:text-red-300 text-xs font-sans font-medium flex items-center gap-2 transition-all shrink-0 border border-white/10 hover:border-red-400/40"
            title="Sign Out of Account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
