import { cn } from '@/lib/utils'

// Severity border + text using the design system color tokens
const TONE: Record<string, { border: string; text: string; dot: string }> = {
  CRITICAL:       { border: 'border-[color:var(--color-critical)]/50', text: 'text-[color:var(--color-critical)]',  dot: 'bg-[color:var(--color-critical)]' },
  HIGH:           { border: 'border-[color:var(--color-high)]/50',     text: 'text-[color:var(--color-high)]',      dot: 'bg-[color:var(--color-high)]' },
  MEDIUM:         { border: 'border-[color:var(--color-medium)]/50',   text: 'text-[color:var(--color-medium)]',    dot: 'bg-[color:var(--color-medium)]' },
  LOW:            { border: 'border-[color:var(--color-low)]/50',      text: 'text-[color:var(--color-low)]',       dot: 'bg-[color:var(--color-low)]' },
  NOT_APPLICABLE: { border: 'border-[var(--color-border-medium)]',     text: 'text-[var(--color-paper-200)]',       dot: 'bg-[var(--color-paper-200)]' },
}

export function VerdictBadge({ verdict }: { verdict: string }) {
  const tone = TONE[verdict] ?? TONE.NOT_APPLICABLE
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border px-3.5 py-1.5 text-base font-bold tracking-wider uppercase',
        tone.border,
        tone.text,
      )}
    >
      <span className={cn('h-2 w-2 rounded-full shrink-0', tone.dot)} />
      {verdict.replace('_', ' ')}
    </span>
  )
}

