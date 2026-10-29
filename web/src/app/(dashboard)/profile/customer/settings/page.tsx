/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell, type NavItem } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/layout/types";
import {
  UserRound,
  History,
  CreditCard,
  Settings,
  ArrowRight,
  Loader2,
} from "lucide-react";

const sidebarItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/customer" },
  { label: "Projects", href: "/projects" },
  { label: "Deployments", href: "/deployments" },
  { label: "Domains", href: "/domains" },
  { label: "Settings", href: "/profile/customer/settings" },
];

interface Customer {
  userId?: number | string;
  id?: number | string;
  email: string;
  displayName?: string | null;
  name?: string | null;
  role?: string;
  status?: string;
}

async function readResponse(response: Response) {
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result?.error?.message ||
        result?.message ||
        "The request could not be completed.",
    );
  }

  return result;
}

function extractCustomer(result: any): Customer {
  const customer = result?.data?.user ?? result?.data ?? result?.user ?? result;

  if (!customer || typeof customer.email !== "string") {
    throw new Error("Your account information could not be loaded.");
  }

  return customer as Customer;
}

export default function CustomerSettingsPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const loadCustomer = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result = await readResponse(response);
      const account = extractCustomer(result);

      setCustomer(account);
      setDisplayName(account.displayName ?? account.name ?? "");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load your account.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCustomer();
  }, [loadCustomer]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);

    const trimmedName = displayName.trim();

    if (!trimmedName) {
      setError("Display name cannot be empty.");
      return;
    }

    setSaving(true);

    try {
      // Requires a matching Next.js API route and Express endpoint.
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: trimmedName }),
      });

      const result = await readResponse(response);
      const updated = result?.data?.user ?? result?.data ?? result?.user;

      setCustomer((previous) =>
        previous
          ? {
              ...previous,
              ...(updated && typeof updated === "object" ? updated : {}),
              displayName: trimmedName,
            }
          : previous,
      );
      setDisplayName(trimmedName);
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save your profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  const accountName =
    customer?.displayName || customer?.name || "Customer";

  return (
    <AppShell
      sidebarItems={sidebarItems}
      user={{
        name: accountName,
        email: customer?.email ?? "",
      }}
    >
      <PageHeader
        title="Settings"
        description="Manage your account, profile, history, and payments."
      />

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
        >
          {error}
        </div>
      )}

      {saved && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400"
        >
          Profile updated successfully.
        </div>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Link href="/profile/customer" className="group block">
          <Card className="h-full transition-colors hover:border-zinc-400 dark:hover:border-zinc-600">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <UserRound className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">My profile</CardTitle>
              <CardDescription>
                View your customer profile and account details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                View profile
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/profile/customer/history" className="group block">
          <Card className="h-full transition-colors hover:border-zinc-400 dark:hover:border-zinc-600">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <History className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">Customer history</CardTitle>
              <CardDescription>
                Review your previous activity and account history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                View history
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link href="payments" className="group block">
          <Card className="h-full transition-colors hover:border-zinc-400 dark:hover:border-zinc-600">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <CreditCard className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">Payments</CardTitle>
              <CardDescription>
                Manage billing and review your payment information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                View payments
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="mb-6 max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-zinc-500" />
            <CardTitle className="text-base">Profile settings</CardTitle>
          </div>
          <CardDescription>
            Update your display name. Your email address is managed by your
            account and cannot be changed here.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 py-6 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading account information...
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="displayName"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Display name
                </label>
                <Input
                  id="displayName"
                  name="displayName"
                  autoComplete="name"
                  value={displayName}
                  onChange={(event) => {
                    setDisplayName(event.target.value);
                    setSaved(false);
                  }}
                  maxLength={100}
                  required
                  disabled={saving}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={customer?.email ?? ""}
                  disabled
                  readOnly
                />
              </div>

              {customer?.role && (
                <div className="text-sm text-zinc-500">
                  Account type:{" "}
                  <span className="font-medium capitalize">
                    {customer.role}
                  </span>
                </div>
              )}

              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="max-w-2xl border-red-200 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="text-base text-red-700 dark:text-red-400">
            Danger zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4">
            Account deletion is permanent. Contact support if you need your
            account deleted until a verified account-deletion endpoint is
            available.
          </CardDescription>
          <Button variant="destructive" size="sm" disabled>
            Delete account
          </Button>
        </CardContent>
      </Card>
    </AppShell>
  );
}
