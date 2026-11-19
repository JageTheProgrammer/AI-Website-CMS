/* eslint-disable react-hooks/globals */
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  Globe,
  Database,
  Code,
  FolderGit2,
  CreditCard,
  HelpCircle,
  Shield,
  Users,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ElementType;
}

export interface SidebarUser {
  name: string;
  email: string;
}

interface SidebarNavProps {
  items: NavItem[];
  /**
   * Optional so the sidebar can render before the user has loaded.
   * If omitted (or still loading), the last known user is shown instead,
   * and a skeleton is shown only on the very first load.
   */
  user?: SidebarUser | null;
  mobileOpen?: boolean;
  onNavigate?: () => void;
}

/**
 * Remembers the last known user for the lifetime of the tab, so a remounted
 * sidebar starts with the right name and email instead of an empty state.
 */
let cachedUser: SidebarUser | null = null;

export function clearSidebarUserCache() {
  cachedUser = null;
}

const SIDEBAR_ICONS: Record<string, React.ElementType> = {
  "/dashboard": LayoutDashboard,
  "/dashboard/customer": LayoutDashboard,
  "/dashboard/admin": LayoutDashboard,

  "/projects": FolderGit2,
  "/editor": Code,
  "/domains": Globe,
  "/deployments": Database,

  "/settings": Settings,
  "/profile/customer/settings": Settings,
  "/profile/admin/settings": Settings,

  "/billing": CreditCard,
  "/support": HelpCircle,
  "/admin": Shield,
  "/admin/users": Users,
  "/admin/projects": FolderGit2,
  "/users": Users,
  "/profile/admin/history": Database,
  "/profile/admin": User,
  "/profile/customer": User,
};

function NavIcon({
  Icon,
  className,
}: {
  Icon?: React.ElementType;
  className?: string;
}) {
  const IconComponent = Icon ?? User;

  return (
    <IconComponent
      aria-hidden="true"
      className={cn("h-[17px] w-[17px] shrink-0", className)}
    />
  );
}

function isNavItemActive(pathname: string, href: string) {
  if (pathname === href) return true;

  // Match nested editor/project pages without activating unrelated links.
  if (
    href === "/editor" ||
    href === "/projects" ||
    href === "/domains" ||
    href === "/deployments" ||
    href === "/admin" ||
    href === "/users"
  ) {
    return pathname.startsWith(`${href}/`);
  }

  return false;
}

export function SidebarNav({
  items,
  user,
  mobileOpen = false,
  onNavigate,
}: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  // Keep the cache fresh whenever a real user is passed in, and fall back to
  // it while the user is still loading after a remount.
  if (user?.name && user?.email) {
    cachedUser = { name: user.name, email: user.email };
  }
  const resolvedUser = user?.name && user?.email ? user : cachedUser;

  const profileHref = items.some((item) => item.href.startsWith("/profile/admin"))
    ? "/profile/admin"
    : items.some((item) => item.href.startsWith("/profile/customer"))
      ? "/profile/customer"
      : null;

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.error?.message ||
            "Failed to sign out. Please try again.",
        );
      }

      // Don't leak the previous account into the next session on this tab.
      clearSidebarUserCache();

      router.replace("/login");
      router.refresh();
    } catch (error) {
      setLogoutError(
        error instanceof Error
          ? error.message
          : "Failed to sign out. Please try again.",
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-white/[0.07] bg-[#090a0c] text-zinc-100 transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* Brand */}
      <Link
        href="/"
        aria-label="Polityra CMS home"
        onClick={onNavigate}
        className="group flex h-[65px] shrink-0 items-center gap-3 border-b border-white/[0.07] px-5 transition-colors hover:bg-white/[0.02]"
      >
        <Image
          src="/images/polityra-cms-logo-dark.png"
          alt="Polityra CMS"
          width={1040}
          height={312}
          priority
          unoptimized
          className="h-7 w-auto"
        />
        <ChevronRight className="ml-auto h-4 w-4 text-zinc-600 transition-colors group-hover:text-zinc-300" />
      </Link>

      {/* Navigation */}
      <nav
        aria-label="Main navigation"
        className="flex-1 space-y-1 overflow-y-auto px-3 py-5"
      >
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
          Workspace
        </p>

        {items.map((item) => {
          const isActive = isNavItemActive(pathname, item.href);
          const IconComponent =
            SIDEBAR_ICONS[item.href] ?? item.icon ?? User;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors duration-150",
                isActive
                  ? "border border-white/[0.08] bg-white/[0.06] text-white"
                  : "border border-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100",
              )}
            >
              {isActive && (
                <span className="absolute bottom-2 left-0 top-2 w-[2px] rounded-r-full bg-indigo-300" />
              )}

              <NavIcon
                Icon={IconComponent}
                className={cn(
                  "transition-colors",
                  isActive
                    ? "text-indigo-200"
                    : "text-zinc-500 group-hover:text-zinc-200",
                )}
              />

              <span className="min-w-0 flex-1 truncate">
                {item.label}
              </span>

              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-300" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Account */}
      <div className="shrink-0 border-t border-white/[0.07] p-3">
        {logoutError && (
          <div
            role="alert"
            className="mb-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3 py-2.5 text-xs leading-5 text-red-300"
          >
            {logoutError}
          </div>
        )}

        <Link
          href={profileHref ?? "#"}
          aria-label="Open profile"
          className="mb-2 flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.025] p-3 transition-colors hover:bg-white/[0.05]"
          onClick={(event) => {
            onNavigate?.();
            if (!profileHref) event.preventDefault();
          }}
        >
          <div className="relative shrink-0">
            <Avatar src={null} alt={resolvedUser?.name ?? "Account"} />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0d0e12] bg-emerald-400" />
          </div>

          {/* Fixed-height block so nothing shifts when the user loads */}
          <div className="min-w-0 flex-1">
            {resolvedUser ? (
              <>
                <p className="truncate text-[13px] font-medium text-zinc-200">
                  {resolvedUser.name}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                  {resolvedUser.email}
                </p>
              </>
            ) : (
              <div aria-hidden="true">
                <div className="h-[13px] w-24 animate-pulse rounded bg-white/[0.08]" />
                <div className="mt-1.5 h-[11px] w-32 animate-pulse rounded bg-white/[0.05]" />
              </div>
            )}
          </div>
        </Link>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 w-full justify-start gap-2.5 rounded-xl px-3 text-xs font-medium text-zinc-500 transition-colors hover:bg-red-500/[0.07] hover:text-red-300"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}

          {loggingOut ? "Signing out..." : "Sign out"}
        </Button>

        <p className="px-3 pb-1 pt-3 text-[10px] text-zinc-700">
          Polityra CMS
        </p>
      </div>
    </aside>
  );
}