'use client'

import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, Minus, CalendarClock, Zap } from 'lucide-react'
import type { Bill } from '@/lib/api'
import { severityOf, formatUsd, daysUntilLabel } from '@/lib/format'
import { useDashboard } from '@/store/dashboard'
import { cn } from '@/lib/utils'

function TrendArrow({ velocity }: { velocity: number | null | undefined }) {
  if (velocity == null || velocity === 0)
    return <Minus size={15} strokeWidth={2.25} className="text-white/45" />
  return velocity > 0 ? (
    <ArrowUpRight size={15} strokeWidth={2.25} style={{ color: 'var(--color-high)' }} />
  ) : (
    <ArrowDownRight size={15} strokeWidth={2.25} style={{ color: 'var(--color-low)' }} />
  )
}

export function BillCard({ bill }: { bill: Bill }) {
  const router = useRouter()
  const reduce = useReducedMotion()
  const selectBill = useDashboard((s) => s.selectBill)
  const sev = severityOf(bill.verdict)
  const urgency = Math.max(0, Math.min(100, bill.urgency_score))

  function open() {
    selectBill(bill.id)
    router.push(`/bills/${bill.id}`)
  }

  function activateAgent(e: React.MouseEvent) {
    e.stopPropagation()
    selectBill(bill.id)
    router.push(`/bills/${bill.id}?agent=1`)
  }

  return (
    <motion.article
      layout
      onClick={open}
      whileHover={reduce ? undefined : { y: -2 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-2xl border',
        'border-[var(--color-border-soft)] bg-[var(--color-ink-900)]/40 px-6 py-5',
        'transition-colors duration-200 hover:border-white/15 hover:bg-[var(--color-ink-900)]/70',
      )}
    >

      {/* Row 1 — identity + exposure */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <span className="rounded-md border border-white/12 px-2 py-0.5 text-[12.5px] font-bold tracking-wide text-white/90">
              {bill.jurisdiction}
            </span>
            <span className="text-[13.5px] font-semibold text-white/65">{bill.bill_number}</span>
            <span
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[12.5px] font-semibold"
              style={{ color: sev.color, backgroundColor: 'rgba(255,255,255,0.035)' }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sev.color }} />
              {sev.label}
            </span>
          </div>
          <h3 className="line-clamp-2 text-[1.18rem] font-semibold leading-snug text-white">
            {bill.title}
          </h3>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-[12px] font-medium uppercase tracking-wide text-white/45">
            Exposure
          </div>
          <div className="num-mono mt-0.5 text-[1.6rem] font-bold leading-none text-white">
            {formatUsd(bill.compliance_cost_estimate)}
          </div>
        </div>
      </div>

      {/* Urgency line */}
      <div className="mt-4 flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/8">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: sev.color }}
            initial={{ width: 0 }}
            animate={{ width: `${urgency}%` }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <span className="num-mono w-9 text-right text-[13px] font-semibold text-white/70">
          {urgency}
        </span>
      </div>

      {/* Row 3 — meta + actions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-5">
          <span className="text-[13.5px] font-medium capitalize text-white/55">
            {bill.status}
          </span>
          <div className="flex items-center gap-1.5">
            <TrendArrow velocity={bill.pass_probability_velocity_7d} />
            <span className="num-mono text-[14px] font-semibold text-white">
              {Math.round(bill.pass_probability)}%
            </span>
            <span className="text-[13px] font-medium text-white/45">pass</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarClock size={15} strokeWidth={1.75} className="text-white/45" />
            <span className="text-[13.5px] font-medium text-white/70">
              {daysUntilLabel(bill.effective_date)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[13.5px] font-semibold text-white/40 transition-colors group-hover:text-white/70">
            View analysis
          </span>
          <button
            type="button"
            onClick={activateAgent}
            className={cn(
              'inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3.5 py-2',
              'text-[13.5px] font-semibold text-[var(--color-ink-950)]',
              'transition-transform duration-200 hover:scale-[1.03] active:scale-95',
            )}
          >
            <Zap size={15} strokeWidth={2.25} />
            Activate Agent
          </button>
        </div>
      </div>
    </motion.article>
  )
}
