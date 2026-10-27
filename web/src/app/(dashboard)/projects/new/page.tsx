
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wand2, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select } from "@/components/ui/select";

const FRAMEWORKS = [
  { label: "Next.js (App Router)", value: "nextjs" },
  { label: "React SPA", value: "react" },
  { label: "Node.js API", value: "node" },
  { label: "Static Site", value: "static" },
];

const BUSINESS_TYPES = [
  { label: "Portfolio / Resume", value: "portfolio" },
  { label: "Business / Company", value: "business" },
  { label: "Landing Page", value: "landing" },
  { label: "Blog", value: "blog" },
  { label: "E-commerce", value: "ecommerce" },
  { label: "Dashboard / SaaS", value: "saas" },
  { label: "Restaurant / Cafe", value: "restaurant" },
  { label: "Custom", value: "custom" },
];

interface CreateProjectResponse {
  data?: {
    id?: string | number;
    projectId?: string | number;
    project?: {
      id?: string | number;
    };
  };
  error?: {
    code?: string;
    message?: string;
  } | string;
  message?: string;
}

export default function NewProjectPage() {
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState("nextjs");
  const [businessType, setBusinessType] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleGenerate() {
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    if (!prompt.trim()) {
      setError("Please describe your website.");
      return;
    }

    setError("");
    setGenerating(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          name: name.trim(),
          prompt: prompt.trim(),
          framework,
          businessType: businessType || null,
        }),
      });

      const result = (await response
        .json()
        .catch(() => null)) as CreateProjectResponse | null;

      if (!response.ok) {
        const apiError = result?.error;
        const message =
          typeof apiError === "string"
            ? apiError
            : apiError?.message ||
              result?.message ||
              (response.status === 401
                ? "Please sign in to create a project."
                : "Failed to create the project. Please try again.");

        setError(message);
        return;
      }

      const projectId =
        result?.data?.project?.id ??
        result?.data?.projectId ??
        result?.data?.id;

      if (projectId !== undefined && projectId !== null) {
        router.push(`/projects/${encodeURIComponent(String(projectId))}`);
      } else {
        router.push("/dashboard/customer");
      }

      router.refresh();
    } catch (err) {
      console.error("Project creation failed:", err);
      setError("Could not connect to the server. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <nav className="border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </button>
      </nav>

      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <Card className="w-full max-w-lg border-zinc-200 dark:border-zinc-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-100">
              <Wand2 className="h-6 w-6 text-white dark:text-zinc-900" />
            </div>

            <CardTitle className="text-2xl">
              Create a new project
            </CardTitle>

            <CardDescription>
              Describe the website you want to build.
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

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleGenerate();
              }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Project name
                </label>

                <Input
                  id="name"
                  placeholder="My Awesome Website"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  disabled={generating}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="prompt"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Describe your website
                </label>

                <Textarea
                  id="prompt"
                  placeholder="A modern portfolio site for a freelance photographer with a gallery, about page, and contact form..."
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  rows={4}
                  required
                  disabled={generating}
                />
              </div>

              <Select
                label="Framework"
                options={FRAMEWORKS}
                value={framework}
                onValueChange={setFramework}
              />

              <Select
                label="Business type"
                options={BUSINESS_TYPES}
                value={businessType}
                onValueChange={setBusinessType}
                placeholder="Optional (for better generation)"
              />

              <Button
                type="submit"
                size="lg"
                className="w-full gap-2"
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating project...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Create project
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
