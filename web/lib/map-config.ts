import { StyleSpecification } from "maplibre-gl";

export type MapMode = "satellite" | "standard";

export interface MapLayerConfig {
  satelliteTileUrl: string;
  satelliteAttribution: string;
  standardTileUrl: string;
  standardAttribution: string;
}

export const DEFAULT_MAP_CONFIG: MapLayerConfig = {
  // Ultra high-resolution Google Satellite Hybrid tiles covering all Kerala districts down to sub-meter parcel accuracy
  satelliteTileUrl:
    process.env.NEXT_PUBLIC_SATELLITE_TILE_URL ||
    "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
  satelliteAttribution:
    "Imagery &copy; Google",
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
  const customSatUrl = process.env.NEXT_PUBLIC_SATELLITE_TILE_URL;

  const tileUrls = isSat
    ? customSatUrl
      ? [customSatUrl]
      : [
          "https://mt0.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
          "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
          "https://mt2.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
          "https://mt3.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
        ]
    : [DEFAULT_MAP_CONFIG.standardTileUrl];

  const attribution = isSat
    ? DEFAULT_MAP_CONFIG.satelliteAttribution
    : DEFAULT_MAP_CONFIG.standardAttribution;

  return {
    version: 8,
    name: isSat ? "S-ARC Satellite Workspace" : "S-ARC Standard Map",
    sources: {
      "base-raster-tiles": {
        type: "raster",
        tiles: tileUrls,
        tileSize: 256,
        attribution,
        maxzoom: 20,
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
