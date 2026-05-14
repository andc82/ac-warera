import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, ApiInfo, SectionHeader, CountryLink, RegionLink, fmtNum, fmtRelative, useApiBody, type ApiCall } from "@/components/warera-ui";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Swords } from "lucide-react";

export const Route = createFileRoute("/app/warera/battles/")({ component: BattlesPage });

interface Battle {
  _id?: string; isActive?: boolean; type?: string; war?: string; createdAt?: string; roundsToWin?: number;
  attacker?: { country?: string; region?: string; damages?: number; hitCount?: number; wonRoundsCount?: number };
  defender?: { country?: string; region?: string; damages?: number; hitCount?: number; wonRoundsCount?: number };
}

function BattlesPage() {
  const [tab, setTab] = useState<"active" | "all">("active");
  const defaults = tab === "active" ? { isActive: true, limit: 30 } : { limit: 30 };
  const { body, apply } = useApiBody<Record<string, unknown>>(defaults);
  const q = useWarEra<{ items?: Battle[] }>("/battle.getBattles", body);
  const call: ApiCall = {
    endpoint: "/battle.getBattles", request: body, data: q.data, error: q.error,
    editable: true, defaults, onApply: apply, onReload: () => q.refetch(),
  };

  return (
    <div className="max-w-6xl">
      <PageHeader title="Battaglie & Guerre" description="Conflitti in corso e storici" icon={Swords} />
      <Tabs value={tab} onValueChange={(v) => setTab(v as "active" | "all")} className="mb-3">
        <TabsList><TabsTrigger value="active">Attive</TabsTrigger><TabsTrigger value="all">Tutte</TabsTrigger></TabsList>
      </Tabs>
      <SectionHeader title={tab === "active" ? "Attive" : "Tutte"} hint={`${q.data?.items?.length ?? 0}`} onRefresh={() => q.refetch()} busy={q.isFetching} />
      {q.isLoading && <LoadingState />}
      {q.error && <ErrorState error={q.error} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {(q.data?.items ?? []).map((b) => (
          <Link key={b._id} to="/app/warera/battles/$id" params={{ id: b._id ?? "" }}
            className="rounded-md border border-border bg-muted/10 p-3 hover:border-primary/60">
            <div className="flex items-center justify-between text-xs mb-1">
              {b.isActive ? <span className="text-success font-semibold">● ATTIVA</span> : <span className="text-muted-foreground">conclusa</span>}
              <span className="text-muted-foreground">{fmtRelative(b.createdAt)}</span>
            </div>
            <div className="text-sm font-medium">
              <CountryLink id={b.attacker?.country} /> <span className="text-muted-foreground">vs</span> <CountryLink id={b.defender?.country} />
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Regione: <RegionLink id={b.defender?.region} /> · Round {fmtNum(b.attacker?.wonRoundsCount)}-{fmtNum(b.defender?.wonRoundsCount)} (a {b.roundsToWin})
            </div>
          </Link>
        ))}
        {q.data && !q.data.items?.length && <div className="text-xs text-muted-foreground italic col-span-full">Nessuna battaglia.</div>}
      </div>
      <ApiInfo calls={[call]} />
    </div>
  );
}
