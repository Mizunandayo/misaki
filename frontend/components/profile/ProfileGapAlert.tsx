import type { ProfileGap } from '@/lib/api'

export function ProfileGapAlert({ gaps }: { gaps: ProfileGap[] }) {
  if (gaps.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--color-border-medium)] bg-[var(--color-ink-900)] p-6">
        <div className="text-sm font-semibold uppercase tracking-wider text-[var(--color-paper-200)]">
          Coverage
        </div>
        <div className="mt-3 text-base text-[var(--color-paper-50)]">
          No gaps detected. Profile is fully populated.
        </div>
      </div>
    )
  }
  const totalImpact = gaps.reduce((sum, g) => sum + g.accuracy_impact_pct, 0)
  return (
    <div className="rounded-xl border border-[var(--color-border-medium)] bg-[var(--color-ink-900)] p-6">
      <div className="text-sm font-semibold uppercase tracking-wider text-[var(--color-paper-200)]">
        Profile gaps
      </div>
      <div className="mt-3 text-base text-[var(--color-paper-100)]">
        {gaps.length} missing data point{gaps.length === 1 ? '' : 's'} reduce
        monitoring accuracy by ~{totalImpact}%.
      </div>
      <ul className="mt-4 space-y-2 text-sm text-[var(--color-paper-200)]">
        {gaps.map((g) => (
          <li key={g.field} className="flex justify-between border-b border-[var(--color-border-soft)] pb-2">
            <span className="text-[var(--color-paper-50)] font-medium">{g.field}</span>
            <span>{g.reason}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
