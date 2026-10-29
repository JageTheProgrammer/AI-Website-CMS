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
      
{/* Dashboard content wrapper */}
<div className="flex flex-col gap-8 text-zinc-100">
  {/* Header actions */}
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
      className="gap-2 border-white/10 bg-white/[0.03] text-zinc-300 hover:border-indigo-400/30 hover:bg-white/[0.06] hover:text-white"
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
      className="flex flex-col gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-5 text-sm text-red-300"
    >
      <p className="font-medium text-red-200">
        Could not load dashboard data
      </p>
      <p>{error}</p>
      <div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => void loadDashboard()}
          className="border-red-500/20 bg-transparent text-red-200 hover:bg-red-500/10"
        >
          Try again
        </Button>
      </div>
    </div>
  )}

  {/* Statistics */}
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

  {/* Projects */}
  <section className="space-y-5">
    <PageHeader
      title="Your projects"
      description={
        loading
          ? "Loading your projects…"
          : `${projects.length} project${projects.length === 1 ? "" : "s"}`
      }
      action={
        <Link href="/projects/new">
          <Button
            size="sm"
            className="gap-2 bg-indigo-500 text-white shadow-lg shadow-indigo-500/10 hover:bg-indigo-400"
          >
            <Plus className="h-4 w-4" />
            New project
          </Button>
        </Link>
      }
    />

    {loading && projects.length === 0 ? (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6"
          >
            <div className="h-4 w-2/3 rounded bg-white/[0.08]" />
            <div className="mt-4 h-3 w-1/2 rounded bg-white/[0.06]" />
            <div className="mt-6 h-3 w-full rounded bg-white/[0.06]" />
          </div>
        ))}
      </div>
    ) : projects.length === 0 && !error ? (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-400/[0.08]">
          <FolderGit2 className="h-6 w-6 text-indigo-300" />
        </div>

        <h3 className="text-lg font-semibold tracking-tight text-white">
          No projects yet
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-400">
          Create your first project and generate a website with AI.
        </p>

        <Link href="/projects/new" className="mt-6 inline-flex">
          <Button className="gap-2 bg-indigo-500 text-white hover:bg-indigo-400">
            <Plus className="h-4 w-4" />
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
          className="group flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-6 transition-all hover:border-indigo-400/30 hover:bg-indigo-400/[0.035]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] transition-colors group-hover:border-indigo-400/30 group-hover:bg-indigo-400/[0.08]">
            <Plus className="h-5 w-5 text-zinc-500 transition-colors group-hover:text-indigo-300" />
          </div>
          <span className="text-sm font-medium text-zinc-400 transition-colors group-hover:text-white">
            New project
          </span>
        </Link>
      </div>
    )}
  </section>

  {/* Account */}
  <section className="space-y-5">
    <PageHeader
      title="Account"
      description="Your currently authenticated account."
    />

    <Card className="border-white/[0.08] bg-[#0d0e12] shadow-none">
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-medium text-white">
            {loading ? "Loading account…" : getDisplayName(user)}
          </p>
          <p className="mt-1 break-all text-sm text-zinc-500">
            {user.email || (loading ? "Loading…" : "Email unavailable")}
          </p>
        </div>

        <Link href="/profile/customer/settings">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-white/10 bg-white/[0.03] text-zinc-300 hover:border-indigo-400/30 hover:bg-white/[0.06] hover:text-white"
          >
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
    <Card className="group border-white/[0.08] bg-[#0d0e12] shadow-none transition-all duration-200 hover:border-indigo-400/20 hover:bg-[#101116]">
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-zinc-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/[0.07] text-indigo-300 transition-colors group-hover:border-indigo-400/25 group-hover:bg-indigo-400/[0.12]">
          {icon}
        </div>
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
      <Card className="h-full border-white/[0.08] bg-[#0d0e12] shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400/25 hover:bg-[#101116]">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="min-w-0 flex-1 truncate text-base font-medium text-zinc-100">
              {project.name}
            </CardTitle>

            <Badge variant={badge.variant as never}>
              {badge.label}
            </Badge>
          </div>

          <CardDescription className="truncate text-xs text-zinc-500">
            {project.slug}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="mb-4 text-xs text-zinc-500">
            {project.framework || "Website"} · v{version}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-4 text-xs text-zinc-500">
            <span>Updated {formatDate(updatedAt)}</span>

            {subdomain && (
              <span className="flex min-w-0 items-center gap-1.5 text-indigo-300/80">
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
