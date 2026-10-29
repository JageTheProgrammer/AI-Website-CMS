/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Rocket,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

import { AppShell, type NavItem } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/types";
import {
  Card,
  CardContent,
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
  id: string | number;
  name?: string;
  slug?: string;
};

type Deployment = {
  id: string | number;
  projectId?: string | number;
  project_id?: string | number;
  projectName?: string;
  project_name?: string;
  version?: string | number;
  versionNumber?: number;
  version_number?: number;
  status?: string;
  target?: string;
  url?: string | null;
  deploymentUrl?: string | null;
  deployment_url?: string | null;
  log?: string | null;
  logs?: string | null;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
};

type User = {
  userId?: string | number;
  id?: string | number;
  email?: string;
  displayName?: string;
};

type Filter = "all" | "building" | "succeeded" | "failed";

const STATUS_META = {
  building: {
    icon: Loader2,
    variant: "warning" as const,
    label: "Building",
  },
  succeeded: {
    icon: CheckCircle2,
    variant: "success" as const,
    label: "Succeeded",
  },
  failed: {
    icon: AlertCircle,
    variant: "destructive" as const,
    label: "Failed",
  },
  cancelled: {
    icon: Clock,
    variant: "secondary" as const,
    label: "Cancelled",
  },
  queued: {
    icon: Clock,
    variant: "secondary" as const,
    label: "Queued",
  },
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body?.error?.message ||
      body?.message ||
      `Request failed (${response.status}).`;

    throw new Error(message);
  }

  return body as T;
}

function extractRows<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const result = response as {
    data?: unknown;
    projects?: unknown;
    deployments?: unknown;
  };

  if (Array.isArray(result.deployments)) {
    return result.deployments as T[];
  }

  if (Array.isArray(result.projects)) {
    return result.projects as T[];
  }

  if (Array.isArray(result.data)) {
    return result.data as T[];
  }

  if (result.data && typeof result.data === "object") {
    return extractRows<T>(result.data);
  }

  return [];
}

function extractUser(response: unknown): User {
  if (!response || typeof response !== "object") {
    return {};
  }

  const result = response as {
    user?: User;
    data?: unknown;
  };

  if (result.user) {
    return result.user;
  }

  if (result.data && typeof result.data === "object") {
    const data = result.data as { user?: User };

    if (data.user) {
      return data.user;
    }

    return result.data as User;
  }

  return {};
}

function normalizeStatus(status?: string): string {
  const value = (status || "queued").toLowerCase();

  const aliases: Record<string, string> = {
    success: "succeeded",
    successful: "succeeded",
    deployed: "succeeded",
    complete: "succeeded",
    completed: "succeeded",
    pending: "queued",
    waiting: "queued",
    in_progress: "building",
    inprogress: "building",
    processing: "building",
    error: "failed",
  };

  return aliases[value] ?? value;
}

