"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSavedProjects } from "@/lib/savedProjectsContext";
import { useProjects } from "@/lib/projectsContext";
import { useAuth } from "@/lib/authContext";
import { SavedPlotRecord } from "@/lib/types";
import { 
  Download, 
  Bookmark, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Building, 
  ShieldCheck, 
  Briefcase, 
  X, 
  FileCheck, 
  Send, 
  Loader2,
  Compass,
  MapPin,
  Ruler,
  Trash2,
  ExternalLink,
  MessageSquare,
  Sparkles
} from "lucide-react";

export default function HomeownerView() {
  const { currentUser, applyForArchitectUpgrade } = useAuth();
  const { savedProjects } = useSavedProjects();
  const { inquiries } = useProjects();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Saved Plots State (Plot Intelligence Integration)
  const [savedPlots, setSavedPlots] = useState<SavedPlotRecord[]>([]);
  const [loadingPlots, setLoadingPlots] = useState(true);
  const [deletingPlotId, setDeletingPlotId] = useState<string | null>(null);

  // Upgrade Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [practiceType, setPracticeType] = useState<"freelance" | "agency">("freelance");
  const [studioName, setStudioName] = useState("");
  const [coaNumber, setCoaNumber] = useState("");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [location, setLocation] = useState(currentUser?.location || "Kochi, Kerala");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  // Modal Escape key listener and body scroll lock
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  // Fetch Saved Plots for this user
  const fetchPlots = async () => {
    try {
      setLoadingPlots(true);
      const res = await fetch("/api/plots");
      if (res.ok) {
        const data = await res.json();
        setSavedPlots(data.plots || []);
      }
    } catch (err) {
      console.error("Failed to fetch user plots:", err);
    } finally {
      setLoadingPlots(false);
    }
  };

  useEffect(() => {
    fetchPlots();
  }, []);

  const handleDeletePlot = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this saved plot measurement?")) return;

    setDeletingPlotId(id);
    try {
      const res = await fetch(`/api/plots/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSavedPlots((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Error deleting plot:", err);
    } finally {
      setDeletingPlotId(null);
    }
  };

  // Client's purchased blueprints (Ramesh demo persona or real account purchases)
  const isDemoClient = currentUser?.email === "ramesh.client@gmail.com";
  const purchasedPackages = isDemoClient
    ? [
        {
          id: "pkg-01",
          projectName: "The Ridge House",
          architect: "Studio Vayu (Ar. Nikhil Rajan)",
          purchaseDate: "Oct 15, 2026",
          amountPaid: "₹85,000",
          licenseNumber: "SARC-LIC-2026-8812",
          sheetCount: 42,
          dwgSize: "48.2 MB",
          image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        },
      ]
    : [];

  // Inquiries made by this specific account
  const myInquiries = inquiries.filter((i) => {
    if (isDemoClient && i.clientName.includes("Ramesh")) return true;
    return (
      currentUser?.email &&
      i.clientEmail?.toLowerCase() === currentUser.email.toLowerCase()
    );
  });

  const handleDownload = (id: string) => {
    setDownloadSuccess(id);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studioName.trim() || !coaNumber.trim()) {
      alert("Please provide your Studio/Firm Name and Council of Architecture (CoA) Registration Number.");
      return;
    }

    setIsSubmitting(true);
    try {
      await applyForArchitectUpgrade({
        practiceType,
        studioName: studioName.trim(),
        coaNumber: coaNumber.trim().toUpperCase(),
        phone: phone.trim(),
        location: location.trim(),
        portfolioUrl: portfolioUrl.trim(),
        bio: bio.trim(),
      });
      setApplicationSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setApplicationSuccess(false);
      }, 1500);
    } catch (err) {
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPendingVerification = currentUser?.status === "pending_verification";

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      {/* 1. Saved Plots & GIS Land Measurements (Core Landowner Requirement) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-serif text-charcoal">
                Saved Plots & Land Measurements
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-copper/15 text-copper text-[11px] font-mono font-semibold">
                {savedPlots.length} Measured
              </span>
            </div>
            <p className="text-xs text-secondaryText font-sans mt-0.5">
              Geospatial plot telemetry, boundary dimensions, and matched architectural plan recommendations.
            </p>
          </div>

          <Link
            href="/plot-intelligence"
            className="px-5 py-2.5 rounded-full bg-copper hover:bg-copper-hover text-white text-xs font-sans font-medium flex items-center gap-2 transition-all shadow-sm self-start sm:self-auto shrink-0"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Measure New Plot (GIS)</span>
          </Link>
        </div>

        {loadingPlots ? (
          <div className="p-12 text-center bg-white border border-warm-border rounded-3xl flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-copper" />
            <span className="text-xs text-secondaryText font-sans">
              Loading your saved plot telemetry...
            </span>
          </div>
        ) : savedPlots.length === 0 ? (
          <div className="p-8 sm:p-10 text-center bg-white border border-warm-border rounded-3xl space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-copper/10 border border-copper/20 text-copper flex items-center justify-center mx-auto shadow-sm">
              <Compass className="w-7 h-7 text-copper" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h4 className="font-serif text-lg text-charcoal">
                No Land Plots Measured Yet
              </h4>
              <p className="text-xs text-secondaryText font-sans leading-relaxed">
                Open the interactive satellite workspace to mark your land boundaries. S-ARC automatically calculates your land in Kerala Cents and matches construction-ready blueprints tailored to your plot geometry.
              </p>
            </div>
            <Link
              href="/plot-intelligence"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-charcoal hover:bg-copper text-white text-xs font-sans font-medium transition-all shadow-sm"
            >
              <Compass className="w-3.5 h-3.5 text-copper-light" />
              <span>Launch Plot Intelligence Map</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPlots.map((plot) => (
              <div
                key={plot.id}
                className="bg-white border border-warm-border rounded-3xl p-6 shadow-sm hover:border-copper/40 transition-all flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-copper font-semibold block">
                        Kerala Residential Plot
                      </span>
                      <h4 className="font-serif text-lg text-charcoal group-hover:text-copper transition-colors line-clamp-1">
                        {plot.name}
                      </h4>
                    </div>

                    <button
                      onClick={(e) => handleDeletePlot(plot.id, e)}
                      disabled={deletingPlotId === plot.id}
                      className="p-1.5 rounded-xl text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete Plot"
                    >
                      {deletingPlotId === plot.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Location Pin */}
                  <div className="flex items-center gap-1.5 text-xs text-secondaryText font-sans">
                    <MapPin className="w-3.5 h-3.5 text-copper/80 shrink-0" />
                    <span className="truncate">{plot.location_name || "South India"}</span>
                  </div>

                  {/* Primary Measurement Pill */}
                  <div className="p-3.5 rounded-2xl bg-warm-grey/60 border border-warm-border/60 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-sans uppercase tracking-wider text-secondaryText">
                        Total Land Area
                      </div>
                      <div className="font-mono text-base font-bold text-copper">
                        {plot.area_cents.toFixed(2)} Cents
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-sans uppercase tracking-wider text-secondaryText">
                        Square Footage
                      </div>
                      <div className="font-mono text-xs font-semibold text-charcoal">
                        {plot.area_sqft.toLocaleString()} Sq.Ft
                      </div>
                    </div>
                  </div>

                  {/* Boundary Telemetry Details */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-warm-border/40">
                    <div className="p-2 rounded-xl bg-stone-50">
                      <div className="text-[9px] font-mono text-secondaryText uppercase">Frontage</div>
                      <div className="text-xs font-mono font-medium text-charcoal mt-0.5">
                        {plot.frontage_ft ? `${plot.frontage_ft.toFixed(1)} ft` : "--"}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-50">
                      <div className="text-[9px] font-mono text-secondaryText uppercase">Depth</div>
                      <div className="text-xs font-mono font-medium text-charcoal mt-0.5">
                        {plot.depth_ft ? `${plot.depth_ft.toFixed(1)} ft` : "--"}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-50">
                      <div className="text-[9px] font-mono text-secondaryText uppercase">Perimeter</div>
                      <div className="text-xs font-mono font-medium text-charcoal mt-0.5">
                        {plot.perimeter_ft ? `${plot.perimeter_ft.toFixed(1)} ft` : "--"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Open in Map Action */}
                <div className="pt-2 border-t border-warm-border/50">
                  <Link
                    href={`/plot-intelligence?plotId=${plot.id}`}
                    className="w-full py-2.5 rounded-xl bg-charcoal hover:bg-copper text-white text-xs font-sans font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-copper-light" />
                    <span>Open in Plot Intelligence</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Shortlisted Architectural Designs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-serif text-charcoal">
              Shortlisted Architectural Designs
            </h3>
            <p className="text-xs text-secondaryText font-sans mt-0.5">
              Compare plot dimensions, Vastu orientation, and room layouts side by side.
            </p>
          </div>
          <span className="text-xs font-mono text-secondaryText">
            {savedProjects.length} Bookmarked
          </span>
        </div>

        {savedProjects.length === 0 ? (
          <div className="p-8 sm:p-10 text-center bg-white border border-warm-border rounded-3xl space-y-3 shadow-sm">
            <Bookmark className="w-8 h-8 text-secondaryText/40 mx-auto" />
            <div className="text-base font-serif text-charcoal">No Saved Designs Yet</div>
            <p className="text-xs text-secondaryText font-sans max-w-sm mx-auto">
              Explore our curated marketplace of verified Southern Indian architectural blueprints and bookmark your favorites.
            </p>
            <div className="pt-2">
              <Link
                href="/designs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-copper hover:bg-copper-hover text-white text-xs font-sans font-medium transition-all shadow-sm"
              >
                <span>Browse Design Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProjects.map((p) => (
              <Link
                key={p.id}
                href={`/designs/${p.id}`}
                className="group bg-white border border-warm-border rounded-3xl overflow-hidden hover:border-copper/40 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full bg-charcoal">
                    <Image 
                      src={p.image} 
                      alt={p.name} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform" 
                    />
                    <span className="absolute top-3 right-3 bg-white/95 text-charcoal text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm font-mono">
                      {p.price}
                    </span>
                  </div>
                  <div className="p-5 space-y-2">
                    <h4 className="font-serif text-lg text-charcoal group-hover:text-copper transition-colors">
                      {p.name}
                    </h4>
                    <div className="text-xs text-secondaryText font-sans">
                      {p.style} • {p.plotSize}
                    </div>
                    <div className="text-xs text-copper font-medium flex items-center gap-1 pt-1">
                      <span>View Blueprint Specifications</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 3. Custom Consultations & Modification Inquiries */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-serif text-charcoal">
            Customization Requests & Architect Quotes
          </h3>
          <p className="text-xs text-secondaryText font-sans mt-0.5">
            Direct communications with licensed architects regarding site adjustments, Vastu changes, and turnkey coordination.
          </p>
        </div>

        {myInquiries.length === 0 ? (
          <div className="p-8 sm:p-10 text-center bg-white border border-warm-border rounded-3xl space-y-3 shadow-sm">
            <MessageSquare className="w-8 h-8 text-secondaryText/40 mx-auto" />
            <div className="text-base font-serif text-charcoal">No Consultation Inquiries Yet</div>
            <p className="text-xs text-secondaryText font-sans max-w-sm mx-auto">
              When you submit a customization request or site inquiry on any design page, licensed studios will review your site conditions and reply here.
            </p>
            <div className="pt-2">
              <Link
                href="/designs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-warm-border hover:border-copper text-xs font-sans font-medium text-charcoal transition-all"
              >
                <span>Find a Plan to Inquire</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {myInquiries.map((inq) => (
              <div
                key={inq.id}
                className="p-6 bg-white border border-warm-border rounded-3xl shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-serif text-base text-charcoal font-medium">
                        Design Inquiry: {inq.projectName}
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono ${
                        inq.status === "responded"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}>
                        {inq.status === "responded" ? "✓ Architect Replied" : "Awaiting Studio Review"}
                      </span>
                    </div>
                    <div className="text-xs text-secondaryText font-sans mt-0.5">
                      Site: {inq.plotLocation} • Sent {inq.date}
                    </div>
                  </div>

                  <span className="text-xs font-mono text-copper font-medium">
                    Budget: {inq.budgetRange}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-warm-grey/50 border border-warm-border/60 text-xs text-charcoal font-sans">
                  <span className="text-secondaryText font-medium block mb-1">Your Note:</span>
                  &ldquo;{inq.message}&rdquo;
                </div>

                {inq.replyText && (
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 font-sans space-y-1">
                    <div className="flex items-center justify-between font-mono text-[11px] text-emerald-800 font-semibold">
                      <span>Studio Official Response:</span>
                      <span>{inq.respondedAt || "Recently"}</span>
                    </div>
                    <p className="leading-relaxed">{inq.replyText}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Licensed Blueprint Packages */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-serif text-charcoal">Purchased Blueprint Packages</h3>
          <p className="text-xs text-secondaryText font-sans mt-0.5">
            Full construction-ready CAD drawings, structural BOQ, and MEP schedules with digital single-build licenses.
          </p>
        </div>

        {purchasedPackages.length === 0 ? (
          <div className="p-8 sm:p-10 text-center bg-white border border-warm-border rounded-3xl space-y-3 shadow-sm">
            <FileCheck className="w-8 h-8 text-secondaryText/40 mx-auto" />
            <div className="text-base font-serif text-charcoal">No Licensed Blueprints Yet</div>
            <p className="text-xs text-secondaryText font-sans max-w-sm mx-auto">
              Licensed blueprint packages include complete 40+ sheet architectural DWG drawings, structural calculation notes, and MEP specifications.
            </p>
            <div className="pt-2">
              <Link
                href="/designs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-charcoal hover:bg-copper text-white text-xs font-sans font-medium transition-all shadow-sm"
              >
                <span>Browse Verified Blueprints</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {purchasedPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-6 bg-white border border-warm-border rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-5">
                  <div className="relative w-24 h-20 rounded-2xl overflow-hidden bg-charcoal shrink-0">
                    <Image src={pkg.image} alt={pkg.projectName} fill className="object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-xl text-charcoal">{pkg.projectName}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono">
                        ✓ Licensed
                      </span>
                    </div>
                    <div className="text-xs text-secondaryText font-sans mt-0.5">
                      By {pkg.architect} • Paid {pkg.amountPaid} on {pkg.purchaseDate}
                    </div>
                    <div className="text-[11px] font-mono text-copper font-medium mt-1">
                      License: {pkg.licenseNumber} ({pkg.sheetCount} A1 Sheets • {pkg.dwgSize})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDownload(pkg.id)}
                    className="px-5 py-2.5 rounded-full bg-charcoal hover:bg-copper text-white text-xs font-medium flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Download className="w-4 h-4 text-copper-light" />
                    <span>Download Full CAD Package (.ZIP)</span>
                  </button>
                </div>
              </div>
            ))}

            {downloadSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Full 42-Sheet CAD Drawing Package (.ZIP) download initiated with structural calculation notes.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Practice Partnership / Architect Verification Status */}
      {isPendingVerification ? (
        <div className="p-6 sm:p-7 bg-amber-50/90 border border-amber-300 rounded-3xl space-y-3">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300">
              <Clock className="w-5 h-5 text-amber-700" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg text-charcoal font-semibold">
                  Architectural Practice Verification Under Review
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200/60 text-amber-900 border border-amber-300 text-[10px] font-mono font-medium">
                  Administrative Queue
                </span>
              </div>
              <p className="text-xs text-secondaryText font-sans leading-relaxed">
                Your application as a <strong className="text-charcoal">{currentUser?.practiceType === "agency" ? "Architecture Agency Firm" : "Freelance Architect"}</strong> ({currentUser?.studioName || "Studio"} • CoA: {currentUser?.coaNumber || "Submitted"}) is currently being audited by the S-ARC Administration. Publishing privileges will be activated once your Council of Architecture credentials are verified.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-8 bg-stone-900 text-white rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 border border-stone-800">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-copper/30 text-copper-light border border-copper/40 text-[10px] font-mono uppercase tracking-wider">
                Practice Partnership
              </span>
              <span className="text-[11px] text-stone-400 font-sans">Statutory Review</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif text-white">
              Are you a Freelance Architect or Architecture Firm?
            </h3>
            <p className="text-xs text-stone-300 font-sans leading-relaxed">
              Apply for administrative verification to publish your verified residential plans to over 10,000 South Indian landowners and receive direct design commissions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-full bg-copper hover:bg-copper-hover text-white text-xs font-sans font-medium flex items-center justify-center gap-2 transition-all shadow-md shrink-0 self-start md:self-auto"
          >
            <Briefcase className="w-4 h-4" />
            <span>Apply for Practice Verification</span>
          </button>
        </div>
      )}

      {/* Practice Verification Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="upgrade-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white border border-warm-border rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors p-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-copper" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-copper font-semibold">
                  Practice Verification Application
                </span>
              </div>
              <h3 id="upgrade-modal-title" className="text-2xl font-serif text-charcoal">
                Apply for Practice Verification
              </h3>
              <p className="text-xs text-secondaryText font-sans">
                Freelance architects and design agencies undergo statutory compliance review by the S-ARC Administration before publishing blueprints.
              </p>
            </div>

            {applicationSuccess ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-serif text-lg text-emerald-950 font-medium">Application Dispatched</h4>
                <p className="text-xs text-emerald-800 font-sans">
                  Your credentials have been submitted to the Admin verification queue.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                {/* Practice Type Selector */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-sans uppercase tracking-wider text-stone-500 font-medium">
                    Practice Classification
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPracticeType("freelance")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        practiceType === "freelance"
                          ? "border-copper bg-copper/5 text-charcoal ring-1 ring-copper"
                          : "border-warm-border bg-[#FAF9F6] text-secondaryText hover:border-stone-400"
                      }`}
                    >
                      <div className="font-serif text-xs font-semibold">Freelance Architect</div>
                      <div className="text-[10px] text-stone-500 font-sans mt-0.5">Individual licensed practitioner</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPracticeType("agency")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        practiceType === "agency"
                          ? "border-copper bg-copper/5 text-charcoal ring-1 ring-copper"
                          : "border-warm-border bg-[#FAF9F6] text-secondaryText hover:border-stone-400"
                      }`}
                    >
                      <div className="font-serif text-xs font-semibold">Architecture Firm / Agency</div>
                      <div className="text-[10px] text-stone-500 font-sans mt-0.5">Studio / Corporate practice</div>
                    </button>
                  </div>
                </div>

                {/* Studio / Firm Name */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-sans uppercase tracking-wider text-stone-500 font-medium">
                    {practiceType === "agency" ? "Firm / Agency Name" : "Studio / Practice Name"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    placeholder="e.g. Studio Vayu or Menon Architects"
                    className="w-full border border-warm-border p-3 text-xs text-charcoal outline-none focus:border-charcoal bg-[#FAF9F6] focus:bg-white rounded-xl font-sans"
                  />
                </div>

                {/* Council of Architecture (CoA) Registration */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-sans uppercase tracking-wider text-stone-500 font-medium">
                      Council of Architecture (CoA) No. *
                    </label>
                    <span className="text-[10px] font-mono text-copper">Format: CA/YYYY/XXXXX</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={coaNumber}
                    onChange={(e) => setCoaNumber(e.target.value)}
                    placeholder="CA/2018/89412"
                    className="w-full border border-warm-border p-3 text-xs text-charcoal outline-none focus:border-charcoal bg-[#FAF9F6] focus:bg-white rounded-xl font-mono uppercase"
                  />
                </div>

                {/* Location and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-sans uppercase tracking-wider text-stone-500 font-medium">
                      Operating City / State
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Kochi, Kerala"
                      className="w-full border border-warm-border p-3 text-xs text-charcoal outline-none focus:border-charcoal bg-[#FAF9F6] focus:bg-white rounded-xl font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-sans uppercase tracking-wider text-stone-500 font-medium">
                      Official Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98471 28910"
                      className="w-full border border-warm-border p-3 text-xs text-charcoal outline-none focus:border-charcoal bg-[#FAF9F6] focus:bg-white rounded-xl font-sans"
                    />
                  </div>
                </div>

                {/* Portfolio URL */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-sans uppercase tracking-wider text-stone-500 font-medium">
                    Portfolio / Website / Instagram
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://studiovayu.arch or https://instagram.com/studio"
                    className="w-full border border-warm-border p-3 text-xs text-charcoal outline-none focus:border-charcoal bg-[#FAF9F6] focus:bg-white rounded-xl font-sans"
                  />
                </div>

                {/* Architectural Bio / Philosophy */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-sans uppercase tracking-wider text-stone-500 font-medium">
                    Architectural Philosophy / Brief
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Briefly describe your design ethos (e.g. Tropical modernism, vernacular timber work, passive climate cooling)..."
                    className="w-full border border-warm-border p-3 text-xs text-charcoal outline-none focus:border-charcoal bg-[#FAF9F6] focus:bg-white rounded-xl font-sans resize-none"
                  />
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 font-sans flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    By submitting, you certify that all Council of Architecture credentials are valid and active. The Administration verifies registrations against official statutory gazettes.
                  </span>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-charcoal hover:bg-copper disabled:bg-charcoal/50 text-white rounded-xl text-xs font-sans font-medium flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white/80" />
                      <span>Submitting to Admin...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-copper" />
                      <span>Submit Application for Admin Verification</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
