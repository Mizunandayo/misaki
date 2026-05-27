import { cn } from '@/lib/utils'

const TONE: Record<string, string> = {
  CRITICAL: 'text-[color:var(--color-critical)] border-[color:var(--color-critical)]/40',
  HIGH:     'text-[color:var(--color-high)] border-[color:var(--color-high)]/40',
  MEDIUM:   'text-[color:var(--color-medium)] border-[color:var(--color-medium)]/40',
  LOW:      'text-[color:var(--color-low)] border-[color:var(--color-low)]/40',
  NOT_APPLICABLE: 'text-[var(--color-paper-200)] border-[var(--color-border-medium)]',
}


export function VerdictBadge({ verdict }: { verdict: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1.5 rounded-md border text-sm font-bold tracking-wider uppercase',
        TONE[verdict] ?? TONE.NOT_APPLICABLE,
      )}
    >
      {verdict.replace('_', ' ')}
    </span>
  )
}