function getDeploymentDate(deployment: Deployment): string {
  const value =
    deployment.createdAt ??
    deployment.created_at ??
    deployment.updatedAt ??
    deployment.updated_at;

  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getDeploymentVersion(deployment: Deployment): string {
  const version =
    deployment.version ??
    deployment.versionNumber ??
    deployment.version_number;

  if (version == null) {
    return `Deployment ${deployment.id}`;
  }

  const value = String(version);

  return value.startsWith("v") ? value : `v${value}`;
}

function getDeploymentUrl(deployment: Deployment): string | null {
  return (
    deployment.url ??
    deployment.deploymentUrl ??
    deployment.deployment_url ??
    null
  );
}

function getDeploymentLog(deployment: Deployment): string | null {
  return deployment.log ?? deployment.logs ?? null;
}

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [user, setUser] = useState<User>({});
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDeployments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get the authenticated user's projects first.
      const projectsResponse = await fetchJson<unknown>("/api/projects");
      const projects = extractRows<Project>(projectsResponse);

      // Fetch the authenticated user's account details.
      const userResponse = await fetchJson<unknown>("/api/auth/me");
      setUser(extractUser(userResponse));

      if (projects.length === 0) {
        setDeployments([]);
        return;
      }

      // The current API requires projectId, so query each project.
      const results = await Promise.all(
        projects.map(async (project) => {
          try {
            const response = await fetchJson<unknown>(
              `/api/deployments?projectId=${encodeURIComponent(
                String(project.id),
              )}`,
            );

            return extractRows<Deployment>(response).map((deployment) => ({
              ...deployment,
              projectId:
                deployment.projectId ??
                deployment.project_id ??
                project.id,
              projectName:
                deployment.projectName ??
                deployment.project_name ??
                project.name ??
                project.slug ??
                `Project ${project.id}`,
            }));
          } catch (err) {
            // A failed request should not hide successful deployments
            // from other projects.
            console.error(
              `Failed to load deployments for project ${project.id}:`,
              err,
            );

            throw err;
          }
        }),
      );

      const allDeployments = results.flat();

      // Avoid duplicate records if the API happens to return overlaps.
      const uniqueDeployments = Array.from(
        new Map(
          allDeployments.map((deployment) => [
            String(deployment.id),
            deployment,
          ]),
        ).values(),
      );

      uniqueDeployments.sort((a, b) => {
        const dateA = new Date(
          a.createdAt ?? a.created_at ?? a.updatedAt ?? a.updated_at ?? 0,
        ).getTime();

        const dateB = new Date(
          b.createdAt ?? b.created_at ?? b.updatedAt ?? b.updated_at ?? 0,
        ).getTime();

        return dateB - dateA;
      });

      setDeployments(uniqueDeployments);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load deployments.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDeployments();
  }, [loadDeployments]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return deployments.filter((deployment) => {
      const status = normalizeStatus(deployment.status);

      const matchesFilter =
        filter === "all" || status === filter;

      const searchableText = [
        getDeploymentVersion(deployment),
        deployment.id,
        deployment.projectName,
        deployment.target,
        getDeploymentUrl(deployment),
        status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesFilter && (!query || searchableText.includes(query));
    });
  }, [deployments, filter, search]);

  const displayName =
    user.displayName || user.email || "Account";

  return (
    <AppShell
      sidebarItems={sidebarItems}
      user={{
        name: displayName,
        email: user.email || "",
      }}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PageHeader
            title="Deployments"
            description="View build and deployment history for your projects."
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadDeployments()}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 text-white ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        <div className="mb-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <Input
              placeholder="Search deployments or projects..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs
            value={filter}
            onValueChange={(value) => setFilter(value as Filter)}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="building">Building</TabsTrigger>
              <TabsTrigger value="succeeded">Succeeded</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {error && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
          >
            <p className="font-medium">Could not load deployments</p>
            <p>{error}</p>

            <div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void loadDeployments()}
                disabled={loading}
              >
                Try again
              </Button>
            </div>
          </div>
        )}

        {loading && deployments.length === 0 ? (
          <div className="flex items-center justify-center gap-3 rounded-xl border border-zinc-200 p-12 text-sm text-zinc-500 dark:border-zinc-800">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading deployments...
          </div>
        ) : filtered.length === 0 ? (
          error ? null : (
            <EmptyState
              hasSearch={Boolean(search.trim()) || filter !== "all"}
            />
          )
        ) : (
          <div className="space-y-3">
            {filtered.map((deployment) => {
              const status = normalizeStatus(deployment.status);

              const meta =
                STATUS_META[status as keyof typeof STATUS_META] ??
                STATUS_META.queued;

              const IconComponent = meta.icon;
              const url = getDeploymentUrl(deployment);
              const log = getDeploymentLog(deployment);

              return (
                <Card
                  key={`${deployment.projectId ?? "project"}-${deployment.id}`}
                  className="border-zinc-200 dark:border-zinc-800"
                >
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        status === "building"
                          ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                          : status === "succeeded"
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : status === "failed"
                              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      <IconComponent
                        className={`h-5 w-5 ${
                          status === "building" ? "animate-spin" : ""
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {getDeploymentVersion(deployment)}
                        </span>

                        <Badge variant={meta.variant as never}>
                          {meta.label}
                        </Badge>
                      </div>

                      <p className="mt-1 truncate text-sm text-zinc-600 dark:text-zinc-400">
                        {deployment.projectName || "Project"}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {getDeploymentDate(deployment)}
                        {deployment.target ? ` · ${deployment.target}` : ""}
                      </p>
                    </div>

                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex max-w-full items-center gap-2 truncate text-sm text-emerald-600 hover:underline dark:text-emerald-400"
                      >
                        <span className="max-w-48 truncate">{url}</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </a>
                    )}

                    {log && status === "building" && (
                      <pre className="hidden max-w-[300px] whitespace-pre-wrap font-mono text-xs text-zinc-500 lg:block">
                        {log}
                      </pre>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-16 text-center dark:border-zinc-800 dark:bg-zinc-950">
      <Rocket className="mx-auto mb-4 h-12 w-12 text-zinc-400" />

      <h3 className="mb-2 text-lg font-medium text-zinc-900 dark:text-zinc-50">
        {hasSearch ? "No matching deployments" : "No deployments yet"}
      </h3>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {hasSearch
          ? "Try changing your search or status filter."
          : "Deploy a project to see its status here."}
      </p>
    </div>
  );
}