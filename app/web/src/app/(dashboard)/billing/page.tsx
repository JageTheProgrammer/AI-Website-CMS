"use client";

import { useState } from "react";
import { Check, CreditCard, DollarSign } from "lucide-react";
import { AppShell, type NavItem } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/types";
import { Switch } from "@/components/ui/switch";

const sidebarItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/customer" },
  { label: "Projects", href: "/projects" },
  { label: "Deployments", href: "/deployments" },
  { label: "Domains", href: "/domains" },
  { label: "Settings", href: "/profile/customer/settings" },
];

const PLANS = [
  { name: "Free", price: 0, features: ["1 project", "5 generations/mo", "Platform subdomain", "Basic templates"], current: true },
  { name: "Pro", price: 19, features: ["Unlimited projects", "50 generations/mo", "Custom domains with TLS", "Export source code", "Priority support"], current: false, highlighted: true },
];

const PAYMENT_HISTORY = [
  { id: "pay_1", description: "Free Plan", amount: "$0.00", date: "Oct 1, 2026", status: "succeeded" },
  { id: "pay_2", description: "Pro Plan - Monthly", amount: "$19.00", date: "Sep 1, 2026", status: "succeeded" },
];

export default function BillingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <AppShell sidebarItems={sidebarItems} user={{ name: "Demo User", email: "demo@example.com" }}>
      <PageHeader title="Billing" description="Manage your subscription and view payment history." />

      {/* Plan selector */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-4">Current plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLANS.map((plan) => (
            <Card key={plan.name} className={plan.highlighted ? "ring-2 ring-zinc-900 dark:ring-zinc-100" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription>{plan.price === 0 ? "Forever free" : `$${plan.price}${annual ? "/year" : "/month"}`}</CardDescription>
                  </div>
                  {plan.current && <Badge variant="default">Current</Badge>}
                </div>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"><Check className="h-4 w-4 text-emerald-600 shrink-0" />{f}</li>
                  ))}
                </ul>
                {!plan.current && plan.price > 0 && (
                  <div className="mt-6">
                    <Switch checked={annual} onCheckedChange={setAnnual} />
                    <span className="text-xs text-zinc-500 ml-2">{annual ? "Billed annually" : "Billed monthly"}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment history */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-4">Payment history</h3>
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                  <th className="px-6 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">Description</th>
                  <th className="px-6 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300 hidden sm:table-cell">Date</th>
                  <th className="px-6 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {PAYMENT_HISTORY.map((payment) => (
                  <tr key={payment.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/50">
                    <td className="px-6 py-4 text-zinc-900 dark:text-zinc-50">{payment.description}</td>
                    <td className="px-6 py-4 font-medium text-zinc-700 dark:text-zinc-300">{payment.amount}</td>
                    <td className="px-6 py-4 text-zinc-500 hidden sm:table-cell">{payment.date}</td>
                    <td className="px-6 py-4"><Badge variant="success">{payment.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
