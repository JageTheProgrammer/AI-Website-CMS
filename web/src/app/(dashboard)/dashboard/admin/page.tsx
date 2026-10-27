/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderGit2,
  Shield,
  Users,
  DollarSign,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { AppShell, type NavItem } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const sidebarItems: NavItem[] = [
  { label: "Overview", href: "/dashboard/admin" },
  { label: "Users", href: "/admin/users" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Audit Log", href: "/profile/admin/history" },
  { label: "Settings", href: "/profile/admin/settings" },
];

interface AdminUser {
  userId?: number | string;
  id?: number | string;
  email: string;
  displayName?: string | null;
  name?: string | null;
  role: string;
  status?: string;
}

interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  activeSubscriptions: number;
  revenueThisMonth: number;
}

interface Activity {
  id: string | number;
  message: string;
  createdAt?: string;
  timeAgo?: string;
}

const emptyStats: AdminStats = {
  totalUsers: 0,
  totalProjects: 0,
  activeSubscriptions: 0,
  revenueThisMonth: 0,
};

async function apiGet(path: string) {
  const response = await fetch(path, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result?.error?.message ||
        result?.message ||
        `Request failed (${response.status}).`,
    );
  }

  return result;
}

function unwrapData(result: any): any {
  return result?.data ?? result;
}

function extractUser(result: any): AdminUser {
  const user = unwrapData(result)?.user ?? unwrapData(result);

  if (!user || typeof user.email !== "string") {
    throw new Error("Could not verify your account.");
  }

  return user as AdminUser;
}

function extractStats(result: any): AdminStats {
  const value = unwrapData(result)?.stats ?? unwrapData(result) ?? {};

  return {
    totalUsers: Number(value.totalUsers ?? value.total_users ?? 0),
    totalProjects: Number(value.totalProjects ?? value.total_projects ?? 0),
    activeSubscriptions: Number(
      value.activeSubscriptions ?? value.active_subscriptions ?? 0,
    ),
    revenueThisMonth: Number(
      value.revenueThisMonth ??
        value.revenue_this_month ??
        value.revenueMTD ??
        value.revenue_mtd ??
        0,
    ),
  };
}

function extractActivity(result: any): Activity[] {
  const value = unwrapData(result);
  const items = Array.isArray(value)
    ? value
    : value?.activity ?? value?.activities ?? value?.items ?? [];

  if (!Array.isArray(items)) return [];

  return items.map((item: any, index: number) => ({
    id: item.id ?? item.eventId ?? index,
    message:
      item.message ??
      item.description ??
      item.action ??
      "Activity recorded",
    createdAt: item.createdAt ?? item.created_at,
    timeAgo: item.timeAgo ?? item.time_ago,
  }));
}

function formatTime(activity: Activity) {
  if (activity.timeAgo) return activity.timeAgo;
  if (!activity.createdAt) return "Recent";

  const date = new Date(activity.createdAt);
  if (Number.isNaN(date.getTime())) return "Recent";

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString();
}

function formatRevenue(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [stats, setStats] = useState<AdminStats>(emptyStats);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDashboardData = useCallback(async () => {
    setDataLoading(true);
    setError("");

    try {
      const [statsResult, activityResult] = await Promise.all([
        apiGet("/api/admin/stats"),
        apiGet("/api/admin/activity"),
      ]);

      setStats(extractStats(statsResult));
      setActivity(extractActivity(activityResult));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load admin dashboard data.",
      );
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function verifyAdmin() {
      try {
        const result = await apiGet("/api/auth/me");
        const account = extractUser(result);

        if (cancelled) return;

        if (account.role?.toLowerCase() !== "admin") {
          router.replace("/dashboard/customer");
          return;
        }

        setUser(account);

        // Load admin-only data only after the role check succeeds.
        const [statsResult, activityResult] = await Promise.all([
          apiGet("/api/admin/stats"),
          apiGet("/api/admin/activity"),
        ]);

        if (cancelled) return;

        setStats(extractStats(statsResult));
        setActivity(extractActivity(activityResult));
      } catch (err) {
        if (cancelled) return;

        // An unauthenticated or unverifiable session must not see the dashboard.
        router.replace("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void verifyAdmin();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Total Projects",
      value: stats.totalProjects.toLocaleString(),
      icon: <FolderGit2 className="h-5 w-5" />,
    },
    {
      label: "Active Subscriptions",
      value: stats.activeSubscriptions.toLocaleString(),
      icon: <Shield className="h-5 w-5" />,
    },
    {
      label: "Revenue (MTD)",
      value: formatRevenue(stats.revenueThisMonth),
      icon: <DollarSign className="h-5 w-5" />,
    },
  ];

  if (loading || !user) {
    return (
      <AppShell
        sidebarItems={sidebarItems}
        user={{ name: "Loading...", email: "" }}
      >
        <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm text-zinc-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Verifying administrator access...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      sidebarItems={sidebarItems}
      user={{
        name: user.displayName || user.name || "Administrator",
        email: user.email,
      }}
    >
      <PageHeader
        title="Admin dashboard"
        description="Platform overview and management."
      />

      <div className="mb-6 flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void loadDashboardData()}
          disabled={dataLoading}
        >
          {dataLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh data
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Could not load all dashboard data</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {stat.value}
                </p>
              </div>
              <div className="text-zinc-500 dark:text-zinc-400">
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Recent activity
          </h3>

          {activity.length === 0 ? (
            <p className="py-6 text-sm text-zinc-500">
              No recent activity is available.
            </p>
          ) : (
            <div className="space-y-3">
              {activity.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-1 border-b border-zinc-100 pb-3 text-sm last:border-0 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {item.message}
                  </span>
                  <span className="shrink-0 text-zinc-400">
                    {formatTime(item)}
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
