"use client";

import { motion } from "framer-motion";
import type { AgentEvent } from "@/hooks/useAgentRun";







const STEPS: Array<{ id: string; label: string }> = [
  { id: "sec_edgar",       label: "SEC EDGAR" },
  { id: "press_sweep",     label: "Press sweep" },
  { id: "lobbying_lookup", label: "OpenSecrets" },
  { id: "synthesize",      label: "Synthesis" },
];

export function ScannerProgressRail({
  events,
  status,
  elapsedMs,
}: {
  events: AgentEvent[];
  status: "idle" | "streaming" | "complete" | "errored";
  elapsedMs: number;
}) {
  const observed = new Set<string>();
  const acted = new Set<string>();

  for (const e of events) {
    const node = (e.payload?.node ?? e.payload?.kind) as string | undefined;
    if (!node) continue;
    if (e.type === "THINK") acted.add(node);
  }
  // Synthesis flips on first model_routing THINK event after ingest
  if (events.some((e) => e.payload?.kind === "model_routing" && e.payload?.task === "scanner_synthesis")) {
    acted.add("synthesize");
  }
  if (status === "complete") STEPS.forEach((s) => observed.add(s.id));
  // For each acted step, mark observed after the next ACT/OBSERVE for that node
  for (const e of events) {
    const node = e.payload?.node as string | undefined;
    if (node && e.type === "OBSERVE") observed.add(node);
  }
  if (status === "complete") observed.add("synthesize");

  return (
    <div className="font-[Poppins] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white tracking-tight">
          Bright Data MCP pipeline
        </span>
        <span className="text-sm text-white/80 tabular-nums">
          {(elapsedMs / 1000).toFixed(1)}s
        </span>
      </div>
      <ol className="grid grid-cols-4 gap-3">
        {STEPS.map((s) => {
          const done = observed.has(s.id);
          const live = acted.has(s.id) && !done;
          return (
            <li key={s.id} className="flex flex-col gap-2">
              <div className="
                relative h-1.5 rounded-full overflow-hidden
                bg-white/10
              ">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: done ? "100%" : live ? "60%" : "0%" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-white font-medium">{s.label}</span>
                <span className="text-[12px] text-white/80">
                  {done ? "done" : live ? "running" : "queued"}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
