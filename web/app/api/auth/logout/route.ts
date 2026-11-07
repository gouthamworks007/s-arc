import { NextResponse } from "next/server";
import { getClearCookieConfig } from "@/lib/jwt";

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: "Logged out successfully" },
    { status: 200 }
  );

  response.cookies.set(getClearCookieConfig());
  return response;
}
