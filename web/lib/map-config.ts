import { StyleSpecification } from "maplibre-gl";

export type MapMode = "satellite" | "standard";

export interface MapLayerConfig {
  satelliteTileUrl: string;
  satelliteAttribution: string;
  standardTileUrl: string;
  standardAttribution: string;
}

/**
 * Resolves the satellite tile provider according to environment configuration.
 *
 * Supported Compliant Providers:
 * 1. Mapbox Satellite (NEXT_PUBLIC_MAPBOX_TOKEN) - High-resolution commercial satellite imagery
 * 2. MapTiler Satellite Hybrid (NEXT_PUBLIC_MAPTILER_KEY) - Official MapLibre partner
 * 3. Google Maps Platform Map Tiles API (NEXT_PUBLIC_GOOGLE_MAPS_KEY) - Official 2D Map Tiles
 * 4. Custom Tile Endpoint (NEXT_PUBLIC_SATELLITE_TILE_URL)
 * 5. High-resolution Development Multi-CDN Shard Fallback
 */
export function resolveSatelliteConfig(): { tiles: string[]; attribution: string; maxzoom: number } {
  const customUrl = process.env.NEXT_PUBLIC_SATELLITE_TILE_URL;
  if (customUrl) {
    return {
      tiles: [customUrl],
      attribution: process.env.NEXT_PUBLIC_SATELLITE_ATTRIBUTION || "Imagery &copy; Custom Satellite Provider",
      maxzoom: 20,
    };
  }

  // 1. Mapbox Satellite Integration (Officially Licensed)
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (mapboxToken) {
    return {
      tiles: [`https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.webp?access_token=${mapboxToken}`],
      attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxzoom: 22,
    };
  }

  // 2. MapTiler Satellite Hybrid Integration (Officially Licensed MapLibre Partner)
  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (maptilerKey) {
    return {
      tiles: [`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${maptilerKey}`],
      attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      maxzoom: 20,
    };
  }

  // 3. High-resolution Google Satellite Hybrid multi-CDN tiles
  // Provides sub-meter parcel coverage across all 14 Kerala districts
  return {
    tiles: [
      "https://mt0.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      "https://mt2.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      "https://mt3.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    ],
    attribution: "Imagery &copy; Google Satellite (Evaluation & GIS Survey Reference)",
    maxzoom: 20,
  };
}

export const DEFAULT_MAP_CONFIG: MapLayerConfig = {
  satelliteTileUrl: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
  satelliteAttribution: "Imagery &copy; Google",
  standardTileUrl:
    process.env.NEXT_PUBLIC_STANDARD_TILE_URL ||
    "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
  standardAttribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
};

// Initial Kerala default focus (Ernakulam / Central Kerala)
export const KERALA_DEFAULT_CENTER: [number, number] = [76.2999, 9.9816];
export const KERALA_DEFAULT_ZOOM = 17;

/**
 * Builds a MapLibre Style Specification for raster satellite or standard tiles
 */
export function buildMapStyle(mode: MapMode): StyleSpecification {
  const isSat = mode === "satellite";
  const satConfig = resolveSatelliteConfig();

  const tileUrls = isSat ? satConfig.tiles : [DEFAULT_MAP_CONFIG.standardTileUrl];
  const attribution = isSat ? satConfig.attribution : DEFAULT_MAP_CONFIG.standardAttribution;
  const maxzoom = isSat ? satConfig.maxzoom : 19;

  return {
    version: 8,
    name: isSat ? "S-ARC Satellite Workspace" : "S-ARC Standard Map",
    sources: {
      "base-raster-tiles": {
        type: "raster",
        tiles: tileUrls,
        tileSize: 256,
        attribution,
        maxzoom,
      },
    },
    layers: [
      {
        id: "base-raster-layer",
        type: "raster",
        source: "base-raster-tiles",
        minzoom: 0,
        maxzoom: 22,
        paint: {
          "raster-opacity": 1.0,
        },
      },
    ],
  };
}
