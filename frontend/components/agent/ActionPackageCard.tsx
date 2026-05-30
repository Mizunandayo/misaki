"use client";

import { useState } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ActionPackagePayload } from "@/lib/api/agentic";

interface Props {
  payload: ActionPackagePayload;
}

const PLAY_LABEL: Record<string, string> = {
  PROACTIVE_PUBLIC_SUPPORT: "Proactive public support",
  PROACTIVE_QUIET_INVESTMENT: "Quiet internal investment",
  REACTIVE_WAIT_AND_SEE: "Reactive — wait and see",
  OPPOSE_AND_AMEND: "Oppose and amend",
};

const PLAY_COLOR: Record<string, string> = {
  PROACTIVE_PUBLIC_SUPPORT: "var(--color-low)",
  PROACTIVE_QUIET_INVESTMENT: "#60a5fa",
  REACTIVE_WAIT_AND_SEE: "#f59e0b",
  OPPOSE_AND_AMEND: "var(--color-critical)",
};

type Tab = "summary" | "firms" | "brief" | "strategy";

// ─── Icon primitives ─────────────────────────────────────────────────────────

function IconFile() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="9" width="18" height="12" rx="1" />
      <path d="M8 21V9" />
      <path d="M16 21V9" />
      <path d="M3 9l9-7 9 7" />
      <rect x="9" y="14" width="6" height="7" />
    </svg>
  );
}

function IconPen() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function IconTarget() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function IconPackage() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconExternalLink() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── Tab config ──────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; Icon: () => React.ReactElement }[] = [
  { id: "summary",  label: "Summary",    Icon: IconFile     },
  { id: "firms",    label: "Law Firms",  Icon: IconBuilding },
  { id: "brief",    label: "Brief",      Icon: IconPen      },
  { id: "strategy", label: "Strategy",   Icon: IconTarget   },
];

// ─── Tab content components ───────────────────────────────────────────────────

function SummaryTab({ summary }: { summary: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 px-8 py-7"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <IconFile />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/50">Executive Summary</p>
          <p className="text-sm font-semibold text-white">Autonomously assembled by Misaki</p>
        </div>
      </div>
      <p className="text-base leading-[1.85] text-white">{summary}</p>
    </motion.div>
  );
}

