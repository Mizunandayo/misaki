import Link from "next/link";
import { notFound } from "next/navigation";
import { ScannerReportCard } from "@/components/scanner/ScannerReportCard";
import type { ScannerReportRow } from "@/lib/api/scanner";

// Next 16 — fetch() is uncached by default; no need for `cache: "no-store"`.
// Server-side reads the API base URL; the demo key is NOT sent (share endpoint
// is HMAC-token-gated, not demo-key-gated — that's the whole point).
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

interface PageProps {
  params: Promise<{ token: string }>;
}

// Share endpoint returns the report row PLUS the token's own expiry, which
// is distinct from `report.expires_at` (the 7-day scanner_reports cache TTL).
// The 24h share link is what the page header should display.
interface SharedScannerResponse extends ScannerReportRow {
  token_expires_at: string;
}

async function loadReport(token: string): Promise<SharedScannerResponse | null> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/v1/share/scanner/${encodeURIComponent(token)}`);
  } catch {
    return null;
  }
  if (!res.ok) return null;
  try {
    return (await res.json()) as SharedScannerResponse;
  } catch {
    return null;
  }
}

function fmtExpiry(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function SharedScannerReportPage({ params }: PageProps) {
  const { token } = await params;
  const report = await loadReport(token);
  if (!report) notFound();

  return (
    <main
      className="
        min-h-screen bg-ink-950 text-white font-[Poppins]
        flex flex-col
      "
    >
      <header
        className="
          border-b border-white/10
          mx-auto w-full max-w-6xl
          px-6 py-6
          flex flex-wrap items-center justify-between gap-4
        "
      >
        <Link
          href="/"
          className="
            group inline-flex items-center gap-3 cursor-pointer
            transition-colors duration-200
          "
        >
          <span className="text-2xl font-bold tracking-tight text-white">
            見先
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-white">Misaki</span>
            <span className="text-[11px] uppercase tracking-widest text-white/80">
              Shared regulatory exposure report
            </span>
          </span>
        </Link>
        <span className="text-sm text-white/80">
          Link expires {fmtExpiry(report.token_expires_at)}
        </span>
      </header>

      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <ScannerReportCard report={report} />
      </section>

      <section
        className="
          mx-auto w-full max-w-6xl
          px-6 pb-16
        "
      >
        <div
          className="
            rounded-lg border border-white/12 bg-white/[0.02]
            p-6 flex flex-wrap items-center justify-between gap-4
          "
        >
          <div className="flex flex-col">
            <span className="text-base font-semibold text-white">
              Want your own exposure report?
            </span>
            <span className="text-sm text-white/80">
              Misaki scans live SEC EDGAR, press, and lobbying signals in under 25 seconds.
            </span>
          </div>
          <Link
            href="/#public-scanner"
            className="
              inline-flex items-center gap-2 cursor-pointer
              h-10 px-5 rounded-md
              border border-white/15 bg-white text-ink-950
              font-semibold tracking-tight text-sm
              hover:bg-white/95 hover:border-white/30
              transition-colors duration-200
            "
          >
            Scan a company
            <ChevronIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="mt-auto border-t border-white/10">
        <div
          className="
            mx-auto max-w-6xl px-6 py-6
            flex flex-wrap items-center justify-between gap-3
          "
        >
          <span className="text-sm text-white/80">
            Powered by Bright Data MCP, AI/ML API, and the Misaki Intelligence Gateway.
          </span>
          <span className="text-sm text-white/80">
            HMAC-signed link · no login required.
          </span>
        </div>
      </footer>
    </main>
  );
}

function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
