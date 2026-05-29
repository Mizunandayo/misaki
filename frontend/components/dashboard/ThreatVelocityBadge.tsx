'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Activity, Minus } from 'lucide-react'





export function ThreatVelocityBadge({ highSeverityCount }: { highSeverityCount: number }) {
  const level =
    highSeverityCount >= 5
      ? { label: 'Elevated', tone: 'var(--color-high)', Icon: TrendingUp }
      : highSeverityCount >= 2
        ? { label: 'Active', tone: 'var(--color-medium)', Icon: Activity }
        : { label: 'Steady', tone: 'var(--color-low)', Icon: Minus }
  const { label, tone, Icon } = level





  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5"
      style={{ borderColor: tone, backgroundColor: 'rgba(255,255,255,0.02)' }}
    >
      <Icon size={16} strokeWidth={2} style={{ color: tone }} />
      <span className="text-[14px] font-semibold text-white">{label}</span>
      <span className="text-[14px] font-medium text-white/70">
        {highSeverityCount} high-severity active
      </span>
    </motion.div>
  )
}
