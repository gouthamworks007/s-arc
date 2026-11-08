"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bed,
  Layers,
  Maximize,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  ArrowUpDown,
  Filter,
  Sparkles,
  Info,
  MapPin,
  Compass,
} from "lucide-react";
import { ArchitecturalProject, PlanCompatibilityResult, PlotAnalysisData } from "@/lib/types";
import { useSavedProjects } from "@/lib/savedProjectsContext";

interface PlanRecommendationsViewProps {
  analysis: PlotAnalysisData;
  compatibilityResults: PlanCompatibilityResult[];
  onOpenProjectModal: (project: ArchitecturalProject) => void;
  onOpenConsultModal: (project: ArchitecturalProject) => void;
  onBackToMap: () => void;
}

export default function PlanRecommendationsView({
  analysis,
  compatibilityResults,
  onOpenProjectModal,
  onOpenConsultModal,
  onBackToMap,
}: PlanRecommendationsViewProps) {
  const { isSaved, toggleSave } = useSavedProjects();

  const [categoryFilter, setCategoryFilter] = useState<"all" | "good" | "compatible">("compatible");
  const [selectedBhk, setSelectedBhk] = useState<string>("All");
  const [selectedStyle, setSelectedStyle] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"compatibility" | "cost-asc" | "area-asc" | "area-desc">("compatibility");
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  // Filter & Sort
  const filteredResults = useMemo(() => {
    let list = compatibilityResults.filter((item) => {
      // Category Filter
      if (categoryFilter === "good" && item.category !== "good") return false;
      if (categoryFilter === "compatible" && item.category === "not_suitable") return false;

      // BHK Filter
      if (selectedBhk !== "All") {
        const bhkNum = parseInt(selectedBhk);
        if (item.project.bedrooms !== bhkNum) return false;
      }

      // Style Filter
      if (selectedStyle !== "All") {
        if (!item.project.style.toLowerCase().includes(selectedStyle.toLowerCase())) return false;
      }

      return true;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === "compatibility") {
        return b.score - a.score;
      }
      if (sortBy === "cost-asc") {
        const costA = a.project.estimatedConstructionCost || 5000000;
        const costB = b.project.estimatedConstructionCost || 5000000;
        return costA - costB;
      }
      if (sortBy === "area-asc") {
        const areaA = a.project.builtUpAreaSqft || 2000;
        const areaB = b.project.builtUpAreaSqft || 2000;
        return areaA - areaB;
      }
      if (sortBy === "area-desc") {
        const areaA = a.project.builtUpAreaSqft || 2000;
        const areaB = b.project.builtUpAreaSqft || 2000;
        return areaB - areaA;
      }
      return 0;
    });

    return list;
  }, [compatibilityResults, categoryFilter, selectedBhk, selectedStyle, sortBy]);

  const goodCount = compatibilityResults.filter((r) => r.category === "good").length;
  const possibleCount = compatibilityResults.filter((r) => r.category === "possible").length;
  const unsuitableCount = compatibilityResults.filter((r) => r.category === "not_suitable").length;

  return (
    <div className="space-y-6">
      {/* Property Context Banner */}
      <div className="bg-white rounded-3xl border border-warm-border p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-widestExtra uppercase text-copper font-semibold">
              Plot Recommendation Engine
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-copper" />
            <span className="text-xs font-mono text-charcoal/60">
              {analysis.areaCents.toFixed(2)} Cents Measured
            </span>
          </div>
          <h2 className="text-2xl font-serif text-charcoal">
            Architectural Plans for Your Parcel
          </h2>
          <p className="text-xs text-charcoal/60 font-sans">
            Screened against {analysis.frontageFeet.toFixed(0)} ft road frontage, {analysis.depthFeet.toFixed(0)} ft depth, and statutory KMBR setbacks.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onBackToMap}
            className="px-4 py-2.5 rounded-xl border border-warm-border text-xs font-sans font-medium text-charcoal hover:bg-warm-grey transition-colors"
          >
            ← Modify Boundary
          </button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl border border-warm-border p-4 shadow-subtle flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 bg-warm-grey p-1 rounded-xl">
          <button
            onClick={() => setCategoryFilter("compatible")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              categoryFilter === "compatible"
                ? "bg-white text-charcoal shadow-xs font-semibold"
                : "text-charcoal/70 hover:text-charcoal"
            }`}
          >
            Compatible ({goodCount + possibleCount})
          </button>
          <button
            onClick={() => setCategoryFilter("good")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              categoryFilter === "good"
                ? "bg-white text-emerald-700 shadow-xs font-semibold"
                : "text-charcoal/70 hover:text-charcoal"
            }`}
          >
            Good Match ({goodCount})
          </button>
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              categoryFilter === "all"
                ? "bg-white text-charcoal shadow-xs font-semibold"
                : "text-charcoal/70 hover:text-charcoal"
            }`}
          >
            All Plans ({compatibilityResults.length})
          </button>
        </div>

        {/* Secondary Dropdown Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* BHK Filter */}
          <select
            value={selectedBhk}
            onChange={(e) => setSelectedBhk(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-warm-border bg-white text-charcoal/80 text-xs focus:outline-none focus:border-copper"
          >
            <option value="All">All Bedrooms</option>
            <option value="3">3 BHK</option>
            <option value="4">4 BHK</option>
            <option value="5">5 BHK</option>
          </select>

          {/* Style Filter */}
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-warm-border bg-white text-charcoal/80 text-xs focus:outline-none focus:border-copper"
          >
            <option value="All">All Styles</option>
            <option value="Contemporary">Contemporary</option>
            <option value="Traditional">Traditional Nalukettu</option>
            <option value="Modern Tropical">Modern Tropical</option>
            <option value="Minimalist">Minimalist</option>
            <option value="Courtyard">Courtyard</option>
            <option value="Mediterranean">Mediterranean</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-warm-border">
            <ArrowUpDown className="w-3.5 h-3.5 text-charcoal/50" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-warm-border bg-white text-charcoal/80 text-xs focus:outline-none focus:border-copper font-medium"
            >
              <option value="compatibility">Best Compatibility</option>
              <option value="cost-asc">Lowest Cost</option>
              <option value="area-asc">Smallest Built Area</option>
              <option value="area-desc">Largest Built Area</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results List */}
      {filteredResults.length === 0 ? (
        <div className="bg-white rounded-3xl border border-warm-border p-12 text-center space-y-3">
          <Info className="w-8 h-8 text-copper mx-auto" />
          <h3 className="text-xl font-serif text-charcoal font-normal">
            No Matching Plans Under Current Filters
          </h3>
          <p className="text-xs text-charcoal/60 font-sans max-w-md mx-auto">
            Try switching to &quot;All Plans&quot; or resetting the bedroom and architectural style filters.
          </p>
          <button
            onClick={() => {
              setCategoryFilter("all");
              setSelectedBhk("All");
              setSelectedStyle("All");
            }}
            className="px-4 py-2 bg-copper text-white text-xs rounded-xl font-medium"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResults.map((result) => {
            const { project, category, score, checklist, buildableEnvelope } = result;
            const bookmarked = isSaved(project.id);
            const isExpanded = expandedPlanId === project.id;

            const categoryTheme =
              category === "good"
                ? {
                    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
                    indicator: "bg-emerald-500",
                    label: "Good Match",
                  }
                : category === "possible"
                ? {
                    badge: "bg-amber-50 text-amber-800 border-amber-200",
                    indicator: "bg-amber-500",
                    label: "Possible Match",
                  }
                : {
                    badge: "bg-rose-50 text-rose-800 border-rose-200",
                    indicator: "bg-rose-500",
                    label: "Not Suitable",
                  };

            return (
              <div
                key={project.id}
                className="bg-white rounded-3xl border border-warm-border overflow-hidden shadow-card hover:shadow-floating transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Image Showcase */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal">
                    <Image
                      src={project.image}
                      alt={project.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Compatibility Pill */}
                    <div
                      className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-mono font-bold border backdrop-blur-md flex items-center gap-1.5 shadow-md ${categoryTheme.badge}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${categoryTheme.indicator} animate-pulse`} />
                      <span>{score}% Compatibility</span>
                    </div>

                    {/* Bookmark Trigger */}
                    <button
                      onClick={() => toggleSave(project.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:text-copper transition-colors"
                      title={bookmarked ? "Remove from saved" : "Shortlist plan"}
                    >
                      {bookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-copper" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>

                    {/* Bottom overlay info */}
                    <div className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between">
                      <div>
                        <span className="text-[10px] tracking-wider uppercase text-copper-light font-semibold font-sans">
                          {project.style}
                        </span>
                        <h4 className="text-lg font-serif font-normal drop-shadow-sm leading-tight">
                          {project.name}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-white/70 block">Est. Cost</span>
                        <span className="text-xs font-mono font-bold text-white">
                          ₹{((project.estimatedConstructionCost || 5000000) / 100000).toFixed(1)}L
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Spec Row */}
                  <div className="p-4 grid grid-cols-4 gap-2 border-b border-warm-border text-center text-xs font-sans bg-warm-card/60">
                    <div>
                      <span className="text-[10px] text-charcoal/50 block">BHK</span>
                      <span className="font-mono font-semibold text-charcoal">
                        {project.bedrooms} BHK
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-charcoal/50 block">Floors</span>
                      <span className="font-mono font-semibold text-charcoal">
                        {project.floors} Flr
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-charcoal/50 block">Built Area</span>
                      <span className="font-mono font-semibold text-charcoal">
                        {project.builtUpArea}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-charcoal/50 block">Footprint</span>
                      <span className="font-mono font-semibold text-charcoal">
                        {project.buildingFootprintSqft || 1200} sqft
                      </span>
                    </div>
                  </div>

                  {/* Compatibility Explanation Preview */}
                  <div className="p-4 space-y-2.5">
                    <div className="space-y-1.5 text-xs font-sans">
                      {checklist.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-start gap-2">
                          {item.status === "pass" ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          ) : item.status === "warn" ? (
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          )}
                          <span className="text-charcoal/80 text-[11px] leading-tight">
                            {item.detail}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Expandable Breakdown Drawer */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-warm-border space-y-2 text-[11px] font-sans text-charcoal/80 animate-fadeIn">
                        <div className="bg-warm-grey/60 p-2.5 rounded-xl space-y-1 font-mono text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-charcoal/50">Min Plot Required:</span>
                            <span className="font-bold">{project.minimumPlotAreaCent || project.cents} Cents</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-charcoal/50">Min Road Frontage:</span>
                            <span className="font-bold">{project.minimumFrontageFt || 40} ft</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-charcoal/50">Design Setbacks:</span>
                            <span className="font-bold">{project.dimensions?.setbacks || "Standard"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-charcoal/50">Buildable Envelope:</span>
                            <span className="font-bold">{buildableEnvelope.areaSqFt.toFixed(0)} sq ft</span>
                          </div>
                        </div>

                        {checklist.slice(3).map((item) => (
                          <div key={item.id} className="flex items-start gap-2">
                            {item.status === "pass" ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            ) : item.status === "warn" ? (
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                            )}
                            <span className="text-charcoal/70 text-[11px]">
                              {item.detail}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => setExpandedPlanId(isExpanded ? null : project.id)}
                      className="text-[11px] font-sans text-copper hover:underline flex items-center gap-1 font-medium pt-1"
                    >
                      <span>{isExpanded ? "Less Details" : "Inspect Detailed Checklist"}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-4 pt-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onOpenProjectModal(project)}
                      className="py-2.5 px-3 rounded-xl bg-charcoal text-white hover:bg-black text-xs font-sans font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>View Design</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onOpenConsultModal(project)}
                      className="py-2.5 px-3 rounded-xl border border-warm-border hover:bg-copper-subtle hover:border-copper/60 text-charcoal text-xs font-sans font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-copper" />
                      <span>Consult Architect</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-charcoal/50 font-sans pt-1">
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-copper" />
                      <span>{project.architect.studio}</span>
                    </div>
                    <Link
                      href={`/designs/${project.id}`}
                      className="text-copper hover:underline font-medium"
                      target="_blank"
                    >
                      CAD Specs →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

