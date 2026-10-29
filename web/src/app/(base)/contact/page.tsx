
"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  MessageSquare,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);

    try {
      // Connect your support API here before using this in production.
      // Example: await fetch("/api/support", { method: "POST", body: formData });
      void formData;
      setSent(true);
    } catch {
      setError("Failed to send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[#08090b] text-zinc-100">
      <Navbar />

      <main className="relative flex-1 px-6 pb-24 pt-28 sm:pt-36">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[400px] w-[650px] -translate-x-1/2 rounded-full bg-indigo-600/[0.11] blur-[130px]" />
          <div className="absolute right-0 top-72 h-64 w-64 rounded-full bg-blue-500/[0.05] blur-[100px]" />
        </div>

        <div className="relative mx-auto grid max-w-5xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm text-zinc-300">
              <Sparkles className="h-4 w-4 text-indigo-300" />
              Contact
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl sm:leading-[1.1]">
              Let&apos;s talk about
              <span className="block bg-gradient-to-r from-indigo-300 to-blue-300 bg-clip-text text-transparent">
                what you need.
              </span>
            </h1>

            <p className="mt-6 max-w-lg leading-8 text-zinc-400">
              Have a question about the platform, need help with your project,
              or want to discuss something else? Send us a message.
            </p>

            <div className="mt-10 space-y-4">
              <div className="flex gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-medium text-white">Product support</h2>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">
                    Questions about using the builder or managing your
                    projects.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-medium text-white">General enquiries</h2>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">
                    Feedback, partnerships, and other questions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="self-start rounded-2xl border border-white/[0.09] bg-[#0d0e12]/90 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
            {sent ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
                  <CheckCircle2 className="h-7 w-7 text-emerald-300" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-white">
                  Message submitted
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-400">
                  The form has completed successfully. Connect your support API
                  to deliver messages to your inbox.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-6 border-white/10 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.07] hover:text-white"
                  onClick={() => setSent(false)}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-white">
                  Send us a message
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Fill in the details below and tell us how we can help.
                </p>

                {error && (
                  <div className="mt-6 flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-400/[0.07] p-3 text-sm text-red-300">
                    <X className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <form
                  onSubmit={async (event) => {
                    event.preventDefault();
                    if (loading) return;
                    const formData = new FormData(event.currentTarget);
                    await handleSubmit(formData);
                  }}
                  className="mt-6 space-y-5"
                >
                  <div className="space-y-2">
                    <label
                      htmlFor="contact-name"
                      className="text-sm font-medium text-zinc-300"
                    >
                      Name
                    </label>
                    <Input
                      id="contact-name"
                      name="name"
                      placeholder="Your name"
                      autoComplete="name"
                      required
                      className="h-11 border-white/10 bg-black/30 text-white placeholder:text-zinc-600 focus-visible:border-indigo-400/50 focus-visible:ring-indigo-400/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="contact-email"
                      className="text-sm font-medium text-zinc-300"
                    >
                      Email address
                    </label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className="h-11 border-white/10 bg-black/30 text-white placeholder:text-zinc-600 focus-visible:border-indigo-400/50 focus-visible:ring-indigo-400/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="contact-subject"
                      className="text-sm font-medium text-zinc-300"
                    >
                      Subject
                    </label>
                    <Input
                      id="contact-subject"
                      name="subject"
                      placeholder="What is this about?"
                      required
                      className="h-11 border-white/10 bg-black/30 text-white placeholder:text-zinc-600 focus-visible:border-indigo-400/50 focus-visible:ring-indigo-400/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="contact-message"
                      className="text-sm font-medium text-zinc-300"
                    >
                      Message
                    </label>
                    <Textarea
                      id="contact-message"
                      name="message"
                      placeholder="Describe your question or issue..."
                      rows={5}
                      required
                      className="resize-y border-white/10 bg-black/30 text-white placeholder:text-zinc-600 focus-visible:border-indigo-400/50 focus-visible:ring-indigo-400/20"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="w-full gap-2 bg-indigo-500 text-white hover:bg-indigo-400"
                  >
                    {loading ? "Submitting..." : "Send message"}
                  </Button>

                  <p className="text-center text-xs leading-5 text-zinc-500">
                    Please don&apos;t include passwords or other sensitive
                    information in your message.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
