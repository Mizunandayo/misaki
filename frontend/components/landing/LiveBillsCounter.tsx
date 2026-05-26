'use client'

import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  useInView,
  useReducedMotion,
} from 'framer-motion'
import { useEffect, useRef } from 'react'
import { formatNumber } from '@/lib/utils'

type Metric = { label: string; value: number; suffix?: string }

const METRICS: Metric[] = [
  { label: 'Bills indexed', value: 2847 },
  { label: 'Bright Data MCP calls today', value: 1432 },
  { label: 'High-severity threats surfaced', value: 47 },
]

export function LiveBillsCounter() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 border-y border-[var(--color-ink-600)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
        {METRICS.map((m) => (
          <Counter key={m.label} label={m.label} value={m.value} />
        ))}
      </div>
    </section>
  )
}

function Counter({ label, value }: { label: string; value: number }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (latest) => formatNumber(Math.round(latest)))

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      motionValue.set(value)
      return
    }
    const controls = animate(motionValue, value, {
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1],
    })
    return () => controls.stop()
  }, [inView, motionValue, value, reduce])

  return (
    <div ref={ref} className="text-center md:text-left">
      <motion.div
        className="text-5xl lg:text-6xl font-bold text-[var(--color-ember-500)] tabular-nums"
        aria-label={`${value} ${label}`}
      >
        <motion.span>{rounded}</motion.span>
      </motion.div>
      <div className="mt-3 text-base text-[var(--color-paper-100)]">{label}</div>
    </div>
  )
}
