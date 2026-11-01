import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-middleware";

let PLATFORM_SETTINGS = {
  platformCommissionPercent: 10,
  autoApproveVerifiedArchitects: false,
  maintenanceMode: false,
  minListingPrice: 25000,
  payoutEscrowHoldDays: 7,
};

export async function GET(req: NextRequest) {
  return NextResponse.json({ settings: PLATFORM_SETTINGS });
}

export async function PUT(req: NextRequest) {
  const { user, errorResponse } = await requireRole(req, ["super_admin"]);
  if (errorResponse) return errorResponse;

  const body = await req.json();
  PLATFORM_SETTINGS = {
    ...PLATFORM_SETTINGS,
    ...body,
  };

  return NextResponse.json({
    success: true,
    message: "Platform settings updated by Super Admin",
    settings: PLATFORM_SETTINGS,
  });
}
