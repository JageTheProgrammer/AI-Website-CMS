
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const apiError = data?.error;
        setError(
          typeof apiError === "string"
            ? apiError
            : apiError?.message || data?.message || "Invalid email or password."
        );
        return;
      }

      // Confirm the server recognizes the new session.
      const sessionResponse = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      const sessionData = await sessionResponse.json().catch(() => null);

      if (!sessionResponse.ok) {
        console.error("Session verification failed:", {
          status: sessionResponse.status,
          response: sessionData,
        });

        setError(
          sessionResponse.status === 401 || sessionResponse.status === 403
            ? "Your login was accepted, but no valid session was found. Check your session cookie configuration."
            : `Unable to verify your session (HTTP ${sessionResponse.status}).`
        );
        return;
      }

      const user =
        sessionData?.user ??
        sessionData?.data?.user ??
        sessionData?.data;

      if (
        !user ||
        typeof user !== "object" ||
        (user.userId == null && user.id == null)
      ) {
        console.error("Invalid session response:", sessionData);
        setError("Your session could not be verified. Please try again.");
        return;
      }

      router.replace("/dashboard/customer");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError(
        "Unable to connect to the server. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-5 py-12 text-white sm:px-6">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(79,70,229,0.20),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-1/3 h-80 w-80 rounded-full bg-indigo-600/10 blur-[120px]"
      />

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
        

          <div className="mb-7">
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Sign in to your account
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Pick up where you left off and keep building.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm leading-6 text-red-300"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-zinc-300"
              >
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-white/10 bg-zinc-950/70 text-white placeholder:text-zinc-600 focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-zinc-300"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-zinc-500 transition-colors hover:text-indigo-300"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 border-white/10 bg-zinc-950/70 pr-11 text-white placeholder:text-zinc-600 focus-visible:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full gap-2 bg-indigo-600 font-medium text-white transition-colors hover:bg-indigo-500"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="my-6 border-t border-white/[0.08]" />

          <p className="text-center text-sm text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-indigo-300 transition-colors hover:text-indigo-200"
            >
              Create an account
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-zinc-600">
          Your next project is waiting.
        </p>
      </div>
    </main>
  );
}
