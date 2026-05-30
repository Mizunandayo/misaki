'use client'

import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Inbox } from 'lucide-react'
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
import { StatStrip } from './StatStrip'
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

  // Debounced search — raw input updates instantly, debounced value used for filtering
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleSearch(q: string) {
    setSearchInput(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setSearchQuery(q), 220)
  }

  const visible = useMemo(
    () => visibleBills(bills, order, jurisdictionFilter, severityFilter, searchQuery),
    [bills, order, jurisdictionFilter, severityFilter, searchQuery],
  )
  const exposure = useMemo(() => totalExposure(bills), [bills])
  const counts = useMemo(() => severityCounts(bills), [bills])
  const jurisdictions = useMemo(() => uniqueJurisdictions(bills), [bills])
  const totalBills = Object.keys(bills).length
  const highSeverity = counts.CRITICAL + counts.HIGH
  const monitoring = counts.MEDIUM + counts.LOW

  return (
    <section className="flex h-screen min-h-0 flex-col overflow-y-auto">
      {/* Sticky header bar */}
      <div className="sticky top-0 z-20 border-b border-[var(--color-border-soft)] bg-[var(--color-ink-950)]/80 px-6 py-5 backdrop-blur-xl lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-[1.7rem] font-bold leading-tight tracking-tight text-white">
                Early Warning Feed
              </h1>
              <p className="mt-0.5 text-[14px] font-medium text-white/55">
                Ranked by severity · live via Bright Data MCP
              </p>
            </div>
            <ThreatVelocityBadge highSeverityCount={highSeverity} />
          </div>
          <VisionIngestModal />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-6 px-6 py-7 lg:px-10">
        <StatStrip
          exposure={exposure}
          criticalCount={counts.CRITICAL}
          highCount={counts.HIGH}
          monitoringCount={monitoring}
          totalBills={totalBills}
        />

        <FilterBar
          jurisdictions={jurisdictions}
          jurisdictionFilter={jurisdictionFilter}
          severityFilter={severityFilter}
          onJurisdiction={setJurisdictionFilter}
          onSeverity={setSeverityFilter}
          search={searchInput}
          onSearch={handleSearch}
        />

        {visible.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-[var(--color-border-soft)] py-24">
            <div className="flex flex-col items-center gap-3 text-center">
              <Inbox size={28} strokeWidth={1.5} className="text-white/40" />
              <div className="text-lg font-semibold text-white">
                {searchQuery ? `No bills match "${searchQuery}"` : 'No bills match these filters'}
              </div>
              <p className="max-w-xs text-[14px] font-medium text-white/55">
                {searchQuery
                  ? 'Try a different search term or bill number.'
                  : 'Clear a filter, or wait for the next scrape cycle.'}
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-3.5"
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
      </div>
    </section>
  )
}

