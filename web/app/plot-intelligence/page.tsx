"use client";

import React, { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";
import LocationSearchBar from "@/components/plot-intelligence/LocationSearchBar";

const PlotMapWorkspace = dynamic(
  () => import("@/components/plot-intelligence/PlotMapWorkspace"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[550px] rounded-3xl bg-charcoal border border-warm-border flex flex-col items-center justify-center text-white/70 space-y-3">
        <div className="w-8 h-8 border-2 border-copper border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-sans tracking-wide">Initializing Satellite Workspace...</span>
      </div>
    ),
  }
);
import PlotAnalysisSidebar from "@/components/plot-intelligence/PlotAnalysisSidebar";
import PlanRecommendationsView from "@/components/plot-intelligence/PlanRecommendationsView";
import PlotReportModal from "@/components/plot-intelligence/PlotReportModal";
import SavedPlotsDrawer from "@/components/plot-intelligence/SavedPlotsDrawer";
import SavePlotModal from "@/components/plot-intelligence/SavePlotModal";
import ConsultArchitectModal from "@/components/plot-intelligence/ConsultArchitectModal";
import ProjectModal from "@/components/ProjectModal";

import { analyzePlotBoundary, generateSampleKeralaPlot } from "@/lib/plot-measurements";
import { matchArchitecturalPlans } from "@/lib/plan-matching";
import { useProjects } from "@/lib/projectsContext";
import { useAuth } from "@/lib/authContext";
import {
  ArchitecturalProject,
  KeralaLandUnit,
  PlotAnalysisData,
  SavedPlotRecord,
} from "@/lib/types";
import {
  Sparkles,
  MapPin,
  Ruler,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FolderHeart,
} from "lucide-react";

