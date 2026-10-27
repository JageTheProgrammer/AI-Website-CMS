import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, FileSearch } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-6">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-zinc-300 dark:text-zinc-700 mb-4">404</p>
        <h1 className="text-2xl font-bold text-zinc-900 mb-2 dark:text-zinc-50">Page not found</h1>
        <p className="text-zinc-600 mb-8 dark:text-zinc-400">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/">
            <Button variant="default" className="gap-2"><Home className="h-4 w-4" /> Home</Button>
          </Link>
          <Link href="/projects">
            <Button variant="outline" className="text-white gap-2"><FileSearch className="h-4 w-4" /> Projects</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
