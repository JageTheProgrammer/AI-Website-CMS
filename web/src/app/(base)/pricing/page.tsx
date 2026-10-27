import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";

const tiers = [
  {
    name: "Free",
    price: 0,
    description: "Perfect for trying things out and personal experiments.",
    features: ["1 project", "5 generations per month", "Platform subdomain", "Basic templates", "Community support"],
    href: "/signup",
    buttonText: "Start Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: 19,
    description: "For professionals and small teams who need more power.",
    features: ["Unlimited projects", "50 generations per month", "Custom domains with TLS", "Export source code", "Priority support", "Team collaboration"],
    href: "/signup",
    buttonText: "Upgrade to Pro",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: 79,
    description: "For organizations that need scale and control.",
    features: ["Everything in Pro", "Unlimited generations", "Dedicated support & SLA", "Audit logs", "SSO / SAML", "Custom infrastructure options"],
    href: "/contact",
    buttonText: "Contact Sales",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <Navbar />
      <PricingHero />
      <PricingTiers />
      <FeatureComparison />
      <FAQSection />
      <Footer />
    </div>
  );
}

function PricingHero() {
  return (
    <section className="px-6 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">Simple, transparent pricing</h1>
      <p className="mt-4 text-lg text-zinc-600 max-w-xl mx-auto dark:text-zinc-400">Start free. Upgrade when you need more.</p>
    </section>
  );
}

function PricingTiers() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-6 mb-24">
      {tiers.map((tier) => (
        <Card key={tier.name} className={tier.highlight ? "ring-2 ring-zinc-900 dark:ring-zinc-100 relative" : ""}>
          {tier.highlight && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <Badge variant="default">Most Popular</Badge>
            </div>
          )}
          <CardContent className="p-6 flex flex-col h-full">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{tier.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">${tier.price}</span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">/month</span>
              </div>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{tier.description}</p>
            </div>
            <ul className="mt-8 space-y-3 flex-1">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <span className="text-zinc-700 dark:text-zinc-300">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link href={tier.href} className="w-full">
                <Button variant={tier.highlight ? "default" : "outline"} size="lg" className="w-full gap-2">
                  {tier.buttonText} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function FeatureComparison() {
  const rows = [
    ["Feature", "Free", "Pro", "Enterprise"],
    ["Projects", "1", "Unlimited", "Unlimited"],
    ["Generations/mo", "5", "50", "Unlimited"],
    ["Platform subdomain", "✓", "✓", "✓"],
    ["Custom domains", "—", "✓", "✓"],
    ["TLS provisioning", "—", "✓", "✓"],
    ["Export source code", "—", "✓", "✓"],
    ["Database configuration", "Basic", "Full", "Full + custom"],
    ["Team members", "1", "Up to 5", "Unlimited"],
    ["Audit logs", "—", "—", "✓"],
    ["SSO / SAML", "—", "—", "✓"],
  ];

  return (
    <section className="max-w-3xl mx-auto px-6 mb-24">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-8 text-center">Compare plans</h2>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              {rows[0].map((h) => (
                <th key={h} className="px-6 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-50">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(1).map((row, i) => (
              <tr key={i} className="border-b border-zinc-200 last:border-0 dark:border-zinc-800">
                {row.map((cell, j) => (
                  <td key={j} className={`px-6 py-3 ${j === 0 ? "font-medium text-zinc-900 dark:text-zinc-50" : "text-zinc-600 dark:text-zinc-400"}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    { q: "Can I cancel anytime?", a: "Yes. You can cancel your subscription at any time. You'll continue to have access until the end of your billing period." },
    { q: "What happens when I exceed my generation limit?", a: "You won't be charged extra. We'll notify you and you can upgrade or wait until the next billing cycle." },
    { q: "Can I switch plans later?", a: "Absolutely. Upgrade or downgrade at any time from your billing settings. Changes take effect immediately." },
    { q: "Do you offer discounts for nonprofits or education?", a: "Yes, we offer special pricing for qualifying organizations and educational institutions. Contact our sales team for details." },
  ];

  return (
    <section className="max-w-2xl mx-auto px-6 pb-16">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-8 text-center">Frequently asked questions</h2>
      <div className="space-y-6">
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-zinc-200 pb-6 last:border-0 dark:border-zinc-800">
            <h3 className="font-medium text-zinc-900 dark:text-zinc-50">{faq.q}</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
