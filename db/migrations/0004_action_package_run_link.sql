-- db/migrations/0004_action_package_run_link.sql

ALTER TABLE action_packages
  ADD COLUMN IF NOT EXISTS run_id UUID
    REFERENCES agent_runs(id) ON DELETE SET NULL;

ALTER TABLE action_packages
  ADD COLUMN IF NOT EXISTS payload JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS ix_action_packages_run
  ON action_packages(run_id);

CREATE INDEX IF NOT EXISTS ix_action_packages_bill_created
  ON action_packages(bill_id, created_at DESC);
