"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  FolderHeart,
  MapPin,
  Trash2,
  Calendar,
  ExternalLink,
  Loader2,
  LogIn,
  Check,
} from "lucide-react";
import { SavedPlotRecord } from "@/lib/types";

interface SavedPlotsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPlot: (plot: SavedPlotRecord) => void;
  isLoggedIn: boolean;
}

export default function SavedPlotsDrawer({
  isOpen,
  onClose,
  onLoadPlot,
  isLoggedIn,
}: SavedPlotsDrawerProps) {
  const [plots, setPlots] = useState<SavedPlotRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPlots = async () => {
    if (!isLoggedIn) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/plots");
      if (res.ok) {
        const data = await res.json();
        setPlots(data.plots || []);
      }
    } catch (err) {
      console.error("Failed to fetch saved plots:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isLoggedIn) {
      fetchPlots();
    }
  }, [isOpen, isLoggedIn]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this saved plot?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/plots/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPlots((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Error deleting plot:", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="bg-white max-w-md w-full h-full shadow-2xl flex flex-col justify-between border-l border-warm-border animate-slideLeft">
        {/* Drawer Header */}
        <div className="p-6 border-b border-warm-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-copper-subtle text-copper">
              <FolderHeart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif text-charcoal">Your Saved Plots</h3>
              <p className="text-[11px] text-charcoal/50 font-sans">
                {isLoggedIn ? `${plots.length} saved parcels` : "Sign in required"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-warm-border hover:bg-warm-grey flex items-center justify-center text-charcoal transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {!isLoggedIn ? (
            <div className="p-8 text-center space-y-4 bg-warm-card rounded-2xl border border-warm-border my-auto">
              <LogIn className="w-8 h-8 text-copper mx-auto" />
              <h4 className="text-base font-serif text-charcoal">
                Sign In to View Saved Plots
              </h4>
              <p className="text-xs text-charcoal/60 font-sans leading-relaxed">
                Save and organize your measured land parcels, sync CAD recommendations, and export reports across all devices.
              </p>
              <Link
                href="/login?redirect=/plot-intelligence"
                className="inline-block px-5 py-2.5 rounded-xl bg-copper text-white text-xs font-sans font-medium hover:bg-copper-dark transition-colors"
              >
                Sign In to S-ARC
              </Link>
            </div>
          ) : isLoading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-6 h-6 text-copper animate-spin mx-auto" />
              <p className="text-xs font-sans text-charcoal/50">
                Retrieving your measured properties...
              </p>
            </div>
          ) : plots.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-warm-grey text-charcoal/40 mx-auto flex items-center justify-center">
                <FolderHeart className="w-6 h-6" />
              </div>
              <h4 className="text-base font-serif text-charcoal">
                No Saved Plots Yet
              </h4>
              <p className="text-xs text-charcoal/60 font-sans max-w-xs mx-auto">
                Draw your property boundary on the satellite map, then click &quot;Save Plot&quot; to save it here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {plots.map((plot) => (
                <div
                  key={plot.id}
                  onClick={() => {
                    onLoadPlot(plot);
                    onClose();
                  }}
                  className="p-4 rounded-2xl border border-warm-border hover:border-copper/70 bg-white hover:bg-copper-subtle/30 transition-all cursor-pointer space-y-2 group shadow-subtle"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-serif font-bold text-charcoal group-hover:text-copper transition-colors">
                        {plot.name}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-charcoal/50 font-sans mt-0.5">
                        <MapPin className="w-3 h-3 text-copper shrink-0" />
                        <span className="truncate max-w-[200px]">
                          {plot.location_name || "Kerala, India"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(plot.id, e)}
                      disabled={deletingId === plot.id}
                      className="p-1.5 rounded-lg text-charcoal/40 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete saved plot"
                    >
                      {deletingId === plot.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-warm-border/60">
                    <span className="font-bold text-charcoal">
                      {plot.area_cents.toFixed(2)} Cents
                    </span>
                    <span className="text-charcoal/50 font-sans text-[11px]">
                      {plot.frontage_ft ? `${plot.frontage_ft.toFixed(0)} ft frontage` : ""}
                    </span>
                  </div>

                  <div className="text-[10px] text-copper font-medium flex items-center gap-1 group-hover:underline pt-0.5 font-sans">
                    <span>Load into Workspace →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-warm-border text-center text-[11px] text-charcoal/40 font-sans">
          Stored securely in your private S-ARC account.
        </div>
      </div>
    </div>
  );
}

