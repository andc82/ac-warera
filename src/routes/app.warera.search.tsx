import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, ApiInfo, SectionHeader, type ApiCall } from "@/components/warera-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export const Route = createFileRoute("/app/warera/search")({ component: SearchPage });

interface Result { userIds?: string[]; muIds?: string[]; countryIds?: string[]; regionIds?: string[]; partyIds?: string[]; hasData?: boolean }

function SearchPage() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState("");
  const r = useWarEra<Result>(active ? "/search.searchAnything" : null, { searchText: active });
  const call: ApiCall = { endpoint: "/search.searchAnything", request: { searchText: active }, data: r.data, error: r.error };

  const Section = ({ label, ids, to }: { label: string; ids?: string[]; to: "users" | "countries" | "regions" }) => (
    <Card><CardContent className="pt-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">{label} ({ids?.length ?? 0})</div>
      <div className="flex flex-wrap gap-1.5">
        {(ids ?? []).map((id) => (
          <Link key={id} to={`/app/warera/${to}/$id`} params={{ id }} className="text-xs px-2 py-0.5 rounded border border-border bg-muted/20 hover:border-primary/60 font-mono">…{id.slice(-8)}</Link>
        ))}
        {!ids?.length && <span className="text-xs text-muted-foreground italic">—</span>}
      </div>
    </CardContent></Card>
  );

  return (
    <div className="max-w-4xl">
      <PageHeader title="Ricerca" description="Cerca utenti, paesi, regioni…" icon={Search} />
      <Card className="mb-4"><CardContent className="pt-4 flex gap-2">
        <Input placeholder="Termine di ricerca…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setActive(q)} />
        <Button onClick={() => setActive(q)} size="sm">Cerca</Button>
      </CardContent></Card>
      {active && <SectionHeader title={`Risultati per "${active}"`} onRefresh={() => r.refetch()} busy={r.isFetching} />}
      {r.isLoading && <LoadingState />}
      {r.error && <ErrorState error={r.error} />}
      {r.data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Section label="Utenti" ids={r.data.userIds} to="users" />
          <Section label="Paesi" ids={r.data.countryIds} to="countries" />
          <Section label="Regioni" ids={r.data.regionIds} to="regions" />
        </div>
      )}
      {active && <ApiInfo calls={[call]} />}
    </div>
  );
}
