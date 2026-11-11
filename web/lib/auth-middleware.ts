import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, AUTH_COOKIE_NAME, TokenPayload } from "./jwt";
import { UserRole } from "./types";

export interface AuthContext {
  user: TokenPayload | null;
  errorResponse: NextResponse | null;
}

/**
 * Authenticates the incoming request via HTTP-only cookie or Bearer token header.
 */
export async function authenticateRequest(req: NextRequest): Promise<AuthContext> {
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

/**
 * Ensures the authenticated user holds one of the specified roles.
 */
export async function requireRole(
  req: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthContext> {
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

/**
 * Ensures the authenticated user holds administrator privileges.
 */
export async function requireAdmin(req: NextRequest): Promise<AuthContext> {
  return requireRole(req, ["admin"]);
}

/**
 * Ensures the user is either an Administrator or a Verified Architect with active status.
 * Unverified architects (pending Council of Architecture review) and regular homeowners are denied.
 */
export async function requireVerifiedArchitect(req: NextRequest): Promise<AuthContext> {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse) return { user: null, errorResponse };

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  // Administrators always have full publishing/management authority
  if (user.role === "admin") {
    return { user, errorResponse: null };
  }

  // Architects must have active (verified) status
  const isArchitect = user.subRole === "architect";
  const isVerified = user.status === "active";

  if (!isArchitect) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Only verified architectural studios and professionals can perform this action." },
        { status: 403 }
      ),
    };
  }

  if (!isVerified) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        {
          error: "Your Council of Architecture registration is currently under administrative review. Blueprint publishing will be enabled once verified.",
          status: user.status,
        },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}

/**
 * Ensures the authenticated user is either an administrator or the owner of the resource.
 */
export async function requireOwnershipOrAdmin(
  req: NextRequest,
  resourceOwnerId: string
): Promise<AuthContext> {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse) return { user: null, errorResponse };

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  const isOwner = user.id === resourceOwnerId;
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Forbidden. You do not have permission to modify or delete this resource." },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}
