-- Compliance brief records — stores generated PDFs in Supabase Storage

CREATE TABLE briefs (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id               UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    storage_path          TEXT NOT NULL,
    signed_url            TEXT,
    signed_url_expires_at TIMESTAMPTZ,
    content_hash          TEXT NOT NULL,
    compliance_exposure_usd BIGINT NOT NULL DEFAULT 0,
    total_gaps            INTEGER NOT NULL DEFAULT 0,
    verdict               TEXT,
    pages                 INTEGER NOT NULL DEFAULT 1,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_briefs_bill_id ON briefs (bill_id);
CREATE INDEX idx_briefs_created_at ON briefs (created_at DESC);
