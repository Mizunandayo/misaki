"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

/* ── Star-field canvas ── */
function StarField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas || !ctx) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 240; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 1.1 + 0.15;
        const op = Math.random() * 0.55 + 0.08;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${op})`;
        ctx.fill();
      }
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

/* ── Perspective grid ── */
function PerspectiveGrid() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
        maskImage:
          "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 100%)",
      }}
    />
  );
}

const STATS = [
  { num: "200K+", lbl: "Bills monitored" },
  { num: "50+",   lbl: "Jurisdictions" },
  { num: "9s",    lbl: "PDF generation" },
  { num: "$0",    lbl: "Setup needed" },
];

/* Arrow icon for buttons */
function ArrowIcon({ dark = false }: { dark?: boolean }) {
  return (
    <span
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: dark ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
        <path
          d="M3 13L13 3M13 3H7M13 3v6"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden"
      style={{ minHeight: "100dvh", background: "#050505" }}
    >
      <StarField />
      <PerspectiveGrid />

      {/* Radial spotlight */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 65% 55% at 50% 42%, rgba(255,255,255,0.055) 0%, transparent 70%)",
        }}
      />

      {/* Main content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
          padding: "100px 32px 80px",
          textAlign: "center",
        }}
      >
        {/* Hackathon dateline — editorial transmission slug, no pill */}
        <div
          className="hero-enter"
          style={{
            animationDelay: "0.05s",
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#4ade80" }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  background: "#22c55e",
                  boxShadow: "0 0 9px rgba(34,197,94,0.85)",
                  animation: "pulseDot 2.2s ease-in-out infinite",
                }}
              />
              Live
            </span>
            <span style={{ color: "rgba(255,255,255,0.22)", letterSpacing: 0 }}>/</span>
            <span style={{ color: "rgba(245,245,245,0.95)", fontWeight: 600 }}>
              Web&nbsp;Data&nbsp;Unlocked
            </span>
            <span style={{ color: "rgba(255,255,255,0.22)", letterSpacing: 0 }}>/</span>
            <span style={{ color: "rgba(212,212,216,0.5)", fontWeight: 500 }}>
              May&nbsp;25–31&nbsp;2026
            </span>
          </div>
          <span
            style={{
              width: "100%",
              height: 1,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.24) 50%, transparent 100%)",
            }}
          />
        </div>

        {/* Wordmark */}
        <h1
          className="hero-enter"
          style={{
            animationDelay: "0.20s",
            fontWeight: 900,
            letterSpacing: "-0.035em",
            lineHeight: 0.9,
            color: "#ffffff",
            marginBottom: 18,
            fontSize: "clamp(4rem,11vw,8.4rem)",
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: "clamp(0.5rem,1.8vw,1.4rem)",
            flexWrap: "wrap",
          }}
        >
          <span style={{ color: "#f5f5f5", letterSpacing: "0.04em" }}>MISAKI</span>
          <span style={{ color: "rgba(113,113,122,0.95)", fontWeight: 800, letterSpacing: "-0.02em" }}>
            見先
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="hero-enter"
          style={{
            animationDelay: "0.30s",
            fontSize: "clamp(1rem,2.2vw,1.4rem)",
            fontWeight: 500,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "-0.01em",
            marginBottom: 14,
            lineHeight: 1.4,
          }}
        >
          Legislative Intelligence Platform
        </p>

        {/* One-liner */}
        <p
          className="hero-enter"
          style={{
            animationDelay: "0.38s",
            fontSize: "clamp(0.98rem,1.55vw,1.14rem)",
            fontWeight: 400,
            color: "rgba(212,212,216,0.8)",
            maxWidth: 560,
            lineHeight: 1.6,
            marginBottom: 44,
          }}
        >
          Catch the bill that costs you millions — weeks before your legal team does.
        </p>

        {/* CTA row */}
        <div
          className="hero-enter"
          style={{
            animationDelay: "0.46s",
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: 56,
          }}
        >
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "#ffffff",
              color: "#050505",
              fontSize: "0.88rem",
              fontWeight: 700,
              padding: "14px 28px",
              borderRadius: 999,
              textDecoration: "none",
              transition: "opacity 150ms cubic-bezier(0.16,1,0.3,1)",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.86")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          >
            Open Dashboard
            <ArrowIcon dark />
          </Link>
          <a
            href="https://github.com/Mizunandayo/misaki"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid rgba(255,255,255,0.18)",
              color: "rgba(255,255,255,0.72)",
              fontSize: "0.88rem",
              fontWeight: 500,
              padding: "14px 28px",
              borderRadius: 999,
              textDecoration: "none",
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(8px)",
              transition: "all 200ms cubic-bezier(0.16,1,0.3,1)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = "#fff";
              el.style.borderColor = "rgba(255,255,255,0.32)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = "rgba(255,255,255,0.72)";
              el.style.borderColor = "rgba(255,255,255,0.18)";
            }}
          >
            {/* GitHub icon */}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            View on GitHub
          </a>
        </div>

        {/* Stats bar */}
        <div
          className="hero-enter"
          style={{
            animationDelay: "0.54s",
            display: "grid",
            gridTemplateColumns: `repeat(${STATS.length}, 1fr)`,
            border: "1px solid rgba(163,163,163,0.25)",
            borderRadius: 16,
            overflow: "hidden",
            background: "rgba(39,39,42,0.45)",
            backdropFilter: "blur(12px)",
            width: "100%",
            maxWidth: 560,
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.num}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "18px 20px",
                borderLeft: i !== 0 ? "1px solid rgba(255,255,255,0.08)" : "none",
              }}
            >
              <span
                style={{
                  fontSize: "clamp(1.2rem,2.4vw,1.55rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.05em",
                  lineHeight: 1,
                  color: "#ffffff",
                  marginBottom: 4,
                }}
              >
                {s.num}
              </span>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  color: "rgba(212,212,216,0.78)",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
              >
                {s.lbl}
              </span>
            </div>
          ))}
        </div>

        {/* Hackathon metadata */}
        <div
          className="hero-enter"
          style={{
            animationDelay: "0.62s",
            marginTop: 32,
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {[
            { label: "Developer", value: "Francis Daniel — Mizu" },
            { label: "Track",     value: "Security & Compliance + AI/ML API" },
          ].map((m) => (
            <div
              key={m.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <span
                style={{
                  fontSize: "0.76rem",
                  fontWeight: 700,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "rgba(212,212,216,0.62)",
                }}
              >
                {m.label}
              </span>
              <span
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "rgba(228,228,231,0.88)",
                }}
              >
                {m.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating tech chips + dashboard screenshot strip */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 32px 80px",
        }}
      >
        {/* Floating chips */}
        <div
          className="chip-f1"
          style={{
            position: "absolute",
            top: 32,
            right: 16,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
            border: "1px solid rgba(163,163,163,0.24)",
            borderRadius: 12,
            padding: "8px 14px",
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "rgba(244,244,245,0.95)",
            background: "rgba(39,39,42,0.72)",
            backdropFilter: "blur(12px)",
          }}
        >
          <span
            style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }}
          />
          Bright Data MCP
        </div>

        <div
          className="chip-f2"
          style={{
            position: "absolute",
            top: 100,
            left: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
            border: "1px solid rgba(163,163,163,0.24)",
            borderRadius: 12,
            padding: "8px 14px",
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "rgba(244,244,245,0.95)",
            background: "rgba(39,39,42,0.72)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* AI/ML API star icon */}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#60a5fa">
            <path d="M12 2 L14.4 9.6 L22 12 L14.4 14.4 L12 22 L9.6 14.4 L2 12 L9.6 9.6 Z" />
          </svg>
          AI/ML API
        </div>

        <div
          className="chip-f3"
          style={{
            position: "absolute",
            bottom: 120,
            right: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
            border: "1px solid rgba(163,163,163,0.24)",
            borderRadius: 12,
            padding: "8px 14px",
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "rgba(244,244,245,0.95)",
            background: "rgba(39,39,42,0.72)",
            backdropFilter: "blur(12px)",
          }}
        >
          <span
            style={{ width: 6, height: 6, borderRadius: "50%", background: "#c084fc" }}
          />
          WeasyPrint PDF
        </div>

        {/* Dashboard screenshot placeholder */}
        <div
          style={{
            position: "relative",
            borderRadius: 20,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow:
              "0 0 80px rgba(255,255,255,0.04), 0 40px 100px rgba(0,0,0,0.6)",
            background: "rgba(10,10,10,0.8)",
            minHeight: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Terminal-style mock dashboard preview */}
          <div style={{ width: "100%", padding: "32px 28px", fontFamily: "monospace" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 24,
                paddingBottom: 16,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#ef4444",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#f59e0b",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#22c55e",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  marginLeft: 8,
                  fontSize: "0.78rem",
                  color: "rgba(255,255,255,0.30)",
                  fontFamily: "inherit",
                }}
              >
                misaki — threat feed
              </span>
            </div>
            {[
              { sev: "#ef4444", jur: "TX",  num: "SB 2847",  title: "Texas Consumer Data Protection Act Amendments",  score: 94 },
              { sev: "#f97316", jur: "CA",  num: "AB 1823",  title: "California AI Transparency and Disclosure Act",   score: 78 },
              { sev: "#f97316", jur: "EU",  num: "AIA-DA-04",title: "EU AI Act Delegated Act — High-Risk Classification", score: 71 },
              { sev: "#f59e0b", jur: "NY",  num: "A 8807",   title: "New York Automated Employment Decision Audit",    score: 55 },
              { sev: "#14b8a6", jur: "UK",  num: "HC-1142",  title: "UK Data Protection and Digital Information Bill",  score: 32 },
            ].map((b) => (
              <div
                key={b.num}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <span
                  style={{
                    width: 3,
                    height: 36,
                    borderRadius: 2,
                    background: b.sev,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.45)",
                    width: 28,
                    flexShrink: 0,
                  }}
                >
                  {b.jur}
                </span>
                <span
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.60)",
                    width: 72,
                    flexShrink: 0,
                  }}
                >
                  {b.num}
                </span>
                <span
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.85)",
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {b.title}
                </span>
                <span
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: b.sev,
                    width: 32,
                    textAlign: "right",
                    flexShrink: 0,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {b.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          paddingBottom: 24,
          opacity: 0.28,
        }}
      >
        <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.5)" }} />
        <span
          style={{
            fontSize: "0.78rem",
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(228,228,231,0.75)",
          }}
        >
          Scroll
        </span>
      </div>
    </section>
  );
}
