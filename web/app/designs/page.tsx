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
import { Search, Maximize, Bed, Layers, ArrowRight, ArrowUpDown, X, Bookmark, BookmarkCheck } from "lucide-react";
import { useSavedProjects } from "@/lib/savedProjectsContext";

function DesignsCatalogContent() {
  const searchParams = useSearchParams();
  const { isSaved, toggleSave } = useSavedProjects();
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
      if (plotParam.includes("5 Cents") || plotParam.includes("8 Cents")) {
        setSelectedPlot("< 10 Cents");
      } else if (plotParam.includes("10 Cents") || plotParam.includes("12 Cents") || plotParam.includes("15 Cents")) {
        setSelectedPlot("10 - 15 Cents");
      } else if (plotParam.includes("20+")) {
        setSelectedPlot("> 15 Cents");
      }
    }

    const queryParam = searchParams.get("q") || searchParams.get("location");
    if (queryParam) setSearchQuery(queryParam.split(",")[0]);
  }, [searchParams]);

  const filteredAndSortedProjects = useMemo(() => {
    let result = FEATURED_PROJECTS.filter((project) => {
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
        project.style.toLowerCase().includes(selectedStyle.toLowerCase());

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
        </div>
      </section>

      {/* Projects Grid Section */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
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
                    <span className="flex items-center gap-1">
                      <Maximize className="w-3.5 h-3.5 text-copper" />
                      {project.plotSize}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-copper" />
                      {project.bedrooms} Bed
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-copper" />
                      {project.floors} Floors
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
