import { createFileRoute, Link } from "@tanstack/react-router";
import { useWarEra } from "@/hooks/use-warera";
import {
  PageHeader, LoadingState, ErrorState, StatTile, ApiInfo, SectionHeader,
  UserLink, CountryLink, fmtNum, fmtMoney, fmtPct, fmtRelative, TierBadge, type ApiCall,
} from "@/components/warera-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Globe2, Coins, Trophy, Swords, Landmark, CalendarClock, Handshake } from "lucide-react";

export const Route = createFileRoute("/app/warera/countries/$id")({ component: CountryDetail });

interface Ranking { value?: number; rank?: number; tier?: string }
interface Country {
  _id: string; name?: string; code?: string; money?: number;
  taxes?: { income?: number; market?: number; selfWork?: number };
  unrest?: { bar?: number; barMax?: number };
  allies?: string[]; warsWith?: string[]; orgs?: string[];
  rankings?: Record<string, Ranking>;
  strategicResources?: { resources?: Record<string, string[]>; bonuses?: Record<string, number> };
}

interface Government {
  president?: string; vicePresident?: string;
  minOfDefense?: string; minOfEconomy?: string; minOfForeignAffairs?: string;
  congressMembers?: string[];
}

interface Event { _id?: string; data?: { type?: string }; createdAt?: string }
interface Battle { _id?: string; isActive?: boolean; attacker?: { country?: string }; defender?: { country?: string }; createdAt?: string }

const RANKING_LABELS: Record<string, string> = {
  countryDamages: "Danni totali",
  weeklyCountryDamages: "Danni settim.",
  weeklyCountryDamagesPerCitizen: "Danni/cittadino",
  countryDevelopment: "Sviluppo",
  countryActivePopulation: "Popolazione attiva",
  countryWealth: "Ricchezza",
  countryBounty: "Taglie",
  countryProductionBonus: "Bonus produzione",
  countryRegionDiff: "Regioni",
};

