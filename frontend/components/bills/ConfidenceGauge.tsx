'use client'

import { motion, useReducedMotion } from 'framer-motion'






export function ConfidenceGauge({ value }: { value: number }) {
  const reduce = useReducedMotion()
  const radius = 56
  const circumference = 2 * Math.PI * radius
  const dash = circumference * (value / 100)


  
  return (
    <div className="rounded-xl border border-[var(--color-border-medium)] bg-[var(--color-ink-900)] p-5">
      <div className="text-sm font-semibold uppercase tracking-wider text-[var(--color-paper-200)] mb-4">
        Confidence
      </div>
      <div className="flex items-center gap-6">
        <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
          <circle cx="70" cy="70" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
          <motion.circle
            cx="70"
            cy="70"
            r={radius}
            stroke="var(--color-paper-50)"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${dash} ${circumference}` }}
            transition={reduce ? { duration: 0 } : { duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div>
          <div className="text-5xl font-bold tabular-nums text-[var(--color-paper-50)]">{value}</div>
          <div className="mt-1 text-sm text-[var(--color-paper-200)]">out of 100</div>
        </div>
      </div>
    </div>
  )
}