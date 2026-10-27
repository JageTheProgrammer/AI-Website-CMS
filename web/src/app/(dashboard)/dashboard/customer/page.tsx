/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  LayoutDashboard,
  FolderGit2,
  Rocket,
  CreditCard,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { type NavItem } from "@/components/layout/sidebar-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const sidebarItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/customer" },
  { label: "Projects", href: "/projects" },
  { label: "Deployments", href: "/deployments" },
  { label: "Domains", href: "/domains" },
  { label: "Settings", href: "/profile/customer/settings" },
];

type Project = {
  id: string | number;
  name: string;
  slug: string;
  status: string;
  framework?: string | null;
  current_version_number?: number | null;
  currentVersionNumber?: number | null;
  version?: number | null;
  platform_subdomain?: string | null;
  platformSubdomain?: string | null;
  updated_at?: string | null;
  updatedAt?: string | null;
};

type DashboardUser = {
  id?: string | number;
  userId?: string | number;
  name?: string | null;
  displayName?: string | null;
  full_name?: string | null;
  fullName?: string | null;
  email?: string | null;
  role?: string | null;
  status?: string | null;
  plan?: string | null;
  subscription?: {
    plan?: string | null;
    name?: string | null;
  } | null;
};

type DashboardData = {
  projects: Project[];
  deployments: unknown[];
  user: DashboardUser;
};

const STATUS_BADGE: Record<
  string,
  {
    variant:
    | "default"
    | "secondary"
    | "destructive"
    | "success"
    | "warning";
    label: string;
  }
> = {
  draft: { variant: "secondary", label: "Draft" },
  generating: { variant: "warning", label: "Generating" },
  ready: { variant: "success", label: "Ready" },
  published: { variant: "default", label: "Published" },
  deploying: { variant: "warning", label: "Deploying" },
  archived: { variant: "secondary", label: "Archived" },
  failed: { variant: "destructive", label: "Failed" },
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

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    const body = await response.text().catch(() => "");

    throw new Error(
      `Request failed (${response.status}) for ${url}${body ? `: ${body.slice(0, 180)}` : ""
      }`,
    );
  }

  return response.json() as Promise<T>;
}

function extractRows<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const data = response as {
    data?: unknown;
    projects?: unknown;
    deployments?: unknown;
  };

  if (Array.isArray(data.data)) {
    return data.data as T[];
  }

  if (Array.isArray(data.projects)) {
    return data.projects as T[];
  }

  if (Array.isArray(data.deployments)) {
    return data.deployments as T[];
  }

  return [];
}

function extractUser(response: unknown): DashboardUser {
  if (!response || typeof response !== "object") {
    return {};
  }

  const result = response as {
    user?: DashboardUser;
    data?: DashboardUser | { user?: DashboardUser };
  };

  if (result.user) {
    return result.user;
  }

  if (result.data && typeof result.data === "object") {
    if ("user" in result.data && result.data.user) {
      return result.data.user;
    }

    return result.data as DashboardUser;
  }

  return response as DashboardUser;
}

function getProjectVersion(project: Project): number {
  return (
    project.current_version_number ??
    project.currentVersionNumber ??
    project.version ??
    0
  );
}

function getProjectSubdomain(project: Project): string | null {
  return project.platform_subdomain ?? project.platformSubdomain ?? null;
}

function getProjectUpdatedAt(project: Project): string | null {
  return project.updated_at ?? project.updatedAt ?? null;
}

