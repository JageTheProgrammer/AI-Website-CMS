import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
        < Navbar />
      <section className="px-6 py-24 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50 mb-8">About AI Website CMS</h1>
        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p>We are building a platform that makes website creation accessible to everyone. By combining the power of large language models with thoughtful tooling, anyone can describe their business idea and get a working website.</p>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mt-12 mb-4">Our Mission</h2>
          <p>We believe that building a website should be about communicating your ideas, not wrestling with code. Our platform handles the technical complexity while you focus on what matters: your content and your business.</p>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mt-12 mb-4">Why We Built This</h2>
          <p>The landscape of website builders is polarized between simple drag-and-drop tools that produce limited sites and complex developer frameworks that require years of experience. We wanted to build the bridge between them.</p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
