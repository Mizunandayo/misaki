"use client";

import { Reveal } from "./Reveal";

// YouTube video ID for the Misaki demo (https://youtu.be/rVXMIxTKRq0)
const YOUTUBE_VIDEO_ID = "rVXMIxTKRq0";

const MOMENTS = [
  {
    n: "01",
    color: "#ef4444",
    title: "Danger before setup",
    desc: "CRITICAL severity bill visible in the first 3 seconds. Not a setup wizard — live compliance risk, immediately.",
  },
  {
    n: "02",
    color: "#60a5fa",
    title: "Live MCP reasoning",
    desc: "ACT → OBSERVE → THINK → CONCLUDE. The agent navigates the live web, citing real sources in real time.",
  },
  {
    n: "03",
    color: "#c084fc",
    title: "9-second board brief",
    desc: "Cover page: Estimated Exposure $340,000. Gap analysis. Action plan. What a GC spends 3 days producing.",
  },
  {
    n: "04",
    color: "#34d399",
    title: "Any company, live",
    desc: "Type any public company. SEC + OpenSecrets + press sweep. Regulatory exposure score in 20 seconds.",
  },
];

export function DemoSection() {
  return (
    <section
      id="demo"
      className="relative z-10 py-28"
      style={{ background: "#070707" }}
    >
      <div className="mx-auto max-w-[1100px] px-8">
        <Reveal>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(212,212,216,0.9)", marginBottom: 16 }}>
            Demo
          </p>
        </Reveal>

        <Reveal delay={1}>
          <h2 style={{ fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, color: "#ffffff", fontSize: "clamp(2rem,4vw,3rem)", marginBottom: 8 }}>
            Legislative intelligence{" "}
            <span style={{ color: "rgba(228,228,231,0.45)" }}>in under 3 minutes.</span>
          </h2>
        </Reveal>

        <Reveal delay={2}>
          <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "rgba(212,212,216,0.70)", maxWidth: "36rem", marginBottom: 32 }}>
            Watch Misaki detect a threat, activate the agentic pipeline, and produce a board-ready brief — live, from scratch.
          </p>
        </Reveal>

        {/* YouTube embed */}
        <Reveal delay={2}>
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                position: "relative",
                paddingBottom: "56.25%",
                height: 0,
                overflow: "hidden",
                borderRadius: 16,
                border: "1px solid rgba(163,163,163,0.22)",
                background: "#0a0a0e",
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1&color=white`}
                title="Misaki — Legislative Intelligence Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: 0,
                  borderRadius: 16,
                }}
              />
            </div>
          </div>
        </Reveal>

        {/* Moment chips */}
        <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {MOMENTS.map((m, i) => (
            <Reveal key={m.n} delay={i + 3}>
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "1px solid rgba(163,163,163,0.18)",
                  background: "rgba(255,255,255,0.025)",
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(1.6rem,3vw,2rem)",
                    fontWeight: 900,
                    lineHeight: 1,
                    color: m.color,
                    opacity: 0.3,
                    marginBottom: 10,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {m.n}
                </div>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "rgba(250,250,250,1)", marginBottom: 6, lineHeight: 1.3 }}>
                  {m.title}
                </div>
                <p style={{ fontSize: "0.73rem", lineHeight: 1.6, color: "rgba(212,212,216,0.72)" }}>
                  {m.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* CTA strip */}
        <Reveal delay={7}>
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(163,163,163,0.22)",
              borderRadius: 14,
              padding: "22px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "rgba(250,250,250,1)", marginBottom: 4 }}>
                Open the live dashboard
              </div>
              <div style={{ fontSize: "0.78rem", color: "rgba(212,212,216,0.65)", lineHeight: 1.6 }}>
                Pre-populated · NovaTech profile · 5 bills · agentic pipeline ready
              </div>
            </div>
            <a
              href="/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                background: "#ffffff",
                color: "#050505",
                fontSize: "0.86rem",
                fontWeight: 700,
                padding: "12px 24px",
                borderRadius: 999,
                textDecoration: "none",
                flexShrink: 0,
                transition: "opacity 150ms",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.86")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            >
              Open Dashboard
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(0,0,0,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="8" height="8" viewBox="0 0 16 16" fill="none">
                  <path d="M3 13L13 3M13 3H7M13 3v6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
