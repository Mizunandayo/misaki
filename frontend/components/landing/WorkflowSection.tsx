"use client";

import { useEffect, useState } from "react";
import { Reveal } from "./Reveal";

const STEPS = [
  {
    n: "01", name: "Monitor", sub: "Configure jurisdictions + profile",
    tech: "Supabase Realtime", color: "#38bdf8",
    icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="10" cy="10" r="7"/><path d="M10 6v4l2 2"/></svg>,
  },
  {
    n: "02", name: "Scrape", sub: "Bright Data MCP live calls",
    tech: "MCP · 5 tools", color: "#22c55e",
    icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="10" cy="10" r="7"/><path d="M10 7v3l-2 2M14 6l-4 4"/></svg>,
  },
  {
    n: "03", name: "Triage", sub: "Fast model initial filter",
    tech: "gpt-4o-mini", color: "#fbbf24",
    icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 5h14M3 10h10M3 15h6"/></svg>,
  },
  {
    n: "04", name: "Analyze", sub: "Deep reasoning + cost estimate",
    tech: "gpt-4.1 · AI/ML API", color: "#60a5fa",
    icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M10 3v14M5 8l5-5 5 5M5 12l5 5 5-5"/></svg>,
  },
  {
    n: "05", name: "Alert", sub: "CRITICAL ember pulse fires",
    tech: "SSE · Zustand", color: "#ef4444",
    icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M10 2l1.5 5h5l-4 3 1.5 5L10 12l-4 3 1.5-5-4-3h5z"/></svg>,
  },
  {
    n: "06", name: "Act", sub: "PDF brief + agentic response",
    tech: "WeasyPrint · LangGraph", color: "#c084fc",
    icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><path d="M8 10h4M8 13h2"/></svg>,
  },
];

