'use client'

import { motion, useReducedMotion } from 'framer-motion'

type ThreatItem = {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  jurisdiction: string
  bill: string
  title: string
  probability: number
  days: number
}

const THREATS: ThreatItem[] = [
  {
    severity: 'CRITICAL',
    jurisdiction: 'TX',
    bill: 'SB 2847',
    title: 'Texas Consumer Data Protection Act Amendments',
    probability: 71,
    days: 94,
  },
  {
    severity: 'HIGH',
    jurisdiction: 'EU',
    bill: 'AIA DA-04',
    title: 'EU AI Act Delegated Act on High-Risk AI Systems',
    probability: 81,
    days: 142,
  },
  {
    severity: 'HIGH',
    jurisdiction: 'CA',
    bill: 'AB 1823',
    title: 'California AI Transparency and Safety Act',
    probability: 54,
    days: 188,
  },
  {
    severity: 'MEDIUM',
    jurisdiction: 'NY',
    bill: 'A 8807',
    title: 'New York Algorithmic Accountability Act',
    probability: 42,
    days: 211,
  },
  {
    severity: 'HIGH',
    jurisdiction: 'UK',
    bill: 'HC 1142',
    title: 'UK Online Safety Bill — Technical Amendments',
    probability: 59,
    days: 167,
  },
]

const SEVERITY_STYLES: Record<ThreatItem['severity'], { bar: string; text: string; label: string }> = {
  CRITICAL: { bar: 'var(--color-critical)',    text: 'var(--color-critical)',    label: 'CRITICAL' },
  HIGH:     { bar: 'var(--color-ember-500)',   text: 'var(--color-ember-500)',   label: 'HIGH' },
  MEDIUM:   { bar: 'var(--color-medium)',      text: 'var(--color-medium)',      label: 'MEDIUM' },
}

export function ThreatTickerPreview() {
  const reduce = useReducedMotion()
  // Duplicate the array so the marquee loops seamlessly
  const items = [...THREATS, ...THREATS]

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="size-2.5 rounded-full bg-[var(--color-critical)] animate-pulse" />
            <span className="text-sm font-semibold uppercase tracking-wider text-[var(--color-paper-100)]">
              Live threat feed
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-[var(--color-paper-50)]">
            What NovaTech sees this morning
          </h2>
        </header>
      </div>

      <div className="relative overflow-hidden">
        {/* Gradient fades on edges */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32"
          style={{
            background: 'linear-gradient(90deg, var(--color-ink-950) 0%, transparent 100%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32"
          style={{
            background: 'linear-gradient(270deg, var(--color-ink-950) 0%, transparent 100%)',
          }}
        />

        <motion.div
          className="flex gap-5"
          animate={reduce ? undefined : { x: ['0%', '-50%'] }}
          transition={
            reduce
              ? undefined
              : { duration: 45, repeat: Infinity, ease: 'linear' }
          }
        >
          {items.map((item, i) => (
            <ThreatCard key={`${item.bill}-${i}`} item={item} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function ThreatCard({ item }: { item: ThreatItem }) {
  const style = SEVERITY_STYLES[item.severity]

  return (
    <article
      className="group relative shrink-0 w-[420px] rounded-xl border border-[var(--color-ink-600)] bg-[var(--color-ink-900)] p-6 cursor-pointer transition-colors hover:border-[var(--color-ember-500)]"
    >
      {/* Severity bar */}
      <div
        className="absolute left-0 top-6 bottom-6 w-1 rounded-r-full"
        style={{ backgroundColor: style.bar }}
        aria-hidden
      />

      <div className="ml-3">
        <div className="flex items-center justify-between mb-4">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded text-sm font-bold tracking-wider"
            style={{ color: style.text, backgroundColor: 'var(--color-ink-800)' }}
          >
            {style.label}
          </span>
          <span className="text-sm font-semibold text-[var(--color-paper-100)]">
            {item.jurisdiction} · {item.bill}
          </span>
        </div>

        <h3 className="text-lg font-semibold leading-snug text-[var(--color-paper-50)] line-clamp-2">
          {item.title}
        </h3>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <Field label="Pass probability" value={`${item.probability}%`} accent />
          <Field label="Days to enactment" value={String(item.days)} />
        </div>
      </div>
    </article>
  )
}

function Field({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-sm text-[var(--color-paper-200)]">{label}</div>
      <div
        className="mt-1 text-xl font-bold tabular-nums"
        style={{
          color: accent ? 'var(--color-ember-500)' : 'var(--color-paper-50)',
        }}
      >
        {value}
      </div>
    </div>
  )
}
