'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Radio } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useDashboard } from '@/store/dashboard'
import { severityOf, formatUsd } from '@/lib/format'






export function ActivityPanelRight() {
  const { bills, order } = useDashboard(
    useShallow((s) => ({ bills: s.bills, order: s.order })),
  )

  const alerts = useMemo(
    () =>
      order
        .map((id) => bills[id])
        .filter((b) => b && (b.verdict === 'CRITICAL' || b.verdict === 'HIGH'))
        .slice(0, 8),
    [bills, order],
  )






  return (
    <aside className="hidden xl:flex flex-col gap-4 border-l border-[var(--color-border-soft)] bg-[var(--color-ink-900)]/40 px-5 py-7">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-low)] opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-low)]" />
        </span>
        <h2 className="text-base font-semibold text-white">Live Alert Stream</h2>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <Radio size={28} strokeWidth={1.5} className="text-white/40" />
          <span className="text-[14px] font-medium text-white/55">
            No critical or high alerts right now
          </span>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {alerts.map((b) => {
            const sev = severityOf(b.verdict)
            return (
              <motion.li
                key={b.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-xl border border-[var(--color-border-soft)] bg-white/[0.02] p-3.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-white">
                    {b.jurisdiction} · {b.bill_number}
                  </span>
                  <span className="text-[13px] font-semibold" style={{ color: sev.color }}>
                    {sev.label}
                  </span>
                </div>
                <div className="mt-1 line-clamp-2 text-[14px] font-medium text-white/80">
                  {b.title}
                </div>
                <div className="mt-1.5 num-mono text-[14px] font-semibold text-white/90">
                  {formatUsd(b.compliance_cost_estimate)} exposure
                </div>
              </motion.li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}
