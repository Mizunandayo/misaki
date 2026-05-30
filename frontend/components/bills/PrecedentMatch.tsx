"use client";

import { motion } from 'framer-motion';

type Precedent = {
  id: string
  jurisdiction: string
  bill_number: string
  title: string
  similarity: number
}

function similarityColor(s: number): string {
  if (s >= 0.75) return "var(--color-low)";
  if (s >= 0.60) return "#f59e0b";
  return "var(--color-medium)";
}

export function PrecedentMatch({ precedents }: { precedents: Precedent[] }) {
  if (precedents.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-2xl border border-[var(--color-border-medium)] bg-[var(--color-ink-900)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--color-border-soft)] px-6 py-4">
        <div className="flex items-center gap-2.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="text-sm font-semibold uppercase tracking-widest text-[var(--color-paper-200)]">
            Comparable Legislation
          </span>
        </div>
      </div>

      {/* Precedent rows */}
      <ul className="divide-y divide-[var(--color-border-soft)]">
        {precedents.map((p, i) => {
          const color = similarityColor(p.similarity);
          const pct = (p.similarity * 100).toFixed(0);
          return (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="px-6 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-1.5">
                    <span className="inline-flex rounded-md border border-[var(--color-border-medium)] bg-[var(--color-ink-800)] px-2.5 py-0.5 text-sm font-bold text-[var(--color-paper-100)]">
                      {p.jurisdiction} {p.bill_number}
                    </span>
                  </div>
                  <p className="text-base text-[var(--color-paper-100)] line-clamp-2">{p.title}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xl font-bold tabular-nums" style={{ color }}>
                    {pct}%
                  </div>
                  <div className="text-sm text-[var(--color-paper-200)]">similar</div>
                </div>
              </div>
              {/* Colored similarity bar */}
              <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${p.similarity * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.06 + 0.2, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  )
}
