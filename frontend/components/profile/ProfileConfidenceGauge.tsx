'use client'

import { motion, useReducedMotion } from 'framer-motion'

export function ProfileConfidenceGauge({ score }: { score: number }) {
  const reduce = useReducedMotion()
  return (
    <div className="rounded-xl border border-[var(--color-border-medium)] bg-[var(--color-ink-900)] p-6">
      <div className="text-sm font-semibold uppercase tracking-wider text-[var(--color-paper-200)]">
        Profile confidence
      </div>
      <div className="mt-4 text-6xl font-bold tabular-nums text-[var(--color-paper-50)]">
        {score}
      </div>
      <div className="mt-1 text-sm text-[var(--color-paper-200)]">out of 100</div>
      <div className="mt-5 h-1.5 w-full rounded-full bg-[var(--color-ink-800)] overflow-hidden">
        <motion.div
          className="h-full bg-[var(--color-paper-50)]"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={reduce ? { duration: 0 } : { duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}
