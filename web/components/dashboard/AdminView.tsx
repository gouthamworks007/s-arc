"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/authContext";
import { useProjects } from "@/lib/projectsContext";
import { ArchitecturalProject, UserAccount } from "@/lib/types";
import { 
  Shield, 
  CheckCircle2, 
  Layers, 
  MessageSquare, 
  Star, 
  ExternalLink, 
  Building2,
  Clock,
  ShieldCheck,
  Check,
  Search,
  Trash2,
  Sliders,
  Users,
  Percent,
  AlertTriangle,
  TrendingUp,
  FileCheck2
} from "lucide-react";

export default function AdminView() {
  const { 
    currentUser, 
    users, 
    settings, 
    updateSettings, 
    auditLogs, 
    updateUserRole, 
    updateUserStatus, 
    deleteUser, 
    logAction 
  } = useAuth();
  const { projects, updateProject, inquiries } = useProjects();

  const [activeTab, setActiveTab] = useState<
    "approvals" | "moderation" | "inquiries" | "finances" | "users" | "audit"
  >("approvals");

  // Blueprint filter
  const [filterStyle, setFilterStyle] = useState<string>("all");

  // Finances & Settings state
  const [commissionRate, setCommissionRate] = useState(settings.platformCommissionPercent);
  const [escrowDays, setEscrowDays] = useState(settings.payoutEscrowHoldDays);
  const [maintenance, setMaintenance] = useState(settings.maintenanceMode);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // User search & filter
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");

  // Pending practice approvals (Freelance Architects & Agencies)
  const pendingArchitects = users.filter(
    (u) => u.role === "user" && u.subRole === "architect" && u.status === "pending_verification"
  );

  const handleToggleFeatured = (project: ArchitecturalProject) => {
    const nextFeatured = !project.featured;
    updateProject(project.id, { featured: nextFeatured });
    logAction(
      nextFeatured ? "Featured Plan on Homepage" : "Removed Plan from Featured",
      project.name
    );
  };

  const handleSaveSettings = () => {
    updateSettings({
      platformCommissionPercent: commissionRate,
      payoutEscrowHoldDays: escrowDays,
      maintenanceMode: maintenance
    });
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 2000);
  };

  const filteredProjects = projects.filter((p) => {
    if (filterStyle === "all") return true;
    return p.style.toLowerCase().includes(filterStyle.toLowerCase());
  });

  const filteredUsers = users.filter((u) => {
    if (userRoleFilter !== "all" && u.role !== userRoleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Admin Unified Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-stone-900 via-stone-800 to-charcoal text-white rounded-3xl border border-stone-700 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-copper text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-serif text-white font-normal">
                  Administrator Workspace
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-copper/20 text-copper-light border border-copper/40 text-xs font-mono font-bold uppercase">
                  Platform Authority
                </span>
              </div>
              <p className="text-xs text-stone-300 font-sans mt-0.5">
                Full authority over statutory Council of Architecture (CoA) approvals, marketplace curation, client inquiries, financial policies, and account controls.
              </p>
            </div>
          </div>
        </div>

        {/* Global Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab("approvals")}
            className="p-4 text-left bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/15 rounded-2xl transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-stone-300 font-sans">
                Pending Practice Approvals
              </span>
              {pendingArchitects.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </div>
            <div className="text-xl sm:text-2xl font-serif text-white font-medium group-hover:text-copper-light transition-colors">
              {pendingArchitects.length} Pending
            </div>
            <span className="text-[10px] text-stone-400 font-mono mt-1 block">
              Architect & Agency queue
            </span>
          </button>

          <button
            onClick={() => setActiveTab("moderation")}
            className="p-4 text-left bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/15 rounded-2xl transition-all group"
          >
            <span className="text-[11px] text-stone-300 font-sans block mb-1">
              Live Architectural Plans
            </span>
            <div className="text-xl sm:text-2xl font-serif text-white font-medium group-hover:text-copper-light transition-colors">
              {projects.filter((p) => p.status === "published").length} Plans
            </div>
            <span className="text-[10px] text-copper-light font-mono mt-1 block">
              {projects.filter((p) => p.featured).length} Featured on Home
            </span>
          </button>

          <button
            onClick={() => setActiveTab("inquiries")}
            className="p-4 text-left bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/15 rounded-2xl transition-all group"
          >
            <span className="text-[11px] text-stone-300 font-sans block mb-1">
              Client Consultations & Leads
            </span>
            <div className="text-xl sm:text-2xl font-serif text-white font-medium group-hover:text-copper-light transition-colors">
              {inquiries.length} Inquiries
            </div>
            <span className="text-[10px] text-stone-400 font-mono mt-1 block">
              {inquiries.filter((i) => i.status === "new").length} New requests
            </span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className="p-4 text-left bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/15 rounded-2xl transition-all group"
          >
            <span className="text-[11px] text-stone-300 font-sans block mb-1">
              Registered User Accounts
            </span>
            <div className="text-xl sm:text-2xl font-serif text-white font-medium group-hover:text-copper-light transition-colors">
              {users.length} Users
            </div>
            <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
              {users.filter((u) => u.status === "active").length} Active Accounts
            </span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center border-b border-warm-border overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => setActiveTab("approvals")}
          className={`pb-3.5 px-4 text-xs font-medium font-sans border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "approvals"
              ? "border-copper text-charcoal font-semibold"
              : "border-transparent text-secondaryText hover:text-charcoal"
          }`}
        >
          <Building2 className="w-4 h-4 text-copper" />
          <span>Practice Approvals ({pendingArchitects.length})</span>
          {pendingArchitects.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-copper text-white font-mono text-[10px] font-bold">
              {pendingArchitects.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("moderation")}
          className={`pb-3.5 px-4 text-xs font-medium font-sans border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "moderation"
              ? "border-charcoal text-charcoal font-semibold"
              : "border-transparent text-secondaryText hover:text-charcoal"
          }`}
        >
          <Layers className="w-4 h-4 text-stone-600" />
          <span>Marketplace Curation ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("inquiries")}
          className={`pb-3.5 px-4 text-xs font-medium font-sans border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "inquiries"
              ? "border-charcoal text-charcoal font-semibold"
              : "border-transparent text-secondaryText hover:text-charcoal"
          }`}
        >
          <MessageSquare className="w-4 h-4 text-secondaryText" />
          <span>Client Consultations ({inquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("finances")}
          className={`pb-3.5 px-4 text-xs font-medium font-sans border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "finances"
              ? "border-charcoal text-charcoal font-semibold"
              : "border-transparent text-secondaryText hover:text-charcoal"
          }`}
        >
          <Sliders className="w-4 h-4 text-copper" />
          <span>Platform Settings & Escrow</span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3.5 px-4 text-xs font-medium font-sans border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "users"
              ? "border-charcoal text-charcoal font-semibold"
              : "border-transparent text-secondaryText hover:text-charcoal"
          }`}
        >
          <Users className="w-4 h-4 text-stone-600" />
          <span>User Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3.5 px-4 text-xs font-medium font-sans border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "audit"
              ? "border-charcoal text-charcoal font-semibold"
              : "border-transparent text-secondaryText hover:text-charcoal"
          }`}
        >
          <Clock className="w-4 h-4 text-secondaryText" />
          <span>Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: PRACTICE APPROVALS QUEUE */}
      {activeTab === "approvals" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-serif text-charcoal">Architect Practice Approvals Queue</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-copper/10 text-copper border border-copper/30 font-mono text-[10px] font-bold uppercase tracking-wider">
                  Admin Verification
                </span>
              </div>
              <p className="text-xs text-secondaryText font-sans mt-0.5">
                Review and verify Council of Architecture (CoA) statutory registrations for freelance architects and architecture agency firms before granting blueprint publishing privileges.
              </p>
            </div>
          </div>

          {pendingArchitects.length === 0 ? (
            <div className="p-10 text-center bg-white border border-warm-border rounded-3xl shadow-sm space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <div className="font-serif text-base text-charcoal font-medium">All Practice Credentials Verified</div>
              <p className="text-xs text-secondaryText font-sans max-w-md mx-auto">
                No pending Freelance Architect or Architecture Agency applications in the queue. All submissions have been processed.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pendingArchitects.map((arch) => (
                <div
                  key={arch.id}
                  className="p-6 bg-white border-2 border-copper/40 hover:border-copper rounded-3xl shadow-sm flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-warm-border bg-charcoal shrink-0">
                          <Image src={arch.avatar} alt={arch.name} fill className="object-cover" />
                        </div>
                        <div>
                          <h5 className="font-serif text-base text-charcoal font-medium">{arch.name}</h5>
                          <span className="text-xs text-secondaryText">{arch.studioName || "Design Practice"} • {arch.location}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
                        arch.practiceType === "agency"
                          ? "bg-purple-100 text-purple-900 border border-purple-200"
                          : "bg-copper/10 text-copper border border-copper/30"
                      }`}>
                        {arch.practiceType === "agency" ? "Architecture Agency Firm" : "Freelance Architect"}
                      </span>
                    </div>

                    <div className="p-3.5 bg-warm-grey/50 border border-warm-border rounded-2xl mb-3 space-y-2 text-xs font-sans">
                      <div className="flex items-center justify-between">
                        <span className="text-secondaryText">Council of Architecture (CoA):</span>
                        <span className="font-mono font-bold text-copper">{arch.coaNumber || "CA/2023/94102"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondaryText">Studio / Firm:</span>
                        <span className="font-mono text-charcoal font-medium">{arch.studioName || "Independent Practice"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondaryText">Email:</span>
                        <span className="font-mono text-secondaryText">{arch.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondaryText">Contact Phone:</span>
                        <span className="font-mono text-secondaryText">{arch.phone || "+91 94460 77889"}</span>
                      </div>
                      {arch.portfolioUrl && (
                        <div className="flex items-center justify-between">
                          <span className="text-secondaryText">Portfolio / Work:</span>
                          <a href={arch.portfolioUrl} target="_blank" rel="noreferrer" className="text-copper hover:underline font-mono">
                            View Work ↗
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Applicant Notes */}
                    <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl mb-4 text-xs font-sans">
                      <div className="text-[11px] font-mono font-semibold text-amber-900 flex items-center gap-1.5 mb-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-copper" />
                        <span>Applicant Statement:</span>
                      </div>
                      <p className="text-amber-950/90 leading-relaxed text-[11px]">
                        {arch.reviewNotes || "Registered user applied for verified architect marketplace publishing privileges."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pt-3 border-t border-warm-border/60">
                    <button
                      onClick={() => updateUserStatus(arch.id, "suspended", "Application declined by Administrator.")}
                      className="px-4 py-2 rounded-xl border border-warm-border text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => updateUserStatus(arch.id, "active", "Administrator verified CoA statutory registration and issued Practice Seal.")}
                      className="flex-1 py-2 px-4 rounded-xl bg-charcoal hover:bg-copper text-white text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5 text-copper" />
                      <span>Approve & Grant Practice Seal</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BLUEPRINT CURATION & MODERATION */}
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
                className="bg-white border border-warm-border rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-copper/40 transition-colors"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full bg-charcoal">
                    <Image src={project.image} alt={project.name} fill className="object-cover" />
                    <span className="absolute top-3 right-3 bg-white/95 text-charcoal text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm">
                      {project.price}
                    </span>
                    {project.featured && (
                      <span className="absolute top-3 left-3 bg-copper text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
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

      {/* TAB 3: INQUIRIES & DISPUTES */}
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

      {/* TAB 4: PLATFORM SETTINGS & ESCROW */}
      {activeTab === "finances" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-warm-border rounded-3xl space-y-5">
            <h3 className="text-base font-serif text-charcoal flex items-center gap-2">
              <Percent className="w-4 h-4 text-copper" />
              <span>Marketplace Commission & Escrow Policy</span>
            </h3>

            <div>
              <div className="flex items-center justify-between text-xs font-sans mb-2">
                <span className="text-charcoal font-medium">S-ARC Platform Cut on CAD Licensing</span>
                <span className="font-mono text-copper text-sm font-semibold">{commissionRate}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={25}
                step={0.5}
                value={commissionRate}
                onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                className="w-full accent-copper cursor-pointer"
              />
              <p className="text-[11px] text-secondaryText mt-1.5 font-sans">
                Automatically deducted when escrow releases the drawing package to the homeowner.
              </p>
            </div>

            <div className="pt-4 border-t border-warm-border/60">
              <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                Escrow Payout Holding Period (Days)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={escrowDays}
                onChange={(e) => setEscrowDays(parseInt(e.target.value) || 7)}
                className="w-full px-4 py-2.5 rounded-xl border border-warm-border text-xs text-charcoal font-mono"
              />
              <p className="text-[11px] text-secondaryText mt-1 font-sans">
                Days funds are held in escrow before architect withdrawal, allowing structural file download and buyer verification.
              </p>
            </div>
          </div>

          <div className="p-6 bg-white border border-warm-border rounded-3xl space-y-5 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-serif text-charcoal flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>System Health & Safety Controls</span>
              </h3>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-2xl border border-warm-border hover:bg-warm-grey/30 cursor-pointer transition-colors">
                  <div>
                    <div className="text-xs font-medium text-charcoal font-sans">Platform Maintenance Mode</div>
                    <div className="text-[11px] text-secondaryText">Temporarily disable CAD downloads and checkout during updates.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenance}
                    onChange={(e) => setMaintenance(e.target.checked)}
                    className="accent-copper w-4 h-4 rounded"
                  />
                </label>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-sans leading-relaxed">
                  <strong>Notice</strong>: All system adjustments are immediately recorded with immutable timestamps in the platform audit trail.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-warm-border">
              {settingsSuccess ? (
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="w-4 h-4" /> Settings updated successfully!
                </span>
              ) : <div />}

              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-6 py-2.5 rounded-full bg-charcoal hover:bg-copper text-white text-xs font-medium tracking-wide flex items-center gap-2 transition-all shadow-sm"
              >
                <Check className="w-3.5 h-3.5 text-copper-light" />
                <span>Save Platform Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ALL USERS DIRECTORY */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-warm-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user by name or email..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper"
              />
            </div>

            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-warm-border text-xs text-charcoal bg-white focus:outline-none focus:border-copper"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="user">Users (Architects & Homeowners)</option>
            </select>
          </div>

          <div className="bg-white border border-warm-border rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-warm-grey/60 border-b border-warm-border text-secondaryText font-medium">
                  <tr>
                    <th className="py-3.5 px-5">User</th>
                    <th className="py-3.5 px-4">Role & Sub-Role</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Joined</th>
                    <th className="py-3.5 px-5 text-right">Account Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-border/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-warm-grey/20 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-warm-border bg-charcoal shrink-0">
                            <Image src={u.avatar} alt={u.name} fill className="object-cover" />
                          </div>
                          <div>
                            <div className="font-serif text-sm font-medium text-charcoal">{u.name}</div>
                            <div className="text-[11px] text-secondaryText">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-charcoal capitalize">
                          {u.role}
                        </span>
                        {u.subRole && (
                          <span className="text-[11px] text-secondaryText block">
                            Sub-type: {u.subRole}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                          u.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : u.status === "pending_verification"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          {u.status === "active" ? "Active" : u.status === "pending_verification" ? "Pending Verify" : "Suspended"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-secondaryText font-mono text-[11px]">
                        {u.joinedDate}
                      </td>
                      <td className="py-4 px-5 text-right">
                        {u.role !== "admin" ? (
                          <div className="flex items-center justify-end gap-2">
                            {u.status === "pending_verification" ? (
                              <button
                                onClick={() => updateUserStatus(u.id, "active")}
                                className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-medium shadow-sm transition-colors"
                              >
                                Approve Account
                              </button>
                            ) : u.status === "active" ? (
                              <button
                                onClick={() => updateUserStatus(u.id, "suspended")}
                                className="px-2.5 py-1 rounded-lg border border-warm-border text-[11px] text-amber-700 hover:bg-amber-50"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => updateUserStatus(u.id, "active")}
                                className="px-2.5 py-1 rounded-lg border border-warm-border text-[11px] text-emerald-700 hover:bg-emerald-50"
                              >
                                Reactivate
                              </button>
                            )}
                            <button
                              onClick={() => deleteUser(u.id)}
                              className="p-1.5 rounded-lg text-secondaryText hover:text-red-600 hover:bg-red-50"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-copper font-medium font-mono">Platform Admin</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT TRAIL */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-lg font-serif text-charcoal">Platform Security & Audit Trail</h3>
              <p className="text-xs text-secondaryText font-sans">
                Every administrative authorization, role upgrade, and compliance change is recorded with immutable timestamps.
              </p>
            </div>
          </div>

          <div className="bg-white border border-warm-border rounded-3xl p-6 shadow-sm space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-warm-grey/30 border border-warm-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold bg-stone-900 text-white">
                    ADM
                  </div>
                  <div>
                    <div className="text-xs font-medium text-charcoal font-sans">
                      {log.action}
                    </div>
                    <div className="text-[11px] text-secondaryText">
                      By <strong className="text-charcoal">{log.actorName}</strong> • Target: {log.target}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-secondaryText shrink-0">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
