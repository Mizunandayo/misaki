'use client'

import { useEffect, useRef } from 'react'
import { useDashboard } from '@/store/dashboard'
import { useBillRealtime } from '@/hooks/useBillRealtime'
import { Sidebar } from './Sidebar'
import { ThreatFeed } from './ThreatFeed'
import { ActivityPanelRight } from './ActivityPanelRight'
import { EmberPulseOverlay } from './EmberPulseOverlay'
import type { Bill } from '@/lib/api'

export function DashboardShell({ initialBills }: { initialBills: Bill[] }) {

  const billsRef = useRef(initialBills)

  useEffect(() => {
    useDashboard.getState().seed(billsRef.current)
  }, [])

  useBillRealtime()

  return (
    <div className="relative min-h-screen bg-[var(--color-ink-950)]">
      <EmberPulseOverlay />
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_360px]">
        <Sidebar />
        <ThreatFeed />
        <ActivityPanelRight />
      </div>
    </div>
  )
}
