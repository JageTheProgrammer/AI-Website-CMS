import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, FileSearch } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090a0c] px-6 text-zinc-100">
      <div className="max-w-md text-center">
        <p className="mb-4 text-5xl font-semibold tracking-tight text-zinc-600">404</p>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-white">Page not found</h1>
        <p className="mb-8 text-sm leading-6 text-zinc-400">This address may have changed, or the page may no longer be available.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/">
            <Button variant="default" className="gap-2"><Home className="h-4 w-4" /> Go home</Button>
          </Link>
          <Link href="/projects">
            <Button variant="outline" className="gap-2 border-white/10 bg-transparent text-zinc-200 hover:bg-white/[0.06] hover:text-white"><FileSearch className="h-4 w-4" /> Projects</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
