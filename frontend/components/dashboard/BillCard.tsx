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
    return <Minus size={16} strokeWidth={2.25} className="text-white/55" />
  return velocity > 0 ? (
    <ArrowUpRight size={16} strokeWidth={2.25} style={{ color: 'var(--color-high)' }} />
  ) : (
    <ArrowDownRight size={16} strokeWidth={2.25} style={{ color: 'var(--color-low)' }} />
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
      whileHover={reduce ? undefined : { y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-2xl border bg-[var(--color-ink-900)]/50 p-5',
        'transition-colors duration-200 hover:bg-[var(--color-ink-800)]/60',
      )}
      style={{ borderColor: 'var(--color-border-soft)' }}
    >
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: sev.color }}
        aria-hidden
      />

      <div className="flex items-start justify-between gap-4 pl-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-white/15 px-2 py-0.5 text-[13px] font-semibold text-white">
              {bill.jurisdiction}
            </span>
            <span className="text-[14px] font-semibold text-white/85">{bill.bill_number}</span>
            <span
              className="rounded-md px-2 py-0.5 text-[13px] font-semibold"
              style={{ color: sev.color, backgroundColor: 'rgba(255,255,255,0.04)' }}
            >
              {sev.label}
            </span>
          </div>
          <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-white">{bill.title}</h3>
          <div className="mt-1 text-[14px] font-medium text-white/70">{bill.status}</div>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-[13px] font-medium text-white/55">Exposure</div>
          <div className="num-mono text-2xl font-bold text-white">
            {formatUsd(bill.compliance_cost_estimate)}
          </div>
        </div>
      </div>

      <div className="mt-4 pl-2">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-white/55">Urgency</span>
          <span className="num-mono text-[14px] font-semibold text-white">{urgency}</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: sev.color }}
            initial={{ width: 0 }}
            animate={{ width: `${urgency}%` }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pl-2">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <TrendArrow velocity={bill.pass_probability_velocity_7d} />
            <span className="num-mono text-[15px] font-semibold text-white">
              {Math.round(bill.pass_probability)}%
            </span>
            <span className="text-[13px] font-medium text-white/55">pass</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarClock size={16} strokeWidth={1.75} className="text-white/55" />
            <span className="text-[14px] font-medium text-white/80">
              {daysUntilLabel(bill.effective_date)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={activateAgent}
          className={cn(
            'inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2',
            'text-[14px] font-semibold text-[var(--color-ink-950)]',
            'transition-transform duration-200 hover:scale-[1.03] active:scale-95',
          )}
        >
          <Zap size={16} strokeWidth={2.25} />
          Activate Agent
        </button>
      </div>
    </motion.article>
  )
}
