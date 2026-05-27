export function PrecedentMatch({
  precedents,
}: {
  precedents: { id: string; jurisdiction: string; bill_number: string; title: string; similarity: number }[]
}) {
  if (precedents.length === 0) return null
  return (
    <div className="rounded-xl border border-[var(--color-border-medium)] bg-[var(--color-ink-900)] p-5">
      <div className="text-sm font-semibold uppercase tracking-wider text-[var(--color-paper-200)] mb-3">
        Precedent match
      </div>
      <ul className="space-y-2">
        {precedents.map((p) => (
          <li key={p.id} className="text-base text-[var(--color-paper-100)]">
            <span className="font-semibold text-[var(--color-paper-50)]">
              {p.jurisdiction} {p.bill_number}
            </span>
            <span className="ml-2">{p.title}</span>
            <span className="ml-2 text-sm text-[var(--color-paper-200)] tabular-nums">
              {(p.similarity * 100).toFixed(0)}% similar
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
