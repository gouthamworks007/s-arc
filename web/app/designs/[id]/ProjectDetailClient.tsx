"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SellerModal from "@/components/SellerModal";
import ConsultArchitectModal from "@/components/plot-intelligence/ConsultArchitectModal";
import VerificationBadge from "@/components/VerificationBadge";
import { FEATURED_PROJECTS } from "@/lib/data";
import { useSavedProjects } from "@/lib/savedProjectsContext";
import { useProjects, normalizeProject } from "@/lib/projectsContext";
import { ArchitecturalProject, ProjectPackage } from "@/lib/types";
import { 
  Maximize, 
  Bed, 
  Layers, 
  MapPin, 
  ShieldCheck, 
  Download, 
  MessageSquare, 
  ArrowRight, 
  Bookmark, 
  BookmarkCheck,
  CheckCircle2, 
  FileText,
  ChevronLeft,
  Share2,
  Calendar,
  Compass,
  X,
  Package,
  Shield,
  Lock,
  Check,
  Eye,
  SlidersHorizontal,
  Loader2
} from "lucide-react";

export default function ProjectDetailClient() {
  const params = useParams();
  const [resolvedId, setResolvedId] = useState<string>((params?.id as string) || "");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathPart = window.location.pathname.split("/designs/")[1]?.split("/")[0];
      if (pathPart) {
        setResolvedId(decodeURIComponent(pathPart));
      }
    }
  }, [params?.id]);
  const projectId = resolvedId || (params?.id as string);
  const { projects, isLoading: projectsLoading } = useProjects();
  const [fetchedProject, setFetchedProject] = useState<ArchitecturalProject | null>(null);
  const [fetchingSingle, setFetchingSingle] = useState(false);

  const project =
    projects.find((p) => p.id === projectId || p.slug === projectId) ||
    FEATURED_PROJECTS.find((p) => p.id === projectId || p.slug === projectId) ||
    fetchedProject;

  useEffect(() => {
    if (!projectId || projects.some((p) => p.id === projectId || p.slug === projectId) || FEATURED_PROJECTS.some((p) => p.id === projectId || p.slug === projectId)) {
      return;
    }
    let active = true;
    setFetchingSingle(true);
    fetch(`/api/projects/${encodeURIComponent(projectId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.project) {
          setFetchedProject(normalizeProject(data.project));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setFetchingSingle(false);
      });
    return () => {
      active = false;
    };
  }, [projectId, projects]);

  const { isSaved, toggleSave } = useSavedProjects();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeFloor, setActiveFloor] = useState<"ground" | "first" | "roof">("ground");
  const [sampleDownloaded, setSampleDownloaded] = useState(false);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [isBlueprintEnlarged, setIsBlueprintEnlarged] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  // Fixed-Price Packages state
  const [packages, setPackages] = useState<(ProjectPackage & { priceFormatted?: string })[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isComparePackagesOpen, setIsComparePackagesOpen] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [generatedLicense, setGeneratedLicense] = useState<string>("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerLocation, setBuyerLocation] = useState(project?.location || "Kochi, Kerala");

  // Fetch or populate packages for this project
  useEffect(() => {
    if (!project) return;
    setLoadingPackages(true);

    fetch(`/api/packages?projectId=${encodeURIComponent(project.id)}`)
      .then((res) => (res.ok ? res.json() : { packages: [] }))
      .then((data) => {
        if (data.packages && data.packages.length > 0) {
          setPackages(data.packages);
          setSelectedPackageId(data.packages[0].id);
        } else {
          // Generate baseline standard packages for this project
          const basePaise = 3500000;
          const defaultPackages: (ProjectPackage & { priceFormatted: string })[] = [
            {
              id: `pkg-${project.id}-permit`,
              projectId: project.id,
              architectId: "arch-default",
              name: "Essential Permit Set",
              description: "Sanction-ready 2D drawings formatted for local municipal building bylaw (KMBR) clearance and setting out.",
              pricePaise: basePaise,
              priceFormatted: `₹${(basePaise / 100).toLocaleString("en-IN")}`,
              currency: "INR",
              deliverables: [
                "Ground Floor Setting Out Plan (1:50)",
                "First Floor Dimensioned Layout",
                "Front & Rear Elevation Schematics",
                "Building Longitudinal Cross-Section",
                "Municipal Sanction Drawing Sheet",
              ],
              status: "published",
            },
            {
              id: `pkg-${project.id}-builder`,
              projectId: project.id,
              architectId: "arch-default",
              name: "Executive Builder Package",
              description: "Comprehensive architectural and structural blueprint package for turnkey contractor execution.",
              pricePaise: basePaise * 1.85,
              priceFormatted: `₹${((basePaise * 1.85) / 100).toLocaleString("en-IN")}`,
              currency: "INR",
              deliverables: [
                "Complete 2D Architectural Working Drawings",
                "Detailed Foundation & Column Centerline Layout",
                "RCC Slab & Beam Rebar Schedules",
                "Electrical Conduit & Distribution Routing",
                "Plumbing, Water Supply & Sanitary Schematics",
                "Window & Door Joinery Schedule",
              ],
              status: "published",
            },
            {
              id: `pkg-${project.id}-turnkey`,
              projectId: project.id,
              architectId: "arch-default",
              name: "Comprehensive BIM & BOQ Set",
              description: "Full parametric 3D model, complete bill of quantities, structural schedules, and priority consultation.",
              pricePaise: basePaise * 3.4,
              priceFormatted: `₹${((basePaise * 3.4) / 100).toLocaleString("en-IN")}`,
              currency: "INR",
              deliverables: [
                "All Executive Builder Package Drawings",
                "Full Bill of Quantities (BOQ Material Takeoff)",
                "Parametric 3D BIM Model (Revit / SketchUp)",
                "Interior Joinery & Millwork Details",
                "Landscape & Stormwater Management Plan",
                "Direct Architect Setting-Out Consultation Session",
              ],
              status: "published",
            },
          ];
          setPackages(defaultPackages);
          setSelectedPackageId(defaultPackages[1]?.id || defaultPackages[0].id);
        }
      })
      .catch(() => {
        // Fallback gracefully
      })
      .finally(() => {
        setLoadingPackages(false);
      });
  }, [project]);

  // Modal Escape key and body lock
  useEffect(() => {
    if (!isPurchaseModalOpen && !isComparePackagesOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPurchaseModalOpen(false);
        setIsComparePackagesOpen(false);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPurchaseModalOpen, isComparePackagesOpen]);

  const handleDownloadSample = () => {
    try {
      const projName = project?.name || "Architectural_Project";
      const link = document.createElement("a");
      link.href = "/downloads/sarc-sample-permit-sheet.pdf";
      link.download = `${projName.replace(/[^a-zA-Z0-9]/g, "_")}_Sample_Permit_Sheet.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSampleDownloaded(true);
      setTimeout(() => setSampleDownloaded(false), 4000);
    } catch {
      setSampleDownloaded(true);
    }
  };

  if (!project && (projectsLoading || fetchingSingle)) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 pb-20 text-center max-w-md mx-auto px-6 flex flex-col items-center space-y-3">
          <Loader2 className="w-7 h-7 animate-spin text-copper" />
          <p className="text-xs font-mono uppercase tracking-widest text-secondaryText">
            Loading Architectural Blueprint...
          </p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 sm:pt-28 pb-12 text-center max-w-md mx-auto px-6">
          <h2 className="text-3xl font-serif text-charcoal mb-3">Project Not Found</h2>
          <p className="text-sm text-secondaryText font-sans mb-6">
            The architectural design you are looking for may have been updated or moved.
          </p>
          <Link href="/designs" className="px-6 py-2.5 bg-copper text-white text-xs font-sans font-medium">
            Browse All Designs
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const bookmarked = isSaved(project.id);
  const currentImage = project.gallery[activeImageIndex] || project.image;

  // Filter out current project for related designs
  const relatedProjects = FEATURED_PROJECTS.filter((p) => p.id !== project.id).slice(0, 3);
  const selectedPackage = packages.find((p) => p.id === selectedPackageId) || packages[0];

  const drawingSheets = [
    { code: "A101 - A104", category: "Architectural Plans", desc: "1:50 setting out plans, dimensioned room layouts, finish schedule" },
    { code: "A105 - A108", category: "Elevations & Sections", desc: "4 cardinal elevations, transverse and longitudinal section cuts" },
    { code: "A109 - A112", category: "Joinery & Detailing", desc: "Door-window schedule, staircase details, louver joinery" },
    { code: "S201 - S206", category: "Structural Foundation", desc: "Soil load bearing footings, column center-line, plinth beams" },
    { code: "S207 - S214", category: "Structural Slabs & Beams", desc: "First floor slab rebar, lintel details, terrace water-proofing" },
    { code: "P301 - P308", category: "Plumbing & Drainage", desc: "Dual greywater/blackwater layout, rainwater harvesting, overhead tank" },
    { code: "E401 - E408", category: "Electrical & Solar", desc: "3-phase power single line diagram, inverter/solar changeover, conduits" },
  ];

  return (
    <main id="main-content" className="min-h-screen bg-white pb-24 md:pb-0">
      <Navbar onOpenSellerModal={() => setIsSellerModalOpen(true)} />

      {/* Breadcrumb & Header Bar */}
      <section className="pt-24 sm:pt-28 pb-6 sm:pb-8 bg-warm-grey border-b border-warm-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-sans text-mutedText mb-4">
            <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
            <span>/</span>
            <Link href="/designs" className="hover:text-charcoal transition-colors">Designs</Link>
            <span>/</span>
            <span className="text-charcoal font-medium">{project.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <span className="text-[10px] tracking-widestExtra text-copper uppercase font-sans font-semibold">
                {project.style} ARCHITECTURE
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal font-serif tracking-tight text-charcoal mt-1 mb-3">
                {project.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs font-sans text-secondaryText">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-copper" />
                  {project.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-2 flex-wrap">
                  <span>By {project.architect?.name || "Verified Architect"} ({project.architect?.studio || "Studio"})</span>
                  <VerificationBadge
                    badge={project.architect?.verificationBadge || project.architectVerificationBadge || (project.architect?.verified ? "blue" : "none")}
                    size="xs"
                  />
                </span>
              </div>
            </div>

            {/* Quick Pricing & Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => toggleSave(project.id)}
                className={`p-3 min-h-[44px] border transition-colors flex items-center gap-1.5 text-xs font-sans font-medium rounded-full ${
                  bookmarked
                    ? "bg-copper text-white border-copper shadow-sm"
                    : "bg-white text-charcoal border-warm-border hover:border-charcoal"
                }`}
                title="Save to shortlist"
                aria-label={bookmarked ? "Remove from shortlist" : "Save to shortlist"}
              >
                {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{bookmarked ? "Shortlisted" : "Shortlist"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setUrlCopied(true);
                  setTimeout(() => setUrlCopied(false), 2500);
                }}
                className="p-3 min-h-[44px] min-w-[44px] bg-white border border-warm-border hover:border-charcoal text-charcoal transition-colors rounded-full relative flex items-center justify-center"
                title="Share project link"
                aria-label="Share project link"
              >
                <Share2 className="w-4 h-4" />
                {urlCopied && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-charcoal text-white text-[10px] rounded shadow-lg whitespace-nowrap animate-fadeIn font-sans">
                    Link copied!
                  </span>
                )}
              </button>

              <a
                href="#download-package"
                className="px-6 py-3 min-h-[44px] bg-charcoal hover:bg-copper text-white text-xs font-sans font-medium tracking-wide transition-colors rounded-full flex items-center shadow-sm"
              >
                Get CAD Package • {project.price}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Showcase Gallery */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          {/* Main Visual */}
          <div className="relative aspect-[16/9] w-full bg-charcoal overflow-hidden mb-4 shadow-sm rounded-2xl">
            <Image
              src={currentImage}
              alt={project.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1200px"
            />
            <div className="absolute bottom-4 left-4 bg-charcoal/80 backdrop-blur-md px-3 py-1 text-white text-xs font-sans rounded-full">
              Photo {activeImageIndex + 1} of {project.gallery.length} • {project.style}
            </div>
          </div>

          {/* Thumbnails Row */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {project.gallery.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-28 sm:w-36 aspect-[16/10] shrink-0 border-2 overflow-hidden transition-all rounded-xl ${
                  activeImageIndex === idx ? "border-copper shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Key Metrics Bar */}
      <section className="py-6 bg-warm-grey border-y border-warm-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6 text-center font-sans">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-mutedText block">Plot Footprint</span>
              <span className="text-base sm:text-lg font-semibold text-charcoal mt-1 block">{project.plotSize}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-mutedText block">Built-Up Area</span>
              <span className="text-base sm:text-lg font-semibold text-charcoal mt-1 block">{project.builtUpArea}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-mutedText block">Bedrooms</span>
              <span className="text-base sm:text-lg font-semibold text-charcoal mt-1 block">{project.bedrooms} Suites</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-mutedText block">Floors</span>
              <span className="text-base sm:text-lg font-semibold text-charcoal mt-1 block">{project.floors} Levels</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-mutedText block">Plot Width x Length</span>
              <span className="text-base sm:text-lg font-semibold text-charcoal mt-1 block">{project.dimensions.plotWidth} x {project.dimensions.plotLength}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-mutedText block">Setbacks Buffer</span>
              <span className="text-xs font-semibold text-charcoal mt-2 block truncate">{project.dimensions.setbacks}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Narrative & Blueprint Viewer Two-Column Section */}
      <section className="py-10 sm:py-14 bg-white border-b border-warm-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Left: Design Concept & Climate Highlights (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <span className="text-[11px] font-semibold tracking-widestExtra text-copper uppercase mb-2 block font-sans">
                  Architectural Concept
                </span>
                <h2 className="text-3xl sm:text-4xl font-normal font-serif text-charcoal mb-4">
                  Spaces Engineered for Climate & Light
                </h2>
                <p className="text-[15px] leading-relaxed text-secondaryText font-light font-sans mb-6">
                  {project.description}
                </p>
                <p className="text-[15px] leading-relaxed text-secondaryText font-light font-sans">
                  Oriented with a strict adherence to solar geometry, this design prioritizes wind corridors that capture regional sea and hill breezes, radically lowering the reliance on mechanical air conditioning during humid pre-monsoon months.
                </p>
              </div>

              {/* Highlights */}
              <div className="bg-warm-grey border border-warm-border p-6 space-y-4 rounded-2xl">
                <h3 className="text-lg font-serif text-charcoal">Structural & Bioclimatic Innovations</h3>
                <ul className="space-y-3 font-sans text-xs sm:text-[13px] text-secondaryText">
                  {project.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-copper shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Complete 42-Sheet Drawing Package Index */}
              <div id="download-package" className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] tracking-widest uppercase text-copper font-semibold font-sans">
                      Complete Package Index
                    </span>
                    <h3 className="text-2xl font-serif text-charcoal">42 Construction-Ready Sheets Included</h3>
                  </div>
                  <span className="text-xs bg-warm-grey border border-warm-border px-3 py-1 font-sans text-charcoal rounded-full">
                    {project.cadFileName ? `${project.cadFileName} (${project.cadFileSize || "CAD"})` : "DWG + BIM + PDF"}
                  </span>
                </div>

                <div className="border border-warm-border divide-y divide-warm-border font-sans text-xs rounded-2xl overflow-hidden">
                  {drawingSheets.map((sheet, idx) => (
                    <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-warm-grey/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-copper font-medium w-24 shrink-0">{sheet.code}</span>
                        <span className="font-semibold text-charcoal">{sheet.category}</span>
                      </div>
                      <span className="text-mutedText text-[11px] sm:max-w-xs text-left sm:text-right">{sheet.desc}</span>
                    </div>
                  ))}
                </div>

                {/* Architectural Drawing Packages Selection */}
                <div className="mt-8 pt-6 border-t border-warm-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <span className="text-[10px] tracking-widest uppercase text-copper font-semibold font-sans">
                        Statutory Licensing Tiers
                      </span>
                      <h3 className="text-2xl font-serif text-charcoal">Available Drawing Packages</h3>
                    </div>
                    {packages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setIsComparePackagesOpen(true)}
                        className="text-xs text-copper hover:text-copper-hover font-sans font-medium flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Compare Package Deliverables</span>
                      </button>
                    )}
                  </div>

                  {loadingPackages ? (
                    <div className="p-8 text-center bg-warm-grey border border-warm-border rounded-2xl flex items-center justify-center gap-2 text-xs text-secondaryText font-sans">
                      <Loader2 className="w-4 h-4 animate-spin text-copper" />
                      <span>Loading verified drawing packages...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {packages.map((pkg, idx) => {
                        const isSelected = selectedPackageId === pkg.id;
                        return (
                          <div
                            key={pkg.id}
                            onClick={() => setSelectedPackageId(pkg.id)}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                              isSelected
                                ? "bg-white border-copper shadow-md ring-1 ring-copper"
                                : "bg-warm-grey/50 border-warm-border hover:border-warm-border/80 hover:bg-white"
                            }`}
                          >
                            {idx === 1 && (
                              <span className="absolute -top-2.5 right-4 bg-copper text-white text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full uppercase">
                                Recommended
                              </span>
                            )}
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <h4 className="font-serif text-base text-charcoal font-medium">
                                  {pkg.name}
                                </h4>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected ? "border-copper bg-copper text-white" : "border-stone-300"
                                }`}>
                                  {isSelected && <Check className="w-3 h-3" />}
                                </div>
                              </div>
                              <div className="text-xl font-serif text-charcoal font-semibold mb-2">
                                {pkg.priceFormatted || `₹${(pkg.pricePaise / 100).toLocaleString("en-IN")}`}
                                <span className="text-[10px] text-mutedText font-normal font-sans ml-1">incl. taxes</span>
                              </div>
                              <p className="text-xs text-secondaryText font-sans mb-3 line-clamp-2">
                                {pkg.description}
                              </p>
                              <div className="space-y-1.5 border-t border-warm-border/60 pt-3">
                                <span className="text-[10px] font-mono text-mutedText uppercase block">
                                  {pkg.deliverables.length} Deliverables:
                                </span>
                                {pkg.deliverables.slice(0, 3).map((d, dIdx) => (
                                  <div key={dIdx} className="flex items-start gap-1.5 text-[11px] text-charcoal font-sans">
                                    <Check className="w-3 h-3 text-copper shrink-0 mt-0.5" />
                                    <span className="truncate">{d}</span>
                                  </div>
                                ))}
                                {pkg.deliverables.length > 3 && (
                                  <span className="text-[10px] text-copper font-medium block">
                                    + {pkg.deliverables.length - 3} more sheets included
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Purchase CTA Bar */}
                  {selectedPackage && (
                    <div className="p-6 bg-charcoal text-white flex flex-col sm:flex-row items-center justify-between gap-5 rounded-2xl">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg sm:text-xl font-serif text-white font-medium">
                            {selectedPackage.name}
                          </span>
                          <span className="text-copper-light text-sm font-mono font-semibold">
                            {selectedPackage.priceFormatted || `₹${(selectedPackage.pricePaise / 100).toLocaleString("en-IN")}`}
                          </span>
                        </div>
                        <div className="text-xs text-white/60 font-sans mt-0.5 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-copper" />
                          <span>Statutory single-build license with S-ARC Escrow buyer guarantee</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={handleDownloadSample}
                          className="w-full sm:w-auto px-5 py-3 min-h-[44px] border border-white/20 hover:bg-white hover:text-charcoal text-white text-xs font-sans font-medium transition-colors rounded-full text-center"
                        >
                          {sampleDownloaded ? "Sample PDF Downloaded!" : "Download Sample Sheet"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setPurchaseSuccess(false);
                            setIsPurchaseModalOpen(true);
                          }}
                          className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-copper hover:bg-copper-hover text-white text-xs font-sans font-medium transition-colors rounded-full text-center shadow-sm flex items-center justify-center gap-2"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Proceed to Escrow Checkout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Architectural Blueprint & Architect Profile (5 cols) */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* Floor Plan Blueprint Viewer */}
              <div className="bg-warm-grey border border-warm-border p-6 space-y-4 rounded-2xl">
                <div className="flex items-center justify-between border-b border-warm-border pb-3">
                  <h3 className="text-lg font-serif text-charcoal">Floor Plan Blueprint</h3>
                  <div className="flex gap-1 font-sans text-xs">
                    {(["ground", "first", "roof"] as const).map((floor) => (
                      <button
                        key={floor}
                        onClick={() => setActiveFloor(floor)}
                        className={`px-2.5 py-1 text-[11px] font-medium capitalize transition-all rounded-full ${
                          activeFloor === floor
                            ? "bg-charcoal text-white"
                            : "bg-white text-charcoal border border-warm-border"
                        }`}
                      >
                        {floor}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Real Floor Plan Blueprint Viewer */}
                {project.floorPlanImage ? (
                  <div className="relative aspect-square w-full bg-white border border-warm-border p-4 flex flex-col items-center justify-center rounded-xl overflow-hidden group">
                    <div className="relative w-full h-full">
                      <Image
                        src={project.floorPlanImage}
                        alt={`${project.name} ${activeFloor} floor plan blueprint`}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsBlueprintEnlarged(true)}
                      className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/75 hover:bg-black text-white text-[11px] font-sans font-medium rounded-full flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <Maximize className="w-3 h-3" />
                      <span>Enlarge Blueprint</span>
                    </button>
                  </div>
                ) : (
                  <div className="aspect-square w-full bg-white border border-warm-border p-6 flex flex-col items-center justify-center text-center space-y-3 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-warm-grey flex items-center justify-center text-charcoal/40">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-serif text-charcoal">Floor Plan Unavailable</p>
                      <p className="text-[11px] text-mutedText font-sans max-w-xs mt-1">
                        Detailed layout schematics for {project.name} are provided directly by {project.architect?.studio || "the studio"} upon client consultation.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsConsultModalOpen(true)}
                      className="px-4 py-1.5 rounded-full border border-copper text-copper text-[11px] font-sans font-medium hover:bg-copper hover:text-white transition-colors"
                    >
                      Request Layout from Studio
                    </button>
                  </div>
                )}
                <div className="text-[11px] text-mutedText text-center font-sans">
                  {project.floorPlanImage
                    ? `Level: ${activeFloor.toUpperCase()} • Architectural CAD Scale 1:100`
                    : "Customized room schematics available on request"}
                </div>
              </div>

              {/* Lead Architect Card */}
              <div className="bg-warm-card border border-warm-border p-6 space-y-4 rounded-2xl">
                <span className="text-[10px] tracking-widest uppercase text-mutedText font-semibold font-sans block">
                  Lead Architect Profile
                </span>
                
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-warm-grey shrink-0 border border-warm-border">
                    <Image src={project.architect?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"} alt={project.architect?.name || "Architect"} fill className="object-cover" />
                  </div>
                  <div>
                    <div className="font-serif text-lg text-charcoal flex items-center gap-1.5">
                      <span>{project.architect?.name || "Verified Architect"}</span>
                      <ShieldCheck className="w-4 h-4 text-copper" />
                    </div>
                    <div className="text-xs text-mutedText font-sans">{project.architect?.studio || "Architectural Studio"}</div>
                    <div className="text-xs text-mutedText font-sans">{project.architect?.location || "South India"}</div>
                  </div>
                </div>

                <div className="pt-2 text-xs font-sans text-secondaryText leading-relaxed">
                  Available for customized plot contour adaptation, municipal clearance assistance, and on-site foundation inspection.
                </div>

                <button
                  type="button"
                  onClick={() => setIsConsultModalOpen(true)}
                  className="w-full py-3 border border-charcoal hover:bg-charcoal hover:text-white text-charcoal text-xs font-sans font-medium tracking-wide flex items-center justify-center gap-2 transition-colors rounded-full"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Request Architect Consultation</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Similar Curated Designs */}
      <section className="py-12 sm:py-14 bg-warm-grey">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-warm-border">
            <div>
              <span className="text-[10px] tracking-widestExtra text-copper uppercase font-sans font-semibold">
                More Inspiration
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-charcoal mt-1">
                Similar Architectural Plans
              </h2>
            </div>

            <Link href="/designs" className="text-xs font-sans font-medium text-charcoal hover:text-copper flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedProjects.map((rel) => (
              <Link
                key={rel.id}
                href={`/designs/${rel.id}`}
                className="group cursor-pointer bg-white border border-warm-border flex flex-col justify-between transition-all duration-300 hover:shadow-card hover:border-charcoal/40 rounded-2xl overflow-hidden"
              >
                <div className="relative aspect-[16/10] w-full bg-charcoal overflow-hidden rounded-t-2xl">
                  <Image src={rel.image} alt={rel.name} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                  <div className="absolute top-3 left-3 bg-black/60 text-white text-[9px] tracking-widest uppercase px-2.5 py-1 font-sans rounded-full">
                    {rel.style}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/95 text-charcoal text-xs font-semibold px-2.5 py-1 font-sans rounded-full">
                    {rel.price}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-serif text-charcoal group-hover:text-copper transition-colors">
                    {rel.name}
                  </h3>
                  <div className="text-xs text-mutedText font-sans mt-0.5">
                    {rel.location} • {rel.plotSize} • {rel.bedrooms} BHK
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer onOpenSellerModal={() => setIsSellerModalOpen(true)} />

      <SellerModal
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
      />

      {/* Real Consultation Modal */}
      {isConsultModalOpen && (
        <ConsultArchitectModal
          project={project}
          locationName={project.location}
          onClose={() => setIsConsultModalOpen(false)}
        />
      )}

      {/* Enlarged Blueprint Lightbox Modal */}
      {isBlueprintEnlarged && project.floorPlanImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="blueprint-modal-title"
          onClick={() => setIsBlueprintEnlarged(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-3xl p-6 sm:p-8 overflow-hidden flex flex-col items-center shadow-2xl border border-warm-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-4 border-b border-warm-border">
              <div>
                <span className="text-[10px] tracking-wider uppercase font-mono text-copper font-semibold">
                  Architectural CAD Blueprint
                </span>
                <h3 id="blueprint-modal-title" className="text-lg font-serif text-charcoal">
                  {project.name} &mdash; {activeFloor.toUpperCase()} Level Schematic
                </h3>
              </div>
              <button
                onClick={() => setIsBlueprintEnlarged(false)}
                className="w-8 h-8 rounded-full border border-warm-border hover:bg-warm-grey flex items-center justify-center text-charcoal transition-colors"
                aria-label="Close enlarged blueprint"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] mt-4 bg-warm-grey/30 rounded-2xl overflow-hidden p-2">
              <Image
                src={project.floorPlanImage}
                alt={`${project.name} floor plan enlarged`}
                fill
                className="object-contain"
              />
            </div>
            <div className="w-full text-center mt-3 text-xs text-mutedText font-sans">
              Scale 1:100 • DWG Layered Vector Sheets included in licensed package
            </div>
          </div>
        </div>
      )}

      {/* Compare Drawing Packages Modal */}
      {isComparePackagesOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsComparePackagesOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-3xl p-6 sm:p-8 overflow-y-auto shadow-2xl border border-warm-border flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-warm-border">
                <div>
                  <span className="text-[10px] tracking-widest uppercase font-mono text-copper font-semibold">
                    Package Comparison Matrix
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif text-charcoal">
                    Drawing Packages for {project.name}
                  </h3>
                </div>
                <button
                  onClick={() => setIsComparePackagesOpen(false)}
                  className="w-8 h-8 rounded-full border border-warm-border hover:bg-warm-grey flex items-center justify-center text-charcoal transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Comparison Table */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-warm-border">
                      <th className="py-3 px-4 font-semibold text-charcoal w-1/3">Included Deliverable</th>
                      {packages.map((pkg) => (
                        <th key={pkg.id} className="py-3 px-4 text-center">
                          <div className="font-serif text-sm text-charcoal">{pkg.name}</div>
                          <div className="font-mono text-xs text-copper font-semibold mt-0.5">
                            {pkg.priceFormatted || `₹${(pkg.pricePaise / 100).toLocaleString("en-IN")}`}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-border/60">
                    {Array.from(new Set(packages.flatMap((p) => p.deliverables))).map((deliv, idx) => (
                      <tr key={idx} className="hover:bg-warm-grey/30">
                        <td className="py-3 px-4 font-medium text-charcoal">{deliv}</td>
                        {packages.map((pkg) => {
                          const includes = pkg.deliverables.includes(deliv);
                          return (
                            <td key={pkg.id} className="py-3 px-4 text-center">
                              {includes ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                              ) : (
                                <span className="text-stone-300 font-mono">&mdash;</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-warm-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-secondaryText font-sans">
                All packages carry statutory Council of Architecture single-build copyright clearance.
              </span>
              <button
                onClick={() => setIsComparePackagesOpen(false)}
                className="px-6 py-2 rounded-full bg-charcoal text-white text-xs font-sans font-medium hover:bg-copper transition-colors"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escrow Purchase & Checkout Modal */}
      {isPurchaseModalOpen && selectedPackage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsPurchaseModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div
            className="relative max-w-xl w-full max-h-[90vh] bg-white rounded-3xl p-6 sm:p-8 overflow-y-auto shadow-2xl border border-warm-border"
            onClick={(e) => e.stopPropagation()}
          >
            {!purchaseSuccess ? (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-warm-border">
                  <div>
                    <span className="text-[10px] tracking-widest uppercase font-mono text-copper font-semibold flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-copper" />
                      <span>S-ARC Escrow Checkout</span>
                    </span>
                    <h3 className="text-xl font-serif text-charcoal mt-0.5">
                      Single-Build Architectural License
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsPurchaseModalOpen(false)}
                    className="w-8 h-8 rounded-full border border-warm-border hover:bg-warm-grey flex items-center justify-center text-charcoal transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Selected Package Summary Card */}
                <div className="mt-5 p-4 rounded-2xl bg-warm-grey/60 border border-warm-border space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-mutedText">Design Selection</div>
                      <h4 className="font-serif text-base text-charcoal font-medium">{project.name}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono uppercase text-mutedText">Licensed Package</div>
                      <div className="font-serif text-sm font-semibold text-charcoal">{selectedPackage.name}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-warm-border/60 flex items-center justify-between text-xs font-sans">
                    <span className="text-secondaryText">Architect Studio:</span>
                    <span className="font-medium text-copper">{project.architect?.name || "Verified Architect"} ({project.architect?.studio || "Studio"})</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="text-secondaryText">Total Payable:</span>
                    <span className="font-mono text-base font-bold text-charcoal">
                      {selectedPackage.priceFormatted || `₹${(selectedPackage.pricePaise / 100).toLocaleString("en-IN")}`}
                    </span>
                  </div>
                </div>

                {/* Escrow Guarantee Disclaimer */}
                <div className="mt-4 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 font-sans space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-amber-950">
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    <span>S-ARC 7-Day Escrow Buyer Protection</span>
                  </div>
                  <p className="leading-relaxed">
                    Your payment remains in statutory escrow for 7 days. CAD drawings, DWG files, and structural calculations are unlocked immediately. Funds are disbursed to the architect only after buyer inspection.
                  </p>
                </div>

                {/* Buyer Licensing Details Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const license = `SARC-LIC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
                    setGeneratedLicense(license);
                    setPurchaseSuccess(true);
                  }}
                  className="mt-5 space-y-3.5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-charcoal mb-1 font-sans">
                        Full Name / Plot Owner *
                      </label>
                      <input
                        type="text"
                        required
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder="e.g. Adv. K. Ramesh"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-warm-border outline-none focus:border-copper"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-charcoal mb-1 font-sans">
                        Email Address (CAD Delivery) *
                      </label>
                      <input
                        type="email"
                        required
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        placeholder="name@domain.com"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-warm-border outline-none focus:border-copper"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-charcoal mb-1 font-sans">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        placeholder="+91 98470 12345"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-warm-border outline-none focus:border-copper"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-charcoal mb-1 font-sans">
                        Construction Site Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={buyerLocation}
                        onChange={(e) => setBuyerLocation(e.target.value)}
                        placeholder="e.g. Aluva, Ernakulam, Kerala"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-warm-border outline-none focus:border-copper"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-warm-border flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPurchaseModalOpen(false)}
                      className="px-4 py-2.5 rounded-full border border-warm-border text-xs font-sans text-secondaryText hover:text-charcoal"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 px-6 rounded-full bg-copper hover:bg-copper-hover text-white text-xs font-medium font-sans flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Confirm & Authorize Escrow ({selectedPackage.priceFormatted || `₹${(selectedPackage.pricePaise / 100).toLocaleString("en-IN")}`})</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 font-semibold block">
                    Escrow Authorization Successful
                  </span>
                  <h3 className="text-2xl font-serif text-charcoal mt-1">
                    Building License Issued
                  </h3>
                  <p className="text-xs text-secondaryText font-sans max-w-md mx-auto mt-1">
                    Your single-build residential construction license for <strong className="text-charcoal">{project.name}</strong> has been secured in escrow.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-warm-grey border border-warm-border text-xs font-mono space-y-1.5 text-left max-w-sm mx-auto">
                  <div className="flex justify-between">
                    <span className="text-secondaryText">License Number:</span>
                    <span className="font-bold text-copper">{generatedLicense}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondaryText">Licensed Plan:</span>
                    <span className="text-charcoal">{project.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondaryText">Package Tier:</span>
                    <span className="text-charcoal">{selectedPackage.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondaryText">Site Location:</span>
                    <span className="text-charcoal">{buyerLocation}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleDownloadSample}
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-charcoal hover:bg-copper text-white text-xs font-sans font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-copper-light" />
                    <span>Download Licensed Blueprint Set (PDF)</span>
                  </button>
                  <button
                    onClick={() => setIsPurchaseModalOpen(false)}
                    className="w-full sm:w-auto px-5 py-3 rounded-full border border-warm-border text-xs font-sans text-secondaryText hover:text-charcoal"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sticky Mobile Action Bar (Jakob's Law: Standard Airbnb/Zillow mobile listing pattern) */}
      <aside 
        aria-label="Design booking and consultation actions"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-warm-border p-3.5 px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3"
      >
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono tracking-wider text-mutedText">
            Starting License
          </span>
          <div className="font-serif text-lg font-normal text-charcoal flex items-baseline gap-1">
            <span>{project.price || "₹45,000"}</span>
            <span className="text-[10px] font-sans text-mutedText">/ Blueprint</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSave(project.id)}
            className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all ${
              bookmarked
                ? "bg-copper text-white border-copper shadow-sm"
                : "border-warm-border text-charcoal hover:border-copper bg-warm-card"
            }`}
            aria-label={bookmarked ? "Remove from shortlist" : "Save to shortlist"}
          >
            {bookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsConsultModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-copper hover:bg-copper-hover text-white text-xs font-sans font-medium transition-colors shadow-sm flex items-center gap-1.5 min-h-[44px]"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Consult Studio</span>
          </button>
        </div>
      </aside>
    </main>
  );
}

