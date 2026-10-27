import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";

export default function LegalPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
    <Navbar />
      <section className="px-6 py-24 max-w-3xl mx-auto w-full">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50 mb-8">Terms of service</h1>
        <p className="text-sm text-zinc-500 mb-8">Last updated: October 24, 2026</p>
        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>By accessing or using the AI Website CMS platform, you agree to be bound by these terms. You must be at least 18 years old to use this service.</p>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mt-12 mb-4">Acceptable use</h2>
          <p>You may not use the platform to generate content that infringes on third-party intellectual property rights, violates applicable law, or distributes malware. Generated projects are licensed to you for your use.</p>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mt-12 mb-4">Intellectual property</h2>
          <p>You retain all rights to content and code you generate through the platform. We claim no ownership over your generated work.</p>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mt-12 mb-4">Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in abusive behavior.</p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
