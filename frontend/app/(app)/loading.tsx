// Suspense boundary fallback for any remaining server-component transitions.
// Shows immediately — Next.js renders this before the page's async work starts.

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-10 w-64 rounded-lg bg-white/[0.06]" />
        <div className="h-5 w-96 rounded bg-white/[0.04]" />
      </div>
      <div className="space-y-3 mt-8">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-white/[0.04]" />
        ))}
      </div>
    </div>
  )
}
