"use client";

import { Reveal } from "./Reveal";

const STREAMS = [
  {
    n: "01",
    tag: "Self-Serve SaaS",
    title: "Team subscriptions",
    stat: "$499",
    statSub: "/ month · Pro tier",
    replaces: "vs. Quorum $40K / yr",
    accent: "#34d399",
    accentRgb: "52,211,153",
    body: "No sales call. Compliance teams self-activate in under 3 minutes. The viral public company scanner turns anonymous visitors into paying customers — without a single cold email.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    bullets: [
      "Starter $199/mo — 1 profile, 5 jurisdictions, 20 briefs/month",
      "Pro $499/mo — 3 profiles, 20 jurisdictions, unlimited briefs + agentic engine",
      "Team $999/mo — unlimited profiles, Portfolio Mode, team seats, SSO",
    ],
    roiLine: "85% cheaper than Quorum. 10× more actionable.",
  },
  {
    n: "02",
    tag: "Enterprise & Agencies",
    title: "White-label + portfolio tier",
    stat: "$2,499",
    statSub: "/ month · Enterprise",
    replaces: "vs. LexisNexis $80K / yr",
    accent: "#fbbf24",
    accentRgb: "251,191,36",
    body: "Law firms and consultancies manage client compliance from one white-label dashboard. Briefs under your brand. Dedicated capacity, SLA guarantees, and a full onboarding playbook.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
    bullets: [
      "Portfolio Mode — manage 10–50 client companies from one dashboard",
      "White-label reporting — briefs and dashboards under your firm's brand",
      "SLA 99.9% uptime — dedicated capacity, <12s brief generation, priority support",
    ],
    roiLine: "Full white-label at $30K/yr vs. $80K LexisNexis license.",
  },
  {
    n: "03",
    tag: "API & Integrations",
    title: "Developer & integrations tier",
    stat: "$0.15",
    statSub: "per analysis",
    replaces: "vs. custom dev $100K+",
    accent: "#a78bfa",
    accentRgb: "167,139,250",
    body: "License the compliance intelligence API to legal tech platforms and GRC tools. Usage-based pricing with volume tiers. Webhooks push CRITICAL bills to Slack, email, or any endpoint in real time.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    bullets: [
      "REST API — $0.15/analysis, $50 starter credit pack, volume discounts above 5K calls",
      "Webhooks — push CRITICAL bills to Slack, email, or your GRC tool instantly",
      "Legal tech licensing — embed compliance scoring into existing platforms",
    ],
    roiLine: "Replaces $100K+ custom build for legal tech teams.",
  },
];

