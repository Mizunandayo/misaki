import type { Verdict } from '@/lib/api'

const USD_FULL = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})





/** Compact dollars for cards/badges: $4.2M, $340K, $920. */
export function formatUsd(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—'
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `$${Math.round(n / 1_000)}K`
  return USD_FULL.format(n)
}




/** Full dollars for the exposure header count-up. */
export function formatUsdFull(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—'
  return USD_FULL.format(n)
}




export interface SeverityMeta {
  label: string
  /** CSS color (a var from globals.css). */
  color: string
  /** rgba glow used for rings/shadows. */
  ring: string
}




/**
 * Severity is the ONLY color in the monochrome system. Values come straight*/
export const SEVERITY: Record<Verdict, SeverityMeta> = {
  CRITICAL: { label: 'Critical', color: 'var(--color-critical)', ring: 'rgba(239, 68, 68, 0.55)' },
  HIGH: { label: 'High', color: 'var(--color-high)', ring: 'rgba(249, 115, 22, 0.50)' },
  MEDIUM: { label: 'Medium', color: 'var(--color-medium)', ring: 'rgba(251, 191, 36, 0.45)' },
  LOW: { label: 'Low', color: 'var(--color-low)', ring: 'rgba(34, 168, 153, 0.45)' },
  NOT_APPLICABLE: { label: 'Cleared', color: 'rgba(255, 255, 255, 0.62)', ring: 'rgba(255, 255, 255, 0.20)' },
}




export function severityOf(verdict: Verdict | undefined): SeverityMeta {
  return SEVERITY[verdict ?? 'NOT_APPLICABLE']
}




/** Whole-day countdown to an ISO date. Null when unknown/invalid. */
export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return null
  return Math.round((t - Date.now()) / 86_400_000)
}




export function daysUntilLabel(iso: string | null | undefined): string {
  const d = daysUntil(iso)
  if (d == null) return 'No date'
  if (d < 0) return `${Math.abs(d)}d overdue`
  if (d === 0) return 'Due today'
  return `${d}d to enact`
}




/**
 * SECURITY: bill.source_url is scraped from the open web — untrusted.
 */
export function safeExternalUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  try {
    const u = new URL(raw)
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null
  } catch {
    return null
  }
}
