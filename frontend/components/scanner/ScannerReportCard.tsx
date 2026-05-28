"use client";

import { motion } from "framer-motion";
import type { ScannerReportRow } from "@/lib/api/scanner";

const SEVERITY_RING: Record<string, string> = {
  CRITICAL: "border-white",
  HIGH:     "border-white/80",
  MEDIUM:   "border-white/55",
  LOW:      "border-white/35",
};

function fmtUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export function ScannerReportCard({ report }: { report: ScannerReportRow }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="
        font-[Poppins] text-white
        rounded-lg border border-white/15 bg-white/[0.02]
        p-6 space-y-6
      "
    >
      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-white/80">
            Regulatory Exposure Report
          </p>
          <h3 className="text-2xl font-semibold tracking-tight">
            {report.company_name_display}
          </h3>
        </div>
        <div className="flex items-center gap-6">
          <Stat label="Exposure score" value={String(report.exposure_score)} />
          <Stat
            label="Estimated band"
            value={`${fmtUsd(report.total_exposure_low_usd)} — ${fmtUsd(report.total_exposure_high_usd)}`}
          />
        </div>
      </header>

      <p className="text-base leading-relaxed text-white">
        {report.strategic_summary}
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-widest text-white/80">
            Top legislative threats
          </h4>
          <ul className="space-y-3">
            {report.top_threats.map((t, i) => (
              <li
                key={`${t.bill_or_program}-${i}`}
                className={`
                  rounded-md border ${SEVERITY_RING[t.urgency_label] ?? "border-white/30"}
                  bg-white/[0.03] p-4
                `}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-base font-semibold text-white">
                    {t.jurisdiction} · {t.bill_or_program}
                  </span>
                  <span className="text-[11px] uppercase tracking-widest text-white">
                    {t.urgency_label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-white">{t.title}</p>
                <p className="mt-2 text-sm text-white/80">{t.one_line_reason}</p>
                {t.source_url && (
                  <a
                    href={t.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      mt-2 inline-flex items-center gap-1
                      text-sm text-white cursor-pointer
                      hover:underline underline-offset-4
                    "
                  >
                    View source
                    <ChevronIcon className="h-3 w-3" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-widest text-white/80">
            Raw SEC excerpt
            <span className="ml-2 text-[11px] text-white">(proof of source)</span>
          </h4>
          <pre className="
            rounded-md border border-white/10 bg-[#020202]
            p-4 max-h-80 overflow-y-auto
            font-mono text-[13px] text-white
            whitespace-pre-wrap leading-relaxed
          ">
            {report.raw_sec_excerpt || "No Risk Factors paragraph available for this company."}
          </pre>
        </section>
      </div>
    </motion.section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col leading-tight">
      <span className="text-[11px] uppercase tracking-widest text-white/80">{label}</span>
      <span className="text-2xl font-semibold text-white tabular-nums">{value}</span>
    </div>
  );
}

function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
