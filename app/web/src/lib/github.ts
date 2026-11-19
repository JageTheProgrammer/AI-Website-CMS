import "server-only";
import type { NextRequest } from "next/server";

const API_BASE = "https://api.github.com";

export class GithubApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "GithubApiError";
  }
}

export async function githubRequest<T>(
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/vnd.github+json");
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("X-GitHub-Api-Version", "2022-11-28");
  headers.set("User-Agent", "CMS-Website-Editor");
  if (init.body != null && !headers.has("content-type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  const body = await response.text();
  let parsed: unknown;
  try {
    parsed = body ? JSON.parse(body) : {};
  } catch {
    throw new GithubApiError(response.status, "GitHub returned an invalid response.");
  }
  if (!response.ok) {
    const message =
      typeof parsed === "object" &&
      parsed !== null &&
      "message" in parsed &&
      typeof parsed.message === "string"
        ? parsed.message
        : `GitHub request failed with status ${response.status}.`;
    throw new GithubApiError(response.status, message);
  }
  return parsed as T;
}

export function getGithubRedirectUri(origin: string): string {
  return process.env.GITHUB_OAUTH_REDIRECT_URI || `${origin}/api/github/callback`;
}

export function getCmsSessionCookie(request: NextRequest): string {
  const value = request.cookies.get("maatix.sid")?.value;
  return value ? `maatix.sid=${value}` : "";
}

export function safeReturnPath(value: string | null | undefined): string {
  if (
    !value ||
    value.length > 2048 ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return "/projects";
  }
  return value;
}
