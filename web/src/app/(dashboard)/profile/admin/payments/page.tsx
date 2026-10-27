"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sidebarItems = [
  { label: "Overview", href: "/dashboard/admin" },
  { label: "Users", href: "/admin/users" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Audit Log", href: "/profile/admin/history" },
  { label: "Settings", href: "/profile/admin/settings" },
];

const PAYMENTS = [
  { id: "pay_1", user: "pro@business.com", amount: "$19.00", date: "Oct 22, 2026", status: "succeeded" },
  { id: "pay_2", user: "free@example.com", amount: "$0.00", date: "Oct 20, 2026", status: "succeeded" },
];

export default function AdminPaymentsPage() {
  return (
    <AppShell sidebarItems={sidebarItems} user={{ name: "Admin", email: "admin@cms.app" }}>
      <PageHeader title="Revenue" description="Platform revenue and payment overview." />
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-6"><p className="text-sm text-zinc-600 dark:text-zinc-400">Monthly Revenue</p><p className="text-2xl font-bold mt-1">$1,260</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-zinc-600 dark:text-zinc-400">Active Subscriptions</p><p className="text-2xl font-bold mt-1">56</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-zinc-600 dark:text-zinc-400">Avg. Revenue per User</p><p className="text-2xl font-bold mt-1">$22.50</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Recent payments</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <th className="px-6 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">User</th>
                <th className="px-6 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">Amount</th>
                <th className="px-6 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300 hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {PAYMENTS.map((p) => (
                <tr key={p.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/50">
                  <td className="px-6 py-4 text-zinc-900 dark:text-zinc-50">{p.user}</td>
                  <td className="px-6 py-4 font-medium text-zinc-700 dark:text-zinc-300">{p.amount}</td>
                  <td className="px-6 py-4 text-zinc-500 hidden sm:table-cell">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
