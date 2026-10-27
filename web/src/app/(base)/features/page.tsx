import { Wand2, Monitor, Download, Shield, Database, ArrowRight, Layers, GitBranch, Server, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";

const FEATURES = [
  { icon: Wand2, title: "Natural Language Generation", description: "Describe your website in plain English. Our AI generates a complete, functional project with multiple pages, responsive layouts, and working components." },
  { icon: Monitor, title: "Live Preview", description: "See your website instantly as it is generated. Test on different viewports and refine with follow-up prompts until every detail matches your vision." },
  { icon: Layers, title: "Version History", description: "Every generation creates a versioned snapshot. Roll back any time, compare changes side by side, or branch off from a previous version." },
  { icon: Database, title: "Database Configuration", description: "Add data models, relationships, and API endpoints through the visual editor. No SQL required — our AI handles schema generation and migrations." },
  { icon: Globe, title: "Custom Domains", description: "Connect your own domain with guided DNS setup. Automatic TLS provisioning ensures your site is secured with HTTPS from day one." },
  { icon: Server, title: "Deployment Pipeline", description: "Deploy to platform subdomains or your own infrastructure. View build logs, track deployment status, and rollback to any previous version instantly." },
  { icon: GitBranch, title: "Source Code Export", description: "Download your project as a complete, reproducible archive with dependencies, configuration files, README, and setup instructions." },
  { icon: Shield, title: "Security by Default", description: "Your projects are private. Generated code runs in isolated environments. Platform secrets are never shared with generated applications." },
];

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <Navbar />
      <section className="px-6 py-24 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50 mb-6">Platform features</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">Everything you need to build, manage, and deploy professional websites — powered by AI.</p>
      </section>

      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="border-zinc-200 dark:border-zinc-800">
              <CardContent className="p-6 flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-100 flex items-center justify-center dark:bg-zinc-800">
                  <feature.icon className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{feature.title}</h3>
                  <p className="text-sm text-zinc-600 mt-1 leading-relaxed dark:text-zinc-400">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Ready to get started?</h2>
          <p className="text-zinc-600 mb-8 dark:text-zinc-400">Create a free account and generate your first website in under a minute.</p>
          <a href="/signup"><Button size="lg" className="gap-2">Get started free <ArrowRight className="h-4 w-4" /></Button></a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
