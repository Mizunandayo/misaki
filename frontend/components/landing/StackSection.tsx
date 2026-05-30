"use client";

import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/* dashboardicons.com is served via jsDelivr from homarr-labs/dashboard-icons */
const ICON_CDN = "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg";

/* ── Inline fallbacks for brands with no dashboard-icons entry.
   Light stroke so they stand out on the dark, transparent tile. ── */
const STROKE = "#e4e4e7";

const I = {
  unlocker: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 7.5-2" />
      <circle cx="12" cy="15.5" r="1.2" />
    </svg>
  ),
  serp: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  scraper: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M14 17.5h7M17.5 14v7" />
    </svg>
  ),
  browser: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
    </svg>
  ),
  mcp: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2.2" />
      <circle cx="5" cy="18" r="2.2" />
      <circle cx="19" cy="18" r="2.2" />
      <path d="M12 7.2v4.3M12 11.5 6.6 16M12 11.5 17.4 16" />
    </svg>
  ),
  langfuse: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h3l2.5 7 5-16L19 12h2" />
    </svg>
  ),
  weasyprint: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </svg>
  ),
  jinja: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4a3 3 0 0 0-3 3v2a2 2 0 0 1-2 2 2 2 0 0 1 2 2v2a3 3 0 0 0 3 3" />
      <path d="M16 4a3 3 0 0 1 3 3v2a2 2 0 0 0 2 2 2 2 0 0 0-2 2v2a3 3 0 0 1-3 3" />
    </svg>
  ),
  zustand: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5M3 16.5 12 21l9-4.5" />
    </svg>
  ),
  langgraph: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="2.4" />
      <circle cx="18" cy="6" r="2.4" />
      <circle cx="12" cy="18" r="2.4" />
      <path d="M8 7.2 10.8 16M16 7.2 13.2 16M8 6h8" />
    </svg>
  ),
  /* LangChain — interlocking chain links (🦜🔗 "chain") */
  langchain: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.5.5l2.5-2.5a5 5 0 0 0-7-7l-1.4 1.4" />
      <path d="M14 11a5 5 0 0 0-7.5-.5L4 13a5 5 0 0 0 7 7l1.4-1.4" />
    </svg>
  ),
  immer: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="13" height="13" rx="2" />
      <path d="M8 16v3a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-3" />
    </svg>
  ),
  /* React atom — dashboard-icons has no react entry */
  react: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#61dafb">
      <circle cx="12" cy="12" r="2" fill="#61dafb" stroke="none" />
      <g strokeWidth="1.1">
        <ellipse cx="12" cy="12" rx="10" ry="4.2" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
      </g>
    </svg>
  ),
  /* Framer glyph in white — dashboard-icons only ships a dark variant */
  framer: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="#f4f4f5">
      <path d="M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z" />
    </svg>
  ),
  /* Railway — dark brand logo rendered as a light deploy mark */
  railway: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f4f4f5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 10.5h17M8 20a16 16 0 0 1 0-16M16 4a16 16 0 0 1 0 16" />
    </svg>
  ),
  /* Vercel AI SDK — lightning / stream mark */
  aisdk: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  /* D3.js — radial node-link graph */
  d3: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2.2" />
      <circle cx="5"  cy="6"  r="1.8" />
      <circle cx="19" cy="6"  r="1.8" />
      <circle cx="5"  cy="18" r="1.8" />
      <circle cx="19" cy="18" r="1.8" />
      <line x1="7" y1="7.2" x2="10.3" y2="10.5" />
      <line x1="17" y1="7.2" x2="13.7" y2="10.5" />
      <line x1="7" y1="16.8" x2="10.3" y2="13.5" />
      <line x1="17" y1="16.8" x2="13.7" y2="13.5" />
    </svg>
  ),
  /* Recharts — bar chart */
  recharts: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="20" x2="21" y2="20" />
      <rect x="5"  y="14" width="3" height="6" rx="0.5" />
      <rect x="10" y="9"  width="3" height="11" rx="0.5" />
      <rect x="15" y="4"  width="3" height="16" rx="0.5" />
    </svg>
  ),
  /* Lucide React — 2×2 icon grid */
  lucide: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3"  y="3"  width="7" height="7" rx="1.5" />
      <rect x="14" y="3"  width="7" height="7" rx="1.5" />
      <rect x="3"  y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  /* React Simple Maps — globe */
  maps: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14.5 14.5 0 0 1 0 18" />
      <path d="M12 3a14.5 14.5 0 0 0 0 18" />
    </svg>
  ),
  /* Celery — task queue list */
  celery: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6h10M9 12h10M9 18h10" />
      <circle cx="5" cy="6"  r="1.2" fill={STROKE} stroke="none" />
      <circle cx="5" cy="12" r="1.2" fill={STROKE} stroke="none" />
      <circle cx="5" cy="18" r="1.2" fill={STROKE} stroke="none" />
    </svg>
  ),
  /* SQLAlchemy — stacked DB layers */
  sqlalchemy: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="6"  rx="8" ry="2.5" />
      <path d="M4 6v4c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5V6" />
      <path d="M4 10v4c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5v-4" />
      <path d="M4 14v4c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5v-4" />
    </svg>
  ),
  /* Alembic — migration arrows */
  alembic: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16V4M7 4 4 7M7 4l3 3" />
      <path d="M17 8v12M17 20l-3-3M17 20l3-3" />
      <line x1="3" y1="12" x2="21" y2="12" strokeOpacity="0.25" />
    </svg>
  ),
} satisfies Record<string, ReactNode>;

