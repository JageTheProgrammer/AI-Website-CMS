
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Minus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";

const tiers = [
  {
    name: "Free",
    price: 0,
    description: "A simple place to start experimenting with your ideas.",
    features: [
      "1 project",
      "5 generations per month",
      "Platform subdomain",
      "Basic templates",
      "Community support",
    ],
    href: "/signup",
    buttonText: "Start for free",
    highlight: false,
  },
  {
    name: "Pro",
    price: 19,
    description: "More room to build and manage your projects.",
    features: [
      "Unlimited projects",
      "50 generations per month",
      "Custom domains with TLS",
      "Source-code export",
      "Priority support",
      "Team collaboration",
    ],
    href: "/signup",
    buttonText: "Get Pro",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: 79,
    description: "Additional control for larger organizations.",
    features: [
      "Everything in Pro",
      "Unlimited generations",
      "Dedicated support and SLA",
      "Audit logs",
      "SSO / SAML",
      "Custom infrastructure options",
    ],
    href: "/contact",
    buttonText: "Contact sales",
    highlight: false,
  },
];

const comparisonRows = [
  ["Projects", "1", "Unlimited", "Unlimited"],
  ["Generations per month", "5", "50", "Unlimited"],
  ["Platform subdomain", "Yes", "Yes", "Yes"],
  ["Custom domains", "—", "Yes", "Yes"],
  ["TLS provisioning", "—", "Yes", "Yes"],
  ["Source-code export", "—", "Yes", "Yes"],
  ["Database configuration", "Basic", "Full", "Full + custom"],
  ["Team members", "1", "Up to 5", "Unlimited"],
  ["Audit logs", "—", "—", "Yes"],
  ["SSO / SAML", "—", "—", "Yes"],
];

