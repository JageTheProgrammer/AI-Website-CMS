import Link from "next/link";
import { ArrowRight, Cookie } from "lucide-react";
import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";

const sections = [
  {
    title: "Cookies depend on the deployment",
    body: "Polityra CMS is open-source software and can be deployed with different authentication, hosting, and analytics configurations. The operator of the instance you use determines which cookies or similar browser storage are set and how they are used.",
  },
  {
    title: "Check the instance you use",
    body: "For a hosted service, consult the operator's cookie and privacy information. If you self-host, review your deployment configuration and the cookies set by any integrations you enable.",
  },
  {
    title: "Browser controls",
    body: "Most browsers let you review, block, or remove cookies. Blocking cookies or site storage may affect sign-in and other features, depending on how the instance is configured.",
  },
];

export default function CookiesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#08090b] text-zinc-100">
      <Navbar />

      <main className="flex-1 px-6 pb-20 pt-28 sm:pb-24 sm:pt-36">
        <article className="mx-auto max-w-3xl">
          <p className="inline-flex items-center gap-2 text-sm text-indigo-200">
            <Cookie className="h-4 w-4" />
            Project policy
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Cookie policy
          </h1>
          <p className="mt-4 text-sm text-zinc-500">Last updated: November 12, 2026</p>

          <p className="mt-8 border-l border-indigo-300/50 py-1 pl-5 text-sm leading-7 text-zinc-400">
            There is no single cookie configuration for every Polityra CMS
            deployment. This overview explains what to check for the specific
            instance you use.
          </p>

          <div className="mt-12 space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="border-t border-white/[0.1] pt-6">
                <h2 className="text-xl font-semibold text-white">
                  {section.title}
                </h2>
                <p className="mt-4 text-[15px] leading-8 text-zinc-400">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          <Link
            href="/privacy"
            className="mt-12 inline-flex items-center gap-2 text-sm font-medium text-zinc-200 transition-colors hover:text-indigo-300"
          >
            Read the privacy policy <ArrowRight className="h-4 w-4" />
          </Link>
        </article>
      </main>

      <Footer />
    </div>
  );
}
