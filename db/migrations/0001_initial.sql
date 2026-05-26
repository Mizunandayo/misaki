CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--   company_profiles  
CREATE TABLE company_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  industry_tags TEXT[] DEFAULT '{}',
  jurisdictions TEXT[] DEFAULT '{}',
  headcount INTEGER,
  revenue_band TEXT,
  data_handling_classification TEXT,
  compliance_certifications TEXT[] DEFAULT '{}',
  tech_stack_indicators TEXT[] DEFAULT '{}',
  profile_confidence_score INTEGER DEFAULT 0 CHECK (profile_confidence_score BETWEEN 0 AND 100),
  profile_gaps JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--   bills  
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jurisdiction TEXT NOT NULL,
  bill_number TEXT NOT NULL,
  title TEXT NOT NULL,
  full_text TEXT,
  status TEXT NOT NULL DEFAULT 'introduced',
  introduced_at TIMESTAMPTZ,
  last_action_at TIMESTAMPTZ,
  effective_date TIMESTAMPTZ,
  source_url TEXT,
  content_hash TEXT UNIQUE NOT NULL,
  pass_probability INTEGER DEFAULT 0 CHECK (pass_probability BETWEEN 0 AND 100),
  urgency_score INTEGER DEFAULT 0 CHECK (urgency_score BETWEEN 0 AND 100),
  embedding vector(768),
  fts tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(full_text, '')), 'B')
  ) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (jurisdiction, bill_number)
);

CREATE INDEX ix_bills_jurisdiction ON bills(jurisdiction);
CREATE INDEX ix_bills_status ON bills(status);
CREATE INDEX ix_bills_urgency ON bills(urgency_score DESC);
CREATE INDEX ix_bills_fts ON bills USING gin(fts);
CREATE INDEX ix_bill_embedding_hnsw ON bills
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

--   bill_versions  
CREATE TABLE bill_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  full_text TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  content_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (bill_id, version_number)
);

--   assessments  
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  verdict TEXT NOT NULL CHECK (verdict IN ('CRITICAL','HIGH','MEDIUM','LOW','NOT_APPLICABLE')),
  confidence INTEGER DEFAULT 0 CHECK (confidence BETWEEN 0 AND 100),
  reasoning_chain JSONB DEFAULT '[]'::jsonb,
  triggering_clause_text TEXT,
  triggering_clause_location TEXT,
  compliance_cost_estimate INTEGER DEFAULT 0,
  affected_operations JSONB DEFAULT '[]'::jsonb,
  comparable_bills JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (bill_id, company_id)
);

CREATE INDEX ix_assessments_bill_company ON assessments(bill_id, company_id);
CREATE INDEX ix_assessments_verdict ON assessments(verdict);

--   alerts  
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  company_id UUID REFERENCES company_profiles(id),
  severity TEXT NOT NULL CHECK (severity IN ('CRITICAL','HIGH','MEDIUM','LOW')),
  message TEXT,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ
);

CREATE INDEX ix_alerts_severity ON alerts(severity, triggered_at DESC);

--   action_packages  
CREATE TABLE action_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  company_id UUID REFERENCES company_profiles(id),
  law_firm_shortlist JSONB DEFAULT '[]'::jsonb,
  lobbyist_brief_draft TEXT,
  competitive_response TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--   lobbyist_filings  
CREATE TABLE lobbyist_filings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  organization TEXT NOT NULL,
  amount_usd INTEGER DEFAULT 0,
  position TEXT CHECK (position IN ('FOR','AGAINST','NEUTRAL')),
  source_url TEXT,
  filed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_lobbyist_filings_bill ON lobbyist_filings(bill_id);

--   competitor_signals  
CREATE TABLE competitor_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  competitor_name TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  signal_date TIMESTAMPTZ,
  source_url TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_competitor_signals_bill ON competitor_signals(bill_id);
CREATE INDEX ix_competitor_signals_name ON competitor_signals(competitor_name);

--   updated_at triggers  
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_company_profiles_updated_at
  BEFORE UPDATE ON company_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_bills_updated_at
  BEFORE UPDATE ON bills
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_assessments_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();