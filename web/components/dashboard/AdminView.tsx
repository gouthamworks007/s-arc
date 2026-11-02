"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/authContext";
import { useProjects } from "@/lib/projectsContext";
import { ArchitecturalProject } from "@/lib/types";
import { 
  Shield, 
  CheckCircle2, 
  Layers, 
  MessageSquare, 
  Star, 
  ExternalLink, 
  Building2,
  Lock,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
  Filter,
  Crown
} from "lucide-react";

export default function AdminView() {
  const { currentUser, logAction } = useAuth();
  const { projects, updateProject, inquiries } = useProjects();

  const [activeTab, setActiveTab] = useState<"moderation" | "inquiries" | "statutory">("moderation");
  const [filterStyle, setFilterStyle] = useState<string>("all");

  const handleToggleFeatured = (project: ArchitecturalProject) => {
    const nextFeatured = !project.featured;
    updateProject(project.id, { featured: nextFeatured });
    logAction(
      nextFeatured ? "Featured Plan on Homepage" : "Removed Plan from Featured",
      project.name
    );
  };

  const filteredProjects = projects.filter((p) => {
    if (filterStyle === "all") return true;
    return p.style.toLowerCase().includes(filterStyle.toLowerCase());
  });

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Admin Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-sky-500/10 via-sky-500/5 to-transparent border border-sky-300/40 rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-serif text-charcoal">
                  Platform Moderation & Operations
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-900 border border-sky-500/30 text-xs font-mono font-bold uppercase">
                  Tier 2 Platform Admin
                </span>
              </div>
              <p className="text-xs text-secondaryText font-sans mt-0.5">
                Curate published architectural blueprints, verify CAD package completeness, and facilitate client inquiries.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Admin Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white/90 backdrop-blur-sm border border-warm-border rounded-2xl">
            <span className="text-[11px] text-secondaryText font-sans block mb-1">
              Live Architectural Plans
            </span>
            <div className="text-2xl font-serif text-charcoal font-medium">
              {projects.filter((p) => p.status === "published").length} Plans
            </div>
            <span className="text-[10px] text-emerald-700 font-mono mt-1 block">
              {projects.filter((p) => p.featured).length} Featured on Homepage
            </span>
          </div>

          <div className="p-4 bg-white/90 backdrop-blur-sm border border-warm-border rounded-2xl">
            <span className="text-[11px] text-secondaryText font-sans block mb-1">
              Client Inquiries in Pipeline
            </span>
            <div className="text-2xl font-serif text-charcoal font-medium">
              {inquiries.length} Inquiries
            </div>
            <span className="text-[10px] text-sky-700 font-mono mt-1 block">
              {inquiries.filter((i) => i.status === "new").length} New requests
            </span>
          </div>

          <div className="p-4 bg-white/90 backdrop-blur-sm border border-warm-border rounded-2xl">
            <span className="text-[11px] text-secondaryText font-sans block mb-1">
              Architect & Firm Governance
            </span>
            <div className="text-sm font-serif text-charcoal font-medium mt-1">
              Direct Super Admin Control
            </div>
            <span className="text-[10px] text-stone-500 font-mono mt-1 block">
              Freelance & Agency seals managed at Tier 1
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-warm-border overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => setActiveTab("moderation")}
          className={`pb-3.5 px-4 text-xs font-medium font-sans border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "moderation"
              ? "border-sky-600 text-sky-800 font-semibold"
              : "border-transparent text-secondaryText hover:text-charcoal"
          }`}
        >
          <Layers className="w-4 h-4 text-copper" />
          <span>Marketplace Blueprint Curation ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("inquiries")}
          className={`pb-3.5 px-4 text-xs font-medium font-sans border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "inquiries"
              ? "border-sky-600 text-sky-800 font-semibold"
              : "border-transparent text-secondaryText hover:text-charcoal"
          }`}
        >
          <MessageSquare className="w-4 h-4 text-secondaryText" />
          <span>Client Consultations & Leads ({inquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("statutory")}
          className={`pb-3.5 px-4 text-xs font-medium font-sans border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "statutory"
              ? "border-sky-600 text-sky-800 font-semibold"
              : "border-transparent text-secondaryText hover:text-charcoal"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-sky-600" />
          <span>Governance & Super Admin Boundary</span>
        </button>
      </div>

      {/* TAB 1: BLUEPRINT CURATION & MODERATION */}
      {activeTab === "moderation" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-serif text-charcoal">Marketplace Architectural Curation</h3>
              <p className="text-xs text-secondaryText font-sans">
                Review technical drawings, modify featured carousel visibility, and inspect turnkey CAD documentation.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {["all", "tropical", "vernacular", "brick"].map((style) => (
                <button
                  key={style}
                  onClick={() => setFilterStyle(style)}
                  className={`px-3 py-1 rounded-full text-xs font-mono capitalize transition-all ${
                    filterStyle === style
                      ? "bg-charcoal text-white"
                      : "bg-white border border-warm-border text-secondaryText hover:text-charcoal"
                  }`}
                >
                  {style === "all" ? "All Styles" : style}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white border border-warm-border rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-sky-300 transition-colors"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full bg-charcoal">
                    <Image src={project.image} alt={project.name} fill className="object-cover" />
                    <span className="absolute top-3 right-3 bg-white/95 text-charcoal text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm">
                      {project.price}
                    </span>
                    {project.featured && (
                      <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif text-lg text-charcoal">{project.name}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {(project.status || "published").toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-secondaryText font-sans mt-0.5">
                        {project.style} • {project.location}
                      </div>
                    </div>

                    <div className="p-3 bg-warm-grey/50 border border-warm-border rounded-xl space-y-1 text-[11px] font-sans">
                      <div className="flex justify-between text-secondaryText">
                        <span>Plot Dimension:</span>
                        <span className="font-mono text-charcoal">{project.plotSize} ({project.cents} Cents)</span>
                      </div>
                      <div className="flex justify-between text-secondaryText">
                        <span>Built-Up Area:</span>
                        <span className="font-mono text-charcoal">{project.builtUpArea}</span>
                      </div>
                      <div className="flex justify-between text-secondaryText">
                        <span>Architect Studio:</span>
                        <span className="font-mono text-copper font-medium">{project.architect.name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-warm-grey/30 border-t border-warm-border flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleFeatured(project)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-sans font-medium flex items-center gap-1.5 transition-all ${
                      project.featured
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-white border border-warm-border text-charcoal hover:bg-warm-grey"
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${project.featured ? "fill-amber-500 text-amber-500" : ""}`} />
                    <span>{project.featured ? "Featured" : "Feature on Home"}</span>
                  </button>

                  <a
                    href={`/designs/${project.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-stone-500 hover:text-charcoal rounded-xl hover:bg-white transition-colors"
                    title="View public listing"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: INQUIRIES & DISPUTES */}
      {activeTab === "inquiries" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-serif text-charcoal">Homeowner Consultations & Project Inquiries</h3>
            <p className="text-xs text-secondaryText font-sans">
              Monitor communications between prospective home builders and verified design studios across South India.
            </p>
          </div>

          <div className="space-y-4">
            {inquiries.map((inq) => (
              <div
                key={inq.id}
                className="p-6 bg-white border border-warm-border rounded-3xl shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-serif text-base text-charcoal font-medium">
                        {inq.projectName}
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono ${
                        inq.status === "responded"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}>
                        {inq.status === "responded" ? "✓ Responded by Studio" : "Pending Studio Reply"}
                      </span>
                    </div>
                    <div className="text-xs text-secondaryText font-sans mt-0.5">
                      Client: <strong className="text-charcoal">{inq.clientName}</strong> ({inq.clientEmail}) • {inq.plotLocation}
                    </div>
                  </div>

                  <span className="text-xs font-mono text-copper font-medium">
                    Budget: {inq.budgetRange}
                  </span>
                </div>

                <div className="p-3.5 bg-warm-grey/50 border border-warm-border rounded-2xl text-xs text-charcoal font-sans">
                  &ldquo;{inq.message}&rdquo;
                </div>

                {inq.replyText && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 font-sans space-y-1">
                    <span className="font-mono text-[10px] text-emerald-800 font-semibold block">Architect Response:</span>
                    <p>{inq.replyText}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STATUTORY GOVERNANCE NOTICE */}
      {activeTab === "statutory" && (
        <div className="p-8 bg-white border border-warm-border rounded-3xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-800 flex items-center justify-center border border-amber-300">
              <ShieldCheck className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-charcoal">
                Statutory Governance & Architect Licensing
              </h3>
              <p className="text-xs text-secondaryText font-sans">
                Council of Architecture (CoA) compliance architecture for S-ARC
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans text-secondaryText leading-relaxed">
            <div className="p-5 bg-warm-grey/40 border border-warm-border rounded-2xl space-y-2">
              <div className="flex items-center gap-2 font-serif text-sm font-semibold text-charcoal">
                <Crown className="w-4 h-4 text-amber-600" />
                <span>Super Admin Exclusive Domain (Tier 1)</span>
              </div>
              <p>
                All Freelance Architects and Architecture Agencies submit credentials directly to the Super Admin. The Super Admin performs statutory verification against the Council of Architecture gazette and possesses sole legal authorization to grant the S-ARC Verified Seal.
              </p>
            </div>

            <div className="p-5 bg-sky-50/40 border border-sky-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 font-serif text-sm font-semibold text-sky-900">
                <Shield className="w-4 h-4 text-sky-600" />
                <span>Platform Admin Domain (Tier 2)</span>
              </div>
              <p>
                Platform Admins oversee marketplace inventory, CAD package technical integrity, pricing rules, and dispute resolution between homeowners and studios. Admins do not manage or approve freelance architects or agency firms.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
