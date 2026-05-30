"use client";

import { Reveal } from "./Reveal";

// â”€â”€ Hero feature â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const HERO = {
  tone: { icon: "text-blue-200 border-blue-300/35 bg-blue-400/14", glow: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.28)" },
  icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4M6 8l3 3-3 3M12 14h4" />
    </svg>
  ),
  tag: "AUTOMATION",
  tagColor: "#60a5fa",
  title: "MCP Reasoning Terminal",
  desc: "Watch the agent navigate the live web in real time. ACT â†’ OBSERVE â†’ THINK â†’ CONCLUDE cards stream in monospace with a blinking cursor. Every Bright Data MCP tool call â€” SERP, Web Scraper, SEC EDGAR â€” is visible and auditable as it happens.",
  replaces: "Replaces: manual research, Westlaw keyword search, spreadsheet gap tracking",
  terminal: [
    { type: "act",      text: "bright_data.serp_api(query='TDPSA enforcement 2025')" },
    { type: "observe",  text: "Haynes & Boone identified â€” 3 enforcement actions Q1 2025" },
    { type: "think",    text: "Ranking by TDPSA case history Â· NovaTech data residency flag" },
    { type: "conclude", text: "HIGH exposure confirmed â€” 2 gaps require immediate remediation" },
  ],
};

// â”€â”€ Secondary features â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SECONDARY = [
  {
    tone: "text-emerald-200 border-emerald-300/35 bg-emerald-400/14",
    tagColor: "#34d399",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /><path d="M11 8v3l2 2" />
      </svg>
    ),
    title: "Public Company Scanner",
    tag: "EXTRACTION",
    desc: "Type any public company. Live SEC EDGAR + OpenSecrets + press sweep via Bright Data MCP. Regulatory exposure score, dollar estimate, and 24h share link in under 25 seconds.",
    replaces: "Replaces: Bloomberg Law, manual SEC EDGAR searches",
  },
  {
    tone: "text-violet-200 border-violet-300/35 bg-violet-400/14",
    tagColor: "#c084fc",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
    title: "PDF Compliance Brief",
    tag: "AI/ML API",
    desc: "One click. Dollar exposure on the cover page. AI/ML-generated executive summary, gap analysis, and action plan. WeasyPrint renders it board-ready in 9 seconds.",
    replaces: "Replaces: 3-day GC research cycle, $800/hr outside counsel drafting",
  },
];

// â”€â”€ Supporting features â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SUPPORTING = [
  {
    tone: "text-amber-200 border-amber-300/35 bg-amber-400/14",
    tagColor: "#fbbf24",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
      </svg>
    ),
    title: "Vision OCR Ingestion",
    tag: "MULTIMODAL",
    desc: "Drop a scanned bill image. AI/ML vision extracts text, detects jurisdiction and bill number, and routes into the full analysis pipeline in 15 seconds.",
  },
  {
    tone: "text-cyan-200 border-cyan-300/35 bg-cyan-400/14",
    tagColor: "#22d3ee",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20V10M18 20V4M6 20v-6" />
      </svg>
    ),
    title: "Model Router Panel",
    tag: "REASONING",
    desc: "Live telemetry over the model_calls table. Task â†’ model â†’ provider â†’ latency â†’ cost per call. AI/ML API routing made visible and auditable.",
  },
  {
    tone: "text-rose-200 border-rose-300/35 bg-rose-400/14",
    tagColor: "#f87171",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    title: "Compliance Self-Assessment",
    tag: "SECURITY",
    desc: "5 AI-generated questions specific to the bill and company profile. Readiness gauge animates live. Score, industry benchmark, and cost-to-close per gap.",
  },
];

const TYPE_COLORS: Record<string, string> = {
  act: "#fbbf24",
  observe: "#60a5fa",
  think: "#c084fc",
  conclude: "#4ade80",
};

