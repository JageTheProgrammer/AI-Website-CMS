import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, GitBranch } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Open source", href: "/pricing" },
    { label: "FAQ", href: "/faq" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Cookies", href: "/cookies" },
    { label: "Apache 2.0", href: "https://www.apache.org/licenses/LICENSE-2.0" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#090a0c] text-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1fr] lg:gap-12 lg:py-14">
          <div className="max-w-sm">
            <Link href="/" aria-label="Polityra CMS home">
              <Image
                src="/images/polityra-cms-logo-dark.png"
                alt="Polityra CMS"
                width={1040}
                height={312}
                className="h-8 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-400">
              An open-source website builder maintained by the Polityra organization.
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-200 transition-colors hover:text-indigo-300"
            >
              About the project <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                {title}
              </h2>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                      className="text-sm text-zinc-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-white/[0.08] py-5 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Polityra CMS · Apache License 2.0</p>
          <a
            href="https://github.com/Polityra"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
          >
            A Polityra organization project <GitBranch className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
