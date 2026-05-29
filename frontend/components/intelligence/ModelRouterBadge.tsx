import { cn } from '@/lib/utils'

const PROVIDER_LABEL: Record<string, string> = {
  aiml: 'AI/ML API',
  gemini: 'Gemini',
  google: 'Gemini',
}




/** Inline "model via provider" chip. AI/ML rows get a brighter border so the
 *  hero provider reads first. */
export function ModelRouterBadge({
  provider,
  model,
  className,
}: {
  provider: string
  model: string
  className?: string
}) {
  const key = provider.toLowerCase()
  const label = PROVIDER_LABEL[key] ?? provider
  const hero = key === 'aiml'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
        'text-[14px] font-semibold text-white',
        className,
      )}
      style={{
        borderColor: hero ? 'rgba(255,255,255,0.38)' : 'var(--color-border-soft)',
        background: hero ? 'rgba(255,255,255,0.05)' : 'transparent',
      }}
    >
      <span className="num-mono">{model}</span>
      <span className="text-white/55">via</span>
      <span>{label}</span>
    </span>
  )
}
