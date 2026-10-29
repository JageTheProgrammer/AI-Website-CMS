"use client";

import { useEffect, useState } from "react";
import { AppShell, type NavItem } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sidebarItems: NavItem[] = [
  { label: "Overview", href: "/dashboard/admin" },
  { label: "Users", href: "/admin/users" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Audit Log", href: "/profile/admin/history" },
  { label: "Settings", href: "/profile/admin/settings" },
];

interface AuditLog {
  id: number | string;
  action: string;
  createdAt: string;
  actor?: string | null;
  resource?: string | null;
  resourceType?: string | null;
  resourceId?: string | number | null;
}

interface ActivityResponse {
  data?: AuditLog[];
  error?: {
    message?: string;
  };
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function AdminHistoryPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadActivity() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/admin/activity", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });

        const result: ActivityResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error?.message ?? "Failed to load audit logs.",
          );
        }

        setLogs(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadActivity();

    return () => controller.abort();
  }, []);

  return (
    <AppShell
      sidebarItems={sidebarItems}
      user={{ name: "Admin", email: "admin@cms.app" }}
    >
      <PageHeader
        title="Audit log"
        description="Platform-wide activity audit trail."
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-zinc-500">
              Loading audit logs...
            </div>
          ) : error ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 text-sm font-medium underline"
              >
                Try again
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-zinc-500">
              No activity has been recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="shrink-0">
                    <Badge variant="secondary">
                      {log.action || "Activity"}
                    </Badge>
                  </div>

                  <span className="min-w-0 flex-1 break-all text-sm text-zinc-700 dark:text-zinc-300">
                    {log.actor || "Unknown actor"}
                  </span>

                  <span className="break-all font-mono text-xs text-zinc-500">
                    {log.resource || (log.resourceType && log.resourceId
                      ? `${log.resourceType}:${log.resourceId}`
                      : "—")}
                  </span>

                  <span className="shrink-0 text-xs text-zinc-400">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}