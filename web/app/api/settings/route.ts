import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-middleware";
import { d1 } from "@/lib/d1";

let PLATFORM_SETTINGS = {
  platformCommissionPercent: 10,
  autoApproveVerifiedArchitects: false,
  maintenanceMode: false,
  minListingPrice: 25000,
  payoutEscrowHoldDays: 7,
};

export async function GET(req: NextRequest) {
  try {
    const rows = await d1.query("SELECT key, value FROM platform_settings");
    if (rows && rows.length > 0) {
      const dynamicSettings: Record<string, any> = { ...PLATFORM_SETTINGS };
      for (const row of rows) {
        try {
          dynamicSettings[row.key] = JSON.parse(row.value);
        } catch {
          dynamicSettings[row.key] = row.value;
        }
      }
      return NextResponse.json({ settings: dynamicSettings });
    }
  } catch (e) {
    // fallback
  }
  return NextResponse.json({ settings: PLATFORM_SETTINGS });
}

export async function PUT(req: NextRequest) {
  const { user, errorResponse } = await requireRole(req, ["admin"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    PLATFORM_SETTINGS = {
      ...PLATFORM_SETTINGS,
      ...body,
    };

    for (const [key, value] of Object.entries(body)) {
      await d1.execute(
        "INSERT OR REPLACE INTO platform_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))",
        [key, typeof value === "object" ? JSON.stringify(value) : String(value)]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Platform settings updated in Cloudflare D1 by Admin",
      settings: PLATFORM_SETTINGS,
    });
  } catch (err: any) {
    console.error("D1 settings update error:", err);
    return NextResponse.json({ error: "Failed to update platform settings in Cloudflare D1" }, { status: 500 });
  }
}
