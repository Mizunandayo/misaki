'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Radio } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useDashboard } from '@/store/dashboard'
import { severityOf, formatUsd } from '@/lib/format'

export function ActivityPanelRight() {
  const router = useRouter()
  const { bills, order } = useDashboard(
    useShallow((s) => ({ bills: s.bills, order: s.order })),
  )

  const alerts = useMemo(
    () =>
      order
        .map((id) => bills[id])
        .filter((b) => b && (b.verdict === 'CRITICAL' || b.verdict === 'HIGH'))
        .slice(0, 10),
    [bills, order],
  )

  return (
    <aside className="hidden h-screen min-h-0 flex-col overflow-hidden border-l border-[var(--color-border-soft)] bg-[var(--color-ink-900)]/30 xl:flex">
      {/* Sticky header — aligned with the feed header height */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border-soft)] bg-[var(--color-ink-950)]/80 px-5 py-5 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-low)] opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-low)]" />
          </span>
          <h2 className="text-[15px] font-semibold text-white">Live Alert Stream</h2>
        </div>
        <span className="rounded-full border border-white/12 px-2.5 py-0.5 text-[12.5px] font-semibold text-white/70">
          {alerts.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {alerts.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <Radio size={26} strokeWidth={1.5} className="text-white/35" />
            <span className="max-w-[14rem] text-[13.5px] font-medium text-white/50">
              No critical or high-severity alerts right now
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
                  onClick={() => router.push(`/bills/${b.id}`)}
                  className="group cursor-pointer rounded-xl border border-[var(--color-border-soft)] bg-white/[0.02] px-3.5 py-3 transition-colors duration-200 hover:border-white/15 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12.5px] font-semibold text-white/70">
                      {b.jurisdiction} · {b.bill_number}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold"
                      style={{ color: sev.color }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sev.color }} />
                      {sev.label}
                    </span>
                  </div>
                  <div className="mt-1.5 line-clamp-2 text-[14px] font-medium leading-snug text-white/90">
                    {b.title}
                  </div>
                  <div className="num-mono mt-2 text-[14px] font-bold text-white">
                    {formatUsd(b.compliance_cost_estimate)}
                    <span className="ml-1.5 text-[12.5px] font-medium text-white/45">exposure</span>
                  </div>
                </motion.li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
