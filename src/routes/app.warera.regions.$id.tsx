import { createFileRoute, Link } from "@tanstack/react-router";
import { useWarEra } from "@/hooks/use-warera";
import {
  PageHeader, LoadingState, ErrorState, StatTile, SectionHeader, ApiInfo, JsonBlock,
  CountryLink, UserLink, fmtNum, fmtMoney, fmtRelative, type ApiCall,
} from "@/components/warera-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Map, Swords, Briefcase, TrendingUp, Info } from "lucide-react";

export const Route = createFileRoute("/app/warera/regions/$id")({ component: RegionDetail });

interface Region {
  _id?: string; name?: string; country?: string; countryCode?: string;
  mainCity?: string; isCapital?: boolean; development?: number; biome?: string;
  resources?: string[] | Record<string, unknown>;
  population?: number; activePopulation?: number;
  buildings?: Record<string, unknown>;
  occupiedBy?: string;
}

interface Battle {
  _id?: string; isActive?: boolean; createdAt?: string;
  attacker?: { country?: string }; defender?: { country?: string; region?: string };
}

interface WorkOffer {
  _id?: string; salary?: number; company?: string; companyName?: string;
  owner?: string; quality?: number; jobsCount?: number;
}

interface Upgrade { _id?: string; level?: number; type?: string; entityType?: string; entityId?: string }