export function FeaturesSection() {
  return (
    <section id="features" className="relative z-10 py-28" style={{ background: "#050505" }}>
      <div className="mx-auto max-w-[1100px] px-8">
        <Reveal>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(212,212,216,0.9)", marginBottom: 16 }}>
            Features
          </p>
        </Reveal>

        <Reveal delay={1}>
          <h2 style={{ fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.08, color: "#ffffff", fontSize: "clamp(2rem,4vw,3rem)", marginBottom: 10 }}>
            Rebuilt for compliance teams.
          </h2>
        </Reveal>

        <Reveal delay={2}>
          <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "rgba(255,255,255,0.65)", maxWidth: "38rem", marginBottom: 36 }}>
            Six capabilities â€” from live bill detection to boardroom brief â€” powered by Bright Data MCP and AI/ML API end-to-end.
          </p>
        </Reveal>

        {/* â”€â”€ Hero feature â”€â”€ */}
        <Reveal delay={1}>
          <div
            className="mb-4 overflow-hidden rounded-2xl"
            style={{
              border: `1px solid ${HERO.tone.border}`,
              background: "#0a0a0e",
              boxShadow: `0 0 60px 0 ${HERO.tone.glow}`,
            }}
          >
            <div className="flex flex-col gap-0 lg:flex-row">
              {/* Left: content */}
              <div style={{ padding: "32px 32px 32px", flex: "0 0 46%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${HERO.tone.icon}`}>
                    {HERO.icon}
                  </div>
                  <span
                    style={{
                      fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                      padding: "3px 9px", borderRadius: 999, border: `1px solid ${HERO.tone.border}`, color: HERO.tagColor,
                    }}
                  >
                    {HERO.tag}
                  </span>
                </div>
                <div style={{ fontSize: "clamp(1.25rem,2.4vw,1.6rem)", fontWeight: 800, color: "rgba(250,250,250,1)", lineHeight: 1.25, marginBottom: 14, letterSpacing: "-0.03em" }}>
                  {HERO.title}
                </div>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.75, color: "rgba(212,212,216,0.80)", marginBottom: 18 }}>
                  {HERO.desc}
                </p>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "rgba(161,161,170,0.55)", lineHeight: 1.6, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(163,163,163,0.14)" }}>
                  {HERO.replaces}
                </div>
              </div>

              {/* Right: terminal mockup */}
              <div
                style={{
                  flex: 1,
                  background: "#050508",
                  borderLeft: "1px solid rgba(163,163,163,0.14)",
                  padding: "28px 28px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  minHeight: 240,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(248,113,113,0.7)" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(251,191,36,0.7)" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(74,222,128,0.7)" }} />
                  <span style={{ marginLeft: 8, fontSize: "0.68rem", fontWeight: 600, color: "rgba(161,161,170,0.45)", letterSpacing: "0.06em" }}>
                    misaki Â· agentic terminal
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {HERO.terminal.map((line, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: "0.62rem",
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: TYPE_COLORS[line.type],
                          flexShrink: 0,
                          paddingTop: 1,
                          minWidth: 62,
                        }}
                      >
                        {line.type}
                      </span>
                      <span style={{ fontFamily: "monospace", fontSize: "0.76rem", color: "rgba(228,228,231,0.78)", lineHeight: 1.5 }}>
                        {line.text}
                      </span>
                    </div>
                  ))}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <span style={{ fontFamily: "monospace", fontSize: "0.76rem", color: "rgba(161,161,170,0.35)" }}>â–¸</span>
                    <span
                      style={{
                        display: "inline-block",
                        width: 8, height: 14,
                        background: "rgba(228,228,231,0.65)",
                        animation: "blink 1.1s step-end infinite",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* â”€â”€ Secondary: 2-col â”€â”€ */}
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {SECONDARY.map((f, i) => (
            <Reveal key={f.title} delay={i + 2}>
              <div className="glass-panel flex h-full flex-col rounded-2xl p-6 transition-colors duration-300 hover:border-zinc-300/45">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${f.tone}`}>
                    {f.icon}
                  </div>
                  <span
                    style={{
                      fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                      padding: "2px 8px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.14)", color: f.tagColor,
                    }}
                  >
                    {f.tag}
                  </span>
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "rgba(250,250,250,1)", marginBottom: 8, lineHeight: 1.3 }}>
                  {f.title}
                </div>
                <p style={{ fontSize: "0.82rem", lineHeight: 1.7, color: "rgba(212,212,216,0.80)", flex: 1, marginBottom: 14 }}>
                  {f.desc}
                </p>
                <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "rgba(161,161,170,0.50)", padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(163,163,163,0.12)" }}>
                  {f.replaces}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* â”€â”€ Supporting: 3-col â”€â”€ */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {SUPPORTING.map((f, i) => (
            <Reveal key={f.title} delay={i + 4}>
              <div className="glass-panel flex h-full flex-col rounded-2xl p-5 transition-colors duration-300 hover:border-zinc-300/45">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${f.tone}`}>
                    {f.icon}
                  </div>
                  <span
                    style={{
                      fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                      padding: "2px 7px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.12)", color: f.tagColor,
                    }}
                  >
                    {f.tag}
                  </span>
                </div>
                <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "rgba(250,250,250,1)", marginBottom: 7, lineHeight: 1.3 }}>
                  {f.title}
                </div>
                <p style={{ fontSize: "0.78rem", lineHeight: 1.7, color: "rgba(212,212,216,0.75)" }}>
                  {f.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Blinking cursor animation */}
      <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
    </section>
  );
}