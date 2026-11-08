import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";
import { d1 } from "@/lib/d1";
import { analyzePlotBoundary } from "@/lib/plot-measurements";

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) {
    return (
      errorResponse ||
      NextResponse.json({ error: "Authentication required to view saved plots." }, { status: 401 })
    );
  }

  try {
    let sql = `
      SELECT 
        id, 
        user_id, 
        name, 
        geojson, 
        area_cents, 
        area_sqft, 
        area_sqm, 
        perimeter_m, 
        perimeter_ft, 
        frontage_ft, 
        depth_ft, 
        road_side_index, 
        location_name, 
        center_lat, 
        center_lng, 
        metadata, 
        created_at, 
        updated_at 
      FROM saved_plots 
    `;
    const params: any[] = [];

    // Admins can see all plots; regular users only see their own
    if (user.role !== "admin") {
      sql += " WHERE user_id = ?";
      params.push(user.id);
    }

    sql += " ORDER BY created_at DESC";

    const rows = await d1.query(sql, params);
    return NextResponse.json({ plots: rows });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch saved plots.", details: err?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) {
    return (
      errorResponse ||
      NextResponse.json({ error: "Sign in to save your measured plot to your account." }, { status: 401 })
    );
  }

  try {
    const body = await req.json();
    const { name, coordinates, roadSideIndex, locationName, userInputs } = body;

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 3) {
      return NextResponse.json(
        { error: "At least 3 valid coordinate pairs are required." },
        { status: 400 }
      );
    }

    // Server-side recalculation and validation of geometry
    const analysis = analyzePlotBoundary(coordinates, roadSideIndex || 0, userInputs);
    if (!analysis) {
      return NextResponse.json(
        { error: "Invalid plot geometry. Boundary may be self-intersecting or coordinates are out of bounds." },
        { status: 400 }
      );
    }

    const plotId = `plot-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const plotName = String(name || "My Kerala Property").trim().slice(0, 80);
    const locName = String(locationName || "South India, Kerala").trim().slice(0, 120);
    const geojsonString = JSON.stringify(analysis.geojson);
    const metadataString = JSON.stringify({
      userInputs: userInputs || {},
      aspectRatio: analysis.aspectRatio,
      shapeCategory: analysis.shapeCategory,
      cornersCount: analysis.corners.length,
    });

    await d1.execute(
      `INSERT INTO saved_plots (
        id, 
        user_id, 
        name, 
        geojson, 
        area_cents, 
        area_sqft, 
        area_sqm, 
        perimeter_m, 
        perimeter_ft, 
        frontage_ft, 
        depth_ft, 
        road_side_index, 
        location_name, 
        center_lat, 
        center_lng, 
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        plotId,
        user.id,
        plotName,
        geojsonString,
        analysis.areaCents,
        analysis.areaSqFt,
        analysis.areaSqMeters,
        analysis.perimeterMeters,
        analysis.perimeterFeet,
        analysis.frontageFeet,
        analysis.depthFeet,
        analysis.roadFacingSegmentIndex,
        locName,
        analysis.center[1],
        analysis.center[0],
        metadataString,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        plot: {
          id: plotId,
          user_id: user.id,
          name: plotName,
          geojson: analysis.geojson,
          area_cents: analysis.areaCents,
          area_sqft: analysis.areaSqFt,
          area_sqm: analysis.areaSqMeters,
          perimeter_m: analysis.perimeterMeters,
          perimeter_ft: analysis.perimeterFeet,
          frontage_ft: analysis.frontageFeet,
          depth_ft: analysis.depthFeet,
          road_side_index: analysis.roadFacingSegmentIndex,
          location_name: locName,
          center_lat: analysis.center[1],
          center_lng: analysis.center[0],
          created_at: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to save plot record.", details: err?.message },
      { status: 500 }
    );
  }
}

