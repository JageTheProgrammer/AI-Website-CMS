"use client";

import { useState } from "react";
import { Send, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    try {
      // In production: await api.post("/support", { subject, message });
      setSent(true);
    } catch {
      setError("Failed to send your message. Please try again.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
        <Navbar />
      <section className="px-6 py-24 max-w-3xl mx-auto w-full">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50 mb-6">Contact us</h1>
        <p className="text-lg text-zinc-600 mb-12 dark:text-zinc-400">Have a question or need help? Send us a message and we&apos;ll respond within 24 hours.</p>

        {sent ? (
          <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30">
            <CardContent className="pt-6 flex items-center gap-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h3 className="font-semibold text-emerald-800 dark:text-emerald-300">Message sent!</h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">We&apos;ll get back to you within 24 hours.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Send a message</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400 flex items-center gap-2">
                  <X className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
                <Input name="subject" placeholder="Subject" required />
                <Textarea name="message" placeholder="Describe your issue or question..." rows={6} required />
                <Button type="submit" size="lg" className="gap-2 w-full">
                  <Send className="h-4 w-4" /> Send message
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </section>
      <Footer />
    </div>
  );
}
