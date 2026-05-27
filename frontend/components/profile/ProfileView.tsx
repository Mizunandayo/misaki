'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { api, type Profile, type AutoDossier } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { ProfileConfidenceGauge } from '@/components/profile/ProfileConfidenceGauge'
import { ProfileGapAlert } from '@/components/profile/ProfileGapAlert'

export function ProfileView({ initial }: { initial: Profile }) {
  const [profile, setProfile] = useState<Profile | AutoDossier>(initial)
  const [building, setBuilding] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onBuild(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBuilding(true)
    try {
      const dossier = await api.profile.build(name.trim())
      setProfile(dossier)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Build failed')
    } finally {
      setBuilding(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-20 space-y-12">
      <header>
        <h1 className="text-4xl font-bold text-[var(--color-paper-50)]">
          Company Intelligence Profile
        </h1>
        <p className="mt-3 text-lg text-[var(--color-paper-200)] max-w-3xl">
          The applicability lens for every Misaki analysis. Build it automatically
          from a company name — Bright Data scrapes LinkedIn, Crunchbase, and SEC
          EDGAR, then Gemini synthesizes the profile.
        </p>
      </header>

      <section className="rounded-xl border border-[var(--color-border-medium)] bg-[var(--color-ink-900)] p-8">
        <div className="text-sm font-semibold uppercase tracking-wider text-[var(--color-paper-200)] mb-4">
          Auto-build from name
        </div>
        <form onSubmit={onBuild} className="flex flex-wrap gap-3 items-center">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Stripe"
            maxLength={80}
            className="flex-1 min-w-[260px] h-12 rounded-md border border-[var(--color-border-medium)] bg-[var(--color-ink-800)] px-4 text-base text-[var(--color-paper-50)] placeholder:text-[var(--color-paper-300)] focus:border-[var(--color-paper-50)]/60 focus:outline-none transition-colors"
          />
          <Button type="submit" size="md" disabled={building || name.trim().length < 2}>
            {building ? 'Building…' : 'Build profile'}
          </Button>
        </form>
        {error && (
          <div className="mt-4 text-sm text-[color:var(--color-critical)]">{error}</div>
        )}
      </section>

      <motion.section
        layout
        className="grid lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 space-y-6">
          <ProfileField label="Name" value={profile.name} />
          <ProfileField label="Industry" value={profile.industry_tags.join(' · ')} />
          <ProfileField label="Operating jurisdictions" value={profile.jurisdictions.join(' · ')} />
          <ProfileField
            label="Headcount"
            value={profile.headcount?.toLocaleString() ?? 'Unknown'}
          />
          <ProfileField label="Revenue band" value={profile.revenue_band ?? 'Unknown'} />
          <ProfileField
            label="Data handling"
            value={profile.data_handling_classification ?? 'Unknown'}
          />
          <ProfileField
            label="Compliance certifications"
            value={profile.compliance_certifications.join(' · ') || 'None on file'}
          />
        </div>
        <div className="space-y-6">
          <ProfileConfidenceGauge score={profile.profile_confidence_score} />
          <ProfileGapAlert gaps={profile.profile_gaps} />
        </div>
      </motion.section>
    </main>
  )
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[var(--color-border-soft)] pb-4">
      <div className="text-sm font-semibold uppercase tracking-wider text-[var(--color-paper-200)]">
        {label}
      </div>
      <div className="mt-2 text-lg text-[var(--color-paper-50)]">{value}</div>
    </div>
  )
}
