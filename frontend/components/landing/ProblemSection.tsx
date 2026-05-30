"use client";

import { Reveal } from "./Reveal";

const STATS = [
  {
    n: "$3M+",
    label: "average emergency retrofit",
    sub: "What companies pay when they miss a bill's passage window — retroactive architecture changes, emergency legal retainers, regulatory fines.",
    color: "#f87171",
    glow: "rgba(248,113,113,0.15)",
  },
  {
    n: "3–6wk",
    label: "awareness lag",
    sub: "The gap between a bill's introduction and your legal team hearing about it. In fast-moving regulatory environments, that gap is a liability.",
    color: "#fb923c",
    glow: "rgba(251,146,60,0.15)",
  },
  {
    n: "200K+",
    label: "active bills right now",
    sub: "Across US state legislatures alone at any given moment. No human team covers this volume. No existing tool reasons over what it finds.",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.15)",
  },
];

const GAPS = [
  {
    icon: "01",
    title: "They alert. They don't reason.",
    body: "Quorum and LexisNexis tell you a bill changed status. They don't know what your company does, what states you operate in, or what the bill means for your revenue model.",
  },
  {
    icon: "02",
    title: "They search. They don't apply.",
    body: "You can query a legal database all day. It won't tell you that SB-2847 puts your data pipeline out of compliance in 139 days or estimate the $320K exposure.",
  },
  {
    icon: "03",
    title: "They track. They never act.",
    body: "No existing tool drafts your compliance memo, packages an action plan, or triggers remediation workflows. The human lag is baked in by design.",
  },
];

export function ProblemSection() {
  return (
    <section
      id="problem"
      className="relative z-10 overflow-hidden py-32"
      style={{ background: "#070707" }}
    >
      {/* Subtle red gradient bleed from top */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(248,113,113,0.35), transparent)",
        }}
      />

      <div className="mx-auto max-w-[1100px] px-8">

        {/* Label */}
        <Reveal>
          <p style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(248,113,113,0.9)",
            marginBottom: 20,
            textAlign: "center",
          }}>
            The Problem
          </p>
        </Reveal>

        {/* Hero statement */}
        <Reveal delay={1}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <h2 style={{
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "rgba(250,250,250,1)",
              fontSize: "clamp(1.7rem,4vw,3rem)",
              margin: "0 auto 0.6em",
              maxWidth: "36rem",
            }}>
              By the time your legal team hears about it,{" "}
              <span style={{ color: "rgba(248,113,113,0.95)" }}>
                the window to act has already closed.
              </span>
            </h2>
            <p style={{
              fontSize: "clamp(0.92rem,1.1vw,1.05rem)",
              color: "rgba(255,255,255,0.55)",
              maxWidth: "32rem",
              margin: "0 auto",
              lineHeight: 1.7,
            }}>
              200,000+ active bills. A 3–6 week awareness lag. Zero tools that
              reason over what they find with company-specific intelligence — and act on it.
            </p>
          </div>
        </Reveal>

        {/* Stat cards */}
        <Reveal delay={2}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3" style={{ margin: "48px 0" }}>
            {STATS.map((s) => (
              <div
                key={s.label}
                style={{
                  background: s.glow,
                  border: `1px solid ${s.color}22`,
                  borderRadius: 16,
                  padding: "28px 24px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Corner glow */}
                <div aria-hidden style={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${s.color}18 0%, transparent 70%)`,
                  pointerEvents: "none",
                }} />
                <div style={{
                  fontSize: "clamp(2.2rem,4.5vw,3.2rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.05em",
                  lineHeight: 1,
                  color: s.color,
                  marginBottom: 10,
                }}>
                  {s.n}
                </div>
                <div style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.9)",
                  marginBottom: 10,
                }}>
                  {s.label}
                </div>
                <div style={{
                  fontSize: "0.83rem",
                  lineHeight: 1.65,
                  color: "rgba(212,212,216,0.7)",
                }}>
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Divider */}
        <Reveal delay={3}>
          <div style={{
            borderTop: "1px solid rgba(100,100,112,0.3)",
            paddingTop: 48,
            marginBottom: 36,
          }}>
            <p style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(212,212,216,0.45)",
              marginBottom: 16,
            }}>
              Why existing tools fail
            </p>
            <p style={{
              fontSize: "clamp(1rem,1.6vw,1.2rem)",
              fontWeight: 700,
              color: "rgba(250,250,250,0.95)",
              maxWidth: "38rem",
              lineHeight: 1.4,
            }}>
              Quorum. LexisNexis. Google Alerts. They all see the same bills.
              None of them know what those bills mean for your company.
            </p>
          </div>
        </Reveal>

        {/* Gap grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {GAPS.map((g, i) => (
            <Reveal key={g.title} delay={i + 4}>
              <div style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                padding: "24px 22px",
              }}>
                <div style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  color: "rgba(248,113,113,0.7)",
                  marginBottom: 12,
                }}>
                  {g.icon}
                </div>
                <div style={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "rgba(250,250,250,1)",
                  marginBottom: 10,
                  lineHeight: 1.3,
                }}>
                  {g.title}
                </div>
                <div style={{
                  fontSize: "0.83rem",
                  lineHeight: 1.65,
                  color: "rgba(212,212,216,0.65)",
                }}>
                  {g.body}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
