
import { Cookie, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";

export default function CookiesPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[#08090b] text-zinc-100">
      <Navbar />

      <main className="relative flex-1">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_65%)]" />

        <section className="relative mx-auto w-full max-w-5xl px-6 pb-24 pt-20 sm:pb-32 sm:pt-28">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/[0.07] px-3.5 py-2 text-sm text-indigo-300">
              <Cookie className="h-4 w-4" />
              <span>Legal &amp; transparency</span>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Cookie policy
              <span className="text-indigo-400">.</span>
            </h1>

            <p className="mt-5 text-sm text-zinc-500">
              Last updated: October 24, 2026
            </p>

            <div className="my-10 h-px bg-gradient-to-r from-indigo-400/40 via-white/10 to-transparent" />

            <div className="space-y-10 text-[15px] leading-8 text-zinc-400">
              <p className="text-base leading-8 text-zinc-300">
                We use essential cookies to keep your account secure and
                maintain your session. We do not use tracking or advertising
                cookies.
              </p>

              <section>
                <h2 className="mb-4 text-xl font-semibold tracking-tight text-white">
                  Cookies we use
                </h2>

                <div className="space-y-3">
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-colors hover:border-white/[0.12]">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/[0.08]">
                        <ShieldCheck className="h-5 w-5 text-indigo-300" />
                      </div>
                      <div>
                        <h3 className="font-medium text-zinc-100">
                          Session cookie
                        </h3>
                        <p className="mt-1 text-sm leading-7 text-zinc-400">
                          Maintains your logged-in state so you can use
                          authenticated features. Expires when you close your
                          browser.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-colors hover:border-white/[0.12]">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/[0.08]">
                        <ShieldCheck className="h-5 w-5 text-indigo-300" />
                      </div>
                      <div>
                        <h3 className="font-medium text-zinc-100">
                          CSRF token
                        </h3>
                        <p className="mt-1 text-sm leading-7 text-zinc-400">
                          Helps protect against cross-site request forgery
                          attacks and supports secure interactions with the
                          platform.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold tracking-tight text-white">
                  Managing cookies
                </h2>
                <p>
                  You can disable cookies in your browser settings. However,
                  doing so may prevent authentication and other platform
                  features from working correctly.
                </p>
              </section>
            </div>

            <div className="mt-16 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                  <Cookie className="h-5 w-5 text-zinc-300" />
                </div>
                <div>
                  <h2 className="font-medium text-white">
                    Privacy by design
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">
                    Our stated approach is to use essential cookies rather
                    than tracking or advertising cookies.
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