type Item = { role: string; name: string; cdn?: string; inline?: ReactNode };

const LAYERS: { cat: string; items: Item[] }[] = [
  {
    cat: "Inference",
    items: [
      { role: "Deep reasoning · extraction", name: "gpt-4.1 via AI/ML API",  cdn: "openai-light" },
      { role: "Vision · automation",          name: "gpt-4o via AI/ML API",   cdn: "openai-light" },
      { role: "Fast triage · cheap",          name: "gpt-4o-mini via AI/ML",  cdn: "openai-light" },
      { role: "Fallback terminator",          name: "Gemini 2.5 Pro/Flash",   cdn: "google-gemini" },
    ],
  },
  {
    cat: "Web Scraping",
    items: [
      { role: "Legislature sites", name: "Bright Data Web Unlocker",     inline: I.unlocker },
      { role: "News + press",      name: "Bright Data SERP API",         inline: I.serp },
      { role: "Lobbyist data",     name: "Bright Data Web Scraper API",  inline: I.scraper },
      { role: "JS-rendered pages", name: "Bright Data Scraping Browser", inline: I.browser },
      { role: "Orchestration",     name: "Bright Data MCP Server",       inline: I.mcp },
    ],
  },
  {
    cat: "AI Orchestration",
    items: [
      { role: "Workflow graphs", name: "LangGraph 0.2",    inline: I.langgraph },
      { role: "Chain primitives", name: "LangChain",       inline: I.langchain },
      { role: "Observability",   name: "Langfuse tracing", inline: I.langfuse },
      { role: "PDF generation",  name: "WeasyPrint 68",    inline: I.weasyprint },
      { role: "Templates",       name: "Jinja2",           inline: I.jinja },
      { role: "Vector search",   name: "pgvector HNSW",    cdn: "postgresql" },
      { role: "Task queue",      name: "Celery + Redis",   inline: I.celery },
      { role: "ORM",             name: "SQLAlchemy",       inline: I.sqlalchemy },
      { role: "DB migrations",   name: "Alembic",          inline: I.alembic },
      { role: "Error monitoring", name: "Sentry",          cdn: "sentry" },
    ],
  },
  {
    cat: "Application",
    items: [
      { role: "Frontend",        name: "Next.js 16",           cdn: "nextjs-light" },
      { role: "UI library",      name: "React 19",             inline: I.react },
      { role: "Styling",         name: "Tailwind CSS v4",      cdn: "tailwind" },
      { role: "Animation",       name: "Framer Motion 11",     inline: I.framer },
      { role: "State",           name: "Zustand",              inline: I.zustand },
      { role: "Immutability",    name: "Immer",                inline: I.immer },
      { role: "AI streaming",    name: "Vercel AI SDK",        inline: I.aisdk },
      { role: "Data viz",        name: "D3.js v7",             inline: I.d3 },
      { role: "Charts",          name: "Recharts",             inline: I.recharts },
      { role: "Icons",           name: "Lucide React",         inline: I.lucide },
      { role: "Maps",            name: "React Simple Maps",    inline: I.maps },
      { role: "Backend",         name: "FastAPI",              cdn: "fastapi" },
      { role: "Language",        name: "Python 3.12",          cdn: "python" },
      { role: "Database",        name: "PostgreSQL",           cdn: "postgresql" },
      { role: "Platform",        name: "Supabase",             cdn: "supabase" },
      { role: "Cache",           name: "Upstash Redis",        cdn: "redis" },
      { role: "Frontend host",   name: "Vercel",               cdn: "vercel-light" },
      { role: "Backend host",    name: "Railway",              inline: I.railway },
      { role: "Containers",      name: "Docker",               cdn: "docker" },
    ],
  },
];

