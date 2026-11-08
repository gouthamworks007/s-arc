import * as turf from "@turf/turf";
import {
  BoundarySegment,
  KeralaLandUnit,
  PlotAnalysisData,
  PlotCornerPoint,
} from "./types";

/**
 * Standard Kerala Land Measurement Constants
 * 1 Cent = 435.6 sq ft
 * 1 Cent = 40.468564224 sq metres
 * 1 Acre = 100 Cents = 43,560 sq ft
 * 1 Hectare = 247.105381 Cents = 10,000 sq metres
 */
export const SQM_PER_CENT = 40.468564224;
export const SQFT_PER_CENT = 435.6;
export const CENTS_PER_ACRE = 100.0;
export const CENTS_PER_HECTARE = 247.105381;
export const FEET_PER_METER = 3.28084;

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
}

/**
 * Validates a polygon coordinate array [ [lng, lat], ... ]
 */
export function validatePolygonCoordinates(
  coordinates: [number, number][]
): ValidationResult {
  if (!coordinates || coordinates.length < 3) {
    return {
      valid: false,
      error: "At least 3 corner points are required to form a property boundary.",
    };
  }

  // Check valid numbers
  for (let i = 0; i < coordinates.length; i++) {
    const [lng, lat] = coordinates[i];
    if (
      typeof lng !== "number" ||
      typeof lat !== "number" ||
      isNaN(lng) ||
      isNaN(lat) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return {
        valid: false,
        error: `Point #${i + 1} has invalid geographic coordinates.`,
      };
    }
  }

  // Check duplicate consecutive points
  for (let i = 0; i < coordinates.length; i++) {
    const nextIdx = (i + 1) % coordinates.length;
    const [lng1, lat1] = coordinates[i];
    const [lng2, lat2] = coordinates[nextIdx];
    if (Math.abs(lng1 - lng2) < 1e-7 && Math.abs(lat1 - lat2) < 1e-7) {
      if (coordinates.length <= 3) {
        return {
          valid: false,
          error: "Plot boundary contains identical overlapping corner points.",
        };
      }
    }
  }

  // Create closed ring for Turf GeoJSON
  const closedRing = [...coordinates];
  const first = closedRing[0];
  const last = closedRing[closedRing.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    closedRing.push([first[0], first[1]]);
  }

  try {
    const poly = turf.polygon([closedRing]);
    // Self-intersection check using turf.kinks
    const kinks = turf.kinks(poly);
    if (kinks.features.length > 0) {
      return {
        valid: false,
        error: "Boundary lines intersect each other. Please adjust corner handles to form a clean perimeter.",
      };
    }

    const areaSqm = turf.area(poly);
    const areaCents = areaSqm / SQM_PER_CENT;

    if (areaCents < 0.2) {
      return {
        valid: false,
        error: "Marked area is too small for residential planning (< 0.2 Cents). Zoom in further to mark property corners.",
      };
    }

    if (areaCents > 500) {
      return {
        valid: true,
        warning: "Marked area exceeds 500 Cents (5 Acres). Residential architectural plans are calibrated for sub-50 cent parcels.",
      };
    }

    return { valid: true };
  } catch (err: any) {
    return {
      valid: false,
      error: err?.message || "Invalid geometry. Please check marked boundary points.",
    };
  }
}

/**
 * Computes full geospatial measurements and plot analysis from boundary points
 */
