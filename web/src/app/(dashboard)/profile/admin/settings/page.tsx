"use client";

import { AppShell, type NavItem } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const sidebarItems: NavItem[] = [
  { label: "Overview", href: "/dashboard/admin" },
  { label: "Users", href: "/admin/users" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Audit Log", href: "/profile/admin/history" },
  { label: "Settings", href: "/profile/admin/settings" },
];

export default function AdminSettingsPage() {
  return (
    <AppShell sidebarItems={sidebarItems} user={{ name: "Admin", email: "admin@cms.app" }}>
      <PageHeader title="Platform settings" description="Configure platform-wide settings." />
      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader><CardTitle className="text-base">Email</CardTitle></CardHeader>
          <CardContent>
            <CardDescription>SMTP configuration for transactional emails. Configure with your email provider.</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">AI Provider</CardTitle></CardHeader>
          <CardContent>
            <CardDescription>Select the production AI provider for website generation. Currently set to Ollama (local).</CardDescription>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
