'use client'

import { useRef, useState } from 'react'

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
const DEMO_KEY = process.env.NEXT_PUBLIC_DEMO_API_KEY ?? ''

export type VisionIngestStatus =
  | 'idle'
  | 'uploading'
  | 'extracting'
  | 'complete'
  | 'error'










export interface VisionIngestState {
  status: VisionIngestStatus
  /** Accumulated OCR text so far (grows chunk by chunk). */
  text: string
  billId: string | null
  charCount: number
  error: string | null
  elapsedMs: number
}

export interface UseVisionIngestResult extends VisionIngestState {
  upload: (file: File) => void
  reset: () => void
}

const INITIAL: VisionIngestState = {
  status: 'idle',
  text: '',
  billId: null,
  charCount: 0,
  error: null,
  elapsedMs: 0,
}

export function useVisionIngest(): UseVisionIngestResult {
  const [state, setState] = useState<VisionIngestState>(INITIAL)
  const abortRef = useRef<AbortController | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function reset() {
    abortRef.current?.abort()
    if (timerRef.current) clearInterval(timerRef.current)
    setState(INITIAL)
  }

  function upload(file: File) {
    abortRef.current?.abort()
    if (timerRef.current) clearInterval(timerRef.current)

    const ac = new AbortController()
    abortRef.current = ac

    setState({ ...INITIAL, status: 'uploading' })
    // Date.now() and setInterval moved into runStream (async) so the React
    // Compiler does not flag them as impure calls during render.
    void runStream(file, ac)
  }

  async function runStream(file: File, ac: AbortController) {
    // Safe: async function bodies are not considered render-time by the React
    // Compiler. Date.now() and setInterval are allowed here.
    const startMs = Date.now()

    timerRef.current = setInterval(() => {
      setState((prev) =>
        prev.status === 'uploading' || prev.status === 'extracting'
          ? { ...prev, elapsedMs: Date.now() - startMs }
          : prev,
      )
    }, 100)

    const form = new FormData()
    form.append('file', file)

    let response: Response
    try {
      response = await fetch(`${BASE}/api/v1/bills/ingest/vision`, {
        method: 'POST',
        headers: { 'X-Demo-Key': DEMO_KEY },
        body: form,
        signal: ac.signal,
      })
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
      if (timerRef.current) clearInterval(timerRef.current)
      setState((p) => ({ ...p, status: 'error', error: 'Network error — is the backend running?' }))
      return
    }

    if (!response.ok) {
      if (timerRef.current) clearInterval(timerRef.current)
      const msg = await response.text().catch(() => response.statusText)
      setState((p) => ({ ...p, status: 'error', error: msg }))
      return
    }

    setState((p) => ({ ...p, status: 'extracting' }))

    // Parse the POST-SSE response body manually — EventSource only supports GET.
    // We use the WHATWG Streams API (ReadableStream) to decode line-by-line.
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buf = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })

        // Split on SSE event boundaries (\n\n)
        const parts = buf.split('\n\n')
        buf = parts.pop() ?? ''

        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data: ')) continue
          let evt: { type: string; text?: string; bill_id?: string; char_count?: number; message?: string }
          try {
            evt = JSON.parse(line.slice(6))
          } catch {
            continue
          }

          if (evt.type === 'chunk' && evt.text) {
            setState((prev) => ({ ...prev, text: prev.text + evt.text! }))
          } else if (evt.type === 'complete') {
            if (timerRef.current) clearInterval(timerRef.current)
            setState((prev) => ({
              ...prev,
              status: 'complete',
              billId: evt.bill_id ?? null,
              charCount: evt.char_count ?? prev.text.length,
              elapsedMs: Date.now() - startMs,
            }))
          } else if (evt.type === 'error') {
            if (timerRef.current) clearInterval(timerRef.current)
            setState((prev) => ({
              ...prev,
              status: 'error',
              error: evt.message ?? 'OCR failed',
            }))
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        if (timerRef.current) clearInterval(timerRef.current)
        setState((p) => ({
          ...p,
          status: 'error',
          error: 'Stream interrupted',
        }))
      }
    }
  }

  return { ...state, upload, reset }
}