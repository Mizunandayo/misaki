"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ScannerForm } from "./ScannerForm";
import { ScannerProgressRail } from "./ScannerProgressRail";
import { ScannerReportCard } from "./ScannerReportCard";
import { ScannerShareTile } from "./ScannerShareTile";
import { useScannerRun } from "@/hooks/useScannerRun";
import {
  startScan,
  fetchReport,
  type ScannerReportRow,
} from "@/lib/api/scanner";









export function ScannerSection() {
  const [runId, setRunId] = useState<string | null>(null);
  const [reportIdFromCache, setReportIdFromCache] = useState<string | null>(null);
  const [report, setReport] = useState<ScannerReportRow | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { events, status, reportId } = useScannerRun(runId);
  const effectiveReportId = reportId ?? reportIdFromCache;

  useEffect(() => {
    if (!startedAt || status === "complete" || status === "errored") return;
    const t = setInterval(() => setElapsedMs(Date.now() - startedAt), 100);
    return () => clearInterval(t);
  }, [startedAt, status]);

  useEffect(() => {
    if (!effectiveReportId) return;
    let cancelled = false;
    fetchReport(effectiveReportId)
      .then((row) => { if (!cancelled) setReport(row); })
      .catch((e) => { if (!cancelled) setError(e?.message ?? "Report fetch failed"); });
    return () => { cancelled = true; };
  }, [effectiveReportId]);

  async function handleSubmit(name: string) {
    setError(null);
    setReport(null);
    setReportIdFromCache(null);
    setStartedAt(Date.now());
    setElapsedMs(0);
    try {
      const res = await startScan(name);
      if (res.cached && res.report_id) {
        setReportIdFromCache(res.report_id);
        setRunId(null);
      } else {
        setRunId(res.run_id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
      setStartedAt(null);
    }
  }

  const pending = status === "streaming" && !report;

  return (
    <section
      id="public-scanner"
      className="font-[Poppins] mx-auto max-w-6xl px-6 py-20 flex flex-col gap-10"
    >
      <header className="flex flex-col gap-3">
        <span className="text-[11px] uppercase tracking-widest text-white/80">
          Open the door
        </span>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
          Scan any public company in 25 seconds
        </h2>
        <p className="text-base text-white max-w-2xl leading-relaxed">
          Live SEC EDGAR Risk Factors, press signals, and federal lobbying disclosures —
          fused into a single regulatory exposure report by an AI/ML API multi-model pipeline.
        </p>
      </header>

      <motion.div
        layout
        className="
          rounded-lg border border-white/12 bg-[#050505]/95
          p-6 md:p-8 space-y-8
        "
      >
        <ScannerForm onSubmit={handleSubmit} pending={pending} />

        {(status === "streaming" || status === "complete") && (
          <ScannerProgressRail
            events={events}
            status={status}
            elapsedMs={elapsedMs}
          />
        )}

        {error && (
          <p className="text-base text-white">
            {error}
          </p>
        )}

        {report && (
          <div className="flex flex-col gap-5">
            <ScannerReportCard report={report} />
            <ScannerShareTile reportId={report.id} />
          </div>
        )}
      </motion.div>
    </section>
  );
}
