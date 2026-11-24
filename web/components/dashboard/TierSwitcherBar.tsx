"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { 
  ShieldCheck, 
  Building, 
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
    <div className="bg-charcoal text-white rounded-2xl px-5 py-3.5 mb-6 shadow-sm border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Left: Identity Pill */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/20 bg-stone-800 shrink-0 shadow-xs">
          {currentUser.avatar ? (
            <Image 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              fill 
              className="object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-serif text-lg text-copper-light font-medium">
              {currentUser.name ? currentUser.name.charAt(0) : "U"}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif text-base text-white font-medium truncate">
              {currentUser.name}
            </span>

            {/* Role Badge */}
            {isAdmin && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold uppercase bg-copper text-white flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3 h-3 text-copper-light" />
                <span>Admin</span>
              </span>
            )}

            {isArchitect && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <Building className="w-3 h-3 text-emerald-400" />
                <span>{currentUser.studioName || "Architect Studio"}</span>
              </span>
            )}

            {isHomeowner && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold uppercase bg-stone-800 text-stone-300 border border-stone-700">
                Homeowner
              </span>
            )}

            {currentUser.status === "pending_verification" && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-400/40">
                Pending Verification
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-stone-400 font-sans truncate">
            <span>{currentUser.email}</span>
            {currentUser.location && (
              <>
                <span className="text-stone-600">•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-copper" />
                  <span>{currentUser.location}</span>
                </span>
              </>
            )}
            {currentUser.coaNumber && (
              <>
                <span className="text-stone-600">•</span>
                <span className="font-mono text-copper-light">COA: {currentUser.coaNumber}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Clean Quick Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        {isHomeowner && (
          <Link
            href="/plot-my-land"
            className="px-3.5 py-1.5 rounded-xl bg-copper hover:bg-copper-hover text-white text-xs font-sans font-medium flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Plot My Land</span>
          </Link>
        )}

        <Link
          href="/designs"
          className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-sans font-medium flex items-center gap-1.5 transition-all border border-white/10"
        >
          <Layers className="w-3.5 h-3.5 text-copper-light" />
          <span>Marketplace</span>
        </Link>

        <button
          onClick={logout}
          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-stone-300 hover:text-red-300 text-xs font-sans font-medium flex items-center gap-1.5 transition-all border border-white/10 hover:border-red-400/30"
          title="Sign Out of Account"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
