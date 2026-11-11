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
 * 3. Custom Tile Endpoint (NEXT_PUBLIC_SATELLITE_TILE_URL)
 * 4. High-resolution Esri World Imagery (ArcGIS Online) multi-CDN mirrors with full CORS and Kerala GIS parcel coverage
 */
export function resolveSatelliteConfig(): {
  tiles: string[];
  attribution: string;
  maxzoom: number;
  labelTiles?: string[];
} {
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

  // 3. High-resolution Esri World Imagery multi-CDN mirrors
  // Fully CORS-compliant (Access-Control-Allow-Origin: *), high-resolution sub-meter parcel coverage across all 14 Kerala districts
  return {
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ],
    attribution: "Imagery &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    maxzoom: 18,
    labelTiles: [
      "https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    ],
  };
}

export const DEFAULT_MAP_CONFIG: MapLayerConfig = {
  satelliteTileUrl:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  satelliteAttribution: "Imagery &copy; Esri &mdash; GIS User Community",
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

  const sources: StyleSpecification["sources"] = {
    "base-raster-tiles": {
      type: "raster",
      tiles: tileUrls,
      tileSize: 256,
      attribution,
      maxzoom,
    },
  };

  const layers: StyleSpecification["layers"] = [
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
  ];

  // Overlay hybrid place names and road boundaries in satellite mode
  if (isSat && satConfig.labelTiles && satConfig.labelTiles.length > 0) {
    sources["satellite-labels"] = {
      type: "raster",
      tiles: satConfig.labelTiles,
      tileSize: 256,
      attribution: "",
      maxzoom: 19,
    };
    layers.push({
      id: "satellite-labels-layer",
      type: "raster",
      source: "satellite-labels",
      minzoom: 0,
      maxzoom: 22,
      paint: {
        "raster-opacity": 0.85,
      },
    });
  }

  return {
    version: 8,
    name: isSat ? "S-ARC Satellite Workspace" : "S-ARC Standard Map",
    sources,
    layers,
  };
}
