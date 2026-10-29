/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Monitor,
  Smartphone,
  Tablet,
  Wand2,
  Code,
  Eye,
  History,
  ArrowLeft,
  RotateCcw,
  Download,
  Copy,
  Check,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  GitBranch,
  Sparkles,
  ShieldCheck,
  Globe,
  LoaderCircle,
  AlertCircle,
  Clock3,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DocumentEditor from "@/components/editor/document-editor";
import { cn } from "@/lib/utils/cn";

type ProjectVersion = {
  id: number;
  version_number: number;
  source_prompt: string | null;
  status: string;
  created_at: string;
};

type PreviewData = {
  projectId: number;
  projectName: string;
  projectSlug: string;
  versionId: number;
  versionNumber: number;
  html: string;
  prompt?: string | null;
  createdAt?: string;
};

type Viewport = "desktop" | "tablet" | "mobile";
type EditorTab = "design" | "preview" | "code" | "review" | "history";

type ReviewFile = { path: string; passed: number; issues: string[] };
type GithubRepository = {
  fullName: string;
  private: boolean;
  defaultBranch: string;
};

const HTML_TOKENS = /<!--[\s\S]*?-->|<!doctype[^>]*>|<\/?[a-zA-Z][^>]*>|[^<]+/gi;
const VOID_HTML_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function formatHtmlForDisplay(html: string): string {
  const tokens = html.match(HTML_TOKENS) ?? [];
  const lines: string[] = [];
  let depth = 0;

  for (const rawToken of tokens) {
    const token = rawToken.trim();
    if (!token) continue;

    if (token.startsWith("</")) {
      depth = Math.max(0, depth - 1);
      lines.push(`${"  ".repeat(depth)}${token}`);
      continue;
    }

    if (token.startsWith("<")) {
      lines.push(`${"  ".repeat(depth)}${token}`);
      const tagName = token.match(/^<([a-zA-Z][\w:-]*)/)?.[1]?.toLowerCase();
      if (
        tagName &&
        !VOID_HTML_TAGS.has(tagName) &&
        !token.endsWith("/>")
      ) {
        depth += 1;
      }
      continue;
    }

    lines.push(`${"  ".repeat(depth)}${token}`);
  }

  return lines.join("\n");
}

const editorTabs: {
  id: EditorTab;
  label: string;
  icon: typeof Eye;
}[] = [
  { id: "design", label: "Design", icon: LayoutGrid },
  { id: "preview", label: "Preview", icon: Eye },
  { id: "code", label: "Code", icon: Code },
  { id: "review", label: "Review", icon: ShieldCheck },
  { id: "history", label: "History", icon: History },
];

const viewportOptions: {
  id: Viewport;
  icon: typeof Monitor;
  label: string;
}[] = [
  { id: "desktop", icon: Monitor, label: "Desktop" },
  { id: "tablet", icon: Tablet, label: "Tablet" },
  { id: "mobile", icon: Smartphone, label: "Mobile" },
];

