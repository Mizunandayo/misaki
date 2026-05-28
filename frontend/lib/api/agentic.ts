const BASE = process.env.NEXT_PUBLIC_API_BASE_URl!;
const DEMO_KEY = process.env.NEXT_PUBLIC_DEMO_API_KEY!;



export interface LawFirm {
  name: string;
  headline: string;
  jurisdiction: string;
  practice_areas: string[];
  relevant_case_history: string;
  website: string;
  relevance_score: number;
}

export interface BriefSection {
  heading: string;
  body_markdown: string;
}



export interface LobbyistBriefDraft {
  addressed_to: string;
  subject_line: string;
  one_line_position: string;
  sections: BriefSection[];
  recommended_amendment: string;
  rationale_summary: string;
}







export interface CompetitorMove {
  competitor: string;
  action: string;
  timing_relative_days: number;
  public_url: string | null;
}









export interface CompetitiveResponseStrategy {
  precedent_bill: string;
  competitor_moves: CompetitorMove[];
  recommended_play:
    | "PROACTIVE_PUBLIC_SUPPORT"
    | "PROACTIVE_QUIET_INVESTMENT"
    | "REACTIVE_WAIT_AND_SEE"
    | "OPPOSE_AND_AMEND";
  recommendation_summary: string;
  confidence: number;
}








export interface ActionPackagePayload {
  bill_id: string;
  company_id: string;
  law_firms: { query: string; firms: LawFirm[]; sources_scanned: number };
  lobbyist_brief: LobbyistBriefDraft;
  competitive_strategy: CompetitiveResponseStrategy;
  executive_summary: string;
}

export interface ActionPackageRow {
  id: string;
  bill_id: string;
  company_id: string;
  run_id: string | null;
  payload: ActionPackagePayload;
  created_at: string;
}

export async function startAgenticRun(billId: string): Promise<{ run_id: string }> {
  const res = await fetch(`${BASE}/api/v1/agentic/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Demo-Key": DEMO_KEY },
    body: JSON.stringify({ bill_id: billId }),
  });
  if (!res.ok) throw new Error(`Agent kick-off failed: ${res.status}`);
  return res.json();
}

export async function fetchPackageByRun(runId: string): Promise<ActionPackageRow> {
  const res = await fetch(`${BASE}/api/v1/agentic/runs/${runId}/package`, {
    headers: { "X-Demo-Key": DEMO_KEY },
  });
  if (!res.ok) throw new Error("Package not ready");
  return res.json();
}