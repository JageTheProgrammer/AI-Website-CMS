import Link from "next/link";
import { ArrowRight, ChevronRight, CircleHelp } from "lucide-react";
import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";

const faqs = [
  {
    category: "The project",
    questions: [
      {
        q: "What is Polityra CMS?",
        a: "Polityra CMS is an open-source, AI-assisted website builder maintained by the Polityra organization. The project is under active development.",
      },
      {
        q: "Is Polityra CMS open source?",
        a: "Yes. The project is licensed under Apache-2.0. Read the license text for its permissions and conditions.",
      },
      {
        q: "Where can I find the source code?",
        a: "Visit the Polityra organization on GitHub to explore its projects. Setup instructions and current requirements are maintained with the repository.",
      },
    ],
  },
  {
    category: "Using Polityra CMS",
    questions: [
      {
        q: "How does AI generation work?",
        a: "The workflow uses a server-configured AI provider to help generate or update project files from a prompt. Which provider is available depends on the deployment configuration.",
      },
      {
        q: "Do I need coding experience?",
        a: "You can begin with a natural-language description. Technical knowledge can help when configuring integrations or working directly with generated project code.",
      },
      {
        q: "Can I host the result or connect a custom domain?",
        a: "Production hosting and custom-domain workflows may not be fully implemented yet. Check the current build and project documentation before relying on them.",
      },
    ],
  },
  {
    category: "Development and data",
    questions: [
      {
        q: "Is the product finished?",
        a: "No. Polityra CMS is under active development, and capabilities can change. Some roadmap features are not available in every build.",
      },
      {
        q: "Where is my project data stored?",
        a: "Storage depends on the deployment you use. Self-hosted instances are controlled by their operator; for AI features, prompts are sent to the provider configured by that deployment.",
      },
      {
        q: "Does this project have paid plans?",
        a: "This project page does not offer or describe subscription tiers. A separately operated hosted service, if available, may have its own terms and costs.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#08090b] text-zinc-100">
      <Navbar />

      <main className="flex-1 px-6 pb-20 pt-28 sm:pb-24 sm:pt-36">
        <div className="mx-auto max-w-4xl">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-sm text-indigo-200">
              <CircleHelp className="h-4 w-4" />
              Frequently asked
            </p>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              Clear answers for
              <span className="block text-zinc-400">an evolving project.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-zinc-400">
              Polityra CMS is open source and actively developed. Here is what
              to know about the project and its current capabilities.
            </p>
          </div>

          <div className="mt-14 max-w-3xl space-y-12">
            {faqs.map((group) => (
              <section key={group.category}>
                <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-indigo-200">
                  {group.category}
                </h2>
                <div className="divide-y divide-white/[0.08] border-y border-white/[0.1]">
                  {group.questions.map((faq) => (
                    <details key={faq.q} className="group py-5">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-zinc-200 marker:hidden [&::-webkit-details-marker]:hidden">
                        {faq.q}
                        <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500 transition-transform group-open:rotate-90 group-open:text-indigo-300" />
                      </summary>
                      <p className="mt-4 max-w-2xl pr-8 text-sm leading-7 text-zinc-400">
                        {faq.a}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-16 border-t border-white/[0.1] pt-7">
            <h2 className="text-xl font-semibold text-white">
              Want to explore further?
            </h2>
            <p className="mt-2 text-sm leading-7 text-zinc-400">
              Read about the project or explore Polityra on GitHub.
            </p>
            <div className="mt-5 flex flex-wrap gap-5">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-200 transition-colors hover:text-indigo-300"
              >
                About Polityra CMS <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://github.com/Polityra"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-200 transition-colors hover:text-indigo-300"
              >
                Polityra on GitHub <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
