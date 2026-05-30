"use client";

import { Reveal } from "./Reveal";

export function CTASection() {
  return (
    <section
      className="relative z-10 overflow-hidden py-32"
      style={{ background: "#050505" }}
    >
      {/* Bottom glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(255,255,255,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1100px] px-8">
        {/* Main glass panel */}
        <Reveal>
          <div
            className="glass-panel relative overflow-hidden rounded-3xl px-12 py-20 text-center"
            style={{ marginBottom: 48 }}
          >
            {/* Inner top glow */}
            <div
              className="pointer-events-none absolute inset-0 rounded-3xl"
              style={{
                background:
                  "radial-gradient(ellipse 55% 40% at 50% 0%, rgba(212,212,216,0.12) 0%, transparent 70%)",
              }}
            />

            <div className="relative z-10">
              <p
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(212,212,216,0.90)",
                  marginBottom: 24,
                }}
              >
                Web Data UNLOCKED · lablab.ai · May 25–31, 2026
              </p>

              <h2
                style={{
                  fontWeight: 900,
                  letterSpacing: "-0.05em",
                  lineHeight: 0.95,
                  color: "#ffffff",
                  fontSize: "clamp(3rem,7vw,6rem)",
                  marginBottom: 24,
                }}
              >
                Every day without Misaki
                <br />
                <span style={{ color: "rgba(228,228,231,0.45)" }}>
                  is a day flying blind.
                </span>
              </h2>

              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: 1.75,
                  color: "rgba(255,255,255,0.82)",
                  maxWidth: "28rem",
                  margin: "0 auto 40px",
                }}
              >
                200,000 active bills. Live Bright Data MCP scraping. AI/ML API
                multi-model routing. Autonomous agentic response. Board-ready PDF
                in 9 seconds.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                {/* Primary — Dashboard */}
                <a
                  href="/dashboard"
                  className="cursor-pointer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    color: "#050505",
                    background: "#ffffff",
                    padding: "14px 32px",
                    borderRadius: 12,
                    textDecoration: "none",
                    transition: "all 150ms cubic-bezier(0.16,1,0.3,1)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.opacity = "0.88";
                    el.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.opacity = "1";
                    el.style.transform = "translateY(0)";
                  }}
                >
                  {/* Play triangle */}
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                    <polygon points="3,2 13,8 3,14" />
                  </svg>
                  Open Dashboard
                </a>

                {/* Secondary — GitHub */}
                <a
                  href="https://github.com/Mizunandayo/misaki"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: "0.88rem",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.65)",
                    border: "1px solid rgba(255,255,255,0.16)",
                    padding: "14px 32px",
                    borderRadius: 12,
                    textDecoration: "none",
                    background: "rgba(255,255,255,0.04)",
                    transition: "all 150ms cubic-bezier(0.16,1,0.3,1)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = "#fff";
                    el.style.borderColor = "rgba(255,255,255,0.32)";
                    el.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = "rgba(255,255,255,0.65)";
                    el.style.borderColor = "rgba(255,255,255,0.16)";
                    el.style.transform = "translateY(0)";
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                  View Source
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Footer */}
        <Reveal delay={2}>
          <footer
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              paddingTop: 16,
              borderTop: "1px solid rgba(161,161,170,0.35)",
            }}
          >
            <span
              style={{
                fontSize: "0.88rem",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.70)",
              }}
            >
              見先 MISAKI
            </span>
            <span style={{ fontSize: "0.84rem", fontWeight: 500, color: "rgba(212,212,216,0.75)" }}>
              Built by Francis Daniel (Mizu) · Solo · May 25–31, 2026 · lablab.ai
            </span>
            <div style={{ display: "flex", gap: 20 }}>
              {[
                { label: "Dashboard", href: "/dashboard" },
                { label: "GitHub",    href: "https://github.com/Mizunandayo/misaki" },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="cursor-pointer"
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.50)",
                    textDecoration: "none",
                    transition: "color 150ms",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.50)")}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </footer>
        </Reveal>
      </div>
    </section>
  );
}
