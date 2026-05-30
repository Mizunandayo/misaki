'use client'

import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { formatUsdFull } from '@/lib/format'

interface Props {
  exposure: number
  criticalCount: number
  highCount: number
  monitoringCount: number
  totalBills: number
}

function CountUpUsd({ value }: { value: number }) {
  const mv = useMotionValue(0)
  const text = useTransform(mv, (v) => formatUsdFull(Math.round(v)))
  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.1, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [value, mv])
  return <motion.span className="num-mono">{text}</motion.span>
}

function Stat({
  label,
  children,
  sub,
  dot,
  emphasis,
}: {
  label: string
  children: React.ReactNode
  sub?: string
  dot?: string
  emphasis?: boolean
}) {
  return (
    <div
      className="flex flex-col justify-between rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-ink-900)]/40 p-5 transition-colors duration-200 hover:border-white/15"
    >
      <div className="flex items-center gap-2">
        {dot && (
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: dot }}
            aria-hidden
          />
        )}
        <span className="text-[13px] font-semibold uppercase tracking-wide text-white/55">
          {label}
        </span>
      </div>
      <div
        className={[
          'mt-3 font-bold tracking-tight text-white',
          emphasis ? 'text-[2.6rem] leading-none' : 'text-4xl leading-none',
        ].join(' ')}
      >
        {children}
      </div>
      {sub && <div className="mt-2 text-[13px] font-medium text-white/55">{sub}</div>}
    </div>
  )
}

export function StatStrip({
  exposure,
  criticalCount,
  highCount,
  monitoringCount,
  totalBills,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {/* Exposure spans two columns on mobile for prominence */}
      <div className="col-span-2 lg:col-span-1">
        <Stat
          label="Total exposure"
          sub={`across ${totalBills} active ${totalBills === 1 ? 'bill' : 'bills'}`}
          emphasis
        >
          <CountUpUsd value={exposure} />
        </Stat>
      </div>

      <Stat label="Critical" dot="var(--color-critical)" sub="immediate action">
        <span className="num-mono">{criticalCount}</span>
      </Stat>

      <Stat label="High" dot="var(--color-high)" sub="within 30 days">
        <span className="num-mono">{highCount}</span>
      </Stat>

      <Stat label="Monitoring" dot="var(--color-low)" sub="medium + low">
        <span className="num-mono">{monitoringCount}</span>
      </Stat>
    </motion.div>
  )
}
