import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserAccount, UserRole, UserSubRole } from "./types";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "s-arc-secure-production-jwt-key-2026-south-arch"
);

const TOKEN_COOKIE_NAME = "sarc_session_token";

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

export async function createSessionToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as TokenPayload;
  } catch (err) {
    return null;
  }
}

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

export function getSessionCookieConfig(token: string) {
  return {
    name: TOKEN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  };
}

export const AUTH_COOKIE_NAME = TOKEN_COOKIE_NAME;
