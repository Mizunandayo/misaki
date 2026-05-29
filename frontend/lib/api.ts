const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
const DEMO_KEY = process.env.NEXT_PUBLIC_DEMO_API_KEY ?? ''






export class ApiError extends Error {
    status: number
    constructor(message: string, status: number) {
        super(message)
        this.status = status
    }
}




async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Demo-Key': DEMO_KEY,
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new ApiError(detail || res.statusText, res.status)
  }
  return res.json() as Promise<T>
}


export const api = {
  bills: {
    list: () => request<{ items: Bill[]; total: number }>(`/api/v1/bills?limit=50`),
    get: (id: string) => request<BillDetail>(`/api/v1/bills/${id}`),
  },
  profile: {
    getDemo: () => request<Profile>(`/api/v1/profile/demo`),
    build: (name: string) =>
      request<AutoDossier>(`/api/v1/profile/build`, {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    update: (patch: Partial<Profile>) =>
      request<Profile>(`/api/v1/profile/demo`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      }),
  },
  assessments: {
    streamUrl: (billId: string) =>
      `${API_URL}/api/v1/assessments/${billId}/stream`,
    run: (billId: string) =>
      request<{ status: string; verdict: string }>(
        `/api/v1/assessments/${billId}/run`,
        { method: 'POST' },
      ),
  },
    intelligence: {
    summary: (windowHours = 168) =>
      request<ModelSummary>(
        `/api/v1/intelligence/summary?window_hours=${windowHours}`,
      ),
  },

}

export type Verdict = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_APPLICABLE'

export interface Bill {
  id: string
  jurisdiction: string
  bill_number: string
  title: string
  status: string
  pass_probability: number
  urgency_score: number
  verdict?: Verdict
  compliance_cost_estimate?: number | null
  effective_date?: string | null
  pass_probability_velocity_7d?: number | null
}


export interface BillDetail extends Bill {
  full_text: string | null
  introduced_at: string | null
  effective_date: string | null
  source_url: string | null
  assessment: Assessment | null
}

export interface Assessment {
  verdict: Verdict
  confidence: number
  reasoning_chain: ReasoningStep[]
  triggering_clause_text: string
  triggering_clause_location: string
  compliance_cost_estimate: number
  affected_operations: AffectedOperation[]
  comparable_bills: Precedent[]
}

export interface ReasoningStep {
  step: number
  observation: string
  inference: string
}

export interface AffectedOperation {
  area: string
  impact: string
  severity: 'high' | 'medium' | 'low'
}

export interface Precedent {
  id: string
  jurisdiction: string
  bill_number: string
  title: string
  similarity: number
}

export interface Profile {
  id: string
  name: string
  industry_tags: string[]
  jurisdictions: string[]
  headcount: number | null
  revenue_band: string | null
  data_handling_classification: string | null
  compliance_certifications: string[]
  tech_stack_indicators: string[]
  profile_confidence_score: number
  profile_gaps: ProfileGap[]
}

export interface ProfileGap {
  field: string
  reason: string
  accuracy_impact_pct: number
}

export interface AutoDossier extends Omit<Profile, 'id'> {
  sources: Record<string, string>
}



export interface ModelSummaryTotals {
  calls: number
  est_cost_usd: number
  avg_latency_ms: number
  providers: number
  models: number
}

export interface CapabilityRow {
  capability: string
  calls: number
  avg_latency_ms: number
  est_cost_usd: number
}

export interface ModelRow {
  provider: string
  model: string
  calls: number
  avg_latency_ms: number
  est_cost_usd: number
  ok: number
  fallbacks: number
  errors: number
}

export interface TaskRow {
  task: string
  provider: string
  model: string
  calls: number
  avg_latency_ms: number
}

export interface RecentCall {
  task: string
  capability: string
  provider: string
  model: string
  status: 'ok' | 'retry' | 'fallback' | 'error'
  latency_ms: number
  cache_hit: boolean
  occurred_at: string
}

export interface ModelSummary {
  window_hours: number
  totals: ModelSummaryTotals
  by_capability: CapabilityRow[]
  by_model: ModelRow[]
  by_task: TaskRow[]
  recent: RecentCall[]
}
