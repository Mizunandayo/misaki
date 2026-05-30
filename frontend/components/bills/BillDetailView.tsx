"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ExternalLink, FileText, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { api, type BillDetail } from "@/lib/api";
import { useAssessmentStream, type StreamEvent } from "@/lib/streaming";
import { safeExternalUrl } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { VerdictBadge } from "./VerdictBadge";
import { TriggeringClause } from "./TriggeringClause";
import { PrecedentMatch } from "./PrecedentMatch";
import { ReasoningChain } from "./ReasoningChain";
import { AgenticPanel } from "@/components/agent/AgenticPanel";
import { BriefGenerator } from "@/components/briefs/BriefGenerator";
import { SelfAssessmentPanel } from "@/components/assessment/SelfAssessmentPanel";
import { useDashboard } from "@/store/dashboard";

// ─── Design tokens ─────────────────────────────────────────────────────────
const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "var(--color-critical)",
  HIGH:     "var(--color-high)",
  MEDIUM:   "var(--color-medium)",
  LOW:      "var(--color-low)",
};

function formatUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}









// ─── Main component ────────────────────────────────────────────────────────
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

  const upsertBill = useDashboard((s) => s.upsertBill);

  // Sync verdict back to the dashboard store so counts update immediately
  // when the user navigates back — no hard-refresh needed.
  // On mount: hydrate from existing assessment (catches previously-analyzed bills).
  useEffect(() => {
    if (!bill.assessment?.verdict) return;
    upsertBill({
      ...bill,
      verdict: bill.assessment.verdict,
      compliance_cost_estimate: bill.assessment.compliance_cost_estimate ?? undefined,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bill.id]);

  // On new live verdict: update the store in real-time.
  useEffect(() => {
    if (!verdictEvent) return;
    upsertBill({
      ...bill,
      verdict: verdictEvent.verdict,
      compliance_cost_estimate: verdictEvent.compliance_cost_estimate_usd ?? bill.assessment?.compliance_cost_estimate ?? undefined,
    });
  }, [verdictEvent, bill, upsertBill]);

  const a             = bill.assessment;
  const verdict       = verdictEvent?.verdict ?? a?.verdict ?? null;
  const confidence    = verdictEvent?.confidence ?? a?.confidence ?? 0;
  const exposureUsd   = verdictEvent?.compliance_cost_estimate_usd ?? a?.compliance_cost_estimate ?? 0;
  const probability   = verdictEvent?.probability ?? null;
  const precedents    = verdictEvent?.precedents ?? a?.comparable_bills ?? [];
  const showInsights  = Boolean(verdictEvent || a);
  const severityColor = verdict ? (SEVERITY_COLOR[verdict] ?? "white") : null;

  // SECURITY: source_url is scraped — gate through safeExternalUrl so
  // "javascript:" / "data:" URLs can never reach an href.
  const sourceUrl = safeExternalUrl(bill.source_url);

  return (
    <div className="min-h-screen bg-[var(--color-ink-950)]">

      {/* ── NAV (shrink-0, 56px) ─────────────────────────────────── */}
      <nav className="sticky top-0 z-30 border-b border-[var(--color-border-soft)] bg-[var(--color-ink-950)]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-6">
          <Link
            href="/dashboard"
            className="group inline-flex cursor-pointer items-center gap-2 text-base font-semibold text-[var(--color-paper-100)] transition-colors duration-200 hover:text-white"
          >
            <motion.span
              className="flex items-center"
              whileHover={{ x: -3 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <ArrowLeft size={17} strokeWidth={2} />
            </motion.span>
            Back to feed
          </Link>

          <div className="flex items-center gap-3">
            <span className="rounded-md border border-[var(--color-border-medium)] bg-[var(--color-ink-800)] px-3 py-1 text-sm font-semibold text-[var(--color-paper-100)]">
              {bill.jurisdiction} · {bill.bill_number}
            </span>
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-[var(--color-paper-200)] transition-colors duration-200 hover:text-white"
              >
                <FileText size={14} strokeWidth={1.75} />
                Official source
                <ExternalLink size={12} strokeWidth={1.75} />
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO BAR ────────────────────────────────────────────── */}
      <div className="relative shrink-0 overflow-hidden border-b border-[var(--color-border-soft)] px-6 py-5">
        {/* Severity radial glow */}
        {severityColor && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(ellipse at 0% 50%, ${severityColor}22 0%, transparent 65%)` }}
          />
        )}
        <div className="relative mx-auto flex max-w-[1600px] items-start justify-between gap-6">

          {/* Left: verdict badge + title + metric chips */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              {verdict && <VerdictBadge verdict={verdict} />}
              {/* SECURITY: scraped title — React auto-escapes, never dangerouslySetInnerHTML */}
              <h1 className="min-w-0 line-clamp-1 text-xl font-bold leading-tight text-white">
                {bill.title}
              </h1>
            </div>

            {/* Metric stat chips */}
            {showInsights && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="mt-3 flex flex-wrap gap-2"
              >
                {/* Exposure chip */}
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">Exposure</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: severityColor ?? "white" }}>
                    {formatUsd(exposureUsd)}
                  </span>
                </div>
                {/* Confidence chip */}
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">Confidence</span>
                  <span className="text-sm font-bold tabular-nums text-white">
                    {confidence}<span className="text-xs font-normal text-white/40">/100</span>
                  </span>
                </div>
                {/* Pass probability chip */}
                {probability && (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">Pass prob.</span>
                    <span className="flex items-center gap-1.5 text-sm font-bold tabular-nums text-white">
                      {probability.velocity_direction === "rising" ? (
                        <TrendingUp size={13} strokeWidth={2.2} className="text-[var(--color-low)]" />
                      ) : probability.velocity_direction === "falling" ? (
                        <TrendingDown size={13} strokeWidth={2.2} className="text-[var(--color-critical)]" />
                      ) : (
                        <Minus size={13} strokeWidth={2} className="text-white/40" />
                      )}
                      {probability.score}%
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Right: analyze CTA */}
          <div className="shrink-0">
            {!streaming && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => setStreaming(true)}
                disabled={!bill.full_text}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                {a ? "Re-analyze" : "Analyze with AI/ML"}
              </Button>
            )}
            {streaming && !done && (
              <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-ink-800)] px-3 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                <span className="text-sm font-medium text-white">Streaming</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="mx-auto w-full max-w-[1600px] grid lg:grid-cols-[minmax(0,1fr)_380px]">

        {/* LEFT — bill text + AI reasoning (scrolls with the page) */}
        <div className="flex flex-col gap-5 border-r border-[var(--color-border-soft)] px-6 py-5">
          <TriggeringClause
            billText={bill.full_text ?? ""}
            triggering={verdictEvent?.triggering_clause_text ?? a?.triggering_clause_text ?? null}
            location={verdictEvent?.triggering_clause_location ?? a?.triggering_clause_location ?? null}
          />
          <ReasoningChain steps={reasoning} live={streaming && !done} attribution={modelAttribution} />
        </div>

        {/* RIGHT — actions + insights (sticky so action items stay visible while left scrolls) */}
        <div className="sticky top-14 self-start max-h-[calc(100vh-3.5rem)] overflow-y-auto flex flex-col gap-4 px-5 py-5">

          {/* Triage notice */}
          <AnimatePresence>
            {triageEvent && !verdictEvent && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-xl border border-[var(--color-border-medium)] bg-[var(--color-ink-900)] px-4 py-3"
              >
                <p className="text-sm font-semibold text-white">
                  {triageEvent.passed ? "Triage passed — running deep analysis" : "Filtered out by triage"}
                </p>
                <p className="mt-0.5 text-sm text-[var(--color-paper-200)]">{triageEvent.reason}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legal precedent */}
          <AnimatePresence>
            {verdictEvent?.legal_precedent && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-xl border border-[var(--color-border-medium)] bg-[var(--color-ink-900)] px-4 py-3"
              >
                <div className="mb-2 flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-paper-200)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-paper-200)]">
                    Legal Precedent
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[var(--color-paper-100)]">{verdictEvent.legal_precedent}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <PrecedentMatch precedents={precedents} />

          {error && (
            <div className="rounded-xl border px-4 py-3" style={{ borderColor: "rgba(239,68,68,0.35)" }}>
              <span className="text-sm font-semibold text-[var(--color-critical)]">Analysis error</span>
              <p className="mt-0.5 text-sm text-[var(--color-paper-100)]">{error}</p>
            </div>
          )}

          <div className="h-px w-full shrink-0 bg-[var(--color-border-soft)]" />

          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--color-paper-200)]">
              Autonomous Response
            </h2>
            {/* The sacred demo loop. autoAgent fires the run on arrival from
                the dashboard ?agent=1 CTA. */}
            <AgenticPanel billId={bill.id} autoStart={autoAgent} />
          </div>

          <div className="h-px w-full shrink-0 bg-[var(--color-border-soft)]" />

          <BriefGenerator billId={bill.id} hasAssessment={Boolean(bill.assessment)} />

          <div className="h-px w-full shrink-0 bg-[var(--color-border-soft)]" />

          <SelfAssessmentPanel billId={bill.id} />
        </div>
      </div>
    </div>
  );
}
