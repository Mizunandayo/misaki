'use client'

import { cn } from '@/lib/utils'
import type { SeverityFilter, JurisdictionFilter } from '@/store/dashboard'
import type { Verdict } from '@/lib/api'
import { SEVERITY } from '@/lib/format'

const SEVERITY_ORDER: SeverityFilter[] = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']





function Chip({
  active,
  onClick,
  children,
  dotColor,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  dotColor?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-1.5',
        'text-[14px] font-medium transition-all duration-200',
        active
          ? 'bg-white text-[var(--color-ink-950)]'
          : 'border border-[var(--color-border-soft)] text-white/70 hover:border-white/30 hover:text-white',
      )}
    >
      {dotColor && (
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} aria-hidden />
      )}
      {children}
    </button>
  )
}




export function FilterBar({
  jurisdictions,
  jurisdictionFilter,
  severityFilter,
  onJurisdiction,
  onSeverity,
}: {
  jurisdictions: string[]
  jurisdictionFilter: JurisdictionFilter
  severityFilter: SeverityFilter
  onJurisdiction: (j: JurisdictionFilter) => void
  onSeverity: (s: SeverityFilter) => void
}) {



  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {SEVERITY_ORDER.map((s) => (
          <Chip
            key={s}
            active={severityFilter === s}
            onClick={() => onSeverity(s)}
            dotColor={s === 'ALL' ? undefined : SEVERITY[s as Verdict].color}
          >
            {s === 'ALL' ? 'All severities' : SEVERITY[s as Verdict].label}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Chip active={jurisdictionFilter === 'ALL'} onClick={() => onJurisdiction('ALL')}>
          All jurisdictions
        </Chip>
        {jurisdictions.map((j) => (
          <Chip key={j} active={jurisdictionFilter === j} onClick={() => onJurisdiction(j)}>
            {j}
          </Chip>
        ))}
      </div>
    </div>
  )
}
