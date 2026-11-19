/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
      [
        item.actor,
        typeof item.action === "string"
          ? item.action.replace(/[._]/g, " ")
          : null,
        item.resource ? `(${item.resource})` : null,
      ]
        .filter(Boolean)
        .join(" ") ??
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
      } catch {
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
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-400/[0.08]">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-300" />
          </div>
          <p className="text-sm text-zinc-500">
            Verifying administrator access...
          </p>
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
      <div className="space-y-8 text-zinc-100">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PageHeader
            title="Admin dashboard"
            description="Platform overview and management."
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadDashboardData()}
            disabled={dataLoading}
            className="gap-2 border-white/10 bg-white/[0.03] text-zinc-300 hover:border-indigo-400/30 hover:bg-white/[0.06] hover:text-white"
          >
            {dataLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh data
          </Button>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-5 text-sm text-red-300"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium text-red-200">
                Could not load all dashboard data
              </p>
              <p className="mt-1 leading-6">{error}</p>
            </div>
          </div>
        )}

        <section>
          <div className="mb-4">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">
              Platform overview
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((stat) => (
              <Card
                key={stat.label}
                className="group border-white/[0.08] bg-[#0d0e12] shadow-none transition-all duration-200 hover:border-indigo-400/20 hover:bg-[#101116]"
              >
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-500">{stat.label}</p>
                    <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-white">
                      {stat.value}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/[0.07] text-indigo-300 transition-colors group-hover:border-indigo-400/25 group-hover:bg-indigo-400/[0.12]">
                    {stat.icon}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <Card className="border-white/[0.08] bg-[#0d0e12] shadow-none">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-white">
                    Recent activity
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Latest recorded platform events.
                  </p>
                </div>

                <Link
                  href="/profile/admin/history"
                  className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-indigo-400/30 hover:text-indigo-200"
                >
                  View audit log
                </Link>
              </div>

              {activity.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/[0.08] px-5 py-12 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
                    <RefreshCw className="h-4 w-4 text-zinc-500" />
                  </div>
                  <p className="text-sm text-zinc-400">
                    No recent activity is available.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.06]">
                  {activity.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-400/80 ring-4 ring-indigo-400/[0.08]" />
                        <span className="text-sm leading-6 text-zinc-300">
                          {item.message}
                        </span>
                      </div>

                      <span className="shrink-0 pl-5 text-xs text-zinc-500 sm:pl-0">
                        {formatTime(item)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>

  );
}
