'use client'

import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useShallow } from 'zustand/react/shallow'
import {
  useDashboard,
  visibleBills,
  totalExposure,
  severityCounts,
  uniqueJurisdictions,
} from '@/store/dashboard'
import { BillCard } from './BillCard'
import { FilterBar } from './FilterBar'
import { ThreatVelocityBadge } from './ThreatVelocityBadge'
import { TotalExposureScore } from './TotalExposureScore'
import { staggerContainer, staggerItem } from '@/lib/motion'
import { VisionIngestModal } from '@/components/ingest/VisionIngestModal'








export function ThreatFeed() {
  const { bills, order, jurisdictionFilter, severityFilter } = useDashboard(
    useShallow((s) => ({
      bills: s.bills,
      order: s.order,
      jurisdictionFilter: s.jurisdictionFilter,
      severityFilter: s.severityFilter,
    })),
  )
  const setJurisdictionFilter = useDashboard((s) => s.setJurisdictionFilter)
  const setSeverityFilter = useDashboard((s) => s.setSeverityFilter)

  const visible = useMemo(
    () => visibleBills(bills, order, jurisdictionFilter, severityFilter),
    [bills, order, jurisdictionFilter, severityFilter],
  )
  const exposure = useMemo(() => totalExposure(bills), [bills])
  const counts = useMemo(() => severityCounts(bills), [bills])
  const jurisdictions = useMemo(() => uniqueJurisdictions(bills), [bills])
  const highSeverity = counts.CRITICAL + counts.HIGH








  return (
    <section className="flex min-h-screen flex-col gap-6 overflow-y-auto px-6 py-7 lg:px-10">
      <header className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>

            <div className="flex flex-wrap items-end justify-between gap-5">
  <div>
    <div className="flex items-center gap-4">
      <h1 className="text-3xl font-bold tracking-tight text-white">Early Warning Feed</h1>
      <VisionIngestModal />
    </div>
    <p className="mt-1 text-base font-medium text-white/70">
      Ranked by composite urgency · live via Bright Data MCP
    </p>
  </div>
  <TotalExposureScore value={exposure} billCount={Object.keys(bills).length} />
</div>

          </div>
          <TotalExposureScore value={exposure} billCount={Object.keys(bills).length} />
        </div>
        <ThreatVelocityBadge highSeverityCount={highSeverity} />
        <FilterBar
          jurisdictions={jurisdictions}
          jurisdictionFilter={jurisdictionFilter}
          severityFilter={severityFilter}
          onJurisdiction={setJurisdictionFilter}
          onSeverity={setSeverityFilter}
        />
      </header>

      {visible.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-[var(--color-border-soft)] py-20">
          <div className="text-center">
            <div className="text-lg font-semibold text-white">No bills match these filters</div>
            <p className="mt-1 text-base font-medium text-white/70">
              Clear a filter, or wait for the next Bright Data scrape cycle.
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-4"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((bill) => (
              <motion.div key={bill.id} variants={staggerItem} layout>
                <BillCard bill={bill} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  )
}
