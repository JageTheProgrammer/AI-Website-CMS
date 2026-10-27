export default function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin dark:border-zinc-100 dark:border-t-transparent" />
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    </div>
  );
}
