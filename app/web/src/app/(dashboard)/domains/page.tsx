/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Globe,
  Plus,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Loader2,
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
  platform_subdomain?: string | null;
  platformSubdomain?: string | null;
};

type Domain = {
  id: string | number;
  projectId?: string | number;
  project_id?: string | number;
  projectName?: string;
  project_name?: string;
  name?: string;
  domain?: string;
  domainName?: string;
  domain_name?: string;
  status?: string;
  tls?: string;
  tlsStatus?: string;
  tls_status?: string;
  verified?: boolean;
  dnsConfigured?: boolean;
  dns_configured?: boolean;
  verificationStatus?: string;
  verification_status?: string;
};

type User = {
  userId?: string | number;
  id?: string | number;
  email?: string;
  displayName?: string;
};

type FilteredProject = Project & {
  displayName: string;
};

const STATUS_META: Record<
  string,
  {
    variant: "success" | "secondary" | "warning" | "destructive";
    label: string;
  }
> = {
  active: { variant: "success", label: "Active" },
  verified: { variant: "secondary", label: "Verified" },
  pending: { variant: "warning", label: "Pending" },
  failed: { variant: "destructive", label: "Failed" },
  removed: { variant: "secondary", label: "Removed" },
};

const TLS_META: Record<
  string,
  {
    variant: "success" | "warning" | "destructive" | "secondary";
    label: string;
  }
> = {
  active: { variant: "success", label: "TLS Active" },
  issued: { variant: "success", label: "TLS Active" },
  ready: { variant: "success", label: "TLS Active" },
  pending: { variant: "warning", label: "Provisioning" },
  provisioning: { variant: "warning", label: "Provisioning" },
  failed: { variant: "destructive", label: "TLS Failed" },
  inactive: { variant: "secondary", label: "TLS Inactive" },
};

async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      body?.error?.message ??
        body?.message ??
        `Request failed with status ${response.status}.`,
    );
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
    domains?: unknown;
  };

  if (Array.isArray(result.domains)) {
    return result.domains as T[];
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

function getDomainName(domain: Domain): string {
  return (
    domain.domainName ??
    domain.domain_name ??
    domain.domain ??
    domain.name ??
    "Unnamed domain"
  );
}

function getDomainStatus(domain: Domain): string {
  const status = (domain.status ?? "pending").toLowerCase();

  if (status === "active" || status === "verified") {
    return status;
  }

  return STATUS_META[status] ? status : "pending";
}

function getTlsStatus(domain: Domain): string {
  const status = (
    domain.tlsStatus ??
    domain.tls_status ??
    domain.tls ??
    "pending"
  ).toLowerCase();

  return TLS_META[status] ? status : "pending";
}

function isDomainVerified(domain: Domain): boolean {
  if (typeof domain.verified === "boolean") {
    return domain.verified;
  }

  const verificationStatus =
    domain.verificationStatus ??
    domain.verification_status;

  if (verificationStatus) {
    return ["verified", "active", "success"].includes(
      verificationStatus.toLowerCase(),
    );
  }

  return ["active", "verified"].includes(getDomainStatus(domain));
}

function isDnsConfigured(domain: Domain): boolean {
  return (
    domain.dnsConfigured ??
    domain.dns_configured ??
    isDomainVerified(domain)
  );
}

function getProjectSubdomain(project: Project): string | null {
  return project.platform_subdomain ?? project.platformSubdomain ?? null;
}

function normalizeDomain(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "")
    .replace(/\.$/, "");
}

function isValidDomain(value: string): boolean {
  if (value.length > 253 || value.length === 0) {
    return false;
  }

  const labels = value.split(".");

  if (labels.length < 2) {
    return false;
  }

  return labels.every(
    (label) =>
      label.length >= 1 &&
      label.length <= 63 &&
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label),
  );
}

