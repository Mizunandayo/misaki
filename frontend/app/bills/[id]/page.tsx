import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { BillDetailView } from "@/components/bills/BillDetailView";

// Bill detail reflects live assessment/agent state — never statically cache.
export const dynamic = "force-dynamic";

export default async function BillPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ agent?: string }>;
}) {
  const { id } = await params;
  const { agent } = await searchParams;

  let bill;
  try {
    bill = await api.bills.get(id);
  } catch {
    notFound();
  }

const autoAgent = agent === "1";

  return <BillDetailView bill={bill} autoAgent={autoAgent} />;
}