export default function EditorPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const [projectSlug, setProjectSlug] = useState("");
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projectName, setProjectName] = useState("");
  const [publicSiteUrl, setPublicSiteUrl] = useState<string | null>(null);
  const [reservedSiteUrl, setReservedSiteUrl] = useState<string | null>(null);
  const [projectVersion, setProjectVersion] = useState<number | null>(null);
  const [prompt, setPrompt] = useState("");
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [activeTab, setActiveTab] = useState<EditorTab>("design");
  const [generating, setGenerating] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewPath, setPreviewPath] = useState("/");
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [copied, setCopied] = useState(false);
  const [restoringVersion, setRestoringVersion] = useState<number | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [documentEditorReloadKey, setDocumentEditorReloadKey] = useState(0);
  const [reviewFiles, setReviewFiles] = useState<ReviewFile[] | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubRepositories, setGithubRepositories] = useState<GithubRepository[]>([]);
  const [selectedRepository, setSelectedRepository] = useState("");
  const [githubError, setGithubError] = useState<string | null>(null);
  const [githubCommitUrl, setGithubCommitUrl] = useState<string | null>(null);
  const [exportingToGithub, setExportingToGithub] = useState(false);
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const initialPromptLoaded = useRef(false);
  const saveDocumentBeforeGenerate = useRef<() => Promise<boolean>>(
    async () => true,
  );
  const formattedPreviewHtml = useMemo(
    () => formatHtmlForDisplay(previewHtml),
    [previewHtml],
  );

  const updateDocumentPreview = useCallback((html: string, path: string) => {
    setPreviewHtml(html);
    setPreviewPath(path);
  }, []);
  const registerDocumentSaveHandler = useCallback(
    (handler: () => Promise<boolean>) => {
      saveDocumentBeforeGenerate.current = handler;
    },
    [],
  );

  const loadGithubRepositories = useCallback(async () => {
    try {
      const response = await fetch("/api/github/repositories", {
        credentials: "include",
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Could not load GitHub repositories.");
      const repositories = Array.isArray(result.data?.repositories)
        ? result.data.repositories as GithubRepository[]
        : [];
      setGithubConnected(Boolean(result.data?.connected));
      setGithubRepositories(repositories);
      setSelectedRepository((selected) =>
        repositories.some((repo) => repo.fullName === selected)
          ? selected
          : repositories[0]?.fullName ?? "",
      );
    } catch (error) {
      setGithubError(error instanceof Error ? error.message : "Could not load GitHub repositories.");
    }
  }, []);

  useEffect(() => {
    void loadGithubRepositories();
  }, [loadGithubRepositories]);

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("github");
    if (status === "not-configured") {
      setGithubError("GitHub export is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET for the web app.");
    } else if (status === "connection-failed") {
      setGithubError("GitHub connection failed. Try connecting again.");
    } else if (status === "connected") {
      setGithubError(null);
    }
    if (status) window.history.replaceState({}, "", window.location.pathname);
  }, []);

  useEffect(() => {
    const onPreviewNavigation = (event: MessageEvent) => {
      if (event.source !== previewFrameRef.current?.contentWindow) return;
      if (event.data?.target !== "cms-preview" || typeof event.data?.path !== "string") return;
      setPreviewPath(event.data.path);
    };
    window.addEventListener("message", onPreviewNavigation);
    return () => window.removeEventListener("message", onPreviewNavigation);
  }, []);

  const cleanHtml = (value: string): string => {
    let html = value.trim();

    const htmlStart = html.search(/<!doctype\s+html|<html[\s>]/i);

    if (htmlStart !== -1) {
      html = html.slice(htmlStart);
    }

    html = html.replace(/\s*```\s*$/, "").trim();

    return html;
  };

  const loadPreview = useCallback(async () => {
    setPreviewLoading(true);
    setPreviewError(null);

    try {
      const { projectId: routeProjectId } = await params;
      setProjectSlug(routeProjectId);
      const projectResponse = await fetch(
        `/api/projects/${encodeURIComponent(routeProjectId)}`,
        { credentials: "include", cache: "no-store" },
      );
      const projectResult = await projectResponse.json();
      if (!projectResponse.ok) {
        throw new Error(
          projectResult.error?.message ?? "Could not load this project.",
        );
      }

      const project = projectResult.data as
        | {
            id?: number | string;
            slug?: string;
            name?: string;
            initialPrompt?: string | null;
            websiteUrl?: string | null;
            reservedUrl?: string | null;
          }
        | undefined;
      const slug = typeof project?.slug === "string" ? project.slug : "";
      if (!slug) throw new Error("The project API returned no project slug.");

      setProjectSlug(slug);
      setProjectId(Number(project?.id) || null);
      setProjectName(project?.name || slug);
      setPublicSiteUrl(project?.websiteUrl || null);
      setReservedSiteUrl(project?.reservedUrl || null);
      if (!initialPromptLoaded.current && project?.initialPrompt) {
        setPrompt(project.initialPrompt);
        initialPromptLoaded.current = true;
      }

      const response = await fetch(
        `/api/projects/${encodeURIComponent(slug)}/preview`,
        {
          credentials: "include",
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error?.message ?? "Failed to load website preview.",
        );
      }

      const data = result.data as PreviewData | undefined;

      if (!data) {
        throw new Error("The server returned no project data.");
      }

      setProjectName(data.projectName || slug);
      setProjectVersion(Number(data.versionNumber) || null);

      const html =
        typeof data.html === "string" ? cleanHtml(data.html) : "";

      setPreviewHtml(html);

      if (!html) {
        setPreviewError("The API returned an empty HTML document.");
        return;
      }

      const hasOpeningTag = /<html(?:\s|>)/i.test(html);
      const hasClosingTag = /<\/html\s*>/i.test(html);

      if (!hasOpeningTag || !hasClosingTag) {
        setPreviewError(
          `The saved HTML is incomplete (received ${html.length.toLocaleString()} characters). Check the generation output and database content.`,
        );
        return;
      }
    } catch (error) {
      setPreviewError(
        error instanceof Error ? error.message : "Could not load preview.",
      );
    } finally {
      setPreviewLoading(false);
    }
  }, [params]);

  const loadHistory = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/projects/${id}/versions`, {
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json();

      if (response.ok && Array.isArray(result.data)) {
        setVersions(result.data as ProjectVersion[]);
      }
    } catch (error) {
      console.error("[Editor] Could not load version history:", error);
    }
  }, []);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  useEffect(() => {
    if (projectId !== null) {
      void loadHistory(projectId);
    }
  }, [projectId, loadHistory, projectVersion]);

  async function handleGenerate() {
    if (!prompt.trim() || generating) return;

    setGenerating(true);

    try {
      const { projectId: slug } = await params;

      if (!slug?.trim()) {
        throw new Error("Missing project slug.");
      }

      const saved = await saveDocumentBeforeGenerate.current();
      if (!saved) {
        throw new Error(
          "Your latest editor changes could not be saved. Resolve the save error before generating.",
        );
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          projectSlug: slug,
          prompt: prompt.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error?.message ?? "Failed to start generation.",
        );
      }

      const jobId = result.data?.jobId;

      if (!jobId) {
        throw new Error("The server did not return a generation job ID.");
      }

      setActiveTab("preview");

      for (let attempt = 0; attempt < 150; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const statusResponse = await fetch(
          `/api/generate?jobId=${encodeURIComponent(String(jobId))}`,
          {
            credentials: "include",
            cache: "no-store",
          },
        );

        const statusResult = await statusResponse.json();

        if (!statusResponse.ok) {
          throw new Error(
            statusResult.error?.message ??
              "Could not check generation status.",
          );
        }

        const job = statusResult.data;

        if (job?.status === "succeeded") {
          setPrompt("");
          await loadPreview();
          setDocumentEditorReloadKey((key) => key + 1);
          setActiveTab("design");
          return;
        }

        if (job?.status === "failed") {
          throw new Error(
            job.error_message ?? "Generation failed. Please try again.",
          );
        }

        if (!["queued", "running"].includes(job?.status)) {
          throw new Error(
            `Unexpected generation status: ${String(job?.status)}`,
          );
        }
      }

      throw new Error(
        "Generation is taking longer than expected. Check the job status before retrying.",
      );
    } catch (error) {
      console.error("[Editor] Generation failed:", error);

      alert(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
    } finally {
      setGenerating(false);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(previewHtml);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      alert("Could not access the clipboard. Select and copy the code manually.");
    }
  }

  function downloadCode() {
    if (!previewHtml) return;

    const blob = new Blob([previewHtml], {
      type: "text/html;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${projectSlug || "website"}.html`;
    anchor.click();

    URL.revokeObjectURL(url);
  }

  async function restoreVersion(versionNumber: number) {
    if (restoringVersion !== null) return;
    setRestoringVersion(versionNumber);
    setRestoreError(null);

    try {
      const response = await fetch(
        `/api/documents/${encodeURIComponent(projectSlug)}/restore`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ versionNumber }),
        },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error?.message ?? "Could not restore this version.",
        );
      }

      const restoredVersion = Number(result.data?.versionNumber);
      if (!Number.isSafeInteger(restoredVersion) || restoredVersion < 1) {
        throw new Error("The server did not return the restored version number.");
      }

      setProjectVersion(restoredVersion);
      setDocumentEditorReloadKey((key) => key + 1);
      setActiveTab("design");
      await Promise.all([
        loadPreview(),
        projectId === null ? Promise.resolve() : loadHistory(projectId),
      ]);
    } catch (error) {
      setRestoreError(
        error instanceof Error
          ? error.message
          : "Could not restore this version.",
      );
    } finally {
      setRestoringVersion(null);
    }
  }

  async function runCodeReview() {
    if (!projectSlug || reviewing) return;
    setReviewing(true);
    setReviewError(null);
    try {
      if (!(await saveDocumentBeforeGenerate.current())) {
        throw new Error("Save or discard your pending editor changes before reviewing.");
      }
      const response = await fetch(
        `/api/documents/${encodeURIComponent(projectSlug)}/export`,
        { credentials: "include", cache: "no-store" },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Could not load exported project files.");
      const files = result.data?.files;
      if (!files || typeof files !== "object" || Array.isArray(files)) {
        throw new Error("The export API returned no project files.");
      }

      const htmlFiles = Object.entries(files).filter(
        ([path, content]) => path.endsWith(".html") && typeof content === "string",
      ) as Array<[string, string]>;
      if (!htmlFiles.length) throw new Error("The project export contains no HTML pages.");
      const exportedPaths = new Set(htmlFiles.map(([path]) => path));
      const reviewed = htmlFiles.map(([path, html]) => {
        const parsed = new DOMParser().parseFromString(html, "text/html");
        const issues: string[] = [];
        const images = parsed.querySelectorAll("img");
        if (parsed.querySelector("parsererror")) issues.push("HTML could not be parsed.");
        if (!parsed.title.trim()) issues.push("Page title is missing.");
        if (!parsed.body.querySelector("main")) issues.push("Main page content is missing.");

        for (const image of images) {
          if (!image.hasAttribute("alt")) issues.push("An image is missing its alt attribute.");
          if (!image.getAttribute("src")) issues.push("An image has no source.");
        }

        for (const link of parsed.querySelectorAll('a[href^="/"]')) {
          const href = link.getAttribute("href")!;
          if (href.startsWith("//")) continue;
          const targetUrl = new URL(href, "https://cms-preview.invalid");
          const targetFile = targetUrl.pathname === "/"
            ? "index.html"
            : `${targetUrl.pathname.replace(/^\/|\/$/g, "")}/index.html`;
          if (!exportedPaths.has(targetFile)) {
            issues.push(`Link target "${targetUrl.pathname}" has no exported page.`);
          }
        }

        return { path, passed: Math.max(0, 3 + images.length * 2 - issues.length), issues };
      });
      setReviewFiles(reviewed);
    } catch (error) {
      setReviewFiles(null);
      setReviewError(error instanceof Error ? error.message : "Could not review this project.");
    } finally {
      setReviewing(false);
    }
  }

  async function exportToGithub() {
    if (!projectSlug || !selectedRepository || exportingToGithub) return;
    setExportingToGithub(true);
    setGithubError(null);
    setGithubCommitUrl(null);
    try {
      if (!(await saveDocumentBeforeGenerate.current())) {
        throw new Error("Save or discard your pending editor changes before exporting.");
      }
      const response = await fetch("/api/github/export", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectSlug, repository: selectedRepository }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Could not export to GitHub.");
      setGithubCommitUrl(result.data?.commitUrl ?? null);
    } catch (error) {
      setGithubError(error instanceof Error ? error.message : "Could not export to GitHub.");
    } finally {
      setExportingToGithub(false);
    }
  }

  const domainLabel = projectSlug
    ? `${projectSlug}.cms.app${previewPath}`
    : "Loading project…";

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[#08090b] text-zinc-100">
      {/* Editor sidebar */}
      <aside className="flex w-[62px] shrink-0 flex-col items-center border-r border-white/[0.07] bg-[#08090b] py-4">
        <Link
          href="/dashboard/customer"
          aria-label="Dashboard"
          title="Back to dashboard"
          className="group relative flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 text-xs font-bold text-indigo-200 shadow-[0_0_20px_rgba(99,102,241,0.08)] transition-all hover:border-indigo-400/40 hover:from-indigo-500/30"
        >
          <Sparkles className="h-[17px] w-[17px] transition-transform group-hover:scale-110" />
        </Link>

        <div className="my-5 h-px w-7 bg-white/[0.07]" />

        <nav
          aria-label="Editor navigation"
          className="flex flex-col gap-2"
        >
          {editorTabs.map(({ id, label, icon: Icon }) => (
            <TooltipButton
              key={id}
              label={label}
              active={activeTab === id}
              onClick={() => setActiveTab(id)}
            >
              <Icon className="h-[18px] w-[18px]" />
            </TooltipButton>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <div className="mb-2 h-px w-7 bg-white/[0.07]" />
          <TooltipButton
            label="Download HTML"
            onClick={downloadCode}
            disabled={!previewHtml}
          >
            <Download className="h-[18px] w-[18px]" />
          </TooltipButton>
        </div>
      </aside>

      {/* Main editor */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="z-10 flex min-h-[61px] shrink-0 flex-wrap items-center gap-3 border-b border-white/[0.07] bg-[#08090b]/95 px-4 py-3 backdrop-blur-xl sm:px-5">
          <Link
            href="/projects"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Projects
          </Link>

          <div className="hidden h-5 w-px bg-white/10 sm:block" />

          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035]">
              <Globe className="h-4 w-4 text-zinc-400" />
            </div>

            <div className="min-w-0">
              <h1
                className="max-w-[40vw] truncate text-[13px] font-semibold tracking-tight text-zinc-100"
                title={projectName}
              >
                {projectName || "Loading project…"}
              </h1>
              <p className="mt-0.5 truncate text-[10px] text-zinc-600">
                {publicSiteUrl || reservedSiteUrl || projectSlug || "Loading project"}
              </p>
            </div>
          </div>

          {publicSiteUrl && (
            <a
              href={publicSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-2.5 py-1.5 text-[11px] font-medium text-emerald-300 hover:bg-emerald-400/[0.12]"
            >
              Live site
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          <div className="hidden h-5 w-px bg-white/10 md:block" />

          <Badge
            variant="outline"
            className="gap-1.5 border-indigo-400/20 bg-indigo-400/[0.07] px-2 py-1 text-[10px] font-medium text-indigo-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            {projectVersion ? `Version ${projectVersion}` : "Preview"}
          </Badge>

          <div className="ml-auto flex items-center gap-2">
            {/* Viewport selector */}
            <div className="flex items-center rounded-xl border border-white/[0.08] bg-white/[0.025] p-1">
              {viewportOptions.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setViewport(id)}
                  title={label}
                  aria-label={label}
                  aria-pressed={viewport === id}
                  className={cn(
                    "flex h-7 w-8 items-center justify-center rounded-lg transition-all",
                    viewport === id
                      ? "border border-indigo-400/15 bg-indigo-400/[0.12] text-indigo-300 shadow-sm"
                      : "text-zinc-600 hover:bg-white/[0.05] hover:text-zinc-300",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>

            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-1.5 rounded-xl border-white/[0.09] bg-white/[0.025] px-3 text-xs text-zinc-400 shadow-none transition-colors hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-zinc-100"
              onClick={() => void loadPreview()}
              disabled={previewLoading}
            >
              <RotateCcw
                className={cn(
                  "h-3.5 w-3.5",
                  previewLoading && "animate-spin",
                )}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </header>

        {/* Workspace */}
        <main className="min-h-0 flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.045),transparent_48%)]">
          {projectSlug && (
            <div className={cn("h-full", activeTab !== "design" && "hidden")}>
              <DocumentEditor
                key={`${projectSlug}-${documentEditorReloadKey}`}
                slug={projectSlug}
                reloadKey={documentEditorReloadKey}
                previewPath={previewPath}
                onVersionChange={setProjectVersion}
                onRenderedHtml={updateDocumentPreview}
                onRegisterSaveHandler={registerDocumentSaveHandler}
              />
            </div>
          )}

          {/* Preview */}
          {activeTab === "preview" && (
            <div className="flex min-h-full items-center justify-center p-3 sm:p-5 lg:p-7">
              <div
                className={cn(
                  "flex h-[calc(100dvh-190px)] min-h-[360px] max-w-full flex-col overflow-hidden rounded-xl border border-white/[0.09] bg-[#0d0e12] shadow-[0_18px_70px_rgba(0,0,0,0.25)] transition-[width] duration-300 ease-out",
                  viewport === "mobile"
                    ? "w-[375px]"
                    : viewport === "tablet"
                      ? "w-[768px]"
                      : "w-full",
                )}
              >
                {/* Browser chrome */}
                <div className="flex h-11 shrink-0 items-center gap-3 border-b border-white/[0.07] bg-[#101115] px-3 sm:px-4">
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full border border-red-400/20 bg-red-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full border border-amber-400/20 bg-amber-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full border border-emerald-400/20 bg-emerald-400/80" />
                  </div>

                  <div className="mx-auto flex h-7 min-w-0 max-w-xl flex-1 items-center justify-center gap-2 rounded-lg border border-white/[0.06] bg-black/20 px-3 text-[11px] text-zinc-500">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/80" />
                    <span className="truncate">{domainLabel}</span>
                  </div>

                  <span className="hidden shrink-0 items-center gap-1.5 text-[10px] text-zinc-600 sm:flex">
                    <Monitor className="h-3 w-3" />
                    Live preview
                  </span>
                </div>

                {/* Website preview content */}
                <div className="relative min-h-0 flex-1 bg-[#0d0e12]">
                  {previewLoading ? (
                    <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-400/15 bg-indigo-400/[0.07]">
                        <LoaderCircle className="h-5 w-5 animate-spin text-indigo-300" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-zinc-300">
                          Loading preview
                        </p>
                        <p className="mt-1 text-xs text-zinc-600">
                          Preparing your website…
                        </p>
                      </div>
                    </div>
                  ) : previewError ? (
                    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-400/15 bg-red-400/[0.06]">
                        <AlertCircle className="h-5 w-5 text-red-300" />
                      </div>

                      <div className="max-w-lg">
                        <h2 className="text-sm font-medium text-zinc-200">
                          Preview unavailable
                        </h2>
                        <p className="mt-2 text-xs leading-6 text-zinc-500">
                          {previewError}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => void loadPreview()}
                        className="h-9 gap-2 rounded-xl border-white/10 bg-white/[0.03] text-xs text-zinc-300 hover:bg-white/[0.07] hover:text-white"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Try again
                      </Button>
                    </div>
                  ) : (
                    <iframe
                      key={`${projectVersion ?? "current"}-${previewHtml.length}`}
                      ref={previewFrameRef}
                      title={`${projectName || "Generated"} website preview`}
                      srcDoc={previewHtml}
                      sandbox="allow-scripts allow-forms allow-popups"
                      referrerPolicy="no-referrer"
                      className="h-full min-h-[360px] w-full border-0 bg-white"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Source code */}
          {activeTab === "code" && (
            <section className="flex h-full min-h-[400px] flex-col">
              <div className="flex flex-wrap items-center gap-4 border-b border-white/[0.07] px-4 py-3 sm:px-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/[0.07]">
                  <Code className="h-4 w-4 text-indigo-300" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-zinc-200">
                    {projectSlug || "website"}.html
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-600">
                    HTML source
                    <span className="mx-1.5 text-zinc-700">·</span>
                    Version {projectVersion ?? "—"}
                    <span className="mx-1.5 text-zinc-700">·</span>
                    {previewHtml.length.toLocaleString()} characters
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 gap-2 rounded-xl border-white/[0.09] bg-white/[0.025] text-xs text-zinc-300 shadow-none hover:bg-white/[0.06] hover:text-white"
                  onClick={() => void copyCode()}
                  disabled={!previewHtml}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied" : "Copy code"}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 gap-2 rounded-xl border-white/[0.09] bg-white/[0.025] text-xs text-zinc-300 shadow-none hover:bg-white/[0.06] hover:text-white"
                  onClick={downloadCode}
                  disabled={!previewHtml}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </div>

              {formattedPreviewHtml ? (
                <pre className="min-h-0 flex-1 overflow-auto bg-[#08090b] p-4 font-mono text-[11px] leading-5 text-zinc-400 selection:bg-indigo-500/30 sm:p-6">
                  <code className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                    {formattedPreviewHtml}
                  </code>
                </pre>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
                  <Code className="h-7 w-7 text-zinc-700" />
                  <p className="text-sm text-zinc-400">
                    {previewError || "No generated HTML is available yet."}
                  </p>
                  <p className="text-xs text-zinc-600">
                    Generate a website to view its source code here.
                  </p>
                </div>
              )}
            </section>
          )}

          {activeTab === "review" && (
            <section className="mx-auto max-w-4xl space-y-6 p-4 sm:p-7 lg:p-9">
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/[0.07]">
                  <ShieldCheck className="h-[18px] w-[18px] text-indigo-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold tracking-tight text-zinc-100">Code review</h2>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Check every exported page for document structure, page titles, image accessibility, and broken internal routes.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => void runCodeReview()}
                  disabled={reviewing || !projectSlug}
                  className="h-9 gap-2 rounded-xl bg-indigo-500 px-3 text-xs text-white hover:bg-indigo-400"
                >
                  {reviewing ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                  {reviewing ? "Reviewing…" : "Run review"}
                </Button>
              </div>

              {reviewError && (
                <p role="alert" className="rounded-lg border border-red-400/15 bg-red-400/[0.05] p-3 text-xs text-red-200">
                  {reviewError}
                </p>
              )}
              {reviewFiles && (
                <div className="space-y-2">
                  {reviewFiles.map((file) => (
                    <div key={file.path} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                      <div className="flex items-center gap-2">
                        {file.issues.length ? (
                          <CircleAlert className="h-4 w-4 text-amber-300" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                        )}
                        <span className="min-w-0 flex-1 truncate font-mono text-xs text-zinc-200">{file.path}</span>
                        <span className="text-[10px] text-zinc-500">{file.passed} checks passed</span>
                      </div>
                      {file.issues.length > 0 && (
                        <ul className="mt-3 space-y-1 pl-6 text-[11px] text-amber-200">
                          {file.issues.map((issue, index) => <li key={`${file.path}-${index}`}>{issue}</li>)}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {!reviewFiles && !reviewError && !reviewing && (
                <p className="rounded-xl border border-dashed border-white/[0.1] p-6 text-center text-xs text-zinc-500">
                  Run a review to check the latest saved version of your site.
                </p>
              )}

              <div className="rounded-2xl border border-white/[0.08] bg-[#0d0e12] p-5 sm:p-6">
                <div className="flex flex-wrap items-start gap-3">
                  <GitBranch className="mt-0.5 h-5 w-5 text-zinc-300" />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-zinc-100">Export to your GitHub repository</h3>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      Push the static HTML pages and robots.txt as a single commit to a repository you own.
                    </p>
                  </div>
                  {!githubConnected ? (
                    <Button
                      asChild
                      variant="outline"
                      className="h-9 gap-2 border-white/[0.1] bg-white/[0.03] text-xs text-zinc-200 hover:bg-white/[0.07]"
                    >
                      <a href={`/api/github/connect?returnTo=${encodeURIComponent(projectId ? `/editor/${projectId}` : "/projects")}`}>
                        <GitBranch className="h-3.5 w-3.5" />
                        Connect GitHub
                      </a>
                    </Button>
                  ) : (
                    <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                      <select
                        aria-label="GitHub repository"
                        value={selectedRepository}
                        onChange={(event) => setSelectedRepository(event.target.value)}
                        className="h-9 min-w-48 rounded-lg border border-white/[0.1] bg-[#111217] px-3 text-xs text-zinc-200"
                      >
                        {githubRepositories.map((repo) => (
                          <option key={repo.fullName} value={repo.fullName}>
                            {repo.fullName}{repo.private ? " (private)" : ""}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        onClick={() => void exportToGithub()}
                        disabled={!selectedRepository || exportingToGithub}
                        className="h-9 gap-2 rounded-xl bg-indigo-500 px-3 text-xs text-white hover:bg-indigo-400"
                      >
                        {exportingToGithub && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
                        {exportingToGithub ? "Exporting…" : "Export"}
                      </Button>
                    </div>
                  )}
                </div>
                {githubConnected && githubRepositories.length === 0 && (
                  <p className="mt-3 text-[11px] text-zinc-500">
                    No owned repositories with write access were found. Create one on GitHub, then reload this page.
                  </p>
                )}
                {githubError && <p role="alert" className="mt-3 text-xs text-red-300">{githubError}</p>}
                {githubCommitUrl && (
                  <a
                    href={githubCommitUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-emerald-200"
                  >
                    Export committed successfully <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Version history */}
          {activeTab === "history" && (
            <section className="mx-auto max-w-4xl p-4 sm:p-7 lg:p-9">
              <div className="mb-7 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/[0.07]">
                  <History className="h-[18px] w-[18px] text-indigo-300" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
                    Version history
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Review previous generations of your website.
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className="ml-auto border-white/[0.08] bg-white/[0.025] text-zinc-400"
                >
                  {versions.length}{" "}
                  {versions.length === 1 ? "version" : "versions"}
                </Badge>
              </div>

              {restoreError && (
                <p
                  role="alert"
                  className="mb-4 rounded-lg border border-red-400/15 bg-red-400/[0.06] px-3 py-2 text-xs text-red-200"
                >
                  {restoreError}
                </p>
              )}

              {versions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.015] px-6 py-16 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025]">
                    <Clock3 className="h-5 w-5 text-zinc-500" />
                  </div>

                  <h3 className="text-sm font-medium text-zinc-300">
                    No versions yet
                  </h3>
                  <p className="mt-2 max-w-xs text-xs leading-5 text-zinc-600">
                    Your saved website generations will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {versions.map((version) => {
                    const isCurrent =
                      version.version_number === projectVersion;
                    const isReady = version.status === "ready";

                    return (
                      <div
                        key={version.id}
                        className={cn(
                          "group flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-4 transition-colors sm:gap-4 sm:px-5",
                          isCurrent
                            ? "border-indigo-400/20 bg-indigo-400/[0.035]"
                            : "border-white/[0.07] bg-[#0d0e12] hover:border-white/[0.12] hover:bg-white/[0.025]",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold",
                            isCurrent
                              ? "border-indigo-400/20 bg-indigo-400/[0.1] text-indigo-300"
                              : "border-white/[0.07] bg-white/[0.035] text-zinc-400",
                          )}
                        >
                          v{version.version_number}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="break-words text-[13px] font-medium leading-5 text-zinc-200">
                            {version.source_prompt || "Website version"}
                          </p>

                          <p className="mt-1.5 text-[11px] text-zinc-600">
                            {version.created_at
                              ? new Date(version.created_at).toLocaleString()
                              : "Date unavailable"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "border px-2 py-1 text-[10px] font-medium",
                              isReady
                                ? "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300"
                                : "border-white/[0.08] bg-white/[0.025] text-zinc-400",
                            )}
                          >
                            {version.status}
                          </Badge>

                          {isCurrent && (
                            <Badge
                              variant="outline"
                              className="border-indigo-400/20 bg-indigo-400/[0.07] text-[10px] text-indigo-300"
                            >
                              Current
                            </Badge>
                          )}
                          {!isCurrent && isReady && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                void restoreVersion(version.version_number)
                              }
                              disabled={restoringVersion !== null}
                              className="h-8 border-white/[0.09] bg-white/[0.025] px-2.5 text-[11px] text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                            >
                              {restoringVersion === version.version_number
                                ? "Restoring…"
                                : "Restore"}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </main>

        {/* AI prompt composer */}
        <footer className="z-10 shrink-0 border-t border-white/[0.07] bg-[#08090b]/95 px-3 py-3 backdrop-blur-xl sm:px-5 sm:py-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <label
                htmlFor="ai-prompt"
                className="flex items-center gap-2 text-xs font-medium text-zinc-300"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
                Modify with AI
              </label>

              <span className="text-[10px] text-zinc-600">
                Enter to generate
              </span>
            </div>

            <div
              className={cn(
                "flex items-end gap-2 rounded-2xl border bg-[#0d0e12] p-2 transition-colors",
                generating
                  ? "border-indigo-400/20"
                  : "border-white/[0.09] focus-within:border-indigo-400/30",
              )}
            >
              <Input
                id="ai-prompt"
                placeholder="Describe the changes you want…"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleGenerate();
                  }
                }}
                disabled={generating}
                className="min-h-[40px] flex-1 border-0 bg-transparent text-[13px] text-zinc-100 shadow-none placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0"
              />

              <Button
                onClick={() => void handleGenerate()}
                disabled={!prompt.trim() || generating}
                className="mb-0.5 h-9 shrink-0 gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500 px-3.5 text-xs font-medium text-white shadow-[0_0_18px_rgba(99,102,241,0.12)] transition-all hover:bg-indigo-400 disabled:border-white/[0.06] disabled:bg-white/[0.04] disabled:text-zinc-600 disabled:shadow-none sm:px-4"
              >
                {generating ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                <span>{generating ? "Generating…" : "Generate"}</span>
              </Button>
            </div>

            <p className="mt-2 px-1 text-[10px] leading-4 text-zinc-700">
              AI-generated changes create a new website version.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function TooltipButton({
  label,
  children,
  active,
  disabled,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-150",
        active
          ? "border-indigo-400/15 bg-indigo-400/[0.1] text-indigo-300"
          : "border-transparent text-zinc-600 hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-zinc-200",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      {active && (
        <span className="absolute bottom-2 left-0 top-2 w-[2px] rounded-r-full bg-indigo-400" />
      )}
      {children}
    </button>
  );
}