export function WorkflowSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % STEPS.length), 1400);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="workflow" className="relative z-10 py-32" style={{ background: "#050505" }}>
      <div className="mx-auto max-w-[1100px] px-8">
        <Reveal>
          <p style={{ fontSize: "0.76rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(212,212,216,0.9)", marginBottom: 20 }}>
            How It Works
          </p>
        </Reveal>
        <Reveal delay={1}>
          <h2 style={{ fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, color: "#ffffff", fontSize: "clamp(2.4rem,5vw,4rem)", marginBottom: 16 }}>
            One platform.
            <br />
            <span style={{ color: "rgba(228,228,231,0.48)" }}>Entire compliance workflow.</span>
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p style={{ fontSize: "1.03rem", lineHeight: 1.7, color: "rgba(255,255,255,0.82)", marginBottom: 32, maxWidth: "42rem" }}>
            Monitor → Scrape → Triage → Analyze → Alert → Act. Fully automated, end-to-end, in real time.
          </p>
        </Reveal>

        {/* Flow lane */}
        <Reveal delay={3}>
          <div className="glass-panel mb-8 rounded-2xl p-4">
            <div className="flow-lane mb-2">
              <span className="flow-pulse" />
              <span className="flow-pulse delay-1" />
              <span className="flow-pulse delay-2" />
            </div>
            <div style={{ fontSize: "0.84rem", color: "rgba(212,212,216,0.80)", textAlign: "center" }}>
              Continuous data flow from bill discovery to compliance action package
            </div>
          </div>
        </Reveal>

        {/* Animated pipeline */}
        <Reveal delay={4}>
          <div className="glass-panel mb-12 overflow-auto rounded-2xl p-2">
            <div className="flex items-stretch" style={{ minWidth: 720 }}>
              {STEPS.map((s, i) => (
                <div key={s.n} className="flex flex-1 items-center">
                  <div
                    className="relative flex flex-1 flex-col items-center px-3 py-7 text-center"
                  >
                    {/* Connector left */}
                    {i > 0 && (
                      <div
                        className="absolute left-0 top-1/2 h-px w-1/2 -translate-y-1/2"
                        style={
                          i <= active
                            ? { background: "rgba(228,228,231,0.9)", boxShadow: "0 0 8px rgba(228,228,231,0.38)", transition: "all .45s ease" }
                            : { background: "rgba(100,100,112,0.3)" }
                        }
                      />
                    )}
                    {/* Connector right */}
                    {i < STEPS.length - 1 && (
                      <div
                        className="absolute right-0 top-1/2 h-px w-1/2 -translate-y-1/2"
                        style={
                          i < active
                            ? { background: "rgba(228,228,231,0.9)", boxShadow: "0 0 8px rgba(228,228,231,0.38)", transition: "all .45s ease" }
                            : { background: "rgba(100,100,112,0.3)" }
                        }
                      />
                    )}
                    {/* Node circle */}
                    <div
                      className="relative z-10 mb-3 flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-300"
                      style={
                        i === active
                          ? { background: "rgba(212,212,216,0.16)", borderColor: "rgba(212,212,216,0.9)", boxShadow: "0 0 22px rgba(212,212,216,0.35), 0 0 60px rgba(212,212,216,0.1)", color: "rgba(255,255,255,1)" }
                          : i < active
                          ? { borderColor: "rgba(161,161,170,0.55)", background: "rgba(161,161,170,0.12)", color: "rgba(212,212,216,0.85)" }
                          : { borderColor: "rgba(100,100,112,0.45)", color: "rgba(161,161,170,0.55)" }
                      }
                    >
                      <span style={{ color: i <= active ? s.color : "inherit" }}>{s.icon}</span>
                    </div>
                    <div style={{ fontSize: "0.84rem", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 4, color: i === active ? "#fff" : "rgba(161,161,170,0.80)", transition: "color 0.3s" }}>{s.n}</div>
                    <div style={{ fontSize: "0.96rem", fontWeight: 700, marginBottom: 6, color: i === active ? "#fff" : "rgba(212,212,216,0.88)", transition: "color 0.3s" }}>{s.name}</div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 500, color: i === active ? "rgba(255,255,255,0.90)" : "rgba(161,161,170,0.68)", transition: "color 0.3s", marginBottom: 8 }}>{s.sub}</div>
                    <div
                      style={{
                        fontSize: "0.78rem", fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                        border: i === active ? "1px solid rgba(212,212,216,0.50)" : "1px solid rgba(100,100,112,0.45)",
                        background: i === active ? "rgba(161,161,170,0.20)" : "transparent",
                        color: i === active ? "rgba(228,228,231,0.90)" : "rgba(161,161,170,0.68)",
                        transition: "all 0.3s",
                      }}
                    >
                      {s.tech}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Dashboard mock strip */}
        <Reveal delay={5}>
          <div
            style={{
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.09)",
              background: "rgba(10,10,10,0.8)",
              overflow: "hidden",
              padding: "20px 24px",
              fontFamily: "monospace",
            }}
          >
            <div style={{ fontSize: "0.76rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(212,212,216,0.50)", marginBottom: 16 }}>
              Live MCP event stream — misaki_mcp_events channel
            </div>
            {[
              { type: "THINK", color: "#60a5fa", text: "Routing to gpt-4.1 via AI/ML API — DEEP_REASONING capability" },
              { type: "ACT",   color: "#22c55e", text: 'scrape_as_markdown — url: "https://legis.state.tx.us/BillLookup/SB2847.aspx"' },
              { type: "OBSERVE", color: "#fbbf24", text: "12,847 chars returned · latency: 2,341ms · cached: false · credits: 0.02" },
              { type: "THINK", color: "#60a5fa", text: "Applicability: CRITICAL · Confidence: 94 · Exposure: $285,000" },
              { type: "CONCLUDE", color: "#c084fc", text: "bill_analysis_complete · verdict: CRITICAL · action_package ready" },
            ].map((e, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 8 }}>
                <span style={{ fontSize: "0.74rem", fontWeight: 700, letterSpacing: "0.08em", color: e.color, minWidth: 72, paddingTop: 2 }}>{e.type}</span>
                <span style={{ fontSize: "0.82rem", color: "rgba(212,212,216,0.75)", lineHeight: 1.5 }}>{e.text}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
