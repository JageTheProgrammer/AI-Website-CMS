import Link from "next/link";
import {
  Wand2,
  Monitor,
  Download,
  Shield,
  Database,
  ArrowRight,
  Code2,
  Globe,
  Layers3,
  Rocket,
  Check,
  Sparkles,
  MousePointer2,
  History,
  Smartphone,
  LockKeyhole,
  Terminal,
  Palette,
  CircleCheck,
  Zap,
  LayoutTemplate,
  GitBranch,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";
import VantaHalo from "@/components/ui/VantaHalo";

const sectionLabel =
  "text-sm font-semibold uppercase tracking-[0.18em] text-indigo-400";

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
      <div className="pointer-events-none absolute inset-0 -z-10">
        <VantaHalo />
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/10 via-black/20 to-[#08090b]" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3.5 py-2 text-xs font-medium text-zinc-200 backdrop-blur-xl">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          AI website builder
          <span className="text-zinc-600">/</span>
          Public beta
        </span>

        <h1 className="text-5xl font-semibold tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
          Your ideas.
          <br />
          <span className="bg-gradient-to-r from-blue-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
            Beautiful websites.
          </span>
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
          Turn your ideas into real websites using natural language. Design,
          customize, and launch your next project without starting from scratch.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup">
            <Button
              size="lg"
              className="gap-2 border border-indigo-400/30 bg-indigo-500 px-6 text-white shadow-lg shadow-indigo-950/40 transition-all hover:bg-indigo-400"
            >
              Start building for free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/pricing">
            <Button
              variant="outline"
              size="lg"
              className="border-white/15 bg-white/[0.04] px-6 text-zinc-200 backdrop-blur-md hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
            >
              Explore pricing
            </Button>
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-zinc-400">
          {["Start for free", "Full source code", "Your own domain"].map(
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
        "Describe your business in natural language and turn your idea into a working website.",
    },
    {
      icon: Monitor,
      title: "Live preview",
      description:
        "See your changes instantly and refine your website until everything feels right.",
    },
    {
      icon: Download,
      title: "Export your code",
      description:
        "Download your project's source code and maintain control over your work.",
    },
    {
      icon: Shield,
      title: "Deployment tools",
      description:
        "Publish your website and connect a custom domain when you're ready to launch.",
    },
    {
      icon: Database,
      title: "Database configuration",
      description:
        "Configure your application's data layer and backend functionality in one place.",
    },
    {
      icon: History,
      title: "Version history",
      description:
        "Keep track of previous versions and restore an earlier iteration when needed.",
    },
  ];

  return (
    <section id="features" className="relative px-6 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-14 max-w-2xl">
          <span className={sectionLabel}>Everything in one place</span>

          <h2 className={sectionHeading}>
            Everything you need to ship a website
          </h2>

          <p className={sectionDescription}>
            From your first idea to the final deployment, get the tools you
            need to build and manage your website.
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
      icon: Rocket,
      title: "Launch your project",
      description:
        "Prepare your website for launch, configure your domain, and export your code.",
    },
  ];

  return (
    <section className="border-y border-white/[0.05] bg-[#0b0c10] px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className={sectionLabel}>A simpler workflow</span>

          <h2 className={sectionHeading}>From idea to launch</h2>

          <p className={sectionDescription}>
            Spend less time setting things up and more time building something
            worth sharing.
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
      title: "Domain management",
      description:
        "Prepare your project for a platform subdomain or your own custom domain.",
    },
    {
      icon: GitBranch,
      title: "Project versions",
      description:
        "Keep your iterations organized and revisit previous work when necessary.",
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
            <span className={sectionLabel}>Built for real projects</span>

            <h2 className={sectionHeading}>
              More than a website generator
            </h2>

            <p className="mt-5 leading-8 text-zinc-400">
              Your website is just the beginning. Manage the tools and
              configuration needed to take a project from an early concept to
              a maintainable application.
            </p>

            <Link
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-zinc-200 transition-colors hover:text-indigo-300"
            >
              Explore the platform
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
  const benefits = [
    "Keep access to your project's source code",
    "Refine your website as your idea evolves",
    "Organize configuration and project settings",
    "Prepare your project for deployment",
  ];

  const projectItems = [
    { icon: LayoutTemplate, name: "Website editor", status: "Ready" },
    { icon: Database, name: "Database settings", status: "Configured" },
    { icon: Globe, name: "Domain settings", status: "Manage" },
    { icon: History, name: "Version history", status: "Available" },
  ];

  return (
    <section className="relative overflow-hidden border-y border-white/[0.05] bg-[#0b0c10] px-6 py-24 sm:py-32">
      <div className="pointer-events-none absolute -left-48 top-1/3 h-96 w-96 rounded-full bg-indigo-600/[0.07] blur-[120px]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <span className={sectionLabel}>Built around your workflow</span>

          <h2 className={sectionHeading}>Build faster. Stay in control.</h2>

          <p className="mt-5 max-w-xl leading-8 text-zinc-400">
            AI can accelerate the process, but your project should remain
            yours. Use generated results as a starting point and keep
            developing as your requirements change.
          </p>

          <div className="mt-8 space-y-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3">
                <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />

                <span className="text-sm leading-6 text-zinc-300">
                  {benefit}
                </span>
              </div>
            ))}
          </div>

          <Link href="/signup" className="mt-9 inline-flex">
            <Button
              size="lg"
              className="gap-2 bg-indigo-500 text-white hover:bg-indigo-400"
            >
              Start your project
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
              project.config
            </span>

            <Code2 className="h-4 w-4 text-zinc-500" />
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-zinc-500">
                <Layers3 className="h-4 w-4" />
                PROJECT
              </div>

              <p className="text-lg font-semibold text-white">
                Your next big idea
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Everything organized in one workspace.
              </p>
            </div>

            <div className="space-y-3">
              {projectItems.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
                >
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
              <Zap className="h-4 w-4 text-indigo-300" />
              One workspace for your project
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
              Start with a simple page or use the platform as the foundation
              for your next digital product.
            </p>
          </div>

          <Link
            href="/signup"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-zinc-200 transition-colors hover:text-indigo-300"
          >
            Get started
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
        "The platform is designed to support source-code export, allowing you to continue working with your project outside the visual editor.",
    },
    {
      question: "Can I use my own domain?",
      answer:
        "You can use the platform's domain-management workflow to prepare a custom domain for your project, subject to the platform's supported deployment configuration.",
    },
    {
      question: "Can I change my website after creating it?",
      answer:
        "Yes. The intended workflow is to preview, refine, and iterate on your project as your design and requirements evolve.",
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
            Your next project starts here.
          </h2>

          <p className="mt-5 leading-8 text-zinc-400">
            Bring your idea, shape it into a website, and keep building from
            there. Get started and see what you can create.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup">
              <Button
                size="lg"
                className="gap-2 bg-indigo-500 text-white hover:bg-indigo-400"
              >
                Create your account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/pricing">
              <Button
                variant="outline"
                size="lg"
                className="border-white/15 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.08] hover:text-white"
              >
                View plans
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-xs text-zinc-500">
            Start building today. Upgrade when you need more.
          </p>
        </div>
      </div>
    </section>
  );
}
