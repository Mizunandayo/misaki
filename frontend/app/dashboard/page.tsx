import Link from 'next/link'

export default function DashboardPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        <div className="text-7xl font-bold text-[var(--color-ember-500)] mb-6">見先</div>
        <h1 className="text-4xl font-bold text-[var(--color-paper-50)] mb-4">
          Dashboard arrives Day 4
        </h1>
        <p className="text-lg text-[var(--color-paper-200)] mb-10">
          The full threat feed, MCP Reasoning Panel, and Ask Misaki panel land on
          Thursday, May 29. Today the data pipeline ingests bills via Bright Data MCP
          into PostgreSQL.
        </p>
        <Link
          href="/"
          className="cursor-pointer inline-flex items-center gap-2 text-[var(--color-ember-500)] hover:text-[var(--color-ember-400)] transition-colors text-base font-semibold"
        >
          Back to landing
        </Link>
      </div>
    </main>
  )
}
