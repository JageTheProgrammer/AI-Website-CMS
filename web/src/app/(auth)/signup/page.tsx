
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

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const apiError = data?.error;

        setError(
          typeof apiError === "string"
            ? apiError
            : apiError?.message ||
                data?.message ||
                (response.status === 409
                  ? "An account with this email already exists."
                  : "Failed to create your account. Please try again.")
        );
        return;
      }

      router.push("/dashboard/customer");
      router.refresh();
    } catch (err) {
      console.error("Signup error:", err);
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
        className="pointer-events-none absolute -left-40 top-1/3 h-80 w-80 rounded-full bg-indigo-600/10 blur-[120px]"
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
              Create your account
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Start with an idea. Build something worth sharing.
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
                htmlFor="name"
                className="text-sm font-medium text-zinc-300"
              >
                Full name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Ada Lovelace"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={120}
                className="h-11 border-white/10 bg-zinc-950/70 text-white placeholder:text-zinc-600 focus-visible:ring-indigo-500"
              />
            </div>

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
              <label
                htmlFor="password"
                className="text-sm font-medium text-zinc-300"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
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
              <p className="text-xs text-zinc-500">
                Use at least 8 characters.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full gap-2 bg-indigo-600 font-medium text-white transition-colors hover:bg-indigo-500"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="my-6 border-t border-white/[0.08]" />

          <p className="text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-300 transition-colors hover:text-indigo-200"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-zinc-600">
          Your next project starts with an idea.
        </p>
      </div>
    </main>
  );
}
