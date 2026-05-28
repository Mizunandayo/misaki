"use client";

import { useEffect, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export type AgentEventType = "ACT" | "OBSERVE" | "THINK" | "CONCLUDE" | "ERROR";

export interface AgentEventPayload {
  kind?: string;
  node?: string;
  tool?: string;
  text?: string;
  summary?: string;
  latency_ms?: number;
  result_bytes?: number;
  cached?: boolean;
  trace?: { provider: string; model: string };
  package_id?: string;
  args?: unknown;
  [key: string]: unknown;
}

export interface AgentEvent {
  type: AgentEventType;
  payload: AgentEventPayload;
  occurred_at?: string;
  phase?: "backfill" | "live";
}

export type AgentRunStatus = "idle" | "streaming" | "complete" | "errored";

export interface UseAgentRunResult {
  events: AgentEvent[];
  status: AgentRunStatus;
  finalPackageId: string | null;
}

function initialStatusFor(runId: string | null): AgentRunStatus {
  if (!runId) return "idle";
  if (typeof window === "undefined") return "idle";
  if (!BASE) return "errored";
  return "streaming";
}









export function useAgentRun(runId: string | null): UseAgentRunResult {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [status, setStatus] = useState<AgentRunStatus>(() => initialStatusFor(runId));
  const [finalPackageId, setFinalPackageId] = useState<string | null>(null);
  const [trackedRunId, setTrackedRunId] = useState<string | null>(runId);


  if (runId !== trackedRunId) {
    setTrackedRunId(runId);
    setEvents([]);
    setFinalPackageId(null);
    setStatus(initialStatusFor(runId));
  }








  useEffect(() => {
    if (!runId) return;
    if (typeof window === "undefined") return;
    if (!BASE) return; 
    let aborted = false;
    const url = `${BASE}/api/v1/events/stream?run_id=${encodeURIComponent(runId)}`;
    const es = new EventSource(url);

 
    es.onmessage = (msg) => {
      if (aborted) return;
      try {
        const evt = JSON.parse(msg.data) as AgentEvent;
        setEvents((prev) => [...prev, evt]);

        if (evt.type === "CONCLUDE" && evt.payload?.kind === "graph_complete") {
          const pkgId = evt.payload.package_id;
          setStatus("complete");
          if (typeof pkgId === "string" && pkgId.length > 0) {
            setFinalPackageId(pkgId);
          }
          es.close();
          return;
        }
        if (evt.type === "ERROR") {
          setStatus("errored");
          es.close();
        }
      } catch {
        // malformed payload — skip
      }
    };

    es.onerror = () => {
      if (aborted) return;
      setStatus((s) => (s === "complete" ? s : "errored"));
      es.close();
    };

    return () => {
      aborted = true;
      es.close();
    };
  }, [runId]);

  return { events, status, finalPackageId };
}
