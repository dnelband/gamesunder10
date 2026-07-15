export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <main className="flex max-w-lg flex-col gap-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Games Under €10</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Deal aggregator in progress. Check build status on the internal
          dashboard.
        </p>
        <a
          href="/deals"
          className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:opacity-90"
        >
          Browse deals
        </a>
        <a
          href="/status"
          className="inline-flex h-11 items-center justify-center rounded-full border border-solid border-black/[.08] px-6 text-sm font-medium transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
        >
          Status dashboard
        </a>
      </main>
    </div>
  );
}
