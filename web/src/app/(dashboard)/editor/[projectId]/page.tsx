/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Monitor, Smartphone, Tablet, Wand2, Code, Eye, History,
  ArrowLeft, RotateCcw, Download, Copy, Check, ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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

export default function EditorPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const [projectSlug, setProjectSlug] = useState("");
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projectVersion, setProjectVersion] = useState<number | null>(null);
  const [prompt, setPrompt] = useState("");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "history">("preview");
  const [generating, setGenerating] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [copied, setCopied] = useState(false);


  const cleanHtml = (value: string): string => {
    let html = value.trim();

    // Remove an optional Markdown code fence and introductory text.
    const htmlStart = html.search(/<!doctype\s+html|<html[\s>]/i);

    if (htmlStart !== -1) {
      html = html.slice(htmlStart);
    }

    // Remove a trailing Markdown code fence.
    html = html.replace(/\s*```\s*$/, "").trim();

    return html;
  };


  const loadPreview = useCallback(async () => {
    setPreviewLoading(true);
    setPreviewError(null);

    try {
      const { projectId: slug } = await params;
      setProjectSlug(slug);

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

      setProjectId(Number(data.projectId) || null);
      setProjectName(data.projectName || slug);
      setProjectVersion(Number(data.versionNumber) || null);

      const html =
        typeof data.html === "string" ? cleanHtml(data.html) : "";

      // Keep the returned code available even if it fails validation.
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
    if (projectId !== null) void loadHistory(projectId);
  }, [projectId, loadHistory, projectVersion]);

  async function handleGenerate() {
    if (!prompt.trim() || generating) return;
    setGenerating(true);

    try {
      const { projectId: slug } = await params;
      if (!slug?.trim()) throw new Error("Missing project slug.");

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ projectSlug: slug, prompt: prompt.trim() }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message ?? "Failed to start generation.");
      }

      const jobId = result.data?.jobId;
      if (!jobId) throw new Error("The server did not return a generation job ID.");
      setActiveTab("preview");

      for (let attempt = 0; attempt < 150; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const statusResponse = await fetch(
          `/api/generate?jobId=${encodeURIComponent(String(jobId))}`,
          { credentials: "include", cache: "no-store" },
        );
        const statusResult = await statusResponse.json();

        if (!statusResponse.ok) {
          throw new Error(statusResult.error?.message ?? "Could not check generation status.");
        }

        const job = statusResult.data;
        if (job?.status === "succeeded") {
          setPrompt("");
          await loadPreview();
          return;
        }
        if (job?.status === "failed") {
          throw new Error(job.error_message ?? "Generation failed. Please try again.");
        }
        if (!["queued", "running"].includes(job?.status)) {
          throw new Error(`Unexpected generation status: ${String(job?.status)}`);
        }
      }

      throw new Error("Generation is taking longer than expected. Check the job status before retrying.");
    } catch (error) {
      console.error("[Editor] Generation failed:", error);
      alert(error instanceof Error ? error.message : "An unexpected error occurred.");
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
    const blob = new Blob([previewHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${projectSlug || "website"}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const domainLabel = projectSlug ? `${projectSlug}.cms.app` : "Loading project…";

  return (
    <div className="flex h-screen w-full bg-zinc-50 dark:bg-zinc-950">
      <aside className="flex w-16 shrink-0 flex-col items-center gap-4 border-r border-zinc-200 bg-white py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <Link href="/dashboard/customer" aria-label="Dashboard" className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
          AI
        </Link>
        <div className="flex flex-col gap-2">
          <TooltipButton label="Preview" active={activeTab === "preview"} onClick={() => setActiveTab("preview")}><Eye className="h-5 w-5" /></TooltipButton>
          <TooltipButton label="Code" active={activeTab === "code"} onClick={() => setActiveTab("code")}><Code className="h-5 w-5" /></TooltipButton>
          <TooltipButton label="History" active={activeTab === "history"} onClick={() => setActiveTab("history")}><History className="h-5 w-5" /></TooltipButton>
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <TooltipButton label="Download HTML" onClick={downloadCode}><Download className="h-5 w-5" /></TooltipButton>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex flex-wrap items-center gap-3 border-b border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-950">
          <Link href="/projects" className="flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
          <span className="max-w-[40vw] truncate text-sm font-medium text-zinc-900 dark:text-zinc-50" title={projectName}>
            {projectName || "Loading project…"}
          </span>
          <Badge variant="success">{projectVersion ? `Version ${projectVersion}` : "Preview"}</Badge>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800">
              {[
                { id: "desktop", icon: Monitor, label: "Desktop" },
                { id: "tablet", icon: Tablet, label: "Tablet" },
                { id: "mobile", icon: Smartphone, label: "Mobile" },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setViewport(id as typeof viewport)}
                  className={`rounded-md p-1.5 transition-colors ${viewport === id ? "bg-zinc-100 dark:bg-zinc-800" : "hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}
                  title={label}
                  aria-label={label}
                >
                  <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                </button>
              ))}
            </div>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => void loadPreview()}>
              <RotateCcw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-auto">
          {activeTab === "preview" && (
            <div className="flex min-h-full items-center justify-center p-4 md:p-6">
              <div
                className={`flex h-[calc(100vh-190px)] min-h-[420px] max-w-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition-all dark:border-zinc-800 ${viewport === "mobile" ? "w-[375px]" : viewport === "tablet" ? "w-[768px]" : "w-full"}`}
              >
                <div className="flex h-9 shrink-0 items-center gap-2 border-b border-zinc-200 bg-zinc-100 px-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="mx-4 min-w-0 flex-1">
                    <div className="flex h-5 items-center gap-1 truncate rounded border border-zinc-200 bg-white px-2 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
                      <ExternalLink className="h-3 w-3 shrink-0" /> <span className="truncate">{domainLabel}</span>
                    </div>
                  </div>
                </div>
                <div className="relative min-h-0 flex-1 bg-white">
                  {previewLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-zinc-500">Loading website preview…</p>
                    </div>
                  ) : previewError ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                      <p className="max-w-xl text-sm text-red-500">{previewError}</p>
                      <Button variant="outline" onClick={() => void loadPreview()}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Retry
                      </Button>
                    </div>
                  ) : (
                    <iframe
                      key={`${projectVersion ?? "current"}-${previewHtml.length}`}
                      title={`${projectName || "Generated"} website preview`}
                      srcDoc={previewHtml}
                      sandbox="allow-scripts allow-forms allow-popups"
                      referrerPolicy="no-referrer"
                      className="h-full min-h-[400px] w-full border-0 bg-white"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "code" && (
            <section className="flex h-full min-h-[400px] flex-col bg-zinc-950 text-zinc-300">
              <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-100">{projectSlug || "website"}.html</p>
                  <p className="text-xs text-zinc-500">Generated HTML source · Version {projectVersion ?? "—"}</p>
                </div>
                <Button size="sm" variant="outline" className="gap-2" onClick={() => void copyCode()}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy code"}
                </Button>
              </div>
              {previewHtml ? (
                <pre className="min-h-0 flex-1 overflow-auto p-5 text-xs leading-6"><code>{previewHtml}</code></pre>
              ) : (
                <p className="p-6 text-sm text-zinc-500">{previewError || "No generated HTML is available yet."}</p>
              )}
            </section>
          )}

          {activeTab === "history" && (
            <section className="mx-auto max-w-3xl p-6 md:p-8">
              <h2 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">Version history</h2>
              {versions.length === 0 ? (
                <p className="text-sm text-zinc-500">No saved versions were found.</p>
              ) : (
                <div className="space-y-3">
                  {versions.map((version) => (
                    <div key={version.id} className="flex flex-wrap items-center gap-4 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        v{version.version_number}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{version.source_prompt || "Website version"}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {version.created_at ? new Date(version.created_at).toLocaleString() : "Date unavailable"}
                        </p>
                      </div>
                      <Badge variant={version.status === "ready" ? "success" : "secondary"}>{version.status}</Badge>
                      {version.version_number === projectVersion && <span className="text-xs text-emerald-600">Current</span>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>

        <div className="border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto flex max-w-4xl items-end gap-3">
            <div className="min-w-0 flex-1">
              <label htmlFor="ai-prompt" className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Modify with AI</label>
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
              />
            </div>
            <Button onClick={() => void handleGenerate()} disabled={!prompt.trim() || generating} className="mb-[1px] h-[42px] gap-2">
              {generating ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {generating ? "Generating…" : "Generate"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TooltipButton({
  label,
  children,
  active,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`rounded-lg p-2 transition-colors ${active ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50" : "text-zinc-600 hover:bg-zinc-50 hover:text-white dark:text-zinc-400 dark:hover:bg-zinc-900"}`}
    >
      {children}
    </button>
  );
}
