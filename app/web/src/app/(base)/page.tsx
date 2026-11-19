import Link from "next/link";
import {
  Wand2,
  Monitor,
  Download,
  ArrowRight,
  Code2,
  Globe,
  Layers3,
  Check,
  Sparkles,
  MousePointer2,
  History,
  Smartphone,
  LockKeyhole,
  Terminal,
  Palette,
  CircleCheck,
  LayoutTemplate,
  GitBranch,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";
import VantaHalo from "@/components/ui/VantaHalo";

const sectionLabel =
  "text-xs font-medium uppercase tracking-[0.16em] text-indigo-200";

const sectionHeading =
  "mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl";

const sectionDescription =
  "mt-4 text-base leading-8 text-zinc-400 sm:text-lg";

const cardStyle =
  "rounded-2xl border border-white/[0.08] bg-white/[0.025] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-white/[0.045]";

const iconBoxStyle =
  "flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/[0.08]";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[#08090b] text-white">
      <Navbar />

      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <WorkflowSection />
        <CapabilitiesSection />
        <BenefitsSection />
        <UseCasesSection />
        <FAQSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[650px] flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-32 sm:min-h-[760px] sm:pt-40">
      {/* Calm static background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Soft indigo glow, kept away from the text area */}
        <div className="absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.22),transparent_65%)]" />

        {/* Faint grid that fades out toward the edges */}
        <div
          className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
        />

        {/* Darkening layer behind the text + fade into the next section */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#08090b]/60 via-[#08090b]/40 to-[#08090b]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <a
          href="https://github.com/Polityra"
          target="_blank"
          rel="noreferrer"
          className="mb-5 inline-flex text-xs font-medium uppercase tracking-[0.16em] text-indigo-200 transition-colors hover:text-white"
        >
          An open-source project by Polityra
        </a>

        <h1 className="text-5xl font-semibold tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
          Make your idea
          <br />
          <span className="text-zinc-200">a real website.</span>
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-zinc-200 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)] sm:text-lg">
          Polityra CMS is an open-source website builder in active development.
          Start with an AI-assisted draft, refine your project, and keep the
          source code in your hands.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup">
            <Button
              size="lg"
              className="gap-2 border border-indigo-400/30 bg-indigo-500 px-6 text-white shadow-lg shadow-indigo-950/40 transition-all hover:bg-indigo-400"
            >
              Create a project
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/pricing">
            <Button
              variant="outline"
              size="lg"
              className="border-white/15 bg-white/[0.04] px-6 text-zinc-200 backdrop-blur-md hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
            >
              About the project
            </Button>
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-zinc-300">
          {["Apache-2.0", "Open development", "Polityra organization"].map(
            (item) => (
              <span key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                {item}
              </span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}


function FeaturesSection() {
  const featureItems = [
    {
      icon: Wand2,
      title: "Prompt to website",
      description:
        "Describe a website in natural language and use AI to get a first version to review.",
    },
    {
      icon: Monitor,
      title: "Live preview",
      description:
        "Review your project as you build and iterate on its design and content.",
    },
    {
      icon: Download,
      title: "Export your code",
      description:
        "Keep access to your project files and continue development outside the builder.",
    },
    {
      icon: Code2,
      title: "Deployment tools",
      description:
        "Deployment and custom-domain workflows are part of the project roadmap and may not be available yet.",
    },
    {
      icon: Layers3,
      title: "Database configuration",
      description:
        "Database and backend configuration is in active development; availability depends on the current build.",
    },
    {
      icon: History,
      title: "Version history",
      description:
        "Project history tools are evolving. Check the current application before relying on rollback features.",
    },
  ];

  return (
    <section id="features" className="relative px-6 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-14 max-w-2xl">
          <span className={sectionLabel}>The essentials</span>

          <h2 className={sectionHeading}>
            From first draft to finished site
          </h2>

          <p className={sectionDescription}>
            A focused set of tools for generating, editing, and managing a
            website project.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureItems.map((feature) => (
            <div key={feature.title} className={`${cardStyle} group p-7`}>
              <div className={iconBoxStyle}>
                <feature.icon className="h-5 w-5 text-indigo-300" />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-zinc-100">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-zinc-400">
                {feature.description}
              </p>

              <div className="mt-6 h-px w-8 bg-indigo-400/50 transition-all duration-300 group-hover:w-14 group-hover:bg-indigo-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  const steps = [
    {
      number: "01",
      icon: Sparkles,
      title: "Describe your idea",
      description:
        "Explain what you want to build, who it is for, and what it should accomplish.",
    },
    {
      number: "02",
      icon: Palette,
      title: "Make it yours",
      description:
        "Preview your result, adjust the design, and refine the experience to match your vision.",
    },
    {
      number: "03",
      icon: GitBranch,
      title: "Keep building",
      description:
        "Inspect your files, refine the project, and choose how to continue development.",
    },
  ];

  return (
    <section className="border-y border-white/[0.05] bg-[#0b0c10] px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className={sectionLabel}>A clear process</span>

          <h2 className={sectionHeading}>From idea to first draft</h2>

          <p className={sectionDescription}>
            Start with a prompt, make deliberate edits, then decide where to
            take your project next.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className={`${cardStyle} group p-7`}>
              <div className="mb-8 flex items-center justify-between">
                <div className={iconBoxStyle}>
                  <step.icon className="h-5 w-5 text-indigo-300" />
                </div>

                <span className="text-4xl font-semibold tracking-tight text-white/[0.09] transition-colors group-hover:text-indigo-300/40">
                  {step.number}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-zinc-100">
                {step.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-zinc-400">
                {step.description}
              </p>

              <div className="mt-7 h-1 w-10 rounded-full bg-indigo-500/70 transition-all duration-300 group-hover:w-16 group-hover:bg-indigo-400" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilitiesSection() {
  const capabilities = [
    {
      icon: Code2,
      title: "A real codebase",
      description:
        "Build on a project structure you can inspect, edit, and continue developing.",
    },
    {
      icon: Smartphone,
      title: "Responsive layouts",
      description:
        "Create experiences designed to work across desktop, tablet, and mobile screens.",
    },
    {
      icon: Globe,
      title: "Open project files",
      description:
        "Keep your source code accessible and continue your workflow beyond the editor.",
    },
    {
      icon: GitBranch,
      title: "A project in progress",
      description:
        "The platform is actively developed; capabilities and workflows are still evolving.",
    },
    {
      icon: LockKeyhole,
      title: "Configuration controls",
      description:
        "Manage project settings and environment configuration from your workspace.",
    },
    {
      icon: Terminal,
      title: "Developer flexibility",
      description:
        "Keep the flexibility to work directly with your code instead of being locked into a visual editor.",
    },
  ];

  return (
    <section className="px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-start gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="lg:sticky lg:top-24">
            <span className={sectionLabel}>Made to stay useful</span>

            <h2 className={sectionHeading}>
              Start with AI. Keep control.
            </h2>

            <p className="mt-5 leading-8 text-zinc-400">
              Treat generated work as a starting point. Inspect the files,
              manage revisions, and continue building outside the editor.
            </p>

            <Link
              href="/features"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-zinc-200 transition-colors hover:text-indigo-300"
            >
              Explore the workflow
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-x-8 gap-y-9 sm:grid-cols-2">
            {capabilities.map((capability) => (
              <div key={capability.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035]">
                  <capability.icon className="h-5 w-5 text-indigo-300" />
                </div>

                <div>
                  <h3 className="font-semibold text-zinc-100">
                    {capability.title}
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-zinc-400">
                    {capability.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  const projectItems = [
    { icon: Code2, name: "License", status: "Apache-2.0" },
    { icon: GitBranch, name: "Development", status: "Active" },
    { icon: LockKeyhole, name: "Maintained by", status: "Polityra" },
  ];

  return (
    <section className="relative overflow-hidden border-y border-white/[0.05] bg-[#0b0c10] px-6 py-24 sm:py-32">
      <div className="pointer-events-none absolute -left-48 top-1/3 h-96 w-96 rounded-full bg-indigo-600/[0.07] blur-[120px]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <span className={sectionLabel}>Open source by design</span>

          <h2 className={sectionHeading}>Built in the open. Yours to explore.</h2>

          <p className="mt-5 max-w-xl leading-8 text-zinc-400">
            Polityra CMS is maintained by the Polityra organization and released
            under Apache-2.0. It is under active development, so available
            features may change as the project grows.
          </p>

          <Link href="/pricing" className="mt-9 inline-flex">
            <Button
              size="lg"
              className="gap-2 bg-indigo-500 text-white hover:bg-indigo-400"
            >
              Open-source project
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d0e12] shadow-2xl shadow-black/30">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            </div>


            <span className="font-mono text-xs text-zinc-500">
              project overview
            </span>

            <Code2 className="h-4 w-4 text-zinc-500" />
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-zinc-500">
                <Layers3 className="h-4 w-4" />
                POLITYRA CMS
              </div>

              <p className="text-lg font-semibold text-white">
                Open-source website builder
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Maintained by the Polityra organization.
              </p>
            </div>

            <div className="space-y-3">
              {projectItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-3 border-t border-white/[0.07] py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <item.icon className="h-4 w-4 shrink-0 text-indigo-300" />

                    <span className="truncate text-sm text-zinc-200">
                      {item.name}
                    </span>
                  </div>

                  <span className="shrink-0 text-xs text-zinc-500">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 border-t border-white/[0.07] pt-5 text-xs text-zinc-500">
              <CircleCheck className="h-4 w-4 text-indigo-300" />
              Open-source software · Apache-2.0
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function UseCasesSection() {
  const useCases = [
    {
      icon: Globe,
      title: "Business websites",
      description:
        "Create a professional online presence for your company, services, or brand.",
    },
    {
      icon: LayoutTemplate,
      title: "Landing pages",
      description:
        "Build focused pages for product launches, campaigns, and new ideas.",
    },
    {
      icon: Code2,
      title: "Web applications",
      description:
        "Start developing interfaces for dashboards, internal tools, and digital products.",
    },
    {
      icon: MousePointer2,
      title: "Personal projects",
      description:
        "Experiment with new designs and turn a side project into something real.",
    },
  ];

  return (
    <section className="px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className={sectionLabel}>What will you build?</span>

            <h2 className={sectionHeading}>
              One platform. Many possibilities.
            </h2>

            <p className={sectionDescription}>
              Use the current workflow to explore an idea, knowing the project
              is still under active development.
            </p>
          </div>

          <Link
            href="/features"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-zinc-200 transition-colors hover:text-indigo-300"
          >
            Explore features
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((item) => (
            <div key={item.title} className={`${cardStyle} p-6`}>
              <div className={iconBoxStyle}>
                <item.icon className="h-5 w-5 text-indigo-300" />
              </div>

              <h3 className="mt-5 font-semibold text-zinc-100">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-zinc-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const questions = [
    {
      question: "Do I need coding experience?",
      answer:
        "You can start by describing your idea in natural language. Coding knowledge can also help when you want to inspect or customize your project's source code.",
    },
    {
      question: "Can I export my website?",
      answer:
        "Source-code export is a project feature, but available functionality can change while Polityra CMS is under active development.",
    },
    {
      question: "Can I use my own domain?",
      answer:
        "Production hosting and custom-domain workflows may not be fully implemented yet. Check the current application before relying on them.",
    },
    {
      question: "Can I change my website after creating it?",
      answer:
        "Yes. The project is designed for iteration, though specific editor capabilities may vary as development continues.",
    },
  ];

  return (
    <section id="faq" className="border-t border-white/[0.06] bg-[#0b0c10] px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <span className={sectionLabel}>Questions and answers</span>

          <h2 className={sectionHeading}>Good to know</h2>

          <p className="mt-4 text-zinc-400">
            A few things to know before you get started.
          </p>
        </div>

        <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {questions.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-zinc-100 marker:hidden [&::-webkit-details-marker]:hidden">
                {item.question}

                <ArrowRight className="h-4 w-4 shrink-0 text-zinc-500 transition-transform group-open:rotate-90 group-open:text-indigo-300" />
              </summary>

              <p className="mt-4 pr-8 text-sm leading-7 text-zinc-400">
                {item.answer}
              </p>
            </details>
          ))}
        </div>

        <p className="mt-7 text-center text-sm text-zinc-500">
          Still have questions?{" "}
          <Link
            href="/contact"
            className="text-indigo-300 transition-colors hover:text-indigo-200"
          >
            Get in touch
          </Link>
        </p>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="px-6 py-24 sm:py-32">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/[0.09] bg-[#0d0e13] px-6 py-16 text-center sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />

        <div className="relative mx-auto max-w-2xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-300/20 bg-indigo-400/[0.08]">
            <Sparkles className="h-6 w-6 text-indigo-300" />
          </div>

          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            A website builder built in the open.
          </h2>

          <p className="mt-5 leading-8 text-zinc-400">
            Explore Polityra CMS, maintained by the Polityra organization and
            released under the Apache-2.0 license.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/features">
              <Button
                size="lg"
                className="gap-2 bg-indigo-500 text-white hover:bg-indigo-400"
              >
                Explore features
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/pricing">
              <Button
                variant="outline"
                size="lg"
                className="border-white/15 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.08] hover:text-white"
              >
                Open source
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-xs text-zinc-500">
            Open-source project · Active development
          </p>
        </div>
      </div>
    </section>
  );
}
