"use client";

import { motion } from 'framer-motion';
import { VerdictBadge } from './VerdictBadge'

function formatUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

export function ExposureCard({
  verdict,
  confidence,
  exposureUsd,
  probability,
}: {
  verdict: string
  confidence: number
  exposureUsd: number
  probability: { score: number; velocity_7d: number; velocity_direction: string } | null
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border border-border-medium bg-ink-900 p-6"
    >
      <VerdictBadge verdict={verdict} />
      <div className="mt-5">
        <div className="text-sm font-semibold uppercase tracking-wider text-[var(--color-paper-200)]">
          Estimated compliance exposure
        </div>
        <div className="mt-2 text-5xl font-bold tabular-nums text-[var(--color-paper-50)]">
          {formatUsd(exposureUsd)}
        </div>
      </div>
      {probability && (
        <div className="mt-6 border-t border-border-soft pt-5">
          <div className="text-sm font-semibold uppercase tracking-wider text-[var(--color-paper-200)]">
            Pass probability
          </div>
          <div className="mt-2 flex items-end gap-4">
            <div className="text-3xl font-bold tabular-nums text-[var(--color-paper-50)]">
              {probability.score}%
            </div>
            <div className="pb-1 text-sm text-[var(--color-paper-200)]">
              {probability.velocity_direction}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
