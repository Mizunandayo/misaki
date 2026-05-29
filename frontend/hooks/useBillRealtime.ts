'use client'

import { useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useDashboard } from '@/store/dashboard'
import type { Bill, Verdict } from '@/lib/api'



const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const VERDICTS: ReadonlySet<string> = new Set([
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
  'NOT_APPLICABLE',
])









function coerceBill(row: unknown): Bill | null {
  if (typeof row !== 'object' || row === null) return null
  const r = row as Record<string, unknown>

  const id = r.id
  const jurisdiction = r.jurisdiction
  const bill_number = r.bill_number
  const title = r.title
  const status = r.status
  if (
    typeof id !== 'string' ||
    typeof jurisdiction !== 'string' ||
    typeof bill_number !== 'string' ||
    typeof title !== 'string' ||
    typeof status !== 'string'
  ) {
    return null
  }

  const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0)
  const numOrNull = (v: unknown): number | null =>
    typeof v === 'number' && Number.isFinite(v) ? v : null
  const strOrNull = (v: unknown): string | null => (typeof v === 'string' ? v : null)
  const verdict: Verdict | undefined =
    typeof r.verdict === 'string' && VERDICTS.has(r.verdict) ? (r.verdict as Verdict) : undefined

  return {
    id,
    jurisdiction,
    bill_number,
    title,
    status,
    pass_probability: num(r.pass_probability),
    urgency_score: num(r.urgency_score),
    verdict,
    compliance_cost_estimate: numOrNull(r.compliance_cost_estimate),
    effective_date: strOrNull(r.effective_date),
    pass_probability_velocity_7d: numOrNull(r.pass_probability_velocity_7d),
  }
}




export function useBillRealtime() {
  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON) return

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
      realtime: { params: { eventsPerSecond: 5 } },
      auth: { persistSession: false },
    })

    const channel = supabase
      .channel('misaki-bills-feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bills' },
        (payload) => {
          const bill = coerceBill(payload.new)
          if (bill) useDashboard.getState().upsertBill(bill)
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])
}
