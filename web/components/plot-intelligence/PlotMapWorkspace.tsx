"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as turf from "@turf/turf";
import {
  Map as MapLibreMap,
  Marker,
  AttributionControl,
  GeoJSONSource,
  MapMouseEvent,
  config as maplibreConfig,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  ZoomIn,
  ZoomOut,
  Locate,
  Crosshair,
  Undo2,
  Trash2,
  Check,
  Pencil,
  Sparkles,
  MapPin,
} from "lucide-react";
import {
  buildMapStyle,
  KERALA_DEFAULT_CENTER,
  KERALA_DEFAULT_ZOOM,
  MapMode,
} from "@/lib/map-config";
import {
  validatePolygonCoordinates,
  generateSampleKeralaPlot,
} from "@/lib/plot-measurements";
import { PlotAnalysisData } from "@/lib/types";

// Configure MapLibre Web Worker to use the local bundle in /public
if (typeof window !== "undefined") {
  try {
    maplibreConfig.WORKER_URL = "/maplibre-gl-worker.mjs";
  } catch {
    // Fallback handled by browser
  }
}

interface PlotMapWorkspaceProps {
  coordinates: [number, number][];
  onCoordinatesChange: (coords: [number, number][]) => void;
  isClosed?: boolean;
  onIsClosedChange?: (closed: boolean) => void;
  roadFacingIndex: number;
  onRoadFacingIndexChange: (idx: number) => void;
  analysis: PlotAnalysisData | null;
  focusLocation?: { lat: number; lng: number; label?: string } | null;
  onLocationDetected?: (name: string, displayName: string, lat: number, lng: number) => void;
  onLoadSamplePlot?: () => void;
  className?: string;
}

