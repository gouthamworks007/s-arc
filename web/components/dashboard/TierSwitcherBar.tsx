"use client";

import React from "react";
import Image from "next/image";
import { useAuth } from "@/lib/authContext";
import { Crown, Shield, User, Home, Sparkles } from "lucide-react";

export default function TierSwitcherBar() {
  const { currentUser, role, switchRole, switchUser, users } = useAuth();

  return (
    <div className="bg-charcoal text-white rounded-3xl p-4 sm:p-5 mb-8 shadow-xl border border-white/10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Current Active Persona */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-copper bg-white/10 shrink-0">
            <Image src={currentUser.avatar} alt={currentUser.name} fill className="object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-serif text-lg text-white font-normal">{currentUser.name}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold uppercase ${
                role === "super_admin"
                  ? "bg-amber-400 text-charcoal"
                  : role === "admin"
                  ? "bg-sky-400 text-charcoal"
                  : "bg-copper text-white"
              }`}>
                {role === "super_admin" ? "Super Admin" : role === "admin" ? "Platform Admin" : `User (${currentUser.subRole || "client"})`}
              </span>
            </div>
            <div className="text-xs text-white/60 font-sans mt-0.5">
              {currentUser.email} • {currentUser.location || "South India"}
            </div>
          </div>
        </div>

        {/* Tier Switcher Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest hidden sm:inline mr-1">
            Switch Tier:
          </span>

          {/* Super Admin Pill */}
          <button
            onClick={() => switchRole("super_admin")}
            className={`px-3.5 py-2 rounded-2xl text-xs font-sans font-medium flex items-center gap-2 transition-all shrink-0 ${
              role === "super_admin"
                ? "bg-amber-400 text-charcoal font-semibold shadow-md scale-102"
                : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>Tier 1: Super Admin</span>
          </button>

          {/* Admin Pill */}
          <button
            onClick={() => switchRole("admin")}
            className={`px-3.5 py-2 rounded-2xl text-xs font-sans font-medium flex items-center gap-2 transition-all shrink-0 ${
              role === "admin"
                ? "bg-sky-400 text-charcoal font-semibold shadow-md scale-102"
                : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>Tier 2: Admin</span>
          </button>

          {/* User (Architect) Pill */}
          <button
            onClick={() => switchRole("user", "architect")}
            className={`px-3.5 py-2 rounded-2xl text-xs font-sans font-medium flex items-center gap-2 transition-all shrink-0 ${
              role === "user" && currentUser.subRole === "architect"
                ? "bg-copper text-white font-semibold shadow-md scale-102"
                : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5 text-copper-light" />
            <span>Tier 3: Architect</span>
          </button>

          {/* User (Homeowner) Pill */}
          <button
            onClick={() => switchRole("user", "homeowner")}
            className={`px-3.5 py-2 rounded-2xl text-xs font-sans font-medium flex items-center gap-2 transition-all shrink-0 ${
              role === "user" && currentUser.subRole === "homeowner"
                ? "bg-white text-charcoal font-semibold shadow-md scale-102"
                : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
            }`}
          >
            <Home className="w-3.5 h-3.5 text-secondaryText" />
            <span>Tier 3: Homeowner</span>
          </button>
        </div>
      </div>
    </div>
  );
}

