"use client";

import React, { useState } from "react";
import {
  Compass,
  Crosshair,
  MapPin,
  Ruler,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  BookOpen,
  Layers,
  Locate,
  Minimize2,
  Maximize2,
  HelpCircle,
} from "lucide-react";

interface PlotGuideOverlayProps {
  cents: number;
  locationName: string;
  shape?: string;
  onLocateMe?: () => void;
  onViewRecommendations?: () => void;
  onClose?: () => void;
}

const GUIDE_STEPS = [
  {
    step: 1,
    title: "Calibrated Parcel Projected",
    badge: "Satellite Alignment",
    icon: Compass,
    content: (cents: number, location: string, shape?: string) => (
      <div className="space-y-2 text-xs text-charcoal/80 font-sans leading-relaxed">
        <p>
          We’ve placed your calibrated <strong className="text-charcoal">{cents} Cent ({(cents * 435.6).toLocaleString("en-IN")} sq ft)</strong> {shape ? `${shape.toLowerCase()} ` : ""}parcel directly onto live satellite imagery at <strong className="text-charcoal">{location}</strong>.
        </p>
        <p className="text-mutedText">
          The plot is rendered top-down with strict North-up survey calibration. You can zoom and pan freely across satellite tiles.
        </p>
      </div>
    ),
  },
  {
    step: 2,
    title: "Align With Physical Boundaries",
    badge: "Interactive Adjustment",
    icon: Crosshair,
    content: () => (
      <div className="space-y-2 text-xs text-charcoal/80 font-sans leading-relaxed">
        <p>
          <strong>Drag any corner marker (Corner 1, 2, 3...)</strong> directly on the satellite imagery to align the perimeter with your actual compound wall, boundary fence, or survey demarcation stones.
        </p>
        <div className="p-2 rounded-xl bg-copper/10 border border-copper/20 text-[11px] text-copper font-medium flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>Live distance (ft) and parcel area (Cents) recalculate automatically in real time!</span>
        </div>
      </div>
    ),
  },
  {
    step: 3,
    title: "Mark Road Access & Setbacks",
    badge: "KMBR Statutory Compliance",
    icon: Ruler,
    content: () => (
      <div className="space-y-2 text-xs text-charcoal/80 font-sans leading-relaxed">
        <p>
          Click on any boundary side to define your <strong>primary access road</strong>.
        </p>
        <p className="text-mutedText">
          The S-ARC GIS engine automatically calculates statutory Kerala Municipality Building Rules (KMBR 2019) setbacks: <strong className="text-charcoal">10 ft Front Setback</strong> and <strong className="text-charcoal">4 ft Side/Rear Setbacks</strong> to generate your exact buildable footprint envelope.
        </p>
      </div>
    ),
  },
  {
    step: 4,
    title: "Explore Architectural Plans",
    badge: "Instant Blueprint Matching",
    icon: Layers,
    content: () => (
      <div className="space-y-2 text-xs text-charcoal/80 font-sans leading-relaxed">
        <p>
          Once your boundary is aligned, click <strong className="text-copper">View Recommended Plans</strong> in the header or sidebar to browse verified architectural blueprints curated specifically for this parcel shape and road orientation.
        </p>
        <p className="text-mutedText">
          Plans are ranked by compatibility with your statutory buildable envelope and room requirements.
        </p>
      </div>
    ),
  },
];

export default function PlotGuideOverlay({
  cents,
  locationName,
  shape,
  onLocateMe,
  onViewRecommendations,
  onClose,
}: PlotGuideOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-6 left-6 z-40 px-3.5 py-2 rounded-2xl bg-charcoal text-white hover:bg-copper shadow-2xl border border-warm-border/40 text-xs font-sans font-medium flex items-center gap-2 transition-all group"
      >
        <BookOpen className="w-4 h-4 text-copper-light group-hover:rotate-12 transition-transform" />
        <span>Open Plot Guide ({cents}c)</span>
      </button>
    );
  }

  const active = GUIDE_STEPS[currentStep];
  const StepIcon = active.icon;

  return (
    <aside aria-label="Interactive Plot Guide" className="fixed top-24 sm:top-28 right-4 sm:right-6 z-40 w-[92vw] max-w-sm sm:max-w-md pointer-events-auto">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-warm-border shadow-2xl overflow-hidden transition-all duration-300">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-warm-border/80 flex items-center justify-between bg-warm-card/60">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-copper/15 border border-copper/30 flex items-center justify-center text-copper">
              <StepIcon className="w-3.5 h-3.5" />
            </span>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-copper font-bold flex items-center gap-1.5">
                <span>Plot Guide</span>
                <span>•</span>
                <span>Step {currentStep + 1} of {GUIDE_STEPS.length}</span>
              </div>
              <h3 className="text-xs font-serif font-medium text-charcoal leading-tight">
                {active.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-lg text-charcoal/60 hover:text-charcoal hover:bg-warm-grey transition-colors"
              title={isMinimized ? "Expand Guide" : "Minimize Guide"}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                setIsVisible(false);
                onClose?.();
              }}
              className="p-1.5 rounded-lg text-charcoal/60 hover:text-charcoal hover:bg-warm-grey transition-colors"
              title="Close Guide"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Minimized Bar */}
        {isMinimized ? (
          <div className="px-5 py-2.5 flex items-center justify-between text-xs font-sans text-mutedText bg-white">
            <span className="truncate">
              Step {currentStep + 1}: {active.title}
            </span>
            <button
              onClick={() => setIsMinimized(false)}
              className="text-copper hover:underline text-[11px] font-medium shrink-0 ml-2"
            >
              Expand
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Step Content */}
            <div className="min-h-[72px]">
              {active.content(cents, locationName, shape)}
            </div>

            {/* Quick Actions (Step Specific) */}
            {currentStep === 0 && onLocateMe && (
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onLocateMe}
                  className="w-full py-2 px-3 rounded-xl bg-warm-card border border-warm-border hover:border-copper/60 text-charcoal text-xs font-sans font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Locate className="w-3.5 h-3.5 text-copper" />
                  <span>Center at My Live GPS Position</span>
                </button>
              </div>
            )}

            {currentStep === 3 && onViewRecommendations && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onViewRecommendations}
                  className="w-full py-2.5 px-4 rounded-xl bg-charcoal hover:bg-copper text-white text-xs font-sans font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-copper-light" />
                  <span>View Recommended Architectural Plans</span>
                </button>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="pt-3 border-t border-warm-border/70 flex items-center justify-between">
              {/* Stepper Dots */}
              <div className="flex items-center gap-1.5">
                {GUIDE_STEPS.map((s, idx) => (
                  <button
                    key={s.step}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentStep
                        ? "w-6 bg-copper"
                        : "w-1.5 bg-warm-border hover:bg-charcoal/40"
                    }`}
                    aria-label={`Go to step ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    className="p-1.5 rounded-lg border border-warm-border hover:bg-warm-grey text-charcoal text-xs font-sans flex items-center transition-colors"
                    title="Previous Step"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                {currentStep < GUIDE_STEPS.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                    className="px-3 py-1.5 rounded-xl bg-charcoal hover:bg-copper text-white text-xs font-sans font-medium flex items-center gap-1 transition-colors shadow-xs"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsVisible(false);
                      onClose?.();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-copper text-white hover:bg-copper-hover text-xs font-sans font-medium flex items-center gap-1 transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
