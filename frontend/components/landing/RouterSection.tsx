"use client";

import { Reveal } from "./Reveal";

const CAPABILITIES = [
  {
    badge: "Reasoning",
    model: "gpt-4.1",
    color: "#60a5fa",
    gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
    use: "Applicability analysis · Pass probability · Compliance gaps",
    points: [
      "Full bill text + company profile injected into every reasoning call",
      "Triggering clause highlighted, dollar exposure estimated",
      "Comparable historical precedents surfaced from pgvector search",
    ],
  },
  {
    badge: "Automation",
    model: "gpt-4o",
    color: "#c084fc",
    gradient: "from-violet-500/20 via-indigo-500/10 to-transparent",
    use: "Agentic law firm discovery · Lobbyist brief drafting",
    points: [
      "Autonomous 4-step workflow via Bright Data MCP tool calls",
      "Law firms · lobbyist brief · competitive strategy · action package",
      "Every MCP call visible in the real-time terminal panel",
    ],
  },
  {
    badge: "Extraction",
    model: "gpt-4.1",
    color: "#34d399",
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    use: "SEC 10-K · OpenSecrets lobbying · SERP press sweep",
    points: [
      "Parallel Bright Data MCP calls: EDGAR + SERP + Web Scraper API",
      "Raw SEC excerpt shown alongside processed output — proof of source",
      "7-day cached reports, 24h HMAC-signed share links",
    ],
  },
];

const USE_CASES = [
  {
    tone: "text-blue-200 border-blue-300/35 bg-blue-400/16",
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M10 3v14M3 10h14" />
      </svg>
    ),
    title: "Compliance reasoning",
    desc: "AI/ML API reasons over every bill against the exact company profile — not generic industry analysis. Confidence score, cost estimate, and affected operations returned as structured output.",
  },
  {
    tone: "text-violet-200 border-violet-300/35 bg-violet-400/16",
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="10" cy="10" r="7" />
        <path d="M10 7v3l2 2" />
      </svg>
    ),
    title: "Agentic web actions",
    desc: "The agent navigates the live web via Bright Data MCP. Think → Act → Observe streams in real time. Every tool call is visible in the MCP terminal — not a black box.",
  },
  {
    tone: "text-emerald-200 border-emerald-300/35 bg-emerald-400/16",
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <rect x="3" y="3" width="14" height="14" rx="2" />
        <path d="M7 10h6M7 13h4" />
      </svg>
    ),
    title: "Live document extraction",
    desc: "SEC 10-K risk factors, OpenSecrets lobbying disclosures, and press signals scraped live via Bright Data and fed into structured synthesis — zero synthetic data.",
  },
  {
    tone: "text-amber-200 border-amber-300/35 bg-amber-400/16",
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <rect x="4" y="2" width="12" height="16" rx="2" />
        <path d="M8 6h4M8 10h4M8 14h2" />
      </svg>
    ),
    title: "Vision OCR ingestion",
    desc: "Drop a scanned bill image. AI/ML vision model extracts the text, detects the title and jurisdiction, and routes into the standard analysis pipeline in under 15 seconds.",
  },
];

const FALLBACK_CHAIN = [
  { model: "gpt-4o",         cap: "VISION / AUTOMATION", active: true  },
  { model: "gpt-4.1",        cap: "DEEP REASONING",       active: false },
  { model: "gpt-4o-mini",    cap: "FAST / CHEAP",         active: false },
  { model: "gemini-2.5-pro", cap: "Fallback terminator",  active: false },
];

