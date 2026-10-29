
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  Code2,
  Database,
  GitBranch,
  Globe2,
  Layers3,
  Monitor,
  Server,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";

const features = [
  {
    number: "01",
    icon: WandSparkles,
    title: "Natural-language generation",
    description:
      "Describe your idea in plain language and let AI help create the structure, pages, and components for your project.",
    tags: ["Prompt-based", "Multi-page"],
  },
  {
    number: "02",
    icon: Monitor,
    title: "Live project preview",
    description:
      "Review your work as you build. Inspect the layout, refine details, and iterate on your website instead of starting over.",
    tags: ["Visual feedback", "Iteration"],
  },
  {
    number: "03",
    icon: Layers3,
    title: "Version history",
    description:
      "Keep project changes organized so you can review earlier work and use previous versions as a reference.",
    tags: ["Project history", "Change tracking"],
  },
  {
    number: "04",
    icon: Database,
    title: "Database configuration",
    description:
      "Plan data models and application structure alongside your website, with AI-assisted configuration where supported.",
    tags: ["Data models", "Configuration"],
  },
  {
    number: "05",
    icon: Globe2,
    title: "Custom domains",
    description:
      "Prepare your project for a branded web address with domain configuration tools and deployment guidance.",
    tags: ["Domain setup", "HTTPS"],
  },
  {
    number: "06",
    icon: Server,
    title: "Deployment management",
    description:
      "Keep deployment status and build information connected to your project, making it easier to understand what is live.",
    tags: ["Build status", "Deployment"],
  },
  {
    number: "07",
    icon: GitBranch,
    title: "Source-code export",
    description:
      "Keep access to your generated project files so you can inspect the implementation and continue development outside the builder.",
    tags: ["Project files", "Developer workflow"],
  },
  {
    number: "08",
    icon: ShieldCheck,
    title: "Security-conscious workflow",
    description:
      "Build with privacy and secure configuration in mind. Keep credentials out of prompts, source code, and client-side bundles.",
    tags: ["Privacy", "Configuration"],
  },
];

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[#08090b] text-zinc-100">
      <Navbar />

      <main className="flex-1">
        <section className="relative isolate px-6 pb-16 pt-28 sm:pb-20 sm:pt-36">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-indigo-600/[0.12] blur-[130px]" />
            <div className="absolute right-0 top-40 h-64 w-64 rounded-full bg-blue-500/[0.06] blur-[100px]" />
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm text-zinc-300">
              <Sparkles className="h-4 w-4 text-indigo-300" />
              Platform capabilities
            </div>

            <div className="mt-6 grid gap-8 md:grid-cols-[1fr_0.65fr] md:items-end">
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl sm:leading-[1.08]">
                  Everything you need
                  <span className="block bg-gradient-to-r from-indigo-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">
                    to bring a site to life.
                  </span>
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
                  Go from a rough idea to a structured web project with AI
                  generation, visual iteration, project tools, and deployment
                  workflows in one place.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <p className="text-sm text-zinc-400">One connected workflow</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-zinc-200">
                  <span className="rounded-lg border border-indigo-400/20 bg-indigo-500/10 px-3 py-2">
                    Prompt
                  </span>
                  <ArrowRight className="h-4 w-4 text-zinc-600" />
                  <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                    Build
                  </span>
                  <ArrowRight className="h-4 w-4 text-zinc-600" />
                  <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                    Refine
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                  <ArrowDownRight className="h-4 w-4" />
                  Then prepare your project for deployment.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.07] bg-white/[0.015] px-6 py-16 sm:py-20">
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
            {[
              {
                title: "Start with an idea",
                description:
                  "Use natural language to describe the experience you want to create.",
              },
              {
                title: "Shape the details",
                description:
                  "Review the result and refine your project in smaller steps.",
              },
              {
                title: "Own your workflow",
                description:
                  "Use project tools to manage changes and prepare for deployment.",
              },
            ].map((item, index) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10 text-sm font-semibold text-indigo-300">
                  0{index + 1}
                </div>
                <div>
                  <h2 className="font-semibold text-white">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-300">
                Explore the platform
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Tools for the entire build process.
              </h2>
              <p className="mt-4 leading-7 text-zinc-400">
                From the first prompt to project configuration, each capability
                is designed to help keep your work organized.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {features.map((feature) => (
                <article
                  key={feature.number}
                  className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition-colors hover:border-indigo-400/25 hover:bg-white/[0.04] sm:p-7"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10">
                      <feature.icon className="h-5 w-5 text-indigo-300" />
                    </div>
                    <span className="font-mono text-xs text-zinc-600">
                      {feature.number}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">
                    {feature.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {feature.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-xs text-zinc-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-24">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/[0.13] via-[#101116] to-blue-500/[0.06] p-8 sm:p-12">
            <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-indigo-500/10 blur-[90px]" />
            <div className="relative max-w-2xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10">
                <Code2 className="h-5 w-5 text-indigo-300" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Ready to turn your idea into a project?
              </h2>
              <p className="mt-3 leading-7 text-zinc-400">
                Create an account and start exploring the website-building
                workflow.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="gap-2 bg-indigo-500 text-white hover:bg-indigo-400"
                >
                  <Link href="/signup">
                    Get started <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="gap-2 border-white/10 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.07] hover:text-white"
                >
                  <Link href="/pricing">
                    View pricing <Check className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
