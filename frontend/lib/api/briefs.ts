const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const DEMO_KEY = process.env.NEXT_PUBLIC_DEMO_API_KEY ?? "";





//  Event types emitted by the SSE stream 





export type BriefStep =
  | "assembling_context"
  | "generating_analysis"
  | "rendering_document"
  | "uploading"
  | "complete"
  | "error";

export interface BriefProgressEvent {
  step: BriefStep;
}

export interface BriefCompleteEvent {
  step: "complete";
  brief_id: string;
  signed_url: string;
  exposure_usd: number;
  pages: number;
  bill_title: string;
  bill_jurisdiction: string;
  bill_number: string;
  verdict: string | null;
  total_gaps: number;
  content_hash: string;
}

export interface BriefErrorEvent {
  step: "error";
  message: string;
}

export type BriefEvent = BriefProgressEvent | BriefCompleteEvent | BriefErrorEvent;

// Stream via fetch POST (EventSource = GET only)

export function streamBriefGeneration(billId: string): ReadableStream<BriefEvent> {
  return new ReadableStream<BriefEvent>({
    async start(controller) {
      let response: Response;
      try {
        response = await fetch(`${API_BASE}/api/v1/briefs/${billId}/generate`, {
          method: "POST",
          headers: { "X-Demo-Key": DEMO_KEY },
        });
      } catch (err) {
        controller.enqueue({ step: "error", message: "Network error — is the backend running?" } as BriefErrorEvent);
        controller.close();
        return;
      }

      if (!response.ok || !response.body) {
        controller.enqueue({ step: "error", message: `Server error: HTTP ${response.status}` } as BriefErrorEvent);
        controller.close();
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const event = JSON.parse(line.slice(6)) as BriefEvent;
              controller.enqueue(event);
              if (event.step === "complete" || event.step === "error") {
                controller.close();
                return;
              }
            } catch {
              // skip malformed SSE line
            }
          }
        }
      } finally {
        reader.releaseLock();
        if (!controller.desiredSize) return; // already closed
        controller.close();
      }
    },
  });
}

export async function getLatestBrief(billId: string): Promise<BriefCompleteEvent | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/briefs/${billId}/latest`, {
      headers: { "X-Demo-Key": DEMO_KEY },
    });
    if (!res.ok) return null;
    return (await res.json()) as BriefCompleteEvent;
  } catch {
    return null;
  }
}
