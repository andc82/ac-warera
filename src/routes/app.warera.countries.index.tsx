import { createFileRoute, Link } from "@tanstack/react-router";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, EmptyState, ApiInfo, SectionHeader, fmtMoney, useApiBody, type ApiCall } from "@/components/warera-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Globe2 } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/app/warera/countries/")({ component: CountriesList });

interface Country {
  _id: string;
  name?: string;
  code?: string;
  money?: number;
  taxes?: { income?: number; market?: number; selfWork?: number };
  allies?: string[];
  warsWith?: string[];
}

function CountriesList() {
  const q = useWarEra<Country[]>("/country.getAllCountries", {});
  const [search, setSearch] = useState("");
  const list = useMemo(() => {
    const arr = q.data ?? [];
    const s = search.trim().toLowerCase();
    const filtered = s ? arr.filter((c) => (c.name ?? "").toLowerCase().includes(s) || (c.code ?? "").toLowerCase().includes(s)) : arr;
    return [...filtered].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }, [q.data, search]);

  const call: ApiCall = { endpoint: "/country.getAllCountries", request: {}, data: q.data, error: q.error };

  return (
    <div>
      <PageHeader title="Paesi" description={`${q.data?.length ?? 0} paesi nel mondo`} icon={Globe2}
        actions={<Input className="w-64 h-8 text-xs" placeholder="Cerca per nome o codice…" value={search} onChange={(e) => setSearch(e.target.value)} />}
      />
      <SectionHeader title="Elenco" hint={`${list.length} risultati`} onRefresh={() => q.refetch()} busy={q.isFetching} />
      {q.isLoading && <LoadingState />}
      {q.error && <ErrorState error={q.error} />}
      {q.data && list.length === 0 && <EmptyState />}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
        {list.map((c) => (
          <Link key={c._id} to="/app/warera/countries/$id" params={{ id: c._id }}>
            <Card className="hover:border-primary/60 transition-colors h-full">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  {c.code && <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-muted/40 border border-border">{c.code}</span>}
                  <div className="font-semibold truncate text-sm">{c.name ?? "—"}</div>
                </div>
                <div className="text-[11px] text-muted-foreground tabular-nums">
                  Tesoro: {fmtMoney(c.money)} · Alleati: {c.allies?.length ?? 0} · In guerra: {c.warsWith?.length ?? 0}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <ApiInfo calls={[call]} />
    </div>
  );
}
