"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArchitecturalProject } from "@/lib/types";
import { 
  X, 
  Check, 
  Sparkles, 
  Layers, 
  Maximize, 
  Bed, 
  Compass, 
  FileText, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Eye, 
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

interface ProjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ArchitecturalProject | null;
  onSave: (savedData: Partial<ArchitecturalProject>) => void;
  mode: "edit" | "create";
}

const PRESET_STYLES = [
  "CONTEMPORARY",
  "TRADITIONAL",
  "MINIMALIST TROPICAL",
  "MODERNIST",
  "VERNACULAR",
  "COLONIAL FUSION"
];

const PRESET_FACINGS = ["East", "North", "North-East", "West", "South"] as const;

const PRESET_GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80"
];

export default function ProjectEditModal({
  isOpen,
  onClose,
  project,
  onSave,
  mode
}: ProjectEditModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "deliverables" | "imagery" | "preview">("overview");

  // Form State
  const [name, setName] = useState("");
  const [style, setStyle] = useState("CONTEMPORARY");
  const [location, setLocation] = useState("Kochi, Kerala");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"published" | "draft">("published");

  // Specs
  const [cents, setCents] = useState<number>(12);
  const [plotSize, setPlotSize] = useState("12 Cents");
  const [builtUpArea, setBuiltUpArea] = useState("2,450 Sq.Ft");
  const [bedrooms, setBedrooms] = useState<number>(4);
  const [floors, setFloors] = useState<number>(2);
  const [facing, setFacing] = useState<"North" | "South" | "East" | "West" | "North-East">("East");
  const [vastuScore, setVastuScore] = useState<number>(98);
  const [plotWidth, setPlotWidth] = useState("55 ft");
  const [plotLength, setPlotLength] = useState("95 ft");
  const [setbacks, setSetbacks] = useState("Front 15ft, Rear 10ft, Sides 5ft");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState("");

  // Deliverables & Pricing
  const [price, setPrice] = useState("₹85,000");
  const [sheetCount, setSheetCount] = useState<number>(42);
  const [dwgAvailable, setDwgAvailable] = useState(true);
  const [bimAvailable, setBimAvailable] = useState(true);
  const [boqAvailable, setBoqAvailable] = useState(true);
  const [mepAvailable, setMepAvailable] = useState(true);

  // Imagery
  const [image, setImage] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [floorPlanImage, setFloorPlanImage] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  // Validation / Feedback
  const [errorMsg, setErrorMsg] = useState("");
  const [successToast, setSuccessToast] = useState(false);

  // Sync state when project changes
  useEffect(() => {
    if (project && mode === "edit") {
      setName(project.name || "");
      setStyle(project.style || "CONTEMPORARY");
      setLocation(project.location || "Kochi, Kerala");
      setDescription(project.description || "");
      setStatus(project.status || "published");

      setCents(project.cents || 12);
      setPlotSize(project.plotSize || `${project.cents || 12} Cents`);
      setBuiltUpArea(project.builtUpArea || "2,450 Sq.Ft");
      setBedrooms(project.bedrooms || 3);
      setFloors(project.floors || 2);
      setFacing(project.facing || "East");
      setVastuScore(project.vastuScore || 95);
      setPlotWidth(project.dimensions?.plotWidth || "50 ft");
      setPlotLength(project.dimensions?.plotLength || "90 ft");
      setSetbacks(project.dimensions?.setbacks || "Front 15ft, Rear 10ft, Sides 5ft");
      setHighlights(project.highlights || []);

      setPrice(project.price || "₹85,000");
      setSheetCount(project.sheetCount || 42);
      setDwgAvailable(project.dwgAvailable ?? true);
      setBimAvailable(project.bimAvailable ?? true);
      setBoqAvailable(project.boqAvailable ?? true);
      setMepAvailable(project.mepAvailable ?? true);

      setImage(project.image || PRESET_GALLERY_IMAGES[0]);
      setGallery(project.gallery && project.gallery.length > 0 ? project.gallery : PRESET_GALLERY_IMAGES.slice(0, 3));
      setFloorPlanImage(project.floorPlanImage || "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80");
    } else if (mode === "create") {
      // Default create state
      setName("");
      setStyle("CONTEMPORARY");
      setLocation("Ernakulam, Kerala");
      setDescription("An elegant tropical modern residence maximizing natural cross-ventilation, daylighting, and regional vernacular materials.");
      setStatus("published");

      setCents(10);
      setPlotSize("10 Cents");
      setBuiltUpArea("2,200 Sq.Ft");
      setBedrooms(3);
      setFloors(2);
      setFacing("East");
      setVastuScore(95);
      setPlotWidth("45 ft");
      setPlotLength("85 ft");
      setSetbacks("Front 12ft, Rear 8ft, Sides 4ft");
      setHighlights([
        "Double-height light well courtyard",
        "Passive ventilation with terracotta louvers",
        "Rainwater harvesting reservoir provision",
        "Vastu-compliant master bedroom in South-West"
      ]);

      setPrice("₹75,000");
      setSheetCount(42);
      setDwgAvailable(true);
      setBimAvailable(true);
      setBoqAvailable(true);
      setMepAvailable(true);

      setImage(PRESET_GALLERY_IMAGES[0]);
      setGallery(PRESET_GALLERY_IMAGES.slice(0, 3));
      setFloorPlanImage("https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80");
    }
    setErrorMsg("");
    setActiveTab("overview");
  }, [project, mode, isOpen]);

  if (!isOpen) return null;

  const handleAddHighlight = () => {
    if (!newHighlight.trim()) return;
    setHighlights([...highlights, newHighlight.trim()]);
    setNewHighlight("");
  };

  const handleRemoveHighlight = (idx: number) => {
    setHighlights(highlights.filter((_, i) => i !== idx));
  };

  const handleAddGalleryImage = (url: string) => {
    if (!url.trim()) return;
    if (gallery.includes(url.trim())) return;
    setGallery([...gallery, url.trim()]);
    setNewImageUrl("");
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setGallery(gallery.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMsg("Please provide a design title.");
      setActiveTab("overview");
      return;
    }

    if (!price.trim()) {
      setErrorMsg("Please enter a blueprint licensing price.");
      setActiveTab("deliverables");
      return;
    }

    const payload: Partial<ArchitecturalProject> = {
      name: name.trim(),
      style,
      location,
      description,
      status,
      cents: Number(cents) || 10,
      plotSize: `${cents} Cents`,
      builtUpArea: builtUpArea.includes("Sq.Ft") ? builtUpArea : `${builtUpArea} Sq.Ft`,
      bedrooms: Number(bedrooms) || 3,
      floors: Number(floors) || 2,
      facing,
      vastuScore: Number(vastuScore) || 95,
      dimensions: {
        plotWidth,
        plotLength,
        setbacks
      },
      highlights,
      price: price.startsWith("₹") ? price : `₹${price}`,
      sheetCount: Number(sheetCount) || 42,
      dwgAvailable,
      bimAvailable,
      boqAvailable,
      mepAvailable,
      image: image || PRESET_GALLERY_IMAGES[0],
      gallery: gallery.length > 0 ? gallery : [image],
      floorPlanImage
    };

    onSave(payload);
    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-charcoal/70 backdrop-blur-sm transition-all duration-300">
      <div 
        className="relative w-full max-w-4xl bg-white border border-warm-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-warm-border flex items-center justify-between bg-warm-grey/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-copper/10 border border-copper/30 flex items-center justify-center text-copper">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-normal font-serif text-charcoal">
                  {mode === "create" ? "Publish New Architectural Plan" : `Edit Plan: ${name || "Untitled"}`}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium ${
                  status === "published" 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  {status === "published" ? "Published Live" : "Draft (Hidden)"}
                </span>
              </div>
              <p className="text-xs text-secondaryText font-sans">
                Comprehensive drawing set & specifications manager for verified architects.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-warm-border flex items-center justify-center text-secondaryText hover:text-charcoal hover:border-charcoal/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-warm-border px-6 bg-white overflow-x-auto scrollbar-none gap-2 pt-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-3 text-xs font-medium font-sans border-b-2 transition-all whitespace-nowrap ${
              activeTab === "overview"
                ? "border-copper text-copper font-semibold"
                : "border-transparent text-secondaryText hover:text-charcoal"
            }`}
          >
            1. Core Overview
          </button>
          <button
            onClick={() => setActiveTab("specs")}
            className={`pb-3 px-3 text-xs font-medium font-sans border-b-2 transition-all whitespace-nowrap ${
              activeTab === "specs"
                ? "border-copper text-copper font-semibold"
                : "border-transparent text-secondaryText hover:text-charcoal"
            }`}
          >
            2. Plot & Spatial Specs
          </button>
          <button
            onClick={() => setActiveTab("deliverables")}
            className={`pb-3 px-3 text-xs font-medium font-sans border-b-2 transition-all whitespace-nowrap ${
              activeTab === "deliverables"
                ? "border-copper text-copper font-semibold"
                : "border-transparent text-secondaryText hover:text-charcoal"
            }`}
          >
            3. Pricing & Deliverables
          </button>
          <button
            onClick={() => setActiveTab("imagery")}
            className={`pb-3 px-3 text-xs font-medium font-sans border-b-2 transition-all whitespace-nowrap ${
              activeTab === "imagery"
                ? "border-copper text-copper font-semibold"
                : "border-transparent text-secondaryText hover:text-charcoal"
            }`}
          >
            4. Gallery & Blueprints
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`pb-3 px-3 text-xs font-medium font-sans border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "preview"
                ? "border-copper text-copper font-semibold"
                : "border-transparent text-secondaryText hover:text-charcoal"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Marketplace Preview</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-warm-grey/20">
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: CORE OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-5 animate-in fade-in-50 duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                    Design Title <span className="text-copper">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. The Ridge House"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-warm-border text-sm text-charcoal focus:outline-none focus:border-copper transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                    Architectural Style
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-warm-border text-sm text-charcoal focus:outline-none focus:border-copper transition-colors"
                  >
                    {PRESET_STYLES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                    Primary Regional Context / Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Kochi, Kerala"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-warm-border text-sm text-charcoal focus:outline-none focus:border-copper transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                    Listing Status
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setStatus("published")}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                        status === "published"
                          ? "bg-copper text-white border-copper shadow-sm"
                          : "bg-white text-secondaryText border-warm-border hover:border-charcoal/30"
                      }`}
                    >
                      ✓ Published Live
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("draft")}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                        status === "draft"
                          ? "bg-charcoal text-white border-charcoal shadow-sm"
                          : "bg-white text-secondaryText border-warm-border hover:border-charcoal/30"
                      }`}
                    >
                      Private Draft
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                  Architectural Narrative & Concept Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the passive climate strategies, spatial orientation, material palette, and courtyard zoning..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-warm-border text-sm text-charcoal focus:outline-none focus:border-copper transition-colors font-sans leading-relaxed"
                />
                <p className="text-[11px] text-secondaryText mt-1">
                  Tip: Highlight local micro-climate adaptations like monsoon eaves, laterite cladding, or courtyard stack effect.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PLOT & SPATIAL SPECS */}
          {activeTab === "specs" && (
            <div className="space-y-5 animate-in fade-in-50 duration-150">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                    Plot Size (Cents)
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={50}
                    step={0.5}
                    value={cents}
                    onChange={(e) => setCents(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-warm-border text-sm text-charcoal focus:outline-none focus:border-copper font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                    Built-up Area
                  </label>
                  <input
                    type="text"
                    value={builtUpArea}
                    onChange={(e) => setBuiltUpArea(e.target.value)}
                    placeholder="2,450 Sq.Ft"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-warm-border text-sm text-charcoal focus:outline-none focus:border-copper"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                    Bedrooms (BHK)
                  </label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-warm-border text-sm text-charcoal focus:outline-none focus:border-copper"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} BHK
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                    Floors / Levels
                  </label>
                  <select
                    value={floors}
                    onChange={(e) => setFloors(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-warm-border text-sm text-charcoal focus:outline-none focus:border-copper"
                  >
                    {[1, 2, 3, 4].map((num) => (
                      <option key={num} value={num}>
                        G+{num - 1} ({num} Floor{num > 1 ? "s" : ""})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                    Primary Plot Facing / Orientation
                  </label>
                  <select
                    value={facing}
                    onChange={(e) => setFacing(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-warm-border text-sm text-charcoal focus:outline-none focus:border-copper font-sans"
                  >
                    {PRESET_FACINGS.map((f) => (
                      <option key={f} value={f}>
                        {f}-Facing
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans flex items-center justify-between">
                    <span>Vastu Shastra Compliance Rating</span>
                    <span className="font-mono text-copper font-medium">{vastuScore}% Vastu</span>
                  </label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <input
                      type="range"
                      min={70}
                      max={100}
                      step={1}
                      value={vastuScore}
                      onChange={(e) => setVastuScore(parseInt(e.target.value) || 90)}
                      className="w-full accent-copper cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border border-warm-border rounded-2xl space-y-3">
                <span className="text-xs font-semibold text-charcoal uppercase tracking-wider font-sans block">
                  Plot Dimensions & Municipal Setbacks
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] text-secondaryText block mb-1">Plot Width</span>
                    <input
                      type="text"
                      value={plotWidth}
                      onChange={(e) => setPlotWidth(e.target.value)}
                      placeholder="e.g. 55 ft"
                      className="w-full px-3 py-2 rounded-lg border border-warm-border text-xs text-charcoal"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-secondaryText block mb-1">Plot Length</span>
                    <input
                      type="text"
                      value={plotLength}
                      onChange={(e) => setPlotLength(e.target.value)}
                      placeholder="e.g. 95 ft"
                      className="w-full px-3 py-2 rounded-lg border border-warm-border text-xs text-charcoal"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-secondaryText block mb-1">Setback Requirements</span>
                    <input
                      type="text"
                      value={setbacks}
                      onChange={(e) => setSetbacks(e.target.value)}
                      placeholder="Front 15ft, Rear 10ft, Sides 5ft"
                      className="w-full px-3 py-2 rounded-lg border border-warm-border text-xs text-charcoal"
                    />
                  </div>
                </div>
              </div>

              {/* Key Highlights Tags Editor */}
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                  Key Architectural Features & Highlights
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddHighlight();
                      }
                    }}
                    placeholder="e.g. Double-height living pavilion, Courtyard stack cooling..."
                    className="flex-1 px-4 py-2 rounded-xl bg-white border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper"
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="px-4 py-2 rounded-xl bg-charcoal hover:bg-charcoal/90 text-white text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {highlights.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-warm-border text-xs text-charcoal font-sans"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(idx)}
                        className="text-secondaryText hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {highlights.length === 0 && (
                    <span className="text-xs text-secondaryText italic">No custom highlights added yet.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRICING & DELIVERABLES */}
          {activeTab === "deliverables" && (
            <div className="space-y-5 animate-in fade-in-50 duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="p-5 bg-white border border-warm-border rounded-2xl">
                  <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                    Complete Blueprint Licensing Fee <span className="text-copper">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="₹85,000"
                      className="w-full px-4 py-2.5 rounded-xl border border-warm-border text-base font-serif text-charcoal focus:outline-none focus:border-copper"
                    />
                  </div>
                  <p className="text-[11px] text-secondaryText mt-2 font-sans">
                    Includes non-exclusive construction license for 1 single-family home. S-ARC 10% platform fee applies upon escrow completion.
                  </p>
                </div>

                <div className="p-5 bg-white border border-warm-border rounded-2xl">
                  <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                    Total Drawing Sheets in Package
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={120}
                    value={sheetCount}
                    onChange={(e) => setSheetCount(parseInt(e.target.value) || 42)}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-border text-sm font-mono text-charcoal focus:outline-none focus:border-copper"
                  />
                  <p className="text-[11px] text-secondaryText mt-2 font-sans">
                    Typical comprehensive sets include 40–55 detailed A1 sheets for site execution.
                  </p>
                </div>
              </div>

              {/* Digital Deliverables Checkboxes */}
              <div className="p-5 bg-white border border-warm-border rounded-2xl space-y-4">
                <h4 className="text-sm font-normal font-serif text-charcoal">
                  Included Technical Deliverables & File Types
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-warm-border/80 hover:bg-warm-grey/30 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={dwgAvailable}
                      onChange={(e) => setDwgAvailable(e.target.checked)}
                      className="mt-0.5 accent-copper rounded"
                    />
                    <div>
                      <div className="text-xs font-medium text-charcoal font-sans">AutoCAD (.DWG / .DXF) Vector Sets</div>
                      <div className="text-[11px] text-secondaryText">Complete editable layered drawings for municipal sanction & site engineers.</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-warm-border/80 hover:bg-warm-grey/30 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={bimAvailable}
                      onChange={(e) => setBimAvailable(e.target.checked)}
                      className="mt-0.5 accent-copper rounded"
                    />
                    <div>
                      <div className="text-xs font-medium text-charcoal font-sans">BIM 3D Model (Revit / SketchUp)</div>
                      <div className="text-[11px] text-secondaryText">Parametric 3D digital model with materials & spatial schedules.</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-warm-border/80 hover:bg-warm-grey/30 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={boqAvailable}
                      onChange={(e) => setBoqAvailable(e.target.checked)}
                      className="mt-0.5 accent-copper rounded"
                    />
                    <div>
                      <div className="text-xs font-medium text-charcoal font-sans">Structural Bill of Quantities (BOQ)</div>
                      <div className="text-[11px] text-secondaryText">Concrete, steel tonnage, brickwork, and flooring takeoff spreadsheet.</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-warm-border/80 hover:bg-warm-grey/30 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={mepAvailable}
                      onChange={(e) => setMepAvailable(e.target.checked)}
                      className="mt-0.5 accent-copper rounded"
                    />
                    <div>
                      <div className="text-xs font-medium text-charcoal font-sans">MEP Electrical & Plumbing Schematics</div>
                      <div className="text-[11px] text-secondaryText">Concealed conduit routing, distribution boards, septic tank & rainwater sumps.</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GALLERY & BLUEPRINTS */}
          {activeTab === "imagery" && (
            <div className="space-y-5 animate-in fade-in-50 duration-150">
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                  Primary Elevation Hero Image (URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper font-mono"
                  />
                </div>
                
                {/* Hero Thumbnail Preview */}
                {image && (
                  <div className="mt-3 relative aspect-[16/9] w-full max-w-sm rounded-xl overflow-hidden border border-warm-border bg-charcoal">
                    <Image src={image} alt="Hero preview" fill className="object-cover" />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-mono">
                      Hero Banner
                    </span>
                  </div>
                )}
              </div>

              {/* Gallery Images List */}
              <div className="p-4 bg-white border border-warm-border rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-charcoal font-sans">
                    Additional Architectural Gallery Shots
                  </label>
                  <span className="text-[11px] text-secondaryText">{gallery.length} Images</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Paste image URL..."
                    className="flex-1 px-4 py-2 rounded-xl border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddGalleryImage(newImageUrl)}
                    className="px-4 py-2 bg-charcoal text-white text-xs font-medium rounded-xl hover:bg-charcoal/90 transition-colors"
                  >
                    Add to Gallery
                  </button>
                </div>

                {/* Preset Suggestions */}
                <div className="pt-2">
                  <span className="text-[11px] text-secondaryText block mb-2 font-sans">
                    Quick Preset Architectural Photography:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {PRESET_GALLERY_IMAGES.map((presetUrl, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => handleAddGalleryImage(presetUrl)}
                        className="relative aspect-video rounded-lg overflow-hidden border border-warm-border hover:border-copper group transition-all"
                        title="Click to add to gallery"
                      >
                        <Image src={presetUrl} alt={`Preset ${idx + 1}`} fill className="object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center text-white text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                          + Add
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Gallery List */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                  {gallery.map((url, idx) => (
                    <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-warm-border group bg-warm-grey">
                      <Image src={url} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floor Plan Image */}
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                  Floor Plan / Technical Drawing Preview Image (URL)
                </label>
                <input
                  type="text"
                  value={floorPlanImage}
                  onChange={(e) => setFloorPlanImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB 5: LIVE MARKETPLACE PREVIEW */}
          {activeTab === "preview" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                <span>
                  <strong>Interactive Marketplace Preview</strong>: This is exactly how homeowners across South India will see this blueprint in search results and the catalog.
                </span>
              </div>

              <div className="max-w-md mx-auto bg-white border border-warm-border rounded-2xl overflow-hidden shadow-subtle hover:shadow-card transition-all">
                <div className="relative aspect-[16/10] w-full bg-charcoal overflow-hidden">
                  <Image
                    src={image || PRESET_GALLERY_IMAGES[0]}
                    alt={name || "Preview"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-charcoal/80 text-white text-[10px] font-mono tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                    {style}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 text-charcoal text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm font-sans">
                    {price}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-xl font-normal font-serif text-charcoal">
                      {name || "Untitled Architectural Design"}
                    </h3>
                    <span className="text-[11px] font-mono text-copper font-medium">
                      {vastuScore}% Vastu
                    </span>
                  </div>

                  <p className="text-xs text-secondaryText font-sans mb-4 line-clamp-2">
                    {description || "Architectural plan featuring climate-responsive tropical features."}
                  </p>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-warm-border/60 text-center mb-4">
                    <div>
                      <span className="text-[10px] text-secondaryText block uppercase font-mono">Area</span>
                      <span className="text-xs font-medium text-charcoal">{builtUpArea}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-secondaryText block uppercase font-mono">Plot</span>
                      <span className="text-xs font-medium text-charcoal">{cents} Cents</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-secondaryText block uppercase font-mono">Facing</span>
                      <span className="text-xs font-medium text-charcoal">{facing}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-secondaryText font-sans">
                    <span>{sheetCount} Technical CAD Sheets</span>
                    <span className="text-copper font-medium">Inspect Blueprints →</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Actions */}
        <div className="px-6 py-4 border-t border-warm-border flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            {successToast && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>Changes saved successfully to marketplace!</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full border border-warm-border text-xs font-medium text-secondaryText hover:text-charcoal hover:border-charcoal/30 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 rounded-full bg-copper hover:bg-copper-hover text-white text-xs font-medium tracking-wide flex items-center gap-2 transition-all shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>{mode === "create" ? "Publish Architectural Plan" : "Save Changes"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

