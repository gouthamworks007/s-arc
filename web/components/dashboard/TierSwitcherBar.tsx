"use client";

import React from "react";
import Image from "next/image";
import { useAuth } from "@/lib/authContext";
import { ShieldCheck, User, Home, LogOut } from "lucide-react";

export default function TierSwitcherBar() {
  const { currentUser, role, switchRole, logout } = useAuth();

  if (!currentUser) return null;

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
                role === "admin"
                  ? "bg-copper text-white"
                  : "bg-white/20 text-white"
              }`}>
                {role === "admin" ? "Platform Admin" : `User (${currentUser.subRole || "client"})`}
              </span>
            </div>
            <div className="text-xs text-white/60 font-sans mt-0.5">
              {currentUser.email} • {currentUser.location || "South India"}
            </div>
          </div>
        </div>

        {/* Role Switcher Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest hidden sm:inline mr-1">
            Demo Persona:
          </span>

          {/* Admin Workspace */}
          <button
            onClick={() => switchRole("admin")}
            className={`px-3.5 py-2 rounded-2xl text-xs font-sans font-medium flex items-center gap-2 transition-all shrink-0 ${
              role === "admin"
                ? "bg-copper text-white font-semibold shadow-md scale-102"
                : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-copper-light" />
            <span>Admin Workspace</span>
          </button>

          {/* Architect Studio */}
          <button
            onClick={() => switchRole("user", "architect")}
            className={`px-3.5 py-2 rounded-2xl text-xs font-sans font-medium flex items-center gap-2 transition-all shrink-0 ${
              role === "user" && currentUser.subRole === "architect"
                ? "bg-white text-charcoal font-semibold shadow-md scale-102"
                : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5 text-copper-light" />
            <span>Architect Studio</span>
          </button>

          {/* Homeowner Client */}
          <button
            onClick={() => switchRole("user", "homeowner")}
            className={`px-3.5 py-2 rounded-2xl text-xs font-sans font-medium flex items-center gap-2 transition-all shrink-0 ${
              role === "user" && currentUser.subRole === "homeowner"
                ? "bg-white text-charcoal font-semibold shadow-md scale-102"
                : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
            }`}
          >
            <Home className="w-3.5 h-3.5 text-stone-400" />
            <span>Homeowner Client</span>
          </button>

          {/* Sign Out Button */}
          <button
            onClick={logout}
            className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-red-500/20 text-white/80 hover:text-red-300 text-xs font-sans font-medium flex items-center gap-1.5 transition-all shrink-0 border border-white/10 hover:border-red-400/40 ml-1"
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
