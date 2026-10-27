"use client";

import { useEffect, useState } from "react";
import { AppShell, type NavItem } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/types";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

const sidebarItems: NavItem[] = [
  { label: "Overview", href: "/dashboard/admin" },
  { label: "Users", href: "/admin/users" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Audit Log", href: "/profile/admin/history" },
  { label: "Settings", href: "/profile/admin/settings" },
];

interface AdminUser {
  id: number | string;
  email: string;
  display_name: string | null;
  role: string;
  status: string;
  created_at: string;
  project_count: number;
}

interface ApiResponse {
  data?: AdminUser[];
  error?: {
    message?: string;
  };
}

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/admin/users", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });

        const result: ApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error?.message ?? "Failed to load users.",
          );
        }

        setUsers(Array.isArray(result.data) ? result.data : []);
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

    void loadUsers();

    return () => controller.abort();
  }, []);

  return (
    <AppShell
      sidebarItems={sidebarItems}
      user={{ name: "Admin", email: "admin@cms.app" }}
    >
      <PageHeader
        title="Users"
        description="Manage platform users."
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-zinc-500">
              Loading users...
            </div>
          ) : error ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
              >
                Try again
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-zinc-500">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                    <th className="px-6 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">
                      Email
                    </th>
                    <th className="hidden px-6 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300 sm:table-cell">
                      Role / Status
                    </th>
                    <th className="hidden px-6 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300 sm:table-cell">
                      Projects
                    </th>
                    <th className="hidden px-6 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300 md:table-cell">
                      Joined
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/50"
                    >
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">
                        {user.display_name?.trim() || "Unnamed user"}
                      </td>

                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                        {user.email}
                      </td>

                      <td className="hidden px-6 py-4 sm:table-cell">
                        <div className="flex flex-col gap-1">
                          <span className="capitalize text-zinc-700 dark:text-zinc-300">
                            {user.role}
                          </span>
                          <span className="text-xs capitalize text-zinc-500">
                            {user.status}
                          </span>
                        </div>
                      </td>

                      <td className="hidden px-6 py-4 text-zinc-500 sm:table-cell">
                        {Number(user.project_count) || 0}
                      </td>

                      <td className="hidden px-6 py-4 text-zinc-500 md:table-cell">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}