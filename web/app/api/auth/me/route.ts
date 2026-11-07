import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, AUTH_COOKIE_NAME } from "@/lib/jwt";
import { d1 } from "@/lib/d1";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    }

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    // Refresh user state against database
    const dbUser = await d1.first("SELECT * FROM users WHERE id = ? LIMIT 1", [payload.id]);
    if (dbUser) {
      if (dbUser.status === "suspended") {
        return NextResponse.json(
          { authenticated: false, error: "Account suspended", user: null },
          { status: 403 }
        );
      }

      return NextResponse.json({
        authenticated: true,
        user: {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role === "super_admin" ? "admin" : dbUser.role,
          subRole: dbUser.sub_role || undefined,
          status: dbUser.status,
          avatar: dbUser.avatar,
          phone: dbUser.phone,
          location: dbUser.location,
          studioName: dbUser.studio_name,
          coaNumber: dbUser.coa_number,
        },
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: payload,
    });
  } catch (err) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
