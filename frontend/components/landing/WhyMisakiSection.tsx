"use client";

import { Reveal } from "./Reveal";

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="rgba(74,222,128,0.65)" strokeWidth="1.2" />
      <path d="m5 8 2 2 4-4" stroke="#4ade80" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Cross() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="rgba(251,113,133,0.45)" strokeWidth="1.2" />
      <path d="m5.5 5.5 5 5M10.5 5.5l-5 5" stroke="#fb7185" strokeWidth="1.45" strokeLinecap="round" />
    </svg>
  );
}
function Part() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="rgba(250,204,21,0.5)" strokeWidth="1.2" />
      <path d="M5 8h6" stroke="#facc15" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

const ROWS: Array<{ feat: string; misaki: true | string; quorum: boolean | "~" | string; fiscal: boolean | "~" | string; lexis: boolean | "~" | string }> = [
  { feat: "Real-time bill monitoring",        misaki: true, quorum: "~",   fiscal: true,  lexis: false },
  { feat: "Company-specific reasoning",       misaki: true, quorum: false, fiscal: "~",   lexis: false },
  { feat: "Dollar exposure estimate",         misaki: true, quorum: false, fiscal: false, lexis: false },
  { feat: "Pass probability scoring",         misaki: true, quorum: false, fiscal: true,  lexis: false },
  { feat: "Agentic response (law firms etc)", misaki: true, quorum: false, fiscal: false, lexis: false },
  { feat: "PDF compliance brief",             misaki: true, quorum: "~",   fiscal: "~",   lexis: "~"   },
  { feat: "Vision OCR for scanned bills",     misaki: true, quorum: false, fiscal: false, lexis: false },
  { feat: "Competitive intelligence",         misaki: true, quorum: "~",   fiscal: "~",   lexis: false },
  { feat: "Monthly price",                    misaki: "$499", quorum: "$3,333", fiscal: "$3,750", lexis: "$6,667" },
];

function Cell({ v }: { v: boolean | "~" | string }) {
  if (v === true) return <Check />;
  if (v === false) return <Cross />;
  if (v === "~") return <Part />;
  return <span style={{ fontFamily: "monospace", fontSize: "0.82rem", fontWeight: 700, color: "rgba(212,212,216,0.90)" }}>{v}</span>;
}

const DIFFS = [
  { n: "01", title: "Company-specific",   desc: "Misaki reasons over every bill against your exact company profile — industry, data practices, jurisdictions. Generic alerts surface mentions; Misaki surfaces obligations." },
  { n: "02", title: "Agentic response",   desc: "Existing tools tell you something changed. Misaki acts — finding law firms, drafting the lobbyist brief, and generating the competitive response strategy autonomously." },
  { n: "03", title: "MCP transparency",   desc: "Every Bright Data MCP call is visible in the reasoning terminal. Not a black box — judges and compliance teams see exactly where the intelligence comes from." },
  { n: "04", title: "9-second brief",     desc: "AI/ML API generates the executive summary, gap analysis, and action plan. WeasyPrint renders a board-ready PDF with dollar exposure on the cover in under 9 seconds." },
];

export function WhyMisakiSection() {
  return (
    <section id="why" className="relative z-10 py-32" style={{ background: "#050505" }}>
      <div className="mx-auto max-w-[1100px] px-8">
        <Reveal>
          <p style={{ fontSize: "0.76rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(212,212,216,0.9)", marginBottom: 20 }}>
            Why Misaki
          </p>
        </Reveal>
        <Reveal delay={1}>
          <h2 style={{ fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, color: "#ffffff", fontSize: "clamp(2.4rem,5vw,4rem)", marginBottom: 16 }}>
            No existing tool
            <br />
            <span style={{ color: "rgba(228,228,231,0.48)" }}>does all of this.</span>
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p style={{ fontSize: "0.84rem", lineHeight: 1.65, color: "rgba(255,255,255,0.82)", marginBottom: 24, maxWidth: "44rem" }}>
            Quorum tracks bills. FiscalNote&apos;s AI copilot summarizes policy and forecasts passage. LexisNexis
            lets you search case law. None of them reason over applicability with company-specific intelligence,
            estimate compliance cost in dollars, or act autonomously on what they find.
          </p>
        </Reveal>

        {/* Comparison table */}
        <Reveal delay={3}>
          <div className="glass-panel mb-8 overflow-auto rounded-2xl">
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(100,100,112,0.35)" }}>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "0.82rem", fontWeight: 700, color: "rgba(212,212,216,0.95)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Capability</th>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "0.82rem", fontWeight: 700, color: "rgba(250,250,250,1)", letterSpacing: "0.06em", textTransform: "uppercase", background: "rgba(161,161,170,0.22)" }}>Misaki</th>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "0.82rem", fontWeight: 700, color: "rgba(212,212,216,0.95)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Quorum</th>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "0.82rem", fontWeight: 700, color: "rgba(212,212,216,0.95)", letterSpacing: "0.06em", textTransform: "uppercase" }}>FiscalNote</th>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "0.82rem", fontWeight: 700, color: "rgba(212,212,216,0.95)", letterSpacing: "0.06em", textTransform: "uppercase" }}>LexisNexis</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r, i) => (
                  <tr
                    key={r.feat}
                    style={{
                      borderBottom: i < ROWS.length - 1 ? "1px solid rgba(100,100,112,0.25)" : "none",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(100,100,112,0.10)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 20px", fontSize: "0.90rem", color: "rgba(255,255,255,0.88)", fontWeight: 500 }}>{r.feat}</td>
                    <td style={{ padding: "12px 20px", background: "rgba(113,113,122,0.16)" }}><Cell v={r.misaki} /></td>
                    <td style={{ padding: "12px 20px" }}><Cell v={r.quorum} /></td>
                    <td style={{ padding: "12px 20px" }}><Cell v={r.fiscal} /></td>
                    <td style={{ padding: "12px 20px" }}><Cell v={r.lexis} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        {/* 4 differentiator cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {DIFFS.map((d, i) => (
            <Reveal key={d.n} delay={i + 1}>
              <div
                className="glass-panel h-full rounded-2xl p-5 transition-colors duration-300 hover:border-zinc-300/45"
                style={{ cursor: "default" }}
              >
                <div style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.06em", color: "rgba(212,212,216,0.45)", marginBottom: 12, transition: "color 0.3s" }}>{d.n}</div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "rgba(250,250,250,1)", marginBottom: 8 }}>{d.title}</div>
                <div style={{ fontSize: "0.82rem", lineHeight: 1.65, color: "rgba(255,255,255,0.82)" }}>{d.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
