import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Database,
  GitBranch,
  Globe2,
  Monitor,
  Server,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";
import { pageMetadata, publicPages } from "@/lib/seo";

export const metadata = pageMetadata(publicPages.features);

const features = [
  {
    number: "01",
    icon: WandSparkles,
    title: "AI-assisted drafts",
    description:
      "Describe your idea in plain language and use a configured AI provider to help create a starting point for your website.",
    status: "Core workflow",
  },
  {
    number: "02",
    icon: Monitor,
    title: "Preview and iterate",
    description:
      "Review the generated project and make changes through the tools currently available in the editor.",
    status: "Core workflow",
  },
  {
    number: "03",
    icon: Code2,
    title: "Keep the source",
    description:
      "Polityra CMS is designed to keep project code accessible, so you can inspect and continue working with it.",
    status: "Open source",
  },
  {
    number: "04",
    icon: Database,
    title: "Data and integrations",
    description:
      "Database and integration workflows are evolving; verify the current implementation before building around them.",
    status: "In development",
  },
  {
    number: "05",
    icon: Globe2,
    title: "Hosting and domains",
    description:
      "Production hosting and custom-domain workflows may not be fully implemented in the current release.",
    status: "In development",
  },
  {
    number: "06",
    icon: GitBranch,
    title: "Project history",
    description:
      "Project change-management tools are evolving. Check your current workspace for the available history actions.",
    status: "Evolving",
  },
  {
    number: "07",
    icon: Server,
    title: "Self-hostable codebase",
    description:
      "The web app, API, shared packages, and desktop app are part of the open-source repository.",
    status: "Apache-2.0",
  },
  {
    number: "08",
    icon: ShieldCheck,
    title: "Provider choice",
    description:
      "AI providers are configured on the server. Review your deployment and provider settings before sending prompts.",
    status: "Deployment dependent",
  },
];

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#08090b] text-zinc-100">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-white/[0.08] px-6 pb-16 pt-28 sm:pb-20 sm:pt-36">
          <div className="mx-auto max-w-5xl">
            <p className="inline-flex items-center gap-2 text-sm text-indigo-200">
              <Sparkles className="h-4 w-4" />
              Product overview
            </p>

            <div className="mt-6 grid gap-8 md:grid-cols-[1fr_0.7fr] md:items-end">
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl sm:leading-[1.08]">
                  A website builder,
                  <span className="block text-zinc-400">built in the open.</span>
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
                  Polityra CMS combines AI-assisted website creation with
                  editable project code. It is maintained by the Polityra
                  organization and remains under active development.
                </p>
              </div>

              <p className="border-l border-indigo-300/50 py-1 pl-5 text-sm leading-7 text-zinc-400">
                Feature availability changes as development continues. Hosting,
                custom domains, and data integrations may not be ready in every
                build.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-indigo-200">
                  Current direction
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                  A small set of useful tools.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-zinc-500">
                This is an early-stage project, not a promise that every
                planned workflow is already available.
              </p>
            </div>

            <div className="grid gap-x-10 md:grid-cols-2">
              {features.map((feature) => (
                <article
                  key={feature.number}
                  className="group border-t border-white/[0.1] py-6 transition-colors hover:border-indigo-300/50 sm:py-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <feature.icon className="h-5 w-5 shrink-0 text-indigo-300" />
                      <h3 className="font-semibold text-zinc-100">
                        {feature.title}
                      </h3>
                    </div>
                    <span className="shrink-0 rounded-full border border-white/[0.1] px-2.5 py-1 text-[11px] text-zinc-500">
                      {feature.status}
                    </span>
                  </div>
                  <p className="mt-3 max-w-xl pl-8 text-sm leading-7 text-zinc-400">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.08] px-6 py-16 sm:py-20">
          <div className="mx-auto flex max-w-5xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Open source. Apache-2.0.
              </h2>
              <p className="mt-2 text-sm leading-7 text-zinc-400">
                Explore the Polityra organization and follow the project as it develops.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="gap-2 bg-indigo-500 text-white hover:bg-indigo-400"
              >
                <a href="https://github.com/Polityra" target="_blank" rel="noreferrer">
                  Polityra on GitHub <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/10 bg-transparent text-zinc-200 hover:bg-white/[0.06] hover:text-white"
              >
                <Link href="/about">About the project</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
