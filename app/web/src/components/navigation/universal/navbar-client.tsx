"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Open source", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
];

export function NavbarClient({ authenticated }: { authenticated: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-[#090a0c]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5 sm:px-6">
        <Link
          href="/"
          onClick={closeMenu}
          aria-label="Polityra CMS home"
          className="shrink-0"
        >
          <Image
            src="/images/polityra-cms-logo-dark.png"
            alt="Polityra CMS"
            width={1040}
            height={312}
            priority
            unoptimized
            className="h-8 w-auto"
          />
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative py-1 text-sm transition-colors ${
                  active ? "text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-[23px] left-0 h-px w-full bg-indigo-400 transition-opacity ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {authenticated ? (
            <Button asChild size="sm" className="bg-white text-zinc-950 hover:bg-zinc-200">
              <Link href="/dashboard">Open workspace</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-zinc-300 hover:bg-white/[0.06] hover:text-white">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="bg-white text-zinc-950 hover:bg-zinc-200">
                <Link href="https://github.com/Polityra">GitHub</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-lg p-2 text-zinc-300 transition-colors hover:bg-white/[0.06] md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-navigation" className="border-t border-white/[0.07] bg-[#090a0c] px-5 py-4 md:hidden">
          <nav aria-label="Mobile navigation" className="space-y-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-indigo-400/[0.10] text-white"
                      : "text-zinc-300 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 flex gap-2 border-t border-white/[0.07] pt-4">
            {authenticated ? (
              <>
                <Button asChild variant="outline" className="flex-1 border-white/10 bg-transparent text-zinc-200 hover:bg-white/[0.06] hover:text-white">
                  <a href="https://github.com/Polityra" target="_blank" rel="noreferrer">Polityra on GitHub</a>
                </Button>
                <Button asChild className="flex-1 bg-white text-zinc-950 hover:bg-zinc-200">
                  <Link href="/dashboard" onClick={closeMenu}>Open workspace</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" className="flex-1 border-white/10 bg-transparent text-zinc-200 hover:bg-white/[0.06] hover:text-white">
                  <Link href="/login" onClick={closeMenu}>Sign in</Link>
                </Button>
                <Button asChild className="flex-1 bg-white text-zinc-950 hover:bg-zinc-200">
                  <Link href="https://github.com/Polityra" onClick={closeMenu}>Github</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
