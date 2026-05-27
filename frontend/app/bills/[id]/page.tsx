import { notFound } from 'next/navigation'
import { api } from '@/lib/api'
import { BillStreamView } from '@/components/bills/BillStreamView'

export default async function BillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let bill
  try {
    bill = await api.bills.get(id)
  } catch {
    notFound()
  }
  return <BillStreamView bill={bill} />
}
