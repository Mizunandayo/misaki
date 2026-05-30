"use client";

import { Reveal } from "./Reveal";

const PHASES = [
  {
    num: "1", phase: "Phase 1", when: "Now — Live",
    color: "#4ade80", border: "rgba(74,222,128,0.32)", bg: "rgba(74,222,128,0.07)", glow: "rgba(74,222,128,0.7)",
    done: true,
    title: "Core compliance intelligence platform",
    items: [
      "AI/ML API multi-model gateway — REASONING + AUTOMATION + EXTRACTION + MULTIMODAL",
      "Bright Data MCP integration — 5 tools, 24h cache, Langfuse traced",
      "Agentic Response Engine — law firm discovery + lobbyist brief + competitive strategy",
      "WeasyPrint PDF compliance brief — dollar exposure on cover, Supabase Storage",
      "Vision OCR bill ingestion — scanned image to full analysis in 15 seconds",
    ],
  },
  {
    num: "2", phase: "Phase 2", when: "6 months",
    color: "#60a5fa", border: "rgba(96,165,250,0.32)", bg: "rgba(96,165,250,0.07)", glow: "rgba(96,165,250,0.65)",
    done: false,
    title: "Auth + multi-tenant + Slack integration",
    items: [
      "Full Supabase Auth with JWT RS256, refresh tokens, Row Level Security",
      "Multi-tenant isolation — company profiles fully isolated per account",
      "Slack Block Kit alerts — CRITICAL bills delivered to #compliance-alerts",
      "Activate Agent button in Slack — full agentic pipeline triggered from Slack",
      "Portfolio Mode — law firms and VCs managing multiple company profiles",
    ],
  },
  {
    num: "3", phase: "Phase 3", when: "12 months",
    color: "#c084fc", border: "rgba(192,132,252,0.32)", bg: "rgba(192,132,252,0.07)", glow: "rgba(192,132,252,0.65)",
    done: false,
    title: "Real-time sessions + API + enterprise",
    items: [
      "Real-Time Legislative Session Monitor — Celery Beat escalates to 5-min scraping",
      "Ask Misaki — LangGraph ReAct conversational interface over the full bill corpus",
      "Named Competitor Watchlist — nightly Bright Data sweep per competitor",
      "Public REST API — compliance intelligence as a programmable endpoint",
      "White-label enterprise licensing + SSO + custom brief templates",
    ],
  },
];

const IMPACT = [
  {
    label: "Scalability", color: "#4ade80",
    title: "Serverless-ready architecture",
    body: "FastAPI on Railway scales horizontally. Supabase handles PostgreSQL + Realtime. Upstash Redis is per-request serverless. Frontend on Vercel edge.",
  },
  {
    label: "Impact", color: "#60a5fa",
    title: "Compliance action in 9 seconds",
    body: "Every detected bill produces a PDF brief, law firm shortlist, and competitive response strategy. The gap from bill introduction to actionable intelligence collapses from 3-6 weeks to under a minute.",
  },
  {
    label: "Moat", color: "#c084fc",
    title: "Bright Data AI Startup Program",
    body: "As a hackathon winner, Misaki qualifies for up to $20,000 in Bright Data MCP credits — reducing infrastructure cost to near zero for 12 months and making the competitive position structurally defensible.",
  },
];

export function RoadmapSection() {
  return (
    <section id="roadmap" className="relative z-10 overflow-hidden py-32" style={{ background: "#070707" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,255,255,0.025) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 mx-auto max-w-[1100px] px-8">
        <Reveal>
          <p style={{ fontSize: "0.76rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(212,212,216,0.9)", marginBottom: 20 }}>
            Future Prospects
          </p>
        </Reveal>
        <Reveal delay={1}>
          <h2 style={{ fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, color: "#ffffff", fontSize: "clamp(2.4rem,5vw,4rem)", marginBottom: 20 }}>
            Scalability & impact roadmap.
            <br />
            <span style={{ color: "rgba(228,228,231,0.45)" }}>From hackathon to platform.</span>
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p style={{ fontSize: "1.03rem", lineHeight: 1.7, color: "rgba(255,255,255,0.82)", maxWidth: "44rem", marginBottom: 56 }}>
            Misaki is live on day one. The architecture is already multi-tenant, the RLS policies are written,
            and the security module is ready to enable. Shipping the platform is a configuration change, not a rebuild.
          </p>
        </Reveal>

        {/* Timeline + phase cards */}
        <Reveal delay={3}>
          <div className="relative mb-6">
            {/* Phase nodes row */}
            <div className="relative mb-8 flex items-start justify-between">
              {/* Gradient connecting line */}
              <div
                className="absolute hidden md:block"
                style={{
                  top: 20, left: "calc(16.5% + 4px)", right: "calc(16.5% + 4px)",
                  height: 2,
                  background: "linear-gradient(90deg, #4ade80 0%, #60a5fa 50%, #c084fc 100%)",
                  zIndex: 1,
                }}
              />

              {PHASES.map((p) => (
                <div key={p.phase} className="flex flex-1 flex-col items-center gap-3">
                  <div
                    className="relative z-10 flex items-center justify-center rounded-full font-black"
                    style={{
                      width: 40, height: 40,
                      background: p.done ? p.color : "#111",
                      border: `2px solid ${p.color}`,
                      boxShadow: `0 0 22px ${p.glow}`,
                      color: p.done ? "#050505" : p.color,
                      fontSize: "1rem",
                    }}
                  >
                    {p.done ? (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#050505" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3.5 9l4 4 7-7" />
                      </svg>
                    ) : p.num}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.64rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: p.color }}>{p.phase}</div>
                    <div style={{ fontSize: "0.68rem", fontWeight: 500, color: "rgba(212,212,216,0.60)" }}>{p.when}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Phase cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {PHASES.map((p) => (
                <div
                  key={p.phase}
                  className="flex flex-col gap-4 rounded-2xl p-6"
                  style={{ border: `1px solid ${p.border}`, background: p.bg }}
                >
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "rgba(250,250,250,1)" }}>{p.title}</div>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {p.items.map((item, j) => (
                      <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0, marginTop: 3 }}>
                          <circle cx="6.5" cy="6.5" r="6" stroke={p.color} strokeWidth="1" strokeOpacity="0.5" />
                          <path d="M4 6.5 5.5 8 9 4.5" stroke={p.color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span style={{ fontSize: "0.78rem", lineHeight: 1.65, color: "rgba(212,212,216,0.78)" }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Impact summary */}
        <Reveal delay={4}>
          <div
            style={{
              borderRadius: 16,
              border: "1px solid rgba(100,100,112,0.35)",
              background: "rgba(10,10,14,0.5)",
              overflow: "hidden",
            }}
          >
            <div className="grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0" style={{ "--tw-divide-opacity": "0.3" } as React.CSSProperties}>
              {IMPACT.map((item) => (
                <div key={item.label} style={{ padding: 28 }}>
                  <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12, color: item.color }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: "0.96rem", fontWeight: 700, color: "rgba(250,250,250,1)", marginBottom: 8 }}>{item.title}</div>
                  <div style={{ fontSize: "0.84rem", lineHeight: 1.65, color: "rgba(212,212,216,0.75)" }}>{item.body}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
