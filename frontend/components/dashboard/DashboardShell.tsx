'use client'

import { useDashboard } from '@/store/dashboard'
import { useBillRealtime } from '@/hooks/useBillRealtime'
import { Sidebar } from './Sidebar'
import { ActivityPanelRight } from './ActivityPanelRight'
import { EmberPulseOverlay } from './EmberPulseOverlay'
import type { Bill } from '@/lib/api'

interface DashboardShellProps {
  initialBills: Bill[]
  children: React.ReactNode
}

export function DashboardShell({ initialBills, children }: DashboardShellProps) {

  // Seed synchronously during render so child client pages read store data on
  // their very first render — no useEffect delay, no empty-then-populated flash.
  if (useDashboard.getState().order.length === 0 && initialBills.length > 0) {
    useDashboard.getState().seed(initialBills)
  }

  useBillRealtime()

  return (
    <div className="relative h-screen overflow-hidden bg-[var(--color-ink-950)]">
      <EmberPulseOverlay />
      <div className="grid h-screen grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_360px]">
        <Sidebar />
        <main className="min-h-0 overflow-y-auto">
          {children}
        </main>
        <ActivityPanelRight />
      </div>
    </div>
  )
}
