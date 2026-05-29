'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, ArrowRight, Clock, Cpu, DollarSign, Layers } from 'lucide-react'
import { useModelSummary } from '@/hooks/useModelSummary'
import { ModelRouterBadge } from './ModelRouterBadge'
import type { RecentCall } from '@/lib/api'
import { staggerContainer, staggerItem } from '@/lib/motion'





const WINDOWS: { label: string; hours: number }[] = [
  { label: '24h', hours: 24 },
  { label: '7 days', hours: 168 },
  { label: '30 days', hours: 720 },
]

const STATUS_COLOR: Record<RecentCall['status'], string> = {
  ok: 'var(--color-sentinel-400)',
  retry: 'var(--color-medium)',
  fallback: 'var(--color-high)',
  error: 'var(--color-critical)',
}

function fmtCost(n: number): string {
  if (n <= 0) return '$0'
  if (n < 1) return `$${n.toFixed(4)}`
  if (n < 1000) return `$${n.toFixed(2)}`
  return `$${(n / 1000).toFixed(1)}K`
}

function fmtMs(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}s` : `${n}ms`
}

function prettify(raw: string): string {
  return raw
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-ink-900)]/50 p-5">
      <div className="flex items-center gap-2 text-white/70">
        {icon}
        <span className="text-[15px] font-medium">{label}</span>
      </div>
      <div className="num-mono mt-2 text-3xl font-bold text-white">{value}</div>
    </div>
  )
}









export function ModelRouterPanel() {
  const [windowHours, setWindowHours] = useState(168)
  const { data, error, loading } = useModelSummary(windowHours)

  const maxModelLatency = useMemo(
    () => Math.max(1, ...(data?.by_model.map((m) => m.avg_latency_ms) ?? [1])),
    [data],
  )

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-white/70">
              <Cpu size={18} strokeWidth={1.75} />
              <span className="text-[15px] font-semibold uppercase tracking-wider">
                Powered by AI/ML API
              </span>
            </div>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">
              Multi-Model Router
            </h1>
            <p className="mt-1 text-base font-medium text-white/75">
              Every cognitive task routed to the optimal model through one unified endpoint.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-sentinel-400)] opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-sentinel-400)]" />
            </span>
            <span className="text-[15px] font-medium text-white/75">Live · auto-refreshing</span>
          </div>
        </div>

        {/* Window chips */}
        <div className="flex items-center gap-2">
          {WINDOWS.map((w) => {
            const active = w.hours === windowHours
            return (
              <button
                key={w.hours}
                type="button"
                onClick={() => setWindowHours(w.hours)}
                className={
                  'cursor-pointer rounded-full px-4 py-1.5 text-[14px] font-semibold transition-all duration-200 ' +
                  (active
                    ? 'bg-white text-[var(--color-ink-950)]'
                    : 'border border-[var(--color-border-soft)] text-white/70 hover:border-white/30 hover:text-white')
                }
              >
                {w.label}
              </button>
            )
          })}
        </div>
      </header>

      {error && (
        <div
          className="rounded-2xl border p-5 text-[15px] text-white"
          style={{ borderColor: 'rgba(239,68,68,0.5)' }}
        >
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="rounded-2xl border border-[var(--color-border-soft)] p-10 text-center text-base font-medium text-white/70">
          Loading routing telemetry…
        </div>
      )}

      {data && (
        <>
          {/* Totals */}
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={<Activity size={18} strokeWidth={1.75} />} label="Total calls" value={data.totals.calls.toLocaleString()} />
            <StatCard icon={<Layers size={18} strokeWidth={1.75} />} label="Models used" value={String(data.totals.models)} />
            <StatCard icon={<Clock size={18} strokeWidth={1.75} />} label="Avg latency" value={fmtMs(data.totals.avg_latency_ms)} />
            <StatCard icon={<DollarSign size={18} strokeWidth={1.75} />} label="Est. spend" value={fmtCost(data.totals.est_cost_usd)} />
          </section>

          {/* Task → Model routing (the proof) */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">Task → model routing</h2>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-2.5"
            >
              {data.by_task.map((t) => (
                <motion.div
                  key={t.task}
                  variants={staggerItem}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-ink-900)]/40 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base font-semibold text-white">{prettify(t.task)}</span>
                    <ArrowRight size={16} strokeWidth={2} className="text-white/45" />
                    <ModelRouterBadge provider={t.provider} model={t.model} />
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="num-mono text-[15px] font-medium text-white/80">{t.calls} calls</span>
                    <span className="num-mono text-[15px] font-medium text-white/80">{fmtMs(t.avg_latency_ms)}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* Per-model cost / latency / reliability */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">Per-model performance</h2>
            <div className="flex flex-col gap-3">
              {data.by_model.map((m) => (
                <div
                  key={`${m.provider}-${m.model}`}
                  className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-ink-900)]/40 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <ModelRouterBadge provider={m.provider} model={m.model} />
                    <div className="flex items-center gap-5">
                      <span className="num-mono text-[15px] font-medium text-white/80">{m.calls} calls</span>
                      <span className="num-mono text-[15px] font-medium text-white/80">{fmtCost(m.est_cost_usd)}</span>
                      {m.fallbacks > 0 && (
                        <span className="text-[14px] font-semibold" style={{ color: 'var(--color-high)' }}>
                          {m.fallbacks} fallback
                        </span>
                      )}
                      {m.errors > 0 && (
                        <span className="text-[14px] font-semibold" style={{ color: 'var(--color-critical)' }}>
                          {m.errors} error
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-white"
                        initial={{ width: 0 }}
                        animate={{ width: `${(m.avg_latency_ms / maxModelLatency) * 100}%` }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <span className="num-mono w-16 text-right text-[14px] font-medium text-white/70">
                      {fmtMs(m.avg_latency_ms)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Capability routing + recent ticker */}
          <section className="grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-xl font-semibold text-white">Routing by capability</h2>
              <div className="flex flex-col gap-2.5">
                {data.by_capability.map((c) => (
                  <div
                    key={c.capability}
                    className="flex items-center justify-between rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-ink-900)]/40 px-4 py-3"
                  >
                    <span className="text-base font-semibold text-white">{prettify(c.capability)}</span>
                    <div className="flex items-center gap-4">
                      <span className="num-mono text-[15px] font-medium text-white/80">{c.calls} calls</span>
                      <span className="num-mono text-[15px] font-medium text-white/80">{fmtMs(c.avg_latency_ms)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-semibold text-white">Recent calls</h2>
              <ul className="flex flex-col gap-2">
                {data.recent.map((r, i) => (
                  <motion.li
                    key={`${r.occurred_at}-${i}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border-soft)] px-3.5 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: STATUS_COLOR[r.status] }} />
                      <span className="text-[15px] font-medium text-white">{prettify(r.task)}</span>
                      {r.cache_hit && <span className="text-[13px] font-semibold text-white/55">cached</span>}
                    </div>
                    <span className="num-mono text-[14px] font-medium text-white/70">
                      {r.model} · {fmtMs(r.latency_ms)}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
