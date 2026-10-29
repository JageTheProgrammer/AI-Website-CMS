
import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Layers3,
  Sparkles,
  Target,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";

const principles = [
  {
    icon: WandSparkles,
    title: "Make building simpler",
    description:
      "Turn an idea into a working website without having to start from a blank editor or learn an entire framework first.",
  },
  {
    icon: Code2,
    title: "Keep the code accessible",
    description:
      "AI should help you build, not lock you into a platform. Your project should remain understandable and useful beyond the initial prompt.",
  },
  {
    icon: Layers3,
    title: "Build for the whole workflow",
    description:
      "Creating a website is only the beginning. Editing, versioning, configuration, and deployment should fit into the same workflow.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[#08090b] text-zinc-100">
      <Navbar />

      <main className="flex-1">
        <section className="relative isolate px-6 pb-20 pt-28 sm:pb-28 sm:pt-36">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-600/[0.12] blur-[130px]" />
            <div className="absolute right-0 top-48 h-64 w-64 rounded-full bg-blue-500/[0.06] blur-[100px]" />
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm text-zinc-300">
              <Sparkles className="h-4 w-4 text-indigo-300" />
              About AI Website CMS
            </div>

            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-6xl sm:leading-[1.08]">
              Your ideas deserve
              <span className="block bg-gradient-to-r from-indigo-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">
                more than a blank page.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
              We&apos;re building a platform that makes website creation more
              accessible. Describe what you want to build, work with AI to
              refine it, and bring your idea closer to a real website.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="gap-2 bg-indigo-500 text-white hover:bg-indigo-400"
              >
                <Link href="/signup">
                  Start building <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/10 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.07] hover:text-white"
              >
                <Link href="/features">Explore features</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.07] bg-white/[0.015] px-6 py-20 sm:py-24">
          <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-300">
                Our mission
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Less friction.
                <br />
                More creating.
              </h2>
            </div>

            <div className="space-y-5 text-base leading-8 text-zinc-400">
              <p>
                We believe building a website should be about communicating
                your ideas, not wrestling with technical complexity. The
                process should give you room to focus on your content, your
                product, and the people you want to reach.
              </p>
              <p>
                AI can help bridge the gap between having an idea and turning
                it into something tangible. Our goal is to bring generation,
                editing, project management, and deployment into one coherent
                experience.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-sm font-medium text-indigo-300">
                <Target className="h-4 w-4" />
                What guides us
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Built around the way people create.
              </h2>
              <p className="mt-4 leading-7 text-zinc-400">
                The goal isn&apos;t to add AI to everything. It&apos;s to make
                the actual work of building a website more straightforward.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {principles.map((principle) => (
                <div
                  key={principle.title}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition-colors hover:border-indigo-400/25 hover:bg-white/[0.04]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10">
                    <principle.icon className="h-5 w-5 text-indigo-300" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">
                    {principle.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-24 pt-4">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/[0.13] via-[#101116] to-blue-500/[0.06] p-8 sm:p-12">
            <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-indigo-500/10 blur-[90px]" />
            <div className="relative max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Have an idea worth building?
              </h2>
              <p className="mt-3 leading-7 text-zinc-400">
                Start with a description and see where you can take it.
              </p>
              <Button
                asChild
                className="mt-6 gap-2 bg-indigo-500 text-white hover:bg-indigo-400"
              >
                <Link href="/signup">
                  Get started <ArrowRight className="h-4 w-4" />
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
