"use client";

import { motion } from "framer-motion";
import { Check, Download, FileText, Share2 } from "lucide-react";
import { useState } from "react";
import type { BriefCompleteEvent } from "@/lib/api/briefs";






function formatExposure(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`;
  return `$${n.toLocaleString()}`;
}

const VERDICT_STYLES: Record<string, string> = {
  CRITICAL: "bg-red-500 text-white",
  HIGH:     "bg-orange-500 text-white",
  MEDIUM:   "bg-amber-500 text-[#050505]",
  LOW:      "bg-teal-500 text-white",
};

export function BriefPreviewCard({ result }: { result: BriefCompleteEvent }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result.signed_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* clipboard denied */ }
  }

  const verdictStyle = result.verdict ? (VERDICT_STYLES[result.verdict] ?? "bg-white/20 text-white") : null;
  const shortTitle = result.bill_title.length > 90
    ? result.bill_title.slice(0, 90) + "…"
    : result.bill_title;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-2xl border border-white/12 bg-[var(--color-ink-900)]/70"
    >
      {/* ── PDF Cover Simulation ── */}
      <div className="relative bg-[#050505] px-6 py-7">
        {/* Subtle grain texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "url('/noise.png')", backgroundSize: "200px" }}
        />

        {/* Top row */}
        <div className="relative mb-6 flex items-start justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Compliance Risk Brief
            </div>
            <div className="mt-1 text-[11px] text-white/25">
              {result.bill_jurisdiction} · {result.bill_number}
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-white/15 px-2.5 py-1.5">
            <FileText size={11} strokeWidth={1.75} className="text-white/40" />
            <span className="text-[10px] font-medium text-white/40">
              {result.pages}p PDF
            </span>
          </div>
        </div>

        {/* Bill title */}
        <div className="relative mb-5 text-[15px] font-semibold leading-snug text-white/90">
          {shortTitle}
        </div>

        {/* Verdict badge */}
        {verdictStyle && (
          <div className="relative mb-5">
            <span className={`inline-block rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${verdictStyle}`}>
              {result.verdict}
            </span>
          </div>
        )}

        {/* The money shot — dollar exposure */}
        <div className="relative">
          <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
            Estimated Compliance Exposure
          </div>
          <div className="text-[52px] font-black leading-none tracking-tight text-white">
            {formatExposure(result.exposure_usd)}
          </div>
          <div className="mt-2 text-[12px] text-white/35">
            {result.total_gaps} compliance gap{result.total_gaps !== 1 ? "s" : ""} · AI/ML API generated
          </div>
        </div>
      </div>

      {/* ── Action Row ── */}
      <div className="flex flex-col gap-2.5 px-6 py-5">
        <a
          href={result.signed_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-white px-5 py-3.5 text-[15px] font-semibold text-[#050505] transition-opacity hover:opacity-90 active:scale-[0.985]"
          style={{ transition: "opacity 0.15s, transform 0.1s" }}
        >
          <Download size={16} strokeWidth={2.25} />
          Download PDF
        </a>

        <button
          type="button"
          onClick={handleCopy}
          className="flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-white/18 px-5 py-3.5 text-[15px] font-medium text-white transition-all hover:border-white/35 hover:bg-white/5 active:scale-[0.985]"
          style={{ transition: "all 0.15s" }}
        >
          {copied ? (
            <>
              <Check size={16} strokeWidth={2.25} className="text-emerald-400" />
              <span className="text-emerald-400">Link copied</span>
            </>
          ) : (
            <>
              <Share2 size={16} strokeWidth={2} />
              Copy 24h share link
            </>
          )}
        </button>

        <p className="text-center text-[12px] text-white/30">
          Share link expires in 24 hours · no account required to view
        </p>
      </div>
    </motion.div>
  );
}
