import Link from "next/link";
import { ArrowRight, Code2, HeartHandshake, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";
import { pageMetadata, publicPages } from "@/lib/seo";

export const metadata = pageMetadata(publicPages.pricing);

const principles = [
  {
    icon: Scale,
    title: "Apache License 2.0",
    description:
      "The source code is published under the Apache-2.0 license. Read the license text for the permissions and conditions that apply.",
    link: "https://www.apache.org/licenses/LICENSE-2.0",
    label: "Read the license",
  },
  {
    icon: Code2,
    title: "Open development",
    description:
      "Polityra CMS is maintained by the Polityra organization and is under active development. Capabilities may change between builds.",
    link: "https://github.com/Polityra",
    label: "Visit Polityra on GitHub",
  },
  {
    icon: HeartHandshake,
    title: "Run it your way",
    description:
      "The project can be explored as open-source software. Self-hosting setup and required services are described in the repository documentation.",
    link: "https://github.com/Polityra",
    label: "Explore the organization",
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#08090b] text-zinc-100">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-white/[0.08] px-6 pb-16 pt-28 sm:pb-20 sm:pt-36">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-indigo-200">
              Open-source project
            </p>
            <div className="mt-6 grid gap-8 md:grid-cols-[1fr_0.7fr] md:items-end">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl sm:leading-[1.08]">
                No invented plans.
                <span className="block text-zinc-400">Just an open project.</span>
              </h1>
              <p className="text-base leading-8 text-zinc-400">
                Polityra CMS is maintained by the Polityra organization and
                released under Apache-2.0. It is under active development;
                there are no subscription tiers or product prices to compare here.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 sm:py-20">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {principles.map(({ icon: Icon, title, description, link, label }) => (
              <article
                key={title}
                className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition-colors hover:border-indigo-400/30 hover:bg-white/[0.04] sm:p-7"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 ring-1 ring-inset ring-indigo-400/20">
                  <Icon className="h-5 w-5 text-indigo-300" aria-hidden="true" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>

                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {description}
                </p>

                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium text-zinc-200 transition-colors hover:text-indigo-300 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  {label}
                  <ArrowRight
                    className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </article>
            ))}
          </div>
        </section>
        <section className="border-t border-white/[0.08] px-6 py-16 sm:py-20">
          <div className="mx-auto flex max-w-5xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Help shape what comes next.
              </h2>
              <p className="mt-2 text-sm leading-7 text-zinc-400">
                Explore the Polityra organization and the project documentation
                for current setup and contribution details.
              </p>
            </div>
            <Button
              asChild
              className="w-fit gap-2 bg-indigo-500 text-white hover:bg-indigo-400"
            >
              <a href="https://github.com/Polityra" target="_blank" rel="noreferrer">
                Visit Polityra <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </section>

        <div className="px-6 pb-20">
          <div className="mx-auto max-w-5xl border-l border-white/[0.12] pl-5 text-sm leading-7 text-zinc-500">
            A hosted service, if offered, may have its own terms, availability,
            and costs. This project page does not describe or promise hosted
            plans.
            {" "}
            <Link
              href="/faq"
              className="text-zinc-300 underline decoration-white/20 underline-offset-4 hover:text-white"
            >
              Read the FAQ
            </Link>
            .
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
