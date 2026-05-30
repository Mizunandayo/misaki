"use client";

import { useCallback, useRef, useState } from "react";
import {
  streamBriefGeneration,
  type BriefCompleteEvent,
  type BriefErrorEvent,
  type BriefStep,
} from "@/lib/api/briefs";

export type BriefState = "idle" | "running" | "done" | "error";

// Steps in the order the backend emits them
const STEP_ORDER: BriefStep[] = [
  "assembling_context",
  "generating_analysis",
  "rendering_document",
  "uploading",
];

export function useBriefGeneration(billId: string) {
  const [state, setState] = useState<BriefState>("idle");
  const [currentStep, setCurrentStep] = useState<BriefStep | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<BriefStep>>(new Set());
  const [result, setResult] = useState<BriefCompleteEvent | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // React Compiler rule: startTime captured inside the async callback, not at render time
  const startTimeRef = useRef<number>(0);

  const generate = useCallback(async () => {
    // Reset
    startTimeRef.current = Date.now();
    setState("running");
    setCurrentStep("assembling_context");
    setCompletedSteps(new Set());
    setResult(null);
    setErrorMsg(null);

    const stream = streamBriefGeneration(billId);
    const reader = stream.getReader();

    try {
      while (true) {
        const { value: event, done } = await reader.read();
        if (done) break;

        if (event.step === "error") {
          setErrorMsg((event as BriefErrorEvent).message ?? "Generation failed");
          setState("error");
          return;
        }

        if (event.step === "complete") {
          setResult(event as BriefCompleteEvent);
          setCompletedSteps(new Set(STEP_ORDER));
          setCurrentStep("complete");
          setState("done");
          return;
        }

        // Mark the previous step as done when the next starts
        const idx = STEP_ORDER.indexOf(event.step as BriefStep);
        if (idx > 0) {
          const prevStep = STEP_ORDER[idx - 1];
          setCompletedSteps((prev) => new Set([...prev, prevStep]));
        }
        setCurrentStep(event.step as BriefStep);
      }
    } finally {
      reader.releaseLock();
    }
  }, [billId]);

  const reset = useCallback(() => {
    setState("idle");
    setCurrentStep(null);
    setCompletedSteps(new Set());
    setResult(null);
    setErrorMsg(null);
    startTimeRef.current = 0;
  }, []);

  return {
    state,
    currentStep,
    completedSteps,
    result,
    errorMsg,
    generate,
    reset,
  };
}