export default function PlotIntelligencePage() {
  const { projects } = useProjects();
  const { isLoggedIn, currentUser } = useAuth();

  // Primary Plot State
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);
  const [isClosed, setIsClosed] = useState(false);
  const [roadFacingIndex, setRoadFacingIndex] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState<KeralaLandUnit>("cent");
  const [locationName, setLocationName] = useState("Ernakulam, Kerala");
  const [focusLocation, setFocusLocation] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [userInputs, setUserInputs] = useState<PlotAnalysisData["userInputs"]>({
    roadAccessWidthFt: 14,
    preferredBedrooms: 4,
    preferredStyle: "All",
    parkingCount: 2,
  });

  // UI Flow State
  const [activeView, setActiveView] = useState<"workspace" | "recommendations">("workspace");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [selectedProjectModal, setSelectedProjectModal] = useState<ArchitecturalProject | null>(null);
  const [selectedConsultProject, setSelectedConsultProject] = useState<ArchitecturalProject | null>(null);

  // Compute live geospatial telemetry
  const analysis = useMemo(() => {
    if (coordinates.length < 3) return null;
    return analyzePlotBoundary(coordinates, roadFacingIndex, userInputs);
  }, [coordinates, roadFacingIndex, userInputs]);

  // Compute architectural compatibility rankings
  const compatibilityResults = useMemo(() => {
    if (!analysis) return [];
    const activeProjects = projects.filter((p) => p.status !== "draft");
    return matchArchitecturalPlans(analysis, activeProjects);
  }, [analysis, projects]);

  // Handle location search selection (fly directly to property without placing fake shapes)
  const handleSelectLocation = (lat: number, lng: number, displayName: string) => {
    setLocationName(displayName);
    setFocusLocation({ lat, lng, label: displayName });
  };

  // Load realistic sample plot (10.5 Cent Kerala plot) centered at live location, active focus, or Central Kerala
  const handleLoadSamplePlot = () => {
    if (focusLocation) {
      const sampleCoords = generateSampleKeralaPlot(focusLocation.lng, focusLocation.lat, 10.5);
      setCoordinates(sampleCoords);
      setIsClosed(true);
      setRoadFacingIndex(0);
      const label = locationName && !locationName.includes("Sample")
        ? `${locationName} (Sample 10.5 Cents)`
        : "Kerala Residential Plot (Sample 10.5 Cents)";
      setLocationName(label);
      setFocusLocation(null);
      return;
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const sampleCoords = generateSampleKeralaPlot(longitude, latitude, 10.5);
          setCoordinates(sampleCoords);
          setIsClosed(true);
          setRoadFacingIndex(0);
          setLocationName("Your Live Location (Sample 10.5 Cents)");
        },
        () => {
          const sampleCoords = generateSampleKeralaPlot(76.2999, 9.9816, 10.5);
          setCoordinates(sampleCoords);
          setIsClosed(true);
          setRoadFacingIndex(0);
          setLocationName("Kerala Residential Plot (Sample 10.5 Cents)");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
      return;
    }

    const sampleCoords = generateSampleKeralaPlot(76.2999, 9.9816, 10.5);
    setCoordinates(sampleCoords);
    setIsClosed(true);
    setRoadFacingIndex(0);
    setLocationName("Kerala Residential Plot (Sample 10.5 Cents)");
  };

  // Load saved plot from drawer or dashboard
  const handleLoadSavedPlot = (saved: SavedPlotRecord) => {
    try {
      const parsedGeo = typeof saved.geojson === "string" ? JSON.parse(saved.geojson) : saved.geojson;
      const ring = parsedGeo.coordinates[0];
      // Strip closed ring duplicate end point
      const cleanCoords = ring.slice(0, ring.length - 1) as [number, number][];
      setCoordinates(cleanCoords);
      setIsClosed(true);
      setRoadFacingIndex(saved.road_side_index || 0);
      if (saved.location_name) setLocationName(saved.location_name);
      if (saved.center_lat && saved.center_lng) {
        setFocusLocation({
          lat: saved.center_lat,
          lng: saved.center_lng,
          label: saved.location_name || saved.name,
        });
      }
      setActiveView("workspace");
    } catch (e) {
      console.error("Failed to parse saved plot coordinates:", e);
    }
  };

  // Check if plotId is provided in URL query string (e.g. from Dashboard)
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const plotId = urlParams.get("plotId");
    if (plotId) {
      fetch(`/api/plots/${plotId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.plot) {
            handleLoadSavedPlot(data.plot);
          }
        })
        .catch((err) => console.error("Error loading plot from url:", err));
    }
  }, []);

  const compatiblePlansCount = compatibilityResults.filter(
    (r) => r.category !== "not_suitable"
  ).length;

  return (
    <main className="min-h-screen bg-warm-card flex flex-col justify-between">
      <Navbar />

      {/* Main Container */}
      <div className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1 space-y-6">
        {/* Feature Hero Header */}
        <div className="bg-white rounded-3xl border border-warm-border p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 max-w-2xl relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-copper-subtle text-copper text-[11px] font-mono font-bold tracking-wider uppercase border border-copper/30">
                S-ARC GIS Engine
              </span>
              <span className="text-xs text-charcoal/50 font-sans">
                Kerala Land Survey Calibration
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif text-charcoal font-normal">
              Plot Intelligence
            </h1>

            <p className="text-xs sm:text-sm text-charcoal/70 font-sans leading-relaxed">
              Identify your parcel on high-resolution satellite imagery, measure boundary dimensions in Cents, and discover matching construction-ready CAD plans from verified South Indian architects.
            </p>
          </div>

          {/* Quick Actions / Tab Navigation */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 relative z-10">
            <button
              onClick={() => setIsSavedDrawerOpen(true)}
              className="px-4 py-2.5 rounded-2xl border border-warm-border bg-warm-grey hover:bg-white text-charcoal text-xs font-sans font-medium flex items-center justify-center gap-2 transition-all"
            >
              <FolderHeart className="w-4 h-4 text-copper" />
              <span>Saved Plots</span>
            </button>

            {analysis && (
              <button
                onClick={() =>
                  setActiveView(
                    activeView === "workspace" ? "recommendations" : "workspace"
                  )
                }
                className="px-5 py-2.5 rounded-2xl bg-charcoal text-white text-xs font-sans font-medium flex items-center justify-center gap-2 hover:bg-black transition-all shadow-sm"
              >
                {activeView === "workspace" ? (
                  <>
                    <Sparkles className="w-4 h-4 text-copper" />
                    <span>View Recommended Plans ({compatiblePlansCount})</span>
                  </>
                ) : (
                  <>
                    <Ruler className="w-4 h-4 text-copper" />
                    <span>Back to GIS Workspace</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* View Switcher: Interactive Map Workspace vs Architectural Recommendations */}
        {activeView === "workspace" ? (
          <div className="space-y-4">
            {/* Search Bar on Top of Workspace */}
            <LocationSearchBar
              onSelectLocation={handleSelectLocation}
              className="max-w-2xl"
            />

            {/* Split Screen Layout: Map on Left (or full on mobile) and Telemetry Sidebar on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Center Map Workspace: 8 cols on desktop */}
              <div className="lg:col-span-8 h-[550px] sm:h-[650px] w-full">
                <PlotMapWorkspace
                  coordinates={coordinates}
                  onCoordinatesChange={setCoordinates}
                  isClosed={isClosed}
                  onIsClosedChange={setIsClosed}
                  roadFacingIndex={roadFacingIndex}
                  onRoadFacingIndexChange={setRoadFacingIndex}
                  analysis={analysis}
                  focusLocation={focusLocation}
                  onLocationDetected={(name, displayName) => setLocationName(displayName || name)}
                  onLoadSamplePlot={handleLoadSamplePlot}
                  className="h-full w-full"
                />
              </div>

              {/* Right Analysis Sidebar: 4 cols on desktop */}
              <div className="lg:col-span-4 h-full">
                <PlotAnalysisSidebar
                  analysis={analysis}
                  selectedUnit={selectedUnit}
                  onSelectUnit={setSelectedUnit}
                  roadFacingIndex={roadFacingIndex}
                  onRoadFacingIndexChange={setRoadFacingIndex}
                  userInputs={userInputs}
                  onUserInputsChange={setUserInputs}
                  onMatchPlans={() => setActiveView("recommendations")}
                  onSavePlot={() => setIsSaveModalOpen(true)}
                  onExportReport={() => setIsReportModalOpen(true)}
                  onOpenSavedPlots={() => setIsSavedDrawerOpen(true)}
                  onLoadSamplePlot={handleLoadSamplePlot}
                  matchedCount={compatiblePlansCount}
                  isLoggedIn={isLoggedIn}
                />
              </div>
            </div>
          </div>
        ) : (
          analysis && (
            <PlanRecommendationsView
              analysis={analysis}
              compatibilityResults={compatibilityResults}
              onOpenProjectModal={(p) => setSelectedProjectModal(p)}
              onOpenConsultModal={(p) => setSelectedConsultProject(p)}
              onBackToMap={() => setActiveView("workspace")}
            />
          )
        )}
      </div>

      <Footer />

      {/* Modals & Drawers */}
      {isReportModalOpen && analysis && (
        <PlotReportModal
          plotName={`${analysis.areaCents.toFixed(1)} Cents Plot - ${locationName.split(",")[0]}`}
          analysis={analysis}
          locationName={locationName}
          compatibilityResults={compatibilityResults}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {isSaveModalOpen && analysis && (
        <SavePlotModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          analysis={analysis}
          locationName={locationName}
          isLoggedIn={isLoggedIn}
          onSavedSuccessfully={() => setIsSavedDrawerOpen(true)}
        />
      )}

      <SavedPlotsDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        onLoadPlot={handleLoadSavedPlot}
        isLoggedIn={isLoggedIn}
      />

      <ConsultArchitectModal
        project={selectedConsultProject}
        analysis={analysis}
        locationName={locationName}
        onClose={() => setSelectedConsultProject(null)}
      />

      <ProjectModal
        project={selectedProjectModal}
        onClose={() => setSelectedProjectModal(null)}
      />
    </main>
  );
}

