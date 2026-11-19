export default function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090a0c]">
      <div className="text-center">
        <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-indigo-300" />
        <p className="mt-4 text-sm text-zinc-400">Loading your workspace…</p>
      </div>
    </div>
  );
}
