'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'







export function TriggeringClause({
  billText,
  triggering,
  location,
}: {
  billText: string
  triggering: string | null
  location: string | null
}) {
  const segments = useMemo(() => splitByTrigger(billText, triggering), [billText, triggering])

  return (
    <div className="rounded-xl border border-[var(--color-border-medium)] bg-[var(--color-ink-900)] p-6">
      <header className="mb-5 flex items-center justify-between">
        <div className="text-sm font-semibold uppercase tracking-wider text-[var(--color-paper-200)]">
          Bill text
        </div>
        {location && (
          <div className="text-sm text-[var(--color-paper-100)] font-medium">
            Trigger: {location}
          </div>
        )}
      </header>
      <div className="text-base leading-relaxed text-[var(--color-paper-100)] whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
        {segments.map((seg, i) =>
          seg.highlight ? (
            <AnimatePresence key={i}>
              <motion.mark
                initial={{ backgroundColor: 'rgba(255,255,255,0)' }}
                animate={{ backgroundColor: 'rgba(255,255,255,0.16)' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="rounded px-1 border-l-2 border-[var(--color-paper-50)]/80 text-[var(--color-paper-50)]"
              >
                {seg.text}
              </motion.mark>
            </AnimatePresence>
          ) : (
            <span key={i}>{seg.text}</span>
          ),
        )}
      </div>
    </div>
  )
}

function splitByTrigger(text: string, trigger: string | null) {
  if (!trigger) return [{ text, highlight: false }]
  const idx = text.indexOf(trigger)
  if (idx < 0) return [{ text, highlight: false }]
  return [
    { text: text.slice(0, idx), highlight: false },
    { text: trigger, highlight: true },
    { text: text.slice(idx + trigger.length), highlight: false },
  ]
}
