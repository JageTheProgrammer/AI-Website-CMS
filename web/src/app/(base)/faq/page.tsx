
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  CircleHelp,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";

const faqs = [
  {
    category: "Getting started",
    questions: [
      {
        q: "What is AI Website CMS?",
        a: "AI Website CMS is a prompt-driven website-building platform. Describe the website you need, generate a project, preview and refine it, and use the available tools to manage and deploy your work.",
      },
      {
        q: "Do I need coding experience?",
        a: "The platform is designed to make website creation more accessible through natural-language prompts. Technical knowledge can still be useful when reviewing generated code, configuring integrations, or troubleshooting advanced requirements.",
      },
      {
        q: "How does AI generation work?",
        a: "You describe the website or change you want. The platform sends your request through its configured AI provider, generates project files, and saves the resulting work so you can review and iterate on it.",
      },
    ],
  },
  {
    category: "Projects and features",
    questions: [
      {
        q: "Can I use my own domain name?",
        a: "Custom domain support is intended for eligible plans. Availability depends on the domain and deployment features enabled for your account.",
      },
      {
        q: "Can I export my source code?",
        a: "Source-code export is intended to let eligible users download their project files and configuration. The files included depend on the project's setup and the export implementation.",
      },
      {
        q: "Which frameworks are supported?",
        a: "Next.js is the default framework described for generation. Support for other frameworks depends on the current generation and project tooling available in the platform.",
      },
      {
        q: "Can I restore an earlier version?",
        a: "The platform is designed around versioned project changes. The available history, comparison, and rollback actions depend on which version-management features are implemented in your workspace.",
      },
    ],
  },
  {
    category: "Plans and security",
    questions: [
      {
        q: "How does pricing work?",
        a: "The pricing page outlines the Free, Pro, and Enterprise plans. Check the current plan details for the listed limits and features before choosing a plan.",
      },
      {
        q: "What happens if I reach a generation limit?",
        a: "Generation limits depend on your plan. Existing project files should be kept separate from usage limits, but the exact behavior for your account depends on the platform's current implementation.",
      },
      {
        q: "Is my project data private?",
        a: "Project privacy and security depend on the platform's access controls, infrastructure, and deployment configuration. Avoid placing secrets in prompts or generated client-side code, and use the platform's supported secret-management features.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[#08090b] text-zinc-100">
      <Navbar />

      <main className="relative flex-1 px-6 pb-24 pt-28 sm:pt-36">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[390px] w-[680px] -translate-x-1/2 rounded-full bg-indigo-600/[0.11] blur-[130px]" />
        </div>

        <div className="relative mx-auto max-w-4xl">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm text-zinc-300">
              <CircleHelp className="h-4 w-4 text-indigo-300" />
              Help center
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Frequently asked
              <span className="block bg-gradient-to-r from-indigo-300 to-blue-300 bg-clip-text text-transparent">
                questions.
              </span>
            </h1>

            <p className="mt-5 text-base leading-7 text-zinc-400 sm:text-lg">
              Answers to common questions about building, managing, and
              deploying websites with AI Website CMS.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-3xl space-y-12">
            {faqs.map((group) => (
              <section key={group.category}>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-indigo-300">
                  {group.category}
                </h2>

                <div className="divide-y divide-white/[0.07] overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                  {group.questions.map((faq) => (
                    <details key={faq.q} className="group">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-left sm:px-6 [&::-webkit-details-marker]:hidden">
                        <span className="font-medium leading-6 text-zinc-200 transition-colors group-open:text-white">
                          {faq.q}
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 group-open:rotate-90 group-open:text-indigo-300" />
                      </summary>
                      <div className="px-5 pb-5 sm:px-6">
                        <p className="max-w-2xl text-sm leading-7 text-zinc-400">
                          {faq.a}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-16 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-indigo-500/[0.10] to-white/[0.02] p-7 text-center sm:p-9">
            <Sparkles className="mx-auto h-6 w-6 text-indigo-300" />
            <h2 className="mt-4 text-xl font-semibold text-white">
              Still have a question?
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Get in touch if you need help with something specific.
            </p>
            <Button
              asChild
              className="mt-5 gap-2 bg-indigo-500 text-white hover:bg-indigo-400"
            >
              <Link href="/contact">
                Contact us <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
