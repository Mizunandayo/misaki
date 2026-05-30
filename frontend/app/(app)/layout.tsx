import { api, type Bill } from '@/lib/api'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

async function getInitialBills(): Promise<Bill[]> {
  try {
    const { items } = await api.bills.list()
    return items
  } catch {
    return []
  }
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const bills = await getInitialBills()
  return <DashboardShell initialBills={bills}>{children}</DashboardShell>
}
