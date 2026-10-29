
import Link from "next/link";
import {
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "FAQ", href: "/faq" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy policy", href: "/privacy" },
    { label: "Terms of service", href: "/terms" },
    { label: "Cookie policy", href: "/cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.08] bg-zinc-950 text-white">
      {/* Subtle ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_65%)]"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Main footer */}
        <div className="grid gap-12 py-14 sm:grid-cols-2 sm:py-16 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-16">
          {/* Brand */}
          <div className="max-w-sm">
            <Link
              href="/"
              className="group inline-flex items-center gap-3"
            >
              <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] transition-colors group-hover:bg-white/10">
                <span className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-transparent" />
                <Sparkles className="relative h-5 w-5 text-indigo-200" />
              </span>

              <span>
                <span className="block text-base font-semibold tracking-tight">
                  AI CMS
                </span>
                <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                  Website builder
                </span>
              </span>
            </Link>

            <p className="mt-5 text-sm leading-7 text-zinc-400">
              Turn your ideas into beautiful websites. Design, build,
              and manage your next project in one place.
            </p>

            <Link
              href="/signup"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-200 transition-colors hover:text-indigo-300"
            >
              Start building
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-200">
                {title}
              </h3>

              <ul className="space-y-3.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-white/[0.08] py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">
            © 2026 AI Website CMS. All rights reserved.
          </p>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Built for your next big idea
          </div>
        </div>
      </div>
    </footer>
  );
}
