import Link from 'next/link'
import { api, type Bill } from '@/lib/api'

const VERDICT_TONE: Record<string, string> = {
  CRITICAL: 'text-[color:var(--color-critical)]',
  HIGH: 'text-[color:var(--color-high)]',
  MEDIUM: 'text-[color:var(--color-medium)]',
  LOW: 'text-[color:var(--color-low)]',
}

export default async function BillsListPage() {
  const data = await api.bills.list()
  return (
    <main className="mx-auto max-w-7xl px-6 py-20">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-[var(--color-paper-50)]">
          Active legislation
        </h1>
        <p className="mt-3 text-lg text-[var(--color-paper-200)]">
          {data.total} bills under analysis. Click one to see Gemini&apos;s live reasoning.
        </p>
      </header>

      <ul className="space-y-3">
        {data.items.map((bill) => (
          <li key={bill.id}>
            <BillRow bill={bill} />
          </li>
        ))}
      </ul>
    </main>
  )
}

function BillRow({ bill }: { bill: Bill }) {
  return (
    <Link
      href={`/bills/${bill.id}`}
      prefetch
      className="group flex items-center gap-6 rounded-xl border border-[var(--color-border-medium)] bg-[var(--color-ink-900)] px-6 py-5 cursor-pointer transition-colors hover:border-[var(--color-paper-50)]/40"
    >
      <span className="rounded bg-[var(--color-ink-800)] px-3 py-1 text-sm font-semibold text-[var(--color-paper-100)]">
        {bill.jurisdiction} · {bill.bill_number}
      </span>
      <h2 className="flex-1 text-lg font-semibold text-[var(--color-paper-50)] line-clamp-1">
        {bill.title}
      </h2>
      <div className="flex items-center gap-6 text-sm text-[var(--color-paper-200)] tabular-nums">
        <span>Pass {bill.pass_probability}%</span>
        <span>Urgency {bill.urgency_score}</span>
      </div>
    </Link>
  )
}