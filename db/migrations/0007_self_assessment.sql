CREATE TABLE self_assessments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id     UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    session_id  UUID NOT NULL DEFAULT gen_random_uuid(),
    answers     JSONB NOT NULL DEFAULT '[]',
    score       INTEGER,          -- 0–100, NULL until scored
    industry_avg INTEGER,
    cost_to_close BIGINT,
    gaps_found  JSONB,            -- list of gap strings
    recommendation TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sa_bill_id ON self_assessments (bill_id);
