"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ArchitecturalProject, ProjectPackage, PackageStatus } from "@/lib/types";
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  FileText, 
  X, 
  Loader2, 
  Archive, 
  Send, 
  Eye, 
  Filter,
  DollarSign
} from "lucide-react";

interface PackagesTabProps {
  projects: ArchitecturalProject[];
}

const COMMON_DELIVERABLES = [
  "Ground Floor Setting Out Plan (1:50)",
  "First Floor Dimensioned Layout",
  "Front & Rear Elevations",
  "Building Longitudinal Cross-Section",
  "Foundation & Column Centerline Layout",
  "RCC Slab & Beam Rebar Schedules",
  "Electrical Conduit & Lighting Layout",
  "Plumbing, Water Supply & Sanitary Schematics",
  "Bill of Quantities (BOQ Material Takeoff)",
  "Parametric 3D BIM Model (Revit / SketchUp)",
  "Window & Door Joinery Schedule",
  "KMBR Municipal Sanction Drawing Sheet"
];

export default function PackagesTab({ projects }: PackagesTabProps) {
  const [packages, setPackages] = useState<(ProjectPackage & { priceFormatted?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Filters
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ProjectPackage | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    projectId: "",
    name: "",
    description: "",
    priceRupees: "35000",
    deliverables: [] as string[],
    status: "draft" as PackageStatus,
  });
  const [newDeliverable, setNewDeliverable] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch Packages for architect's projects
  const fetchPackages = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/packages", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("sarc_token") || ""}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load packages.");
      }
      setPackages(data.packages || []);
    } catch (err: any) {
      console.error("fetchPackages error:", err);
      setErrorMessage(err.message || "Could not retrieve packages.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const openCreateModal = () => {
    setEditingPackage(null);
    setFormData({
      projectId: projects[0]?.id || "",
      name: "",
      description: "",
      priceRupees: "45000",
      deliverables: [
        "Ground Floor Setting Out Plan (1:50)",
        "First Floor Dimensioned Layout",
        "Front & Rear Elevations",
      ],
      status: "published",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: ProjectPackage) => {
    setEditingPackage(pkg);
    setFormData({
      projectId: pkg.projectId,
      name: pkg.name,
      description: pkg.description,
      priceRupees: String(pkg.pricePaise / 100),
      deliverables: [...pkg.deliverables],
      status: pkg.status,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleAddDeliverable = (item: string) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    if (formData.deliverables.includes(trimmed)) return;
    setFormData({
      ...formData,
      deliverables: [...formData.deliverables, trimmed],
    });
    setNewDeliverable("");
  };

  const handleRemoveDeliverable = (index: number) => {
    setFormData({
      ...formData,
      deliverables: formData.deliverables.filter((_, idx) => idx !== index),
    });
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Please provide a package title.");
      return;
    }

    if (!formData.projectId) {
      setFormError("Please select the associated architectural project.");
      return;
    }

    const priceNum = parseFloat(formData.priceRupees.replace(/[^0-9.]/g, ""));
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError("Please enter a valid package price in INR (e.g. 45000).");
      return;
    }

    if (formData.deliverables.length === 0) {
      setFormError("Please include at least one architectural drawing or deliverable.");
      return;
    }

    setIsSaving(true);
    const pricePaise = Math.round(priceNum * 100);

    try {
      const isEdit = Boolean(editingPackage);
      const url = isEdit ? `/api/packages/${editingPackage!.id}` : "/api/packages";
      const method = isEdit ? "PATCH" : "POST";

      const payload = {
        projectId: formData.projectId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        pricePaise,
        deliverables: formData.deliverables,
        status: formData.status,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("sarc_token") || ""}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save architectural package.");
      }

      setSuccessMessage(isEdit ? "Package updated successfully!" : "New package created and saved!");
      setTimeout(() => setSuccessMessage(""), 3500);
      setIsModalOpen(false);
      fetchPackages();
    } catch (err: any) {
      console.error("Save package error:", err);
      setFormError(err.message || "Failed to save package.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (pkg: ProjectPackage, newStatus: PackageStatus) => {
    try {
      const res = await fetch(`/api/packages/${pkg.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("sarc_token") || ""}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setPackages((prev) =>
          prev.map((p) => (p.id === pkg.id ? { ...p, status: newStatus } : p))
        );
      }
    } catch (err) {
      console.error("Status toggle error:", err);
    }
  };

  const handleDeletePackage = async (pkgId: string) => {
    if (!confirm("Are you sure you want to delete this architectural package?")) return;
    try {
      const res = await fetch(`/api/packages/${pkgId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("sarc_token") || ""}`,
        },
      });
      if (res.ok) {
        setPackages((prev) => prev.filter((p) => p.id !== pkgId));
      }
    } catch (err) {
      console.error("Delete package error:", err);
    }
  };

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return packages.filter((p) => {
      if (selectedProjectFilter !== "all" && p.projectId !== selectedProjectFilter) {
        return false;
      }
      if (statusFilter !== "all" && p.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [packages, selectedProjectFilter, statusFilter]);

  // Lookup map for project name
  const projectMap = useMemo(() => {
    const map = new Map<string, string>();
    projects.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* Header Banner & Controls */}
      <div className="bg-white border border-warm-border p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-copper font-sans">
            <Package className="w-4 h-4" />
            <span>Commercial Offerings</span>
          </div>
          <h2 className="text-2xl font-serif text-charcoal mt-1">
            Drawing Packages
          </h2>
          <p className="text-xs text-secondaryText font-sans mt-0.5 max-w-xl">
            Manage deliverable tiers, CAD specifications, and fixed pricing for client purchases.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-copper hover:bg-copper-hover text-white text-xs font-medium rounded-full flex items-center justify-center gap-2 transition-all shadow-sm shrink-0 font-sans"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Package</span>
        </button>
      </div>

      {/* Feedback Messages */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-warm-grey/60 border border-warm-border p-3.5 rounded-xl font-sans text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-secondaryText font-medium">Filter by Project:</span>
            <select
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
              className="bg-white border border-warm-border rounded-lg px-3 py-1.5 text-xs text-charcoal focus:outline-none focus:border-copper"
            >
              <option value="all">All Projects ({projects.length})</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-secondaryText font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-warm-border rounded-lg px-3 py-1.5 text-xs text-charcoal focus:outline-none focus:border-copper"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-secondaryText">
          Showing <strong>{filteredPackages.length}</strong> package{filteredPackages.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="py-16 text-center bg-white border border-warm-border rounded-2xl space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-copper mx-auto" />
          <p className="text-xs text-secondaryText font-sans">
            Loading architectural packages from Cloudflare D1...
          </p>
        </div>
      ) : filteredPackages.length === 0 ? (
        /* Empty State */
        <div className="py-16 text-center bg-white border border-dashed border-warm-border rounded-2xl space-y-3 p-6">
          <div className="w-12 h-12 rounded-full bg-warm-grey flex items-center justify-center text-charcoal/40 mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-base font-serif text-charcoal">No Packages Found</h3>
          <p className="text-xs text-secondaryText font-sans max-w-md mx-auto">
            Create structured fixed-price tiers for your architectural designs to give clients predictable, transparent licensing options.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-2 px-5 py-2 bg-charcoal hover:bg-charcoal/90 text-white text-xs font-medium rounded-full inline-flex items-center gap-2 transition-colors font-sans"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Your First Package</span>
          </button>
        </div>
      ) : (
        /* Package Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPackages.map((pkg) => {
            const priceFormatted = `₹${(pkg.pricePaise / 100).toLocaleString("en-IN")}`;
            const projName = projectMap.get(pkg.projectId) || pkg.projectId;

            return (
              <div
                key={pkg.id}
                className="bg-white border border-warm-border rounded-2xl p-5 flex flex-col justify-between hover:shadow-card transition-all duration-200"
              >
                <div>
                  {/* Status & Project Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-sans text-mutedText truncate font-medium max-w-[180px]">
                      {projName}
                    </span>
                    <span
                      className={`text-[10px] font-sans uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${
                        pkg.status === "published"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : pkg.status === "draft"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {pkg.status}
                    </span>
                  </div>

                  {/* Title & Price */}
                  <h3 className="text-lg font-serif text-charcoal mb-1">
                    {pkg.name}
                  </h3>
                  <div className="text-2xl font-serif text-copper font-medium mb-3">
                    {priceFormatted}
                  </div>

                  {/* Description */}
                  {pkg.description && (
                    <p className="text-xs text-secondaryText font-sans mb-4 line-clamp-2 leading-relaxed">
                      {pkg.description}
                    </p>
                  )}

                  {/* Deliverables List Preview */}
                  <div className="border-t border-warm-border/70 pt-3 mb-4">
                    <div className="text-[11px] font-semibold text-charcoal uppercase tracking-wider mb-2 font-sans flex items-center justify-between">
                      <span>Included Deliverables</span>
                      <span className="font-mono text-copper text-xs">{pkg.deliverables.length} Items</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-secondaryText font-sans">
                      {pkg.deliverables.slice(0, 4).map((d, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-copper shrink-0 mt-0.5" />
                          <span className="truncate">{d}</span>
                        </li>
                      ))}
                      {pkg.deliverables.length > 4 && (
                        <li className="text-[11px] text-mutedText italic pl-5">
                          + {pkg.deliverables.length - 4} additional technical sheets
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="border-t border-warm-border pt-4 flex items-center justify-between gap-2 font-sans text-xs">
                  <div className="flex items-center gap-1.5">
                    {pkg.status === "draft" ? (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(pkg, "published")}
                        className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-[11px] font-medium"
                      >
                        Publish
                      </button>
                    ) : pkg.status === "published" ? (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(pkg, "draft")}
                        className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-[11px] font-medium"
                      >
                        Unpublish
                      </button>
                    ) : null}

                    {pkg.status !== "archived" && (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(pkg, "archived")}
                        className="p-1 text-secondaryText hover:text-charcoal transition-colors"
                        title="Archive package"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(pkg)}
                      className="px-3 py-1.5 rounded-lg border border-warm-border hover:border-charcoal/40 text-charcoal text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="p-1.5 text-secondaryText hover:text-red-600 transition-colors"
                      title="Delete package"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Package Creation & Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-warm-border shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-warm-border flex items-center justify-between bg-warm-grey">
              <div>
                <h3 className="text-xl font-serif text-charcoal">
                  {editingPackage ? "Edit Architectural Package" : "Create Drawing Package"}
                </h3>
                <p className="text-xs text-secondaryText font-sans mt-0.5">
                  Predefine scope of construction drawings and fixed licensing fee.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-secondaryText hover:text-charcoal hover:bg-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePackage} className="p-6 overflow-y-auto space-y-5 flex-1">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Project Selection */}
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                  Associated Architectural Project <span className="text-copper">*</span>
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-border bg-white text-xs text-charcoal focus:outline-none focus:border-copper font-sans"
                  required
                >
                  <option value="" disabled>Select an architectural design</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Package Name & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                    Package Name <span className="text-copper">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Executive Builder Package"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                    Fixed Price (₹ INR) <span className="text-copper">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-secondaryText font-serif">₹</span>
                    <input
                      type="number"
                      min={100}
                      step={500}
                      value={formData.priceRupees}
                      onChange={(e) => setFormData({ ...formData, priceRupees: e.target.value })}
                      placeholder="65000"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper font-mono"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-mutedText mt-1 font-sans">
                    Stored in integer paise (₹{formData.priceRupees || 0} = {Math.round(Number(formData.priceRupees || 0) * 100).toLocaleString()} paise).
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                  Package Description & Scope
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of what is included and what type of construction this tier is suitable for..."
                  className="w-full px-3.5 py-2 rounded-xl border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper font-sans resize-none"
                />
              </div>

              {/* Deliverables Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-charcoal font-sans">
                    Included Architectural Deliverables <span className="text-copper">*</span>
                  </label>
                  <span className="text-[11px] text-secondaryText">
                    {formData.deliverables.length} item{formData.deliverables.length === 1 ? "" : "s"}
                  </span>
                </div>

                {/* Custom Add Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddDeliverable(newDeliverable);
                      }
                    }}
                    placeholder="Type custom drawing or deliverable sheet..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddDeliverable(newDeliverable)}
                    className="px-4 py-2 bg-charcoal hover:bg-charcoal/90 text-white text-xs font-medium rounded-xl transition-colors shrink-0"
                  >
                    Add
                  </button>
                </div>

                {/* Quick Add Preset Suggestions */}
                <div>
                  <span className="text-[10px] text-mutedText uppercase tracking-wider block mb-1.5 font-sans">
                    Quick suggestions:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-warm-grey/50 rounded-xl border border-warm-border/50">
                    {COMMON_DELIVERABLES.map((item, idx) => {
                      const isAdded = formData.deliverables.includes(item);
                      return (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => handleAddDeliverable(item)}
                          disabled={isAdded}
                          className={`text-[11px] px-2.5 py-1 rounded-full transition-colors ${
                            isAdded
                              ? "bg-warm-border/60 text-mutedText cursor-not-allowed"
                              : "bg-white border border-warm-border text-charcoal hover:border-copper hover:text-copper"
                          }`}
                        >
                          + {item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Current Deliverables List */}
                <div className="space-y-1.5 max-h-40 overflow-y-auto pt-1">
                  {formData.deliverables.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-warm-grey border border-warm-border text-xs text-charcoal font-sans"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-copper shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(idx)}
                        className="text-secondaryText hover:text-red-600 transition-colors ml-2"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Toggle */}
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                  Publication Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-sans text-charcoal cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={formData.status === "published"}
                      onChange={() => setFormData({ ...formData, status: "published" })}
                      className="accent-copper"
                    />
                    <span>Published (Visible to Homeowners)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-sans text-charcoal cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === "draft"}
                      onChange={() => setFormData({ ...formData, status: "draft" })}
                      className="accent-copper"
                    />
                    <span>Draft (Private)</span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-warm-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-full border border-warm-border text-xs font-medium text-secondaryText hover:text-charcoal hover:border-charcoal/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-full bg-copper hover:bg-copper-hover text-white text-xs font-medium flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{editingPackage ? "Save Package Changes" : "Create Package"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

