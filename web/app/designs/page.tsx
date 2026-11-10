"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectModal from "@/components/ProjectModal";
import SellerModal from "@/components/SellerModal";
import { FEATURED_PROJECTS } from "@/lib/data";
import { ArchitecturalProject } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Search, Maximize, Bed, Layers, ArrowRight, ArrowUpDown, X, Bookmark, BookmarkCheck, Compass, Sparkles, CheckCircle2 } from "lucide-react";
import { useSavedProjects } from "@/lib/savedProjectsContext";
import { useProjects } from "@/lib/projectsContext";

function DesignsCatalogContent() {
  const searchParams = useSearchParams();
  const { isSaved, toggleSave } = useSavedProjects();
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<ArchitecturalProject | null>(null);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("All");
  const [selectedPlot, setSelectedPlot] = useState("All");
  const [selectedBhk, setSelectedBhk] = useState("All");
  const [selectedArchitect, setSelectedArchitect] = useState("All");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "plot-asc" | "plot-desc">("featured");

  // Read URL query parameters on load
  useEffect(() => {
    const styleParam = searchParams.get("style");
    if (styleParam) setSelectedStyle(styleParam);

    const architectParam = searchParams.get("architect");
    if (architectParam) setSelectedArchitect(architectParam);

    const plotParam = searchParams.get("plot");
    if (plotParam) {
      const match = plotParam.match(/([\d.]+)\s*Cents/i);
      if (match) {
        const val = parseFloat(match[1]);
        if (val < 10) setSelectedPlot("< 10 Cents");
        else if (val <= 15) setSelectedPlot("10 - 15 Cents");
        else setSelectedPlot("> 15 Cents");
      } else if (plotParam.includes("20+")) {
        setSelectedPlot("> 15 Cents");
      }
    }

    const queryParam = searchParams.get("q") || searchParams.get("location");
    if (queryParam) setSearchQuery(queryParam.split(",")[0]);
  }, [searchParams]);

  const plotParam = searchParams.get("plot");
  const shapeParam = searchParams.get("shape");
  const directionParam = searchParams.get("direction");
  const locationParam = searchParams.get("location");

  const activePlotInfo = useMemo(() => {
    let cents = 10;
    let label = "10 Cents";
    let isActive = false;

    if (plotParam) {
      isActive = true;
      label = plotParam;
      const match = plotParam.match(/([\d.]+)\s*Cents/i);
      if (match) {
        cents = parseFloat(match[1]);
      } else if (plotParam.includes("20+")) {
        cents = 20;
      }
    } else if (selectedPlot !== "All") {
      isActive = true;
      label = selectedPlot;
      if (selectedPlot === "< 10 Cents") cents = 8;
      else if (selectedPlot === "10 - 15 Cents") cents = 10;
      else if (selectedPlot === "> 15 Cents") cents = 20;
    }

    return { isActive, cents, label };
  }, [plotParam, selectedPlot]);

  const filteredAndSortedProjects = useMemo(() => {
    const activeProjects = projects.filter((p) => p.status !== "draft");
    let result = activeProjects.filter((project) => {
      // Search Query
      const queryLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        project.name.toLowerCase().includes(queryLower) ||
        project.location.toLowerCase().includes(queryLower) ||
        project.architect.name.toLowerCase().includes(queryLower) ||
        project.style.toLowerCase().includes(queryLower);

      // Style Filter
      const matchesStyle =
        selectedStyle === "All" ||
        project.style.toLowerCase().includes(selectedStyle.toLowerCase()) ||
        selectedStyle.toLowerCase().includes(project.style.toLowerCase());

      // Architect Filter
      const matchesArchitect =
        selectedArchitect === "All" ||
        project.architect.name.toLowerCase() === selectedArchitect.toLowerCase();

      // Plot Filter
      let matchesPlot = true;
      if (selectedPlot === "< 10 Cents") matchesPlot = project.cents < 10;
      else if (selectedPlot === "10 - 15 Cents") matchesPlot = project.cents >= 10 && project.cents <= 15;
      else if (selectedPlot === "> 15 Cents") matchesPlot = project.cents > 15;

      // Bedrooms Filter
      let matchesBhk = true;
      if (selectedBhk !== "All") {
        matchesBhk = project.bedrooms === parseInt(selectedBhk);
      }

      return matchesSearch && matchesStyle && matchesArchitect && matchesPlot && matchesBhk;
    });

    // Sorting
    result.sort((a, b) => {
      const priceA = parseInt(a.price.replace(/[^\d]/g, "")) || 0;
      const priceB = parseInt(b.price.replace(/[^\d]/g, "")) || 0;

      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      if (sortBy === "plot-asc") return a.cents - b.cents;
      if (sortBy === "plot-desc") return b.cents - a.cents;
      return 0; // featured default order
    });

    return result;
  }, [searchQuery, selectedStyle, selectedArchitect, selectedPlot, selectedBhk, sortBy]);

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedStyle("All");
    setSelectedArchitect("All");
    setSelectedPlot("All");
    setSelectedBhk("All");
    setSortBy("featured");
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedStyle !== "All" ||
    selectedArchitect !== "All" ||
    selectedPlot !== "All" ||
    selectedBhk !== "All";

  return (
    <>
      {/* Header Banner */}
      <section className="pt-32 pb-12 sm:pb-16 bg-warm-grey border-b border-warm-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal font-serif tracking-tight text-charcoal mb-4">
            Architecture Worth Exploring.
          </h1>
          <p className="text-[15px] sm:text-base leading-relaxed text-secondaryText max-w-2xl font-light font-sans">
            Every architectural drawing set is vetted for regional climate adaptability, local building bylaws, and structural compliance.
          </p>

          {/* Search & Filter Controls Grid */}
          <div className="mt-8 bg-white border border-warm-border p-4 sm:p-5 shadow-subtle grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-center rounded-2xl">
            {/* Search Input */}
            <div className="lg:col-span-4 relative flex items-center border border-warm-border px-3 py-2.5 bg-warm-card rounded-xl">
              <Search className="w-4 h-4 text-mutedText mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search projects, styles, cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-[13px] text-charcoal outline-none placeholder:text-mutedText font-sans"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-mutedText hover:text-charcoal">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Style Filter */}
            <div className="lg:col-span-3 border border-warm-border px-3 py-1.5 bg-warm-card rounded-xl">
              <label className="block text-[10px] uppercase tracking-wider text-mutedText font-sans">
                Architectural Style
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full bg-transparent text-[13px] font-medium text-charcoal outline-none cursor-pointer font-sans"
              >
                <option value="All">All Styles</option>
                <option value="CONTEMPORARY">Contemporary</option>
                <option value="TRADITIONAL">Traditional Vernacular</option>
                <option value="MODERN TROPICAL">Modern Tropical</option>
                <option value="MINIMALIST">Minimalist</option>
                <option value="COURTYARD">Courtyard Architecture</option>
                <option value="MEDITERRANEAN">Mediterranean</option>
              </select>
            </div>

            {/* Plot Size Filter */}
            <div className="lg:col-span-2 border border-warm-border px-3 py-1.5 bg-warm-card rounded-xl">
              <label className="block text-[10px] uppercase tracking-wider text-mutedText font-sans">
                Plot Size
              </label>
              <select
                value={selectedPlot}
                onChange={(e) => setSelectedPlot(e.target.value)}
                className="w-full bg-transparent text-[13px] font-medium text-charcoal outline-none cursor-pointer font-sans"
              >
                <option value="All">All Plots</option>
                <option value="< 10 Cents">&lt; 10 Cents</option>
                <option value="10 - 15 Cents">10 - 15 Cents</option>
                <option value="> 15 Cents">&gt; 15 Cents</option>
              </select>
            </div>

            {/* Bedrooms Filter */}
            <div className="lg:col-span-1 border border-warm-border px-3 py-1.5 bg-warm-card rounded-xl">
              <label className="block text-[10px] uppercase tracking-wider text-mutedText font-sans">
                BHK
              </label>
              <select
                value={selectedBhk}
                onChange={(e) => setSelectedBhk(e.target.value)}
                className="w-full bg-transparent text-[13px] font-medium text-charcoal outline-none cursor-pointer font-sans"
              >
                <option value="All">All</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="lg:col-span-2 border border-warm-border px-3 py-1.5 bg-warm-card rounded-xl">
              <label className="block text-[10px] uppercase tracking-wider text-mutedText font-sans flex items-center gap-1">
                <ArrowUpDown className="w-2.5 h-2.5 text-copper" />
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-transparent text-[13px] font-medium text-charcoal outline-none cursor-pointer font-sans"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="plot-asc">Plot: Small to Large</option>
                <option value="plot-desc">Plot: Large to Small</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Tag Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-2">
            <span className="text-[11px] text-mutedText font-medium font-sans uppercase tracking-wider mr-1">
              Quick Filter:
            </span>
            <button
              onClick={() => setSelectedStyle(selectedStyle === "COURTYARD" ? "All" : "COURTYARD")}
              className={`px-3 py-1 rounded-full text-xs font-sans transition-all ${
                selectedStyle === "COURTYARD"
                  ? "bg-copper text-white shadow-sm font-medium"
                  : "bg-white text-charcoal border border-warm-border hover:border-charcoal/40"
              }`}
            >
              Courtyard Homes
            </button>
            <button
              onClick={() => setSelectedPlot(selectedPlot === "< 10 Cents" ? "All" : "< 10 Cents")}
              className={`px-3 py-1 rounded-full text-xs font-sans transition-all ${
                selectedPlot === "< 10 Cents"
                  ? "bg-copper text-white shadow-sm font-medium"
                  : "bg-white text-charcoal border border-warm-border hover:border-charcoal/40"
              }`}
            >
              &lt; 10 Cents
            </button>
            <button
              onClick={() => setSelectedPlot(selectedPlot === "10 - 15 Cents" ? "All" : "10 - 15 Cents")}
              className={`px-3 py-1 rounded-full text-xs font-sans transition-all ${
                selectedPlot === "10 - 15 Cents"
                  ? "bg-copper text-white shadow-sm font-medium"
                  : "bg-white text-charcoal border border-warm-border hover:border-charcoal/40"
              }`}
            >
              10–15 Cents
            </button>
            <button
              onClick={() => setSelectedBhk(selectedBhk === "4" ? "All" : "4")}
              className={`px-3 py-1 rounded-full text-xs font-sans transition-all ${
                selectedBhk === "4"
                  ? "bg-copper text-white shadow-sm font-medium"
                  : "bg-white text-charcoal border border-warm-border hover:border-charcoal/40"
              }`}
            >
              4 BHK
            </button>
            <button
              onClick={() => setSelectedStyle(selectedStyle === "TRADITIONAL" ? "All" : "TRADITIONAL")}
              className={`px-3 py-1 rounded-full text-xs font-sans transition-all ${
                selectedStyle === "TRADITIONAL"
                  ? "bg-copper text-white shadow-sm font-medium"
                  : "bg-white text-charcoal border border-warm-border hover:border-charcoal/40"
              }`}
            >
              Traditional Nalukettu
            </button>
            <button
              onClick={() => setSelectedStyle(selectedStyle === "MODERN TROPICAL" ? "All" : "MODERN TROPICAL")}
              className={`px-3 py-1 rounded-full text-xs font-sans transition-all ${
                selectedStyle === "MODERN TROPICAL"
                  ? "bg-copper text-white shadow-sm font-medium"
                  : "bg-white text-charcoal border border-warm-border hover:border-charcoal/40"
              }`}
            >
              Modern Tropical
            </button>
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="px-2.5 py-1 text-xs text-copper hover:underline font-sans font-medium flex items-center gap-1 ml-1"
              >
                <X className="w-3 h-3" />
                Clear All
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Projects Grid Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          
          {/* Plot Intelligence Banner / Active Plot Action */}
          {activePlotInfo.isActive ? (
            <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-charcoal text-white border border-copper/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl relative overflow-hidden animate-in fade-in">
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-copper/20 border border-copper/40 flex items-center justify-center shrink-0 text-copper-light">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[13px] font-medium font-sans text-white flex items-center gap-2">
                    <span>Active Plot: <strong>{activePlotInfo.label}</strong></span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-copper text-white font-mono font-bold">
                      Live GIS Guide
                    </span>
                  </div>
                  <div className="text-xs text-white/70 font-light font-sans mt-0.5">
                    Project this exact {activePlotInfo.cents} Cent parcel onto your physical property with interactive satellite guidance.
                  </div>
                </div>
              </div>

              <Link
                href={`/plot-intelligence?cents=${activePlotInfo.cents}&shape=${encodeURIComponent(shapeParam || "Rectangular")}&direction=${encodeURIComponent(directionParam || "North Facing")}&location=${encodeURIComponent(locationParam || searchQuery || "")}&live=true&guide=true`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-copper hover:bg-copper-hover text-white text-xs font-medium font-sans rounded-xl shrink-0 transition-all shadow-md group relative z-10 hover:scale-[1.02]"
              >
                <Compass className="w-4 h-4 text-white" />
                <span>Use same plot in live location with Plot Guide</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ) : (
            <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-[#1b1918] text-white border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-copper/20 border border-copper/40 flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5 text-copper-light" />
                </div>
                <div>
                  <div className="text-[13px] font-medium font-sans text-white flex items-center gap-2">
                    <span>Have a specific plot boundary or land in Kerala?</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-copper/30 text-copper-light font-mono font-bold">GIS</span>
                  </div>
                  <div className="text-xs text-white/60 font-light font-sans mt-0.5">
                    Draw your exact perimeter on top-down satellite imagery to filter plans fitting inside your KMBR setbacks.
                  </div>
                </div>
              </div>

              <Link
                href="/plot-intelligence"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-copper hover:bg-copper-hover text-white text-xs font-medium font-sans rounded-full shrink-0 transition-colors shadow-sm self-start sm:self-auto"
              >
                <span>Open Satellite Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Status bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-8 border-b border-warm-border gap-4">
            <div className="text-[13px] text-mutedText font-sans flex items-center gap-2">
              <span>Showing <strong className="text-charcoal font-medium">{filteredAndSortedProjects.length}</strong> available drawing packages</span>
              {selectedArchitect !== "All" && (
                <span className="bg-warm-grey px-2.5 py-1 text-xs text-charcoal border border-warm-border rounded-full">
                  Architect: {selectedArchitect}
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-copper hover:underline font-sans font-medium flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Reset All Filters
              </button>
            )}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="group cursor-pointer bg-white border border-warm-border flex flex-col justify-between transition-all duration-300 hover:shadow-card hover:border-charcoal/40 rounded-2xl overflow-hidden"
              >
                {/* Project Image */}
                <div className="relative aspect-[16/10] w-full bg-charcoal overflow-hidden rounded-t-2xl">
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] tracking-widestExtra uppercase px-2.5 py-1 font-sans rounded-full">
                    {project.style}
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(project.id);
                    }}
                    className={`absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      isSaved(project.id)
                        ? "bg-copper text-white shadow-md"
                        : "bg-black/50 text-white/80 hover:bg-black/80 hover:text-white"
                    }`}
                    title={isSaved(project.id) ? "Remove from shortlist" : "Save to shortlist"}
                  >
                    {isSaved(project.id) ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  </button>

                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-charcoal text-xs font-semibold px-2.5 py-1 shadow-sm font-sans rounded-full">
                    {project.price}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-normal font-serif text-charcoal group-hover:text-copper transition-colors mb-1">
                      {project.name}
                    </h3>
                    <div className="text-xs text-mutedText font-sans mb-3">
                      {project.location} • By {project.architect.name}
                    </div>

                    <p className="text-[13px] text-secondaryText font-light font-sans line-clamp-2 mb-4 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Specifications Footer */}
                  <div className="pt-4 border-t border-warm-border/80 flex items-center justify-between text-[12px] font-sans text-charcoal/80 font-medium">
                    <span className="flex items-center gap-1" title="Minimum Plot Size">
                      <Maximize className="w-3.5 h-3.5 text-copper" />
                      <span>{project.plotSize}</span>
                    </span>
                    <span className="flex items-center gap-1" title="Built-up Area">
                      <Layers className="w-3.5 h-3.5 text-copper" />
                      <span>{project.builtUpArea}</span>
                    </span>
                    <span className="flex items-center gap-1" title="Bedrooms">
                      <Bed className="w-3.5 h-3.5 text-copper" />
                      <span>{project.bedrooms} BHK</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredAndSortedProjects.length === 0 && (
            <div className="text-center py-20 bg-warm-grey border border-warm-border p-8 rounded-2xl">
              <h3 className="text-2xl font-serif text-charcoal mb-2">No Matching Architectural Plans Found</h3>
              <p className="text-sm text-mutedText font-sans max-w-md mx-auto mb-6">
                Try clearing one or more filters or modifying your search terms to see available projects.
              </p>
              <button
                onClick={resetAllFilters}
                className="px-6 py-2.5 bg-copper text-white text-xs font-medium font-sans hover:bg-copper-hover transition-colors rounded-full"
              >
                Show All Designs
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Project Detail Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* Seller Application Modal */}
      <SellerModal
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
      />
    </>
  );
}

export default function DesignsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Suspense fallback={
        <div className="min-h-[60vh] flex items-center justify-center font-sans text-xs text-mutedText">
          Loading architectural catalog...
        </div>
      }>
        <DesignsCatalogContent />
      </Suspense>
      <Footer />
    </main>
  );
}
