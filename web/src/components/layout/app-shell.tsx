import { cn } from "@/lib/utils/cn";
export type { NavItem } from "./sidebar-nav";
import { SidebarNav } from "./sidebar-nav";
import type { NavItem as _NavItemType } from "./sidebar-nav";

interface AppShellProps {
  sidebarItems: _NavItemType[];
  user: { name: string; email: string };
  children: React.ReactNode;
}

export function AppShell({ sidebarItems, user, children }: AppShellProps) {
  return (
    <div className="flex h-screen w-full bg-zinc-50 dark:bg-zinc-950">
      <SidebarNav items={sidebarItems} user={user} />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto max-w-7xl w-full px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
