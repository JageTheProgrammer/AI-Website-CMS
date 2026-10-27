"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-6">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center dark:bg-red-900/30">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 mb-2 dark:text-zinc-50">Something went wrong</h1>
        <p className="text-zinc-600 mb-6 dark:text-zinc-400">An error occurred while loading this page. Please try again.</p>
        <Button onClick={() => window.location.reload()}>Reload page</Button>
      </div>
    </div>
  );
}
