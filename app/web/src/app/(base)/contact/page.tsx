import Link from "next/link";
import { ArrowRight, BookOpen, GitBranch, ShieldAlert } from "lucide-react";
import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";
import { pageMetadata, publicPages } from "@/lib/seo";

export const metadata = pageMetadata(publicPages.contact);

const waysToConnect = [
  {
    icon: GitBranch,
    title: "Questions and ideas",
    description:
      "Find the Polityra CMS repository through the Polityra organization and use its issue tracker for questions, bugs, and suggestions.",
    label: "Visit Polityra on GitHub",
    href: "https://github.com/Polityra",
  },
  {
    icon: BookOpen,
    title: "Setup and contributions",
    description:
      "The repository documentation explains the current setup, development workflow, and ways to contribute.",
    label: "Read about the project",
    href: "/about",
  },
  {
    icon: ShieldAlert,
    title: "Security reporting",
    description:
      "Find the project repository through the Polityra organization and follow its security policy. Please do not post sensitive details publicly.",
    label: "Find the project on GitHub",
    href: "https://github.com/Polityra",
  },
];

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#08090b] text-zinc-100">
      <Navbar />

      <main className="flex-1 px-6 pb-20 pt-28 sm:pb-24 sm:pt-36">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-indigo-200">
              Contact and contribute
            </p>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl sm:leading-[1.08]">
              Join the conversation.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
              Polityra CMS is an open-source project maintained by the Polityra
              organization. The preview does not have a connected support
              inbox, so this page points you to the project’s public channels
              instead of pretending to send a message.
            </p>
          </div>

          <div className="mt-12 grid gap-x-10 md:grid-cols-3">
            {waysToConnect.map(({ icon: Icon, title, description, label, href }) => {
              const isExternal = href.startsWith("http");
              const content = (
                <>
                  <Icon className="h-5 w-5 text-indigo-300" />
                  <h2 className="mt-5 font-semibold text-white">{title}</h2>
                  <p className="mt-3 min-h-28 text-sm leading-7 text-zinc-400">
                    {description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-200 transition-colors group-hover:text-indigo-300">
                    {label} <ArrowRight className="h-4 w-4" />
                  </span>
                </>
              );

              return (
                <article
                  key={title}
                  className="group border-t border-white/[0.12] py-6 sm:py-7"
                >
                  {isExternal ? (
                    <a href={href} target="_blank" rel="noreferrer">
                      {content}
                    </a>
                  ) : (
                    <Link href={href}>{content}</Link>
                  )}
                </article>
              );
            })}
          </div>

          <div className="mt-12 border-t border-white/[0.08] pt-6 text-sm leading-7 text-zinc-500">
            Please avoid including passwords, API keys, or other secrets in
            public discussions.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
