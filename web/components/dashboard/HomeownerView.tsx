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
  MessageSquare, 
  Calendar, 
  FileText, 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Building
} from "lucide-react";

export default function HomeownerView() {
  const { currentUser } = useAuth();
  const { savedProjects } = useSavedProjects();
  const { inquiries, projects } = useProjects();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

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
                Homeowner Portal
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
    </div>
  );
}

