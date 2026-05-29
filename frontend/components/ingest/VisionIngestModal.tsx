'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X, ScanLine } from 'lucide-react'
import { useState } from 'react'
import { VisionIngestDropzone } from './VisionIngestDropzone'










export function VisionIngestModal() {
  const [open, setOpen] = useState(false)




  return (
    <>
      {/* Trigger button — sits in the dashboard header */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--color-border-soft)] px-4 py-2 text-base font-semibold text-white/80 transition-all duration-200 hover:border-white/30 hover:bg-white/[0.04] hover:text-white"
      >
        <ScanLine size={17} strokeWidth={1.75} />
        Scan Bill
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-[300] bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              aria-hidden
            />

            {/* Panel */}
            <motion.div
              key="panel"
              className="fixed inset-x-4 bottom-0 top-16 z-[301] mx-auto max-w-4xl overflow-y-auto rounded-t-3xl border border-[var(--color-border-soft)] bg-[var(--color-ink-900)] p-8 shadow-2xl md:inset-x-auto md:left-1/2 md:right-auto md:w-full md:-translate-x-1/2 md:rounded-3xl"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-5 top-5 flex cursor-pointer items-center justify-center rounded-xl p-2 text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
                aria-label="Close"
              >
                <X size={22} strokeWidth={1.75} />
              </button>

              <VisionIngestDropzone onClose={() => setOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
