import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";
import { pageMetadata, publicPages } from "@/lib/seo";

export const metadata = pageMetadata(publicPages.terms);

const sections = [
  {
    title: "Open-source license",
    paragraphs: [
      "The Polityra CMS source code is distributed under the Apache License 2.0. That license governs use of the code; it does not by itself define the terms of a separately hosted service.",
    ],
  },
  {
    title: "Using an instance",
    paragraphs: [
      "If you use a hosted instance, its operator may set additional terms, account requirements, availability limits, and privacy practices. Review the terms presented by that operator.",
      "If you run the software yourself, you are responsible for operating your deployment and complying with applicable laws and third-party service terms.",
    ],
  },
  {
    title: "Your projects and generated content",
    paragraphs: [
      "You are responsible for the prompts, source material, and other content you provide, and for reviewing generated output before using or publishing it. Make sure you have the rights and permissions needed for your use.",
      "AI providers, hosting services, and other integrations are configured by the instance operator and may have separate terms.",
    ],
  },
  {
    title: "Availability and development",
    paragraphs: [
      "Polityra CMS is under active development. Features may change, be incomplete, or be unavailable in a particular build. Do not rely on roadmap items or assume that a hosted service, deployment workflow, or service-level commitment is provided by the open-source project.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#08090b] text-zinc-100">
      <Navbar />

      <main className="flex-1 px-6 pb-20 pt-28 sm:pb-24 sm:pt-36">
        <article className="mx-auto max-w-3xl">
          <p className="inline-flex items-center gap-2 text-sm text-indigo-200">
            <FileText className="h-4 w-4" />
            Project terms
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Terms of service
          </h1>
          <p className="mt-4 text-sm text-zinc-500">Last updated: November 12, 2026</p>

          <p className="mt-8 border-l border-indigo-300/50 py-1 pl-5 text-sm leading-7 text-zinc-400">
            These terms describe the open-source project at a high level. They
            do not replace terms set by the operator of a separately hosted
            instance.
          </p>

          <div className="mt-12 space-y-10">
            {sections.map((section) => (
              <section key={section.title} className="border-t border-white/[0.1] pt-6">
                <h2 className="text-xl font-semibold text-white">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-[15px] leading-8 text-zinc-400">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <Link
            href="/pricing"
            className="mt-12 inline-flex items-center gap-2 text-sm font-medium text-zinc-200 transition-colors hover:text-indigo-300"
          >
            Read about the open-source project <ArrowRight className="h-4 w-4" />
          </Link>
        </article>
      </main>

      <Footer />
    </div>
  );
}
