"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, RefreshCw, Sparkles } from "lucide-react";
import { useBriefGeneration } from "@/hooks/useBriefGeneration";
import { BriefPreviewCard } from "./BriefPreviewCard";
import { BriefProgressStrip } from "./BriefProgressStrip";

interface Props {
  billId: string;
  hasAssessment: boolean;
}

export function BriefGenerator({ billId, hasAssessment }: Props) {
  const { state, currentStep, completedSteps, result, errorMsg, generate, reset } =
    useBriefGeneration(billId);

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/18 bg-white/5">
          <FileText size={15} strokeWidth={1.75} className="text-white/65" />
        </div>
        <h2 className="text-[17px] font-semibold text-white">Compliance Brief</h2>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {/* ── IDLE ── */}
        {state === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.22 }}
          >
            <p className="mb-5 text-[15px] leading-relaxed text-white/60">
              Generate a board-ready PDF compliance brief — dollar exposure on the cover,
              gap analysis, and a prioritized action plan powered by AI/ML API.
            </p>

            <button
              type="button"
              onClick={generate}
              disabled={!hasAssessment}
              className={[
                "flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl px-5 py-3.5",
                "text-[15px] font-semibold transition-all duration-150 active:scale-[0.985]",
                hasAssessment
                  ? "bg-white text-[#050505] hover:bg-white/92"
                  : "cursor-not-allowed bg-white/8 text-white/30",
              ].join(" ")}
            >
              <Sparkles size={16} strokeWidth={2} />
              Generate Compliance Brief
            </button>

            {!hasAssessment && (
              <p className="mt-2.5 text-center text-[13px] text-white/35">
                Run AI analysis first to generate the brief
              </p>
            )}
          </motion.div>
        )}

        {/* ── RUNNING ── */}
        {state === "running" && (
          <motion.div
            key="running"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.22 }}
            className="rounded-2xl border border-white/10 bg-white/4 p-5"
          >
            <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
              Generating Brief
            </div>
            <BriefProgressStrip currentStep={currentStep} completedSteps={completedSteps} />
          </motion.div>
        )}

        {/* ── DONE ── */}
        {state === "done" && result && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <BriefPreviewCard result={result} />
            <button
              type="button"
              onClick={reset}
              className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/12 py-2.5 text-[13px] font-medium text-white/40 transition-all hover:border-white/25 hover:text-white/65"
            >
              <RefreshCw size={13} strokeWidth={2} />
              Regenerate
            </button>
          </motion.div>
        )}

        {/* ── ERROR ── */}
        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.22 }}
            className="rounded-2xl border border-red-500/25 bg-red-500/8 p-5"
          >
            <p className="text-[15px] font-semibold text-white">Generation failed</p>
            <p className="mt-1.5 text-[13px] text-white/55">{errorMsg}</p>
            <button
              type="button"
              onClick={generate}
              className="mt-4 cursor-pointer rounded-xl border border-white/18 px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:border-white/35"
            >
              Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
