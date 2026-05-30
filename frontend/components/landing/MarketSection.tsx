"use client";

import { Reveal } from "./Reveal";

const SEGMENTS = [
  {
    key: "TAM", value: "$5B",
    title: "Regulated enterprise market",
    body: "500,000 companies globally with 50+ employees in regulated industries at $10K/yr average compliance intelligence spend.",
    color: "#60a5fa",
  },
  {
    key: "SAM", value: "$500M",
    title: "Multi-jurisdiction tech companies",
    body: "50,000 technology companies with data processor obligations spanning US states, EU, and UK — the exact profile Misaki is built for.",
    color: "#c084fc",
  },
  {
    key: "SOM", value: "$2M",
    title: "Year 1 ARR target",
    body: "200 customers at $10,000 average annual contract value. Reachable via legal operations director outreach and viral landing page scanner.",
    color: "#34d399",
  },
];

const SEGMENTS_DETAIL = [
  {
    title: "Legal & Compliance Teams",
    copy: "Direct buyers experiencing the 3–6 week awareness lag daily. Highest willingness to pay — every missed bill costs more than a full year of Misaki.",
    color: "#60a5fa",
    grad: "from-blue-400/24",
  },
  {
    title: "Series B/C SaaS Companies",
    copy: "Data processors with multi-jurisdiction obligations and three-person legal teams. The exact NovaTech profile — and the fastest-growing compliance buyer segment.",
    color: "#c084fc",
    grad: "from-violet-400/24",
  },
  {
    title: "Law Firms & Consultancies",
    copy: "Portfolio Mode — manage compliance obligations across multiple client companies from a single dashboard. Enterprise tier with white-label reporting.",
    color: "#34d399",
    grad: "from-emerald-400/24",
  },
];

export function MarketSection() {
  return (
    <section id="market" className="relative z-10 overflow-hidden py-32" style={{ background: "#050505" }}>
      <div className="mx-auto max-w-[1100px] px-8">
        <Reveal>
          <p style={{ fontSize: "0.76rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(212,212,216,0.9)", marginBottom: 20 }}>
            Target Market
          </p>
        </Reveal>
        <Reveal delay={1}>
          <h2 style={{ fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, color: "#ffffff", fontSize: "clamp(2.4rem,5vw,4rem)", marginBottom: 20 }}>
            TAM · SAM · SOM
            <br />
            <span style={{ color: "rgba(228,228,231,0.55)" }}>A nested strategy with immediate capture.</span>
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p style={{ fontSize: "1.03rem", lineHeight: 1.7, color: "rgba(255,255,255,0.82)", maxWidth: "44rem", marginBottom: 36 }}>
            Misaki enters through legal operations teams experiencing the compliance lag today,
            expands through SaaS companies with growing multi-jurisdiction obligations, and scales
            into law firms managing compliance for entire client portfolios.
          </p>
        </Reveal>

        {/* Triangle + right panel */}
        <Reveal delay={3}>
          <div className="mb-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Triangle visualization */}
            <div className="relative flex min-h-[30rem] items-center justify-center">
              {/* Triangle shape */}
              <div
                style={{
                  position: "absolute",
                  bottom: 12,
                  width: "28rem",
                  height: "24rem",
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                  background: "linear-gradient(180deg, rgba(96,165,250,0.22) 0%, rgba(192,132,252,0.16) 55%, rgba(52,211,153,0.22) 100%)",
                  border: "1px solid rgba(161,161,170,0.42)",
                  boxShadow: "0 22px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)",
                }}
              />

              {/* Divider lines */}
              <div style={{ position: "absolute", bottom: 12, width: "28rem", height: 1, background: "rgba(212,212,216,0.45)" }} />
              <div style={{ position: "absolute", bottom: "7.25rem", width: "20rem", height: 1, background: "rgba(212,212,216,0.45)" }} />
              <div style={{ position: "absolute", bottom: "12rem", width: "11rem", height: 1, background: "rgba(212,212,216,0.45)" }} />

              {/* Labels */}
              <div style={{ position: "absolute", bottom: "12.5rem", left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
                <div style={{ fontSize: "0.74rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.92)" }}>SOM</div>
                <div style={{ fontSize: "1.55rem", fontWeight: 900, letterSpacing: "-0.04em", color: "rgba(250,250,250,1)" }}>$2M</div>
              </div>
              <div style={{ position: "absolute", bottom: "7.7rem", left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
                <div style={{ fontSize: "0.74rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.92)" }}>SAM</div>
                <div style={{ fontSize: "1.55rem", fontWeight: 900, letterSpacing: "-0.04em", color: "rgba(250,250,250,1)" }}>$500M</div>
              </div>
              <div style={{ position: "absolute", bottom: "3rem", left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
                <div style={{ fontSize: "0.74rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.92)" }}>TAM</div>
                <div style={{ fontSize: "1.55rem", fontWeight: 900, letterSpacing: "-0.04em", color: "rgba(250,250,250,1)" }}>$5B</div>
              </div>

              {/* Colored dots */}
              <span style={{ position: "absolute", top: "4.5rem", left: "48%", width: 10, height: 10, borderRadius: "50%", background: "#60a5fa", boxShadow: "0 0 16px rgba(96,165,250,0.9)" }} />
              <span style={{ position: "absolute", top: "9.5rem", left: "29%", width: 12, height: 12, borderRadius: "50%", background: "#c084fc", boxShadow: "0 0 15px rgba(192,132,252,0.85)" }} />
              <span style={{ position: "absolute", top: "14rem", left: "66%", width: 10, height: 10, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 15px rgba(52,211,153,0.90)" }} />
            </div>

            {/* Segment list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {SEGMENTS.map((s) => (
                <div key={s.key} style={{ position: "relative", paddingLeft: 20 }}>
                  <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: `linear-gradient(180deg, ${s.color} 0%, transparent 100%)` }} />
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, marginBottom: 6 }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(212,212,216,0.92)" }}>{s.key}</span>
                    <span style={{ fontSize: "1.06rem", fontWeight: 900, letterSpacing: "-0.04em", color: "rgba(250,250,250,1)" }}>{s.value}</span>
                  </div>
                  <div style={{ fontSize: "1.03rem", fontWeight: 700, color: "rgba(250,250,250,1)", marginBottom: 6 }}>{s.title}</div>
                  <div style={{ fontSize: "0.88rem", lineHeight: 1.65, color: "rgba(212,212,216,0.84)" }}>{s.body}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Segment detail cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {SEGMENTS_DETAIL.map((entry, i) => (
            <Reveal key={entry.title} delay={i + 1}>
              <div
                className="relative h-full overflow-hidden rounded-2xl p-5"
                style={{ border: "1px solid rgba(100,100,112,0.45)", background: "rgba(10,10,14,0.6)" }}
              >
                {/* Gradient overlay */}
                <div
                  className={`pointer-events-none absolute inset-0 bg-linear-to-br ${entry.grad} via-transparent to-transparent`}
                />
                <div className="relative z-10">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color, flexShrink: 0 }} />
                    <div style={{ fontSize: "1.02rem", fontWeight: 700, color: "rgba(250,250,250,1)" }}>{entry.title}</div>
                  </div>
                  <div style={{ fontSize: "0.84rem", lineHeight: 1.65, color: "rgba(255,255,255,0.82)" }}>{entry.copy}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
