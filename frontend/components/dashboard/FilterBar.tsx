'use client'

import { cn } from '@/lib/utils'
import type { SeverityFilter, JurisdictionFilter } from '@/store/dashboard'
import type { Verdict } from '@/lib/api'
import { SEVERITY } from '@/lib/format'
import { Search, X } from 'lucide-react'

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
  search,
  onSearch,
}: {
  jurisdictions: string[]
  jurisdictionFilter: JurisdictionFilter
  severityFilter: SeverityFilter
  onJurisdiction: (j: JurisdictionFilter) => void
  onSeverity: (s: SeverityFilter) => void
  search: string
  onSearch: (q: string) => void
}) {
  return (
    <div className="flex flex-col gap-3">

      {/* Row 1 — search + severity filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search input */}
        <div className="relative flex min-w-[200px] flex-1 items-center sm:max-w-xs">
          <Search
            size={14}
            strokeWidth={2}
            className="pointer-events-none absolute left-3 text-white/40"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search bills…"
            className={cn(
              'h-9 w-full rounded-full border border-[var(--color-border-soft)]',
              'bg-[var(--color-ink-900)]/60 pl-8 pr-8 text-[14px] font-medium text-white',
              'placeholder:text-white/35 transition-colors duration-200',
              'focus:border-white/25 focus:outline-none',
            )}
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearch('')}
              className="absolute right-3 cursor-pointer text-white/40 hover:text-white"
            >
              <X size={13} strokeWidth={2} />
            </button>
          )}
        </div>

        <div className="h-5 w-px bg-white/10" aria-hidden />

        {SEVERITY_ORDER.map((s) => (
          <Chip
            key={s}
            active={severityFilter === s}
            onClick={() => onSeverity(s)}
            dotColor={s === 'ALL' ? undefined : SEVERITY[s as Verdict].color}
          >
            {s === 'ALL' ? 'All' : SEVERITY[s as Verdict].label}
          </Chip>
        ))}
      </div>

      {/* Row 2 — jurisdiction filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-white/30">
          Jurisdiction
        </span>
        <Chip active={jurisdictionFilter === 'ALL'} onClick={() => onJurisdiction('ALL')}>
          All
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

