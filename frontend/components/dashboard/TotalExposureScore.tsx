'use client'

import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { formatUsdFull } from '@/lib/format'





function CountUpUsd({ value }: { value: number }) {
  const mv = useMotionValue(0)
  const text = useTransform(mv, (v) => formatUsdFull(Math.round(v)))

  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.1, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [value, mv])

  return <motion.span className="num-mono">{text}</motion.span>
}





export function TotalExposureScore({ value, billCount }: { value: number; billCount: number }) {
  return (
    <div className="flex flex-col">
      <span className="text-[13px] font-medium uppercase tracking-wide text-white/55">
        Total regulatory exposure
      </span>
      <span className="mt-1 text-4xl font-bold text-white">
        <CountUpUsd value={value} />
      </span>
      <span className="mt-1 text-[14px] font-medium text-white/70">
        across {billCount} active {billCount === 1 ? 'bill' : 'bills'}
      </span>
    </div>
  )
}
