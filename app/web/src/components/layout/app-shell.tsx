/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "./sidebar-nav";
import type { NavItem as NavItemType, SidebarUser } from "./sidebar-nav";

export type { NavItem } from "./sidebar-nav";

interface AppShellProps {
  sidebarItems: NavItemType[];
  user?: SidebarUser | null;
  children: React.ReactNode;
}

/** Finds the label of the nav item that best matches the current route. */
function getPageTitle(items: NavItemType[], pathname: string) {
  const match = [...items]
    .sort((a, b) => b.href.length - a.href.length)
    .find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    );

  return match?.label ?? "Workspace";
}

export function AppShell({ sidebarItems, user, children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const pageTitle = useMemo(
    () => getPageTitle(sidebarItems, pathname),
    [sidebarItems, pathname],
  );

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // While the drawer is open: close on Escape and lock page scrolling.
  useEffect(() => {
    if (!mobileNavOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileNavOpen(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileNavOpen]);

  return (
    <div className="flex min-h-screen w-full bg-[#090a0c] text-zinc-100">
      {/* Mobile backdrop */}
      <button
        type="button"
        aria-label="Close navigation"
        tabIndex={mobileNavOpen ? 0 : -1}
        onClick={() => setMobileNavOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden",
          mobileNavOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <SidebarNav
        items={sidebarItems}
        user={user}
        mobileOpen={mobileNavOpen}
        onNavigate={() => setMobileNavOpen(false)}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {/* Top bar: menu button on mobile, page title everywhere */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.07] bg-[#090a0c]/85 px-4 backdrop-blur-xl sm:px-6 lg:h-[65px] lg:px-8">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Open navigation"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen(true)}
            className="-ml-2 text-zinc-300 hover:bg-white/[0.06] hover:text-white lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="min-w-0">
            <p className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600 lg:block">
              Polityra CMS
            </p>
            <h1 className="truncate text-sm font-semibold tracking-tight text-white lg:mt-0.5 lg:text-[15px]">
              {pageTitle}
            </h1>
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}