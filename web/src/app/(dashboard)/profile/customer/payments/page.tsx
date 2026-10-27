"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/types";
import { Card, CardContent } from "@/components/ui/card";

const sidebarItems = [
  { label: "Dashboard", href: "/dashboard/customer" },
  { label: "Projects", href: "/projects" },
  { label: "Deployments", href: "/deployments" },
  { label: "Domains", href: "/domains" },
  { label: "Settings", href: "/profile/customer/settings" },
];

export default function CustomerPaymentsPage() {
  return (
    <AppShell sidebarItems={sidebarItems} user={{ name: "Demo User", email: "demo@example.com" }}>
      <PageHeader title="Payment history" description="View your past transactions." />
      <Card>
        <CardContent className="p-6 text-center text-zinc-500">
          No payment history available. You are currently on the Free plan.
        </CardContent>
      </Card>
    </AppShell>
  );
}
