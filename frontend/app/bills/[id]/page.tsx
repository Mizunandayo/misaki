import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { BillStreamView } from "@/components/bills/BillStreamView";
import { AgenticPanel } from "@/components/agent/AgenticPanel";

export default async function BillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let bill;
  try {
    bill = await api.bills.get(id);
  } catch {
    notFound();
  }
  return (
    <div className="flex flex-col gap-10">
      <BillStreamView bill={bill} />
      <AgenticPanel billId={id} />
    </div>
  );
}