const pricingFaqs = [
  {
    q: "Can I cancel my subscription?",
    a: "Subscription cancellation and access after cancellation depend on the billing configuration for your account. Review the terms presented when subscribing.",
  },
  {
    q: "What happens when I reach my generation limit?",
    a: "The listed plans have different monthly generation limits. Check your current plan and account usage to understand when your allowance resets and which upgrade options are available.",
  },
  {
    q: "Can I change plans later?",
    a: "You can choose another plan when the relevant subscription and billing-management features are available for your account. Review any displayed billing terms before confirming a change.",
  },
  {
    q: "Are there educational or nonprofit discounts?",
    a: "Contact us to discuss your organization and any pricing options that may be available.",
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[#08090b] text-zinc-100">
      <Navbar />

      <main className="flex-1">
        <section className="relative isolate px-6 pb-14 pt-28 sm:pb-20 sm:pt-36">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-0 h-[430px] w-[720px] -translate-x-1/2 rounded-full bg-indigo-600/[0.12] blur-[130px]" />
            <div className="absolute right-0 top-48 h-64 w-64 rounded-full bg-blue-500/[0.05] blur-[100px]" />
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm text-zinc-300">
              <Sparkles className="h-4 w-4 text-indigo-300" />
              Straightforward plans
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl sm:leading-[1.08]">
              Start with an idea.
              <span className="block bg-gradient-to-r from-indigo-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">
                Scale when you&apos;re ready.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
              Explore the platform for free, then choose a plan that fits your
              projects and workflow.
            </p>

            <p className="mt-4 text-xs text-zinc-500">
              Prices shown in USD per month.
            </p>
          </div>
        </section>

        <section className="px-6 pb-20 sm:pb-24">
          <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-3">
            {tiers.map((tier) => (
              <article
                key={tier.name}
                className={`relative flex flex-col rounded-2xl border p-6 sm:p-7 ${
                  tier.highlight
                    ? "border-indigo-400/40 bg-gradient-to-b from-indigo-500/[0.12] to-[#0d0e12] shadow-xl shadow-indigo-950/20"
                    : "border-white/[0.09] bg-white/[0.025]"
                }`}
              >
                {tier.highlight && (
                  <div className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-indigo-400/25 bg-indigo-400/10 px-3 py-1 text-xs font-medium text-indigo-200">
                    <Sparkles className="h-3.5 w-3.5" />
                    Most popular
                  </div>
                )}

                <h2 className="text-lg font-semibold text-white">
                  {tier.name}
                </h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-400">
                  {tier.description}
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-white">
                    ${tier.price}
                  </span>
                  <span className="text-sm text-zinc-500">/ month</span>
                </div>

                <div className="mt-7">
                  <Button
                    asChild
                    size="lg"
                    variant={tier.highlight ? "default" : "outline"}
                    className={
                      tier.highlight
                        ? "w-full gap-2 bg-indigo-500 text-white hover:bg-indigo-400"
                        : "w-full gap-2 border-white/10 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.07] hover:text-white"
                    }
                  >
                    <Link href={tier.href}>
                      {tier.buttonText}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="my-7 border-t border-white/[0.08]" />

                <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                  What&apos;s included
                </p>

                <ul className="mt-5 flex-1 space-y-4">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-zinc-300"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-300" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-white/[0.07] bg-white/[0.015] px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-300">
                Compare plans
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Find the right fit.
              </h2>
              <p className="mt-4 leading-7 text-zinc-400">
                Compare the listed allowances and features before choosing a
                plan.
              </p>
            </div>

            <div className="mt-10 overflow-x-auto rounded-2xl border border-white/[0.09] bg-[#0c0d11]">
              <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.025]">
                    <th className="px-5 py-4 font-medium text-zinc-400 sm:px-6">
                      Feature
                    </th>
                    {tiers.map((tier) => (
                      <th
                        key={tier.name}
                        className={`px-5 py-4 font-semibold sm:px-6 ${
                          tier.highlight ? "text-indigo-200" : "text-white"
                        }`}
                      >
                        {tier.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr
                      key={row[0]}
                      className="border-b border-white/[0.06] last:border-0"
                    >
                      {row.map((cell, index) => (
                        <td
                          key={`${row[0]}-${index}`}
                          className={`px-5 py-4 sm:px-6 ${
                            index === 0
                              ? "font-medium text-zinc-300"
                              : cell === "Yes"
                                ? "text-zinc-200"
                                : cell === "—"
                                  ? "text-zinc-600"
                                  : "text-zinc-400"
                          }`}
                        >
                          {cell === "Yes" ? (
                            <span className="inline-flex items-center gap-2">
                              <Check className="h-4 w-4 text-indigo-300" />
                              Yes
                            </span>
                          ) : cell === "—" ? (
                            <span className="inline-flex items-center gap-2">
                              <Minus className="h-4 w-4 text-zinc-600" />
                              <span className="sr-only">Not included</span>
                              —
                            </span>
                          ) : (
                            cell
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs leading-5 text-zinc-500">
              Feature availability and limits are based on the plan details
              supplied for this page. Confirm that your billing and access
              controls enforce these limits before launch.
            </p>
          </div>
        </section>

        <section className="px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                Pricing questions
              </h2>
              <p className="mt-3 text-zinc-400">
                A few things to consider before choosing a plan.
              </p>
            </div>

            <div className="mt-10 divide-y divide-white/[0.07] rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 sm:px-7">
              {pricingFaqs.map((faq) => (
                <details key={faq.q} className="group py-5">
                  <summary className="cursor-pointer list-none font-medium text-zinc-200 marker:hidden [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-4">
                      {faq.q}
                      <ArrowRight className="h-4 w-4 shrink-0 text-zinc-500 transition-transform group-open:rotate-90 group-open:text-indigo-300" />
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-24">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/[0.13] via-[#101116] to-blue-500/[0.06] p-8 text-center sm:p-12">
            <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-indigo-500/[0.08] blur-[80px]" />
            <div className="relative">
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Your next project starts here.
              </h2>
              <p className="mx-auto mt-3 max-w-xl leading-7 text-zinc-400">
                Start with the Free plan and explore the workflow at your own
                pace.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-6 gap-2 bg-indigo-500 text-white hover:bg-indigo-400"
              >
                <Link href="/signup">
                  Create your account <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
