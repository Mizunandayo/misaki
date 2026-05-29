import { api, type Bill } from '@/lib/api'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

// Bills change on every scrape cycle — never statically cache this page.
export const dynamic = 'force-dynamic'

async function getInitialBills(): Promise<Bill[]> {
  try {
    const { items } = await api.bills.list()
    return items
  } catch {
    // Backend down or cold start: render the shell empty rather than 500 the page.
    return []
  }
}

export default async function DashboardPage() {
  const bills = await getInitialBills()
  return <DashboardShell initialBills={bills} />
}
