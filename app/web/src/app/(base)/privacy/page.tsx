import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";
import { pageMetadata, publicPages } from "@/lib/seo";

export const metadata = pageMetadata(publicPages.privacy);

const sections = [
  {
    title: "Each deployment has its own operator",
    paragraphs: [
      "Polityra CMS is open-source software that can be run in different environments. The operator of the instance you use determines what information is collected, where it is stored, how long it is retained, and how to make a privacy request.",
      "If you use a hosted instance, consult the privacy information provided by that service's operator. If you self-host, review your own deployment, database, logs, and configured services.",
    ],
  },
  {
    title: "Information processed by the application",
    paragraphs: [
      "Depending on the features you use and the deployment configuration, the application may process account details, project information, prompts, generated files, and technical data needed to operate the service.",
      "AI prompts may be sent to the provider configured by the deployment. Review that provider's terms and privacy practices before including personal information or confidential material in a prompt.",
    ],
  },
  {
    title: "Questions and privacy requests",
    paragraphs: [
      "Contact the operator of the specific instance you use for questions, access or deletion requests, or details about retention. The Polityra organization does not control independently hosted deployments.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#08090b] text-zinc-100">
      <Navbar />

      <main className="flex-1 px-6 pb-20 pt-28 sm:pb-24 sm:pt-36">
        <article className="mx-auto max-w-3xl">
          <p className="inline-flex items-center gap-2 text-sm text-indigo-200">
            <LockKeyhole className="h-4 w-4" />
            Project policy
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Privacy policy
          </h1>
          <p className="mt-4 text-sm text-zinc-500">Last updated: November 12, 2026</p>

          <p className="mt-8 border-l border-indigo-300/50 py-1 pl-5 text-sm leading-7 text-zinc-400">
            Polityra CMS is open-source software. This overview explains why
            privacy practices depend on the particular deployment you use; it
            cannot replace an instance operator&apos;s privacy notice.
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
            href="/contact"
            className="mt-12 inline-flex items-center gap-2 text-sm font-medium text-zinc-200 transition-colors hover:text-indigo-300"
          >
            Find project contact channels <ArrowRight className="h-4 w-4" />
          </Link>
        </article>
      </main>

      <Footer />
    </div>
  );
}
