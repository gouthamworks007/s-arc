"use client";

import React, { useRef } from "react";
import Image from "next/image";
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  MapPin,
  Calendar,
  Layers,
  Ruler,
  CheckCircle2,
} from "lucide-react";
import { PlanCompatibilityResult, PlotAnalysisData } from "@/lib/types";
import { getUnitBreakdown } from "@/lib/plot-measurements";

interface PlotReportModalProps {
  plotName: string;
  analysis: PlotAnalysisData;
  locationName: string;
  compatibilityResults: PlanCompatibilityResult[];
  onClose: () => void;
}

export default function PlotReportModal({
  plotName,
  analysis,
  locationName,
  compatibilityResults,
  onClose,
}: PlotReportModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const breakdown = getUnitBreakdown(analysis.areaCents);
  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handlePrint = () => {
    window.print();
  };

  const topPlans = compatibilityResults
    .filter((r) => r.category !== "not_suitable")
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white max-w-4xl w-full max-h-[92vh] overflow-y-auto rounded-3xl border border-warm-border shadow-2xl relative flex flex-col">
        {/* Sticky Control Bar (hidden in print) */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-warm-border z-30 px-6 py-4 flex items-center justify-between rounded-t-3xl print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-widestExtra uppercase text-copper font-semibold">
              S-ARC Plot Intelligence Dossier
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-copper text-white text-xs font-sans font-medium flex items-center gap-2 hover:bg-copper-dark transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-warm-border hover:bg-warm-grey flex items-center justify-center text-charcoal transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div
          ref={printAreaRef}
          className="p-8 sm:p-12 space-y-8 print:p-0 print:space-y-6 text-charcoal font-sans"
        >
          {/* Document Header with Logo and Brand */}
          <div className="flex items-start justify-between border-b-2 border-charcoal pb-6">
            <div>
              <div className="relative h-10 w-36 mb-2">
                <Image
                  src="/logo.png"
                  alt="S-ARC Southern Architecture"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
              <p className="text-xs text-charcoal/60 tracking-wide uppercase">
                Geospatial Land Telemetry & Architectural Planning Report
              </p>
            </div>

            <div className="text-right text-xs font-mono">
              <div className="font-bold text-charcoal">DOSSIER #{Date.now().toString().slice(-6)}</div>
              <div className="text-charcoal/60">{currentDate}</div>
              <div className="text-copper font-medium mt-1">Kerala GIS Calibration</div>
            </div>
          </div>

          {/* Property Identity Card */}
          <div className="bg-warm-card border border-warm-border rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-[10px] tracking-wider uppercase text-charcoal/50 font-semibold block mb-1">
                Property Designation
              </span>
              <h1 className="text-2xl font-serif text-charcoal font-normal">
                {plotName || "Measured Kerala Residential Plot"}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-charcoal/70 mt-2">
                <MapPin className="w-3.5 h-3.5 text-copper shrink-0" />
                <span>{locationName || "South India, Kerala"}</span>
              </div>
              <div className="text-[11px] font-mono text-charcoal/50 mt-1">
                Coordinates: {analysis.center[1].toFixed(5)}°N, {analysis.center[0].toFixed(5)}°E
              </div>
            </div>

            {/* Total Area Box */}
            <div className="bg-white rounded-xl p-4 border border-warm-border flex flex-col justify-center">
              <span className="text-[10px] tracking-wider uppercase text-copper font-semibold">
                Total Measured Area
              </span>
              <div className="text-3xl font-serif text-charcoal mt-1">
                {analysis.areaCents.toFixed(2)} Cents
              </div>
              <div className="text-xs font-mono text-charcoal/60 mt-1">
                {breakdown.sqft} ({breakdown.sqm})
              </div>
            </div>
          </div>

          {/* Comprehensive Kerala Land Unit Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-serif uppercase tracking-wider text-charcoal font-bold border-b border-warm-border pb-1">
              1. Kerala Land Survey Conversions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
              <div className="p-3 bg-warm-grey/60 rounded-xl border border-warm-border">
                <div className="text-[10px] text-charcoal/50">Cents</div>
                <div className="font-bold text-charcoal mt-0.5">{breakdown.cents}</div>
              </div>
              <div className="p-3 bg-warm-grey/60 rounded-xl border border-warm-border">
                <div className="text-[10px] text-charcoal/50">Square Feet</div>
                <div className="font-bold text-charcoal mt-0.5">{breakdown.sqft}</div>
              </div>
              <div className="p-3 bg-warm-grey/60 rounded-xl border border-warm-border">
                <div className="text-[10px] text-charcoal/50">Square Metres</div>
                <div className="font-bold text-charcoal mt-0.5">{breakdown.sqm}</div>
              </div>
              <div className="p-3 bg-warm-grey/60 rounded-xl border border-warm-border">
                <div className="text-[10px] text-charcoal/50">Acres</div>
                <div className="font-bold text-charcoal mt-0.5">{breakdown.acres}</div>
              </div>
              <div className="p-3 bg-warm-grey/60 rounded-xl border border-warm-border">
                <div className="text-[10px] text-charcoal/50">Hectares</div>
                <div className="font-bold text-charcoal mt-0.5">{breakdown.hectares}</div>
              </div>
            </div>
          </div>

          {/* Boundary Segments & Corner Coordinates */}
          <div className="space-y-3">
            <h3 className="text-sm font-serif uppercase tracking-wider text-charcoal font-bold border-b border-warm-border pb-1">
              2. Boundary Segments & Coordinates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Segments */}
              <div className="border border-warm-border rounded-xl overflow-hidden">
                <table className="w-full text-xs font-mono text-left">
                  <thead className="bg-warm-grey text-charcoal/60 text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Segment</th>
                      <th className="py-2 px-3">Length (ft)</th>
                      <th className="py-2 px-3">Length (m)</th>
                      <th className="py-2 px-3">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-border">
                    {analysis.segments.map((seg, i) => {
                      const isRoad = i === analysis.roadFacingSegmentIndex;
                      return (
                        <tr key={seg.label} className={isRoad ? "bg-amber-50" : ""}>
                          <td className="py-2 px-3 font-bold">{seg.label}</td>
                          <td className="py-2 px-3">{seg.lengthFeet.toFixed(1)} ft</td>
                          <td className="py-2 px-3">{seg.lengthMeters.toFixed(1)} m</td>
                          <td className="py-2 px-3">
                            {isRoad ? (
                              <span className="text-[10px] text-amber-800 font-bold">★ Road Frontage</span>
                            ) : (
                              <span className="text-charcoal/40">Side boundary</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Corners */}
              <div className="border border-warm-border rounded-xl overflow-hidden">
                <table className="w-full text-xs font-mono text-left">
                  <thead className="bg-warm-grey text-charcoal/60 text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Corner</th>
                      <th className="py-2 px-3">Latitude</th>
                      <th className="py-2 px-3">Longitude</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-border">
                    {analysis.corners.map((c) => (
                      <tr key={c.label}>
                        <td className="py-2 px-3 font-bold text-copper">{c.label}</td>
                        <td className="py-2 px-3">{c.coordinates[1].toFixed(6)}°N</td>
                        <td className="py-2 px-3">{c.coordinates[0].toFixed(6)}°E</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recommended Architectural Plans Summary */}
          {topPlans.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-serif uppercase tracking-wider text-charcoal font-bold border-b border-warm-border pb-1">
                3. Matched Architectural Designs (S-ARC Catalogue)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topPlans.map((plan) => (
                  <div
                    key={plan.project.id}
                    className="border border-warm-border rounded-xl p-4 space-y-2 bg-warm-card"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-serif text-sm font-bold text-charcoal">
                        {plan.project.name}
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                        {plan.score}% Match
                      </span>
                    </div>
                    <div className="text-[11px] text-charcoal/70 space-y-0.5 font-mono">
                      <div>Style: {plan.project.style}</div>
                      <div>BHK: {plan.project.bedrooms} Bedrooms</div>
                      <div>Built Area: {plan.project.builtUpArea}</div>
                      <div>Architect: {plan.project.architect.studio}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statutory Disclaimer as required in Section 13 */}
          <div className="border border-warm-border/80 bg-warm-grey/50 rounded-2xl p-4 text-[11px] leading-relaxed text-charcoal/70">
            <span className="font-bold text-charcoal block mb-1">
              LEGAL & PROFESSIONAL NOTICE:
            </span>
            Measurements are preliminary estimates derived from geographic imagery and user-selected boundary coordinates. They are not a substitute for an official land survey or professional site assessment. Building feasibility is subject to verification by qualified professionals and applicable local regulations (including Kerala Municipality Building Rules / Kerala Panchayat Building Rules).
          </div>

          {/* Signoff Footer */}
          <div className="pt-6 border-t border-warm-border flex items-center justify-between text-xs text-charcoal/50">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-copper" />
              <span>Certified S-ARC Architectural Portal</span>
            </div>
            <div>https://s-arc.pages.dev/plot-intelligence</div>
          </div>
        </div>
      </div>
    </div>
  );
}

