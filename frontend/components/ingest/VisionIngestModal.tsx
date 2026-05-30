'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ScanLine, X } from 'lucide-react'
import { VisionIngestDropzone } from './VisionIngestDropzone'

export function VisionIngestModal() {
  const [open, setOpen] = useState(false)
  // Portal target only exists on the client. This component is "use client"
  // so document is available after hydration; the render-time guard keeps SSR safe.
  const canPortal = typeof document !== 'undefined'

  return (
    <>
      {/* Trigger — sits in the dashboard header */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--color-border-soft)] px-4 py-2 text-base font-semibold text-white/80 transition-all duration-200 hover:border-white/30 hover:bg-white/[0.04] hover:text-white"
      >
        <ScanLine size={17} strokeWidth={1.75} />
        Scan Bill
      </button>

      {canPortal &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="vision-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-[300] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-6"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 12 }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative my-[6vh] w-full max-w-4xl rounded-3xl border border-[var(--color-border-soft)] bg-[var(--color-ink-900)] p-8 shadow-2xl"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="absolute right-5 top-5 flex cursor-pointer items-center justify-center rounded-xl p-2 text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    <X size={22} strokeWidth={1.75} />
                  </button>

                  <VisionIngestDropzone onClose={() => setOpen(false)} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}
