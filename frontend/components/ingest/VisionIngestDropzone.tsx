'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, ScanLine, CheckCircle, AlertCircle, ArrowRight, FileImage } from 'lucide-react'
import { useVisionIngest } from '@/hooks/useVisionIngest'
import { ModelRouterBadge } from '@/components/intelligence/ModelRouterBadge'
import { cn } from '@/lib/utils'

const ACCEPTED = '.jpg,.jpeg,.png,.webp,.gif,.pdf'
const MAX_MB = 10




function ScanningOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
      <motion.div
        className="absolute inset-x-0 h-0.5 bg-white/60"
        style={{ boxShadow: '0 0 12px 4px rgba(255,255,255,0.25)' }}
        initial={{ top: '0%' }}
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 2.4, ease: 'linear', repeat: Infinity }}
        aria-hidden
      />
    </div>
  )
}




export function VisionIngestDropzone({ onClose }: { onClose?: () => void }) {
  const router = useRouter()
  const { status, text, billId, charCount, error, elapsedMs, upload, reset } = useVisionIngest()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (file.size > MAX_MB * 1024 * 1024) return
      const url = URL.createObjectURL(file)
      setPreview(url)
      upload(file)
    },
    [upload],
  )

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function openBill() {
    if (billId) router.push(`/bills/${billId}`)
    onClose?.()
  }

  function handleReset() {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    reset()
    if (inputRef.current) inputRef.current.value = ''
  }

  const idle = status === 'idle'
  const active = status === 'uploading' || status === 'extracting'
  const done = status === 'complete'
  const failed = status === 'error'

  return (
    <div className="flex flex-col gap-6 font-[Poppins]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/70">
            <ScanLine size={16} strokeWidth={1.75} />
            <span className="text-[14px] font-semibold uppercase tracking-widest">
              Vision OCR
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Scan Bill Image
          </h2>
          <p className="mt-0.5 text-base font-medium text-white/75">
            Drop a scanned bill and the AI/ML vision model extracts the text live.
          </p>
        </div>
        {active && (
          <ModelRouterBadge provider="aiml" model="gpt-4o" />
        )}
        {done && (
          <ModelRouterBadge provider="aiml" model="gpt-4o" />
        )}
      </div>

      {/* Dropzone (shown when idle/failed) */}
      <AnimatePresence mode="wait">
        {(idle || failed) && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'relative flex cursor-pointer flex-col items-center justify-center gap-4',
                'rounded-2xl border-2 border-dashed px-8 py-16',
                'transition-all duration-200',
                dragOver
                  ? 'border-white/60 bg-white/[0.06]'
                  : 'border-[var(--color-border-soft)] bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]',
              )}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--color-border-soft)] bg-white/[0.04]">
                <FileImage size={26} strokeWidth={1.5} className="text-white/80" />
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-white">
                  Drop a scanned bill here
                </div>
                <div className="mt-1 text-base font-medium text-white/70">
                  JPEG, PNG, WebP, or PDF — max {MAX_MB} MB
                </div>
              </div>
              <div className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-base font-semibold text-[var(--color-ink-950)] transition-transform hover:scale-[1.02] active:scale-95">
                <Upload size={18} strokeWidth={2} />
                Choose file
              </div>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED}
                className="hidden"
                onChange={handleInputChange}
                aria-label="Upload scanned bill image"
              />
            </div>
            {failed && error && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-start gap-2 rounded-xl border p-4"
                style={{ borderColor: 'rgba(239,68,68,0.45)' }}
              >
                <AlertCircle size={18} strokeWidth={1.75} className="mt-0.5 shrink-0" style={{ color: 'var(--color-critical)' }} />
                <span className="text-base font-medium text-white">{error}</span>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Active — image + live text */}
        {(active || done) && preview && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="grid gap-4 lg:grid-cols-2"
          >
            {/* Left — uploaded image */}
            <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border-soft)]">

              <img
                src={preview}
                alt="Uploaded bill scan"
                className="h-full max-h-[380px] w-full object-contain bg-[var(--color-ink-900)]"
              />
              {active && <ScanningOverlay />}
              {active && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--color-ink-950)]/90 to-transparent px-4 pb-3 pt-8">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                    </span>
                    <span className="text-[14px] font-semibold text-white">
                      Extracting via gpt-4o · {(elapsedMs / 1000).toFixed(1)}s
                    </span>
                  </div>
                </div>
              )}
              {done && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--color-ink-950)]/90 to-transparent px-4 pb-3 pt-8">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} strokeWidth={2} style={{ color: 'var(--color-low)' }} />
                    <span className="text-[14px] font-semibold text-white">
                      Extracted {charCount.toLocaleString()} chars in {(elapsedMs / 1000).toFixed(1)}s
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right — live text output */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold uppercase tracking-widest text-white/70">
                  Extracted text
                </span>
                {active && (
                  <span className="text-[14px] font-medium text-white/55">
                    {text.length.toLocaleString()} chars
                  </span>
                )}
              </div>
              <div className="relative h-[300px] overflow-y-auto rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-ink-900)]/60 p-4 lg:h-[340px]">
                {text ? (
                  <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-white/90">
                    {/* SECURITY: `text` is extracted OCR content from the LLM,
                        rendered as a <pre> text node — React auto-escapes, so
                        no injection risk even if the OCR output contains HTML. */}
                    {text}
                    {active && (
                      <motion.span
                        className="inline-block h-[1em] w-[2px] bg-white align-middle"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        aria-hidden
                      />
                    )}
                  </pre>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="flex items-center gap-2 text-base font-medium text-white/55">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                      >
                        <ScanLine size={18} strokeWidth={1.75} />
                      </motion.div>
                      Processing image…
                    </div>
                  </div>
                )}
              </div>

              {/* Complete actions */}
              <AnimatePresence>
                {done && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-wrap items-center gap-3"
                  >
                    <button
                      type="button"
                      onClick={openBill}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-base font-semibold text-[var(--color-ink-950)] transition-transform hover:scale-[1.02] active:scale-95"
                    >
                      Analyze this bill
                      <ArrowRight size={18} strokeWidth={2.25} />
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--color-border-soft)] px-5 py-2.5 text-base font-semibold text-white/80 transition-colors hover:border-white/30 hover:text-white"
                    >
                      Scan another
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
