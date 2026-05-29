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
    <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-ink-900)]/60 p-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[14px] font-semibold uppercase tracking-widest text-white/70">
            {attribution ? 'AI/ML API reasoning chain' : 'Reasoning chain'}
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
            How Misaki reached this verdict
          </h2>
          {attribution && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-2 flex flex-wrap items-center gap-3"
            >
              <ModelRouterBadge provider={attribution.provider} model={attribution.model} />
              <span className="text-[14px] font-medium text-white/60">
                {prettifyCapability(attribution.capability)} capability
              </span>
              <span className="flex items-center gap-1.5 text-[14px] font-medium text-white/60">
                <Clock size={13} strokeWidth={1.75} />
                {fmtMs(attribution.latency_ms)}
              </span>
            </motion.div>
          )}
        </div>
        {live && (
          <span className="inline-flex items-center gap-2 text-base font-medium text-white/80">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            Live
          </span>
        )}
      </header>

      <ol className="flex flex-col gap-6">
        <AnimatePresence initial={false}>
          {steps.map((s) => (
            <motion.li
              key={s.step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-[48px_1fr] gap-4"
            >
              {/* Step number + model badge stacked */}
              <div className="flex flex-col items-center gap-2 pt-0.5">
                <span className="text-2xl font-bold tabular-nums leading-none text-white/50">
                  {s.step.toString().padStart(2, '0')}
                </span>
                {attribution && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                  >
                    <ModelRouterBadge
                      provider={attribution.provider}
                      model={attribution.model}
                      className="text-[11px] px-1.5 py-0.5"
                    />
                  </motion.div>
                )}
              </div>

              {/* Step content */}
              <div>
                <div className="text-base font-semibold leading-relaxed text-white">
                  {s.observation}
                </div>
                <div className="mt-2 flex items-start gap-2 text-base font-medium leading-relaxed text-white/80">
                  <span className="mt-1 shrink-0 text-white/40" aria-hidden>→</span>
                  <span>{s.inference}</span>
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    </div>
  )
}
