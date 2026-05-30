'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Clock } from 'lucide-react'
import type { StreamEvent } from '@/lib/streaming'
import { ModelRouterBadge } from '@/components/intelligence/ModelRouterBadge'

type Step = Extract<StreamEvent, { type: 'reasoning_step' }>
type Attribution = Extract<StreamEvent, { type: 'model_attribution' }> | null

interface ReasoningChainProps {
  steps: Step[]
  live: boolean
  attribution: Attribution
}

function fmtMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`
}

function prettifyCapability(cap: string): string {
  return cap
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function ReasoningChain({ steps, live, attribution }: ReasoningChainProps) {
  if (steps.length === 0 && !live) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden"
    >
      {/* Header */}
      <div className="border-b border-[var(--color-border-soft)] px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-1.5 flex items-center gap-2.5">
              {/* Brain/thinking icon */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span className="text-sm font-semibold uppercase tracking-widest text-[var(--color-paper-200)]">
                {attribution ? 'AI/ML API Reasoning Chain' : 'Reasoning Chain'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">How Misaki reached this verdict</h2>
            {attribution && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mt-3 flex flex-wrap items-center gap-3"
              >
                <ModelRouterBadge provider={attribution.provider} model={attribution.model} />
                <span className="text-base font-medium text-[var(--color-paper-200)]">
                  {prettifyCapability(attribution.capability)}
                </span>
                <span className="flex items-center gap-1.5 text-base font-medium text-[var(--color-paper-200)]">
                  <Clock size={14} strokeWidth={1.75} />
                  {fmtMs(attribution.latency_ms)}
                </span>
              </motion.div>
            )}
          </div>

          {/* Live indicator */}
          {live && (
            <div className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-ink-800)] px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              <span className="text-base font-medium text-white">Live</span>
            </div>
          )}
        </div>
      </div>

      {/* Step list — timeline layout */}
      <ol className="relative flex flex-col px-6 pb-4 pt-2">
        {/* Vertical connector line */}
        <div className="pointer-events-none absolute bottom-4 left-[43px] top-2 w-px bg-gradient-to-b from-[#60a5fa]/30 via-[#60a5fa]/15 to-transparent" />

        <AnimatePresence initial={false}>
          {steps.map((s, idx) => (
            <motion.li
              key={s.step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex gap-5 py-4"
            >
              {/* Step circle */}
              <div className="relative z-10 mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#60a5fa]/25 bg-[#60a5fa]/[0.07]">
                {idx < steps.length - 1 || !live ? (
                  <span className="text-sm font-bold tabular-nums text-[#60a5fa]">
                    {String(s.step).padStart(2, "0")}
                  </span>
                ) : (
                  /* Pulsing dot on the last/active step while live */
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#60a5fa] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#60a5fa]" />
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 pt-1">
                <p className="text-base font-semibold leading-relaxed text-white">
                  {s.observation}
                </p>
                <div className="mt-2.5 flex items-start gap-2">
                  <svg
                    className="mt-1 shrink-0 text-[#60a5fa]"
                    width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <p className="text-[15px] leading-relaxed text-white/65">
                    {s.inference}
                  </p>
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>

        {/* Skeleton while streaming with no steps yet */}
        {live && steps.length === 0 && (
          <li className="relative flex gap-5 py-4">
            <div className="relative z-10 mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#60a5fa]/15 bg-[#60a5fa]/[0.04]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#60a5fa] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#60a5fa]" />
              </span>
            </div>
            <div className="flex-1 space-y-3 pt-1">
              <div className="h-5 w-3/4 animate-pulse rounded-md bg-white/[0.06]" />
              <div className="h-4 w-1/2 animate-pulse rounded-md bg-white/[0.04]" />
            </div>
          </li>
        )}
      </ol>
    </motion.div>
  )
}