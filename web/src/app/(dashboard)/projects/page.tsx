/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  FolderGit2,
  LayoutGrid,
  List,
  RefreshCw,
} from "lucide-react";

import { AppShell, type NavItem } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const sidebarItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/customer" },
  { label: "Projects", href: "/projects" },
  { label: "Deployments", href: "/deployments" },
  { label: "Domains", href: "/domains" },
  { label: "Settings", href: "/profile/customer/settings" },
];

type Project = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  framework: string;
  updatedAt: string | null;
  version: number;
  subdomain: string | null;
  websiteUrl: string | null;
};

const STATUS_BADGE: Record<
  string,
  {
    variant:
      | "default"
      | "secondary"
      | "destructive"
      | "outline"
      | "success"
      | "warning";
    label: string;
  }
> = {
  draft: { variant: "secondary", label: "Draft" },
  generating: { variant: "warning", label: "Generating" },
  ready: { variant: "success", label: "Ready" },
  published: { variant: "default", label: "Published" },
  archived: { variant: "secondary", label: "Archived" },
  failed: { variant: "destructive", label: "Failed" },
};

function normalizeProjects(response: unknown): Project[] {
  const root = asRecord(response);
  const data = asRecord(root.data);

  const records: unknown[] = Array.isArray(response)
    ? response
    : Array.isArray(root.projects)
      ? root.projects
      : Array.isArray(data.projects)
        ? data.projects
        : Array.isArray(data.data)
          ? data.data
          : Array.isArray(root.data)
            ? root.data
            : [];

  return records.map((record) => {
    const project = asRecord(record);

    return {
      id: String(project.id ?? ""),
      name: String(project.name ?? "Untitled project"),
      slug: String(project.slug ?? project.id ?? ""),
      description:
        typeof project.description === "string"
          ? project.description
          : null,
      status: String(project.status ?? "draft").toLowerCase(),
      framework: formatFramework(project.framework),
      updatedAt:
        typeof project.updated_at === "string"
          ? project.updated_at
          : typeof project.updatedAt === "string"
            ? project.updatedAt
            : null,
      version: Number(
        project.current_version_number ??
          project.currentVersionNumber ??
          project.version ??
          0,
      ),
      subdomain:
        typeof project.platform_subdomain === "string"
          ? project.platform_subdomain
          : typeof project.platformSubdomain === "string"
            ? project.platformSubdomain
            : typeof project.subdomain === "string"
              ? project.subdomain
              : null,
      websiteUrl:
        typeof project.websiteUrl === "string" ? project.websiteUrl : null,
    };
  });
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function formatFramework(value: unknown): string {
  const framework = String(value ?? "Unknown");

  const names: Record<string, string> = {
    nextjs: "Next.js",
    next: "Next.js",
    react: "React",
    static: "Static",
    html: "HTML",
    astro: "Astro",
    vue: "Vue",
    svelte: "Svelte",
  };

  return names[framework.toLowerCase()] ?? framework;
}

function formatDate(value: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function ProjectsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/projects", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorBody = asRecord(result);
        const details = asRecord(errorBody.error);

        throw new Error(
          String(
            details.message ??
              errorBody.message ??
              `Could not load projects (${response.status}).`,
          ),
        );
      }

      setProjects(normalizeProjects(result));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while loading projects.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return projects;

    return projects.filter((project) => {
      return (
        project.name.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.framework.toLowerCase().includes(query) ||
        project.status.toLowerCase().includes(query) ||
        project.subdomain?.toLowerCase().includes(query)
      );
    });
  }, [projects, search]);

  return (
    <AppShell
      sidebarItems={sidebarItems}
      user={{ name: "My account", email: "" }}
    >
      <PageHeader
        title="Projects"
        description="Manage and monitor your generated websites."
        action={
          <Link href="/projects/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New project
            </Button>
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => void loadProjects()}
          disabled={loading}
          aria-label="Refresh projects"
          title="Refresh projects"
          className="text-white"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
        </Button>

        <Tabs
          value={view}
          onValueChange={(value) => {
            if (value === "grid" || value === "list") setView(value);
          }}
        >
          <TabsList>
            <TabsTrigger value="grid" aria-label="Grid view">
              <LayoutGrid className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="list" aria-label="List view">
              <List className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="rounded-xl border border-zinc-200 p-12 text-center dark:border-zinc-800">
          <RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin text-zinc-400" />
          <p className="text-sm text-zinc-500">
            Loading your projects...
          </p>
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30"
        >
          <h3 className="font-medium text-red-800 dark:text-red-300">
            Could not load projects
          </h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => void loadProjects()}
          >
            Try again
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyProjects search={search} />
      ) : (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
              : "space-y-3"
          }
        >
          {filtered.map((project) =>
            view === "grid" ? (
              <ProjectCardGrid key={project.id} project={project} />
            ) : (
              <ProjectCardList key={project.id} project={project} />
            ),
          )}
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <p className="mt-5 text-xs text-zinc-500 dark:text-zinc-400">
          Showing {filtered.length} of {projects.length} projects
        </p>
      )}
    </AppShell>
  );
}

