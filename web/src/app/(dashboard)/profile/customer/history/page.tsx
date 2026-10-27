"use client";

import { useEffect, useState } from "react";
import { AppShell, type NavItem } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sidebarItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/customer" },
  { label: "Projects", href: "/projects" },
  { label: "Deployments", href: "/deployments" },
  { label: "Domains", href: "/domains" },
  { label: "Settings", href: "/profile/customer/settings" },
];

type ActivityType = "generation" | "deployment" | "domain" | "project";

interface ActivityLog {
  id: string | number;
  action: string;
  date?: string;
  createdAt?: string;
  type?: ActivityType;
}

interface ActivityResponse {
  data?: ActivityLog[];
  error?: {
    message?: string;
  };
}

const TYPE_BADGE: Record<ActivityType, "default" | "success" | "secondary" | "warning"> = {
  generation: "default",
  deployment: "success",
  domain: "secondary",
  project: "warning",
};

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function CustomerHistoryPage() {
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadActivity() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/customer/activity", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });

        const result: ActivityResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error?.message ?? "Failed to load activity history.",
          );
        }

        setActivity(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

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
      user={{ name: "Customer", email: "" }}
    >
      <PageHeader
        title="Activity history"
        description="Track your recent actions."
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-zinc-500">
              Loading activity...
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
          ) : activity.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-zinc-500">
              No activity has been recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {activity.map((log) => {
                const type: ActivityType =
                  log.type && log.type in TYPE_BADGE
                    ? log.type
                    : "project";

                return (
                  <div
                    key={log.id}
                    className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <div className="shrink-0">
                      <Badge variant={TYPE_BADGE[type]}>
                        {type}
                      </Badge>
                    </div>

                    <p className="min-w-0 flex-1 break-words text-sm text-zinc-900 dark:text-zinc-50">
                      {log.action}
                    </p>

                    <span className="shrink-0 text-xs text-zinc-400">
                      {formatDate(log.createdAt ?? log.date)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}