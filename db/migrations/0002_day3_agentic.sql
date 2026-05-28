-- db/migrations/0002_day3_agentic.sql
-- Day 3: agent runs, MCP event log, amendment diffs, momentum history, scanner reports.

-- Generic enum for run lifecycle.
DO $$ BEGIN
  CREATE TYPE run_status AS ENUM ('queued','running','succeeded','failed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- agent_runs: one row per Graph 2 (agentic) OR Graph 3 (scanner) invocation.
CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kind TEXT NOT NULL CHECK (kind IN ('AGENTIC','SCANNER')),
  bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,
  company_id UUID REFERENCES company_profiles(id) ON DELETE SET NULL,
  scanner_input TEXT,                                  -- raw company name for SCANNER runs
  status run_status NOT NULL DEFAULT 'queued',
  current_step TEXT,
  error_text TEXT,
  total_mcp_calls INTEGER NOT NULL DEFAULT 0,
  total_credit_cents INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_agent_runs_kind_started ON agent_runs(kind, started_at DESC);
CREATE INDEX IF NOT EXISTS ix_agent_runs_bill ON agent_runs(bill_id);

-- mcp_events: every ACT/OBSERVE/THINK/CONCLUDE event published during a run.
CREATE TABLE IF NOT EXISTS mcp_events (
  id BIGSERIAL PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('ACT','OBSERVE','THINK','CONCLUDE','ERROR')),
  payload JSONB NOT NULL,
  cached BOOLEAN NOT NULL DEFAULT FALSE,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_mcp_events_run_time ON mcp_events(run_id, occurred_at);

-- amendment_diffs: semantic diff between two bill versions.
CREATE TABLE IF NOT EXISTS amendment_diffs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  from_version_id UUID NOT NULL REFERENCES bill_versions(id) ON DELETE CASCADE,
  to_version_id   UUID NOT NULL REFERENCES bill_versions(id) ON DELETE CASCADE,
  changes JSONB NOT NULL,            -- [{type:'add'|'remove'|'modify', text, compliance_impact}]
  exposure_delta_usd INTEGER NOT NULL DEFAULT 0,
  cache_key TEXT NOT NULL UNIQUE,    -- sha256(from_hash + to_hash + profile_hash)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- momentum_history: per-jurisdiction regulatory momentum snapshots.
CREATE TABLE IF NOT EXISTS momentum_history (
  id BIGSERIAL PRIMARY KEY,
  jurisdiction TEXT NOT NULL,
  score NUMERIC(4,1) NOT NULL CHECK (score BETWEEN 0 AND 10),
  bill_count_session INTEGER NOT NULL DEFAULT 0,
  enforcement_count_30d INTEGER NOT NULL DEFAULT 0,
  political_event_label TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_momentum_jx_time ON momentum_history(jurisdiction, recorded_at DESC);

-- scanner_reports: persisted Public Company Scanner output (cache + shareable).
CREATE TABLE IF NOT EXISTS scanner_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name_normalized TEXT NOT NULL,
  company_name_display TEXT NOT NULL,
  exposure_score INTEGER NOT NULL CHECK (exposure_score BETWEEN 0 AND 100),
  total_exposure_low_usd  BIGINT NOT NULL DEFAULT 0,
  total_exposure_high_usd BIGINT NOT NULL DEFAULT 0,
  top_threats JSONB NOT NULL,        -- [{jurisdiction, bill_number, title, urgency}]
  strategic_summary TEXT NOT NULL,
  raw_sec_excerpt TEXT,
  model_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  run_id UUID REFERENCES agent_runs(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_name_normalized)
);
CREATE INDEX IF NOT EXISTS ix_scanner_reports_expires ON scanner_reports(expires_at);
