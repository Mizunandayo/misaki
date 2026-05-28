"use client";

import { motion } from "framer-motion";

interface Props {
  calls: number;
  creditCents: number;
}





export function AgentCreditMeter({ calls, creditCents }: Props) {
  const dollars = (creditCents / 100).toFixed(2);
  return (
    <div className="
      flex items-center gap-4 font-[Poppins]
      border border-white/12 rounded-md px-4 py-2
      bg-white/[0.02]
    ">
      <Stat label="MCP calls" value={String(calls)} />
      <Divider />
      <Stat label="Estimated cost" value={`$${dollars}`} />
      <motion.div
        className="h-2 w-2 rounded-full bg-white"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        aria-hidden
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col leading-tight">
      <span className="text-[11px] uppercase tracking-widest text-white/60">{label}</span>
      <span className="text-base font-semibold text-white tabular-nums">{value}</span>
    </div>
  );
}

function Divider() {
  return <span className="h-6 w-px bg-white/12" aria-hidden />;
}
