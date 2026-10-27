"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, LogOut, Settings, User, FileText, Plus, Globe, Database, Code, FolderGit2, CreditCard, HelpCircle, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";

import { useRouter } from "next/navigation";
import { useState } from "react";


export interface NavItem {
  label: string;
  href: string;
  icon?: React.ElementType;
}

interface SidebarNavProps {
  items: NavItem[];
  user: { name: string; email: string };
}

function NavIcon({ Icon, className }: { Icon?: React.ElementType; className?: string }) {
  if (Icon) return <Icon className={cn("h-4 w-4 shrink-0", className)} />;
  return <User className={cn("h-4 w-4 shrink-0", className)} />;
}

const SIDEBAR_ICONS: Record<string, React.ElementType> = {
  "/dashboard": LayoutDashboard,
  "/dashboard/customer": LayoutDashboard,

  "/projects": FolderGit2,
  "/editor": Code,
  "/domains": Globe,
  "/deployments": Database,

  "/settings": Settings,
  "/profile/customer/settings": Settings,

  "/billing": CreditCard,
  "/support": HelpCircle,
  "/admin": Shield,
  "/users": Users,
};


export function SidebarNav({ items, user }: SidebarNavProps) {
  const pathname = usePathname();

  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

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
          result?.error?.message || "Failed to sign out. Please try again.",
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
    <aside className="flex h-screen w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <Link href={"/"}>

        <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center dark:bg-zinc-100">
            <span className="text-sm font-bold text-white dark:text-zinc-900">AI</span>
          </div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">CMS</span>
        </div>
      </Link>


      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const IconComp = SIDEBAR_ICONS[item.href] ?? item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
              )}
            >
              {IconComp && <NavIcon Icon={IconComp} />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 px-3 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3 mb-3">
          <Avatar src={null} alt={user.name} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-900 truncate dark:text-zinc-50">{user.name}</p>
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          </div>
        </div>
        {logoutError && (
          <p role="alert" className="mb-2 px-2 text-xs text-red-600">
            {logoutError}
          </p>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-zinc-600 hover:text-red-600 dark:text-zinc-400"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          <LogOut className="h-4 w-4" />
          {loggingOut ? "Signing out..." : "Sign out"}
        </Button>
      </div>
    </aside>
  );
}
