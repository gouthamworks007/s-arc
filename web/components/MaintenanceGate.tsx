"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import MaintenanceScreen from "@/components/MaintenanceScreen";
import { ShieldAlert } from "lucide-react";

export default function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { settings, currentUser } = useAuth();

  // If the user is on the dedicated maintenance route, show the maintenance screen
  if (pathname === "/maintenance") {
    return <MaintenanceScreen />;
  }

  // Paths that must always remain accessible (staff login, authentication, admin dashboard)
  const isBypassPath = 
    pathname?.startsWith("/login") || 
    pathname?.startsWith("/signup") || 
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/api");

  // If platform maintenance mode is enabled
  if (settings.maintenanceMode) {
    // Admins get to browse the site with an administrative notice badge
    if (currentUser?.role === "admin") {
      return (
        <>
          <div className="bg-amber-600 text-white text-xs font-mono py-2 px-4 flex items-center justify-between sticky top-0 z-[9999] shadow-md">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-200" />
              <span>
                <strong>MAINTENANCE MODE ACTIVE:</strong> Public visitors are seeing the construction screen. You have admin bypass privileges.
              </span>
            </div>
            <a 
              href="/dashboard" 
              className="underline hover:text-amber-100 text-[11px]"
            >
              Manage Settings in Admin Dashboard →
            </a>
          </div>
          {children}
        </>
      );
    }

    // Allow staff/admin paths through
    if (isBypassPath) {
      return <>{children}</>;
    }

    // All public visitors see the animated maintenance screen
    return <MaintenanceScreen />;
  }

  // Normal public browsing
  return <>{children}</>;
}
