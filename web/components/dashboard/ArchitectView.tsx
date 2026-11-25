"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProjects } from "@/lib/projectsContext";
import { useAuth } from "@/lib/authContext";
import { ArchitecturalProject } from "@/lib/types";
import ProjectEditModal from "@/components/dashboard/ProjectEditModal";
import InquiriesTab from "@/components/dashboard/InquiriesTab";
import StudioProfileTab from "@/components/dashboard/StudioProfileTab";
import PackagesTab from "@/components/dashboard/PackagesTab";
import EarningsTab from "@/components/dashboard/EarningsTab";
import VerificationBadge from "@/components/VerificationBadge";
import { 
  LayoutDashboard, 
  Compass, 
  MessageSquare, 
  Package, 
  Wallet, 
  UserCheck, 
  Plus, 
  Search, 
  Bell, 
  ShieldCheck, 
  TrendingUp, 
  Eye, 
  ArrowUpRight, 
  Filter, 
  SlidersHorizontal, 
  Layers, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  Download, 
  MoreVertical, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Copy, 
  X, 
  Sparkles,
  ArrowRight,
  FileCheck
} from "lucide-react";

type CoreTab = "overview" | "designs" | "inquiries" | "packages" | "earnings" | "profile";

export default function ArchitectView() {
  const { 
    projects, 
    addProject, 
    updateProject, 
    deleteProject, 
    duplicateProject, 
    profile,
    inquiries,
    refreshInquiries
  } = useProjects();
  const { currentUser } = useAuth();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refreshInquiries();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Miller's Law: 6 Core navigation items
  const [activeTab, setActiveTab] = useState<CoreTab>("overview");

  // Doherty Threshold: Instant visual skeleton feedback during tab/filter transitions (<300ms)
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Modal & Drawer states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ArchitecturalProject | null>(null);
  const [modalMode, setModalMode] = useState<"edit" | "create">("create");
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Hick's Law: 3 minimal default filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypology, setSelectedTypology] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "published" | "draft">("all");
  const [selectedDateRange, setSelectedDateRange] = useState<"all" | "30d" | "90d" | "1y">("all");

  // Advanced filters (Progressive Disclosure)
  const [centsRange, setCentsRange] = useState<"all" | "under_10" | "10_to_15" | "above_15">("all");
  const [kmbrCompliantOnly, setKmbrCompliantOnly] = useState(false);
  const [deliverableTierFilter, setDeliverableTierFilter] = useState<"all" | "permit" | "builder" | "bim">("all");

  // Chart view states
  const [chartTimeframe, setChartTimeframe] = useState<"7D" | "30D" | "90D" | "1Y">("30D");
  const [chartMetric, setChartMetric] = useState<"revenue" | "inquiries">("revenue");

  // Handle Tab Change with Doherty Threshold skeleton
  const handleTabChange = (tab: CoreTab) => {
    if (tab === activeTab) return;
    setIsTransitioning(true);
    setActiveTab(tab);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 220);
  };

  // Filter calculation
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesLoc = p.location.toLowerCase().includes(query);
        const matchesStyle = p.style.toLowerCase().includes(query);
        if (!matchesName && !matchesLoc && !matchesStyle) return false;
      }
      if (selectedTypology !== "all" && p.style !== selectedTypology) {
        return false;
      }
      if (selectedStatus !== "all" && p.status !== selectedStatus) {
        return false;
      }
      if (centsRange === "under_10" && (p.cents || 0) >= 10) return false;
      if (centsRange === "10_to_15" && ((p.cents || 0) < 10 || (p.cents || 0) > 15)) return false;
      if (centsRange === "above_15" && (p.cents || 0) <= 15) return false;

      if (kmbrCompliantOnly) {
        const setbacks = p.dimensions?.setbacks || "";
        if (!setbacks.toLowerCase().includes("kmbr")) return false;
      }

      if (deliverableTierFilter === "permit" && !p.dwgAvailable) return false;
      if (deliverableTierFilter === "builder" && (!p.dwgAvailable || !p.boqAvailable)) return false;
      if (deliverableTierFilter === "bim" && !p.bimAvailable) return false;

      return true;
    });
  }, [projects, searchQuery, selectedTypology, selectedStatus, centsRange, kmbrCompliantOnly, deliverableTierFilter]);

  // High-signal KPIs (Miller's Law & Gestalt Common Region)
  const publishedCount = useMemo(() => projects.filter(p => p.status === "published").length, [projects]);
  const draftCount = useMemo(() => projects.filter(p => p.status === "draft").length, [projects]);
  
  const totalRevenue = useMemo(() => {
    return projects.reduce((acc, curr) => {
      const priceNum = curr.priceNumeric || parseInt(curr.price.replace(/[^\d]/g, "")) || 48000;
      // Simulated total sales per plan
      const salesCount = curr.featured ? 4 : 2;
      return acc + (priceNum * salesCount);
    }, 184000);
  }, [projects]);

  const totalViews = useMemo(() => {
    return projects.reduce((acc, curr) => acc + (curr.views || 420), 1250);
  }, [projects]);

  const activeInquiriesCount = inquiries.length;
  const pendingInquiries = useMemo(
    () => inquiries.filter((i) => i.status === "new" || i.status === "in_review"),
    [inquiries]
  );
  const draftProjects = useMemo(
    () => projects.filter((p) => p.status === "draft"),
    [projects]
  );
  const attentionCount = pendingInquiries.length + draftProjects.length;

  // Active advanced filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (centsRange !== "all") count++;
    if (kmbrCompliantOnly) count++;
    if (deliverableTierFilter !== "all") count++;
    return count;
  }, [centsRange, kmbrCompliantOnly, deliverableTierFilter]);

  // Handlers for modal
  const handleOpenCreate = () => {
    setSelectedProject(null);
    setModalMode("create");
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (project: ArchitecturalProject) => {
    setSelectedProject(project);
    setModalMode("edit");
    setIsEditModalOpen(true);
  };

  const handleSaveProject = (savedData: Partial<ArchitecturalProject>) => {
    if (modalMode === "create") {
      addProject({
        name: savedData.name || "New Architectural Project",
        style: savedData.style || "CONTEMPORARY",
        location: savedData.location || "Kerala, India",
        plotSize: savedData.plotSize || "10 Cents",
        cents: savedData.cents || 10,
        builtUpArea: savedData.builtUpArea || "2,200 Sq.Ft",
        bedrooms: savedData.bedrooms || 3,
        floors: savedData.floors || 2,
        facing: savedData.facing || "East",
        vastuScore: savedData.vastuScore || 95,
        price: savedData.price || "₹45,000",
        priceNumeric: savedData.priceNumeric || 45000,
        sheetCount: savedData.sheetCount || 38,
        status: savedData.status || "published",
        featured: false,
        image: savedData.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        gallery: savedData.gallery || [],
        description: savedData.description || "Architect-designed residential villa.",
        highlights: savedData.highlights || ["KMBR 2019 Compliant", "Monsoon Canopy"],
        dimensions: savedData.dimensions || { plotWidth: "40 ft", plotLength: "60 ft", setbacks: "Front: 3.0m, Rear: 1.5m, Sides: 1.2m (KMBR Table 4)" },
        dwgAvailable: savedData.dwgAvailable ?? true,
        bimAvailable: savedData.bimAvailable ?? true,
        boqAvailable: savedData.boqAvailable ?? true,
        mepAvailable: savedData.mepAvailable ?? true,
        cadFileUrl: savedData.cadFileUrl,
        cadFileName: savedData.cadFileName,
        cadFileSize: savedData.cadFileSize,
        architect: {
          id: currentUser?.id || "usr-arch-01",
          name: currentUser?.name || profile.name || "Ar. Nikhil Rajan",
          studio: currentUser?.studioName || profile.studio || "Studio Vayu",
          location: currentUser?.location || profile.location || "Kochi, Kerala",
          verified: true,
          image: profile.image || profile.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
        }
      });
    } else if (selectedProject) {
      updateProject(selectedProject.id, savedData);
    }
    setIsEditModalOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start min-h-[850px] font-sans">
      {/* ========================================================= */}
      {/* 1. FAMILIAR LEFT SIDEBAR NAVIGATION (Jakob's & Miller's Law) */}
      {/* ========================================================= */}
      <aside className="w-full lg:w-64 bg-white border border-warm-border rounded-3xl p-4 sm:p-5 shadow-sm shrink-0 lg:sticky lg:top-28">
        {/* Studio Identity Badge */}
        <div className="pb-4 mb-4 border-b border-warm-border/70 flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-2xl overflow-hidden border border-warm-border shrink-0 bg-stone-100">
            <Image 
              src={profile.image || profile.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
              alt="Studio Avatar"
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-serif text-sm text-charcoal font-medium truncate">
                {profile.studio || "Studio Vayu"}
              </h3>
              <VerificationBadge
                badge={currentUser?.verificationBadge || profile.verificationBadge || (currentUser?.coaNumber ? "blue" : "grey")}
                size="xs"
              />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-copper mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-copper shrink-0" />
              <span className="truncate">
                {currentUser?.coaNumber ? `COA: ${currentUser.coaNumber}` : "Vetted Freelance Studio"}
              </span>
            </div>
          </div>
        </div>

        {/* 6 Core Navigation Items (Miller's Law) */}
        <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible scrollbar-none pb-1 lg:pb-0" aria-label="Studio Navigation">
          <button
            onClick={() => handleTabChange("overview")}
            className={`shrink-0 lg:w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "overview"
                ? "bg-charcoal text-white shadow-sm"
                : "text-secondaryText hover:text-charcoal hover:bg-warm-grey/60"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className={`w-4 h-4 ${activeTab === "overview" ? "text-copper" : "text-secondaryText"}`} />
              <span>Overview</span>
            </div>
            {activeTab === "overview" && <span className="w-1.5 h-1.5 rounded-full bg-copper hidden lg:inline-block ml-2" />}
          </button>

          <button
            onClick={() => handleTabChange("designs")}
            className={`shrink-0 lg:w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "designs"
                ? "bg-charcoal text-white shadow-sm"
                : "text-secondaryText hover:text-charcoal hover:bg-warm-grey/60"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Compass className={`w-4 h-4 ${activeTab === "designs" ? "text-copper" : "text-secondaryText"}`} />
              <span>My Designs (CAD/BIM)</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ml-2 ${
              activeTab === "designs" ? "bg-white/20 text-white" : "bg-warm-grey text-secondaryText"
            }`}>
              {projects.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("inquiries")}
            className={`shrink-0 lg:w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "inquiries"
                ? "bg-charcoal text-white shadow-sm"
                : "text-secondaryText hover:text-charcoal hover:bg-warm-grey/60"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className={`w-4 h-4 ${activeTab === "inquiries" ? "text-copper" : "text-secondaryText"}`} />
              <span>Plot Inquiries</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-copper/15 text-copper font-semibold ml-2">
              {activeInquiriesCount}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("packages")}
            className={`shrink-0 lg:w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "packages"
                ? "bg-charcoal text-white shadow-sm"
                : "text-secondaryText hover:text-charcoal hover:bg-warm-grey/60"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className={`w-4 h-4 ${activeTab === "packages" ? "text-copper" : "text-secondaryText"}`} />
              <span>Packages</span>
            </div>
            <span className={`text-[10px] font-mono ml-2 ${activeTab === "packages" ? "text-warm-border" : "text-secondaryText"}`}>
              3 Tiers
            </span>
          </button>

          <button
            onClick={() => handleTabChange("earnings")}
            className={`shrink-0 lg:w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "earnings"
                ? "bg-charcoal text-white shadow-sm"
                : "text-secondaryText hover:text-charcoal hover:bg-warm-grey/60"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Wallet className={`w-4 h-4 ${activeTab === "earnings" ? "text-copper" : "text-secondaryText"}`} />
              <span>Earnings</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 font-medium ml-2">₹ Escrow</span>
          </button>

          <button
            onClick={() => handleTabChange("profile")}
            className={`shrink-0 lg:w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "profile"
                ? "bg-charcoal text-white shadow-sm"
                : "text-secondaryText hover:text-charcoal hover:bg-warm-grey/60"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserCheck className={`w-4 h-4 ${activeTab === "profile" ? "text-copper" : "text-secondaryText"}`} />
              <span>Studio Profile</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 ml-2" />
          </button>
        </nav>

        {/* Quick Statutory Compliance Widget */}
        <div className="mt-6 pt-4 border-t border-warm-border/70 p-3.5 rounded-2xl bg-warm-grey/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-charcoal">
            <ShieldCheck className="w-4 h-4 text-copper" />
            <span>KMBR 2019 Ready</span>
          </div>
          <p className="text-[11px] text-secondaryText leading-relaxed">
            Auto-checking municipal setbacks, FAR limits, and rainwater sump requirements across all listed sets.
          </p>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN CONTENT CANVAS */}
      {/* ========================================================= */}
      <div className="flex-1 w-full space-y-6">
        {/* ========================================================= */}
        {/* STICKY TOP HEADER WITH SEARCH & PRIMARY CTA (Fitts's Law & Von Restorff) */}
        {/* ========================================================= */}
        <header className="bg-white border border-warm-border rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search bar with ⌘K Hint */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-secondaryText absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search design title, typology, location (e.g. Wayanad)..."
              className="w-full pl-10 pr-12 py-2.5 bg-warm-grey/40 border border-warm-border/80 rounded-2xl text-xs text-charcoal placeholder:text-secondaryText focus:outline-none focus:border-copper transition-colors"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white border border-warm-border text-secondaryText shadow-2xs">
              ⌘K
            </kbd>
          </div>

          {/* Right Header Utilities: Notifications + Primary High-Contrast CTA */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Notification Bell Dropdown Toggle */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2.5 rounded-2xl border border-warm-border hover:bg-warm-grey/60 text-secondaryText hover:text-charcoal transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-copper ring-2 ring-white" />
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-warm-border rounded-2xl shadow-xl p-3 z-30 space-y-2 animate-in fade-in-50">
                  <div className="flex items-center justify-between pb-2 border-b border-warm-border/70 px-1">
                    <span className="text-xs font-semibold text-charcoal">Studio Alerts</span>
                    <span className="text-[10px] font-mono text-copper">2 new</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-charcoal">
                    <div className="p-2 rounded-xl bg-warm-grey/40 hover:bg-warm-grey/80 cursor-pointer">
                      <p className="font-medium">New Plot Match Inquiry</p>
                      <p className="text-[11px] text-secondaryText">Dr. Mathew Thomas matched 14 Cents in Thrissur.</p>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 cursor-pointer">
                      <p className="font-medium text-emerald-800">Escrow Payout Disbursed</p>
                      <p className="text-[11px] text-emerald-700">₹76,500 credited for The Ridge House.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Muted Secondary Action */}
            <Link
              href="/designs"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-warm-border hover:bg-warm-grey/60 text-xs font-medium text-secondaryText hover:text-charcoal transition-colors"
            >
              <span>View Public Catalog</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {/* PRIMARY CTA (Von Restorff Effect & Fitts's Law): Generous padding, high contrast copper */}
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 rounded-full bg-copper hover:bg-copper/90 text-white shadow-md hover:shadow-lg text-xs sm:text-sm font-medium flex items-center gap-2 transition-all shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Upload New Design</span>
            </button>
          </div>
        </header>

        {/* ========================================================= */}
        {/* DOHERTY THRESHOLD SKELETON FEEDBACK (<300ms perceived delay) */}
        {/* ========================================================= */}
        {isTransitioning ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-3xl bg-warm-grey/60 border border-warm-border/60" />
              ))}
            </div>
            <div className="h-64 rounded-3xl bg-warm-grey/40 border border-warm-border/60" />
            <div className="h-48 rounded-3xl bg-warm-grey/50 border border-warm-border/60" />
          </div>
        ) : (
          <>
            {/* Render Tab Contents */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* ========================================================= */}
                {/* 2. TOP KPI ROW: 4 HIGH-SIGNAL CARDS (Miller's Law & Common Region) */}
                {/* ========================================================= */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Key Performance Indicators">
                  {/* KPI 1: Active Listed Plans */}
                  <button
                    type="button"
                    onClick={() => handleTabChange("designs")}
                    className="text-left bg-white border border-warm-border hover:border-copper/60 rounded-3xl p-5 shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-secondaryText mb-2 w-full">
                      <span className="text-xs font-medium uppercase tracking-wider font-mono">Active Listed Plans</span>
                      <div className="p-2 rounded-xl bg-warm-grey/60 text-charcoal group-hover:bg-copper/10 group-hover:text-copper transition-colors">
                        <Layers className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-serif text-charcoal font-normal group-hover:text-copper transition-colors">
                        {projects.length}
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{publishedCount} Vetted Live • {draftCount} Pending</span>
                      </div>
                    </div>
                  </button>

                  {/* KPI 2: Total Revenue */}
                  <button
                    type="button"
                    onClick={() => handleTabChange("earnings")}
                    className="text-left bg-white border border-warm-border hover:border-copper/60 rounded-3xl p-5 shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-secondaryText mb-2 w-full">
                      <span className="text-xs font-medium uppercase tracking-wider font-mono">Total Design Revenue</span>
                      <div className="p-2 rounded-xl bg-copper/10 text-copper group-hover:bg-copper group-hover:text-white transition-colors">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-serif text-charcoal font-normal group-hover:text-copper transition-colors">
                        ₹{(totalRevenue / 1000).toFixed(0)}k
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>+18.4% vs last month</span>
                      </div>
                    </div>
                  </button>

                  {/* KPI 3: Customisation Inquiries */}
                  <button
                    type="button"
                    onClick={() => handleTabChange("inquiries")}
                    className="text-left bg-white border border-warm-border hover:border-copper/60 rounded-3xl p-5 shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-secondaryText mb-2 w-full">
                      <span className="text-xs font-medium uppercase tracking-wider font-mono">Plot Match Leads</span>
                      <div className="p-2 rounded-xl bg-warm-grey/60 text-charcoal group-hover:bg-copper/10 group-hover:text-copper transition-colors">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-serif text-charcoal font-normal group-hover:text-copper transition-colors">
                        {activeInquiriesCount}
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-copper font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {pendingInquiries.length > 0
                            ? `${pendingInquiries.length} require architect response`
                            : "All inquiries answered"}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* KPI 4: Plan Views & Shortlists */}
                  <div className="bg-white border border-warm-border rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between text-secondaryText mb-2">
                      <span className="text-xs font-medium uppercase tracking-wider font-mono">Plan Views & Saves</span>
                      <div className="p-2 rounded-xl bg-warm-grey/60 text-charcoal">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-serif text-charcoal font-normal">
                        {totalViews.toLocaleString()}
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>+24.2% (30d trend)</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ========================================================= */}
                {/* 3. MINIMAL DEFAULT FILTERS (Hick's Law) & ADVANCED DRAWER */}
                {/* ========================================================= */}
                <div className="bg-white border border-warm-border rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-copper" />
                      <h4 className="text-xs font-mono uppercase tracking-widest text-charcoal font-semibold">
                        Filter Design Catalog
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                      {/* Filter 1: All Typologies */}
                      <select
                        value={selectedTypology}
                        onChange={(e) => setSelectedTypology(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-warm-grey/40 border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper font-sans"
                      >
                        <option value="all">All Typologies</option>
                        <option value="TROPICAL MODERNISM">Tropical Modernism</option>
                        <option value="CONTEMPORARY VERNACULAR">Contemporary Vernacular</option>
                        <option value="EXPOSED BRICK BRUTALISM">Exposed Brick Brutalism</option>
                        <option value="MINIMALIST TROPICAL">Minimalist Tropical</option>
                      </select>

                      {/* Filter 2: Status */}
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as any)}
                        className="px-3 py-2 rounded-xl bg-warm-grey/40 border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper font-sans"
                      >
                        <option value="all">All Statuses</option>
                        <option value="published">Live / Published</option>
                        <option value="draft">In Review / Draft</option>
                      </select>

                      {/* Filter 3: Date Range */}
                      <select
                        value={selectedDateRange}
                        onChange={(e) => setSelectedDateRange(e.target.value as any)}
                        className="px-3 py-2 rounded-xl bg-warm-grey/40 border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper font-sans"
                      >
                        <option value="all">All Time</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="1y">This Year</option>
                      </select>

                      {/* Advanced Filters Trigger */}
                      <button
                        onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
                        className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                          activeFiltersCount > 0
                            ? "bg-copper text-white border-copper"
                            : "bg-white border-warm-border text-secondaryText hover:text-charcoal"
                        }`}
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Advanced</span>
                        {activeFiltersCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-white text-copper text-[10px] font-mono flex items-center justify-center font-bold">
                            {activeFiltersCount}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Progressive Disclosure: Advanced Filters Drawer */}
                  {isAdvancedFiltersOpen && (
                    <div className="pt-4 border-t border-warm-border/70 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in-50">
                      <div>
                        <label className="block text-[11px] font-mono text-secondaryText uppercase tracking-wider mb-1.5">
                          Plot Size (Cents)
                        </label>
                        <select
                          value={centsRange}
                          onChange={(e) => setCentsRange(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper"
                        >
                          <option value="all">All Plot Sizes</option>
                          <option value="under_10">Compact (&lt; 10 Cents)</option>
                          <option value="10_to_15">Standard (10 – 15 Cents)</option>
                          <option value="above_15">Estate (&gt; 15 Cents)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-secondaryText uppercase tracking-wider mb-1.5">
                          Deliverable Tier
                        </label>
                        <select
                          value={deliverableTierFilter}
                          onChange={(e) => setDeliverableTierFilter(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper"
                        >
                          <option value="all">All Deliverable Tiers</option>
                          <option value="permit">Municipal Permit Set</option>
                          <option value="builder">Executive Builder Set</option>
                          <option value="bim">3D BIM + BOQ Set</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-secondaryText uppercase tracking-wider mb-1.5">
                          Statutory Verification
                        </label>
                        <label className="flex items-center gap-2 p-2 rounded-xl bg-warm-grey/30 border border-warm-border/80 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={kmbrCompliantOnly}
                            onChange={(e) => setKmbrCompliantOnly(e.target.checked)}
                            className="accent-copper rounded"
                          />
                          <span className="text-xs text-charcoal">KMBR 2019 Table 4 Compliant Only</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* ========================================================= */}
                {/* 4. MIDDLE SECTION: 2-COLUMN SPLIT (Gestalt Proximity & Similarity) */}
                {/* Left 65%: Trend Chart | Right 35%: Needs Attention Queue */}
                {/* ========================================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left (65%): Interactive Revenue & Plan Inquiry Trend Chart */}
                  <div className="lg:col-span-8 bg-white border border-warm-border rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-warm-border/60">
                      <div>
                        <h4 className="font-serif text-lg text-charcoal font-normal">
                          Performance Trajectory
                        </h4>
                        <p className="text-xs text-secondaryText">
                          Track blueprint royalties, inquiry volumes, and buyer engagement across Southern India.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {/* Metric Toggle */}
                        <div className="flex rounded-xl bg-warm-grey/60 p-0.5 border border-warm-border">
                          <button
                            onClick={() => setChartMetric("revenue")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                              chartMetric === "revenue" ? "bg-white text-charcoal shadow-2xs font-semibold" : "text-secondaryText hover:text-charcoal"
                            }`}
                          >
                            ₹ Revenue
                          </button>
                          <button
                            onClick={() => setChartMetric("inquiries")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                              chartMetric === "inquiries" ? "bg-white text-charcoal shadow-2xs font-semibold" : "text-secondaryText hover:text-charcoal"
                            }`}
                          >
                            Inquiries
                          </button>
                        </div>

                        {/* Time-Range Toggles */}
                        <div className="flex rounded-xl bg-warm-grey/60 p-0.5 border border-warm-border">
                          {(["7D", "30D", "90D", "1Y"] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setChartTimeframe(t)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all ${
                                chartTimeframe === t ? "bg-copper text-white shadow-2xs font-bold" : "text-secondaryText hover:text-charcoal"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Chart Canvas (SVG Clean Interactive Area Visual) */}
                    <div className="pt-6 pb-2">
                      <div className="h-52 w-full relative flex items-end">
                        {/* Background guide lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-mono text-secondaryText/50">
                          <div className="border-b border-warm-border/40 w-full pb-1">₹1,00,000 / 30 Inquiries</div>
                          <div className="border-b border-warm-border/40 w-full pb-1">₹75,000 / 20 Inquiries</div>
                          <div className="border-b border-warm-border/40 w-full pb-1">₹50,000 / 10 Inquiries</div>
                          <div className="border-b border-warm-border/40 w-full pb-1">₹0</div>
                        </div>

                        {/* Interactive SVG Trend Line & Area */}
                        <svg className="w-full h-44 overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#B85D38" stopOpacity="0.35" />
                              <stop offset="100%" stopColor="#B85D38" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0,130 C70,110 120,60 180,85 C240,110 300,30 360,45 C420,60 460,20 500,10 L500,150 L0,150 Z"
                            fill="url(#chartGradient)"
                          />
                          <path
                            d="M0,130 C70,110 120,60 180,85 C240,110 300,30 360,45 C420,60 460,20 500,10"
                            fill="none"
                            stroke="#B85D38"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                          {/* Key Data Markers */}
                          <circle cx="180" cy="85" r="4.5" fill="#B85D38" className="hover:scale-150 transition-transform" />
                          <circle cx="360" cy="45" r="4.5" fill="#B85D38" className="hover:scale-150 transition-transform" />
                          <circle cx="500" cy="10" r="5" fill="#B85D38" className="ring-4 ring-copper/20" />
                        </svg>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-secondaryText pt-2">
                        <span>Nov 01</span>
                        <span>Nov 08</span>
                        <span>Nov 15</span>
                        <span>Nov 22 (Current Peak)</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-warm-border/60 flex items-center justify-between text-xs text-secondaryText">
                      <span>Gross Sales Escrow Release: <strong>Thursday Weekly</strong></span>
                      <span className="text-copper font-medium">Platform Fee: Standard 10% on release</span>
                    </div>
                  </div>

                  {/* Right (35%): Actionable "Needs Attention" Queue */}
                  <div className="lg:col-span-4 bg-white border border-warm-border rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-warm-border/60">
                      <div className="flex items-center gap-2">
                        <AlertCircle className={`w-4 h-4 ${attentionCount > 0 ? "text-rose-600" : "text-emerald-600"}`} />
                        <h4 className="font-serif text-base text-charcoal font-normal">
                          Needs Attention
                        </h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                        attentionCount > 0
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>
                        {attentionCount > 0 ? `${attentionCount} Pending` : "All Clear"}
                      </span>
                    </div>

                    {/* Dynamic Actionable Queue Items */}
                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
                      {attentionCount === 0 ? (
                        <div className="p-6 text-center rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-2">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                          <p className="text-xs font-medium text-charcoal">All Caught Up</p>
                          <p className="text-[11px] text-secondaryText">
                            No unanswered plot inquiries or unpublished draft listings.
                          </p>
                        </div>
                      ) : (
                        <>
                          {pendingInquiries.slice(0, 2).map((inq) => (
                            <div
                              key={inq.id}
                              className="p-3.5 rounded-2xl bg-warm-grey/30 border border-warm-border/80 space-y-2 hover:border-copper transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-charcoal truncate">
                                  {inq.projectName || "Consultation Inquiry"}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-100 text-amber-800 font-medium shrink-0">
                                  {inq.status === "new" ? "New Lead" : "In Review"}
                                </span>
                              </div>
                              <p className="text-[11px] text-secondaryText leading-relaxed line-clamp-2">
                                {inq.clientName}: {inq.message}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleTabChange("inquiries")}
                                className="text-[11px] font-medium text-copper hover:underline flex items-center gap-1"
                              >
                                <span>Review & Reply Inquiry</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          ))}

                          {draftProjects.slice(0, 2).map((dp) => (
                            <div
                              key={dp.id}
                              className="p-3.5 rounded-2xl bg-warm-grey/30 border border-warm-border/80 space-y-2 hover:border-copper transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-charcoal truncate">{dp.name}</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-100 text-rose-800 font-medium shrink-0">
                                  Draft
                                </span>
                              </div>
                              <p className="text-[11px] text-secondaryText leading-relaxed line-clamp-2">
                                Complete deliverables &amp; CAD sheets to publish to the S-ARC marketplace.
                              </p>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(dp)}
                                className="text-[11px] font-medium text-copper hover:underline flex items-center gap-1"
                              >
                                <span>Edit &amp; Publish Listing</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </>
                      )}
                    </div>

                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleTabChange("designs")}
                        className="text-xs text-secondaryText hover:text-charcoal font-medium"
                      >
                        View all listed designs →
                      </button>
                    </div>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* 5. BOTTOM SECTION: RECENT PLANS TABLE (Scannable Columns) */}
                {/* ========================================================= */}
                <div className="bg-white border border-warm-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-warm-border/60">
                    <div>
                      <h4 className="font-serif text-lg text-charcoal font-normal">
                        Active Architectural Designs
                      </h4>
                      <p className="text-xs text-secondaryText">
                        Displaying {filteredProjects.length} design portfolio listings ready for homeowner licensing.
                      </p>
                    </div>

                    <button
                      onClick={handleOpenCreate}
                      className="px-4 py-2 rounded-full border border-warm-border hover:border-copper text-xs font-medium text-charcoal hover:text-copper transition-colors"
                    >
                      + Add New Listing
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans">
                      <thead>
                        <tr className="border-b border-warm-border text-[11px] font-mono uppercase text-secondaryText tracking-wider">
                          <th className="pb-3 pl-2 font-medium">Design Title & Typology</th>
                          <th className="pb-3 font-medium">Plot Fit (Cents / BHK)</th>
                          <th className="pb-3 font-medium">Deliverable Tier</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Licensing Fee</th>
                          <th className="pb-3 pr-2 text-right font-medium">Manage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-warm-border/50">
                        {filteredProjects.map((p) => (
                          <tr key={p.id} className="hover:bg-warm-grey/30 transition-colors group">
                            {/* Title & Typology */}
                            <td className="py-3.5 pl-2">
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-warm-border">
                                  <Image
                                    src={p.image}
                                    alt={p.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-serif text-sm font-medium text-charcoal truncate">
                                    {p.name}
                                  </div>
                                  <div className="text-[10px] font-mono text-copper uppercase tracking-wider">
                                    {p.style}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Plot Fit */}
                            <td className="py-3.5 text-charcoal">
                              <div className="font-mono text-xs">{p.plotSize}</div>
                              <div className="text-[11px] text-secondaryText">{p.bedrooms} BHK • {p.builtUpArea}</div>
                            </td>

                            {/* Deliverable Tier */}
                            <td className="py-3.5">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warm-grey text-charcoal border border-warm-border text-[11px] font-mono">
                                <Package className="w-3 h-3 text-copper" />
                                <span>{p.bimAvailable ? "Tier 3: BIM" : p.boqAvailable ? "Tier 2: Builder" : "Tier 1: Permit"}</span>
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3.5">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                                p.status === "published"
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-amber-50 text-amber-800 border border-amber-200"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  p.status === "published" ? "bg-emerald-600" : "bg-amber-500"
                                }`} />
                                <span>{p.status === "published" ? "Live" : "In Review"}</span>
                              </span>
                            </td>

                            {/* Pricing */}
                            <td className="py-3.5 font-serif text-sm text-charcoal font-medium">
                              {p.price}
                            </td>

                            {/* Quick Actions */}
                            <td className="py-3.5 pr-2 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(p)}
                                  className="px-2.5 py-1 rounded-lg border border-warm-border hover:border-copper hover:text-copper text-charcoal text-[11px] font-medium inline-flex items-center gap-1 transition-all cursor-pointer"
                                  title="Edit Blueprint & CAD Deliverables"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => duplicateProject(p.id)}
                                  className="px-2 py-1 rounded-lg border border-warm-border hover:border-charcoal hover:text-charcoal text-secondaryText text-[11px] font-medium inline-flex items-center gap-1 transition-all cursor-pointer"
                                  title="Duplicate Blueprint"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span className="hidden sm:inline">Copy</span>
                                </button>
                                <Link
                                  href={`/designs/${p.id}`}
                                  target="_blank"
                                  className="px-2 py-1 rounded-lg border border-warm-border hover:border-charcoal hover:text-charcoal text-secondaryText text-[11px] font-medium inline-flex items-center gap-1 transition-all"
                                  title="View Public Marketplace Page"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span className="hidden sm:inline">View</span>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: My Designs (Full CAD/BIM Grid & Specs) */}
            {activeTab === "designs" && (
              <div className="space-y-6">
                <div className="bg-white border border-warm-border rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl text-charcoal font-normal">
                      CAD & BIM Design Repository
                    </h3>
                    <p className="text-xs text-secondaryText mt-1">
                      Manage drawing sheets, high-resolution 3D renders, AutoCAD DWG packages, and municipal sanction files.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenCreate}
                    className="px-5 py-2.5 rounded-full bg-copper hover:bg-copper/90 text-white text-xs font-medium flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload New Design</span>
                  </button>
                </div>

                {/* Grid of Design Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white border border-warm-border rounded-3xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div className="relative h-48 w-full bg-stone-100">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-white/90 backdrop-blur-xs text-charcoal font-semibold shadow-2xs">
                            {p.plotSize}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-semibold backdrop-blur-xs ${
                            p.status === "published" ? "bg-emerald-600/90 text-white" : "bg-amber-500/90 text-white"
                          }`}>
                            {p.status}
                          </span>
                        </div>

                        {p.cadFileUrl && (
                          <div className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-charcoal/80 text-white text-[10px] font-mono flex items-center gap-1 backdrop-blur-xs">
                            <FileCheck className="w-3 h-3 text-copper" />
                            <span>CAD Package Attached</span>
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="text-[10px] font-mono text-copper uppercase tracking-wider mb-1">
                            {p.style}
                          </div>
                          <h4 className="font-serif text-lg text-charcoal font-normal">
                            {p.name}
                          </h4>
                          <p className="text-xs text-secondaryText line-clamp-2 mt-1">
                            {p.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-warm-border/60 flex items-center justify-between text-xs">
                          <span className="font-serif text-base font-medium text-charcoal">{p.price}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="px-3 py-1.5 rounded-full border border-warm-border hover:border-copper text-xs font-medium text-charcoal hover:text-copper transition-colors"
                            >
                              Manage
                            </button>
                            <button
                              onClick={() => deleteProject(p.id)}
                              className="p-1.5 rounded-full text-secondaryText hover:text-rose-600 transition-colors"
                              title="Delete Design"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Plot Inquiries */}
            {activeTab === "inquiries" && (
              <InquiriesTab />
            )}

            {/* Tab 4: Deliverable Packages (3 Tiers) */}
            {activeTab === "packages" && (
              <PackagesTab projects={projects} />
            )}

            {/* Tab 5: Earnings & Escrow Payouts */}
            {activeTab === "earnings" && (
              <EarningsTab />
            )}

            {/* Tab 6: Studio Profile & Credentials */}
            {activeTab === "profile" && (
              <StudioProfileTab />
            )}
          </>
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. UPLOAD & EDIT MODAL (Tesler's Law Automation Inside) */}
      {/* ========================================================= */}
      <ProjectEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={selectedProject}
        onSave={handleSaveProject}
        mode={modalMode}
      />
    </div>
  );
}
