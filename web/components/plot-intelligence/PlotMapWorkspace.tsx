"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Map as MapLibreMap,
  Marker,
  LngLatBounds,
  AttributionControl,
  GeoJSONSource,
  MapMouseEvent,
} from "maplibre-gl";
import {
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Trash2,
  Check,
  Compass,
  AlertTriangle,
  Locate,
  ZoomIn,
  ZoomOut,
  Pencil,
  Move,
  Eye,
  Info,
} from "lucide-react";
import {
  buildMapStyle,
  KERALA_DEFAULT_CENTER,
  KERALA_DEFAULT_ZOOM,
  MapMode,
} from "@/lib/map-config";
import {
  analyzePlotBoundary,
  validatePolygonCoordinates,
} from "@/lib/plot-measurements";
import { PlotAnalysisData } from "@/lib/types";

interface PlotMapWorkspaceProps {
  coordinates: [number, number][];
  onCoordinatesChange: (coords: [number, number][]) => void;
  roadFacingIndex: number;
  onRoadFacingIndexChange: (idx: number) => void;
  analysis: PlotAnalysisData | null;
  className?: string;
}

export default function PlotMapWorkspace({
  coordinates,
  onCoordinatesChange,
  roadFacingIndex,
  onRoadFacingIndexChange,
  analysis,
  className = "",
}: PlotMapWorkspaceProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  const [mapMode, setMapMode] = useState<MapMode>("satellite");
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [cursorPos, setCursorPos] = useState<[number, number] | null>(null);
  const [history, setHistory] = useState<[number, number][][]>([[]]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // References for live markers
  const cornerMarkersRef = useRef<Marker[]>([]);
  const segmentMarkersRef = useRef<Marker[]>([]);
  const midpointMarkersRef = useRef<Marker[]>([]);

  // Push to undo/redo history
  const pushHistory = useCallback(
    (newCoords: [number, number][]) => {
      setHistory((prev) => {
        const next = prev.slice(0, historyIdx + 1);
        next.push(newCoords);
        return next;
      });
      setHistoryIdx((prev) => prev + 1);
      onCoordinatesChange(newCoords);
    },
    [historyIdx, onCoordinatesChange]
  );

  const handleUndo = () => {
    if (historyIdx > 0) {
      const prevIdx = historyIdx - 1;
      setHistoryIdx(prevIdx);
      onCoordinatesChange(history[prevIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const nextIdx = historyIdx + 1;
      setHistoryIdx(nextIdx);
      onCoordinatesChange(history[nextIdx]);
    }
  };

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialStyle = buildMapStyle(mapMode);

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: initialStyle,
      center: KERALA_DEFAULT_CENTER,
      zoom: KERALA_DEFAULT_ZOOM,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
    });

    map.addControl(
      new AttributionControl({ compact: true }),
      "bottom-right"
    );

    map.on("load", () => {
      // Add Sources and Layers for Plot Polygon and Edges
      if (!map.getSource("plot-polygon-source")) {
        map.addSource("plot-polygon-source", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        // Polygon Fill
        map.addLayer({
          id: "plot-polygon-fill",
          type: "fill",
          source: "plot-polygon-source",
          paint: {
            "fill-color": "#ad8065",
            "fill-opacity": 0.28,
          },
        });

        // Outer Boundary Stroke
        map.addLayer({
          id: "plot-boundary-stroke",
          type: "line",
          source: "plot-polygon-source",
          paint: {
            "line-color": "#ffffff",
            "line-width": 2.5,
            "line-opacity": 0.95,
          },
        });

        // Road Frontage Highlight Stroke
        map.addLayer({
          id: "plot-road-frontage-stroke",
          type: "line",
          source: "plot-polygon-source",
          filter: ["==", "isRoad", true],
          paint: {
            "line-color": "#f59e0b",
            "line-width": 5,
            "line-dasharray": [2, 1],
          },
        });
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle Map Mode switch
  const switchMapMode = (newMode: MapMode) => {
    setMapMode(newMode);
    if (mapRef.current) {
      mapRef.current.setStyle(buildMapStyle(newMode));
      mapRef.current.once("style.load", () => {
        // Re-inject sources and layers after style reload
        const map = mapRef.current;
        if (!map) return;
        if (!map.getSource("plot-polygon-source")) {
          map.addSource("plot-polygon-source", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [],
            },
          });
          map.addLayer({
            id: "plot-polygon-fill",
            type: "fill",
            source: "plot-polygon-source",
            paint: { "fill-color": "#ad8065", "fill-opacity": 0.28 },
          });
          map.addLayer({
            id: "plot-boundary-stroke",
            type: "line",
            source: "plot-polygon-source",
            paint: { "line-color": "#ffffff", "line-width": 2.5, "line-opacity": 0.95 },
          });
          map.addLayer({
            id: "plot-road-frontage-stroke",
            type: "line",
            source: "plot-polygon-source",
            filter: ["==", "isRoad", true],
            paint: { "line-color": "#f59e0b", "line-width": 5, "line-dasharray": [2, 1] },
          });
        }
        updateMapLayers(coordinates);
      });
    }
  };

  // Update GeoJSON Layers & Markers whenever coordinates or roadFacingIndex change
  const updateMapLayers = useCallback(
    (coords: [number, number][]) => {
      const map = mapRef.current;
      if (!map) return;

      const source = map.getSource("plot-polygon-source") as GeoJSONSource;
      if (!source) return;

      const features: any[] = [];

      if (coords.length >= 3) {
        const closed = [...coords, coords[0]];
        // Polygon Feature
        features.push({
          type: "Feature",
          properties: { type: "plot-fill" },
          geometry: {
            type: "Polygon",
            coordinates: [closed],
          },
        });

        // Segments with road frontage attribute
        for (let i = 0; i < coords.length; i++) {
          const nextIdx = (i + 1) % coords.length;
          features.push({
            type: "Feature",
            properties: {
              type: "segment",
              index: i,
              isRoad: i === roadFacingIndex,
            },
            geometry: {
              type: "LineString",
              coordinates: [coords[i], coords[nextIdx]],
            },
          });
        }
      } else if (coords.length === 2) {
        features.push({
          type: "Feature",
          properties: { type: "line" },
          geometry: {
            type: "LineString",
            coordinates: coords,
          },
        });
      }

      source.setData({
        type: "FeatureCollection",
        features,
      });

      // Clear existing DOM markers
      cornerMarkersRef.current.forEach((m) => m.remove());
      cornerMarkersRef.current = [];
      segmentMarkersRef.current.forEach((m) => m.remove());
      segmentMarkersRef.current = [];
      midpointMarkersRef.current.forEach((m) => m.remove());
      midpointMarkersRef.current = [];

      // Add Corner Markers
      coords.forEach((coord, i) => {
        const el = document.createElement("div");
        el.className =
          "w-7 h-7 rounded-full bg-charcoal text-white font-mono text-[11px] font-bold flex items-center justify-center border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 hover:bg-copper";
        el.innerHTML = `P${i + 1}`;

        if (isDrawing && i === 0 && coords.length >= 3) {
          el.title = "Click to close boundary polygon";
          el.classList.add("ring-4", "ring-copper", "animate-pulse");
        }

        const marker = new Marker({
          element: el,
          draggable: isEditMode,
        })
          .setLngLat(coord)
          .addTo(map);

        // Handle Dragging in Edit Mode
        marker.on("dragend", () => {
          const newPos = marker.getLngLat();
          const nextCoords = [...coords];
          nextCoords[i] = [newPos.lng, newPos.lat];
          pushHistory(nextCoords);
        });

        // Click to close polygon if clicking initial point while drawing
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          if (isDrawing && i === 0 && coords.length >= 3) {
            setIsDrawing(false);
          }
        });

        cornerMarkersRef.current.push(marker);
      });

      // Add Segment Labels if Analysis exists
      if (analysis && analysis.segments.length > 0 && coords.length >= 3) {
        analysis.segments.forEach((seg, i) => {
          const midLng = (seg.startPoint[0] + seg.endPoint[0]) / 2;
          const midLat = (seg.startPoint[1] + seg.endPoint[1]) / 2;

          const isRoad = i === roadFacingIndex;

          const segEl = document.createElement("div");
          segEl.className = `px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold tracking-wide border shadow-md whitespace-nowrap cursor-pointer transition-all transform -translate-x-1/2 -translate-y-1/2 ${
            isRoad
              ? "bg-amber-500 text-charcoal-dark border-amber-300 font-bold scale-105"
              : "bg-white/95 text-charcoal border-warm-border hover:border-copper hover:text-copper"
          }`;
          segEl.innerHTML = `${seg.label}: ${seg.lengthFeet.toFixed(1)} ft ${
            isRoad ? "★ ROAD" : ""
          }`;
          segEl.title = isRoad
            ? "Primary Road Frontage"
            : "Click to designate this side as Road-Facing Frontage";

          segEl.addEventListener("click", (e) => {
            e.stopPropagation();
            onRoadFacingIndexChange(i);
          });

          const segMarker = new Marker({
            element: segEl,
          })
            .setLngLat([midLng, midLat])
            .addTo(map);

          segmentMarkersRef.current.push(segMarker);

          // In Edit mode, show midpoint handle to insert vertices
          if (isEditMode) {
            const midHandle = document.createElement("div");
            midHandle.className =
              "w-3.5 h-3.5 rounded-full bg-white border-2 border-copper shadow-md cursor-pointer hover:scale-150 transition-transform -translate-x-1/2 -translate-y-1/2";
            midHandle.title = "Click to insert a new corner point here";

            midHandle.addEventListener("click", (e) => {
              e.stopPropagation();
              const newCoords = [...coords];
              newCoords.splice(i + 1, 0, [midLng, midLat]);
              pushHistory(newCoords);
            });

            const midMarker = new Marker({ element: midHandle })
              .setLngLat([midLng, midLat])
              .addTo(map);

            midpointMarkersRef.current.push(midMarker);
          }
        });
      }
    },
    [
      analysis,
      isDrawing,
      isEditMode,
      onRoadFacingIndexChange,
      pushHistory,
      roadFacingIndex,
    ]
  );

  useEffect(() => {
    updateMapLayers(coordinates);
  }, [coordinates, roadFacingIndex, analysis, isEditMode, isDrawing, updateMapLayers]);

  // Click on Map Handler (Drawing mode)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (e: MapMouseEvent) => {
      if (!isDrawing) return;

      const newPoint: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      const newCoords = [...coordinates, newPoint];
      pushHistory(newCoords);
    };

    const handleMouseMove = (e: MapMouseEvent) => {
      if (isDrawing && coordinates.length > 0) {
        setCursorPos([e.lngLat.lng, e.lngLat.lat]);
      }
    };

    map.on("click", handleMapClick);
    map.on("mousemove", handleMouseMove);

    return () => {
      map.off("click", handleMapClick);
      map.off("mousemove", handleMouseMove);
    };
  }, [isDrawing, coordinates, pushHistory]);

  // Zoom to Fit Plot
  const fitPlotBounds = () => {
    if (!mapRef.current || coordinates.length < 2) return;
    const bounds = new LngLatBounds(coordinates[0], coordinates[0]);
    coordinates.forEach((coord) => bounds.extend(coord));
    mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 19 });
  };

  // Geolocation trigger with explicit permission
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLocating(false);
        const { longitude, latitude } = pos.coords;
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 18,
            essential: true,
          });
        }
      },
      (err) => {
        setGeoLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Location permission denied. You can search your town or address above.");
        } else {
          setGeoError("Unable to retrieve current location. Please use search.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Clear Boundary
  const handleClearBoundary = () => {
    pushHistory([]);
    setIsDrawing(false);
    setIsEditMode(false);
    setShowClearConfirm(false);
  };

  const validation = validatePolygonCoordinates(coordinates);

  return (
    <div
      className={`relative w-full h-full min-h-[500px] overflow-hidden rounded-3xl border border-warm-border shadow-card bg-charcoal ${className}`}
    >
      {/* MapLibre WebGL Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Left Floating Toolbar: Map Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {/* Layer Mode Switcher */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-1 border border-warm-border shadow-floating flex items-center gap-1">
          <button
            onClick={() => switchMapMode("satellite")}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-all ${
              mapMode === "satellite"
                ? "bg-charcoal text-white shadow-sm"
                : "text-charcoal/70 hover:text-charcoal hover:bg-warm-grey"
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => switchMapMode("standard")}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-all ${
              mapMode === "standard"
                ? "bg-charcoal text-white shadow-sm"
                : "text-charcoal/70 hover:text-charcoal hover:bg-warm-grey"
            }`}
          >
            Street Map
          </button>
        </div>

        {/* Draw / Edit Action Buttons */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-1.5 border border-warm-border shadow-floating flex items-center gap-1.5">
          <button
            onClick={() => {
              setIsDrawing((prev) => !prev);
              if (!isDrawing) setIsEditMode(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-all ${
              isDrawing
                ? "bg-copper text-white shadow-sm"
                : "text-charcoal/80 hover:bg-warm-grey hover:text-charcoal"
            }`}
            title="Click on the map to place corner markers"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>{isDrawing ? "Finish Drawing" : "Draw Plot"}</span>
          </button>

          {coordinates.length >= 3 && (
            <button
              onClick={() => {
                setIsEditMode((prev) => !prev);
                if (!isEditMode) setIsDrawing(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-all ${
                isEditMode
                  ? "bg-charcoal text-white shadow-sm"
                  : "text-charcoal/80 hover:bg-warm-grey hover:text-charcoal"
              }`}
              title="Drag corner handles to fine-tune shape"
            >
              <Move className="w-3.5 h-3.5" />
              <span>{isEditMode ? "Done Editing" : "Edit Handles"}</span>
            </button>
          )}

          {/* Undo / Redo */}
          <div className="flex items-center border-l border-warm-border pl-1 ml-0.5">
            <button
              onClick={handleUndo}
              disabled={historyIdx <= 0}
              className="p-1.5 rounded-lg text-charcoal/60 hover:text-charcoal hover:bg-warm-grey disabled:opacity-30 disabled:hover:bg-transparent"
              title="Undo last point"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIdx >= history.length - 1}
              className="p-1.5 rounded-lg text-charcoal/60 hover:text-charcoal hover:bg-warm-grey disabled:opacity-30 disabled:hover:bg-transparent"
              title="Redo action"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Clear Plot */}
          {coordinates.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="p-1.5 rounded-lg text-red-500/80 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Clear plot boundary"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Top Right Floating Toolbar: Zoom & View Navigation */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-1 border border-warm-border shadow-floating flex flex-col items-center">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="p-2 rounded-xl text-charcoal/70 hover:text-charcoal hover:bg-warm-grey transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-4 h-px bg-warm-border" />
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="p-2 rounded-xl text-charcoal/70 hover:text-charcoal hover:bg-warm-grey transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-1 border border-warm-border shadow-floating flex flex-col items-center gap-1">
          <button
            onClick={handleCurrentLocation}
            disabled={geoLocating}
            className={`p-2 rounded-xl transition-colors ${
              geoLocating
                ? "text-copper animate-spin"
                : "text-charcoal/70 hover:text-charcoal hover:bg-warm-grey"
            }`}
            title="Fly to Current Location"
          >
            <Locate className="w-4 h-4" />
          </button>

          {coordinates.length >= 2 && (
            <button
              onClick={fitPlotBounds}
              className="p-2 rounded-xl text-charcoal/70 hover:text-charcoal hover:bg-warm-grey transition-colors"
              title="Fit Plot in View"
            >
              <Compass className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-charcoal/70 hover:text-charcoal hover:bg-warm-grey transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Bottom Center Prompt or Drawing Hint */}
      {isDrawing && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 bg-charcoal/90 text-white backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-xs font-sans shadow-floating flex items-center gap-2 animate-bounce">
          <Pencil className="w-3.5 h-3.5 text-copper" />
          <span>
            {coordinates.length === 0
              ? "Click on the satellite map to place the 1st corner of your property."
              : coordinates.length < 3
              ? `Place corner #${coordinates.length + 1} along the boundary.`
              : "Click P1 to close boundary, or click next corner."}
          </span>
          {coordinates.length >= 3 && (
            <button
              onClick={() => setIsDrawing(false)}
              className="ml-2 px-2.5 py-0.5 rounded-full bg-copper text-white text-[11px] font-semibold hover:bg-copper-dark transition-colors"
            >
              Done
            </button>
          )}
        </div>
      )}

      {/* Geometry Validation Warning */}
      {!validation.valid && coordinates.length >= 3 && (
        <div className="absolute bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:max-w-md z-20 bg-red-50/95 border border-red-200 text-red-800 backdrop-blur-md p-3.5 rounded-2xl shadow-floating flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs font-sans">
            <span className="font-semibold">Invalid Boundary: </span>
            {validation.error}
          </div>
        </div>
      )}

      {/* Geolocation Error Toast */}
      {geoError && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2 rounded-2xl shadow-floating text-xs font-sans flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{geoError}</span>
          <button
            onClick={() => setGeoError(null)}
            className="ml-2 font-bold hover:text-amber-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-warm-border shadow-2xl space-y-4">
            <h3 className="text-lg font-serif text-charcoal font-normal">
              Clear Property Boundary?
            </h3>
            <p className="text-xs text-charcoal/70 font-sans leading-relaxed">
              This will remove all {coordinates.length} marked corner points and
              reset the current measurement.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-sans font-medium text-charcoal/70 hover:bg-warm-grey transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearBoundary}
                className="px-4 py-2 rounded-xl text-xs font-sans font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Clear Boundary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

