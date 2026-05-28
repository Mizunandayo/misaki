"use client";

import { motion } from "framer-motion";
import type { AgentEvent } from "@/hooks/useAgentRun";





const STEPS = [
  { id: "law_firm_discovery", label: "Law Firm Discovery" },
  { id: "lobbyist_brief",     label: "Lobbyist Brief" },
  { id: "competitive_strategy", label: "Competitive Strategy" },
  { id: "action_package",     label: "Action Package" },
];




export function AgentStepRail({ events }: { events: AgentEvent[] }) {
  const completed = new Set<string>();
  let active: string | null = null;

  for (const e of events) {
    const node = e.payload.node as string | undefined;
    if (!node) continue;
    if (e.type === "THINK" && e.payload.kind === "node_start") active = node;
    if (e.type === "CONCLUDE" && e.payload.kind === "node_complete") {
      completed.add(node);
      active = null;
    }
  }






  return (
    <ol className="flex gap-2 font-[Poppins]">
      {STEPS.map((s, i) => {
        const done = completed.has(s.id);
        const live = active === s.id;
        return (
          <li key={s.id} className="flex items-center gap-2">
            <motion.span
              animate={{
                opacity: done ? 1 : live ? [0.4, 1, 0.4] : 0.45,
                scale: live ? [1, 1.06, 1] : 1,
              }}
              transition={{
                duration: live ? 1.4 : 0.2,
                repeat: live ? Infinity : 0,
              }}
              className={`
                inline-flex h-6 min-w-6 px-2 items-center justify-center
                rounded-full border text-[11px] font-semibold
                ${done ? "border-white bg-white text-[#050505]"
                       : "border-white/25 text-white"}
              `}
            >
              {done ? "✓" : i + 1}
            </motion.span>
            <span className={`text-sm ${done ? "text-white" : "text-white/80"}`}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="mx-2 h-px w-8 bg-white/15" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
