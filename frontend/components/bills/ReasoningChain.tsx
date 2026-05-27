'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { StreamEvent } from '@/lib/streaming'

type Step = Extract<StreamEvent, { type: 'reasoning_step' }>

export function ReasoningChain({ steps, live }: { steps: Step[]; live: boolean }) {
  if (steps.length === 0 && !live) return null
  return (
    <div className="rounded-xl border border-[var(--color-border-medium)] bg-[var(--color-ink-900)] p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold uppercase tracking-wider text-[var(--color-paper-200)]">
            Gemini reasoning chain
          </div>
          <h2 className="mt-1 text-2xl font-bold text-[var(--color-paper-50)]">
            How Misaki reached this verdict
          </h2>
        </div>
        {live && (
          <span className="inline-flex items-center gap-2 text-sm text-[var(--color-paper-200)]">
            <span className="size-2 rounded-full bg-[var(--color-paper-50)] animate-pulse" />
            Live
          </span>
        )}
      </header>
      <ol className="space-y-5">
        <AnimatePresence initial={false}>
          {steps.map((s) => (
            <motion.li
              key={s.step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-[40px_1fr] gap-4"
            >
              <div className="text-2xl font-bold tabular-nums text-[var(--color-paper-300)] leading-none pt-1">
                {s.step.toString().padStart(2, '0')}
              </div>
              <div>
                <div className="text-base font-semibold text-[var(--color-paper-50)] leading-relaxed">
                  {s.observation}
                </div>
                <div className="mt-2 text-base text-[var(--color-paper-100)] leading-relaxed">
                  → {s.inference}
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    </div>
  )
}
