import {
  ArchitecturalProject,
  CompatibilityCheckItem,
  PlanCompatibilityResult,
  PlotAnalysisData,
} from "./types";

/**
 * Parse setbacks string e.g. "Front 15ft, Rear 10ft, Sides 5ft"
 */
export function parseSetbacks(setbackStr?: string): {
  frontFt: number;
  rearFt: number;
  sidesFt: number;
} {
  const result = { frontFt: 12, rearFt: 8, sidesFt: 5 };
  if (!setbackStr) return result;

  const frontMatch = setbackStr.match(/front\s*(\d+(\.\d+)?)/i);
  if (frontMatch) result.frontFt = parseFloat(frontMatch[1]);

  const rearMatch = setbackStr.match(/rear\s*(\d+(\.\d+)?)/i);
  if (rearMatch) result.rearFt = parseFloat(rearMatch[1]);

  const sidesMatch = setbackStr.match(/side(s)?\s*(\d+(\.\d+)?)/i);
  if (sidesMatch) result.sidesFt = parseFloat(sidesMatch[1]);

  return result;
}

/**
 * Rule-based evaluation comparing a measured property against an architectural plan.
 */
export function evaluatePlanCompatibility(
  plot: PlotAnalysisData,
  project: ArchitecturalProject
): PlanCompatibilityResult {
  const checklist: CompatibilityCheckItem[] = [];

  const requiredAreaCents = project.minimumPlotAreaCent ?? project.cents * 0.85;
  const requiredFrontageFt = project.minimumFrontageFt ?? 35;
  const requiredDepthFt = project.minimumDepthFt ?? 55;
  const setbacks = parseSetbacks(project.dimensions?.setbacks);

  // Approximate building footprint
  const buildingFootprintSqFt =
    project.buildingFootprintSqft ??
    (project.builtUpAreaSqft ? project.builtUpAreaSqft / (project.floors || 2) : 1200);

  // Calculate buildable envelope dimensions after deducting setbacks
  const buildableWidthFt = Math.max(0, plot.frontageFeet - setbacks.sidesFt * 2);
  const buildableLengthFt = Math.max(
    0,
    plot.depthFeet - setbacks.frontFt - setbacks.rearFt
  );
  const buildableEnvelopeAreaSqFt = buildableWidthFt * buildableLengthFt;

  // 1. Plot Area Check
  const areaRatio = plot.areaCents / requiredAreaCents;
  let areaScore = 0;
  let areaFits = false;

  if (plot.areaCents >= requiredAreaCents) {
    areaFits = true;
    if (areaRatio <= 1.8) {
      areaScore = 30; // Optimal match
      checklist.push({
        id: "area",
        label: "Plot Area Requirement",
        status: "pass",
        detail: `Plot area of ${plot.areaCents.toFixed(1)} Cents comfortably satisfies the minimum ${requiredAreaCents} Cents design specification.`,
      });
    } else {
      areaScore = 26; // Abundant land, perfect for expansive garden/courtyard
      checklist.push({
        id: "area",
        label: "Plot Area Requirement",
        status: "pass",
        detail: `Plot (${plot.areaCents.toFixed(1)} Cents) exceeds design minimum (${requiredAreaCents} Cents), allowing expansive landscaping and courtyards.`,
      });
    }
  } else if (plot.areaCents >= requiredAreaCents * 0.85) {
    areaScore = 15;
    checklist.push({
      id: "area",
      label: "Plot Area Requirement",
      status: "warn",
      detail: `Plot area (${plot.areaCents.toFixed(1)} Cents) is slightly below recommended ${requiredAreaCents} Cents. Architect modification may be needed.`,
    });
  } else {
    areaScore = 0;
    checklist.push({
      id: "area",
      label: "Plot Area Requirement",
      status: "fail",
      detail: `Plot area (${plot.areaCents.toFixed(1)} Cents) is significantly below the minimum required ${requiredAreaCents} Cents.`,
    });
  }

  // 2. Frontage Check
  let frontageScore = 0;
  let frontageFits = false;

  if (plot.frontageFeet >= requiredFrontageFt) {
    frontageFits = true;
    frontageScore = 20;
    checklist.push({
      id: "frontage",
      label: "Road Frontage",
      status: "pass",
      detail: `Frontage width of ${plot.frontageFeet.toFixed(0)} ft exceeds the required ${requiredFrontageFt} ft for facade expression and vehicular entry.`,
    });
  } else if (plot.frontageFeet >= requiredFrontageFt * 0.85) {
    frontageScore = 10;
    checklist.push({
      id: "frontage",
      label: "Road Frontage",
      status: "warn",
      detail: `Frontage of ${plot.frontageFeet.toFixed(0)} ft is narrow compared to the ${requiredFrontageFt} ft layout standard. Car porch placement may require adjustment.`,
    });
  } else {
    frontageScore = 0;
    checklist.push({
      id: "frontage",
      label: "Road Frontage",
      status: "fail",
      detail: `Frontage (${plot.frontageFeet.toFixed(0)} ft) fails the minimum ${requiredFrontageFt} ft requirement.`,
    });
  }

  // 3. Depth Check
  let depthScore = 0;
  let depthFits = false;

  if (plot.depthFeet >= requiredDepthFt) {
    depthFits = true;
    depthScore = 15;
    checklist.push({
      id: "depth",
      label: "Plot Depth",
      status: "pass",
      detail: `Plot depth of ${plot.depthFeet.toFixed(0)} ft satisfies the longitudinal setback and garden requirements (${requiredDepthFt} ft required).`,
    });
  } else if (plot.depthFeet >= requiredDepthFt * 0.85) {
    depthScore = 8;
    checklist.push({
      id: "depth",
      label: "Plot Depth",
      status: "warn",
      detail: `Plot depth (${plot.depthFeet.toFixed(0)} ft) is compact. Rear garden or utility setback may need optimization.`,
    });
  } else {
    depthScore = 0;
    checklist.push({
      id: "depth",
      label: "Plot Depth",
      status: "fail",
      detail: `Plot depth (${plot.depthFeet.toFixed(0)} ft) is insufficient for the ${requiredDepthFt} ft design layout.`,
    });
  }

  // 4. Buildable Footprint Envelope & Setbacks
  let footprintScore = 0;
  let footprintFits = false;

  if (buildableEnvelopeAreaSqFt >= buildingFootprintSqFt * 1.05 && buildableWidthFt >= 20 && buildableLengthFt >= 25) {
    footprintFits = true;
    footprintScore = 20;
    checklist.push({
      id: "footprint",
      label: "Building Footprint & Setbacks",
      status: "pass",
      detail: `Buildable envelope of ${buildableEnvelopeAreaSqFt.toFixed(0)} sq ft cleanly accommodates the ground footprint (${buildingFootprintSqFt.toFixed(0)} sq ft) with statutory KMBR setbacks.`,
    });
  } else if (buildableEnvelopeAreaSqFt >= buildingFootprintSqFt * 0.9 && buildableWidthFt >= 18) {
    footprintScore = 10;
    checklist.push({
      id: "footprint",
      label: "Building Footprint & Setbacks",
      status: "warn",
      detail: `Buildable envelope (${buildableEnvelopeAreaSqFt.toFixed(0)} sq ft) is tight for the ${buildingFootprintSqFt.toFixed(0)} sq ft footprint. Cantilever or floor-distribution modifications needed.`,
    });
  } else {
    footprintScore = 0;
    checklist.push({
      id: "footprint",
      label: "Building Footprint & Setbacks",
      status: "fail",
      detail: `Plot envelope after required setbacks cannot fit the ground floor footprint (${buildingFootprintSqFt.toFixed(0)} sq ft).`,
    });
  }

  // 5. Geometry & Shape Feasibility
  let geometryScore = 0;
  if (plot.shapeCategory === "regular") {
    geometryScore = 10;
    checklist.push({
      id: "geometry",
      label: "Plot Geometry & Regularity",
      status: "pass",
      detail: "Clean orthogonal geometry allows direct implementation with minimal structural modifications.",
    });
  } else if (plot.shapeCategory === "narrow") {
    geometryScore = 5;
    checklist.push({
      id: "geometry",
      label: "Plot Geometry & Regularity",
      status: "warn",
      detail: "Narrow plot aspect ratio requires verified internal courtyard or vertical lighting shaft layout.",
    });
  } else {
    // Irregular
    geometryScore = 6;
    checklist.push({
      id: "geometry",
      label: "Plot Geometry & Regularity",
      status: "warn",
      detail: "Irregular boundary angles will require architect site-adaptation for compound walls and corner setbacks.",
    });
  }

  // 6. User Preferences (Road Access, Bedrooms, Parking)
  let userPrefScore = 5;
  if (plot.userInputs) {
    const { roadAccessWidthFt, preferredBedrooms, parkingCount, preferredStyle } = plot.userInputs;

    if (roadAccessWidthFt !== undefined && roadAccessWidthFt > 0) {
      const requiredRoad = project.requiredAccessWidthFt || 12;
      if (roadAccessWidthFt >= requiredRoad) {
        checklist.push({
          id: "road_access",
          label: "Road Access Width",
          status: "pass",
          detail: `Road access of ${roadAccessWidthFt} ft satisfies the minimum ${requiredRoad} ft access road required for emergency and construction access.`,
        });
      } else {
        userPrefScore -= 3;
        checklist.push({
          id: "road_access",
          label: "Road Access Width",
          status: "warn",
          detail: `Road width (${roadAccessWidthFt} ft) is below the recommended ${requiredRoad} ft for heavy construction transport.`,
        });
      }
    }

    if (preferredBedrooms !== undefined && preferredBedrooms > 0) {
      if (project.bedrooms === preferredBedrooms) {
        checklist.push({
          id: "bedrooms",
          label: "Bedroom Preference",
          status: "pass",
          detail: `Matches your requested ${preferredBedrooms} BHK configuration.`,
        });
      } else {
        checklist.push({
          id: "bedrooms",
          label: "Bedroom Preference",
          status: "warn",
          detail: `Design provides ${project.bedrooms} bedrooms (you specified ${preferredBedrooms}).`,
        });
      }
    }

    if (parkingCount !== undefined && parkingCount > 0) {
      const planParking = project.requiredParking || 1;
      if (planParking >= parkingCount) {
        checklist.push({
          id: "parking",
          label: "Vehicular Parking",
          status: "pass",
          detail: `Accommodates ${planParking} car park bays as requested.`,
        });
      } else {
        checklist.push({
          id: "parking",
          label: "Vehicular Parking",
          status: "warn",
          detail: `Design accommodates ${planParking} parking bay (you requested ${parkingCount}). Open parking adaptation possible.`,
        });
      }
    }

    if (preferredStyle && preferredStyle !== "All") {
      if (project.style.toLowerCase().includes(preferredStyle.toLowerCase())) {
        checklist.push({
          id: "style",
          label: "Architectural Style Match",
          status: "pass",
          detail: `Matches your preferred style (${project.style}).`,
        });
      }
    }
  }

  // Calculate raw score (max 100)
  let rawScore = areaScore + frontageScore + depthScore + footprintScore + geometryScore + Math.max(0, userPrefScore);

  // Hard constraints override: If mandatory requirements fail, score is capped
  if (!areaFits && areaRatio < 0.7) {
    rawScore = Math.min(rawScore, 35);
  }
  if (!frontageFits && plot.frontageFeet < requiredFrontageFt * 0.7) {
    rawScore = Math.min(rawScore, 40);
  }
  if (!footprintFits && buildableEnvelopeAreaSqFt < buildingFootprintSqFt * 0.75) {
    rawScore = Math.min(rawScore, 42);
  }

  // Determine Category
  let category: PlanCompatibilityResult["category"] = "not_suitable";
  if (rawScore >= 75 && areaFits && frontageFits && footprintFits) {
    category = "good";
  } else if (rawScore >= 50 && (areaFits || plot.areaCents >= requiredAreaCents * 0.8)) {
    category = "possible";
  } else {
    category = "not_suitable";
  }

  return {
    project,
    category,
    score: Math.min(100, Math.max(10, Math.round(rawScore))),
    checklist,
    areaRatio,
    footprintFits,
    frontageFits,
    depthFits,
    requiredSetbacks: setbacks,
    buildableEnvelope: {
      widthFt: buildableWidthFt,
      lengthFt: buildableLengthFt,
      areaSqFt: buildableEnvelopeAreaSqFt,
    },
  };
}

/**
 * Ranks all available architectural projects against the measured plot
 */
export function matchArchitecturalPlans(
  plot: PlotAnalysisData,
  projects: ArchitecturalProject[]
): PlanCompatibilityResult[] {
  const results = projects.map((p) => evaluatePlanCompatibility(plot, p));

  // Sort by score descending
  results.sort((a, b) => {
    // Green > Yellow > Red first
    const catWeight = { good: 3, possible: 2, not_suitable: 1 };
    if (catWeight[a.category] !== catWeight[b.category]) {
      return catWeight[b.category] - catWeight[a.category];
    }
    return b.score - a.score;
  });

  return results;
}

