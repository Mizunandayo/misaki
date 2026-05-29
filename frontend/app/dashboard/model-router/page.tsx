import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ModelRouterPanel } from '@/components/intelligence/ModelRouterPanel'

export const dynamic = 'force-dynamic'

export default function ModelRouterPage() {
  return (
    <div className="min-h-screen bg-[var(--color-ink-950)]">
      <div className="nav-glass sticky top-0 z-30 border-b border-[var(--color-border-soft)]">
        <div className="mx-auto flex max-w-[1100px] items-center px-6 py-4">
          <Link
            href="/dashboard"
            className="group inline-flex cursor-pointer items-center gap-2 text-base font-semibold text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft size={18} strokeWidth={2} className="transition-transform group-hover:-translate-x-0.5" />
            Back to feed
          </Link>
        </div>
      </div>
      <main className="mx-auto max-w-[1100px] px-6 py-10">
        <ModelRouterPanel />
      </main>
    </div>
  )
}