export default function DomainsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [user, setUser] = useState<User>({});

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [newDomain, setNewDomain] = useState("");

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadDomains = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [projectsResponse, userResponse] = await Promise.all([
        apiRequest<unknown>("/api/projects"),
        apiRequest<unknown>("/api/auth/me"),
      ]);

      const loadedProjects = extractRows<Project>(projectsResponse);
      const loadedUser = extractUser(userResponse);

      setProjects(loadedProjects);
      setUser(loadedUser);

      if (loadedProjects.length === 0) {
        setDomains([]);
        setSelectedProjectId("");
        return;
      }

      setSelectedProjectId((current) => {
        if (
          current &&
          loadedProjects.some(
            (project) => String(project.id) === current,
          )
        ) {
          return current;
        }

        return String(loadedProjects[0].id);
      });

      // The existing API requires a projectId for domain queries.
      const domainResults = await Promise.all(
        loadedProjects.map(async (project) => {
          const response = await apiRequest<unknown>(
            `/api/domains?projectId=${encodeURIComponent(
              String(project.id),
            )}`,
          );

          return extractRows<Domain>(response).map((domain) => ({
            ...domain,
            projectId:
              domain.projectId ??
              domain.project_id ??
              project.id,
            projectName:
              domain.projectName ??
              domain.project_name ??
              project.name ??
              project.slug ??
              `Project ${project.id}`,
          }));
        }),
      );

      const allDomains = domainResults.flat();

      // Deduplicate records returned by the API.
      const uniqueDomains = Array.from(
        new Map(
          allDomains.map((domain) => [
            `${domain.projectId ?? ""}:${domain.id}`,
            domain,
          ]),
        ).values(),
      );

      setDomains(uniqueDomains);
    } catch (err) {
      console.error("Failed to load domains:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your domains.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDomains();
  }, [loadDomains]);

  const platformSubdomains = useMemo(() => {
    return projects
      .map((project) => ({
        project,
        subdomain: getProjectSubdomain(project),
      }))
      .filter(
        (
          item,
        ): item is {
          project: Project;
          subdomain: string;
        } => Boolean(item.subdomain),
      );
  }, [projects]);

  const selectedProject = projects.find(
    (project) => String(project.id) === selectedProjectId,
  );

  async function handleAddDomain(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const domainName = normalizeDomain(newDomain);

    if (!selectedProjectId) {
      setError("Create a project before connecting a domain.");
      return;
    }

    if (!isValidDomain(domainName)) {
      setError("Enter a valid domain, for example mystie.com.");
      return;
    }

    setAdding(true);
    setError(null);
    setSuccess(null);

    try {
      await apiRequest("/api/domains", {
        method: "POST",
        body: JSON.stringify({
          projectId: selectedProjectId,
          domainName,
        }),
      });

      setNewDomain("");
      setSuccess(
        `${domainName} was submitted. Check its status below for verification progress.`,
      );

      await loadDomains();
    } catch (err) {
      console.error("Failed to add domain:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect this domain.",
      );
    } finally {
      setAdding(false);
    }
  }

  return (
    <AppShell
      sidebarItems={sidebarItems}
      user={{
        name: user.displayName || user.email || "Account",
        email: user.email || "",
      }}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PageHeader
            title="Domains"
            description="Manage platform subdomains and custom domain connections."
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadDomains()}
            disabled={loading}
            className="gap-2"
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
            className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-medium">Could not complete domain request</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <section>
          <PageHeader
            title="Platform subdomains"
            description="Platform addresses associated with your projects."
          />

          {loading && platformSubdomains.length === 0 ? (
            <LoadingState />
          ) : platformSubdomains.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Globe className="mx-auto mb-3 h-10 w-10 text-zinc-400" />
                <p className="font-medium">No platform subdomains available</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Your projects may not have a platform subdomain assigned yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {platformSubdomains.map(({ project, subdomain }) => (
                <Card
                  key={project.id}
                  className="border-emerald-200 dark:border-emerald-900/50"
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <Globe className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {project.name || project.slug || "Project"}
                      </p>

                      <a
                        href={`https://${subdomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex max-w-full items-center gap-1 truncate font-mono text-sm text-emerald-600 hover:underline dark:text-emerald-400"
                      >
                        {subdomain}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </div>

                    <Badge variant="success">Platform</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <PageHeader
            title="Custom domains"
            description={`${domains.length} connected domain${domains.length === 1 ? "" : "s"}.`}
          />

          {loading && domains.length === 0 ? (
            <LoadingState />
          ) : domains.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Globe className="mx-auto mb-3 h-10 w-10 text-zinc-400" />
                <p className="font-medium">No custom domains yet</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Connect a domain below to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {domains.map((domain) => {
                const status = getDomainStatus(domain);
                const tlsStatus = getTlsStatus(domain);

                const statusMeta = STATUS_META[status];
                const tlsMeta = TLS_META[tlsStatus];

                const verified = isDomainVerified(domain);
                const dnsConfigured = isDnsConfigured(domain);
                const domainName = getDomainName(domain);

                return (
                  <Card
                    key={`${domain.projectId ?? "project"}-${domain.id}`}
                    className="border-zinc-200 dark:border-zinc-800"
                  >
                    <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          verified
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {verified ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <AlertCircle className="h-5 w-5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {domainName}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          Project: {domain.projectName || "Unknown project"}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                            {dnsConfigured ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <AlertCircle className="h-3 w-3" />
                            )}
                            DNS {dnsConfigured ? "configured" : "pending"}
                          </span>

                          <Badge variant={tlsMeta.variant}>
                            {tlsMeta.label}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={statusMeta.variant}>
                          {statusMeta.label}
                        </Badge>

                        {verified && (
                          <a
                            href={`https://${domainName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open ${domainName}`}
                            className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Connect a custom domain</CardTitle>
            <CardDescription>
              Add a domain and associate it with one of your projects.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {projects.length === 0 && !loading ? (
              <p className="text-sm text-zinc-500">
                You need to create a project before connecting a custom domain.
              </p>
            ) : (
              <form onSubmit={handleAddDomain} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="domain-project"
                    className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Project
                  </label>

                  <select
                    id="domain-project"
                    value={selectedProjectId}
                    onChange={(event) =>
                      setSelectedProjectId(event.target.value)
                    }
                    disabled={loading || adding || projects.length === 0}
                    className="flex h-10 w-full max-w-md rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={String(project.id)}>
                        {project.name || project.slug || `Project ${project.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    id="domain-name"
                    placeholder="Enter your domain (e.g., mystie.com)"
                    value={newDomain}
                    onChange={(event) => setNewDomain(event.target.value)}
                    className="max-w-md"
                    disabled={adding}
                  />

                  <Button
                    type="submit"
                    disabled={
                      !newDomain.trim() ||
                      !selectedProjectId ||
                      adding ||
                      loading
                    }
                    className="gap-2"
                  >
                    {adding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}

                    {adding ? "Connecting..." : "Connect domain"}
                  </Button>
                </div>

                <p className="text-xs text-zinc-500">
                  DNS verification and TLS provisioning depend on your
                  backend's domain configuration.
                </p>

                {selectedProject && (
                  <p className="text-xs text-zinc-500">
                    Selected project:{" "}
                    {selectedProject.name ||
                      selectedProject.slug ||
                      selectedProject.id}
                  </p>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-3 rounded-xl border border-zinc-200 p-10 text-sm text-zinc-500 dark:border-zinc-800">
      <Loader2 className="h-5 w-5 animate-spin" />
      Loading domains...
    </div>
  );
}