function EmptyProjects({ search }: { search: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-16 text-center dark:border-zinc-800 dark:bg-zinc-950">
      <FolderGit2 className="mx-auto mb-4 h-12 w-12 text-zinc-400" />

      <h3 className="mb-2 text-lg font-medium text-zinc-900 dark:text-zinc-50">
        {search ? "No matching projects" : "No projects yet"}
      </h3>

      <p className="mx-auto mb-6 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
        {search
          ? "Try a different search term."
          : "Create your first project and generate a website with AI."}
      </p>

      {!search && (
        <Link href="/projects/new">
          <Button>Create project</Button>
        </Link>
      )}
    </div>
  );
}

function ProjectCardGrid({ project }: { project: Project }) {
  const badge =
    STATUS_BADGE[project.status] ?? STATUS_BADGE.draft;

  return (
      <Card className="h-full transition-all hover:border-zinc-300 hover:shadow-sm dark:hover:border-zinc-700">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="flex-1 truncate text-base hover:text-indigo-500">
              <Link href={`/editor/${encodeURIComponent(project.slug)}`}>
              {project.name}
              </Link>
            </CardTitle>
            <Badge variant={badge.variant as never}>
              {badge.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <CardDescription className="mb-3 line-clamp-2 text-xs">
            {project.description || "No description provided."}
          </CardDescription>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              {project.framework}
              {project.version > 0 ? ` · v${project.version}` : ""}
            </span>

            {project.websiteUrl && (
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="break-all text-emerald-600 hover:underline dark:text-emerald-400"
              >
                Visit site
              </a>
            )}
          </div>

          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            Updated {formatDate(project.updatedAt)}
          </p>
        </CardContent>
      </Card>
  );
}

function ProjectCardList({ project }: { project: Project }) {
  const badge =
    STATUS_BADGE[project.status] ?? STATUS_BADGE.draft;

  return (
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-900 hover:text-indigo-500 dark:text-zinc-50">
            <Link href={`/editor/${encodeURIComponent(project.slug)}`}>
            {project.name}
            </Link>
          </p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {project.description || "No description provided."}
          </p>
          {project.websiteUrl && (
            <a
              href={project.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block break-all text-xs text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Visit published site
            </a>
          )}
        </div>

        <Badge variant={badge.variant as never}>
          {badge.label}
        </Badge>

        <span className="hidden text-xs text-zinc-500 dark:text-zinc-400 sm:block">
          {project.framework}
          {project.version > 0 ? ` · v${project.version}` : ""}
        </span>

        <span className="hidden text-xs text-zinc-500 dark:text-zinc-400 sm:block">
          {formatDate(project.updatedAt)}
        </span>
      </div>
  );
}
