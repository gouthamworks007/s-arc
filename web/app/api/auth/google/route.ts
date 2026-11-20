import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const intent = searchParams.get("intent") || "login";
  const redirectTarget = searchParams.get("redirect") || "/dashboard";

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
  const callbackUrl = `${baseUrl}/api/auth/google/callback`;

  // Secure CSRF state parameter
  const stateId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `state_${Date.now()}`;
  const statePayload = JSON.stringify({
    state: stateId,
    intent,
    redirect: redirectTarget,
  });

  const stateCookieVal = Buffer.from(statePayload).toString("base64url");

  // Check if live Google credentials are provided
  const googleClientId = process.env.GOOGLE_CLIENT_ID;

  if (googleClientId && googleClientId.trim() !== "") {
    // Live Google OAuth 2.0 Authorization Endpoint
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", googleClientId.trim());
    googleAuthUrl.searchParams.set("redirect_uri", callbackUrl);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("state", stateCookieVal);
    googleAuthUrl.searchParams.set("prompt", "select_account");

    const response = NextResponse.redirect(googleAuthUrl.toString(), 302);
    response.cookies.set("sarc_google_oauth_state", stateCookieVal, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });
    return response;
  }

  // Fallback Development Mode: If GOOGLE_CLIENT_ID is not configured yet
  const devUrl = new URL(`${baseUrl}/login/google-dev`);
  devUrl.searchParams.set("intent", intent);
  devUrl.searchParams.set("redirect", redirectTarget);
  devUrl.searchParams.set("state", stateCookieVal);

  const response = NextResponse.redirect(devUrl.toString(), 302);
  response.cookies.set("sarc_google_oauth_state", stateCookieVal, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });
  return response;
}