function formatDate(value: string | null): string {
  if (!value) return "Not updated yet";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function getDisplayName(user: DashboardUser): string {
  return (
    user.displayName ||
    user.full_name ||
    user.fullName ||
    user.name ||
    user.email ||
    "Account"
  );
}

function getPlan(user: DashboardUser): string {
  return user.subscription?.plan || user.subscription?.name || user.plan || "—";
}

export default function CustomerDashboardPage() {
  const [dashboard, setDashboard] = React.useState<DashboardData>({
    projects: [],
    deployments: [],
    user: {},
  });

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const router = useRouter();

  const loadDashboard = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Verify the signed-in user before requesting customer data.
      const userResponse = await fetchJson<unknown>("/api/auth/me");
      const user = extractUser(userResponse);

      if (!user.email) {
        router.replace("/login");
        return;
      }

      const role = user.role?.toLowerCase();

      if (role === "admin") {
        router.replace("/dashboard/admin");
        return;
      }

      if (role !== "customer") {
        setError("Your account does not have permission to access this dashboard.");
        return;
      }

      // Step 2: Only load customer data after verifying the role.
      const projectsResponse = await fetchJson<unknown>("/api/projects");
      const projects = extractRows<Project>(projectsResponse);

      // Step 3: Load deployments for the customer's own projects.
      const deploymentResponses = await Promise.all(
        projects.map((project) =>
          fetchJson<unknown>(
            `/api/deployments?projectId=${encodeURIComponent(String(project.id))}`,
          ),
        ),
      );

      const deployments = deploymentResponses.flatMap((response) =>
        extractRows<unknown>(response),
      );

      setDashboard({
        projects,
        deployments,
        user,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load your dashboard.";

      setError(message);

      if (
        message.toLowerCase().includes("session has expired") ||
        message.toLowerCase().includes("unauthenticated") ||
        message.toLowerCase().includes("invalid session")
      ) {
        router.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);


  const { projects, deployments, user } = dashboard;

  return (
    <AppShell
      sidebarItems={sidebarItems}
      user={{
        name: getDisplayName(user),
        email: user.email || "",
      }}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PageHeader
            title="Dashboard"
            description="Overview of your projects and account."
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadDashboard()}
            disabled={loading}
            className="text-white gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {error && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
          >
            <p className="font-medium">Could not load dashboard data</p>
            <p>{error}</p>
            <div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void loadDashboard()}
              >
                Try again
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            label="Projects"
            value={loading ? "…" : projects.length}
            icon={<FolderGit2 className="h-5 w-5" />}
          />

          <StatCard
            label="Deployments"
            value={loading ? "…" : deployments.length}
            icon={<Rocket className="h-5 w-5" />}
          />

          <StatCard
            label="Plan"
            value={loading ? "…" : getPlan(user)}
            icon={<CreditCard className="h-5 w-5" />}
          />
        </div>

        <section>
          <PageHeader
            title="Your projects"
            description={
              loading
                ? "Loading your projects…"
                : `${projects.length} project${projects.length === 1 ? "" : "s"}`
            }
            action={
              <Link href="/projects/new">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New project
                </Button>
              </Link>
            }
          />

          {loading && projects.length === 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <Card key={item} className="animate-pulse">
                  <CardContent className="space-y-4 p-6">
                    <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 && !error ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
              <FolderGit2 className="mx-auto mb-4 h-12 w-12 text-zinc-400" />

              <h3 className="mb-2 text-lg font-medium text-zinc-900 dark:text-zinc-50">
                No projects yet
              </h3>

              <p className="mx-auto mb-6 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
                Create your first project and generate a website with AI.
              </p>

              <Link href="/projects/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Start building
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}

              <Link
                href="/projects/new"
                className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-200 bg-white p-6 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700">
                  <Plus className="h-6 w-6 text-zinc-400" />
                </div>

                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  New project
                </span>
              </Link>
            </div>
          )}
        </section>

        <section>
          <PageHeader
            title="Account"
            description="Your currently authenticated account."
          />

          <Card>
            <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  {loading ? "Loading account…" : getDisplayName(user)}
                </p>

                <p className="mt-1 break-all text-sm text-zinc-500 dark:text-zinc-400">
                  {user.email || (loading ? "Loading…" : "Email unavailable")}
                </p>
              </div>

              <Link href="/profile/customer/settings">
                <Button variant="outline" size="sm" className="text-white gap-2">
                  Account settings
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{label}</p>

          <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {value}
          </p>
        </div>

        <div className="text-zinc-500 dark:text-zinc-400">{icon}</div>
      </CardContent>
    </Card>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const normalizedStatus = (project.status || "draft").toLowerCase();
  const badge = STATUS_BADGE[normalizedStatus] ?? STATUS_BADGE.draft;

  const subdomain = getProjectSubdomain(project);
  const version = getProjectVersion(project);
  const updatedAt = getProjectUpdatedAt(project);

  return (
    <Link
      href={`/editor/${encodeURIComponent(project.slug)}`}
      className="block h-full"
    >
      <Card className="h-full cursor-pointer transition-all hover:border-zinc-300 hover:shadow-sm dark:hover:border-zinc-700">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="min-w-0 flex-1 truncate text-base">
              {project.name}
            </CardTitle>

            <Badge variant={badge.variant as never}>{badge.label}</Badge>
          </div>

          <CardDescription className="truncate text-xs">
            {project.slug}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
            {project.framework || "Website"} · v{version}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>Updated {formatDate(updatedAt)}</span>

            {subdomain && (
              <span className="flex min-w-0 items-center gap-1">
                <Rocket className="h-3 w-3 shrink-0" />
                <span className="max-w-40 truncate">{subdomain}</span>
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}