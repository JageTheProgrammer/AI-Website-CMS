import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
        <Navbar />
      <section className="px-6 py-24 max-w-3xl mx-auto w-full">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50 mb-8">Privacy policy</h1>
        <p className="text-sm text-zinc-500 mb-8">Last updated: October 24, 2026</p>
        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>We collect minimal information necessary to provide our service. Your email address is used for account creation and communication. Project source code is stored securely and never shared with third parties.</p>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mt-12 mb-4">Data we collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Email address for account creation and communication.</li>
            <li>Project metadata (name, slug, framework, deployment status).</li>
            <li>Usage metrics to improve our service (generation counts, error rates).</li>
          </ul>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mt-12 mb-4">How we use your data</h2>
          <p>We use your data to provide, maintain, and improve our service. We do not sell or share your personal information with third parties for marketing purposes.</p>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mt-12 mb-4">Your rights</h2>
          <p>You can request to access, modify, or delete your personal data at any time from your account settings or by contacting us.</p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
