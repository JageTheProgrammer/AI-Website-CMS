import { connection, NextRequest, NextResponse } from "next/server";
import { getCmsSessionCookie, GithubApiError, githubRequest } from "@/lib/github";
import { ApiError, request } from "@/lib/api/proxy";

const TOKEN_COOKIE = "cms_github_access_token";

type GithubUser = { login: string };
type GithubRepo = {
  full_name: string;
  private: boolean;
  default_branch: string | null;
  owner: { login: string };
  permissions?: { push?: boolean };
};

export async function GET(req: NextRequest) {
  await connection();
  try {
    const cookie = getCmsSessionCookie(req);
    await request("/api/auth/me", {
      method: "GET",
      headers: { cookie },
      forwardCookies: false,
    });
    const token = req.cookies.get(TOKEN_COOKIE)?.value;
    if (!token) return NextResponse.json({ data: { connected: false, repositories: [] } });

    const user = await githubRequest<GithubUser>(token, "/user");
    const repositories = await githubRequest<GithubRepo[]>(
      token,
      "/user/repos?per_page=100&sort=updated&affiliation=owner",
    );
    return NextResponse.json({
      data: {
        connected: true,
        repositories: repositories
          .filter((repo) => repo.owner.login.toLowerCase() === user.login.toLowerCase() && repo.permissions?.push)
          .map((repo) => ({
            fullName: repo.full_name,
            private: repo.private,
            defaultBranch: repo.default_branch ?? "main",
          })),
      },
    });
  } catch (error) {
    if (error instanceof ApiError || error instanceof GithubApiError) {
      return NextResponse.json(
        { error: { code: "GITHUB_UNAVAILABLE", message: error.message } },
        { status: error.status },
      );
    }
    console.error("[GitHub repositories] Request failed:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Could not load GitHub repositories." } },
      { status: 500 },
    );
  }
}
