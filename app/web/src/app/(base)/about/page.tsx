import Link from "next/link";
import { ArrowRight, Code2, Heart, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";
import { pageMetadata, publicPages } from "@/lib/seo";

export const metadata = pageMetadata(publicPages.about);

const principles = [
  {
    icon: Lightbulb,
    title: "Make the first step easier",
    description:
      "Use an idea or prompt to get a starting point, then shape it into a website that fits your needs.",
  },
  {
    icon: Code2,
    title: "Keep the work inspectable",
    description:
      "An AI-assisted workflow should leave room to understand, edit, and continue working with the project code.",
  },
  {
    icon: Heart,
    title: "Build in the open",
    description:
      "Polityra CMS is an open-source project. Its features and documentation evolve alongside development.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#08090b] text-zinc-100">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-white/[0.08] px-6 pb-16 pt-28 sm:pb-20 sm:pt-36">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-indigo-200">
              About Polityra CMS
            </p>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-6xl sm:leading-[1.08]">
              A way to turn an idea
              <span className="block text-zinc-400">into an editable website.</span>
            </h1>
            <div className="mt-8 grid gap-8 md:grid-cols-[1fr_0.7fr] md:items-end">
              <p className="max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
                Polityra CMS is an AI-assisted website builder owned and
                maintained by the Polityra organization. The project is
                open-source, Apache-2.0 licensed, and actively developed.
              </p>
              <p className="border-l border-white/[0.12] py-1 pl-5 text-sm leading-7 text-zinc-500">
                Some planned workflows—including production hosting,
                custom-domain support, and data integrations—may not be
                complete in the current build.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
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
                <Link href="/features">Explore the project</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-indigo-200">
              What guides the work
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Useful, understandable, open.
            </h2>
            <div className="mt-10 grid gap-x-10 md:grid-cols-3">
              {principles.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="border-t border-white/[0.12] py-6 sm:py-7"
                >
                  <Icon className="h-5 w-5 text-indigo-300" />
                  <h3 className="mt-5 font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    {description}
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
                Explore the code and community.
              </h2>
              <p className="mt-2 text-sm leading-7 text-zinc-400">
                Find Polityra projects and updates through the organization on GitHub.
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-200 transition-colors hover:text-indigo-300"
            >
              Open-source details <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