function FirmsTab({ firms }: { firms: ActionPackagePayload["law_firms"]["firms"] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4 px-8 py-7"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <IconBuilding />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/50">Law Firm Shortlist</p>
          <p className="text-sm font-semibold text-white">{firms.length} firm{firms.length !== 1 ? "s" : ""} identified</p>
        </div>
      </div>

      {firms.length === 0 ? (
        <div className="rounded-xl border border-white/10 px-6 py-10 text-center">
          <p className="text-base font-semibold text-white">No firms shortlisted</p>
          <p className="mt-2 text-sm text-white/60">The SERP returned no usable results for this jurisdiction. Try re-running the agent.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {firms.map((f) => (
            <li key={f.name} className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/25">
              <div className="flex items-start justify-between gap-3">
                <p className="text-base font-bold text-white leading-snug">{f.name}</p>
                <span className="shrink-0 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-bold text-white">
                  {f.relevance_score}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/80">{f.headline}</p>
              {f.practice_areas.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {f.practice_areas.map((a) => (
                    <span key={a} className="rounded-md border border-white/10 px-2 py-0.5 text-xs font-semibold text-white/70">{a}</span>
                  ))}
                </div>
              )}
              {f.website && (
                <a href={f.website} target="_blank" rel="noopener noreferrer nofollow"
                  className="mt-4 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-white/50 transition-colors hover:text-white">
                  Visit website <IconExternalLink />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

function BriefTab({ brief }: { brief: ActionPackagePayload["lobbyist_brief"] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 px-8 py-7"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <IconPen />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/50">Lobbyist Brief</p>
          <p className="text-sm font-semibold text-white">{brief.addressed_to}</p>
        </div>
      </div>

      <div className="rounded-xl border-l-2 border-white/60 bg-white/5 px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1.5">Position</p>
        <p className="text-base font-semibold text-white leading-snug">{brief.one_line_position}</p>
      </div>

      <div className="space-y-6">
        {brief.sections.map((s) => (
          <div key={s.heading} className="space-y-2">
            <p className="text-sm font-bold text-white">{s.heading}</p>
            <p className="text-sm leading-[1.85] text-white/80 whitespace-pre-line">{s.body_markdown}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/15 bg-white/[0.03] p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Recommended Amendment</p>
        <p className="text-sm leading-[1.85] text-white whitespace-pre-line">{brief.recommended_amendment}</p>
      </div>
    </motion.div>
  );
}

function StrategyTab({ strategy }: { strategy: ActionPackagePayload["competitive_strategy"] }) {
  const play = strategy.recommended_play;
  const color = PLAY_COLOR[play] ?? "white";
  const label = PLAY_LABEL[play] ?? play;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 px-8 py-7"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <IconTarget />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/50">Competitive Response</p>
          <p className="text-sm font-semibold text-white">Precedent: {strategy.precedent_bill}</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xl font-bold" style={{ color }}>{label}</p>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-white/50">Confidence</p>
            <p className="text-lg font-bold text-white">
              {strategy.confidence}<span className="text-sm font-normal text-white/40">/100</span>
            </p>
          </div>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${strategy.confidence}%` }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          />
        </div>
      </div>

      <p className="text-sm leading-[1.85] text-white">{strategy.recommendation_summary}</p>

      {strategy.competitor_moves.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-white/50">Competitor Moves</p>
          <ul className="space-y-2">
            {strategy.competitor_moves.map((m, i) => (
              <li key={`${m.competitor}-${i}`} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold text-white">{m.competitor}</p>
                  <span className="shrink-0 text-xs font-bold text-white/40">Day {m.timing_relative_days}</span>
                </div>
                <p className="mt-1 text-sm text-white/80">{m.action}</p>
                {m.public_url && (
                  <a href={m.public_url} target="_blank" rel="noopener noreferrer nofollow"
                    className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-white/40 transition-colors hover:text-white">
                    Source <IconExternalLink />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ActionPackageCard({ payload }: Props) {
  const { law_firms, lobbyist_brief, competitive_strategy, executive_summary } = payload;
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("summary");

  const play = competitive_strategy.recommended_play;
  const playColor = PLAY_COLOR[play] ?? "white";
  const playLabel = PLAY_LABEL[play] ?? play;

  return (
    <>
      {/* ── Trigger card ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="rounded-xl border border-white/15 bg-white/[0.03] overflow-hidden"
      >
        {/* Top accent */}
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.35) 0%, transparent 70%)" }} />

        <div className="p-5 space-y-4">
          {/* Header row */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5">
              <IconPackage />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-white/50">Action Package</p>
              <p className="text-base font-bold text-white leading-snug">Autonomously assembled</p>
            </div>
            <div className="ml-auto shrink-0 flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-white">
                <IconCheck />
              </span>
              <span className="text-xs font-bold text-white">4 steps</span>
            </div>
          </div>

          {/* Exec summary preview */}
          <p className="text-sm leading-[1.75] text-white line-clamp-3">{executive_summary}</p>

          {/* Mini stats */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white">
              <IconBuilding />
              {law_firms.firms.length} firm{law_firms.firms.length !== 1 ? "s" : ""}
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold"
              style={{ color: playColor }}
            >
              <IconTarget />
              {playLabel}
            </span>
          </div>

          {/* CTA button */}
          <button
            onClick={() => setOpen(true)}
            className="cursor-pointer w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-sm font-bold text-black transition-all duration-200 hover:bg-white/90 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <IconPackage />
            View Full Report
          </button>
        </div>
      </motion.div>

      {/* ── Modal ────────────────────────────────────────────── */}
      {/* NOTE: backdrop and panel are direct children of AnimatePresence (not wrapped     */}
      {/* in a fragment) so Framer Motion can track their keys and fully unmount on close. */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}
        {open && (
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto flex flex-col w-full max-w-3xl max-h-[88vh] rounded-2xl border border-white/15 bg-[var(--color-ink-950)] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
                {/* Modal header */}
                <div className="shrink-0 flex items-center gap-4 border-b border-white/10 px-6 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <IconPackage />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/50">Action Package</p>
                    <p className="text-base font-bold text-white">Autonomously Assembled Report</p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="cursor-pointer flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <IconClose />
                  </button>
                </div>

                {/* Tab bar */}
                <div className="shrink-0 flex border-b border-white/10 px-6">
                  {TABS.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={[
                        "cursor-pointer relative flex items-center gap-2 px-4 py-3.5 text-sm font-bold transition-colors duration-150",
                        activeTab === id ? "text-white" : "text-white/40 hover:text-white/70",
                      ].join(" ")}
                    >
                      <Icon />
                      {label}
                      {activeTab === id && (
                        <motion.div
                          layoutId="tab-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full"
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    {activeTab === "summary"  && <SummaryTab  key="summary"  summary={executive_summary} />}
                    {activeTab === "firms"    && <FirmsTab    key="firms"    firms={law_firms.firms} />}
                    {activeTab === "brief"    && <BriefTab    key="brief"    brief={lobbyist_brief} />}
                    {activeTab === "strategy" && <StrategyTab key="strategy" strategy={competitive_strategy} />}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
      </AnimatePresence>
    </>
  );
}
