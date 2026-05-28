-- 0005: indexes that the service queries from Step 6 depend on.

CREATE INDEX IF NOT EXISTS ix_lobbyist_filings_created
  ON lobbyist_filings (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_competitor_signals_bill_date
  ON competitor_signals (bill_id, signal_date DESC);

CREATE INDEX IF NOT EXISTS ix_momentum_history_jurisdiction_recent
  ON momentum_history (jurisdiction, recorded_at DESC);

CREATE INDEX IF NOT EXISTS ix_amendment_diffs_bill
  ON amendment_diffs (bill_id, created_at DESC);
