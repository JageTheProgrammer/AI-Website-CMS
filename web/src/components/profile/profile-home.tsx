"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  History,
  Loader2,
  Settings,
  UserRound,
} from "lucide-react";
import { AppShell, type NavItem } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ProfileRole = "admin" | "customer";

interface Account {
  email: string;
  displayName?: string | null;
  role?: string;
}

const profileLinks = {
  admin: [
    { title: "Account settings", description: "Manage your profile details.", href: "/profile/admin/settings", icon: Settings },
    { title: "Audit log", description: "Review platform-wide activity.", href: "/profile/admin/history", icon: History },
    { title: "Payments", description: "View platform billing information.", href: "/profile/admin/payments", icon: CreditCard },
  ],
  customer: [
    { title: "Account settings", description: "Manage your profile details.", href: "/profile/customer/settings", icon: Settings },
    { title: "Activity history", description: "Review activity on your account.", href: "/profile/customer/history", icon: History },
    { title: "Payments", description: "View your payment information.", href: "/profile/customer/payments", icon: CreditCard },
  ],
} as const;

export function ProfileHome({ role }: { role: ProfileRole }) {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAccount() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "same-origin",
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result?.error?.message ?? "Could not load your account.");
        }

        const user = result?.data?.user ?? result?.data;
        if (!user || typeof user.email !== "string") {
          throw new Error("The account response was invalid.");
        }
        if (cancelled) return;
        if (user.role?.toLowerCase() !== role) {
          router.replace(role === "admin" ? "/dashboard/customer" : "/dashboard/admin");
          return;
        }
        setAccount(user);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Could not load your account.");
        }
      }
    }

    void loadAccount();
    return () => {
      cancelled = true;
    };
  }, [role, router]);

  const sidebarItems: NavItem[] =
    role === "admin"
      ? [
          { label: "Overview", href: "/dashboard/admin" },
          { label: "Users", href: "/admin/users" },
          { label: "Projects", href: "/admin/projects" },
          { label: "Audit Log", href: "/profile/admin/history" },
          { label: "Settings", href: "/profile/admin/settings" },
        ]
      : [
          { label: "Dashboard", href: "/dashboard/customer" },
          { label: "Projects", href: "/projects" },
          { label: "Deployments", href: "/deployments" },
          { label: "Domains", href: "/domains" },
          { label: "Settings", href: "/profile/customer/settings" },
        ];

  return (
    <AppShell
      sidebarItems={sidebarItems}
      user={{
        name: account?.displayName || (role === "admin" ? "Admin" : "Customer"),
        email: account?.email ?? "",
      }}
    >
      <PageHeader
        title="Profile"
        description="Manage your account and review account activity."
      />

      {error ? (
        <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-5 text-sm text-red-600 dark:text-red-300">
          {error}
        </div>
      ) : !account ? (
        <div className="flex items-center gap-2 py-12 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your profile...
        </div>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{account.displayName || "Your account"}</CardTitle>
                  <CardDescription>{account.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {profileLinks[role].map(({ title, description, href, icon: Icon }) => (
              <Link key={href} href={href} className="group block">
                <Card className="h-full transition-colors hover:border-zinc-400 dark:hover:border-zinc-600">
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="inline-flex items-center gap-2 text-sm font-medium">
                      Open
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
