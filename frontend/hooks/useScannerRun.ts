"use client";

import { useEffect, useState } from "react";
import type { AgentEvent } from "./useAgentRun";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";










export type ScannerStatus = "idle" | "streaming" | "complete" | "errored";

export interface UseScannerRunResult {
  events: AgentEvent[];
  status: ScannerStatus;
  reportId: string | null;
}

function initialStatusFor(runId: string | null): ScannerStatus {
  if (!runId) return "idle";
  if (typeof window === "undefined") return "idle";
  if (!BASE) return "errored";
  return "streaming";
}

export function useScannerRun(runId: string | null): UseScannerRunResult {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [status, setStatus] = useState<ScannerStatus>(() => initialStatusFor(runId));
  const [reportId, setReportId] = useState<string | null>(null);
  const [trackedRunId, setTrackedRunId] = useState<string | null>(runId);

  if (runId !== trackedRunId) {
    setTrackedRunId(runId);
    setEvents([]);
    setReportId(null);
    setStatus(initialStatusFor(runId));
  }

  useEffect(() => {
    if (!runId) return;
    if (typeof window === "undefined") return;
    if (!BASE) return;

    let aborted = false;
    const es = new EventSource(
      `${BASE}/api/v1/events/stream?run_id=${encodeURIComponent(runId)}`
    );

    es.onmessage = (msg) => {
      if (aborted) return;
      try {
        const evt = JSON.parse(msg.data) as AgentEvent;
        setEvents((prev) => [...prev, evt]);

        if (evt.type === "CONCLUDE" && evt.payload?.kind === "scanner_complete") {
          const id = evt.payload.report_id;
          if (typeof id === "string" && id.length > 0) setReportId(id);
          setStatus("complete");
          es.close();
          return;
        }
        if (evt.type === "ERROR") {
          setStatus("errored");
          es.close();
        }
      } catch {
        // skip
      }
    };

    es.onerror = () => {
      if (aborted) return;
      setStatus((s) => (s === "complete" ? s : "errored"));
      es.close();
    };

    return () => { aborted = true; es.close(); };
  }, [runId]);

  return { events, status, reportId };
}
