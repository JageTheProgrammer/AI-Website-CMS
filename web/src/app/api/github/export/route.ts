import { NextRequest, NextResponse } from "next/server";
import { getCmsSessionCookie, GithubApiError, githubRequest } from "@/lib/github";
import { ApiError, request } from "@/lib/api/proxy";

const TOKEN_COOKIE = "cms_github_access_token";

type GithubUser = { login: string };
type GithubRepo = {
  full_name: string;
  default_branch: string | null;
  owner: { login: string };
  permissions?: { push?: boolean };
};
type GithubRef = { object: { sha: string } };
type GithubCommit = { tree: { sha: string } };
type GithubBlob = { sha: string };
type GithubCreatedCommit = { sha: string; html_url: string };

function encodeBranch(branch: string): string {
  return branch.split("/").map(encodeURIComponent).join("/");
}

function validExportPath(path: string): boolean {
  return (
    path.length > 0 &&
    !path.startsWith("/") &&
    path.split("/").every((part) => part !== "" && part !== "." && part !== "..") &&
    /^[A-Za-z0-9._/-]+$/.test(path)
  );
}

export async function POST(req: NextRequest) {
  try {
    if (req.headers.get("origin") !== req.nextUrl.origin) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Cross-origin GitHub exports are not allowed." } },
        { status: 403 },
      );
    }
    const cookie = getCmsSessionCookie(req);
    await request("/api/auth/me", {
      method: "GET",
      headers: { cookie },
      forwardCookies: false,
    });
    const token = req.cookies.get(TOKEN_COOKIE)?.value;
    if (!token) {
      return NextResponse.json(
        { error: { code: "GITHUB_NOT_CONNECTED", message: "Connect a GitHub account before exporting." } },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => null);
    const projectSlug = typeof body?.projectSlug === "string" ? body.projectSlug : "";
    const repository = typeof body?.repository === "string" ? body.repository : "";
    const [owner, repoName, ...extra] = repository.split("/");
    if (!projectSlug || !/^[A-Za-z0-9-]{1,100}$/.test(projectSlug) || !owner || !repoName || extra.length) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "A valid project and repository are required." } },
        { status: 400 },
      );
    }

    const user = await githubRequest<GithubUser>(token, "/user");
    if (owner.toLowerCase() !== user.login.toLowerCase()) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Export is limited to repositories owned by your connected GitHub account." } },
        { status: 403 },
      );
    }

    const [repositoryInfo, projectExport] = await Promise.all([
      githubRequest<GithubRepo>(token, `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}`),
      request<{ versionNumber: number; files: Record<string, string> }>(
        `/api/documents/${encodeURIComponent(projectSlug)}/export`,
        {
          method: "GET",
          headers: { cookie },
          forwardCookies: false,
        },
      ),
    ]);
    if (repositoryInfo.owner.login.toLowerCase() !== user.login.toLowerCase() || !repositoryInfo.permissions?.push) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "You do not have write access to this owned repository." } },
        { status: 403 },
      );
    }

    const files = projectExport.data?.files;
    const versionNumber = projectExport.data?.versionNumber;
    if (!files || typeof files !== "object" || !Number.isSafeInteger(versionNumber)) {
      throw new Error("The project export API returned invalid files.");
    }
    const entries = Object.entries(files);
    if (!entries.length || entries.some(([path, content]) => !validExportPath(path) || typeof content !== "string")) {
      throw new Error("The project export contains an invalid file path or content.");
    }
    const branch = repositoryInfo.default_branch || "main";

    let baseTree: string | undefined;
    let parentSha: string | undefined;
    try {
      const ref = await githubRequest<GithubRef>(
        token,
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/git/ref/heads/${encodeBranch(branch)}`,
      );
      parentSha = ref.object.sha;
      const commit = await githubRequest<GithubCommit>(
        token,
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/git/commits/${parentSha}`,
      );
      baseTree = commit.tree.sha;
    } catch (error) {
      if (!(error instanceof GithubApiError) || error.status !== 404) throw error;
    }

    const blobs = await Promise.all(
      entries.map(async ([path, content]) => ({
        path,
        sha: (await githubRequest<GithubBlob>(
          token,
          `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/git/blobs`,
          { method: "POST", body: JSON.stringify({ content, encoding: "utf-8" }) },
        )).sha,
      })),
    );
    const tree = await githubRequest<{ sha: string }>(
      token,
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/git/trees`,
      {
        method: "POST",
        body: JSON.stringify({
          ...(baseTree ? { base_tree: baseTree } : {}),
          tree: blobs.map(({ path, sha }) => ({ path, mode: "100644", type: "blob", sha })),
        }),
      },
    );
    const commit = await githubRequest<GithubCreatedCommit>(
      token,
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/git/commits`,
      {
        method: "POST",
        body: JSON.stringify({
          message: `Export ${projectSlug} from CMS (version ${versionNumber})`,
          tree: tree.sha,
          ...(parentSha ? { parents: [parentSha] } : {}),
        }),
      },
    );

    const refPath = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/git/refs`;
    if (parentSha) {
      await githubRequest(token, `${refPath}/heads/${encodeBranch(branch)}`, {
        method: "PATCH",
        body: JSON.stringify({ sha: commit.sha, force: false }),
      });
    } else {
      await githubRequest(token, refPath, {
        method: "POST",
        body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commit.sha }),
      });
    }

    return NextResponse.json({
      data: { commitSha: commit.sha, commitUrl: commit.html_url, versionNumber },
    });
  } catch (error) {
    if (error instanceof ApiError || error instanceof GithubApiError) {
      return NextResponse.json(
        { error: { code: "EXPORT_FAILED", message: error.message } },
        { status: error.status },
      );
    }
    console.error("[GitHub export] Request failed:", error);
    return NextResponse.json(
      { error: { code: "EXPORT_FAILED", message: error instanceof Error ? error.message : "Could not export the project." } },
      { status: 500 },
    );
  }
}
