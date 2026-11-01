"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SellerModal from "@/components/SellerModal";
import { FEATURED_PROJECTS } from "@/lib/data";
import { useSavedProjects } from "@/lib/savedProjectsContext";
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
  Compass
} from "lucide-react";

export default function ProjectDetailClient() {
  const params = useParams();
  const projectId = params?.id as string;
  const project = FEATURED_PROJECTS.find((p) => p.id === projectId);

  const { isSaved, toggleSave } = useSavedProjects();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeFloor, setActiveFloor] = useState<"ground" | "first" | "roof">("ground");
  const [sampleDownloaded, setSampleDownloaded] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);

  if (!project) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-36 pb-20 text-center max-w-md mx-auto px-6">
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
    <main className="min-h-screen bg-white">
      <Navbar onOpenSellerModal={() => setIsSellerModalOpen(true)} />

      {/* Breadcrumb & Header Bar */}
      <section className="pt-32 pb-8 bg-warm-grey border-b border-warm-border">
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
              <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-secondaryText">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-copper" />
                  {project.location}
                </span>
                <span>•</span>
                <span>By {project.architect.name} ({project.architect.studio})</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-copper font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  COA Certified Plan
                </span>
              </div>
            </div>

            {/* Quick Pricing & Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => toggleSave(project.id)}
                className={`p-3 border transition-colors flex items-center gap-1.5 text-xs font-sans font-medium rounded-full ${
                  bookmarked
                    ? "bg-copper text-white border-copper"
                    : "bg-white text-charcoal border-warm-border hover:border-charcoal"
                }`}
                title="Save to shortlist"
              >
                {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{bookmarked ? "Shortlisted" : "Shortlist"}</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Project URL copied to clipboard!");
                }}
                className="p-3 bg-white border border-warm-border hover:border-charcoal text-charcoal transition-colors rounded-full"
                title="Share project"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <a
                href="#download-package"
                className="px-6 py-3 bg-charcoal hover:bg-copper text-white text-xs font-sans font-medium tracking-wide transition-colors rounded-full"
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
      <section className="py-16 sm:py-24 bg-white border-b border-warm-border">
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
                    DWG + BIM + PDF
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

                {/* Instant Purchase & Sample Download */}
                <div className="mt-6 p-6 bg-charcoal text-white flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl">
                  <div>
                    <div className="text-xl sm:text-2xl font-serif text-white">{project.price}</div>
                    <div className="text-xs text-white/60 font-sans mt-0.5">Includes lifetime building license for one site</div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => setSampleDownloaded(true)}
                      className="w-full sm:w-auto px-5 py-3 border border-white/20 hover:bg-white hover:text-charcoal text-white text-xs font-sans font-medium transition-colors rounded-full"
                    >
                      {sampleDownloaded ? "Sample Sheet Downloaded!" : "Download Sample Sheet"}
                    </button>

                    <button
                      onClick={() => alert(`Proceeding to checkout for ${project.name} CAD Package (${project.price}). Escrow payment gateway will open.`)}
                      className="w-full sm:w-auto px-6 py-3 bg-copper hover:bg-copper-hover text-white text-xs font-sans font-medium transition-colors rounded-full"
                    >
                      Purchase CAD Package
                    </button>
                  </div>
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

                {/* CAD Schematic graphic */}
                <div className="relative aspect-square w-full bg-white border border-warm-border p-4 flex items-center justify-center rounded-xl">
                  <svg viewBox="0 0 240 240" className="w-full h-full text-charcoal/80" fill="none">
                    <defs>
                      <pattern id="planGrid" width="12" height="12" patternUnits="userSpaceOnUse">
                        <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#E8E6E2" strokeWidth="0.6" />
                      </pattern>
                    </defs>
                    <rect width="240" height="240" fill="url(#planGrid)" />
                    <rect x="25" y="25" width="190" height="190" stroke="#171717" strokeWidth="2.5" fill="#FAFAF9" />
                    <line x1="25" y1="120" x2="215" y2="120" stroke="#171717" strokeWidth="1.8" />
                    <line x1="120" y1="25" x2="120" y2="215" stroke="#171717" strokeWidth="1.8" />
                    
                    {/* Courtyard / Core */}
                    <rect x="90" y="90" width="60" height="60" stroke="#AD8065" strokeWidth="1.5" strokeDasharray="3 2" fill="#F5F4F1" />
                    <text x="96" y="125" fontSize="8" fill="#AD8065" fontWeight="bold">COURTYARD</text>

                    {/* Room tags */}
                    <text x="40" y="60" fontSize="8" fill="#171717" fontWeight="bold">LIVING ROOM</text>
                    <text x="40" y="72" fontSize="7" fill="#777">18&apos;-0&quot; x 16&apos;-0&quot;</text>

                    <text x="140" y="60" fontSize="8" fill="#171717" fontWeight="bold">DINING & PANTRY</text>
                    <text x="140" y="72" fontSize="7" fill="#777">14&apos;-6&quot; x 12&apos;-0&quot;</text>

                    <text x="40" y="160" fontSize="8" fill="#171717" fontWeight="bold">MASTER SUITE</text>
                    <text x="40" y="172" fontSize="7" fill="#777">16&apos;-0&quot; x 15&apos;-0&quot;</text>

                    <text x="140" y="160" fontSize="8" fill="#171717" fontWeight="bold">GUEST SUITE</text>
                    <text x="140" y="172" fontSize="7" fill="#777">14&apos;-0&quot; x 13&apos;-6&quot;</text>
                  </svg>
                </div>
                <div className="text-[11px] text-mutedText text-center font-sans">
                  CAD Blueprint Scale 1:100 • DWG vector layers included
                </div>
              </div>

              {/* Lead Architect Card */}
              <div className="bg-warm-card border border-warm-border p-6 space-y-4 rounded-2xl">
                <span className="text-[10px] tracking-widest uppercase text-mutedText font-semibold font-sans block">
                  Lead Architect Profile
                </span>
                
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-warm-grey shrink-0 border border-warm-border">
                    <Image src={project.architect.image} alt={project.architect.name} fill className="object-cover" />
                  </div>
                  <div>
                    <div className="font-serif text-lg text-charcoal flex items-center gap-1.5">
                      <span>{project.architect.name}</span>
                      <ShieldCheck className="w-4 h-4 text-copper" />
                    </div>
                    <div className="text-xs text-mutedText font-sans">{project.architect.studio}</div>
                    <div className="text-xs text-mutedText font-sans">{project.architect.location}</div>
                  </div>
                </div>

                <div className="pt-2 text-xs font-sans text-secondaryText leading-relaxed">
                  Available for customized plot contour adaptation, municipal clearance assistance, and on-site foundation inspection.
                </div>

                {inquirySent ? (
                  <div className="p-3 bg-copper/10 border border-copper text-xs font-sans text-charcoal flex items-center gap-2 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-copper" />
                    <span>Inquiry sent! Ar. {project.architect.name} will respond within 4 hours.</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setInquirySent(true)}
                    className="w-full py-3 border border-charcoal hover:bg-charcoal hover:text-white text-charcoal text-xs font-sans font-medium tracking-wide flex items-center justify-center gap-2 transition-colors rounded-full"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Request Architect Consultation</span>
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Similar Curated Designs */}
      <section className="py-20 bg-warm-grey">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between mb-10 pb-3 border-b border-warm-border">
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
    </main>
  );
}

