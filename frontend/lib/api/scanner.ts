// frontend/lib/api/scanner.ts
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";






export interface ScannerThreat {
  jurisdiction: string;
  bill_or_program: string;
  title: string;
  urgency_label: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  one_line_reason: string;
  source_url: string | null;
}




export interface ScannerReportRow {
  id: string;
  company_name_display: string;
  exposure_score: number;
  total_exposure_low_usd: number;
  total_exposure_high_usd: number;
  top_threats: ScannerThreat[];
  strategic_summary: string;
  raw_sec_excerpt: string;
  run_id: string | null;
  created_at: string;
  expires_at: string;
}


export interface ScannerStartResponse {
  run_id: string;
  cached: boolean;
  report_id: string | null;
}

export interface ShareLinkResponse {
  token: string;
  path: string;
  expires_at: string;
}

export async function startScan(name: string): Promise<ScannerStartResponse> {
  const res = await fetch(`${BASE}/api/v1/scanner`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    if (res.status === 429) throw new Error("Scanner rate-limited. Try in a minute.");
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail ?? `Scan failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchReport(reportId: string): Promise<ScannerReportRow> {
  const res = await fetch(`${BASE}/api/v1/scanner/${reportId}`);
  if (!res.ok) throw new Error("Report not ready");
  return res.json();
}

export async function mintShareLink(reportId: string): Promise<ShareLinkResponse> {
  const res = await fetch(`${BASE}/api/v1/scanner/${reportId}/share`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Could not mint share link");
  return res.json();
}
