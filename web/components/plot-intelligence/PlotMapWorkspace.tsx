"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as turf from "@turf/turf";
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
  AlertTriangle,
  Locate,
  ZoomIn,
  ZoomOut,
  Pencil,
  Move,
  Info,
  Crosshair,
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

  // Map Modes (Satellite vs Standard Top-Down Survey)
  const [mapMode, setMapMode] = useState<MapMode>("satellite");
  const [mapTelemetry, setMapTelemetry] = useState({
    lat: KERALA_DEFAULT_CENTER[1],
    lng: KERALA_DEFAULT_CENTER[0],
    zoom: KERALA_DEFAULT_ZOOM,
  });

  // Drawing & Precision Measuring Reticle
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [cursorPos, setCursorPos] = useState<[number, number] | null>(null);
  const [mouseScreenPos, setMouseScreenPos] = useState<{ x: number; y: number } | null>(null);
  const [liveDistanceFt, setLiveDistanceFt] = useState<number | null>(null);
  const [liveBearingDeg, setLiveBearingDeg] = useState<number | null>(null);
  const [isNearStartPoint, setIsNearStartPoint] = useState(false);

  // History & State
  const [history, setHistory] = useState<[number, number][][]>([[]]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // References for live markers and animations
  const cornerMarkersRef = useRef<Marker[]>([]);
  const segmentMarkersRef = useRef<Marker[]>([]);
  const midpointMarkersRef = useRef<Marker[]>([]);
  const userLocationMarkerRef = useRef<Marker[]>([]);

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

  // Initialize MapLibre locked strictly to 2D Top-Down View (no rotation, no pitch)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialStyle = buildMapStyle(mapMode);

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: initialStyle,
      center: KERALA_DEFAULT_CENTER,
      zoom: KERALA_DEFAULT_ZOOM,
      pitch: 0,
      maxPitch: 0, // Strictly locked to top-down 0°
      bearing: 0,
      dragRotate: false, // Disable right-click & ctrl-drag rotation
      pitchWithRotate: false,
      touchPitch: false, // Disable mobile touch pitch
      attributionControl: false,
    });

    // Disable touch rotation gestures
    map.touchZoomRotate.disableRotation();

    map.addControl(
      new AttributionControl({ compact: true }),
      "bottom-right"
    );

    map.on("load", () => {
      // 1. Plot Polygon Source
      if (!map.getSource("plot-polygon-source")) {
        map.addSource("plot-polygon-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        // Polygon Fill with blueprint styling
        map.addLayer({
          id: "plot-polygon-fill",
          type: "fill",
          source: "plot-polygon-source",
          paint: {
            "fill-color": "#38bdf8",
            "fill-opacity": 0.22,
          },
        });

        // Boundary Glow Stroke
        map.addLayer({
          id: "plot-boundary-stroke-glow",
          type: "line",
          source: "plot-polygon-source",
          paint: {
            "line-color": "#38bdf8",
            "line-width": 5,
            "line-opacity": 0.4,
            "line-blur": 3,
          },
        });

        // Crisp White Boundary Laser
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

        // Glowing Road Frontage Laser (Amber)
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

      // 2. Google Earth Live Measuring Rubberband Line Source
      if (!map.getSource("rubberband-source")) {
        map.addSource("rubberband-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
          id: "rubberband-line-glow",
          type: "line",
          source: "rubberband-source",
          paint: {
            "line-color": "#38bdf8",
            "line-width": 4,
            "line-opacity": 0.5,
            "line-blur": 2,
          },
        });

        map.addLayer({
          id: "rubberband-line",
          type: "line",
          source: "rubberband-source",
          paint: {
            "line-color": "#ffffff",
            "line-width": 2,
            "line-dasharray": [3, 2],
          },
        });
      }

      // 3. Live Polygon Area Preview Source
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
            "fill-opacity": 0.12,
          },
        });
      }
    });

    // Real-time HUD Telemetry listeners
    map.on("move", () => {
      const center = map.getCenter();
      setMapTelemetry({
        lat: center.lat,
        lng: center.lng,
        zoom: map.getZoom(),
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Switch Map Mode (Satellite / Standard)
  const switchMapMode = (newMode: MapMode) => {
    setMapMode(newMode);
    if (mapRef.current) {
      mapRef.current.setStyle(buildMapStyle(newMode));
      mapRef.current.once("style.load", () => {
        const map = mapRef.current;
        if (!map) return;
        // Keep rotation & pitch locked
        map.setPitch(0);
        map.setBearing(0);
        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();

        // Re-inject sources after style reload
        if (!map.getSource("plot-polygon-source")) {
          map.addSource("plot-polygon-source", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });
          map.addLayer({
            id: "plot-polygon-fill",
            type: "fill",
            source: "plot-polygon-source",
            paint: { "fill-color": "#38bdf8", "fill-opacity": 0.22 },
          });
          map.addLayer({
            id: "plot-boundary-stroke-glow",
            type: "line",
            source: "plot-polygon-source",
            paint: { "line-color": "#38bdf8", "line-width": 5, "line-opacity": 0.4, "line-blur": 3 },
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
            paint: { "line-color": "#f59e0b", "line-width": 5, "line-dasharray": [2, 1] },
          });
        }
        if (!map.getSource("rubberband-source")) {
          map.addSource("rubberband-source", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });
          map.addLayer({
            id: "rubberband-line-glow",
            type: "line",
            source: "rubberband-source",
            paint: { "line-color": "#38bdf8", "line-width": 4, "line-opacity": 0.5, "line-blur": 2 },
          });
          map.addLayer({
            id: "rubberband-line",
            type: "line",
            source: "rubberband-source",
            paint: { "line-color": "#ffffff", "line-width": 2, "line-dasharray": [3, 2] },
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
            paint: { "fill-color": "#38bdf8", "fill-opacity": 0.12 },
          });
        }
        updateMapLayers(coordinates);
      });
    }
  };

  // Update GeoJSON Layers & Markers
  const updateMapLayers = useCallback(
    (coords: [number, number][]) => {
      const map = mapRef.current;
      if (!map) return;

      const source = map.getSource("plot-polygon-source") as GeoJSONSource;
      if (!source) return;

      const features: any[] = [];

      if (coords.length >= 3) {
        const closed = [...coords, coords[0]];
        features.push({
          type: "Feature",
          properties: { type: "plot-fill" },
          geometry: { type: "Polygon", coordinates: [closed] },
        });

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
          geometry: { type: "LineString", coordinates: coords },
        });
      }

      source.setData({
        type: "FeatureCollection",
        features,
      });

      // Clear existing markers
      cornerMarkersRef.current.forEach((m) => m.remove());
      cornerMarkersRef.current = [];
      segmentMarkersRef.current.forEach((m) => m.remove());
      segmentMarkersRef.current = [];
      midpointMarkersRef.current.forEach((m) => m.remove());
      midpointMarkersRef.current = [];

      // Google Earth Illuminated Corner Pins
      coords.forEach((coord, i) => {
        const isStart = i === 0;
        const el = document.createElement("div");
        el.className = `group relative cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 ${
          isEditMode ? "hover:scale-125" : ""
        }`;

        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            ${
              isStart && isDrawing && coords.length >= 3
                ? `<div class="absolute w-10 h-10 rounded-full bg-cyan-400/40 animate-ping"></div>
                   <div class="absolute w-8 h-8 rounded-full border-2 border-cyan-300 animate-spin"></div>`
                : ""
            }
            <div class="w-6 h-6 rounded-full bg-charcoal-dark text-cyan-300 font-mono text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xl group-hover:bg-cyan-500 group-hover:text-black transition-colors">
              ${i + 1}
            </div>
            <div class="absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/85 text-white font-mono text-[9px] px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
              Corner P${i + 1}
            </div>
          </div>
        `;

        const marker = new Marker({
          element: el,
          draggable: isEditMode,
        })
          .setLngLat(coord)
          .addTo(map);

        marker.on("dragend", () => {
          const newPos = marker.getLngLat();
          const nextCoords = [...coords];
          nextCoords[i] = [newPos.lng, newPos.lat];
          pushHistory(nextCoords);
        });

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          if (isDrawing && isStart && coords.length >= 3) {
            setIsDrawing(false);
          }
        });

        cornerMarkersRef.current.push(marker);
      });

      // Segment Labels with Bearing and Elevation Flair
      if (analysis && analysis.segments.length > 0 && coords.length >= 3) {
        analysis.segments.forEach((seg, i) => {
          const midLng = (seg.startPoint[0] + seg.endPoint[0]) / 2;
          const midLat = (seg.startPoint[1] + seg.endPoint[1]) / 2;
          const isRoad = i === roadFacingIndex;

          const segEl = document.createElement("div");
          segEl.className = `px-2 py-0.5 rounded-lg text-[10px] font-mono tracking-wider border shadow-xl whitespace-nowrap cursor-pointer transition-all transform -translate-x-1/2 -translate-y-1/2 ${
            isRoad
              ? "bg-amber-500 text-black border-amber-300 font-bold scale-105 shadow-amber-500/30"
              : "bg-black/80 text-white/90 border-white/20 hover:border-cyan-400 hover:text-cyan-300 backdrop-blur-md"
          }`;
          segEl.innerHTML = `${seg.label}: ${seg.lengthFeet.toFixed(1)} ft ${
            isRoad ? "★ ROAD" : ""
          }`;

          segEl.addEventListener("click", (e) => {
            e.stopPropagation();
            onRoadFacingIndexChange(i);
          });

          const segMarker = new Marker({ element: segEl })
            .setLngLat([midLng, midLat])
            .addTo(map);

          segmentMarkersRef.current.push(segMarker);

          // Midpoint handle in Edit mode
          if (isEditMode) {
            const midHandle = document.createElement("div");
            midHandle.className =
              "w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-white shadow-lg cursor-pointer hover:scale-150 transition-transform -translate-x-1/2 -translate-y-1/2";
            midHandle.title = "Insert new corner here";

            midHandle.addEventListener("click", (e) => {
              e.stopPropagation();
              const nextCoords = [...coords];
              nextCoords.splice(i + 1, 0, [midLng, midLat]);
              pushHistory(nextCoords);
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

  // Google Earth Live Rubberband & Reticle Follower
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMouseMove = (e: MapMouseEvent) => {
      setCursorPos([e.lngLat.lng, e.lngLat.lat]);
      setMouseScreenPos({ x: e.point.x, y: e.point.y });

      if (isDrawing && coordinates.length > 0) {
        const lastPt = coordinates[coordinates.length - 1];
        const curPt = [e.lngLat.lng, e.lngLat.lat] as [number, number];

        // Live Geodesic Distance
        const fromPt = turf.point(lastPt);
        const toPt = turf.point(curPt);
        const distKm = turf.distance(fromPt, toPt, { units: "kilometers" });
        const distFeet = distKm * 1000 * 3.28084;
        const bearing = turf.bearing(fromPt, toPt);

        setLiveDistanceFt(distFeet);
        setLiveBearingDeg(bearing >= 0 ? bearing : 360 + bearing);

        // Snap check to Start Point (P1)
        if (coordinates.length >= 3) {
          const startPt = turf.point(coordinates[0]);
          const distToStartKm = turf.distance(startPt, toPt, { units: "kilometers" });
          const isNear = distToStartKm * 1000 < 12; // Within 12 meters
          setIsNearStartPoint(isNear);
        } else {
          setIsNearStartPoint(false);
        }

        // Update Dynamic Rubberband GeoJSON Line
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

        // Update Dynamic Area Preview Polygon
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
      if (!isDrawing) return;

      // If near start point, close loop
      if (isNearStartPoint && coordinates.length >= 3) {
        setIsDrawing(false);
        clearRubberband();
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
  }, [isDrawing, coordinates, isNearStartPoint, pushHistory]);

  const clearRubberband = () => {
    const map = mapRef.current;
    if (!map) return;
    const lineSrc = map.getSource("rubberband-source") as GeoJSONSource;
    if (lineSrc) lineSrc.setData({ type: "FeatureCollection", features: [] });
    const polySrc = map.getSource("rubberband-poly-source") as GeoJSONSource;
    if (polySrc) polySrc.setData({ type: "FeatureCollection", features: [] });
    setLiveDistanceFt(null);
    setLiveBearingDeg(null);
  };

  useEffect(() => {
    if (!isDrawing) {
      clearRubberband();
    }
  }, [isDrawing]);

  // Zoom to Fit Plot (strictly 2D top-down)
  const fitPlotBounds = () => {
    if (!mapRef.current || coordinates.length < 2) return;
    const bounds = new LngLatBounds(coordinates[0], coordinates[0]);
    coordinates.forEach((coord) => bounds.extend(coord));
    mapRef.current.fitBounds(bounds, {
      padding: 80,
      maxZoom: 19,
      pitch: 0,
      bearing: 0,
      duration: 1000,
    });
  };

  // Robust Multi-Tier Live Geolocation (strictly 2D top-down)
  const handleCurrentLocation = () => {
    setGeoLocating(true);
    setGeoNotice(null);

    const applyLocation = (lat: number, lng: number, placeLabel: string) => {
      setGeoLocating(false);
      setGeoNotice(`Located at ${placeLabel}`);
      setTimeout(() => setGeoNotice(null), 4000);

      const map = mapRef.current;
      if (!map) return;

      // Clear previous location beacon
      userLocationMarkerRef.current.forEach((m) => m.remove());
      userLocationMarkerRef.current = [];

      // Glowing Google Earth GPS radar beacon
      const el = document.createElement("div");
      el.className = "relative flex items-center justify-center";
      el.innerHTML = `
        <div class="absolute w-12 h-12 bg-cyan-400/30 rounded-full animate-ping"></div>
        <div class="absolute w-8 h-8 bg-cyan-400/50 rounded-full animate-pulse"></div>
        <div class="w-4 h-4 bg-cyan-400 border-2 border-white rounded-full shadow-lg relative z-10"></div>
      `;

      const beaconMarker = new Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map);

      userLocationMarkerRef.current.push(beaconMarker);

      // Smooth top-down pan to location
      map.flyTo({
        center: [lng, lat],
        zoom: 18,
        pitch: 0,
        bearing: 0,
        duration: 2000,
        essential: true,
      });
    };

    // Tier 1: Fast device GPS / WiFi position
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          applyLocation(pos.coords.latitude, pos.coords.longitude, "Device GPS Position");
        },
        async () => {
          // Tier 2: IP-based edge geolocation fallback
          try {
            const res = await fetch("/api/geolocation");
            if (res.ok) {
              const data = await res.json();
              if (data && data.latitude && data.longitude) {
                applyLocation(data.latitude, data.longitude, `${data.city}, ${data.region}`);
                return;
              }
            }
          } catch (e) {
            // Ignore
          }
          setGeoLocating(false);
          setGeoNotice("Location permission blocked. Please search your place or PIN above.");
        },
        { enableHighAccuracy: false, timeout: 4500, maximumAge: 300000 }
      );
    } else {
      // Tier 3: Direct API
      fetch("/api/geolocation")
        .then((r) => r.json())
        .then((data) => applyLocation(data.latitude, data.longitude, data.city))
        .catch(() => {
          setGeoLocating(false);
          setGeoNotice("Unable to detect location. Please search your location.");
        });
    }
  };

  // Fullscreen Toggle
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

  const validation = validatePolygonCoordinates(coordinates);

  return (
    <div
      className={`relative w-full h-full min-h-[550px] overflow-hidden rounded-3xl border border-warm-border shadow-2xl bg-charcoal select-none ${className}`}
    >
      {/* MapLibre WebGL Canvas Container */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full ${isDrawing ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"}`}
      />

      {/* 1. Google Earth Dark Glass HUD Top Telemetry Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex items-center justify-between gap-3">
        {/* Left: Layer Mode Switcher & Top-Down Survey Badge */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Satellite / Street Switcher */}
          <div className="bg-black/75 backdrop-blur-md rounded-2xl p-1 border border-white/15 shadow-2xl flex items-center gap-1">
            <button
              onClick={() => switchMapMode("satellite")}
              className={`px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-all ${
                mapMode === "satellite"
                  ? "bg-cyan-500 text-black font-bold shadow-md"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => switchMapMode("standard")}
              className={`px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-all ${
                mapMode === "standard"
                  ? "bg-white text-black font-bold shadow-md"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              Vector Map
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 text-[11px] font-mono font-bold text-cyan-300 shadow-2xl">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>2D TOP SURVEY VIEW</span>
          </div>
        </div>

        {/* Right: Live Telemetry Ticker (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-2 bg-black/75 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 text-[11px] font-mono text-white/70 shadow-2xl">
          <span className="text-cyan-400 font-bold">GIS HUD</span>
          <span>•</span>
          <span>{mapTelemetry.lat.toFixed(5)}°N</span>
          <span>{mapTelemetry.lng.toFixed(5)}°E</span>
          <span>•</span>
          <span>Zoom: {mapTelemetry.zoom.toFixed(1)}</span>
        </div>
      </div>

      {/* 2. Top Right Floating Controls: Zoom & Geolocation */}
      <div className="absolute top-16 right-4 z-20 flex flex-col items-center gap-2.5">
        {/* Zoom Controls */}
        <div className="bg-black/75 backdrop-blur-md rounded-2xl p-1 border border-white/15 shadow-2xl flex flex-col items-center">
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

        {/* Geolocation Button */}
        <button
          onClick={handleCurrentLocation}
          disabled={geoLocating}
          className={`p-2.5 rounded-2xl border backdrop-blur-md shadow-2xl transition-all ${
            geoLocating
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 animate-spin"
              : "bg-black/75 text-white/80 border-white/15 hover:text-white hover:border-cyan-400"
          }`}
          title="Detect Current Live Location (GPS / Network)"
        >
          <Locate className="w-4 h-4" />
        </button>

        {/* Fit Bounds */}
        {coordinates.length >= 2 && (
          <button
            onClick={fitPlotBounds}
            className="p-2.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 text-white/80 hover:text-white hover:border-cyan-400 shadow-2xl transition-colors"
            title="Fit Plot to View"
          >
            <Crosshair className="w-4 h-4 text-cyan-400" />
          </button>
        )}

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="p-2.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 text-white/80 hover:text-white hover:border-cyan-400 shadow-2xl transition-colors"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 3. Measurement Tool Action Palette (Bottom Left) */}
      <div className="absolute bottom-6 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="bg-black/80 backdrop-blur-md rounded-2xl p-1.5 border border-white/15 shadow-2xl flex items-center gap-1.5">
          {/* Draw / Finish */}
          <button
            onClick={() => {
              setIsDrawing((prev) => !prev);
              if (!isDrawing) setIsEditMode(false);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-medium transition-all ${
              isDrawing
                ? "bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/30 animate-pulse"
                : "text-white/90 hover:bg-white/15 hover:text-white"
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>{isDrawing ? "Finish Measuring" : "Measure / Draw Plot"}</span>
          </button>

          {/* Edit Handles */}
          {coordinates.length >= 3 && (
            <button
              onClick={() => {
                setIsEditMode((prev) => !prev);
                if (!isEditMode) setIsDrawing(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-sans font-medium transition-all ${
                isEditMode
                  ? "bg-white text-black font-bold shadow-md"
                  : "text-white/80 hover:bg-white/15 hover:text-white"
              }`}
              title="Drag corner handles to fine-tune shape"
            >
              <Move className="w-3.5 h-3.5" />
              <span>{isEditMode ? "Done Editing" : "Edit Handles"}</span>
            </button>
          )}

          {/* Undo / Redo */}
          <div className="flex items-center border-l border-white/15 pl-1 ml-0.5">
            <button
              onClick={handleUndo}
              disabled={historyIdx <= 0}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/15 disabled:opacity-30"
              title="Undo last point"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIdx >= history.length - 1}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/15 disabled:opacity-30"
              title="Redo action"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Clear Plot */}
          {coordinates.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors"
              title="Clear plot boundary"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Dynamic Reticle Floating Measurement Badge (Follows Mouse Cursor while Drawing) */}
      {isDrawing && mouseScreenPos && (
        <div
          className="pointer-events-none absolute z-30 transform -translate-x-1/2 -translate-y-12 transition-transform duration-75"
          style={{ left: mouseScreenPos.x, top: mouseScreenPos.y }}
        >
          <div className="bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-400/60 shadow-2xl text-[11px] font-mono text-white flex items-center gap-2 whitespace-nowrap">
            {isNearStartPoint ? (
              <span className="text-cyan-300 font-bold flex items-center gap-1 animate-pulse">
                <Check className="w-3.5 h-3.5" />
                <span>Snap to Close Boundary Loop!</span>
              </span>
            ) : liveDistanceFt !== null ? (
              <>
                <span className="text-cyan-300 font-bold">{liveDistanceFt.toFixed(1)} ft</span>
                {liveBearingDeg !== null && (
                  <span className="text-white/60">∠{liveBearingDeg.toFixed(0)}°</span>
                )}
                <span className="text-white/40">• Point #{coordinates.length + 1}</span>
              </>
            ) : (
              <span className="text-cyan-300">Click to place Corner #1</span>
            )}
          </div>
        </div>
      )}

      {/* 5. Geolocation Notification Toast */}
      {geoNotice && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 bg-cyan-950/90 border border-cyan-400/60 text-cyan-200 px-4 py-2 rounded-2xl shadow-2xl text-xs font-sans flex items-center gap-2 backdrop-blur-md">
          <Locate className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{geoNotice}</span>
          <button
            onClick={() => setGeoNotice(null)}
            className="ml-2 font-bold hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* 6. Invalid Boundary Warning */}
      {!validation.valid && coordinates.length >= 3 && (
        <div className="absolute bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-20 bg-rose-950/90 border border-rose-500/60 text-rose-200 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs font-sans">
            <span className="font-semibold text-white">Boundary Loop Error: </span>
            {validation.error}
          </div>
        </div>
      )}

      {/* 7. Clear Confirmation Dialog */}
      {showClearConfirm && (
        <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-warm-border shadow-2xl space-y-4">
            <h3 className="text-lg font-serif text-charcoal font-normal">
              Clear Measured Parcel?
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
                onClick={() => {
                  pushHistory([]);
                  setIsDrawing(false);
                  setIsEditMode(false);
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-sans font-medium bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm"
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
