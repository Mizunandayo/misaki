# Misaki (見先) — Legislative Intelligence Platform

> **見先** — Japanese for "Seeing Ahead." AI-powered regulatory monitoring that detects compliance threats before they become expensive surprises.

Built as a solo project for the **Web Data UNLOCKED Hackathon** · May 25–31, 2026

---

## What is Misaki?

Misaki watches every active legislature across all 50 US states, the EU, and the UK Parliament simultaneously. It scrapes live bill text, committee hearings, lobbyist filings, and political news in real time using **Bright Data's enterprise web infrastructure** — accessed directly through the **Bright Data MCP Server**, making Misaki's AI agents true first-class citizens of the open web.

It then routes each bill through a **capability-weighted multi-model gateway** (GPT-4.1, GPT-4o-mini, Gemini 2.5 Pro/Flash) via the **AI/ML API**, reasons over the bill text against your company's specific profile, and delivers a threat verdict with dollar exposure, pass probability, and a board-ready compliance brief — in under 9 seconds.

When a high-severity bill is detected, Misaki's **agentic pipeline doesn't just alert you — it acts**: it searches for specialised law firms, drafts a lobbying response brief, and generates a Competitive Response Strategy based on how peer companies handled comparable legislation historically.

---

## Key Features

| Feature | Description |
|---|---|
| **Live Bill Monitoring** | Real-time scraping — 50 US states + EU + UK via Bright Data MCP Server |
| **AI Threat Analysis** | LangGraph pipeline: bill text → company-specific risk verdict in < 9 s |
| **Agentic Response Engine** | Autonomous action: law firm search, lobbying brief drafts, competitor intel |
| **Compliance Briefs** | Board-ready PDF briefs (Jinja2 + WeasyPrint), stored on Supabase Storage |
| **Self-Assessment** | 5-minute compliance readiness quiz with AI-scored gap analysis |
| **Public Company Scanner** | Viral tool — search any company, get their full regulatory exposure |
| **Intelligence Chat** | Conversational interface with live MCP web context |
| **Jurisdiction Heat Map** | Interactive US regulatory heat map — bill density + threat levels |
| **Real-time Dashboard** | Supabase Realtime pushes bill status changes live |
| **Model Router** | Capability-routing across GPT-4.1, GPT-4o, GPT-4o-mini, Gemini 2.5 |

---

## Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Framework | FastAPI · Python 3.12 · Uvicorn |
| AI Orchestration | LangGraph 0.2 · LangChain · Langfuse |
| Models | GPT-4.1, GPT-4o, GPT-4o-mini (AI/ML API) · Gemini 2.5 Pro / Flash |
| Web Scraping | Bright Data MCP Server — Web Unlocker, SERP API, Scraping Browser |
| Database | PostgreSQL + pgvector (HNSW) · SQLAlchemy · Alembic |
| Task Queue | Celery + Redis |
| Cache | Upstash Redis |
| PDF Generation | WeasyPrint 68 + Jinja2 |
| Storage | Supabase Storage |
| Monitoring | Langfuse · Sentry · Structlog |
| Rate Limiting | SlowAPI |

### Frontend

| Layer | Technology |
|---|---|
| Framework | Next.js 16 · React 19 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion 11 |
| State | Zustand + Immer |
| Charts & Viz | Recharts · D3.js v7 |
| Maps | React Simple Maps + TopoJSON |
| Icons | Lucide React |
| Realtime | Supabase Realtime JS |
| AI Streaming | Vercel AI SDK + Google AI SDK |

### Infrastructure

| Layer | Technology |
|---|---|
| Frontend | Vercel |
| Backend | Railway |
| Database & Auth | Supabase (PostgreSQL + Realtime + Storage) |
| Vector Search | pgvector HNSW |

---

## Architecture

```
Browser ──► Next.js (Vercel)
                 │
                 ▼  REST / SSE streaming
           FastAPI (Railway)
                 │
     ┌───────────┴────────────┐
     │    LangGraph Graphs    │
     │  Bill Analysis Graph   │
     │  Scanner Graph         │
     │  Agentic Response      │
     └───────────┬────────────┘
                 │
     ┌───────────┼───────────────────┐
     ▼           ▼                   ▼
 AI/ML API   Bright Data MCP     PostgreSQL
 Gemini API  (live web data)     + pgvector
                                 + Redis
                                 + Supabase
```