function CountryDetail() {
  const { id } = Route.useParams();
  const cQ = useWarEra<Country>("/country.getCountryById", { countryId: id });
  const govQ = useWarEra<Government>("/government.getByCountryId", { countryId: id });
  const usersQ = useWarEra<{ items?: { _id: string; createdAt?: string }[] }>("/user.getUsersByCountry", { countryId: id, perPage: 20 });
  const eventsQ = useWarEra<{ items?: Event[] }>("/event.getEventsPaginated", { countryId: id, limit: 15 });
  const battlesQ = useWarEra<{ items?: Battle[] }>("/battle.getBattles", { countryId: id, limit: 15 });

  const c = cQ.data;
  const rankings = Object.entries(c?.rankings ?? {}).filter(([k]) => k in RANKING_LABELS);

  const calls = {
    c: { endpoint: "/country.getCountryById", request: { countryId: id }, data: cQ.data, error: cQ.error } as ApiCall,
    gov: { endpoint: "/government.getByCountryId", request: { countryId: id }, data: govQ.data, error: govQ.error } as ApiCall,
    users: { endpoint: "/user.getUsersByCountry", request: { countryId: id, perPage: 20 }, data: usersQ.data, error: usersQ.error } as ApiCall,
    events: { endpoint: "/event.getEventsPaginated", request: { countryId: id, limit: 15 }, data: eventsQ.data, error: eventsQ.error } as ApiCall,
    battles: { endpoint: "/battle.getBattles", request: { countryId: id, limit: 15 }, data: battlesQ.data, error: battlesQ.error } as ApiCall,
  };

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title={c?.name ?? "Paese"}
        description={c?.code ? `Codice: ${c.code.toUpperCase()} · ID: ${id}` : `ID: ${id}`}
        icon={Globe2}
        actions={<Link to="/app/warera/countries" className="text-sm text-primary hover:underline">← Tutti i paesi</Link>}
      />
      {cQ.isLoading && <LoadingState />}
      {cQ.error && <ErrorState error={cQ.error} />}

      {c && (
        <>
          <section>
            <SectionHeader icon={Coins} title="Economia" onRefresh={() => cQ.refetch()} busy={cQ.isFetching} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatTile label="Tesoro" value={fmtMoney(c.money)} />
              <StatTile label="Tassa reddito" value={fmtPct(c.taxes?.income)} />
              <StatTile label="Tassa mercato" value={fmtPct(c.taxes?.market)} />
              <StatTile label="Tassa selfwork" value={fmtPct(c.taxes?.selfWork)} />
              <StatTile label="Unrest" value={`${fmtNum(c.unrest?.bar)}/${fmtNum(c.unrest?.barMax)}`} />
              <StatTile label="Alleati" value={fmtNum(c.allies?.length)} />
              <StatTile label="In guerra con" value={fmtNum(c.warsWith?.length)} />
              <StatTile label="Bonus produzione" value={fmtPct(c.strategicResources?.bonuses?.productionPercent)} />
            </div>
            <ApiInfo calls={[calls.c]} />
          </section>

          {(c.allies?.length || c.warsWith?.length) && (
            <section>
              <SectionHeader icon={Handshake} title="Diplomazia" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card><CardContent className="pt-4">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Alleati ({c.allies?.length ?? 0})</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(c.allies ?? []).map((aid) => <CountryLink key={aid} id={aid} className="text-xs px-1.5 py-0.5 rounded border border-border bg-muted/20 hover:border-primary/60" />)}
                    {!c.allies?.length && <span className="text-xs text-muted-foreground italic">Nessuno</span>}
                  </div>
                </CardContent></Card>
                <Card><CardContent className="pt-4">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">In guerra ({c.warsWith?.length ?? 0})</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(c.warsWith ?? []).map((aid) => <CountryLink key={aid} id={aid} className="text-xs px-1.5 py-0.5 rounded border border-destructive/40 bg-destructive/10 hover:border-destructive" />)}
                    {!c.warsWith?.length && <span className="text-xs text-muted-foreground italic">Nessuna guerra</span>}
                  </div>
                </CardContent></Card>
              </div>
            </section>
          )}

          {rankings.length > 0 && (
            <section>
              <SectionHeader icon={Trophy} title="Classifiche del paese" onRefresh={() => cQ.refetch()} busy={cQ.isFetching} />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {rankings.map(([k, r]) => (
                  <div key={k} className="rounded-md border border-border p-3 bg-muted/20">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{RANKING_LABELS[k]}</div>
                    <div className="text-xl font-semibold tabular-nums mt-1">{fmtNum(r.value)}</div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-muted-foreground">#{fmtNum(r.rank)}</span>
                      <TierBadge tier={r.tier} />
                    </div>
                  </div>
                ))}
              </div>
              <ApiInfo calls={[calls.c]} />
            </section>
          )}

          <section>
            <SectionHeader icon={Landmark} title="Governo" onRefresh={() => govQ.refetch()} busy={govQ.isFetching} />
            {govQ.error && <ErrorState error={govQ.error} />}
            {govQ.data && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatTile label="Presidente" value={<UserLink id={govQ.data.president} />} />
                <StatTile label="Vicepresidente" value={<UserLink id={govQ.data.vicePresident} />} />
                <StatTile label="Min. Difesa" value={<UserLink id={govQ.data.minOfDefense} />} />
                <StatTile label="Min. Economia" value={<UserLink id={govQ.data.minOfEconomy} />} />
                <StatTile label="Min. Esteri" value={<UserLink id={govQ.data.minOfForeignAffairs} />} />
                <StatTile label="Membri Congresso" value={fmtNum(govQ.data.congressMembers?.length)} />
              </div>
            )}
            <ApiInfo calls={[calls.gov]} />
          </section>

          <section>
            <SectionHeader icon={Swords} title="Battaglie recenti" hint={`${battlesQ.data?.items?.length ?? 0}`} onRefresh={() => battlesQ.refetch()} busy={battlesQ.isFetching} />
            {battlesQ.error && <ErrorState error={battlesQ.error} />}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(battlesQ.data?.items ?? []).map((b) => (
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
              {!(battlesQ.data?.items?.length) && <div className="text-xs text-muted-foreground italic">Nessuna battaglia recente.</div>}
            </div>
            <ApiInfo calls={[calls.battles]} />
          </section>

          <section>
            <SectionHeader icon={CalendarClock} title="Eventi recenti" hint={`${eventsQ.data?.items?.length ?? 0}`} onRefresh={() => eventsQ.refetch()} busy={eventsQ.isFetching} />
            <div className="space-y-1">
              {(eventsQ.data?.items ?? []).map((e) => (
                <div key={e._id} className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded border border-border bg-muted/10">
                  <span className="font-mono text-[11px] text-primary">{e.data?.type ?? "—"}</span>
                  <span className="text-muted-foreground">{fmtRelative(e.createdAt)}</span>
                </div>
              ))}
              {!(eventsQ.data?.items?.length) && <div className="text-xs text-muted-foreground italic">Nessun evento.</div>}
            </div>
            <ApiInfo calls={[calls.events]} />
          </section>

          <section>
            <SectionHeader title="Cittadini recenti" hint={`${usersQ.data?.items?.length ?? 0}`} onRefresh={() => usersQ.refetch()} busy={usersQ.isFetching} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {(usersQ.data?.items ?? []).map((u) => (
                <Link key={u._id} to="/app/warera/users/$id" params={{ id: u._id }}
                  className="rounded-md border border-border p-2 bg-muted/10 hover:border-primary/60">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Iscritto {fmtRelative(u.createdAt)}</div>
                  <code className="text-[11px] font-mono">…{u._id.slice(-8)}</code>
                </Link>
              ))}
            </div>
            <ApiInfo calls={[calls.users]} />
          </section>
        </>
      )}
    </div>
  );
}