function RegionDetail() {
  const { id } = Route.useParams();
  const rQ = useWarEra<Region>("/region.getById", { regionId: id });
  const battlesQ = useWarEra<{ items?: Battle[] } | Battle[]>("/battle.getBattles", { defenderRegionId: id, limit: 20 });
  const offersQ = useWarEra<{ items?: WorkOffer[] } | WorkOffer[]>("/workOffer.getWorkOffersPaginated", { regionId: id, limit: 20 });
  const upgQ = useWarEra<Upgrade | Upgrade[]>("/upgrade.getUpgradeByTypeAndEntity", { entityType: "region", entityId: id });

  const r = rQ.data;
  const battles = Array.isArray(battlesQ.data) ? battlesQ.data : (battlesQ.data?.items ?? []);
  const offers = Array.isArray(offersQ.data) ? offersQ.data : (offersQ.data?.items ?? []);

  const calls = {
    r: { endpoint: "/region.getById", request: { regionId: id }, data: rQ.data, error: rQ.error } as ApiCall,
    battles: { endpoint: "/battle.getBattles", request: { defenderRegionId: id, limit: 20 }, data: battlesQ.data, error: battlesQ.error } as ApiCall,
    offers: { endpoint: "/workOffer.getWorkOffersPaginated", request: { regionId: id, limit: 20 }, data: offersQ.data, error: offersQ.error } as ApiCall,
    upg: { endpoint: "/upgrade.getUpgradeByTypeAndEntity", request: { entityType: "region", entityId: id }, data: upgQ.data, error: upgQ.error } as ApiCall,
  };

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title={r?.name ?? "Regione"}
        description={r?.countryCode ? `${r.countryCode.toUpperCase()} · ID: ${id}` : `ID: ${id}`}
        icon={Map}
        actions={<Link to="/app/warera/regions" className="text-sm text-primary hover:underline">← Tutte le regioni</Link>}
      />
      {rQ.isLoading && <LoadingState />}
      {rQ.error && <ErrorState error={rQ.error} />}

      {r && (
        <>
          <section>
            <SectionHeader icon={Info} title="Informazioni" onRefresh={() => rQ.refetch()} busy={rQ.isFetching} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatTile label="Paese" value={<CountryLink id={r.country} />} />
              <StatTile label="Capitale" value={r.isCapital ? "★ Sì" : "No"} />
              <StatTile label="Sviluppo" value={fmtNum(r.development)} />
              <StatTile label="Biome" value={r.biome ?? "—"} />
              <StatTile label="Città principale" value={r.mainCity ?? "—"} />
              <StatTile label="Popolazione" value={fmtNum(r.population)} />
              <StatTile label="Pop. attiva" value={fmtNum(r.activePopulation)} />
              <StatTile label="Occupata da" value={r.occupiedBy ? <CountryLink id={r.occupiedBy} /> : "—"} />
            </div>
            <ApiInfo calls={[calls.r]} />
          </section>

          {r.resources && (
            <section>
              <SectionHeader title="Risorse" />
              <Card><CardContent className="pt-4">
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(r.resources) ? r.resources : Object.keys(r.resources)).map((res) => (
                    <span key={String(res)} className="text-xs px-1.5 py-0.5 rounded border border-border bg-muted/20">{String(res)}</span>
                  ))}
                  {!(Array.isArray(r.resources) ? r.resources.length : Object.keys(r.resources).length) && (
                    <span className="text-xs text-muted-foreground italic">Nessuna risorsa.</span>
                  )}
                </div>
              </CardContent></Card>
            </section>
          )}

          <section>
            <SectionHeader icon={Swords} title="Battaglie" hint={`${battles.length}`} onRefresh={() => battlesQ.refetch()} busy={battlesQ.isFetching} />
            {battlesQ.error && <ErrorState error={battlesQ.error} />}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {battles.map((b) => (
                <Link key={b._id} to="/app/warera/battles/$id" params={{ id: b._id ?? "" }}
                  className="rounded-md border border-border p-2.5 bg-muted/10 hover:border-primary/60">
                  <div className="flex items-center justify-between text-xs">
                    <span>{b.isActive ? <span className="text-success font-semibold">● ATTIVA</span> : <span className="text-muted-foreground">conclusa</span>}</span>
                    <span className="text-muted-foreground">{fmtRelative(b.createdAt)}</span>
                  </div>
                  <div className="text-xs mt-1">
                    <CountryLink id={b.attacker?.country} /> <span className="text-muted-foreground">vs</span> <CountryLink id={b.defender?.country} />
                  </div>
                </Link>
              ))}
              {!battles.length && <div className="text-xs text-muted-foreground italic">Nessuna battaglia.</div>}
            </div>
            <ApiInfo calls={[calls.battles]} />
          </section>

          <section>
            <SectionHeader icon={Briefcase} title="Offerte di lavoro" hint={`${offers.length}`} onRefresh={() => offersQ.refetch()} busy={offersQ.isFetching} />
            {offersQ.error && <ErrorState error={offersQ.error} />}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {offers.map((o) => (
                <div key={o._id} className="rounded-md border border-border p-2.5 bg-muted/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">{o.companyName ?? (o.company ? `…${o.company.slice(-6)}` : "—")}</span>
                    <span className="tabular-nums text-primary">{fmtMoney(o.salary)}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2">
                    {o.owner && <UserLink id={o.owner} className="text-primary hover:underline" />}
                    {typeof o.quality === "number" && <span>· Q{o.quality}</span>}
                    {typeof o.jobsCount === "number" && <span>· {o.jobsCount} posti</span>}
                  </div>
                </div>
              ))}
              {!offers.length && <div className="text-xs text-muted-foreground italic">Nessuna offerta.</div>}
            </div>
            <ApiInfo calls={[calls.offers]} />
          </section>

          <section>
            <SectionHeader icon={TrendingUp} title="Upgrade" onRefresh={() => upgQ.refetch()} busy={upgQ.isFetching} />
            {upgQ.error && <ErrorState error={upgQ.error} />}
            {upgQ.data ? (
              <Card><CardContent className="pt-4"><JsonBlock data={upgQ.data} /></CardContent></Card>
            ) : (
              <div className="text-xs text-muted-foreground italic">Nessun upgrade.</div>
            )}
            <ApiInfo calls={[calls.upg]} />
          </section>

          <section>
            <SectionHeader title="Dati grezzi regione" />
            <Card><CardContent className="pt-4"><JsonBlock data={r} /></CardContent></Card>
          </section>
        </>
      )}
    </div>
  );
}
