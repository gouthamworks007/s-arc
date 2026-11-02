"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSavedProjects } from "@/lib/savedProjectsContext";
import { useProjects } from "@/lib/projectsContext";
import { useAuth } from "@/lib/authContext";
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
  Crown
} from "lucide-react";

export default function HomeownerView() {
  const { currentUser, applyForArchitectUpgrade } = useAuth();
  const { savedProjects } = useSavedProjects();
  const { inquiries } = useProjects();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

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

  // Client's mock purchased blueprints
  const purchasedPackages = [
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
    }
  ];

  // Inquiries made by this client
  const myInquiries = inquiries.filter(
    (i) => i.clientEmail === currentUser?.email || i.clientName.includes("Ramesh")
  );

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
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Homeowner Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-copper/15 via-copper/5 to-transparent border border-copper/30 rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl sm:text-3xl font-serif text-charcoal">
                Welcome back, {currentUser?.name || "Client"}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-copper/20 text-copper border border-copper/30 text-xs font-mono font-medium">
                Client Portal
              </span>
            </div>
            <p className="text-xs text-secondaryText font-sans">
              Manage your licensed architectural blueprints, plot customization requests, and shortlisted designs.
            </p>
          </div>

          <Link
            href="/designs"
            className="px-5 py-2.5 rounded-full bg-copper hover:bg-copper-hover text-white text-xs font-medium tracking-wide flex items-center gap-2 transition-all shadow-sm self-start sm:self-auto"
          >
            <span>Explore 500+ Plans</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Architect Upgrade Banner / Status Card */}
      {isPendingVerification ? (
        <div className="p-6 bg-amber-50/80 border border-amber-300 rounded-3xl space-y-3">
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
                  Direct Super Admin Audit
                </span>
              </div>
              <p className="text-xs text-secondaryText font-sans leading-relaxed">
                Your application as a <strong className="text-charcoal">{currentUser?.practiceType === "agency" ? "Architecture Agency Firm" : "Freelance Architect"}</strong> ({currentUser?.studioName || "Studio"} • CoA: {currentUser?.coaNumber || "Submitted"}) is currently being audited directly by the Super Admin. You will receive publishing privileges once your Council of Architecture credentials are verified.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-stone-900 text-white rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 border border-stone-800">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-copper/30 text-copper-light border border-copper/40 text-[10px] font-mono uppercase tracking-wider">
                Practice Partnership
              </span>
              <span className="text-[11px] text-stone-400 font-sans">Direct Super Admin Clearance</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif text-white">
              Are you a Freelance Architect or Architecture Agency Firm?
            </h3>
            <p className="text-xs text-stone-300 font-sans leading-relaxed">
              Apply directly to the Super Admin to license your verified residential plans to over 10,000 South Indian clients and receive direct design commissions.
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

      {/* 1. Licensed Packages Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif text-charcoal">Purchased Blueprint Packages</h3>
            <p className="text-xs text-secondaryText font-sans">
              Full construction-ready CAD drawings, structural BOQ, and MEP schedules with digital single-build licenses.
            </p>
          </div>
        </div>

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
                  className="px-5 py-2.5 rounded-full bg-charcoal hover:bg-charcoal/90 text-white text-xs font-medium flex items-center gap-2 transition-all shadow-sm"
                >
                  <Download className="w-4 h-4 text-copper" />
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
      </div>

      {/* 2. Custom Modification Inquiries */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-serif text-charcoal">Your Customization Requests & Quotes</h3>
          <p className="text-xs text-secondaryText font-sans">
            Direct communications with licensed architects regarding site adjustments, Vastu changes, and turnkey coordination.
          </p>
        </div>

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
      </div>

      {/* 3. Shortlisted Plans */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif text-charcoal">Shortlisted Architectural Designs</h3>
            <p className="text-xs text-secondaryText font-sans">
              Compare plot dimensions, Vastu orientation, and room layouts side by side.
            </p>
          </div>
          <span className="text-xs font-mono text-secondaryText">{savedProjects.length} saved</span>
        </div>

        {savedProjects.length === 0 ? (
          <div className="p-10 text-center bg-white border border-warm-border rounded-3xl">
            <Bookmark className="w-8 h-8 text-secondaryText/40 mx-auto mb-2" />
            <div className="text-sm font-serif text-charcoal mb-1">No Saved Designs Yet</div>
            <p className="text-xs text-secondaryText font-sans mb-3">
              Explore the curated marketplace and tap the bookmark icon to save designs here.
            </p>
            <Link
              href="/designs"
              className="inline-flex items-center gap-1.5 text-xs text-copper font-medium hover:underline"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
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
                    <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute top-3 right-3 bg-white/95 text-charcoal text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm">
                      {p.price}
                    </span>
                  </div>
                  <div className="p-5">
                    <h4 className="font-serif text-lg text-charcoal group-hover:text-copper transition-colors mb-1">{p.name}</h4>
                    <div className="text-xs text-secondaryText font-sans mb-3">{p.style} • {p.plotSize}</div>
                    <div className="text-xs text-copper font-medium flex items-center gap-1">
                      <span>View Specifications</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Application Modal: Direct Super Admin Review */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-warm-border rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-600" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-900 font-semibold">
                  Super Admin Direct Application
                </span>
              </div>
              <h3 className="text-2xl font-serif text-charcoal">
                Apply for Practice Verification
              </h3>
              <p className="text-xs text-secondaryText font-sans">
                Freelance architects and design agencies undergo direct statutory compliance review by the Super Admin before publishing blueprints.
              </p>
            </div>

            {applicationSuccess ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-serif text-lg text-emerald-950 font-medium">Application Dispatched</h4>
                <p className="text-xs text-emerald-800 font-sans">
                  Your credentials have been placed directly in the Super Admin Tier 1 compliance queue.
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
                    By submitting, you certify that all Council of Architecture credentials are valid and active. Super Admin verifies registrations against official statutory gazettes.
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
                      <span>Submitting to Super Admin...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-copper" />
                      <span>Submit Application to Super Admin</span>
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
