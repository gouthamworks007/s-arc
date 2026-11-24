"use client";

import React from "react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { VerificationBadge as BadgeType } from "@/lib/types";

interface VerificationBadgeProps {
  badge?: BadgeType;
  size?: "xs" | "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export default function VerificationBadge({
  badge = "none",
  size = "sm",
  showText = true,
  className = "",
}: VerificationBadgeProps) {
  if (!badge || badge === "none") return null;

  const isBlue = badge === "blue";

  // Blue Tick: COA Qualified Licensed Architect
  // Grey Tick: Platform-Vetted Freelancer (Activity Analyzed by Admin)
  const label = isBlue ? "COA Qualified" : "Vetted Freelancer";
  const fullTitle = isBlue
    ? "COA Verified Architect: Statutory Council of Architecture Registered"
    : "Platform-Vetted Freelance Architect: Portfolio & Activity Analyzed by Platform Admins";

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[9px] gap-1",
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  const iconSizes = {
    xs: "w-2.5 h-2.5",
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  const colorStyles = isBlue
    ? "bg-blue-50/90 text-blue-700 border-blue-200 hover:bg-blue-100/90 shadow-2xs"
    : "bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200/80 shadow-2xs";

  const iconColor = isBlue ? "text-blue-600 fill-blue-100" : "text-stone-500 fill-stone-200";

  return (
    <span
      className={`inline-flex items-center font-sans font-semibold rounded-full border transition-all cursor-help shrink-0 ${sizeClasses[size]} ${colorStyles} ${className}`}
      title={fullTitle}
      aria-label={label}
    >
      <ShieldCheck className={`${iconSizes[size]} ${iconColor} shrink-0`} />
      {showText && <span className="tracking-tight whitespace-nowrap">{label}</span>}
    </span>
  );
}
