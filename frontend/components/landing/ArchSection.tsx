"use client";

import { Reveal } from "./Reveal";

const STEPS = [
  {
    num: "01",
    headline: "Bright Data MCP scrapes every legislature in real time",
    desc: "Five MCP tools fire on every scraping cycle — Web Unlocker for bot-protected legislature sites, SERP API for news signals, Web Scraper API for lobbyist disclosures, and Scraping Browser for JS-rendered bill pages. Every call is cached 24h, traced in Langfuse, and visible in the MCP terminal.",
    tech: "Bright Data MCP · Web Unlocker · SERP API · Web Scraper API · Scraping Browser",
    accent: "#60a5fa",
  },
  {
    num: "02",
    headline: "AI/ML API reasons over every bill against the company profile",
    desc: "The Intelligence Gateway routes each task to the optimal model. Triage on gpt-4o-mini. Deep applicability on gpt-4.1. Agentic drafting on gpt-4o. Vision OCR on gpt-4o. Gemini 2.5 is always last in the fallback chain. Every call is metered and surfaced in the Model Router telemetry panel.",
    tech: "AI/ML API · gpt-4.1 · gpt-4o · gpt-4o-mini · Gemini 2.5 fallback · LangGraph",
    accent: "#c084fc",
  },
  {
    num: "03",
    headline: "The agent acts — PDF brief, law firms, lobbyist response",
    desc: "When a bill reaches CRITICAL, the Agentic Response Engine fires autonomously. It searches for law firms via SERP, scrapes their profiles via Web Unlocker, drafts a lobbyist response brief via LLM, and generates a board-ready PDF compliance brief via WeasyPrint — stored in Supabase Storage with a 24h signed URL.",
    tech: "LangGraph · WeasyPrint · Jinja2 · Supabase Storage · HMAC signing · FastAPI SSE",
    accent: "#34d399",
  },
];

export function ArchSection() {
  return (
    <section
      id="architecture"
      className="relative z-10 py-32"
      style={{ background: "#070707" }}
    >
      <div className="mx-auto max-w-[1100px] px-8">
        <Reveal>
          <p style={{ fontSize: "0.76rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(212,212,216,0.9)", marginBottom: 20 }}>
            Engineering
          </p>
        </Reveal>

        <Reveal delay={1}>
          <h2 style={{ fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, color: "#ffffff", fontSize: "clamp(2.4rem,5vw,4rem)", marginBottom: 20 }}>
            Built to{" "}
            <span style={{ color: "rgba(228,228,231,0.55)" }}>production standard</span>
          </h2>
        </Reveal>

        {/* Eng banner */}
        <Reveal delay={2}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 30,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(163,163,163,0.22)",
              borderRadius: 12,
              padding: "26px 28px",
              marginBottom: 40,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: "0.74rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(212,212,216,0.62)", marginBottom: 8 }}>
                Solo build · 6 days · Web Data UNLOCKED Hackathon 2026
              </div>
              <div style={{ fontSize: "clamp(1.6rem,2.8vw,2rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.12, color: "rgba(250,250,250,0.96)", marginBottom: 8 }}>
                Full-stack, from bill to boardroom.
              </div>
              <div style={{ fontSize: "0.86rem", lineHeight: 1.7, color: "rgba(212,212,216,0.8)" }}>
                One engineer. Live web scraping + multi-model AI reasoning + agentic response + PDF generation.
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
              {[
                { color: "#3178c6", label: "TypeScript · Next.js 16 + Tailwind v4" },
                { color: "#3572A5", label: "Python · FastAPI + LangGraph + WeasyPrint" },
                { color: "#22c55e", label: "Bright Data MCP · 5 tools live" },
                { color: "#60a5fa", label: "AI/ML API · 4 capability areas" },
              ].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: "0.8rem", color: "rgba(228,228,231,0.78)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* 3-step journey */}
        <Reveal delay={3}>
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(163,163,163,0.22)",
              borderRadius: 12,
              padding: 28,
            }}
          >
            <div style={{ fontSize: "0.76rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(212,212,216,0.7)", marginBottom: 22 }}>
              System architecture — data flow
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {STEPS.map((s, idx) => (
                <div key={s.num}>
                  {/* Step card */}
                  <div
                    style={{
                      display: "flex",
                      gap: 20,
                      padding: "20px 0",
                      borderLeft: `2px solid ${s.accent}`,
                      paddingLeft: 20,
                      borderRadius: 0,
                    }}
                  >
                    <div style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, color: "rgba(255,255,255,0.20)", lineHeight: 1, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                      {s.num}
                    </div>
                    <div>
                      <div style={{ fontSize: "1.06rem", fontWeight: 700, color: "rgba(250,250,250,0.96)", marginBottom: 8, lineHeight: 1.3 }}>
                        {s.headline}
                      </div>
                      <div style={{ fontSize: "0.84rem", lineHeight: 1.7, color: "rgba(212,212,216,0.82)", marginBottom: 10 }}>
                        {s.desc}
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "rgba(212,212,216,0.55)", fontWeight: 500 }}>
                        {s.tech}
                      </div>
                    </div>
                  </div>

                  {/* Connector */}
                  {idx < STEPS.length - 1 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "8px 0 8px 20px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <div style={{ width: 2, height: 12, background: "rgba(255,255,255,0.12)", borderRadius: 999 }} />
                        <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.82rem", lineHeight: 1 }}>↓</div>
                        <div style={{ width: 2, height: 12, background: "rgba(255,255,255,0.12)", borderRadius: 999 }} />
                      </div>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                          padding: "4px 12px",
                          borderRadius: 999,
                          border: idx === 0 ? "1px solid rgba(96,165,250,0.40)" : "1px solid rgba(192,132,252,0.40)",
                          background: idx === 0 ? "rgba(96,165,250,0.10)" : "rgba(192,132,252,0.10)",
                          color: idx === 0 ? "rgba(147,197,253,0.90)" : "rgba(216,180,254,0.90)",
                        }}
                      >
                        {idx === 0 ? "Bill record + embedding → PostgreSQL + pgvector" : "Action Package + PDF → Supabase Storage + SSE stream"}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
