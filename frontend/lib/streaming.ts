'use client'

import { useEffect, useRef, useState } from 'react'

export type StreamEvent =
  | { type: 'started'; bill_id: string }
  | { type: 'node'; name: string }
  | { type: 'triage'; passed: boolean; confidence: number; reason: string }
  | { type: 'reasoning_step'; step: number; observation: string; inference: string }
  | {
      type: 'verdict'
      verdict: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_APPLICABLE'
      confidence: number
      triggering_clause_text: string
      triggering_clause_location: string
      compliance_cost_estimate_usd: number
      affected_operations: { area: string; impact: string; severity: string }[]
      legal_precedent: string
      precedents: {
        id: string
        jurisdiction: string
        bill_number: string
        title: string
        similarity: number
      }[]
      probability: { score: number; velocity_7d: number; velocity_direction: string } | null
    }
  | { type: 'skipped'; reason: string }
  | { type: 'done' }
  | { type: 'error'; message: string }

interface StreamState {
  events: StreamEvent[]
  done: boolean
  error: string | null
}

const INITIAL: StreamState = { events: [], done: false, error: null }

export function useAssessmentStream(url: string | null) {
  const [state, setState] = useState<StreamState>(INITIAL)
  const [trackedUrl, setTrackedUrl] = useState<string | null>(url)
  const sourceRef = useRef<EventSource | null>(null)

  // React-approved pattern: reset derived state during render when an
  // input changes. See https://react.dev/reference/react/useState
  if (url !== trackedUrl) {
    setTrackedUrl(url)
    setState(INITIAL)
  }

  useEffect(() => {
    if (!url) return

    const source = new EventSource(url, { withCredentials: false })
    sourceRef.current = source

    source.onmessage = (msg) => {
      try {
        const parsed = JSON.parse(msg.data) as StreamEvent
        const isTerminal = parsed.type === 'done' || parsed.type === 'error'
        setState((prev) => ({
          events: [...prev.events, parsed],
          done: isTerminal ? true : prev.done,
          error: parsed.type === 'error' ? parsed.message : prev.error,
        }))
        if (isTerminal) source.close()
      } catch {
        // ignore malformed messages
      }
    }

    source.onerror = () => {
      source.close()
      setState((prev) => ({
        ...prev,
        done: true,
        error: prev.error ?? 'Connection closed',
      }))
    }

    return () => {
      source.close()
    }
  }, [url])

  return {
    events: state.events,
    done: state.done,
    error: state.error,
    close: () => sourceRef.current?.close(),
  }
}
