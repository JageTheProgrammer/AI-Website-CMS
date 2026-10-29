
import {
  FileText,
  ShieldCheck,
  Code2,
  Ban,
  UserRoundCheck,
} from "lucide-react";
import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";

const sections = [
  {
    title: "Acceptable use",
    icon: Ban,
    content:
      "You may not use the platform to generate content that infringes on third-party intellectual property rights, violates applicable law, or distributes malware. Generated projects are licensed to you for your use.",
  },
  {
    title: "Intellectual property",
    icon: Code2,
    content:
      "You retain all rights to content and code you generate through the platform. We claim no ownership over your generated work.",
  },
  {
    title: "Termination",
    icon: UserRoundCheck,
    content:
      "We reserve the right to suspend or terminate accounts that violate these terms or engage in abusive behavior.",
  },
];

export default function LegalPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[#08090b] text-zinc-100">
      <Navbar />

      <main className="relative flex-1">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_65%)]" />

        <section className="relative mx-auto w-full max-w-5xl px-6 pb-24 pt-20 sm:pb-32 sm:pt-28">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/[0.07] px-3.5 py-2 text-sm text-indigo-300">
              <FileText className="h-4 w-4" />
              <span>Legal &amp; transparency</span>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Terms of service
              <span className="text-indigo-400">.</span>
            </h1>

            <p className="mt-5 text-sm text-zinc-500">
              Last updated: October 24, 2026
            </p>

            <div className="my-10 h-px bg-gradient-to-r from-indigo-400/40 via-white/10 to-transparent" />

            <div className="space-y-10 text-[15px] leading-8 text-zinc-400">
              <p className="text-base leading-8 text-zinc-300">
                By accessing or using the AI Website CMS platform, you agree
                to be bound by these terms. You must be at least 18 years old
                to use this service.
              </p>

              {sections.map(({ title, icon: Icon, content }, index) => (
                <section key={title}>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/[0.08]">
                      <Icon className="h-5 w-5 text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">
                        Section 0{index + 1}
                      </p>
                      <h2 className="text-xl font-semibold tracking-tight text-white">
                        {title}
                      </h2>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
                    <p>{content}</p>
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-16 rounded-2xl border border-indigo-400/15 bg-indigo-400/[0.04] p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-300" />
                <div>
                  <h2 className="font-medium text-white">
                    Use the platform responsibly
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">
                    Please review these terms before using the platform and
                    ensure that your projects comply with applicable laws.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
