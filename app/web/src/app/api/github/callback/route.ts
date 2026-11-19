import { NextRequest, NextResponse } from "next/server";
import { getGithubRedirectUri, safeReturnPath } from "@/lib/github";

const STATE_COOKIE = "cms_github_oauth_state";
const RETURN_COOKIE = "cms_github_return_to";
const TOKEN_COOKIE = "cms_github_access_token";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/api/github",
    maxAge,
  };
}

function returnRedirect(request: NextRequest, returnTo: string, status: string) {
  const url = new URL(returnTo, request.url);
  url.searchParams.set("github", status);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const returnTo = safeReturnPath(request.cookies.get(RETURN_COOKIE)?.value);
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;
  const state = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!expectedState || !state || state !== expectedState || !code || !clientId || !clientSecret) {
    const response = returnRedirect(
      request,
      returnTo,
      !clientId || !clientSecret ? "not-configured" : "connection-failed",
    );
    response.cookies.set(STATE_COOKIE, "", cookieOptions(0));
    response.cookies.set(RETURN_COOKIE, "", cookieOptions(0));
    return response;
  }

  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: getGithubRedirectUri(request.nextUrl.origin),
        state,
      }),
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json();
    if (!tokenResponse.ok || typeof tokenBody.access_token !== "string") {
      throw new Error("GitHub did not return an access token.");
    }

    const response = returnRedirect(request, returnTo, "connected");
    response.cookies.set(TOKEN_COOKIE, tokenBody.access_token, cookieOptions(60 * 60 * 24 * 30));
    response.cookies.set(STATE_COOKIE, "", cookieOptions(0));
    response.cookies.set(RETURN_COOKIE, "", cookieOptions(0));
    return response;
  } catch (error) {
    console.error("[GitHub OAuth] Token exchange failed:", error);
    const response = returnRedirect(request, returnTo, "connection-failed");
    response.cookies.set(STATE_COOKIE, "", cookieOptions(0));
    response.cookies.set(RETURN_COOKIE, "", cookieOptions(0));
    return response;
  }
}
