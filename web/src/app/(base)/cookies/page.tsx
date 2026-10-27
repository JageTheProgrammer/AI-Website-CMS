import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";

export default function CookiesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
    <Navbar />
      <section className="px-6 py-24 max-w-3xl mx-auto w-full">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50 mb-8">Cookie policy</h1>
        <p className="text-sm text-zinc-500 mb-8">Last updated: October 24, 2026</p>
        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>We use essential cookies for authentication and session management. We do not use tracking or advertising cookies.</p>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mt-12 mb-4">Cookies we use</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Session cookie:</strong> Maintains your logged-in state. Expires when you close your browser.</li>
            <li><strong>CSRF token:</strong> Protects against cross-site request forgery attacks. Tied to your session.</li>
          </ul>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mt-12 mb-4">Managing cookies</h2>
          <p>You can disable cookies in your browser settings, but some features may not work correctly.</p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
