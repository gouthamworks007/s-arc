"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProjects } from "@/lib/projectsContext";
import { ArchitecturalProject } from "@/lib/types";
import ProjectEditModal from "@/components/dashboard/ProjectEditModal";
import InquiriesTab from "@/components/dashboard/InquiriesTab";
import StudioProfileTab from "@/components/dashboard/StudioProfileTab";
import { 
  Plus, 
  Layers, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Search, 
  LayoutGrid, 
  List, 
  MessageSquare, 
  TrendingUp, 
  ShieldCheck, 
  RotateCcw
} from "lucide-react";

export default function ArchitectView() {
  const { 
    projects, 
    addProject, 
    updateProject, 
    deleteProject, 
    duplicateProject, 
    togglePublishStatus, 
    resetAllData,
    profile,
    inquiries 
  } = useProjects();

  const [activeTab, setActiveTab] = useState<"projects" | "inquiries" | "profile">("projects");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [facingFilter, setFacingFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingProject, setEditingProject] = useState<ArchitecturalProject | null>(null);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchStyle = p.style.toLowerCase().includes(q);
        const matchLocation = p.location.toLowerCase().includes(q);
        if (!matchName && !matchStyle && !matchLocation) return false;
      }

      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (facingFilter !== "all" && p.facing !== facingFilter) return false;

      return true;
    });
  }, [projects, searchQuery, statusFilter, facingFilter]);

  const totalViews = useMemo(() => {
    return projects.reduce((acc, curr) => acc + (curr.views || 0), 0);
  }, [projects]);

  const totalPublished = useMemo(() => {
    return projects.filter((p) => p.status === "published").length;
  }, [projects]);

  const totalDrafts = useMemo(() => {
    return projects.filter((p) => p.status === "draft").length;
  }, [projects]);

  const newInquiriesCount = useMemo(() => {
    return inquiries.filter((i) => i.status === "new").length;
  }, [inquiries]);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: ArchitecturalProject) => {
    setEditingProject(project);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleSaveModal = (savedData: Partial<ArchitecturalProject>) => {
    if (modalMode === "create") {
      addProject(savedData as any);
    } else if (editingProject) {
      updateProject(editingProject.id, savedData);
    }
  };

  const handleDeleteWithPrompt = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the plan "${name}"? This will remove it from the public marketplace.`)) {
      deleteProject(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Top Studio Bar */}
      <div className="p-6 sm:p-8 bg-white border border-warm-border rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-warm-border bg-charcoal shrink-0">
              <Image src={profile.image} alt={profile.name} fill className="object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-serif font-normal text-charcoal">
                  {profile.studio}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  COA: {profile.coaNumber}
                </span>
              </div>
              <p className="text-xs text-secondaryText font-sans mt-1">
                Principal: <strong className="text-charcoal font-medium">{profile.name}</strong> • {profile.location}
              </p>
              <p className="text-xs text-secondaryText/80 font-sans mt-0.5 line-clamp-1 max-w-xl">
                {profile.specialization}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <button
              onClick={resetAllData}
              className="px-3.5 py-2.5 rounded-full border border-warm-border text-xs font-medium text-secondaryText hover:text-charcoal hover:border-charcoal/30 flex items-center gap-1.5 transition-colors"
              title="Reset demo data to original state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 rounded-full bg-copper hover:bg-copper-hover text-white text-xs font-medium tracking-wide flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Publish New Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 bg-white border border-warm-border rounded-2xl">
          <div className="flex items-center justify-between text-secondaryText mb-2">
            <span className="text-xs font-sans">Active Blueprint Plans</span>
            <Layers className="w-4 h-4 text-copper" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif text-charcoal">{totalPublished}</span>
            <span className="text-xs text-secondaryText font-mono">({totalDrafts} Drafts)</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-warm-border rounded-2xl">
          <div className="flex items-center justify-between text-secondaryText mb-2">
            <span className="text-xs font-sans">Total Blueprint Views</span>
            <Eye className="w-4 h-4 text-copper" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-charcoal">
            {totalViews.toLocaleString()}
          </div>
        </div>

        <div className="p-5 bg-white border border-warm-border rounded-2xl">
          <div className="flex items-center justify-between text-secondaryText mb-2">
            <span className="text-xs font-sans">Client Inquiries</span>
            <MessageSquare className="w-4 h-4 text-copper" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif text-charcoal">{inquiries.length}</span>
            {newInquiriesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-medium">
                {newInquiriesCount} New
              </span>
            )}
          </div>
        </div>

        <div className="p-5 bg-white border border-warm-border rounded-2xl">
          <div className="flex items-center justify-between text-secondaryText mb-2">
            <span className="text-xs font-sans">Est. Licensing Volume</span>
            <TrendingUp className="w-4 h-4 text-copper" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-charcoal">
            ₹5.85 Lakhs
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-warm-border overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => setActiveTab("projects")}
          className={`pb-3.5 px-4 text-sm font-medium font-sans border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "projects"
              ? "border-copper text-copper font-semibold"
              : "border-transparent text-secondaryText hover:text-charcoal"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>My Architectural Plans ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("inquiries")}
          className={`pb-3.5 px-4 text-sm font-medium font-sans border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "inquiries"
              ? "border-copper text-copper font-semibold"
              : "border-transparent text-secondaryText hover:text-charcoal"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Client Inquiries</span>
          {newInquiriesCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-copper inline-block animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3.5 px-4 text-sm font-medium font-sans border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "profile"
              ? "border-copper text-copper font-semibold"
              : "border-transparent text-secondaryText hover:text-charcoal"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Studio Profile & Verification</span>
        </button>
      </div>

      {/* TAB 1: PROJECTS */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          <div className="p-4 bg-white border border-warm-border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by plan name, style, location..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-warm-border text-xs text-charcoal bg-white focus:outline-none focus:border-copper font-sans"
              >
                <option value="all">All Status</option>
                <option value="published">Published Only</option>
                <option value="draft">Drafts Only</option>
              </select>

              <select
                value={facingFilter}
                onChange={(e) => setFacingFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-warm-border text-xs text-charcoal bg-white focus:outline-none focus:border-copper font-sans"
              >
                <option value="all">All Facings</option>
                <option value="East">East</option>
                <option value="North">North</option>
                <option value="West">West</option>
                <option value="South">South</option>
              </select>
            </div>

            <div className="flex items-center gap-1 self-end md:self-auto p-1 bg-warm-grey/60 border border-warm-border rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-white text-charcoal shadow-sm" : "text-secondaryText hover:text-charcoal"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "table" ? "bg-white text-charcoal shadow-sm" : "text-secondaryText hover:text-charcoal"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="p-16 text-center bg-white border border-warm-border rounded-3xl">
              <Layers className="w-10 h-10 text-secondaryText/40 mx-auto mb-3" />
              <h3 className="text-lg font-serif text-charcoal mb-1">No Designs Found</h3>
              <p className="text-xs text-secondaryText font-sans mb-4">
                No architectural plans matched your search or filter settings.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setFacingFilter("all");
                }}
                className="px-4 py-2 rounded-full border border-warm-border text-xs font-medium text-charcoal hover:border-copper"
              >
                Clear Filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white border border-warm-border rounded-3xl overflow-hidden hover:border-copper/50 hover:shadow-card transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-[16/10] w-full bg-charcoal overflow-hidden">
                      <Image
                        src={proj.image}
                        alt={proj.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium backdrop-blur-md ${
                          proj.status === "published"
                            ? "bg-emerald-950/80 text-emerald-200 border border-emerald-400/30"
                            : "bg-charcoal/80 text-amber-300 border border-amber-400/30"
                        }`}>
                          {proj.status === "published" ? "Live on Marketplace" : "Draft (Private)"}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 bg-white/95 text-charcoal text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm font-sans">
                        {proj.price}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-xl font-normal font-serif text-charcoal group-hover:text-copper transition-colors">
                          {proj.name}
                        </h3>
                        <span className="text-[11px] font-mono text-copper font-medium">
                          {proj.vastuScore || 95}% Vastu
                        </span>
                      </div>

                      <div className="text-xs text-secondaryText font-sans mb-3 line-clamp-1">
                        {proj.style} • {proj.location}
                      </div>

                      <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-warm-border/60 text-center text-xs mb-3 font-sans">
                        <div>
                          <span className="text-[10px] text-secondaryText block font-mono">Area</span>
                          <span className="font-medium text-charcoal">{proj.builtUpArea}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-secondaryText block font-mono">Plot</span>
                          <span className="font-medium text-charcoal">{proj.plotSize}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-secondaryText block font-mono">Facing</span>
                          <span className="font-medium text-charcoal">{proj.facing || "East"}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-secondaryText font-mono">
                        <span>{proj.sheetCount || 42} CAD Sheets</span>
                        <span>{proj.views || 0} views • {proj.inquiries || 0} leads</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-warm-grey/40 border-t border-warm-border flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => togglePublishStatus(proj.id)}
                        className={`p-2 rounded-xl border transition-colors ${
                          proj.status === "published"
                            ? "bg-white text-emerald-700 border-warm-border hover:bg-emerald-50"
                            : "bg-white text-amber-700 border-warm-border hover:bg-amber-50"
                        }`}
                        title={proj.status === "published" ? "Unpublish to draft" : "Publish live"}
                      >
                        {proj.status === "published" ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => duplicateProject(proj.id)}
                        className="p-2 rounded-xl bg-white border border-warm-border text-secondaryText hover:text-charcoal transition-colors"
                        title="Duplicate plan"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        href={`/designs/${proj.id}`}
                        className="p-2 rounded-xl bg-white border border-warm-border text-secondaryText hover:text-charcoal transition-colors"
                        title="View public page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleDeleteWithPrompt(proj.id, proj.name)}
                        className="p-2 rounded-xl bg-white border border-warm-border text-secondaryText hover:text-red-600 hover:border-red-200 transition-colors"
                        title="Delete plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(proj)}
                      className="px-4 py-1.5 rounded-full bg-charcoal hover:bg-charcoal/90 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Design</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-warm-border rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-warm-grey/60 border-b border-warm-border text-secondaryText font-medium">
                    <tr>
                      <th className="py-3.5 px-5">Design Name</th>
                      <th className="py-3.5 px-4">Style & Location</th>
                      <th className="py-3.5 px-4">Specs</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Metrics</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-border/60">
                    {filteredProjects.map((proj) => (
                      <tr key={proj.id} className="hover:bg-warm-grey/20 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-9 rounded-lg overflow-hidden bg-charcoal shrink-0">
                              <Image src={proj.image} alt={proj.name} fill className="object-cover" />
                            </div>
                            <span className="font-serif text-sm font-medium text-charcoal">
                              {proj.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-secondaryText">
                          <div>{proj.style}</div>
                          <div className="text-[11px] text-secondaryText/70">{proj.location}</div>
                        </td>
                        <td className="py-4 px-4 text-charcoal">
                          <div>{proj.builtUpArea} • {proj.plotSize}</div>
                          <div className="text-[11px] text-secondaryText">{proj.facing || "East"}-Facing</div>
                        </td>
                        <td className="py-4 px-4 font-serif text-sm text-charcoal font-medium">
                          {proj.price}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                            proj.status === "published"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {proj.status === "published" ? "Live" : "Draft"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-[11px] font-mono text-secondaryText">
                          {proj.views || 0} views • {proj.inquiries || 0} leads
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(proj)}
                              className="p-1.5 rounded-lg text-secondaryText hover:text-charcoal hover:bg-warm-grey"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => togglePublishStatus(proj.id)}
                              className="p-1.5 rounded-lg text-secondaryText hover:text-charcoal hover:bg-warm-grey"
                              title={proj.status === "published" ? "Make Draft" : "Make Live"}
                            >
                              {proj.status === "published" ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>
                            <Link
                              href={`/designs/${proj.id}`}
                              className="p-1.5 rounded-lg text-secondaryText hover:text-charcoal hover:bg-warm-grey"
                              title="View public page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDeleteWithPrompt(proj.id, proj.name)}
                              className="p-1.5 rounded-lg text-secondaryText hover:text-red-600 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INQUIRIES */}
      {activeTab === "inquiries" && <InquiriesTab />}

      {/* TAB 3: STUDIO PROFILE */}
      {activeTab === "profile" && <StudioProfileTab />}

      {/* Project Edit & Create Modal */}
      <ProjectEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={editingProject}
        onSave={handleSaveModal}
        mode={modalMode}
      />
    </div>
  );
}
