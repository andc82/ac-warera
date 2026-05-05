import { createFileRoute } from "@tanstack/react-router";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, JsonBlock, fmtNum } from "@/components/warera-ui";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Coins } from "lucide-react";

export const Route = createFileRoute("/app/warera/items")({ component: ItemsPage });

interface Price { itemCode?: string; price?: number; supply?: number }

function ItemsPage() {
  const { data, isLoading, error } = useWarEra<Price[] | Record<string, Price>>("/itemTrading.getPrices", {});
  const arr = Array.isArray(data) ? data : Object.values(data ?? {});

  return (
    <div className="max-w-5xl">
      <PageHeader title="Oggetti & Prezzi" description="Listino prezzi del mercato globale" icon={Coins} />
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {arr.map((p, i) => (
            <Card key={p.itemCode ?? i}>
              <CardHeader className="pb-2">
                <CardDescription className="uppercase text-[11px] tracking-wider">{p.itemCode ?? `#${i}`}</CardDescription>
                <CardTitle className="text-xl tabular-nums">{fmtNum(p.price)}</CardTitle>
              </CardHeader>
              {p.supply != null && <CardContent className="pt-0 text-xs text-muted-foreground">Supply: {fmtNum(p.supply)}</CardContent>}
            </Card>
          ))}
        </div>
      )}
      {data && <details className="mt-4"><summary className="text-sm text-muted-foreground cursor-pointer">JSON raw</summary><JsonBlock data={data} /></details>}
    </div>
  );
}
