"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

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
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password,
                }),
                cache: "no-store",
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                setError(
                    data?.error ||
                    data?.message ||
                    "Invalid email or password.",
                );
                return;
            }

            // Confirm the server recognizes the newly created session.
            // Confirm the server recognizes the newly created session.
            const sessionResponse = await fetch("/api/auth/me", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                headers: {
                    Accept: "application/json",
                },
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
                        : `Unable to verify your session (HTTP ${sessionResponse.status}).`,
                );

                return;
            }

            // Support common response formats without assuming the user has an `id` field.
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
                "Unable to connect to the server. Please check your connection and try again.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
            <Card className="w-full max-w-md border-zinc-200 dark:border-zinc-800">
                <CardHeader className="text-center">
                    <Link href={"/"}>
                        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-100">
                            <span className="text-lg font-bold text-white dark:text-zinc-900">
                                AI
                            </span>
                        </div>
                    </Link>

                    <CardTitle className="text-2xl">Welcome back</CardTitle>

                    <CardDescription>
                        Sign in to your account to continue.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <div
                            role="alert"
                            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                            >
                                Email
                            </label>

                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                                >
                                    Password
                                </label>

                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
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
                                    className="pr-10"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    aria-pressed={showPassword}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
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
                            className="w-full gap-2"
                            disabled={loading}
                        >
                            {loading && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}

                            {loading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/signup"
                            className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                        >
                            Sign up
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}