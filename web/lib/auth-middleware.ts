import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, AUTH_COOKIE_NAME, TokenPayload } from "./jwt";
import { UserRole } from "./types";

export async function authenticateRequest(
  req: NextRequest
): Promise<{ user: TokenPayload | null; errorResponse: NextResponse | null }> {
  let token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Authentication required. Please sign in." },
        { status: 401 }
      ),
    };
  }

  const user = await verifySessionToken(token);
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Invalid or expired session. Please re-authenticate." },
        { status: 401 }
      ),
    };
  }

  return { user, errorResponse: null };
}

export async function requireRole(
  req: NextRequest,
  allowedRoles: UserRole[]
): Promise<{ user: TokenPayload | null; errorResponse: NextResponse | null }> {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse) return { user: null, errorResponse };

  if (!user || !allowedRoles.includes(user.role)) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        {
          error: `Forbidden. Access requires one of the following roles: [${allowedRoles.join(", ")}]`,
          userRole: user?.role,
        },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}