### AI Model Routing

```
Incoming task
     │
     ├── Deep reasoning / extraction  ──► GPT-4.1      (AI/ML API)
     ├── Vision / automation          ──► GPT-4o        (AI/ML API)
     ├── Fast triage / bulk           ──► GPT-4o-mini   (AI/ML API)
     └── Fallback / long context      ──► Gemini 2.5   (Google)
```

---

## Local Development

### Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL 16+
- Redis

### Backend

```bash
cd backend
cp .env.example .env   # fill in API keys

pip install uv
uv sync

# Apply migrations
psql $DATABASE_URL < ../db/migrations/0001_initial.sql
# ... repeat through 0007_self_assessment.sql

# Optional: load NovaTech seed data
psql $DATABASE_URL < ../db/seeds/novatech.sql

uv run uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

# Create .env.local with NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SUPABASE_URL, etc.
cp .env.local.example .env.local

npm run dev
```

---

## Environment Variables

### Backend (`.env`)

```env
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/misaki
REDIS_URL=redis://localhost:6379/0
AIML_API_KEY=your_aiml_api_key
GEMINI_API_KEY=your_gemini_key
BRIGHT_DATA_API_KEY=your_bright_data_key
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
SENTRY_DSN=https://...@sentry.io/...
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## Database Migrations

```
db/migrations/
  0001_initial.sql          — companies, profiles, bills, analysis runs
  0002_day3_agentic.sql     — agentic run + events tables
  0003_model_telemetry.sql  — model usage + latency telemetry
  0004_action_package_run_link.sql
  0005_services_indexes.sql
  0006_briefs.sql           — compliance briefs table
  0007_self_assessment.sql  — self-assessment quiz + scores
```

---

## Business Model

| Tier | Price | Includes |
|---|---|---|
| Starter | $199 / mo | 1 profile · 5 jurisdictions · 20 briefs/month |
| Pro | $499 / mo | 3 profiles · 20 jurisdictions · unlimited briefs + agentic engine |
| Team | $999 / mo | Unlimited profiles · Portfolio Mode · team seats · SSO |
| Enterprise | $2,499 / mo | White-label · SLA 99.9% · dedicated capacity |
| API | $0.15 / analysis | Legal tech platforms · GRC tool integrations |

**10x cheaper than Quorum ($40K/yr). 100x more actionable.**

---

## Hackathon Context

**Event:** Web Data UNLOCKED Hackathon · May 25–31, 2026  
**Builder:** Francis Daniel ([@Mizunandayo](https://github.com/Mizunandayo)) · Solo project

Partner challenge targets:
- **Bright Data** — MCP Server as the live web intelligence backbone
- **AI/ML API** — capability-routed multi-model inference gateway ("Best Use" challenge)

---

## Project Structure

```
misaki/
├── backend/          FastAPI app — AI graphs, scrapers, API routes
│   ├── app/
│   │   ├── ai/       Model gateway, prompts, schemas, telemetry
│   │   ├── api/v1/   REST endpoints
│   │   ├── graphs/   LangGraph bill analysis + agentic pipelines
│   │   ├── mcp/      Bright Data MCP client
│   │   ├── models/   SQLAlchemy ORM models
│   │   ├── scrapers/ Legislature scrapers (CA, TX, ...)
│   │   └── services/ Brief generation, pass probability, embeddings, ...
│   └── scripts/      Dev utilities + gateway probes
├── frontend/         Next.js 16 app
│   ├── app/          Pages (dashboard, bills, scanner, share)
│   ├── components/   UI components (landing, dashboard, agent, scanner, ...)
│   ├── hooks/        React hooks (realtime, streaming, agent run, ...)
│   └── lib/          API clients, streaming utilities
└── db/
    ├── migrations/   SQL migration files
    └── seeds/        Sample data (NovaTech scenario)
```

---

## License

MIT
