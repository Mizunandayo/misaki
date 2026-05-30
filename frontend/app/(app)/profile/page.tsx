'use client'

// Client-side fetch: no server waterfall on navigation. Profile data is fetched
// once on mount and cached in component state for the session.

import { useEffect, useState } from 'react'
import { api, type Profile } from '@/lib/api'
import { ProfileView } from '@/components/profile/ProfileView'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    api.profile.getDemo().then(setProfile).catch(console.error)
  }, [])

  if (!profile) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 space-y-8 animate-pulse">
        <div className="space-y-3">
          <div className="h-10 w-72 rounded-lg bg-white/[0.06]" />
          <div className="h-5 w-[480px] rounded bg-white/[0.04]" />
        </div>
        <div className="h-40 rounded-xl bg-white/[0.04]" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 rounded-xl bg-white/[0.04]" />
          <div className="h-32 rounded-xl bg-white/[0.04]" />
        </div>
      </div>
    )
  }

  return <ProfileView initial={profile} />
}
