/* eslint-disable react-hooks/static-components */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const result = await response.json();

        if (active) {
          setAuthenticated(
            response.ok && Boolean(result?.data?.userId),
          );
        }
      } catch {
        if (active) setAuthenticated(false);
      } finally {
        if (active) setCheckingAuth(false);
      }
    }

    void checkAuth();

    return () => {
      active = false;
    };
  }, []);

  const closeMenu = () => setOpen(false);

  const Logo = () => (
    <Link
      href="/"
      onClick={closeMenu}
      aria-label="AI CMS home"
      className="group flex shrink-0 items-center gap-2.5"
    >
      <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl border border-indigo-300/20 bg-gradient-to-br from-indigo-400/20 via-indigo-500/10 to-violet-500/20 shadow-lg shadow-indigo-950/20 transition-all duration-300 group-hover:border-indigo-300/40 group-hover:shadow-indigo-500/10">
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <Sparkles className="relative h-[17px] w-[17px] text-indigo-300 transition-transform duration-300 group-hover:scale-110" />
      </span>

      <span className="flex items-baseline gap-1.5">
        <span className="text-[15px] font-semibold tracking-tight text-white">
          AI
        </span>
        <span className="text-[15px] font-medium tracking-tight text-zinc-400 transition-colors group-hover:text-zinc-200">
          CMS
        </span>
      </span>
    </Link>
  );

  return (
    <header className="relative top-0 z-40 w-full border-b border-white/[0.07] bg-[#08090b]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Logo />

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!checkingAuth &&
            (authenticated ? (
              <Link href="/dashboard">
                <Button
                  size="sm"
                  className="border border-indigo-400/20 bg-indigo-500 text-white hover:bg-indigo-400"
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                  >
                    Sign in
                  </Button>
                </Link>

                <Link href="/signup">
                  <Button
                    size="sm"
                    className="border border-indigo-400/20 bg-indigo-500 text-white shadow-sm shadow-indigo-950/30 hover:bg-indigo-400"
                  >
                    Get started
                  </Button>
                </Link>
              </>
            ))}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/[0.07] bg-[#08090b]/95 px-6 py-4 backdrop-blur-xl md:hidden">
          <nav className="space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="block rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-3 flex gap-3 border-t border-white/[0.07] pt-4">
            {!checkingAuth &&
              (authenticated ? (
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className="flex-1"
                >
                  <Button
                    size="sm"
                    className="w-full bg-indigo-500 text-white hover:bg-indigo-400"
                  >
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-white/10 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.08] hover:text-white"
                    >
                      Sign in
                    </Button>
                  </Link>

                  <Link
                    href="/signup"
                    onClick={closeMenu}
                    className="flex-1"
                  >
                    <Button
                      size="sm"
                      className="w-full bg-indigo-500 text-white hover:bg-indigo-400"
                    >
                      Get started
                    </Button>
                  </Link>
                </>
              ))}
          </div>
        </div>
      )}
    </header>
  );
}
