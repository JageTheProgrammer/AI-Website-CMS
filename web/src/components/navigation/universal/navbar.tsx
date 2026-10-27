
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
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
            response.ok && Boolean(result?.data?.userId)
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

  const accountButton = (
    <Link href={authenticated ? "/dashboard" : "/login"}>
      <Button size="sm" className="text-white">
        {authenticated ? "Dashboard" : "Sign in"}
      </Button>
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
            <span className="text-xs font-bold text-white dark:text-zinc-900">
              AI
            </span>
          </div>
          CMS
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!checkingAuth &&
            (authenticated ? (
              accountButton
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white"
                  >
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="text-white">
                    Get started
                  </Button>
                </Link>
              </>
            ))}
        </div>

        <button
          onClick={() => setOpen((value) => !value)}
          className="p-2 text-zinc-600 dark:text-zinc-400 md:hidden"
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
        <div className="space-y-3 border-t border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {link.label}
            </Link>
          ))}

          <div className="flex gap-3 pt-2">
            {!checkingAuth &&
              (authenticated ? (
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className="flex-1"
                >
                  <Button size="sm" className="w-full text-white">
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
                      className="w-full text-white"
                    >
                      Sign in
                    </Button>
                  </Link>
                  <Link
                    href="/signup"
                    onClick={closeMenu}
                    className="flex-1"
                  >
                    <Button size="sm" className="w-full text-white">
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