export function RouterSection() {
  return (
    <section
      id="aiml"
      className="relative z-10 overflow-hidden py-32"
      style={{ background: "#050505" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(96,165,250,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1100px] px-8">
        {/* Header */}
        <div className="mb-16 flex flex-col items-center gap-6">
          <Reveal>
            {/* AI/ML API — unified multi-model router mark (one API → many models) */}
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              style={{ display: "block", margin: "0 auto" }}
            >
              <defs>
                <linearGradient id="aimlGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <rect x="6" y="6" width="68" height="68" rx="18" fill="url(#aimlGrad)" />
              <g stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" opacity="0.9">
                <path d="M40 40 L24 24M40 40 L56 24M40 40 L24 56M40 40 L56 56" />
              </g>
              <g fill="#ffffff">
                <circle cx="40" cy="40" r="6.5" />
                <circle cx="24" cy="24" r="4" />
                <circle cx="56" cy="24" r="4" />
                <circle cx="24" cy="56" r="4" />
                <circle cx="56" cy="56" r="4" />
              </g>
            </svg>
          </Reveal>


          <Reveal delay={1}>
            <h2
              style={{ fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, color: "#ffffff", fontSize: "clamp(2.4rem,5vw,4rem)", textAlign: "center" }}
            >
              AI/ML API is the
              <br />
              <span style={{ color: "rgba(228,228,231,0.45)" }}>intelligence layer.</span>
            </h2>
          </Reveal>

          <Reveal delay={2}>
            <p style={{ fontSize: "1.03rem", lineHeight: 1.7, color: "rgba(255,255,255,0.82)", maxWidth: "38rem", textAlign: "center" }}>
              Every compliance reasoning call flows through one unified endpoint — the
              capability-routed Intelligence Gateway. Four capability areas. One port.
              Per-task telemetry visible in the Model Router panel.
            </p>
          </Reveal>
        </div>

        {/* 3 capability cards */}
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {CAPABILITIES.map((c, i) => (
            <Reveal key={c.badge} delay={i + 1}>
              <div className="glass-panel h-full overflow-hidden rounded-2xl transition-colors duration-300 hover:border-zinc-300/45">
                <div
                  className={`bg-gradient-to-br ${c.gradient} border-b p-4`}
                  style={{ borderColor: "rgba(100,100,112,0.35)" }}
                >
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(212,212,216,0.90)", marginBottom: 8 }}>
                    {c.badge}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                    <div style={{ fontSize: "1.04rem", fontWeight: 700, color: "#ffffff", fontFamily: "monospace" }}>
                      {c.model}
                    </div>
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: "0.86rem", fontWeight: 500, color: "rgba(255,255,255,0.85)", marginBottom: 16, lineHeight: 1.55 }}>
                    {c.use}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {c.points.map((p) => (
                      <div key={p} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.84rem", color: "rgba(255,255,255,0.82)", lineHeight: 1.55 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.color, flexShrink: 0, marginTop: 6 }} />
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* 4th card — fallback chain */}
        <Reveal delay={4}>
          <div className="glass-panel mb-8 overflow-hidden rounded-2xl transition-colors duration-300 hover:border-zinc-300/45">
            <div
              className="bg-gradient-to-br from-amber-500/15 via-zinc-400/10 to-transparent border-b p-4"
              style={{ borderColor: "rgba(100,100,112,0.35)" }}
            >
              <div style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(212,212,216,0.90)", marginBottom: 8 }}>
                Multimodal + Fallback
              </div>
              <div style={{ fontSize: "0.86rem", fontWeight: 500, color: "rgba(255,255,255,0.85)", lineHeight: 1.55 }}>
                Vision OCR · Gemini 2.5 always-last — zero downtime on any AI/ML provider failure
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: "0.76rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(212,212,216,0.75)", marginBottom: 12 }}>
                Capability routing order
              </div>
              {FALLBACK_CHAIN.map((f, idx) => (
                <div key={f.model}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: f.active ? "#4ade80" : "rgba(255,255,255,0.22)", flexShrink: 0 }} />
                    <span style={{ fontFamily: "monospace", fontSize: "0.84rem", fontWeight: 600, color: f.active ? "rgba(255,255,255,0.95)" : idx === 1 ? "rgba(228,228,231,0.85)" : "rgba(212,212,216,0.70)" }}>
                      {f.model}
                    </span>
                    <span style={{ fontSize: "0.74rem", fontWeight: 600, letterSpacing: "0.06em", color: f.active ? "rgba(74,222,128,0.90)" : "rgba(255,255,255,0.30)", marginLeft: 4 }}>
                      {f.cap}
                    </span>
                  </div>
                  {idx < FALLBACK_CHAIN.length - 1 && (
                    <div style={{ fontSize: "0.76rem", color: "rgba(212,212,216,0.50)", paddingLeft: 14, marginBottom: 6 }}>
                      ↓ on provider failure
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* 4 use-case cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {USE_CASES.map((u, i) => (
            <Reveal key={u.title} delay={(i % 2) + 1}>
              <div className="glass-panel flex items-start gap-4 rounded-2xl p-5 transition-colors duration-300 hover:border-zinc-300/45">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${u.tone}`}>
                  {u.icon}
                </div>
                <div>
                  <div style={{ fontSize: "0.96rem", fontWeight: 700, color: "rgba(250,250,250,1)", marginBottom: 4 }}>{u.title}</div>
                  <div style={{ fontSize: "0.84rem", lineHeight: 1.65, color: "rgba(255,255,255,0.82)" }}>{u.desc}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