function StackChip({ item }: { item: Item }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 16px 9px 11px",
        borderRadius: 12,
        border: "1px solid rgba(163,163,163,0.20)",
        background: "rgba(255,255,255,0.035)",
        flexShrink: 0,
      }}
    >
      <div style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {item.cdn ? (
          <img src={`${ICON_CDN}/${item.cdn}.svg`} alt="" width={28} height={28} loading="lazy" style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }} />
        ) : (
          <span style={{ display: "flex", transform: "scale(0.85)", transformOrigin: "center" }}>{item.inline}</span>
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: "0.67rem", fontWeight: 600, letterSpacing: "0.02em", color: "rgba(212,212,216,0.50)", lineHeight: 1.2, whiteSpace: "nowrap" }}>
          {item.role}
        </div>
        <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "rgba(245,245,245,0.96)", lineHeight: 1.25, whiteSpace: "nowrap" }}>
          {item.name}
        </div>
      </div>
    </div>
  );
}

export function StackSection() {
  return (
    <section id="stack" className="relative z-10 py-24" style={{ background: "#070707" }}>
      <div className="mx-auto max-w-[1100px] px-8">
        <Reveal>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(212,212,216,0.9)", marginBottom: 16 }}>
            Stack
          </p>
        </Reveal>

        <Reveal delay={1}>
          <h2 style={{ fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, color: "#ffffff", fontSize: "clamp(2rem,4vw,3rem)", marginBottom: 32 }}>
            Live web intelligence{" "}
            <span style={{ color: "rgba(228,228,231,0.45)" }}>+ multi-model AI routing</span>
          </h2>
        </Reveal>

        <Reveal delay={2}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {LAYERS.map((layer) => (
              <div
                key={layer.cat}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 20,
                  padding: "16px 0",
                  borderTop: "1px solid rgba(163,163,163,0.12)",
                }}
              >
                {/* Category label */}
                <div style={{ width: 128, flexShrink: 0, paddingTop: 6 }}>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(228,228,231,0.45)" }}>
                    {layer.cat}
                  </span>
                  <div style={{ fontSize: "0.6rem", fontWeight: 600, color: "rgba(161,161,170,0.40)", marginTop: 2 }}>
                    {layer.items.length} tools
                  </div>
                </div>

                {/* Chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, flex: 1 }}>
                  {layer.items.map((item) => (
                    <StackChip key={item.name} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
