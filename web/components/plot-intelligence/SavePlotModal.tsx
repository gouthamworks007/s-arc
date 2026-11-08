"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Bookmark, Loader2, LogIn, CheckCircle2 } from "lucide-react";
import { PlotAnalysisData } from "@/lib/types";

interface SavePlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: PlotAnalysisData;
  locationName: string;
  isLoggedIn: boolean;
  onSavedSuccessfully: () => void;
}

export default function SavePlotModal({
  isOpen,
  onClose,
  analysis,
  locationName,
  isLoggedIn,
  onSavedSuccessfully,
}: SavePlotModalProps) {
  const [plotName, setPlotName] = useState(
    `${analysis.areaCents.toFixed(1)} Cents Property - ${locationName.split(",")[0] || "Kerala"}`
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotName.trim()) return;

    setIsSaving(true);
    setError(null);

    // Extract raw coordinates array without closed duplicate
    const rawCoords = analysis.corners.map((c) => c.coordinates);

    try {
      const res = await fetch("/api/plots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: plotName.trim(),
          coordinates: rawCoords,
          roadSideIndex: analysis.roadFacingSegmentIndex,
          locationName,
          userInputs: analysis.userInputs,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save plot.");
      }

      setSuccess(true);
      setTimeout(() => {
        onSavedSuccessfully();
        onClose();
        setSuccess(false);
      }, 1200);
    } catch (err: any) {
      setError(err?.message || "Failed to save plot.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white max-w-md w-full rounded-3xl border border-warm-border p-6 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full border border-warm-border hover:bg-warm-grey flex items-center justify-center text-charcoal transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {!isLoggedIn ? (
          <div className="text-center space-y-4 pt-2">
            <div className="w-12 h-12 rounded-full bg-copper-subtle text-copper mx-auto flex items-center justify-center">
              <LogIn className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif text-charcoal font-normal">
              Sign In to Save This Plot
            </h3>
            <p className="text-xs text-charcoal/60 font-sans leading-relaxed">
              You can freely measure and screen architectural designs without an account. Sign in to save this property boundary ({analysis.areaCents.toFixed(2)} Cents) to your profile.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login?redirect=/plot-intelligence"
                className="w-full py-3 rounded-xl bg-copper text-white text-xs font-sans font-medium hover:bg-copper-dark transition-colors block"
              >
                Sign In to S-ARC
              </Link>
              <Link
                href="/signup?redirect=/plot-intelligence"
                className="w-full py-2.5 rounded-xl border border-warm-border text-charcoal text-xs font-sans font-medium hover:bg-warm-grey transition-colors block"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        ) : success ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif text-charcoal font-normal">
              Plot Saved Successfully!
            </h3>
            <p className="text-xs text-charcoal/60 font-sans">
              Added to your saved properties.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-copper-subtle text-copper">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-serif text-charcoal font-normal">
                  Save Measured Parcel
                </h3>
                <p className="text-[11px] text-charcoal/50 font-sans">
                  {analysis.areaCents.toFixed(2)} Cents • {analysis.frontageFeet.toFixed(0)} ft frontage
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-sans">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-sans text-charcoal/70 mb-1 font-medium">
                Parcel Label / Title
              </label>
              <input
                type="text"
                required
                maxLength={80}
                value={plotName}
                onChange={(e) => setPlotName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-warm-border text-xs font-sans text-charcoal focus:outline-none focus:border-copper"
              />
            </div>

            <div>
              <label className="block text-xs font-sans text-charcoal/70 mb-1 font-medium">
                Location
              </label>
              <input
                type="text"
                value={locationName}
                readOnly
                className="w-full px-3.5 py-2.5 rounded-xl border border-warm-border bg-warm-grey/50 text-xs font-sans text-charcoal/70 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-sans font-medium text-charcoal/70 hover:bg-warm-grey transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !plotName.trim()}
                className="px-5 py-2.5 rounded-xl bg-copper text-white text-xs font-sans font-medium hover:bg-copper-dark transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Parcel</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

