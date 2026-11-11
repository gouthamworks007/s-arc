"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/authContext";
import TierSwitcherBar from "@/components/dashboard/TierSwitcherBar";
import AdminView from "@/components/dashboard/AdminView";
import ArchitectView from "@/components/dashboard/ArchitectView";
import HomeownerView from "@/components/dashboard/HomeownerView";
import { Lock, ShieldCheck, Key } from "lucide-react";

export default function UnifiedDashboard() {
  const { role, currentUser, isLoggedIn } = useAuth();

  // Route Guard: Dashboard is strictly accessible using authorized accounts
  if (!isLoggedIn || !currentUser) {
    return (
      <main className="min-h-screen bg-[#FBFBFA] flex flex-col justify-between">
        <Navbar />

        <div className="pt-36 pb-28 max-w-lg mx-auto px-6 w-full text-center">
          <div className="bg-white border border-warm-border rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-copper/15 border border-copper/30 text-copper flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-8 h-8 text-copper" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-copper font-semibold">
                Protected Workspace
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif text-charcoal font-normal">
                Account Sign In Required
              </h1>
              <p className="text-xs sm:text-sm text-secondaryText font-sans leading-relaxed">
                The S-ARC Administration & Studio Dashboard is private and can only be accessed using an authorized account.
              </p>
            </div>

            {/* Admin Access Box */}
            <div className="p-4 rounded-2xl bg-stone-100/80 border border-stone-300 text-left space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-copper" />
                <span className="font-serif text-xs font-semibold text-charcoal">
                  Admin Credentials:
                </span>
              </div>
              <div className="text-xs font-mono text-charcoal space-y-1">
                <div>Email: <strong className="text-copper">admin@s-arc.in</strong></div>
                <div>Password: <strong className="text-copper">admin123</strong></div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-center">
              <Link
                href="/login"
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-charcoal hover:bg-copper text-white text-xs font-medium tracking-wide flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Key className="w-3.5 h-3.5 text-copper-light" />
                <span>Sign In to Dashboard</span>
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-warm-border hover:bg-warm-grey text-xs font-medium text-secondaryText transition-all"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FBFBFA]">
      <Navbar />

      <div className="pt-28 pb-24 max-w-7xl mx-auto px-6 sm:px-8">
        {/* Role Switcher Bar */}
        <TierSwitcherBar />

        {/* Dynamic Role View */}
        {role === "admin" && <AdminView />}

        {role === "user" && (
          currentUser.subRole === "architect" ? <ArchitectView /> : <HomeownerView />
        )}
      </div>

      <Footer />
    </main>
  );
}
