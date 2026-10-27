import { Footer } from "@/components/navigation/universal/footer";
import { Navbar } from "@/components/navigation/universal/navbar";

const faqs = [
  { q: "What is AI Website CMS?", a: "AI Website CMS is a prompt-driven platform where you describe the website you need in natural language and our AI generates a working project you can preview, iterate on, deploy to a subdomain or custom domain, and export as source code." },
  { q: "How does pricing work?", a: "We offer a Free tier to get started with basic features, a Pro plan at $19/month for individuals and small teams, and an Enterprise plan for organizations that need scale, support, and custom infrastructure options." },
  { q: "Can I use my own domain name?", a: "Yes. On the Pro and Enterprise plans you can connect a custom domain. We guide you through DNS setup and automatically provision TLS certificates." },
  { q: "Can I export my project source code?", a: "Pro and Enterprise users can download the full source code as a ZIP archive containing dependencies, configuration files, README with setup instructions, and an .env.example with placeholders." },
  { q: "What frameworks are supported for generation?", a: "We generate projects in Next.js by default. Support for React SPA, Node.js, and static site generators is on our roadmap." },
  { q: "How does the AI generation work?", a: "When you submit a prompt, our backend routes it through an AI provider (Ollama during development, Claude in production). The model generates project files which are validated and saved as a new version of your project." },
  { q: "Is my data secure?", a: "Your projects are private by default. Generated code runs in isolated environments, platform secrets are never shared with generated applications, and we use TLS for all communications." },
  { q: "What happens if I exceed my generation limit?", a: "You'll be notified when you're approaching your limit. Your existing projects remain intact and you can continue iterating on them. You can upgrade or wait for the next billing cycle to start generating again." },
  { q: "Can I downgrade from Pro to Free?", a: "Yes, you can downgrade at any time. If you have more projects than the Free tier allows, they will be archived but not deleted. You can republish them after upgrading again." },
];

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
        <Navbar />
      <section className="px-6 py-24 max-w-3xl mx-auto w-full">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50 mb-6">Frequently asked questions</h1>
        <p className="text-lg text-zinc-600 mb-16 dark:text-zinc-400">Everything you need to know about the product.</p>
        <div className="space-y-8">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-zinc-200 pb-8 last:border-0 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">{faq.q}</h2>
              <p className="text-zinc-600 leading-relaxed dark:text-zinc-400">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
