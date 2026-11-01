"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/authContext";
import TierSwitcherBar from "@/components/dashboard/TierSwitcherBar";
import SuperAdminView from "@/components/dashboard/SuperAdminView";
import AdminView from "@/components/dashboard/AdminView";
import ArchitectView from "@/components/dashboard/ArchitectView";
import HomeownerView from "@/components/dashboard/HomeownerView";

export default function UnifiedDashboard() {
  const { role, currentUser } = useAuth();

  return (
    <main className="min-h-screen bg-[#FBFBFA]">
      <Navbar />

      <div className="pt-28 pb-24 max-w-7xl mx-auto px-6 sm:px-8">
        {/* Universal 3-Tier Switcher Bar */}
        <TierSwitcherBar />

        {/* Dynamic Tier View */}
        {role === "super_admin" && <SuperAdminView />}

        {role === "admin" && <AdminView />}

        {role === "user" && (
          currentUser.subRole === "homeowner" ? <HomeownerView /> : <ArchitectView />
        )}
      </div>

      <Footer />
    </main>
  );
}
