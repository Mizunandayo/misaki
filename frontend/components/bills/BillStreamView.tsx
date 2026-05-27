'use client'

import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { api, type BillDetail } from '@/lib/api'
import { useAssessmentStream, type StreamEvent } from '@/lib/streaming'
import { Button } from '@/components/ui/Button'
import { VerdictBadge } from './VerdictBadge'
import { ConfidenceGauge } from './ConfidenceGauge'
import { TriggeringClause } from './TriggeringClause'
import { ExposureCard } from './ExposureCard'
import { PrecedentMatch } from './PrecedentMatch'
import { ReasoningChain } from './ReasoningChain'





export function BillStreamView({ bill }: { bill: BillDetail }) {
  const [streaming, setStreaming] = useState(false)
  const url = streaming ? api.assessments.streamUrl(bill.id) : null
  const { events, done, error } = useAssessmentStream(url)

  const verdictEvent = useMemo(
    () => events.find((e): e is Extract<StreamEvent, { type: 'verdict' }> => e.type === 'verdict'),
    [events],
  )
  const reasoning = useMemo(
    () =>
      events.filter(
        (e): e is Extract<StreamEvent, { type: 'reasoning_step' }> => e.type === 'reasoning_step',
      ),
    [events],
  )
  const triageEvent = useMemo(
    () => events.find((e): e is Extract<StreamEvent, { type: 'triage' }> => e.type === 'triage'),
    [events],
  )

  return (
    <main className="mx-auto max-w-7xl px-6 py-20">
      <header className="mb-10">
        <div className="text-sm font-semibold tracking-wider uppercase text-[var(--color-paper-200)]">
          {bill.jurisdiction} · {bill.bill_number}
        </div>
        <h1 className="mt-3 text-4xl lg:text-5xl font-bold leading-tight text-[var(--color-paper-50)]">
          {bill.title}
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {bill.assessment && <VerdictBadge verdict={bill.assessment.verdict} />}
          {!streaming && (
            <Button
              size="md"
              variant="primary"
              onClick={() => setStreaming(true)}
              disabled={!bill.full_text}
            >
              {bill.assessment ? 'Re-analyze with Gemini' : 'Analyze with Gemini'}
            </Button>
          )}
          {streaming && !done && (
            <span className="inline-flex items-center gap-2 text-sm text-[var(--color-paper-200)]">
              <span className="size-2 rounded-full bg-[var(--color-paper-50)] animate-pulse" />
              Streaming reasoning…
            </span>
          )}
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8">
        <section className="lg:col-span-7 space-y-8">
          <TriggeringClause
            billText={bill.full_text ?? ''}
            triggering={verdictEvent?.triggering_clause_text ?? bill.assessment?.triggering_clause_text ?? null}
            location={verdictEvent?.triggering_clause_location ?? bill.assessment?.triggering_clause_location ?? null}
          />
        </section>

        <aside className="lg:col-span-5 space-y-6">
          {triageEvent && !verdictEvent && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-[var(--color-border-medium)] bg-[var(--color-ink-900)] p-5"
            >
              <div className="text-sm font-semibold uppercase tracking-wider text-[var(--color-paper-200)]">
                Triage
              </div>
              <div className="mt-2 text-base text-[var(--color-paper-50)]">
                {triageEvent.passed ? 'Passes — running deep analysis' : 'Filtered out'}
              </div>
              <div className="mt-2 text-sm text-[var(--color-paper-200)]">
                {triageEvent.reason}
              </div>
            </motion.div>
          )}

          {verdictEvent && (
            <>
              <ExposureCard
                verdict={verdictEvent.verdict}
                confidence={verdictEvent.confidence}
                exposureUsd={verdictEvent.compliance_cost_estimate_usd}
                probability={verdictEvent.probability}
              />
              <ConfidenceGauge value={verdictEvent.confidence} />
              {verdictEvent.legal_precedent && (
                <div className="rounded-xl border border-[var(--color-border-medium)] bg-[var(--color-ink-900)] p-5">
                  <div className="text-sm font-semibold uppercase tracking-wider text-[var(--color-paper-200)]">
                    Legal precedent
                  </div>
                  <div className="mt-2 text-base text-[var(--color-paper-50)] leading-relaxed">
                    {verdictEvent.legal_precedent}
                  </div>
                </div>
              )}
              <PrecedentMatch precedents={verdictEvent.precedents} />
            </>
          )}

          {error && (
            <div className="rounded-xl border border-[color:var(--color-critical)]/50 bg-[var(--color-ink-900)] p-5 text-sm text-[var(--color-paper-100)]">
              {error}
            </div>
          )}
        </aside>
      </div>

      <section className="mt-16">
        <ReasoningChain steps={reasoning} live={streaming && !done} />
      </section>
    </main>
  )
}