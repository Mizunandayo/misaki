'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useDashboard } from '@/store/dashboard'




export function EmberPulseOverlay() {
  const pulse = useDashboard((s) => s.criticalPulse)
  const clearPulse = useDashboard((s) => s.clearPulse)
  const reduce = useReducedMotion()





  return (
    <AnimatePresence>
      {pulse.active && (
        <motion.div
          key={pulse.nonce}
          className="pointer-events-none fixed inset-0 z-[200]"
          initial={{ opacity: 0 }}
          animate={{ opacity: reduce ? 0.18 : [0, 0.42, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.2 : 1.6, ease: [0.16, 1, 0.3, 1] }}
          onAnimationComplete={() => clearPulse()}
          style={{
            background:
              'radial-gradient(120% 120% at 50% 0%, rgba(239,68,68,0.45) 0%, rgba(239,68,68,0.16) 35%, rgba(239,68,68,0) 70%)',
          }}
          aria-hidden
        />
      )}
    </AnimatePresence>
  )
}
