import { createFileRoute, Link } from "@tanstack/react-router";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, ApiInfo, SectionHeader, CountryLink, fmtNum, type ApiCall } from "@/components/warera-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Map } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/app/warera/regions/")({ component: RegionsPage });

interface Region { _id?: string; name?: string; country?: string; countryCode?: string; mainCity?: string; isCapital?: boolean; development?: number; biome?: string }

function RegionsPage() {
  const q = useWarEra<Region[] | Record<string, Region>>("/region.getRegionsObject", {});
  const arr = useMemo(() => Array.isArray(q.data) ? q.data : Object.values(q.data ?? {}), [q.data]);
  const [s, setS] = useState("");
  const list = useMemo(() => {
    const ss = s.trim().toLowerCase();
    return ss ? arr.filter((r) => (r.name ?? "").toLowerCase().includes(ss) || (r.countryCode ?? "").toLowerCase().includes(ss)) : arr;
  }, [arr, s]);
  const call: ApiCall = { endpoint: "/region.getRegionsObject", request: {}, data: q.data, error: q.error };

  return (
    <div>
      <PageHeader title="Regioni" description={`${arr.length} regioni nel mondo`} icon={Map}
        actions={<Input className="w-64 h-8 text-xs" placeholder="Cerca per nome o country code…" value={s} onChange={(e) => setS(e.target.value)} />} />
      <SectionHeader title="Elenco" hint={`${list.length} risultati · prime 200`} onRefresh={() => q.refetch()} busy={q.isFetching} />
      {q.isLoading && <LoadingState />}
      {q.error && <ErrorState error={q.error} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {list.slice(0, 200).map((r) => (
          <Link key={r._id} to="/app/warera/regions/$id" params={{ id: r._id ?? "" }}>
            <Card className="hover:border-primary/60 transition-colors">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-2">
                  {r.countryCode && <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-muted/40 border border-border">{r.countryCode}</span>}
                  <div className="font-semibold truncate text-sm">{r.name ?? r._id}</div>
                  {r.isCapital && <span className="text-[10px] text-yellow-400">★</span>}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Paese: <CountryLink id={r.country} className="text-primary hover:underline" /> · Sviluppo: <span className="tabular-nums">{fmtNum(r.development)}</span>
                  {r.biome && <> · {r.biome}</>}
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