export function analyzePlotBoundary(
  coordinates: [number, number][],
  roadFacingIndex = 0,
  userInputs?: PlotAnalysisData["userInputs"]
): PlotAnalysisData | null {
  const validation = validatePolygonCoordinates(coordinates);
  if (!validation.valid) return null;

  // Closed ring
  const closedCoords: [number, number][] = [...coordinates];
  const first = closedCoords[0];
  const last = closedCoords[closedCoords.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    closedCoords.push([first[0], first[1]]);
  }

  const poly = turf.polygon([closedCoords]);
  const areaSqMeters = turf.area(poly);
  const areaCents = areaSqMeters / SQM_PER_CENT;
  const areaSqFt = areaCents * SQFT_PER_CENT;
  const areaAcres = areaCents / CENTS_PER_ACRE;
  const areaHectares = areaCents / CENTS_PER_HECTARE;

  // Bounding box [minX, minY, maxX, maxY]
  const bbox = turf.bbox(poly) as [number, number, number, number];
  const centerPoint = turf.center(poly).geometry.coordinates as [number, number];

  // Calculate perimeter and segment lengths
  const segments: BoundarySegment[] = [];
  const corners: PlotCornerPoint[] = [];
  let totalPerimeterMeters = 0;

  for (let i = 0; i < coordinates.length; i++) {
    corners.push({
      index: i,
      label: `P${i + 1}`,
      coordinates: coordinates[i],
    });

    const nextIdx = (i + 1) % coordinates.length;
    const from = coordinates[i];
    const to = coordinates[nextIdx];

    const fromPt = turf.point(from);
    const toPt = turf.point(to);
    const distanceKm = turf.distance(fromPt, toPt, { units: "kilometers" });
    const distanceMeters = distanceKm * 1000;
    const distanceFeet = distanceMeters * FEET_PER_METER;
    const bearing = turf.bearing(fromPt, toPt);

    totalPerimeterMeters += distanceMeters;

    const charCode = 65 + (i % 26);
    const sideSuffix = i >= 26 ? Math.floor(i / 26) : "";
    const label = `Side ${String.fromCharCode(charCode)}${sideSuffix}`;

    segments.push({
      index: i,
      label,
      lengthMeters: distanceMeters,
      lengthFeet: distanceFeet,
      startPoint: from,
      endPoint: to,
      bearingDeg: bearing,
    });
  }

  const perimeterFeet = totalPerimeterMeters * FEET_PER_METER;

  // Safe road facing segment index
  const safeRoadIdx =
    roadFacingIndex >= 0 && roadFacingIndex < segments.length
      ? roadFacingIndex
      : 0;

  const roadSegment = segments[safeRoadIdx];
  const frontageFeet = roadSegment ? roadSegment.lengthFeet : Math.sqrt(areaSqFt);

  // Depth approximation: based on average perpendicular dimension or Area / Frontage
  let depthFeet = frontageFeet > 0 ? areaSqFt / frontageFeet : Math.sqrt(areaSqFt);

  // Bound depth against bbox extent
  const latDistKm = turf.distance(
    turf.point([bbox[0], bbox[1]]),
    turf.point([bbox[0], bbox[3]]),
    { units: "kilometers" }
  );
  const lngDistKm = turf.distance(
    turf.point([bbox[0], bbox[1]]),
    turf.point([bbox[2], bbox[1]]),
    { units: "kilometers" }
  );
  const maxBboxFeet = Math.max(latDistKm, lngDistKm) * 1000 * FEET_PER_METER;
  if (depthFeet > maxBboxFeet * 1.5) {
    depthFeet = maxBboxFeet * 0.9;
  }

  const aspectRatio = frontageFeet > 0 ? depthFeet / frontageFeet : 1.0;

  // Determine shape category
  let shapeCategory: PlotAnalysisData["shapeCategory"] = "regular";
  if (coordinates.length > 4) {
    shapeCategory = "irregular";
  } else if (aspectRatio > 2.2 || aspectRatio < 0.45) {
    shapeCategory = "narrow";
  }

  return {
    geojson: poly,
    areaSqMeters,
    areaSqFt,
    areaCents,
    areaAcres,
    areaHectares,
    perimeterMeters: totalPerimeterMeters,
    perimeterFeet,
    segments,
    corners,
    roadFacingSegmentIndex: safeRoadIdx,
    frontageFeet,
    depthFeet,
    aspectRatio,
    shapeCategory,
    center: centerPoint,
    boundingBox: bbox,
    userInputs,
  };
}

/**
 * Format any area into chosen Kerala or international unit
 */
export function formatArea(cents: number, unit: KeralaLandUnit): string {
  switch (unit) {
    case "cent":
      return `${cents.toFixed(2)} Cents`;
    case "sqft":
      return `${(cents * SQFT_PER_CENT).toLocaleString("en-IN", {
        maximumFractionDigits: 1,
      })} sq ft`;
    case "sqm":
      return `${(cents * SQM_PER_CENT).toLocaleString("en-IN", {
        maximumFractionDigits: 1,
      })} m²`;
    case "acre":
      return `${(cents / CENTS_PER_ACRE).toFixed(4)} Acres`;
    case "hectare":
      return `${(cents / CENTS_PER_HECTARE).toFixed(4)} Ha`;
    default:
      return `${cents.toFixed(2)} Cents`;
  }
}

/**
 * Returns formatted breakdown of all unit conversions
 */
export function getUnitBreakdown(cents: number) {
  return {
    cents: `${cents.toFixed(2)} Cents`,
    sqft: `${(cents * SQFT_PER_CENT).toLocaleString("en-IN", {
      maximumFractionDigits: 1,
    })} sq ft`,
    sqm: `${(cents * SQM_PER_CENT).toLocaleString("en-IN", {
      maximumFractionDigits: 1,
    })} m²`,
    acres: `${(cents / CENTS_PER_ACRE).toFixed(4)} Acres`,
    hectares: `${(cents / CENTS_PER_HECTARE).toFixed(4)} Hectares`,
  };
}

