import Link from "next/link";
import { Wand2, Monitor, Download, Shield, Database, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";
import VantaHalo from "@/components/ui/VantaHalo";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[650px] flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-24 sm:min-h-[750px] sm:pt-40">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <VantaHalo />
      </div>

      {/* Optional overlay for readability */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-white/40 dark:bg-zinc-950/40" />

      {/* Hero content */}
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50/80 px-3 py-1 text-xs font-medium text-zinc-600 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Now in public beta
        </span>

        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 sm:text-6xl lg:text-6xl dark:text-zinc-50">
          Build websites with{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent dark:from-blue-300 dark:via-indigo-300 dark:to-violet-400">
            natural language
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-1xl text-lg leading-relaxed text-zinc-200 dark:text-zinc-300">
          Describe your business, choose a direction, and get a complete
          working website. Iterate with AI until it&apos;s perfect. Deploy
          or export whenever you want.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/pricing">
            <Button
              variant="outline"
              size="lg"
              className="border-zinc-300 bg-white/70 text-zinc-900 backdrop-blur-sm hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-white dark:hover:bg-zinc-800"
            >
              View Pricing
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const FeatureItems = [
    { icon: Wand2, title: "Prompt to Website", description: "Describe your business in natural language and get a complete, working website generated in seconds." },
    { icon: Monitor, title: "Preview & Iterate", description: "See your site live instantly. Refine it with follow-up prompts until it looks exactly right." },
    { icon: Download, title: "Export Anywhere", description: "Download the full source code whenever you want. Your project, your infrastructure." },
    { icon: Shield, title: "Deploy with Confidence", description: "Publish to a platform subdomain or connect your own domain with automatic TLS provisioning." },
    { icon: Database, title: "Database Built-In", description: "Configure data models and backend functionality through the visual editor — no boilerplate." },
    { icon: ArrowRight, title: "Version History", description: "Every generation creates a versioned snapshot. Roll back any time or compare changes side by side." },
  ];

  return (
    <section className="px-6 py-24 bg-zinc-50 dark:bg-zinc-900/30">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            Everything you need to ship a website
          </h2>
          <p className="mt-4 text-lg text-zinc-600 max-w-2xl mx-auto dark:text-zinc-400">
            From prompt to production, the platform handles the complexity so you can focus on your product.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FeatureItems.map((feature, i) => (
            <div key={i} className="rounded-xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <feature.icon className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
          Start building your first site
        </h2>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          No credit card required. Create a free account and generate your first website in under a minute.
        </p>
        <div className="mt-8">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Start Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
