import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserRole, UserSubRole } from "./types";

const TOKEN_COOKIE_NAME = "sarc_session_token";
const TOKEN_ISSUER = "s-arc-platform";
const TOKEN_AUDIENCE = "s-arc-users";

/**
 * Validates and retrieves the JWT secret key.
 * In production, fails loudly if JWT_SECRET is missing, empty, or using an insecure default.
 */
function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === "production";
  const insecureDefaults = [
    "s-arc-secure-production-jwt-key-2026-south-arch",
    "secret",
    "changeme",
    "development_secret",
  ];

  if (isProduction) {
    if (!secret || secret.trim().length < 32 || insecureDefaults.includes(secret.trim())) {
      throw new Error(
        "[SECURITY CRITICAL] A cryptographically strong JWT_SECRET (minimum 32 characters) must be configured in environment variables for production."
      );
    }
    return new TextEncoder().encode(secret.trim());
  }

  // Development / Test mode: provide standard dev key if unconfigured, with explicit warning
  if (!secret) {
    console.warn(
      "[SECURITY WARNING] JWT_SECRET is unset in development environment. Using development secret key."
    );
  }
  return new TextEncoder().encode(
    secret?.trim() || "s-arc-dev-secret-key-minimum-32-chars-for-hs256"
  );
}

export interface TokenPayload {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subRole?: UserSubRole;
  status: string;
  coaNumber?: string;
  studioName?: string;
  [key: string]: any;
}

/**
 * Signs and issues a cryptographically secure session JWT using HS256
 */
export async function createSessionToken(
  payload: TokenPayload,
  expiresIn: string = "7d"
): Promise<string> {
  const secretKey = getSecretKey();

  return await new SignJWT({
    id: payload.id,
    name: payload.name,
    email: payload.email.toLowerCase().trim(),
    role: payload.role,
    subRole: payload.subRole,
    status: payload.status,
    coaNumber: payload.coaNumber,
    studioName: payload.studioName,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(TOKEN_ISSUER)
    .setAudience(TOKEN_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);
}

/**
 * Verifies the JWT signature, expiration, issuer, and audience
 */
export async function verifySessionToken(token: string): Promise<TokenPayload | null> {
  if (!token || typeof token !== "string") return null;

  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });

    if (!payload || !payload.id || !payload.role) {
      return null;
    }

    return payload as unknown as TokenPayload;
  } catch (err) {
    // Expired or invalid signature
    return null;
  }
}

/**
 * Retrieves and validates the current session token from incoming cookies
 */
export async function getCurrentUserFromCookie(): Promise<TokenPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch (err) {
    return null;
  }
}

/**
 * Cookie options for setting authenticated session
 */
export function getSessionCookieConfig(token: string, rememberMe: boolean = true) {
  return {
    name: TOKEN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: rememberMe ? 60 * 60 * 24 * 7 : undefined, // 7 days or session
    path: "/",
  };
}

/**
 * Cookie options for clearing session on logout
 */
export function getClearCookieConfig() {
  return {
    name: TOKEN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  };
}

export const AUTH_COOKIE_NAME = TOKEN_COOKIE_NAME;
