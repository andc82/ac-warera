import { createFileRoute } from "@tanstack/react-router";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, ApiInfo, SectionHeader, fmtMoney, useApiBody, type ApiCall } from "@/components/warera-ui";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Coins } from "lucide-react";

export const Route = createFileRoute("/app/warera/items")({ component: ItemsPage });

function ItemsPage() {
  const defaults = {};
  const { body, apply } = useApiBody<Record<string, unknown>>(defaults);
  const q = useWarEra<Record<string, number>>("/itemTrading.getPrices", body);
  const entries = Object.entries(q.data ?? {}).sort((a, b) => b[1] - a[1]);
  const call: ApiCall = {
    endpoint: "/itemTrading.getPrices", request: body, data: q.data, error: q.error,
    editable: true, defaults, onApply: apply, onReload: () => q.refetch(),
  };

  return (
    <div className="max-w-5xl">
      <PageHeader title="Oggetti & Prezzi" description="Listino prezzi del mercato globale" icon={Coins} />
      <SectionHeader title="Listino" hint={`${entries.length} oggetti`} onRefresh={() => q.refetch()} busy={q.isFetching} />
      {q.isLoading && <LoadingState />}
      {q.error && <ErrorState error={q.error} />}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {entries.map(([code, price]) => (
          <Card key={code} className="py-2.5"><CardHeader className="pb-1 gap-0.5">
            <CardDescription className="uppercase text-[10px] tracking-wider">{code}</CardDescription>
            <CardTitle className="text-base tabular-nums">{fmtMoney(price)}</CardTitle>
          </CardHeader></Card>
        ))}
      </div>
      <ApiInfo calls={[call]} />
    </div>
  );
}
