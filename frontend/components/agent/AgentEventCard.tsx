"use client";

import { motion } from "framer-motion";
import type { AgentEvent } from "@/hooks/useAgentRun";







const TYPE_TINT: Record<AgentEvent["type"], string> = {
  ACT: "text-white",
  OBSERVE: "text-white/80",
  THINK: "text-white",
  CONCLUDE: "text-white",
  ERROR: "text-white",
};

const TYPE_PREFIX: Record<AgentEvent["type"], string> = {
  ACT: "▸ ACT",
  OBSERVE: "◂ OBS",
  THINK: "● THINK",
  CONCLUDE: "■ DONE",
  ERROR: "✕ ERR",
};









export function AgentEventCard({ event }: { event: AgentEvent }) {
  const { type, payload } = event;
  const cached = payload?.cached === true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 480, damping: 32 }}
      className="
        font-mono text-[13px] leading-relaxed
        border-l-2 border-white/15 pl-3
      "
    >
      <div className={`flex items-baseline gap-3 ${TYPE_TINT[type]}`}>
        <span className="font-semibold tracking-tight">
          {TYPE_PREFIX[type]}
        </span>
        {renderInline(event)}
        {cached && (
          <span className="ml-auto rounded-sm border border-white/20 px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-white/80">
            cached
          </span>
        )}
      </div>
      {renderDetail(event)}
    </motion.div>
  );
}









function renderInline(event: AgentEvent) {
  const { type, payload } = event;
  if (type === "ACT" && payload.tool) {
    return (
      <span className="text-white/90">
        {payload.tool as string}
        {payload.summary ? <span className="text-white/60"> — {payload.summary as string}</span> : null}
      </span>
    );
  }
  if (type === "OBSERVE" && payload.tool) {
    return (
      <span className="text-white/80">
        {payload.tool as string} → {payload.result_bytes ?? 0} bytes
        {typeof payload.latency_ms === "number" && (
          <span className="text-white/60"> ({payload.latency_ms}ms)</span>
        )}
      </span>
    );
  }
  if (type === "THINK") {
    const trace = payload.trace as { provider: string; model: string } | undefined;
    return (
      <span className="text-white">
        {trace ? (
          <>
            Routing to <b>{trace.model}</b> via {trace.provider.toUpperCase()}
          </>
        ) : (
          (payload.text as string) || (payload.node as string) || "thinking"
        )}
      </span>
    );
  }
  if (type === "CONCLUDE") {
    return (
      <span className="text-white">
        {(payload.node as string) || "graph"}: {(payload.summary as string) || "complete"}
      </span>
    );
  }
  if (type === "ERROR") {
    return (
      <span className="text-white">{(payload.text as string) || "error"}</span>
    );
  }
  return null;
}

function renderDetail(event: AgentEvent) {
  if (event.type === "ACT" && event.payload.args) {
    const args = JSON.stringify(event.payload.args, null, 0);
    if (args.length > 2) {
      return (
        <div className="mt-1 text-white/60 font-mono text-[12px] break-all">
          {args.length > 240 ? args.slice(0, 240) + "…" : args}
        </div>
      );
    }
  }
  return null;
}
