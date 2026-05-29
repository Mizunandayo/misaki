"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, FileText, Sparkles } from "lucide-react";
import { api, type BillDetail } from "@/lib/api";
import { useAssessmentStream, type StreamEvent } from "@/lib/streaming";
import { safeExternalUrl } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { VerdictBadge } from "./VerdictBadge";
import { ConfidenceGauge } from "./ConfidenceGauge";
import { TriggeringClause } from "./TriggeringClause";
import { ExposureCard } from "./ExposureCard";
import { PrecedentMatch } from "./PrecedentMatch";
import { ReasoningChain } from "./ReasoningChain";
import { AgenticPanel } from "@/components/agent/AgenticPanel";

export function BillDetailView({ bill, autoAgent }: { bill: BillDetail; autoAgent: boolean }) {
  const [streaming, setStreaming] = useState(false);
  const url = streaming ? api.assessments.streamUrl(bill.id) : null;
  const { events, done, error } = useAssessmentStream(url);

  const verdictEvent = useMemo(
    () => events.find((e): e is Extract<StreamEvent, { type: "verdict" }> => e.type === "verdict"),
    [events],
  );
  const reasoning = useMemo(
    () => events.filter((e): e is Extract<StreamEvent, { type: "reasoning_step" }> => e.type === "reasoning_step"),
    [events],
  );
  const triageEvent = useMemo(
    () => events.find((e): e is Extract<StreamEvent, { type: "triage" }> => e.type === "triage"),
    [events],
  );
  const modelAttribution = useMemo(
    () =>
      events.find(
        (e): e is Extract<StreamEvent, { type: "model_attribution" }> =>
          e.type === "model_attribution",
      ) ?? null,
    [events],
  );

  // Live stream wins; fall back to the persisted assessment so the page is
  // useful before the user clicks "Analyze".
  const a = bill.assessment;
  const verdict = verdictEvent?.verdict ?? a?.verdict ?? null;
  const confidence = verdictEvent?.confidence ?? a?.confidence ?? 0;
  const exposureUsd = verdictEvent?.compliance_cost_estimate_usd ?? a?.compliance_cost_estimate ?? 0;
  const probability = verdictEvent?.probability ?? null;
  const precedents = verdictEvent?.precedents ?? a?.comparable_bills ?? [];
  const showInsights = Boolean(verdictEvent || a);

  // SECURITY: source_url is scraped — gate it through safeExternalUrl so a
  // "javascript:" / "data:" URL can never reach an href.
  const sourceUrl = safeExternalUrl(bill.source_url);

  return (
    <div className="min-h-screen bg-[var(--color-ink-950)]">
      <div className="nav-glass sticky top-0 z-30 border-b border-[var(--color-border-soft)]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-4">
          <Link
            href="/dashboard"
            className="group inline-flex cursor-pointer items-center gap-2 text-base font-semibold text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft size={18} strokeWidth={2} className="transition-transform group-hover:-translate-x-0.5" />
            Back to feed
          </Link>
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex cursor-pointer items-center gap-2 text-[15px] font-medium text-white/75 transition-colors hover:text-white"
            >
              <FileText size={16} strokeWidth={1.75} />
              Official source
              <ExternalLink size={14} strokeWidth={1.75} />
            </a>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-[1400px] px-6 py-10">
        <header className="mb-8">
          <div className="text-[15px] font-semibold uppercase tracking-wider text-white/70">
            {bill.jurisdiction} · {bill.bill_number}
          </div>
          {/* SECURITY: scraped title rendered as text — React auto-escapes.
              Never dangerouslySetInnerHTML anywhere on this page. */}
          <h1 className="text-balance mt-3 text-4xl font-bold leading-tight text-white lg:text-5xl">
            {bill.title}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {verdict && <VerdictBadge verdict={verdict} />}
            {!streaming && (
              <Button size="md" variant="primary" onClick={() => setStreaming(true)} disabled={!bill.full_text}>
                <Sparkles size={18} strokeWidth={2} />
                {a ? "Re-analyze with AI/ML router" : "Analyze with AI/ML router"}
              </Button>
            )}
            {streaming && !done && (
              <span className="inline-flex items-center gap-2 text-base font-medium text-white/80">
                <span className="size-2 animate-pulse rounded-full bg-white" />
                Streaming reasoning…
              </span>
            )}
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          {/* LEFT — analysis */}
          <section className="flex flex-col gap-8">
            <TriggeringClause
              billText={bill.full_text ?? ""}
              triggering={verdictEvent?.triggering_clause_text ?? a?.triggering_clause_text ?? null}
              location={verdictEvent?.triggering_clause_location ?? a?.triggering_clause_location ?? null}
            />
            <ReasoningChain steps={reasoning} live={streaming && !done} attribution={modelAttribution} />
          </section>

          {/* RIGHT — insights + agent (sticky) */}
          <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            {triageEvent && !verdictEvent && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-ink-900)]/60 p-5"
              >
                <div className="text-[15px] font-semibold uppercase tracking-wider text-white/70">Triage</div>
                <div className="mt-2 text-base text-white">
                  {triageEvent.passed ? "Passes — running deep analysis" : "Filtered out"}
                </div>
                <div className="mt-2 text-[15px] text-white/75">{triageEvent.reason}</div>
              </motion.div>
            )}

            {showInsights && (
              <>
                <ExposureCard verdict={verdict ?? "NOT_APPLICABLE"} confidence={confidence} exposureUsd={exposureUsd} probability={probability} />
                <ConfidenceGauge value={confidence} />
                {verdictEvent?.legal_precedent && (
                  <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-ink-900)]/60 p-5">
                    <div className="text-[15px] font-semibold uppercase tracking-wider text-white/70">Legal precedent</div>
                    <div className="mt-2 text-base leading-relaxed text-white">{verdictEvent.legal_precedent}</div>
                  </div>
                )}
                <PrecedentMatch precedents={precedents} />
              </>
            )}

            {error && (
              <div
                className="rounded-2xl border p-5 text-[15px] text-white"
                style={{ borderColor: "rgba(239, 68, 68, 0.5)" }}
              >
                {error}
              </div>
            )}

            <div className="h-px w-full bg-[var(--color-border-soft)]" />

            <div>
              <h2 className="mb-4 text-lg font-semibold text-white">Autonomous response</h2>
              {/* The sacred demo loop. autoAgent fires the run on arrival from
                  the dashboard ?agent=1 CTA. */}
              <AgenticPanel billId={bill.id} autoStart={autoAgent} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
