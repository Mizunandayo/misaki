-- db/migrations/0003_model_telemetry.sql
-- Day 3: per-call model telemetry. Powers the "Powered by AI/ML API" Model Router panel.

CREATE TABLE IF NOT EXISTS model_calls (
  id BIGSERIAL PRIMARY KEY,
  run_id UUID REFERENCES agent_runs(id) ON DELETE SET NULL,
  task TEXT NOT NULL,                          -- e.g. "triage", "applicability", "lobbyist_brief"
  capability TEXT NOT NULL,                    -- FAST_CHEAP, DEEP_REASONING, ...
  provider TEXT NOT NULL,                      -- aiml | gemini
  model TEXT NOT NULL,                         -- gpt-4o, gemini-2.5-pro, ...
  status TEXT NOT NULL CHECK (status IN ('ok','retry','fallback','error')),
  latency_ms INTEGER NOT NULL DEFAULT 0,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  est_cost_usd NUMERIC(10,5) NOT NULL DEFAULT 0,
  cache_hit BOOLEAN NOT NULL DEFAULT FALSE,
  error_text TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_model_calls_task_time ON model_calls(task, occurred_at DESC);
CREATE INDEX IF NOT EXISTS ix_model_calls_model ON model_calls(model);
