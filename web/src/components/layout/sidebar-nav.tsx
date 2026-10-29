
"use client";

import Link from "next/link";
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
  Sparkles,
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

interface SidebarNavProps {
  items: NavItem[];
  user: { name: string; email: string };
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

export function SidebarNav({ items, user }: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
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
    <aside className="flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-white/[0.07] bg-[#08090b] text-zinc-100">
      {/* Brand */}
      <Link
        href="/"
        aria-label="AI CMS home"
        className="group flex h-[65px] shrink-0 items-center gap-3 border-b border-white/[0.07] px-5 transition-colors hover:bg-white/[0.02]"
      >
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/20 via-indigo-500/10 to-violet-500/10 shadow-[0_0_20px_rgba(99,102,241,0.08)]">
          <Sparkles className="h-[18px] w-[18px] text-indigo-300 transition-transform duration-200 group-hover:scale-110" />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[15px] font-semibold tracking-tight text-white">
            AI
          </span>
          <span className="text-[15px] font-medium tracking-tight text-zinc-400">
            CMS
          </span>
        </div>

        <ChevronRight className="ml-auto h-4 w-4 text-zinc-700 transition-all group-hover:translate-x-0.5 group-hover:text-zinc-400" />
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
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "border border-indigo-400/15 bg-indigo-400/[0.09] text-indigo-200"
                  : "border border-transparent text-zinc-500 hover:bg-white/[0.035] hover:text-zinc-200",
              )}
            >
              {isActive && (
                <span className="absolute bottom-2 left-0 top-2 w-[2px] rounded-r-full bg-indigo-400" />
              )}

              <NavIcon
                Icon={IconComponent}
                className={cn(
                  "transition-colors",
                  isActive
                    ? "text-indigo-300"
                    : "text-zinc-600 group-hover:text-zinc-300",
                )}
              />

              <span className="min-w-0 flex-1 truncate">
                {item.label}
              </span>

              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
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
          className="mb-2 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 transition-colors hover:bg-white/[0.05]"
          onClick={(event) => {
            if (!profileHref) event.preventDefault();
          }}
        >
          <div className="relative shrink-0">
            <Avatar src={null} alt={user.name} />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0d0e12] bg-emerald-400" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-zinc-200">
              {user.name}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-zinc-500">
              {user.email}
            </p>
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
          AI CMS · Website builder
        </p>
      </div>
    </aside>
  );
}