export default function PlotMapWorkspace({
  coordinates,
  onCoordinatesChange,
  isClosed: isClosedProp,
  onIsClosedChange,
  roadFacingIndex,
  onRoadFacingIndexChange,
  analysis,
  focusLocation,
  onLocationDetected,
  onLoadSamplePlot,
  className = "",
}: PlotMapWorkspaceProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  // Map Modes (Satellite vs Standard 2D Top-Down View)
  const [mapMode, setMapMode] = useState<MapMode>("satellite");

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(true);
  const [isClosed, setIsClosed] = useState(isClosedProp ?? false);
  const [isNearStartPoint, setIsNearStartPoint] = useState(false);
  const [liveDistanceFt, setLiveDistanceFt] = useState<number | null>(null);

  // Sync external isClosed state
  useEffect(() => {
    if (isClosedProp !== undefined) {
      setIsClosed(isClosedProp);
    }
  }, [isClosedProp]);

  // Undo History
  const [history, setHistory] = useState<[number, number][][]>([coordinates]);
  const [historyIdx, setHistoryIdx] = useState(0);

  // Geolocation & Feedback
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  // Markers
  const cornerMarkersRef = useRef<Marker[]>([]);
  const segmentMarkersRef = useRef<Marker[]>([]);
  const centerMarkerRef = useRef<Marker | null>(null);
  const locationPinMarkerRef = useRef<Marker | null>(null);

  // Reset history and drawing state if coordinates are cleared from outside
  useEffect(() => {
    if (coordinates.length === 0) {
      setHistory([[]]);
      setHistoryIdx(0);
      setIsClosed(false);
      onIsClosedChange?.(false);
    }
  }, [coordinates.length, onIsClosedChange]);

  // Push to history
  const pushHistory = useCallback(
    (newCoords: [number, number][]) => {
      setHistory((prev) => {
        const next = prev.slice(0, historyIdx + 1);
        return [...next, newCoords];
      });
      setHistoryIdx((prev) => prev + 1);
      onCoordinatesChange(newCoords);
    },
    [historyIdx, onCoordinatesChange]
  );

  const handleUndo = () => {
    if (historyIdx > 0) {
      const nextIdx = historyIdx - 1;
      setHistoryIdx(nextIdx);
      const prevCoords = history[nextIdx] || [];
      onCoordinatesChange(prevCoords);
      if (prevCoords.length < 3) {
        setIsClosed(false);
        onIsClosedChange?.(false);
      }
    }
  };

  const handleClear = () => {
    pushHistory([]);
    setIsClosed(false);
    onIsClosedChange?.(false);
    setIsDrawing(true);
    clearRubberband();
    if (locationPinMarkerRef.current) {
      locationPinMarkerRef.current.remove();
      locationPinMarkerRef.current = null;
    }
  };

  // Complete / Close boundary polygon
  const handleCompleteBoundary = () => {
    if (coordinates.length >= 3) {
      setIsClosed(true);
      onIsClosedChange?.(true);
      setIsDrawing(false);
      clearRubberband();
      fitPlotBounds();
    }
  };

  // Generate authentic Kerala residential sample plot at current viewport or East Desam
  const handleSamplePlotClick = useCallback(() => {
    let centerLng = 76.3493; // East Desam, Aluva default
    let centerLat = 10.1287;

    const map = mapRef.current;
    if (map) {
      const c = map.getCenter();
      if (c.lng >= 74 && c.lng <= 79 && c.lat >= 8 && c.lat <= 14) {
        centerLng = c.lng;
        centerLat = c.lat;
      }
    } else if (focusLocation) {
      centerLng = focusLocation.lng;
      centerLat = focusLocation.lat;
    }

    const sampleCoords = generateSampleKeralaPlot(centerLng, centerLat, 10.5);

    pushHistory(sampleCoords);
    setIsClosed(true);
    onIsClosedChange?.(true);
    setIsDrawing(false);
    clearRubberband();
    onRoadFacingIndexChange(0);

    if (locationPinMarkerRef.current) {
      locationPinMarkerRef.current.remove();
      locationPinMarkerRef.current = null;
    }

    if (map) {
      const line = turf.lineString(sampleCoords);
      const [minX, minY, maxX, maxY] = turf.bbox(line);
      map.fitBounds(
        [
          [minX, minY],
          [maxX, maxY],
        ],
        {
          padding: { top: 90, bottom: 100, left: 90, right: 90 },
          maxZoom: 19.5,
          duration: 900,
          pitch: 0,
          bearing: 0,
        }
      );
    }

    if (onLocationDetected) {
      onLocationDetected(
        "East Desam, Aluva",
        "East Desam, Aluva (Sample 10.5 Cents)",
        centerLat,
        centerLng
      );
    }

    if (onLoadSamplePlot) {
      onLoadSamplePlot();
    }
  }, [focusLocation, pushHistory, onIsClosedChange, onRoadFacingIndexChange, onLocationDetected, onLoadSamplePlot]);

  // Clear rubberband lines
  const clearRubberband = () => {
    const map = mapRef.current;
    if (!map) return;
    const lineSrc = map.getSource("rubberband-source") as GeoJSONSource;
    if (lineSrc) lineSrc.setData({ type: "FeatureCollection", features: [] });
    const polySrc = map.getSource("rubberband-poly-source") as GeoJSONSource;
    if (polySrc) polySrc.setData({ type: "FeatureCollection", features: [] });
    setLiveDistanceFt(null);
  };

  // 1. Initialize MapLibre (Pure 2D Top-Down Survey View)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialStyle = buildMapStyle(mapMode);

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: initialStyle,
      center: KERALA_DEFAULT_CENTER,
      zoom: KERALA_DEFAULT_ZOOM,
      pitch: 0,
      maxPitch: 0, // Strict top-down 0°
      bearing: 0,
      dragRotate: false, // Disables rotation
      pitchWithRotate: false,
      touchPitch: false,
      attributionControl: false,
    });

    map.touchZoomRotate.disableRotation();

    map.addControl(
      new AttributionControl({ compact: true }),
      "bottom-right"
    );

    map.on("load", () => {
      // Polygon Source & Layers
      if (!map.getSource("plot-polygon-source")) {
        map.addSource("plot-polygon-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        // Blueprint Fill
        map.addLayer({
          id: "plot-polygon-fill",
          type: "fill",
          source: "plot-polygon-source",
          filter: ["==", "type", "plot-fill"],
          paint: {
            "fill-color": "#0284c7",
            "fill-opacity": 0.28,
          },
        });

        // Outer Glow Stroke
        map.addLayer({
          id: "plot-boundary-stroke-glow",
          type: "line",
          source: "plot-polygon-source",
          paint: {
            "line-color": "#38bdf8",
            "line-width": 5,
            "line-opacity": 0.5,
            "line-blur": 3,
          },
        });

        // Crisp White Boundary
        map.addLayer({
          id: "plot-boundary-stroke",
          type: "line",
          source: "plot-polygon-source",
          paint: {
            "line-color": "#ffffff",
            "line-width": 2.5,
            "line-opacity": 1.0,
          },
        });

        // Amber Road Frontage Highlight
        map.addLayer({
          id: "plot-road-frontage-stroke",
          type: "line",
          source: "plot-polygon-source",
          filter: ["==", "isRoad", true],
          paint: {
            "line-color": "#fbbf24",
            "line-width": 6,
            "line-dasharray": [2, 1],
          },
        });
      }

      // Rubberband Guide Line
      if (!map.getSource("rubberband-source")) {
        map.addSource("rubberband-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
          id: "rubberband-line",
          type: "line",
          source: "rubberband-source",
          paint: {
            "line-color": "#38bdf8",
            "line-width": 2.5,
            "line-dasharray": [3, 2],
          },
        });
      }

      // Rubberband Polygon Fill Preview
      if (!map.getSource("rubberband-poly-source")) {
        map.addSource("rubberband-poly-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
          id: "rubberband-poly-fill",
          type: "fill",
          source: "rubberband-poly-source",
          paint: {
            "fill-color": "#38bdf8",
            "fill-opacity": 0.15,
          },
        });
      }

      updateMapLayers(coordinates);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Switch Map Style (Satellite vs Vector)
  const switchMapMode = (newMode: MapMode) => {
    setMapMode(newMode);
    const map = mapRef.current;
    if (!map) return;

    map.setStyle(buildMapStyle(newMode));
    map.once("style.load", () => {
      map.setPitch(0);
      map.setBearing(0);
      map.dragRotate.disable();
      map.touchZoomRotate.disableRotation();

      // Re-inject sources
      if (!map.getSource("plot-polygon-source")) {
        map.addSource("plot-polygon-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: "plot-polygon-fill",
          type: "fill",
          source: "plot-polygon-source",
          filter: ["==", "type", "plot-fill"],
          paint: { "fill-color": "#0284c7", "fill-opacity": 0.28 },
        });
        map.addLayer({
          id: "plot-boundary-stroke-glow",
          type: "line",
          source: "plot-polygon-source",
          paint: { "line-color": "#38bdf8", "line-width": 5, "line-opacity": 0.5, "line-blur": 3 },
        });
        map.addLayer({
          id: "plot-boundary-stroke",
          type: "line",
          source: "plot-polygon-source",
          paint: { "line-color": "#ffffff", "line-width": 2.5, "line-opacity": 1.0 },
        });
        map.addLayer({
          id: "plot-road-frontage-stroke",
          type: "line",
          source: "plot-polygon-source",
          filter: ["==", "isRoad", true],
          paint: { "line-color": "#fbbf24", "line-width": 6, "line-dasharray": [2, 1] },
        });
      }

      if (!map.getSource("rubberband-source")) {
        map.addSource("rubberband-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: "rubberband-line",
          type: "line",
          source: "rubberband-source",
          paint: { "line-color": "#38bdf8", "line-width": 2.5, "line-dasharray": [3, 2] },
        });
      }

      if (!map.getSource("rubberband-poly-source")) {
        map.addSource("rubberband-poly-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: "rubberband-poly-fill",
          type: "fill",
          source: "rubberband-poly-source",
          paint: { "fill-color": "#38bdf8", "fill-opacity": 0.15 },
        });
      }

      updateMapLayers(coordinates);
    });
  };

  // 3. Render Geometry & Draggable Corner Markers
  const updateMapLayers = useCallback(
    (coords: [number, number][]) => {
      const map = mapRef.current;
      if (!map) return;

      const source = map.getSource("plot-polygon-source") as GeoJSONSource;
      if (!source) return;

      const features: any[] = [];

      if (coords.length >= 3) {
        const closedRing = [...coords, coords[0]];
        features.push({
          type: "Feature",
          properties: { type: "plot-fill" },
          geometry: { type: "Polygon", coordinates: [closedRing] },
        });

        // Boundary lines with road frontage identification
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
          properties: { type: "segment", index: 0, isRoad: false },
          geometry: { type: "LineString", coordinates: coords },
        });
      }

      source.setData({ type: "FeatureCollection", features });

      // Clean existing markers
      cornerMarkersRef.current.forEach((m) => m.remove());
      cornerMarkersRef.current = [];
      segmentMarkersRef.current.forEach((m) => m.remove());
      segmentMarkersRef.current = [];

      if (centerMarkerRef.current) {
        centerMarkerRef.current.remove();
        centerMarkerRef.current = null;
      }

      // Add Corner Pins (ALWAYS draggable for effortless adjustments)
      coords.forEach((coord, i) => {
        const isStart = i === 0;
        const el = document.createElement("div");
        el.className = "group relative cursor-move select-none";

        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            ${
              isStart && !isClosed && coords.length >= 3
                ? `<div class="absolute w-8 h-8 rounded-full bg-cyan-400/40 animate-ping"></div>`
                : ""
            }
            <div class="w-6 h-6 rounded-full bg-charcoal text-cyan-300 font-mono text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xl hover:scale-125 hover:bg-cyan-500 hover:text-black transition-all">
              ${i + 1}
            </div>
            <div class="absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/85 text-white font-mono text-[9px] px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
              Corner ${i + 1} (Drag to adjust)
            </div>
          </div>
        `;

        const marker = new Marker({
          element: el,
          draggable: true,
        })
          .setLngLat(coord)
          .addTo(map);

        marker.on("dragend", () => {
          const newPos = marker.getLngLat();
          const nextCoords = [...coords];
          nextCoords[i] = [newPos.lng, newPos.lat];
          pushHistory(nextCoords);
        });

        // Click start point to close boundary
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          if (isStart && !isClosed && coords.length >= 3) {
            handleCompleteBoundary();
          }
        });

        cornerMarkersRef.current.push(marker);
      });

      // Add Interactive Side Length Badges (Clicking sets Road Frontage!)
      if (coords.length >= 2) {
        const segCount = isClosed ? coords.length : coords.length - 1;
        for (let i = 0; i < segCount; i++) {
          const nextIdx = (i + 1) % coords.length;
          const p1 = coords[i];
          const p2 = coords[nextIdx];
          const midLng = (p1[0] + p2[0]) / 2;
          const midLat = (p1[1] + p2[1]) / 2;

          const distKm = turf.distance(turf.point(p1), turf.point(p2), { units: "kilometers" });
          const distFt = distKm * 3280.84;

          const isRoad = i === roadFacingIndex;
          const badgeEl = document.createElement("div");
          badgeEl.className = `cursor-pointer px-2.5 py-1 rounded-full font-mono text-[10px] shadow-lg transition-all flex items-center gap-1.5 select-none ${
            isRoad
              ? "bg-amber-500 text-black border border-amber-300 ring-2 ring-amber-400/50 font-bold scale-105 z-10"
              : "bg-black/85 hover:bg-black text-white/90 border border-white/20 hover:border-cyan-400 font-medium"
          }`;
          badgeEl.innerHTML = `
            <span>${isRoad ? "★ Road " : ""}${distFt.toFixed(1)} ft</span>
          `;
          badgeEl.title = isRoad ? "Designated Road Frontage" : "Click to mark this side as Road Frontage";
          badgeEl.addEventListener("click", (e) => {
            e.stopPropagation();
            onRoadFacingIndexChange(i);
          });

          const segMarker = new Marker({ element: badgeEl, anchor: "center" })
            .setLngLat([midLng, midLat])
            .addTo(map);

          segmentMarkersRef.current.push(segMarker);
        }
      }

      // Add High-Tech Centroid Area Badge (Only when boundary is complete and closed)
      if (coords.length >= 3 && analysis && isClosed) {
        const centerEl = document.createElement("div");
        centerEl.className = "pointer-events-none transform -translate-x-1/2 -translate-y-1/2";
        centerEl.innerHTML = `
          <div class="px-3.5 py-1.5 rounded-2xl bg-black/85 backdrop-blur-md border border-cyan-400/50 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div class="font-mono text-sm font-bold text-cyan-300 leading-tight">
              ${analysis.areaCents.toFixed(2)} Cents
            </div>
            <div class="text-[10px] font-sans text-white/70">
              ${analysis.areaSqFt.toLocaleString(undefined, { maximumFractionDigits: 0 })} Sq.Ft
            </div>
          </div>
        `;
        const centerMarker = new Marker({ element: centerEl, anchor: "center" })
          .setLngLat(analysis.center)
          .addTo(map);
        centerMarkerRef.current = centerMarker;
      }
    },
    [isClosed, roadFacingIndex, analysis, pushHistory, onRoadFacingIndexChange]
  );

  useEffect(() => {
    updateMapLayers(coordinates);
  }, [coordinates, isClosed, roadFacingIndex, updateMapLayers]);

  // 4. Map Mouse Move & Click Handling (Adding Corners)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMouseMove = (e: MapMouseEvent) => {
      if (isClosed) return;
      const curPt: [number, number] = [e.lngLat.lng, e.lngLat.lat];

      if (coordinates.length > 0) {
        const lastPt = coordinates[coordinates.length - 1];
        const fromPt = turf.point(lastPt);
        const toPt = turf.point(curPt);

        const distKm = turf.distance(fromPt, toPt, { units: "kilometers" });
        setLiveDistanceFt(distKm * 3280.84);

        // Snap check to Start Point (P1)
        if (coordinates.length >= 3) {
          const startPt = turf.point(coordinates[0]);
          const distToStartKm = turf.distance(startPt, toPt, { units: "kilometers" });
          setIsNearStartPoint(distToStartKm * 1000 < 10);
        } else {
          setIsNearStartPoint(false);
        }

        // Update Guide Line
        const rubberLineSrc = map.getSource("rubberband-source") as GeoJSONSource;
        if (rubberLineSrc) {
          rubberLineSrc.setData({
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: [lastPt, curPt],
                },
              },
            ],
          });
        }

        // Update Preview Polygon
        if (coordinates.length >= 2) {
          const polySrc = map.getSource("rubberband-poly-source") as GeoJSONSource;
          if (polySrc) {
            const previewRing = [...coordinates, curPt, coordinates[0]];
            polySrc.setData({
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "Polygon",
                    coordinates: [previewRing],
                  },
                },
              ],
            });
          }
        }
      }
    };

    const handleMapClick = (e: MapMouseEvent) => {
      if (isClosed) return;

      // If clicked near starting point, complete boundary!
      if (isNearStartPoint && coordinates.length >= 3) {
        handleCompleteBoundary();
        return;
      }

      const newPoint: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      const newCoords = [...coordinates, newPoint];
      pushHistory(newCoords);
    };

    map.on("mousemove", handleMouseMove);
    map.on("click", handleMapClick);

    return () => {
      map.off("mousemove", handleMouseMove);
      map.off("click", handleMapClick);
    };
  }, [coordinates, isClosed, isNearStartPoint, pushHistory]);

  // 5. Fit Plot Bounds
  const fitPlotBounds = useCallback(() => {
    const map = mapRef.current;
    if (!map || coordinates.length < 2) return;

    const line = turf.lineString(coordinates);
    const [minX, minY, maxX, maxY] = turf.bbox(line);

    map.fitBounds(
      [
        [minX, minY],
        [maxX, maxY],
      ],
      {
        padding: { top: 80, bottom: 90, left: 80, right: 80 },
        maxZoom: 19.5,
        duration: 900,
        pitch: 0,
        bearing: 0,
      }
    );
  }, [coordinates]);

  // Auto-fit bounds whenever a completed/closed plot is loaded
  useEffect(() => {
    if (isClosed && coordinates.length >= 3) {
      const timer = setTimeout(() => {
        fitPlotBounds();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isClosed, coordinates.length, fitPlotBounds]);

  // 6. External Focus Location Handling
  const placeLocationPin = useCallback((lat: number, lng: number, label = "Selected Location") => {
    const map = mapRef.current;
    if (!map) return;

    if (locationPinMarkerRef.current) {
      locationPinMarkerRef.current.remove();
      locationPinMarkerRef.current = null;
    }

    const pinEl = document.createElement("div");
    pinEl.className = "flex flex-col items-center pointer-events-none select-none animate-bounce";
    pinEl.innerHTML = `
      <div class="px-2.5 py-1 rounded-full bg-cyan-500 text-black font-mono text-[10px] font-bold shadow-2xl border border-white whitespace-nowrap mb-1">
        ${label}
      </div>
      <div class="w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-xl"></div>
    `;

    const pin = new Marker({ element: pinEl, anchor: "bottom" })
      .setLngLat([lng, lat])
      .addTo(map);

    locationPinMarkerRef.current = pin;
  }, []);

  useEffect(() => {
    if (!focusLocation || !mapRef.current) return;
    const { lat, lng, label } = focusLocation;

    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: 18,
      pitch: 0,
      bearing: 0,
      duration: 1400,
      essential: true,
    });

    placeLocationPin(lat, lng, label || "Selected Property");
  }, [focusLocation, placeLocationPin]);

  // Fallback to server-side IP geolocation if browser GPS is blocked
  const fallbackIpGeolocation = async () => {
    try {
      const geoRes = await fetch("/api/geolocation");
      if (geoRes.ok) {
        const geoInfo = await geoRes.json();
        if (geoInfo.latitude && geoInfo.longitude) {
          const lat = geoInfo.latitude;
          const lng = geoInfo.longitude;
          const map = mapRef.current;
          if (map) {
            map.flyTo({
              center: [lng, lat],
              zoom: 17,
              pitch: 0,
              bearing: 0,
              duration: 1200,
              essential: true,
            });
          }

          const placeName = geoInfo.city || "Regional Location";
          placeLocationPin(lat, lng, placeName);
          if (onLocationDetected) {
            onLocationDetected(placeName, `${placeName}, ${geoInfo.region || "Kerala"}`, lat, lng);
          }
          setGeoNotice(`Located approximately via Network (${placeName})`);
          setTimeout(() => setGeoNotice(null), 4000);
          return;
        }
      }
    } catch (e) {}

    setGeoNotice("Please search your locality or PIN code in the search bar above.");
    setTimeout(() => setGeoNotice(null), 5000);
  };

  // 7. High-Precision Device Geolocation with Reverse Geocoding & Safe Fallback
  const handleCurrentLocation = () => {
    setGeoLocating(true);
    setGeoNotice("Detecting property location...");

    const onGeoSuccess = async (pos: GeolocationPosition) => {
      setGeoLocating(false);
      const { longitude, latitude } = pos.coords;
      const map = mapRef.current;
      if (map) {
        map.flyTo({
          center: [longitude, latitude],
          zoom: 18,
          pitch: 0,
          bearing: 0,
          duration: 1500,
          essential: true,
        });
      }

      // Reverse geocode to retrieve exact locality (e.g. East Desam, Aluva)
      try {
        const res = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`);
        if (res.ok) {
          const geoData = await res.json();
          const placeName = geoData.name || "Your Location";
          placeLocationPin(latitude, longitude, placeName);
          setGeoNotice(`Located: ${placeName}`);
          setTimeout(() => setGeoNotice(null), 4000);
          if (onLocationDetected) {
            onLocationDetected(placeName, geoData.displayName || placeName, latitude, longitude);
          }
          return;
        }
      } catch (err) {}

      placeLocationPin(latitude, longitude, "Your Location");
      setGeoNotice("Property location detected");
      setTimeout(() => setGeoNotice(null), 3000);
    };

    const onGeoError = async (err?: GeolocationPositionError) => {
      console.warn("Browser geolocation blocked or unavailable, using IP fallback:", err?.message);
      await fallbackIpGeolocation();
      setGeoLocating(false);
    };

    try {
      if (!navigator.geolocation) {
        fallbackIpGeolocation();
        setGeoLocating(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        onGeoSuccess,
        onGeoError,
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } catch (ex) {
      console.warn("Geolocation access threw policy exception, falling back:", ex);
      fallbackIpGeolocation();
      setGeoLocating(false);
    }
  };

  const validation = validatePolygonCoordinates(coordinates);

  return (
    <div
      className={`relative w-full h-full min-h-[500px] overflow-hidden rounded-3xl border border-warm-border shadow-card bg-charcoal select-none ${className}`}
    >
      {/* MapLibre Canvas Container */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full ${!isClosed ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"}`}
      />

      {/* Top Left: Clean Map Type Switcher */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1 bg-black/80 backdrop-blur-md p-1 rounded-2xl border border-white/15 shadow-xl">
        <button
          onClick={() => switchMapMode("satellite")}
          className={`px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-all ${
            mapMode === "satellite"
              ? "bg-cyan-500 text-black font-semibold shadow-sm"
              : "text-white/80 hover:text-white"
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => switchMapMode("standard")}
          className={`px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-all ${
            mapMode === "standard"
              ? "bg-white text-black font-semibold shadow-sm"
              : "text-white/80 hover:text-white"
          }`}
        >
          Map
        </button>
      </div>

      {/* Top Right: Zoom, Locate & Fit Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-center gap-2">
        {/* Zoom Controls */}
        <div className="bg-black/80 backdrop-blur-md rounded-2xl p-1 border border-white/15 shadow-xl flex flex-col items-center">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="p-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-4 h-px bg-white/15" />
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="p-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Locate Me */}
        <button
          onClick={handleCurrentLocation}
          disabled={geoLocating}
          className={`p-2.5 rounded-2xl border backdrop-blur-md shadow-xl transition-all ${
            geoLocating
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 animate-pulse"
              : "bg-black/80 text-white/80 border-white/15 hover:text-white hover:border-cyan-400"
          }`}
          title="Detect Live Location (GPS)"
        >
          <Locate className="w-4 h-4" />
        </button>

        {/* Fit Bounds */}
        {coordinates.length >= 2 && (
          <button
            onClick={fitPlotBounds}
            className="p-2.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/15 text-white/80 hover:text-white hover:border-cyan-400 shadow-xl transition-colors"
            title="Fit Plot in View"
          >
            <Crosshair className="w-4 h-4 text-cyan-400" />
          </button>
        )}
      </div>

      {/* Notification Toast */}
      {geoNotice && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-30 bg-black/90 border border-cyan-400/60 text-cyan-200 px-4 py-2 rounded-2xl shadow-2xl text-xs font-sans flex items-center gap-2 backdrop-blur-md max-w-md text-center animate-in fade-in">
          <Locate className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{geoNotice}</span>
          <button onClick={() => setGeoNotice(null)} className="ml-1 text-white/60 hover:text-white font-bold">×</button>
        </div>
      )}

      {/* Floating Live Distance & Snap Indicator while drawing */}
      {coordinates.length > 0 && !isClosed && liveDistanceFt !== null && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
          {isNearStartPoint && coordinates.length >= 3 ? (
            <div className="bg-emerald-500 text-black px-4 py-1.5 rounded-full font-sans text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Click Corner #1 to Close Boundary!</span>
            </div>
          ) : (
            <div className="bg-black/85 backdrop-blur-md border border-cyan-400/40 text-cyan-200 px-3.5 py-1 rounded-full font-mono text-xs shadow-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Current Side: <strong className="text-white">{liveDistanceFt.toFixed(1)} ft</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Bottom Center: Simple, Intuitive Plot Marking Toolbar */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-20 w-auto max-w-[95%]">
        <div className="bg-black/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-3">
          {/* State 1: Empty - prompt to click */}
          {coordinates.length === 0 ? (
            <div className="flex items-center gap-2 text-xs font-sans text-white/90">
              <Pencil className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
              <span>Click anywhere on the map to place <strong>Corner #1</strong></span>
              <button
                onClick={handleSamplePlotClick}
                className="ml-2 px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500 hover:text-black font-medium transition-all flex items-center gap-1 text-[11px]"
              >
                <Sparkles className="w-3 h-3" />
                <span>Try Sample Plot</span>
              </button>
            </div>
          ) : !isClosed ? (
            /* State 2: Plot in progress (placing corners) */
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-medium text-cyan-300">
                Corner #{coordinates.length + 1}
              </span>

              {/* Complete Boundary button appears when >= 3 points exist */}
              {coordinates.length >= 3 && (
                <button
                  onClick={handleCompleteBoundary}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 text-black text-xs font-sans font-bold hover:bg-cyan-400 transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Close Boundary</span>
                </button>
              )}

              {/* Undo Last Point */}
              <button
                onClick={handleUndo}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Undo last point"
              >
                <Undo2 className="w-4 h-4" />
              </button>

              {/* Reset */}
              <button
                onClick={handleClear}
                className="p-1.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors"
                title="Reset plot"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* State 3: Boundary Closed & Complete */
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-sans text-cyan-300">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span className="font-medium text-white">{coordinates.length} Corners Marked</span>
                <span className="text-white/40 hidden sm:inline">• Drag corners to fine-tune</span>
              </div>

              <div className="h-4 w-px bg-white/20" />

              <button
                onClick={handleClear}
                className="px-2.5 py-1 rounded-xl text-xs font-sans text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1"
                title="Clear and redraw"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Clear / Redraw</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
