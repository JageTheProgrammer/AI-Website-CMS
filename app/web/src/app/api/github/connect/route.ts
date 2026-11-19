import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getGithubRedirectUri, safeReturnPath } from "@/lib/github";

const STATE_COOKIE = "cms_github_oauth_state";
const RETURN_COOKIE = "cms_github_return_to";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/api/github",
    maxAge,
  };
}

export async function GET(request: NextRequest) {
  const returnTo = safeReturnPath(request.nextUrl.searchParams.get("returnTo"));
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId || !process.env.GITHUB_CLIENT_SECRET) {
    const url = new URL(returnTo, request.url);
    url.searchParams.set("github", "not-configured");
    return NextResponse.redirect(url);
  }

  const state = randomBytes(32).toString("hex");
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", getGithubRedirectUri(request.nextUrl.origin));
  authorize.searchParams.set("scope", "repo");
  authorize.searchParams.set("state", state);

  const response = NextResponse.redirect(authorize);
  response.cookies.set(STATE_COOKIE, state, cookieOptions(600));
  response.cookies.set(RETURN_COOKIE, returnTo, cookieOptions(600));
  return response;
}
