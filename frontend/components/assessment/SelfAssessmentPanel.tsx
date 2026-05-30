"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ChevronRight, ClipboardList, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useSelfAssessment } from "@/hooks/useSelfAssessment";
import { ReadinessGauge } from "./ReadinessGauge";

interface Props { billId: string }




export function SelfAssessmentPanel({ billId }: Props) {
  const {
    phase,
    currentQuestion,
    currentIdx,
    totalQuestions,
    result,
    error,
    start,
    answerCurrent,
    reset,
  } = useSelfAssessment(billId);

  const [draftAnswer, setDraftAnswer] = useState("");

  function handleSubmit() {
    if (!draftAnswer.trim()) return;
    answerCurrent(draftAnswer.trim());
    setDraftAnswer("");
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/18 bg-white/5">
          <ClipboardList size={15} strokeWidth={1.75} className="text-white/65" />
        </div>
        <h2 className="text-[17px] font-semibold text-white">Readiness Self-Assessment</h2>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {/* IDLE */}
        {phase === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="mb-4 text-[15px] leading-relaxed text-white/60">
              Answer 5 targeted questions to get your compliance readiness score, peer
              benchmark, and a cost-to-close estimate — all AI/ML powered.
            </p>
            <button
              type="button"
              onClick={start}
              className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-white/20 px-5 py-3.5 text-[15px] font-medium text-white transition-all hover:border-white/35 hover:bg-white/5"
            >
              <ClipboardList size={16} strokeWidth={2} />
              Start Assessment
            </button>
          </motion.div>
        )}

        {/* LOADING QUESTIONS */}
        {phase === "loading_questions" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="py-6 text-center text-[15px] text-white/50">
            Generating assessment questions…
          </motion.div>
        )}

        {/* ANSWERING */}
        {phase === "answering" && currentQuestion && (
          <motion.div
            key={`q-${currentIdx}`}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Progress */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex-1 overflow-hidden rounded-full bg-white/10" style={{ height: "3px" }}>
                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
                />
              </div>
              <span className="shrink-0 text-[12px] text-white/40">
                {currentIdx + 1} / {totalQuestions}
              </span>
            </div>

            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
              {currentQuestion.category}
            </div>
            <p className="mb-4 text-[16px] font-medium leading-snug text-white">
              {currentQuestion.question}
            </p>
            {currentQuestion.hint && (
              <p className="mb-4 text-[13px] text-white/45">{currentQuestion.hint}</p>
            )}

            {/* Quick-answer chips */}
            <div className="mb-3 flex gap-2">
              {["Yes", "No", "Partially"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => answerCurrent(opt)}
                  className="cursor-pointer rounded-lg border border-white/20 px-4 py-2 text-[14px] font-medium text-white transition-all hover:border-white/45 hover:bg-white/8"
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Free text */}
            <div className="flex gap-2">
              <input
                type="text"
                value={draftAnswer}
                onChange={(e) => setDraftAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Or type your answer…"
                className="flex-1 rounded-xl border border-white/18 bg-white/5 px-4 py-2.5 text-[14px] text-white placeholder-white/30 outline-none focus:border-white/35"
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!draftAnswer.trim()}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/20 px-4 py-2.5 text-[14px] font-medium text-white transition-all hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-35"
              >
                Next
                <ChevronRight size={15} strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        )}

        {/* SCORING */}
        {phase === "scoring" && (
          <motion.div key="scoring" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="py-6 text-center text-[15px] text-white/50">
            Scoring your responses…
          </motion.div>
        )}

        {/* DONE */}
        {phase === "done" && result && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <ReadinessGauge
              score={result.score}
              industryAvg={result.industry_average}
              grade={result.grade}
            />

            {result.gaps_identified.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/45">
                  Gaps Identified
                </div>
                <ul className="space-y-1.5">
                  {result.gaps_identified.map((gap, i) => (
                    <li key={i} className="flex items-start gap-2 text-[14px] text-white/75">
                      <AlertCircle size={14} strokeWidth={2} className="mt-0.5 shrink-0 text-amber-400" />
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.cost_to_close > 0 && (
              <div className="mt-4 rounded-xl border border-white/12 bg-white/5 p-4 text-center">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
                  Cost to Close All Gaps
                </div>
                <div className="mt-1 text-[28px] font-black text-white">
                  ${result.cost_to_close.toLocaleString()}
                </div>
              </div>
            )}

            <p className="mt-4 text-[14px] leading-relaxed text-white/65">
              {result.recommendation}
            </p>

            <button
              type="button"
              onClick={reset}
              className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/12 py-2.5 text-[13px] font-medium text-white/40 transition-all hover:border-white/25 hover:text-white/65"
            >
              <RotateCcw size={13} strokeWidth={2} />
              Retake Assessment
            </button>
          </motion.div>
        )}

        {/* ERROR */}
        {phase === "error" && (
          <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="rounded-2xl border border-red-500/25 bg-red-500/8 p-5">
            <p className="text-[15px] font-semibold text-white">Assessment failed</p>
            <p className="mt-1.5 text-[13px] text-white/55">{error}</p>
            <button type="button" onClick={start}
              className="mt-3 cursor-pointer rounded-xl border border-white/18 px-4 py-2 text-[14px] text-white hover:border-white/35">
              Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
