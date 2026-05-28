"use client";

import { motion } from "framer-motion";
import type { ActionPackagePayload } from "@/lib/api/agentic";

interface Props {
  payload: ActionPackagePayload;
}

const PLAY_LABEL: Record<string, string> = {
  PROACTIVE_PUBLIC_SUPPORT: "Proactive public support",
  PROACTIVE_QUIET_INVESTMENT: "Quiet internal investment",
  REACTIVE_WAIT_AND_SEE: "Reactive — wait and see",
  OPPOSE_AND_AMEND: "Oppose with amendment",
};




export function ActionPackageCard({ payload }: Props) {
  const { law_firms, lobbyist_brief, competitive_strategy, executive_summary } = payload;








  
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      className="
        font-[Poppins] text-white
        rounded-lg border border-white/15 bg-white/[0.02]
        p-6 space-y-6
      "
    >
      <header className="space-y-2">
        <p className="text-[11px] uppercase tracking-widest text-white/60">
          Action Package — autonomously assembled
        </p>
        <h3 className="text-xl font-semibold tracking-tight">
          Executive summary
        </h3>
        <p className="text-base text-white leading-relaxed">
          {executive_summary}
        </p>
      </header>

      <hr className="border-white/10" />

      <section className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-widest text-white/80">
          Law firm shortlist
        </h4>
        <ul className="grid gap-3 md:grid-cols-2">
          {law_firms.firms.map((f) => (
            <li
              key={f.name}
              className="
                rounded-md border border-white/12 bg-white/[0.03]
                p-4 hover:border-white/30 transition-colors
              "
            >
              <a
                href={f.website}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  group cursor-pointer
                  flex items-baseline justify-between gap-3
                "
              >
                <span className="text-base font-semibold text-white">
                  {f.name}
                </span>
                <span className="text-[11px] uppercase tracking-widest text-white/80">
                  fit {f.relevance_score}
                </span>
              </a>
              <p className="mt-1 text-sm text-white/80">{f.headline}</p>
              {f.practice_areas.length > 0 && (
                <p className="mt-2 text-[12px] text-white/60">
                  {f.practice_areas.join(" · ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <hr className="border-white/10" />

      <section className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-widest text-white/80">
          Lobbyist brief — {lobbyist_brief.addressed_to}
        </h4>
        <p className="text-base font-medium text-white">
          {lobbyist_brief.one_line_position}
        </p>
        <div className="space-y-4">
          {lobbyist_brief.sections.map((s) => (
            <div key={s.heading}>
              <p className="text-sm font-semibold text-white">{s.heading}</p>
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
                {s.body_markdown}
              </p>
            </div>
          ))}
        </div>
        <div className="
          mt-4 rounded-md border border-white/12 bg-white/[0.03] p-4
        ">
          <p className="text-[11px] uppercase tracking-widest text-white/60">
            Recommended amendment
          </p>
          <p className="mt-1 text-sm text-white whitespace-pre-line">
            {lobbyist_brief.recommended_amendment}
          </p>
        </div>
      </section>

      <hr className="border-white/10" />

      <section className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-widest text-white/80">
          Competitive response
        </h4>
        <p className="text-base text-white">
          <span className="font-semibold">
            {PLAY_LABEL[competitive_strategy.recommended_play] ?? competitive_strategy.recommended_play}
          </span>
          <span className="text-white/60"> · confidence {competitive_strategy.confidence}</span>
        </p>
        <p className="text-sm text-white leading-relaxed">
          {competitive_strategy.recommendation_summary}
        </p>
        <ul className="grid gap-2">
          {competitive_strategy.competitor_moves.map((m, i) => (
            <li key={`${m.competitor}-${i}`} className="text-sm text-white/80">
              <span className="text-white font-semibold">{m.competitor}</span>
              <span className="text-white/60"> · day {m.timing_relative_days}</span>
              <span> — {m.action}</span>
            </li>
          ))}
        </ul>
      </section>
    </motion.section>
  );
}
