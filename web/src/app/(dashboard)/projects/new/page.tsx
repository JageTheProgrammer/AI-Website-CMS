"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wand2,
  ArrowLeft,
  Loader2,
  Sparkles,
  Code2,
  Globe,
  BriefcaseBusiness,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
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
import { cn } from "@/lib/utils/cn";

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
    reservedUrl?: string;
    platformSubdomain?: string;
  };
  error?: {
    code?: string;
    message?: string;
  } | string;
  message?: string;
}

interface SubdomainAvailability {
  subdomain: string;
  available: boolean;
  url: string;
}

const fieldClassName =
  "border-white/[0.09] bg-[#08090b] text-zinc-100 placeholder:text-zinc-600 shadow-none transition-colors focus-visible:border-indigo-400/40 focus-visible:ring-2 focus-visible:ring-indigo-400/10 disabled:opacity-50";

export default function NewProjectPage() {
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState("nextjs");
  const [businessType, setBusinessType] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [availability, setAvailability] = useState<{
    name: string;
    status: "checking" | "available" | "taken" | "error";
    result?: SubdomainAvailability;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const projectName = name.trim();
    if (!projectName) {
      setAvailability(null);
      return;
    }

    const controller = new AbortController();
    setAvailability({ name: projectName, status: "checking" });
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/projects/subdomain-availability?name=${encodeURIComponent(projectName)}`,
          { credentials: "same-origin", cache: "no-store", signal: controller.signal },
        );
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body?.error?.message ?? "Could not check this address.");
        }

        const result = body?.data as SubdomainAvailability | undefined;
        if (
          !result ||
          typeof result.subdomain !== "string" ||
          typeof result.available !== "boolean" ||
          typeof result.url !== "string"
        ) {
          throw new Error("The address availability response was invalid.");
        }
        setAvailability({
          name: projectName,
          status: result.available ? "available" : "taken",
          result,
        });
      } catch (checkError) {
        if (controller.signal.aborted) return;
        console.error("Subdomain availability check failed:", checkError);
        setAvailability({ name: projectName, status: "error" });
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [name]);

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
        router.push(`/editor/${encodeURIComponent(String(projectId))}`);
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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#08090b] text-zinc-100">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.10),transparent_65%)]"
      />

      {/* Navigation */}
      <header className="relative z-10 flex h-[65px] shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#08090b]/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-9 gap-2 rounded-xl px-3 text-xs font-medium text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <div className="h-5 w-px bg-white/[0.09]" />

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/20 to-violet-500/10">
              <Sparkles className="h-4 w-4 text-indigo-300" />
            </div>

            <div className="text-sm font-semibold tracking-tight text-zinc-100">
              AI <span className="font-medium text-zinc-500">CMS</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-medium text-zinc-500">
            Project workspace
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 items-start justify-center px-4 py-10 sm:px-6 sm:py-14 lg:items-center lg:py-16">
        <div className="w-full max-w-[580px]">
          {/* Heading */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/[0.16] to-violet-500/[0.06] shadow-[0_0_40px_rgba(99,102,241,0.10)]">
              <Wand2 className="h-6 w-6 text-indigo-300" />
            </div>

            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="h-px w-6 bg-indigo-400/30" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-300/80">
                New workspace
              </span>
              <span className="h-px w-6 bg-indigo-400/30" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Create a new project
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-500">
              Bring your idea to life. Describe your website and let AI help
              you build it.
            </p>
          </div>

          {/* Form card */}
          <Card className="overflow-hidden rounded-2xl border-white/[0.08] bg-[#0d0e12] shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
            <CardHeader className="border-b border-white/[0.06] px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035]">
                  <Globe className="h-4 w-4 text-zinc-400" />
                </div>

                <div>
                  <CardTitle className="text-sm font-semibold text-zinc-100">
                    Project details
                  </CardTitle>
                  <CardDescription className="mt-1 text-xs text-zinc-500">
                    Configure the foundation for your website.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-7">
              {error && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-3.5"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-red-200">
                      Unable to create project
                    </p>
                    <p className="mt-1 break-words text-xs leading-5 text-red-300/80">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleGenerate();
                }}
                className="space-y-6"
              >
                {/* Project name */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="name"
                      className="text-xs font-medium text-zinc-300"
                    >
                      Project name
                    </label>

                    <span className="text-[10px] text-zinc-600">
                      Required
                    </span>
                  </div>

                  <Input
                    id="name"
                    placeholder="e.g. My Portfolio"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    disabled={generating}
                    className={cn("h-11 rounded-xl px-3.5 text-[13px]", fieldClassName)}
                  />

                  <p className="text-[11px] leading-5 text-zinc-600">
                    Choose a name that helps you identify this project.
                  </p>
                  {availability?.name === name.trim() && (
                    <p
                      role="status"
                      className={cn(
                        "break-all text-[11px] leading-5",
                        availability.status === "available" &&
                          "text-emerald-400",
                        availability.status === "taken" && "text-amber-300",
                        (availability.status === "checking" ||
                          availability.status === "error") &&
                          "text-zinc-500",
                      )}
                    >
                      {availability.status === "checking" &&
                        "Checking project address..."}
                      {availability.status === "available" &&
                        `${availability.result?.url} is available`}
                      {availability.status === "taken" &&
                        `${availability.result?.url} is taken. We will assign the next available address automatically.`}
                      {availability.status === "error" &&
                        "Could not check the address right now. Availability is checked again when the project is created."}
                    </p>
                  )}
                </div>

                {/* Website description */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="prompt"
                      className="text-xs font-medium text-zinc-300"
                    >
                      Describe your website
                    </label>

                    <span className="text-[10px] text-zinc-600">
                      Required
                    </span>
                  </div>

                  <Textarea
                    id="prompt"
                    placeholder="A modern portfolio for a freelance photographer, featuring a visual gallery, about section, client testimonials, and a contact form..."
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    rows={5}
                    required
                    disabled={generating}
                    className={cn(
                      "min-h-[130px] resize-y rounded-xl px-3.5 py-3 text-[13px] leading-6",
                      fieldClassName,
                    )}
                  />

                  <div className="flex items-start gap-2 rounded-xl border border-indigo-400/10 bg-indigo-400/[0.035] px-3 py-2.5">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-300/80" />
                    <p className="text-[11px] leading-5 text-zinc-500">
                      Include your website&apos;s purpose, preferred style,
                      sections, and important features for better results.
                    </p>
                  </div>
                </div>

                {/* Configuration divider */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="h-px flex-1 bg-white/[0.06]" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
                    Configuration
                  </span>
                  <div className="h-px flex-1 bg-white/[0.06]" />
                </div>

                {/* Framework */}
                <div className="space-y-2.5">
                  <label
                    htmlFor="framework"
                    className="flex items-center gap-2 text-xs font-medium text-zinc-300"
                  >
                    <Code2 className="h-3.5 w-3.5 text-zinc-500" />
                    Framework
                  </label>

                  <Select
                    label=""
                    options={FRAMEWORKS}
                    value={framework}
                    onValueChange={setFramework}
                  />

                  <p className="text-[11px] leading-5 text-zinc-600">
                    Select the technology you want to use.
                  </p>
                </div>

                {/* Business type */}
                <div className="space-y-2.5">
                  <label
                    htmlFor="businessType"
                    className="flex items-center gap-2 text-xs font-medium text-zinc-300"
                  >
                    <BriefcaseBusiness className="h-3.5 w-3.5 text-zinc-500" />
                    Website category
                    <span className="font-normal text-zinc-600">
                      (Optional)
                    </span>
                  </label>

                  <Select
                    label=""
                    options={BUSINESS_TYPES}
                    value={businessType}
                    onValueChange={setBusinessType}
                    placeholder="Choose a category"
                  />

                  <p className="text-[11px] leading-5 text-zinc-600">
                    Helps tailor the generated website to your use case.
                  </p>
                </div>

                {/* Submit */}
                <div className="border-t border-white/[0.06] pt-5">
                  <Button
                    type="submit"
                    size="lg"
                    className="h-11 w-full gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500 text-[13px] font-medium text-white shadow-[0_0_24px_rgba(99,102,241,0.12)] transition-all hover:border-indigo-300/30 hover:bg-indigo-400 disabled:border-white/[0.06] disabled:bg-white/[0.04] disabled:text-zinc-600 disabled:shadow-none"
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

                  <div className="mt-3 flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-zinc-600" />
                    <p className="text-center text-[10px] text-zinc-600">
                      You can refine your website after creation.
                    </p>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-[10px] text-zinc-700">
            AI CMS <span className="mx-1.5">·</span> Website builder
          </p>
        </div>
      </main>
    </div>
  );
}