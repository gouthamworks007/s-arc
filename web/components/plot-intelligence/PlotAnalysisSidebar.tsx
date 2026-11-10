"use client";

import React, { useState } from "react";
import {
  Compass,
  Ruler,
  Maximize,
  Sliders,
  Bookmark,
  FileDown,
  ArrowRight,
  CheckCircle2,
  FolderHeart,
  ChevronDown,
  ChevronUp,
  Car,
  Home,
  Layers,
  Sparkles,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { formatArea, getUnitBreakdown } from "@/lib/plot-measurements";
import { KeralaLandUnit, PlotAnalysisData } from "@/lib/types";

interface PlotAnalysisSidebarProps {
  analysis: PlotAnalysisData | null;
  selectedUnit: KeralaLandUnit;
  onSelectUnit: (unit: KeralaLandUnit) => void;
  roadFacingIndex: number;
  onRoadFacingIndexChange: (idx: number) => void;
  userInputs: PlotAnalysisData["userInputs"];
  onUserInputsChange: (inputs: PlotAnalysisData["userInputs"]) => void;
  onMatchPlans: () => void;
  onSavePlot: () => void;
  onExportReport: () => void;
  onOpenSavedPlots: () => void;
  onLoadSamplePlot?: () => void;
  matchedCount: number;
  isLoggedIn: boolean;
}

export default function PlotAnalysisSidebar({
  analysis,
  selectedUnit,
  onSelectUnit,
  roadFacingIndex,
  onRoadFacingIndexChange,
  userInputs = {},
  onUserInputsChange,
  onMatchPlans,
  onSavePlot,
  onExportReport,
  onOpenSavedPlots,
  onLoadSamplePlot,
  matchedCount,
  isLoggedIn,
}: PlotAnalysisSidebarProps) {
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [showUnitConversions, setShowUnitConversions] = useState(false);

  if (!analysis) {
    return (
      <div className="bg-white rounded-3xl border border-warm-border p-6 shadow-card space-y-6 flex flex-col justify-between h-full">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-warm-border">
            <span className="text-[10px] tracking-widestExtra uppercase text-copper font-semibold">
              Plot Analysis
            </span>
            <button
              onClick={onOpenSavedPlots}
              className="text-xs font-sans font-medium text-charcoal/70 hover:text-copper flex items-center gap-1.5 transition-colors"
            >
              <FolderHeart className="w-3.5 h-3.5" />
              <span>Saved Plots</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-warm-card border border-warm-border text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-copper-subtle text-copper mx-auto flex items-center justify-center">
              <Ruler className="w-5 h-5" />
            </div>
            <h4 className="text-base font-serif text-charcoal">
              No Boundary Marked
            </h4>
            <p className="text-xs text-charcoal/60 font-sans leading-relaxed">
              Click anywhere on the satellite map to mark your property corners (Corner 1, Corner 2, Corner 3...), or search your location.
            </p>

            {onLoadSamplePlot && (
              <button
                onClick={onLoadSamplePlot}
                className="mt-3 w-full py-2.5 px-4 rounded-xl border border-copper/40 bg-copper-subtle text-copper text-xs font-sans font-medium hover:bg-copper hover:text-white transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Try Sample 11.8-Cent Plot</span>
              </button>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-warm-border text-[11px] text-charcoal/50 font-sans leading-relaxed">
          Measurements are computed directly from geographic coordinate geodesics calibrated to Kerala land survey standards.
        </div>
      </div>
    );
  }

  const breakdown = getUnitBreakdown(analysis.areaCents);

  const units: { key: KeralaLandUnit; label: string }[] = [
    { key: "cent", label: "Cents" },
    { key: "sqft", label: "Sq Ft" },
    { key: "sqm", label: "m²" },
    { key: "acre", label: "Acres" },
    { key: "hectare", label: "Ha" },
  ];

  const handleInputChange = (field: string, val: any) => {
    onUserInputsChange({
      ...userInputs,
      [field]: val,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-warm-border p-6 shadow-card space-y-6 flex flex-col justify-between h-full overflow-y-auto max-h-[calc(100vh-140px)]">
      <div className="space-y-6">
        {/* Header with Title and Saved Plots Link */}
        <div className="flex items-center justify-between pb-3 border-b border-warm-border">
          <div>
            <span className="text-[10px] tracking-widestExtra uppercase text-copper font-semibold">
              Plot Analysis
            </span>
            <h3 className="text-xl font-serif text-charcoal font-normal">
              Measured Property
            </h3>
          </div>

          <button
            onClick={onOpenSavedPlots}
            className="text-xs font-sans font-medium text-charcoal/70 hover:text-copper flex items-center gap-1.5 transition-colors p-1.5 rounded-lg hover:bg-warm-grey"
            title="Open saved plots"
          >
            <FolderHeart className="w-4 h-4 text-copper" />
            <span className="hidden sm:inline">Saved Plots</span>
          </button>
        </div>

        {/* Primary Area Showcase */}
        <div className="p-4 rounded-2xl bg-warm-card border border-warm-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-charcoal/50 font-sans font-semibold">
              Total Land Area
            </span>
            <span className="text-[11px] font-mono text-copper bg-copper-subtle px-2 py-0.5 rounded-md font-semibold">
              {analysis.shapeCategory.toUpperCase()} PLOT
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-serif text-charcoal font-normal">
              {formatArea(analysis.areaCents, selectedUnit)}
            </div>
            <button
              onClick={() => setShowUnitConversions((prev) => !prev)}
              className="text-[11px] font-sans text-copper hover:underline"
            >
              {showUnitConversions ? "Hide Units" : "All Units"}
            </button>
          </div>

          {/* Unit Switcher Pills */}
          <div className="grid grid-cols-5 gap-1 pt-1">
            {units.map((u) => (
              <button
                key={u.key}
                onClick={() => onSelectUnit(u.key)}
                className={`py-1 rounded-lg text-[10px] font-mono font-medium transition-all text-center ${
                  selectedUnit === u.key
                    ? "bg-charcoal text-white shadow-xs font-bold"
                    : "bg-white text-charcoal/70 border border-warm-border hover:border-copper"
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>

          {/* Expanded Kerala Conversion Breakdown */}
          {showUnitConversions && (
            <div className="pt-2 border-t border-warm-border/60 text-xs font-mono space-y-1.5 text-charcoal/80 animate-fadeIn">
              <div className="flex justify-between">
                <span className="text-charcoal/50">Cents:</span>
                <span className="font-semibold">{breakdown.cents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/50">Square Feet:</span>
                <span className="font-semibold">{breakdown.sqft}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/50">Square Metres:</span>
                <span className="font-semibold">{breakdown.sqm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/50">Acres:</span>
                <span className="font-semibold">{breakdown.acres}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/50">Hectares:</span>
                <span className="font-semibold">{breakdown.hectares}</span>
              </div>
            </div>
          )}
        </div>

        {/* Boundary Dimensions: Perimeter, Frontage, Depth */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-xl bg-warm-grey/60 border border-warm-border text-center">
            <div className="text-[10px] tracking-wide uppercase text-charcoal/50 font-sans">
              Perimeter
            </div>
            <div className="text-sm font-mono font-semibold text-charcoal mt-0.5">
              {analysis.perimeterFeet.toFixed(0)} ft
            </div>
            <div className="text-[10px] text-charcoal/40 font-mono">
              ({analysis.perimeterMeters.toFixed(1)} m)
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-center">
            <div className="text-[10px] tracking-wide uppercase text-amber-800 font-sans font-semibold">
              ★ Frontage
            </div>
            <div className="text-sm font-mono font-bold text-amber-900 mt-0.5">
              {analysis.frontageFeet.toFixed(0)} ft
            </div>
            <div className="text-[10px] text-amber-700/70 font-mono">
              (Side {String.fromCharCode(65 + analysis.roadFacingSegmentIndex)})
            </div>
          </div>

          <div className="p-3 rounded-xl bg-warm-grey/60 border border-warm-border text-center">
            <div className="text-[10px] tracking-wide uppercase text-charcoal/50 font-sans">
              Avg Depth
            </div>
            <div className="text-sm font-mono font-semibold text-charcoal mt-0.5">
              {analysis.depthFeet.toFixed(0)} ft
            </div>
            <div className="text-[10px] text-charcoal/40 font-mono">
              (Ratio {analysis.aspectRatio.toFixed(1)}:1)
            </div>
          </div>
        </div>

        {/* Individual Side Measurements List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-sans text-charcoal/70">
            <span className="font-semibold">Boundary Segments ({analysis.segments.length})</span>
            <span className="text-[11px] text-charcoal/50">
              Click side to set road frontage
            </span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {analysis.segments.map((seg, i) => {
              const isRoad = i === roadFacingIndex;
              return (
                <button
                  key={seg.label}
                  onClick={() => onRoadFacingIndexChange(i)}
                  className={`w-full px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center justify-between transition-all ${
                    isRoad
                      ? "bg-amber-500/15 border-amber-400 text-charcoal font-semibold shadow-xs"
                      : "bg-white border-warm-border hover:border-copper/60 text-charcoal/80"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isRoad ? "bg-amber-500 ring-2 ring-amber-300" : "bg-warm-border"
                      }`}
                    />
                    <span>{seg.label}</span>
                    {isRoad && (
                      <span className="text-[9px] bg-amber-500 text-white font-sans uppercase font-bold px-1.5 py-0.2 rounded">
                        Road
                      </span>
                    )}
                  </div>
                  <span className="font-bold">{seg.lengthFeet.toFixed(1)} ft</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* KMBR 2019 Kerala Statutory Setbacks & Buildable Envelope */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-serif text-xs font-semibold text-charcoal">
                KMBR Setbacks & Coverage
              </span>
            </div>
            <span className="text-[9px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase">
              Kerala 2019
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 rounded-xl bg-white border border-stone-200">
              <span className="text-[10px] text-stone-500 uppercase block font-sans">Front Setback</span>
              <strong className="text-charcoal text-xs">9.84 ft (3.0 m)</strong>
            </div>
            <div className="p-2 rounded-xl bg-white border border-stone-200">
              <span className="text-[10px] text-stone-500 uppercase block font-sans">Rear Setback</span>
              <strong className="text-charcoal text-xs">4.92 ft (1.5 m)</strong>
            </div>
            <div className="p-2 rounded-xl bg-white border border-stone-200">
              <span className="text-[10px] text-stone-500 uppercase block font-sans">Side Setbacks</span>
              <strong className="text-charcoal text-xs">3.93 ft / 3.28 ft</strong>
            </div>
            <div className="p-2 rounded-xl bg-white border border-stone-200">
              <span className="text-[10px] text-stone-500 uppercase block font-sans">Max Footprint</span>
              <strong className="text-emerald-700 text-xs">~{Math.round(analysis.areaSqFt * 0.60).toLocaleString()} Sq.Ft</strong>
            </div>
          </div>

          <p className="text-[10px] text-stone-500 font-sans leading-tight">
            * Based on Kerala Municipality Building Rules (KMBR) standard 60% ground coverage allowance for residential parcels.
          </p>
        </div>

        {/* Additional Property Constraints Accordion */}
        <div className="border border-warm-border rounded-2xl overflow-hidden">
          <button
            onClick={() => setPreferencesOpen((prev) => !prev)}
            className="w-full px-4 py-3 bg-warm-card hover:bg-warm-grey flex items-center justify-between text-xs font-sans font-medium text-charcoal transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-copper" />
              <span>Refine Preferences (Road, BHK, Style)</span>
            </div>
            {preferencesOpen ? (
              <ChevronUp className="w-4 h-4 text-charcoal/50" />
            ) : (
              <ChevronDown className="w-4 h-4 text-charcoal/50" />
            )}
          </button>

          {preferencesOpen && (
            <div className="p-4 bg-white space-y-3.5 text-xs font-sans border-t border-warm-border">
              {/* Road Access Width */}
              <div>
                <label className="block text-charcoal/70 mb-1">
                  Access Road Width (ft)
                </label>
                <input
                  type="number"
                  min="6"
                  max="60"
                  value={userInputs?.roadAccessWidthFt || ""}
                  onChange={(e) =>
                    handleInputChange("roadAccessWidthFt", e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  placeholder="e.g. 12 ft (KMBR standard)"
                  className="w-full px-3 py-1.5 rounded-lg border border-warm-border text-xs focus:outline-none focus:border-copper font-mono"
                />
              </div>

              {/* Preferred Bedrooms */}
              <div>
                <label className="block text-charcoal/70 mb-1">
                  Desired Bedrooms (BHK)
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[undefined, 3, 4, 5].map((bhk) => (
                    <button
                      key={bhk || "all"}
                      onClick={() => handleInputChange("preferredBedrooms", bhk)}
                      className={`py-1 rounded-lg text-xs font-mono transition-all ${
                        userInputs?.preferredBedrooms === bhk
                          ? "bg-charcoal text-white font-bold"
                          : "bg-warm-grey text-charcoal/70 hover:bg-warm-border"
                      }`}
                    >
                      {bhk ? `${bhk} BHK` : "Any"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Style */}
              <div>
                <label className="block text-charcoal/70 mb-1">
                  Architectural Style
                </label>
                <select
                  value={userInputs?.preferredStyle || "All"}
                  onChange={(e) => handleInputChange("preferredStyle", e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-warm-border text-xs focus:outline-none focus:border-copper bg-white"
                >
                  <option value="All">All Styles</option>
                  <option value="Contemporary">Contemporary</option>
                  <option value="Traditional">Traditional Nalukettu</option>
                  <option value="Modern Tropical">Modern Tropical</option>
                  <option value="Minimalist">Minimalist</option>
                  <option value="Courtyard">Courtyard Pavilion</option>
                  <option value="Mediterranean">Mediterranean Villa</option>
                </select>
              </div>

              {/* Parking */}
              <div>
                <label className="block text-charcoal/70 mb-1">
                  Car Parking Bays
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[undefined, 1, 2, 3].map((p) => (
                    <button
                      key={p || "any"}
                      onClick={() => handleInputChange("parkingCount", p)}
                      className={`py-1 rounded-lg text-xs font-mono transition-all ${
                        userInputs?.parkingCount === p
                          ? "bg-charcoal text-white font-bold"
                          : "bg-warm-grey text-charcoal/70 hover:bg-warm-border"
                      }`}
                    >
                      {p ? `${p} Car` : "Any"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer: Match Plans, Save, Export */}
      <div className="pt-4 border-t border-warm-border space-y-2.5">
        {/* Match Plans Button */}
        <button
          onClick={onMatchPlans}
          className="w-full py-3.5 px-4 rounded-2xl bg-copper text-white hover:bg-copper-dark transition-all text-xs font-sans font-semibold tracking-wide flex items-center justify-center gap-2 shadow-card"
        >
          <Sparkles className="w-4 h-4" />
          <span>Find Suitable Architectural Plans ({matchedCount})</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>

        {/* Secondary Utility Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onSavePlot}
            className="py-2.5 px-3 rounded-xl border border-warm-border bg-white hover:bg-warm-grey text-charcoal/80 text-xs font-sans font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5 text-copper" />
            <span>Save Plot</span>
          </button>

          <button
            onClick={onExportReport}
            className="py-2.5 px-3 rounded-xl border border-warm-border bg-white hover:bg-warm-grey text-charcoal/80 text-xs font-sans font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-charcoal/70" />
            <span>Export Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}

