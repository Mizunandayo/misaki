import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Bill, Verdict } from '@/lib/api'





export type SeverityFilter = Verdict | 'ALL'
export type JurisdictionFilter = string | 'ALL'








interface CriticalPulse {
  active: boolean
  billId: string | null
  nonce: number
}




interface DashboardState {
  bills: Record<string, Bill>
  order: string[]
  jurisdictionFilter: JurisdictionFilter
  severityFilter: SeverityFilter
  selectedBillId: string | null
  criticalPulse: CriticalPulse

  seed: (bills: Bill[]) => void
  upsertBill: (bill: Bill) => void
  setJurisdictionFilter: (j: JurisdictionFilter) => void
  setSeverityFilter: (s: SeverityFilter) => void
  selectBill: (id: string | null) => void
  clearPulse: () => void
}




// CRITICAL → HIGH → MEDIUM → LOW → NOT_APPLICABLE → unanalyzed
const VERDICT_RANK: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
  NOT_APPLICABLE: 4,
}

function byUrgencyDesc(bills: Record<string, Bill>): string[] {
  return Object.values(bills)
    .sort((a, b) => {
      const ra = VERDICT_RANK[a.verdict ?? ''] ?? 5
      const rb = VERDICT_RANK[b.verdict ?? ''] ?? 5
      if (ra !== rb) return ra - rb
      return b.urgency_score - a.urgency_score
    })
    .map((b) => b.id)
}




export const useDashboard = create<DashboardState>()(
  immer((set) => ({
    bills: {},
    order: [],
    jurisdictionFilter: 'ALL',
    severityFilter: 'ALL',
    selectedBillId: null,
    criticalPulse: { active: false, billId: null, nonce: 0 },

    seed: (incoming) =>
      set((state) => {
        state.bills = {}
        for (const b of incoming) state.bills[b.id] = b
        state.order = byUrgencyDesc(state.bills)
      }),

    upsertBill: (bill) =>
      set((state) => {
        const prev = state.bills[bill.id]
        state.bills[bill.id] = bill
        state.order = byUrgencyDesc(state.bills)
        const becameCritical =
          bill.verdict === 'CRITICAL' && prev?.verdict !== 'CRITICAL'
        if (becameCritical) {
          state.criticalPulse = {
            active: true,
            billId: bill.id,
            nonce: state.criticalPulse.nonce + 1,
          }
        }
      }),

    setJurisdictionFilter: (j) =>
      set((state) => {
        state.jurisdictionFilter = j
      }),

    setSeverityFilter: (s) =>
      set((state) => {
        state.severityFilter = s
      }),

    selectBill: (id) =>
      set((state) => {
        state.selectedBillId = id
      }),

    clearPulse: () =>
      set((state) => {
        state.criticalPulse.active = false
      }),
  })),
)




export function visibleBills(
  bills: Record<string, Bill>,
  order: string[],
  jurisdiction: JurisdictionFilter,
  severity: SeverityFilter,
  search = '',
): Bill[] {
  const q = search.trim().toLowerCase()
  return order
    .map((id) => bills[id])
    .filter((b): b is Bill => Boolean(b))
    .filter((b) => jurisdiction === 'ALL' || b.jurisdiction === jurisdiction)
    .filter(
      (b) => severity === 'ALL' || (b.verdict ?? 'NOT_APPLICABLE') === severity,
    )
    .filter((b) =>
      q === '' ||
      b.title.toLowerCase().includes(q) ||
      b.bill_number.toLowerCase().includes(q) ||
      b.jurisdiction.toLowerCase().includes(q),
    )
}


export function totalExposure(bills: Record<string, Bill>): number {
  return Object.values(bills).reduce(
    (sum, b) => sum + (b.compliance_cost_estimate ?? 0),
    0,
  )
}




export function severityCounts(
  bills: Record<string, Bill>,
): Record<Verdict, number> {
  const counts: Record<Verdict, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    NOT_APPLICABLE: 0,
  }
  for (const b of Object.values(bills)) counts[b.verdict ?? 'NOT_APPLICABLE']++
  return counts
}




export function uniqueJurisdictions(bills: Record<string, Bill>): string[] {
  return Array.from(new Set(Object.values(bills).map((b) => b.jurisdiction))).sort()
}
