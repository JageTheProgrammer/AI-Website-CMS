
import {
  LockKeyhole,
  Database,
  Workflow,
  UserRound,
  Mail,
} from "lucide-react";
import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";

const dataSections = [
  {
    title: "Email address",
    description: "Used for account creation and communication.",
    icon: Mail,
  },
  {
    title: "Project metadata",
    description:
      "Information such as project name, slug, framework, and deployment status.",
    icon: Database,
  },
  {
    title: "Usage metrics",
    description:
      "Metrics such as generation counts and error rates, used to improve the service.",
    icon: Workflow,
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[#08090b] text-zinc-100">
      <Navbar />

      <main className="relative flex-1">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_65%)]" />

        <section className="relative mx-auto w-full max-w-5xl px-6 pb-24 pt-20 sm:pb-32 sm:pt-28">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/[0.07] px-3.5 py-2 text-sm text-indigo-300">
              <LockKeyhole className="h-4 w-4" />
              <span>Legal &amp; transparency</span>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Privacy policy
              <span className="text-indigo-400">.</span>
            </h1>

            <p className="mt-5 text-sm text-zinc-500">
              Last updated: October 24, 2026
            </p>

            <div className="my-10 h-px bg-gradient-to-r from-indigo-400/40 via-white/10 to-transparent" />

            <div className="space-y-10 text-[15px] leading-8 text-zinc-400">
              <p className="text-base leading-8 text-zinc-300">
                We collect minimal information necessary to provide our
                service. Your email address is used for account creation and
                communication. Project source code is stored securely and
                never shared with third parties.
              </p>

              <section>
                <h2 className="mb-4 text-xl font-semibold tracking-tight text-white">
                  Data we collect
                </h2>

                <div className="grid gap-3 sm:grid-cols-3">
                  {dataSections.map(({ title, description, icon: Icon }) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-colors hover:border-indigo-400/20 hover:bg-white/[0.04]"
                    >
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/[0.08]">
                        <Icon className="h-5 w-5 text-indigo-300" />
                      </div>
                      <h3 className="font-medium text-zinc-100">{title}</h3>
                      <p className="mt-2 text-sm leading-7 text-zinc-500">
                        {description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold tracking-tight text-white">
                  How we use your data
                </h2>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
                  <p>
                    We use your data to provide, maintain, and improve our
                    service. We do not sell or share your personal information
                    with third parties for marketing purposes.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold tracking-tight text-white">
                  Your rights
                </h2>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/[0.08]">
                      <UserRound className="h-5 w-5 text-indigo-300" />
                    </div>
                    <p>
                      You can request to access, modify, or delete your
                      personal data at any time from your account settings or
                      by contacting us.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-16 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-indigo-300" />
                <div>
                  <h2 className="font-medium text-white">
                    Your data matters
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">
                    We aim to handle your information responsibly and use it
                    only for purposes related to operating and improving the
                    platform, as described in this policy.
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
