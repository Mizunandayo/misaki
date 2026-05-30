"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import { AgentCreditMeter } from "./AgentCreditMeter";
import { AgentEventCard } from "./AgentEventCard";
import { AgentStepRail } from "./AgentStepRail";
import type { AgentEvent } from "@/hooks/useAgentRun";

interface Props {
  events: AgentEvent[];
  status: "idle" | "streaming" | "complete" | "errored";
}














export function AgentTerminal({ events, status }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [events.length]);

  const { calls, creditCents } = useMemo(() => {
    let c = 0;
    let cents = 0;
    for (const e of events) {
      if (e.type === "OBSERVE") {
        c += 1;
        if (e.payload.cached !== true) cents += 1; // matches APPROX_CREDIT_CENTS
      }
    }
    return { calls: c, creditCents: cents };
  }, [events]);







  
  return (
    <section className="
      flex flex-col gap-4
      rounded-lg border border-white/12 bg-[#050505]/95
      p-5 font-[Poppins] text-white
    ">
      <header className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" aria-hidden />
          <h2 className="text-base font-semibold tracking-tight">
            Agent Reasoning Terminal
          </h2>
        </div>
        <AgentCreditMeter calls={calls} creditCents={creditCents} />
      </header>

      <div className="min-w-0 overflow-x-auto">
        <AgentStepRail events={events} />
      </div>

      <motion.div
        layout
        ref={scrollRef}
        className="
          h-[420px] overflow-y-auto
          rounded-md border border-white/10
          bg-[#020202] p-4 space-y-2
          font-mono
        "
      >
        <AnimatePresence initial={false}>
          {events.map((e, i) => (
            <AgentEventCard key={`${e.occurred_at ?? "live"}-${i}`} event={e} />
          ))}
        </AnimatePresence>
        {status === "streaming" && (
          <motion.span
            className="inline-block ml-1 h-4 w-2 align-middle bg-white"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
            aria-hidden
          />
        )}
        {status === "idle" && (
          <p className="text-white/60 text-sm">
            Press Activate Agent to dispatch the Bright Data MCP workflow.
          </p>
        )}
      </motion.div>
    </section>
  );
}
