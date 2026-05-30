'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useMemo, useState, useRef, useCallback } from 'react'

const MIN_H = 120
const MAX_H = 800
const DEFAULT_H = 384

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

  const heightRef = useRef(DEFAULT_H)
  const [height, _setHeight] = useState(DEFAULT_H)
  const setHeight = useCallback((h: number) => {
    heightRef.current = h
    _setHeight(h)
  }, [])

  const onDragStart = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      const startY = e.clientY
      const startH = heightRef.current
      const onMove = (ev: PointerEvent) => {
        setHeight(Math.min(MAX_H, Math.max(MIN_H, startH + (ev.clientY - startY))))
      }
      const onUp = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [setHeight],
  )

  return (
    <div className="rounded-xl border border-[var(--color-border-medium)] bg-[var(--color-ink-900)]">
      <header className="flex items-center justify-between px-6 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#60a5fa]" />
          <span className="text-sm font-bold uppercase tracking-wider text-white">Bill text</span>
        </div>
        {location && (
          <span className="text-sm font-semibold text-[#60a5fa]">Trigger: {location}</span>
        )}
      </header>

      <div
        className="px-6 text-base leading-relaxed text-[var(--color-paper-100)] whitespace-pre-wrap overflow-y-auto"
        style={{ height }}
      >
        {segments.map((seg, i) =>
          seg.highlight ? (
            <AnimatePresence key={i}>
              <motion.mark
                initial={{ backgroundColor: 'rgba(96,165,250,0)' }}
                animate={{ backgroundColor: 'rgba(96,165,250,0.15)' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="rounded px-1 border-l-2 border-[#60a5fa]/70 text-white"
              >
                {seg.text}
              </motion.mark>
            </AnimatePresence>
          ) : (
            <span key={i}>{seg.text}</span>
          ),
        )}
      </div>

      {/* Drag handle */}
      <div
        onPointerDown={onDragStart}
        className="group flex cursor-ns-resize select-none items-center justify-center px-6 pb-4 pt-3"
        title="Drag to resize"
      >
        <div className="h-1 w-10 rounded-full bg-white/15 transition-colors duration-200 group-hover:bg-[#60a5fa]/60" />
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
