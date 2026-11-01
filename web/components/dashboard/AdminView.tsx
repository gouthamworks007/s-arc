"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/authContext";
import { useProjects } from "@/lib/projectsContext";
import { ArchitecturalProject, UserAccount } from "@/lib/types";
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  MessageSquare, 
  AlertCircle, 
  Star, 
  ExternalLink, 
  Building2,
  FileCheck,
  Check,
  Eye,
  Filter
} from "lucide-react";

export default function AdminView() {
  const { users, updateUserStatus, logAction } = useAuth();
  const { projects, updateProject, inquiries } = useProjects();

  const [activeTab, setActiveTab] = useState<"verification" | "moderation" | "inquiries">("verification");

  // Pending architects
  const pendingArchitects = users.filter(
    (u) => u.role === "user" && u.subRole === "architect" && u.status === "pending_verification"
  );

  const verifiedArchitects = users.filter(
    (u) => u.role === "user" && u.subRole === "architect" && u.status === "active"
  );

  const handleApproveArchitect = (architect: UserAccount) => {
    updateUserStatus(architect.id, "active");
    logAction("Approved COA Verification", `${architect.name} (${architect.coaNumber || "COA Verified"})`);
  };

  const handleRejectArchitect = (architect: UserAccount) => {
    updateUserStatus(architect.id, "suspended");
    logAction("Rejected Architect Verification", `${architect.name}`);
  };

  const handleToggleFeatured = (project: ArchitecturalProject) => {
    const nextFeatured = !project.featured;
    updateProject(project.id, { featured: nextFeatured });
    logAction(
      nextFeatured ? "Featured Plan on Homepage" : "Removed Plan from Featured",
      project.name
    );
  };

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
                  Platform Moderation & Compliance
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-900 border border-sky-500/30 text-xs font-mono font-bold uppercase">
                  Tier 2 Admin Access
                </span>
              </div>
              <p className="text-xs text-secondaryText font-sans mt-0.5">
                Review and approve Council of Architecture (COA) credentials, curate drawing packages, and monitor client inquiries.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Admin Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white/90 backdrop-blur-sm border border-warm-border rounded-2xl">
            <span className="text-[11px] text-secondaryText font-sans block mb-1">
              Pending COA Verifications
            </span>
            <div className="text-2xl font-serif text-charcoal font-medium">
              {pendingArchitects.length} Architect{pendingArchitects.length === 1 ? "" : "s"}
            </div>
            <span className="text-[10px] text-amber-700 font-mono mt-1 block">
              Requires license validation
            </span>
          </div>

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
              Homeowner Leads in Pipeline
            </span>
            <div className="text-2xl font-serif text-charcoal font-medium">
              {inquiries.length} Inquiries
            </div>
            <span className="text-[10px] text-sky-700 font-mono mt-1 block">
              {inquiries.filter((i) => i.status === "new").length} Unanswered leads
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-warm-border overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => setActiveTab("verification")}
          className={`pb-3.5 px-4 text-xs font-medium font-sans border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "verification"
              ? "border-sky-600 text-sky-800 font-semibold"
              : "border-transparent text-secondaryText hover:text-charcoal"
          }`}
        >
          <Building2 className="w-4 h-4 text-sky-600" />
          <span>Architect COA Queue ({pendingArchitects.length})</span>
          {pendingArchitects.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("moderation")}
          className={`pb-3.5 px-4 text-xs font-medium font-sans border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "moderation"
              ? "border-sky-600 text-sky-800 font-semibold"
              : "border-transparent text-secondaryText hover:text-charcoal"
          }`}
        >
          <Layers className="w-4 h-4 text-copper" />
          <span>Marketplace Curation ({projects.length})</span>
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
          <span>Inquiry & Dispute Oversight ({inquiries.length})</span>
        </button>
      </div>

      {/* TAB 1: ARCHITECT VERIFICATION QUEUE */}
      {activeTab === "verification" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-serif text-charcoal">Pending COA Credential Approvals</h3>
            <p className="text-xs text-secondaryText font-sans">
              Verify architect registration numbers with the Council of Architecture (COA India) registry before activating their seller accounts.
            </p>
          </div>

          {pendingArchitects.length === 0 ? (
            <div className="p-12 text-center bg-white border border-warm-border rounded-3xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <h4 className="text-base font-serif text-charcoal mb-1">Queue Clear!</h4>
              <p className="text-xs text-secondaryText font-sans">
                All registered architects have been vetted and verified with the Council of Architecture.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingArchitects.map((arch) => (
                <div
                  key={arch.id}
                  className="p-6 bg-white border border-amber-300 rounded-3xl shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-warm-border bg-charcoal shrink-0">
                        <Image src={arch.avatar} alt={arch.name} fill className="object-cover" />
                      </div>
                      <div>
                        <h4 className="font-serif text-base text-charcoal font-medium">{arch.name}</h4>
                        <div className="text-xs text-secondaryText">{arch.studioName} • {arch.location}</div>
                      </div>
                    </div>

                    <div className="p-3.5 bg-amber-50/70 border border-amber-200/70 rounded-2xl mb-4 space-y-1.5 text-xs font-sans">
                      <div className="flex items-center justify-between">
                        <span className="text-secondaryText">COA Reg. Number:</span>
                        <span className="font-mono font-bold text-charcoal">{arch.coaNumber || "CA/2023/94102"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondaryText">Email:</span>
                        <span className="font-mono text-secondaryText">{arch.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondaryText">Phone:</span>
                        <span className="font-mono text-secondaryText">{arch.phone}</span>
                      </div>
                    </div>

                    <div className="text-xs text-secondaryText font-sans leading-relaxed mb-4">
                      Applicant submitted valid COA digital certificate and degree transcript. Ready for administrative clearance.
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-warm-border/60">
                    <button
                      onClick={() => handleRejectArchitect(arch)}
                      className="flex-1 py-2 rounded-xl border border-warm-border text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Reject Application
                    </button>
                    <button
                      onClick={() => handleApproveArchitect(arch)}
                      className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Issue Seal</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Already Verified List */}
          <div className="pt-6">
            <h4 className="text-sm font-serif text-charcoal mb-3">Recently Verified Architects ({verifiedArchitects.length})</h4>
            <div className="bg-white border border-warm-border rounded-2xl p-4 divide-y divide-warm-border/50">
              {verifiedArchitects.map((va) => (
                <div key={va.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium text-charcoal">{va.name}</span>
                    <span className="text-secondaryText">({va.studioName})</span>
                    <span className="font-mono text-[11px] text-copper">{va.coaNumber}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-mono">
                    Active Seller
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MARKETPLACE CURATION */}
      {activeTab === "moderation" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-serif text-charcoal">Curate Marketplace Blueprints</h3>
            <p className="text-xs text-secondaryText font-sans">
              Feature exceptional architectural works on the homepage or inspect CAD sheet compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-white border border-warm-border rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full bg-charcoal">
                    <Image src={proj.image} alt={proj.name} fill className="object-cover" />
                    {proj.featured && (
                      <span className="absolute top-3 left-3 bg-amber-400 text-charcoal text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <Star className="w-3 h-3 fill-charcoal" />
                        Homepage Featured
                      </span>
                    )}
                    <span className="absolute top-3 right-3 bg-white/95 text-charcoal text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm">
                      {proj.price}
                    </span>
                  </div>

                  <div className="p-5">
                    <h4 className="font-serif text-lg text-charcoal mb-1">{proj.name}</h4>
                    <div className="text-xs text-secondaryText font-sans mb-3">
                      By <strong>{proj.architect?.name}</strong> • {proj.location}
                    </div>

                    <div className="p-3 rounded-xl bg-warm-grey/50 border border-warm-border/60 text-xs font-sans space-y-1 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-secondaryText">Built-up:</span>
                        <span className="font-medium text-charcoal">{proj.builtUpArea}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondaryText">CAD Sheets:</span>
                        <span className="font-mono text-charcoal">{proj.sheetCount || 42} Sheets</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondaryText">Format Compliance:</span>
                        <span className="text-emerald-700 font-medium">DWG + BIM + BOQ Valid</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-warm-grey/30 border-t border-warm-border flex items-center justify-between">
                  <a
                    href={`/designs/${proj.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-secondaryText hover:text-charcoal flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Public Page</span>
                  </a>

                  <button
                    onClick={() => handleToggleFeatured(proj)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      proj.featured
                        ? "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
                        : "bg-charcoal text-white hover:bg-charcoal/90"
                    }`}
                  >
                    <Star className={`w-3 h-3 ${proj.featured ? "fill-amber-900" : ""}`} />
                    <span>{proj.featured ? "Unfeature" : "Feature on Homepage"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INQUIRIES & DISPUTES */}
      {activeTab === "inquiries" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-serif text-charcoal">Homeowner Leads & Architect Response Rates</h3>
            <p className="text-xs text-secondaryText font-sans">
              Admin audit of communication SLA between buyers and creators.
            </p>
          </div>

          <div className="bg-white border border-warm-border rounded-3xl divide-y divide-warm-border overflow-hidden">
            {inquiries.map((inq) => (
              <div key={inq.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-serif text-base font-medium text-charcoal">{inq.clientName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      inq.status === "new" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {inq.status}
                    </span>
                    <span className="text-xs text-secondaryText">→ {inq.projectName}</span>
                  </div>
                  <div className="text-xs text-secondaryText font-sans">
                    Plot: {inq.plotLocation} • Budget: {inq.budgetRange}
                  </div>
                  <p className="text-xs text-charcoal/80 font-sans mt-2 line-clamp-1 italic">
                    &ldquo;{inq.message}&rdquo;
                  </p>
                </div>

                <div className="text-xs text-secondaryText font-mono self-start md:self-auto shrink-0">
                  {inq.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

