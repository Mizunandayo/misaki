"use client";

import { useCallback, useState } from "react";





const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const DEMO_KEY = process.env.NEXT_PUBLIC_DEMO_API_KEY ?? "";






export interface Question {
  id: string;
  question: string;
  category: string;
  hint?: string;
}

export interface ReadinessResult {
  score: number;
  industry_average: number;
  grade: string;
  gaps_identified: string[];
  cost_to_close: number;
  recommendation: string;
  is_above_average: boolean;
}

type Phase = "idle" | "loading_questions" | "answering" | "scoring" | "done" | "error";

export function useSelfAssessment(billId: string) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ReadinessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    setPhase("loading_questions");
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/self-assessment/${billId}/start`, {
        method: "POST",
        headers: { "X-Demo-Key": DEMO_KEY },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSessionId(data.session_id);
      setQuestions(data.questions);
      setCurrentIdx(0);
      setAnswers({});
      setPhase("answering");
    } catch (e) {
      setError(String(e));
      setPhase("error");
    }
  }, [billId]);

  const answerCurrent = useCallback(
    async (answer: string) => {
      const q = questions[currentIdx];
      if (!q) return;
      const newAnswers = { ...answers, [q.id]: answer };
      setAnswers(newAnswers);

      if (currentIdx < questions.length - 1) {
        setCurrentIdx((i) => i + 1);
      } else {
        // All answered — submit for scoring
        setPhase("scoring");
        try {
          const payload = Object.entries(newAnswers).map(([qid, ans]) => ({
            question_id: qid,
            question: questions.find((q2) => q2.id === qid)?.question ?? "",
            answer: ans,
          }));
          const res = await fetch(`${API_BASE}/api/v1/self-assessment/${billId}/score`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Demo-Key": DEMO_KEY },
            body: JSON.stringify({ session_id: sessionId, answers: payload }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          setResult(await res.json());
          setPhase("done");
        } catch (e) {
          setError(String(e));
          setPhase("error");
        }
      }
    },
    [billId, questions, currentIdx, answers, sessionId],
  );

  const reset = useCallback(() => {
    setPhase("idle");
    setSessionId(null);
    setQuestions([]);
    setCurrentIdx(0);
    setAnswers({});
    setResult(null);
    setError(null);
  }, []);

  return {
    phase,
    questions,
    currentIdx,
    currentQuestion: questions[currentIdx] ?? null,
    totalQuestions: questions.length,
    result,
    error,
    start,
    answerCurrent,
    reset,
  };
}
