'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { fadeUp, staggerContainer, staggerItem } from '@/lib/motion'

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Background subtle white glow — off-center */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 50% at 75% 30%, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 70%)',
        }}
      />

      <div className="mx-auto max-w-7xl px-6 pt-32 pb-24 lg:pt-44 lg:pb-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid lg:grid-cols-12 gap-12 items-center"
        >
          {/* Left — copy */}
          <div className="lg:col-span-7">
            <motion.div
              variants={staggerItem}
              className="inline-flex items-center gap-3 rounded-full border border-[var(--color-ink-600)] bg-[var(--color-ink-900)] px-4 py-2 mb-8"
            >
              <span className="size-2 rounded-full bg-[var(--color-ember-500)] animate-pulse" />
              <span className="text-sm font-medium text-[var(--color-paper-100)]">
                Web Data UNLOCKED Hackathon · May 2026
              </span>
            </motion.div>

            <motion.h1
              variants={staggerItem}
              className="text-balance font-bold text-5xl lg:text-6xl leading-[1.05] tracking-tight text-[var(--color-paper-50)]"
            >
              See the regulation{' '}
              <span className="text-[var(--color-ember-500)]">before</span>{' '}
              it becomes law.
            </motion.h1>

            <motion.p
              variants={staggerItem}
              className="mt-8 max-w-2xl text-xl leading-relaxed text-[var(--color-paper-200)]"
            >
              Misaki watches every legislature in the United States, the European
              Union, and the UK Parliament in real time. It tells you exactly
              what each bill means for your company — and then it drafts your
              response.
            </motion.p>

            <motion.div
              variants={staggerItem}
              className="mt-12 flex flex-wrap gap-4"
            >
              <Link href="/dashboard" prefetch>
                <Button size="lg" variant="primary">
                  Try the demo
                  <ArrowRightIcon />
                </Button>
              </Link>
              <Link href="#scanner">
                <Button size="lg" variant="secondary">
                  Scan a company
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="mt-14 flex items-center gap-8 text-sm text-[var(--color-paper-200)]"
            >
              <Stat label="Jurisdictions watched" value="52" />
              <Divider />
              <Stat label="Bills under analysis" value="2,847" />
              <Divider />
              <Stat label="Avg. alert latency" value="< 5 min" />
            </motion.div>
          </div>

          {/* Right — kanji + tagline */}
          <motion.div
            variants={fadeUp}
            className="lg:col-span-5 relative hidden lg:block"
          >
            <div className="relative aspect-square flex items-center justify-center">
              <div
                aria-hidden
                className="absolute inset-0 flex items-center justify-center select-none"
                style={{
                  fontSize: '22rem',
                  lineHeight: 1,
                  color: 'rgba(255,255,255,0.04)',
                  fontWeight: 700,
                }}
              >
                見先
              </div>
              <div className="relative text-center">
                <div className="text-[7rem] font-bold leading-none text-[var(--color-ember-500)]">
                  見先
                </div>
                <div className="mt-6 text-2xl font-semibold text-[var(--color-paper-50)]">
                  Misaki
                </div>
                <div className="mt-2 text-base text-[var(--color-paper-200)] tracking-wide">
                  Seeing Ahead
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-[var(--color-paper-50)]">
        {value}
      </div>
      <div className="mt-1 text-sm text-[var(--color-paper-200)]">{label}</div>
    </div>
  )
}

function Divider() {
  return <div className="h-10 w-px bg-[var(--color-ink-600)]" />
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-5"
      aria-hidden
    >
      <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
