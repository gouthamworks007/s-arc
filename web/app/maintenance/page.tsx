import React from "react";
import type { Metadata } from "next";
import MaintenanceScreen from "@/components/MaintenanceScreen";

export const metadata: Metadata = {
  title: "Under Structural Maintenance | S-ARC — Southern Architecture",
  description: "S-ARC is undergoing statutory structural and technical upgrades. Check back soon for KMBR 2019 verified blueprints, CAD packages, and leading South Indian architects.",
  robots: {
    index: false,
    follow: false
  }
};

export default function MaintenancePage() {
  return <MaintenanceScreen />;
}
