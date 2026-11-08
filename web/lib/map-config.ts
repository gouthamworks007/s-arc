import { StyleSpecification } from "maplibre-gl";

export type MapMode = "satellite" | "standard";

export interface MapLayerConfig {
  satelliteTileUrl: string;
  satelliteAttribution: string;
  standardTileUrl: string;
  standardAttribution: string;
}

export const DEFAULT_MAP_CONFIG: MapLayerConfig = {
  satelliteTileUrl:
    process.env.NEXT_PUBLIC_SATELLITE_TILE_URL ||
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  satelliteAttribution:
    "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  standardTileUrl:
    process.env.NEXT_PUBLIC_STANDARD_TILE_URL ||
    "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
  standardAttribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
};

// Initial Kerala default focus (Kochi / Central Kerala)
export const KERALA_DEFAULT_CENTER: [number, number] = [76.3264, 9.9816];
export const KERALA_DEFAULT_ZOOM = 17;

/**
 * Builds a MapLibre Style Specification for raster satellite or standard tiles
 */
export function buildMapStyle(mode: MapMode): StyleSpecification {
  const isSat = mode === "satellite";
  const tileUrl = isSat
    ? DEFAULT_MAP_CONFIG.satelliteTileUrl
    : DEFAULT_MAP_CONFIG.standardTileUrl;
  const attribution = isSat
    ? DEFAULT_MAP_CONFIG.satelliteAttribution
    : DEFAULT_MAP_CONFIG.standardAttribution;

  return {
    version: 8,
    name: isSat ? "S-ARC Satellite Workspace" : "S-ARC Standard Map",
    sources: {
      "base-raster-tiles": {
        type: "raster",
        tiles: [tileUrl],
        tileSize: 256,
        attribution,
        maxzoom: 19,
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

