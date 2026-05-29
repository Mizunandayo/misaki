"use client";

import { useEffect, useState } from "react";
import { ActivateAgentButton } from "./ActivateAgentButton";
import { AgentTerminal } from "./AgentTerminal";
import { ActionPackageCard } from "./ActionPackageCard";
import { useAgentRun } from "@/hooks/useAgentRun";
import { fetchPackageByRun, type ActionPackagePayload } from "@/lib/api/agentic";

export function AgenticPanel({ billId, autoStart }: { billId: string; autoStart?: boolean }) {
  const [runId, setRunId] = useState<string | null>(null);
  const { events, status, finalPackageId } = useAgentRun(runId);
  const [pkg, setPkg] = useState<ActionPackagePayload | null>(null);

  useEffect(() => {
    if (!finalPackageId || !runId) return;
    let cancelled = false;
    fetchPackageByRun(runId)
      .then((row) => { if (!cancelled) setPkg(row.payload); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [finalPackageId, runId]);

  return (
    <div className="flex flex-col gap-6">
      <ActivateAgentButton
        billId={billId}
        autoStart={autoStart}
        onRunStarted={(id) => { setRunId(id); setPkg(null); }}
        disabled={status === "streaming"}
      />
      <AgentTerminal events={events} status={status} />
      {pkg && <ActionPackageCard payload={pkg} />}
    </div>
  );
}
