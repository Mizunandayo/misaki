"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import type { BriefStep } from "@/lib/api/briefs";

const STEPS: { key: BriefStep; label: string; detail: string }[] = [
  { key: "assembling_context",   label: "Assembling context",     detail: "Bill text · assessment · company profile" },
  { key: "generating_analysis",  label: "AI/ML generating analysis", detail: "LONG_FORM_PROSE capability · AI/ML API" },
  { key: "rendering_document",   label: "Rendering document",     detail: "Jinja2 → HTML → WeasyPrint → PDF" },
  { key: "uploading",            label: "Finalizing PDF",         detail: "Supabase Storage · 24h signed URL" },
];

interface Props {
  currentStep: BriefStep | null;
  completedSteps: Set<BriefStep>;
}

export function BriefProgressStrip({ currentStep, completedSteps }: Props) {
  return (
    <div className="flex flex-col gap-0">
      {STEPS.map(({ key, label, detail }, idx) => {
        const isDone = completedSteps.has(key);
        const isActive = currentStep === key;
        const isPending = !isDone && !isActive;

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: idx * 0.07,
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex items-start gap-4 py-3"
          >
            {/* Connector line + icon column */}
            <div className="flex flex-col items-center" style={{ minWidth: "24px" }}>
              <div
                className={[
                  "flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all duration-400",
                  isDone
                    ? "border-white bg-white"
                    : isActive
                      ? "border-white/50 bg-white/10"
                      : "border-white/18 bg-transparent",
                ].join(" ")}
              >
                {isDone ? (
                  <Check size={12} strokeWidth={2.5} className="text-[#050505]" />
                ) : isActive ? (
                  <Loader2 size={11} strokeWidth={2} className="animate-spin text-white" />
                ) : (
                  <div className="size-1.5 rounded-full bg-white/25" />
                )}
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={[
                    "mt-1 w-px flex-1 transition-colors duration-500",
                    isDone ? "bg-white/30" : "bg-white/10",
                  ].join(" ")}
                  style={{ height: "20px" }}
                />
              )}
            </div>

            {/* Text column */}
            <div className="pb-1">
              <div
                className={[
                  "text-[15px] font-semibold leading-tight transition-colors duration-300",
                  isDone || isActive ? "text-white" : "text-white/35",
                ].join(" ")}
              >
                {label}
              </div>
              <div
                className={[
                  "mt-0.5 text-[13px] leading-snug transition-colors duration-300",
                  isDone
                    ? "text-white/45"
                    : isActive
                      ? "text-white/55"
                      : "text-white/20",
                ].join(" ")}
              >
                {detail}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
