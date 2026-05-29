"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { startAgenticRun } from "@/lib/api/agentic";





interface Props {
  billId: string;
  onRunStarted: (runId: string) => void;
  disabled?: boolean;
  /** When true (from the dashboard ?agent=1 CTA), fire the run once on mount. */
  autoStart?: boolean;
}

export function ActivateAgentButton({ billId, onRunStarted, disabled, autoStart }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoFired = useRef(false);

  async function handleClick() {
    if (pending || disabled) return;
    setPending(true);
    setError(null);
    try {
      const { run_id } = await startAgenticRun(billId);
      onRunStarted(run_id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Run failed");
    } finally {
      setPending(false);
    }
  }


  useEffect(() => {
    if (autoStart && !autoFired.current) {
      autoFired.current = true;
      void handleClick();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);











  
  return (
    <div className="flex flex-col gap-2 font-[Poppins]">
      <motion.button
        type="button"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        onClick={handleClick}
        disabled={pending || disabled}
        className="
          group inline-flex items-center justify-center gap-3
          h-12 px-6 cursor-pointer
          rounded-md border border-white/15
          bg-white text-[#050505] font-semibold tracking-tight
          shadow-[0_8px_30px_rgba(255,255,255,0.08)]
          hover:bg-white/95 hover:border-white/30
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        "
        aria-label="Activate autonomous compliance agent"
      >
        <BoltIcon className="h-4 w-4" />
        <span className="text-base">
          {pending ? "Dispatching agent…" : "Activate Agent"}
        </span>
        <ChevronIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </motion.button>
      {error && <span className="text-sm text-white/80">{error}</span>}
    </div>
  );
}

function BoltIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  );
}

function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