export function RevenueSection() {
  return (
    <section id="revenue" className="relative z-10 overflow-hidden py-28" style={{ background: "#070707" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 mx-auto max-w-[1100px] px-8">
        <Reveal>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(212,212,216,0.9)", marginBottom: 16 }}>
            Business Model
          </p>
        </Reveal>

        <Reveal delay={1}>
          <h2 style={{ fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, color: "#ffffff", fontSize: "clamp(2rem,4vw,3rem)", marginBottom: 12 }}>
            10x cheaper.{" "}
            <span style={{ color: "rgba(228,228,231,0.45)" }}>100x more actionable.</span>
          </h2>
        </Reveal>

        {/* ROI comparison banner */}
        <Reveal delay={2}>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 40,
              padding: "18px 24px",
              borderRadius: 14,
              border: "1px solid rgba(113,113,122,0.30)",
              background: "rgba(24,24,27,0.40)",
            }}
          >
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "rgba(212,212,216,0.65)", lineHeight: 1.7 }}>
              Quorum: <strong style={{ color: "rgba(212,212,216,0.85)" }}>$40,000/yr</strong> · FiscalNote: <strong style={{ color: "rgba(212,212,216,0.85)" }}>$45,000/yr</strong> · LexisNexis: <strong style={{ color: "rgba(212,212,216,0.85)" }}>$80,000/yr</strong> · Bloomberg Law: <strong style={{ color: "rgba(212,212,216,0.85)" }}>$30,000/yr</strong>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.10)", alignSelf: "stretch" }} />
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255,255,255,0.90)", lineHeight: 1.7 }}>
              Misaki Pro: <strong>$5,988/yr</strong> — agentic reasoning, live web, 9-second briefs. The tools above cannot do any of that.
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STREAMS.map((s, i) => (
            <Reveal key={s.n} delay={i + 1}>
              <div
                className="flex h-full flex-col overflow-hidden rounded-2xl"
                style={{ border: `1px solid rgba(${s.accentRgb},0.22)`, background: "#0a0a0e" }}
              >
                {/* Accent bar */}
                <div style={{ height: 3, background: `linear-gradient(90deg, rgba(${s.accentRgb},0.85) 0%, rgba(${s.accentRgb},0.15) 100%)` }} />

                {/* Header */}
                <div style={{ background: `linear-gradient(135deg, rgba(${s.accentRgb},0.14) 0%, rgba(${s.accentRgb},0.02) 100%)`, borderBottom: `1px solid rgba(${s.accentRgb},0.18)`, padding: "20px 22px 18px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                    <div
                      style={{
                        width: 44, height: 44, borderRadius: 11,
                        background: `rgba(${s.accentRgb},0.12)`, border: `1px solid rgba(${s.accentRgb},0.30)`,
                        color: s.accent,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {s.icon}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 900, lineHeight: 1, fontSize: "clamp(1.5rem,2.8vw,2rem)", letterSpacing: "-0.05em", color: s.accent }}>
                        {s.stat}
                      </div>
                      <div style={{ fontSize: "0.64rem", fontWeight: 600, marginTop: 3, color: "rgba(255,255,255,0.45)" }}>{s.statSub}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6, color: `rgba(${s.accentRgb},0.80)` }}>
                    {s.n} — {s.tag}
                  </div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "rgba(250,250,250,1)", lineHeight: 1.3, marginBottom: 8 }}>
                    {s.title}
                  </div>
                  {/* Replaces badge */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "3px 9px",
                      borderRadius: 999,
                      background: `rgba(${s.accentRgb},0.10)`,
                      border: `1px solid rgba(${s.accentRgb},0.28)`,
                    }}
                  >
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6h8M6 2l4 4-4 4" stroke={s.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: "0.62rem", fontWeight: 700, color: s.accent, letterSpacing: "0.04em" }}>{s.replaces}</span>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
                  <p style={{ fontSize: "0.8rem", lineHeight: 1.7, color: "rgba(212,212,216,0.76)" }}>{s.body}</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
                    {s.bullets.map((b, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, marginTop: 3 }}>
                          <circle cx="6" cy="6" r="5.5" stroke={`rgba(${s.accentRgb},0.45)`} strokeWidth="1" />
                          <path d="M3.5 6 5 7.5 8.5 4" stroke={s.accent} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span style={{ fontSize: "0.73rem", lineHeight: 1.6, color: "rgba(212,212,216,0.72)" }}>{b}</span>
                      </div>
                    ))}
                  </div>

                  {/* ROI callout */}
                  <div style={{ marginTop: 8, padding: "10px 14px", borderRadius: 10, background: `rgba(${s.accentRgb},0.07)`, border: `1px solid rgba(${s.accentRgb},0.22)` }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: `rgba(${s.accentRgb},0.92)` }}>{s.roiLine}</span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Upgrade path */}
        <Reveal delay={4}>
          <div style={{ marginTop: 28, borderRadius: 14, padding: "20px 24px", border: "1px solid rgba(100,100,112,0.30)", background: "rgba(10,10,14,0.5)" }}>
            <div style={{ fontSize: "0.64rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(212,212,216,0.55)", marginBottom: 14 }}>
              Natural upgrade path
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto" }}>
              {[
                { label: "Free trial", sub: "7 days full access" },
                { label: "Starter",    sub: "$199/mo" },
                { label: "Pro",        sub: "$499/mo" },
                { label: "Team",       sub: "$999/mo" },
                { label: "Enterprise", sub: "$2,499/mo" },
              ].map((step, i, arr) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 0, flexShrink: 0 }}>
                  <div
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      padding: "10px 16px", borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(250,250,250,1)", whiteSpace: "nowrap" }}>{step.label}</div>
                    <div style={{ fontSize: "0.63rem", fontWeight: 600, color: "rgba(255,255,255,0.50)", whiteSpace: "nowrap" }}>{step.sub}</div>
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ padding: "0 6px", flexShrink: 0 }}>
                      <svg width="16" height="10" viewBox="0 0 20 12" fill="none">
                        <path d="M0 6h17M13 1l6 5-6 5" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
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
