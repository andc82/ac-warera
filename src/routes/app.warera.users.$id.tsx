import { createFileRoute, Link } from "@tanstack/react-router";
import { useWarEra } from "@/hooks/use-warera";
import {
  PageHeader, LoadingState, ErrorState, StatTile, ApiInfo, SectionHeader,
  CountryLink, fmtNum, fmtMoney, fmtRelative, TierBadge, type ApiCall,
} from "@/components/warera-ui";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Coins, Trophy, Swords, Building2, ShieldCheck, ArrowLeftRight } from "lucide-react";

export const Route = createFileRoute("/app/warera/users/$id")({ component: UserDetail });

interface Wealth { companies?: number; items?: number; money?: number; equipments?: number; weapons?: number; total?: number }
interface Ranking { value?: number; rank?: number; tier?: string }
interface User {
  _id?: string; username?: string; country?: string; company?: string; mu?: string;
  militaryRank?: number; createdAt?: string;
  leveling?: { level?: number; totalXp?: number };
  stats?: { worksCount?: number; damagesCount?: number; wealth?: Wealth };
  rankings?: Record<string, Ranking>;
  skills?: Record<string, { total?: number; currentBarValue?: number }>;
}

interface Equipment { weapon?: { code?: string; state?: number }; helmet?: { code?: string }; chest?: { code?: string }; gloves?: { code?: string }; pants?: { code?: string } }

interface Tx { _id?: string; transactionType?: string; money?: number; quantity?: number; itemCode?: string; buyerId?: string; sellerId?: string; createdAt?: string }

const RANKING_LABELS: Record<string, string> = {
  userDamages: "Danni totali", weeklyUserDamages: "Danni settim.", userWealth: "Ricchezza",
  userLevel: "Livello (XP)", userReferrals: "Referral", userCasesOpened: "Casse", userBounty: "Taglia",
};

function UserDetail() {
  const { id } = Route.useParams();
  const meQ = useWarEra<User>("/user.getUserById", { userId: id });
  const equipQ = useWarEra<Equipment>("/inventory.fetchCurrentEquipment", { userId: id });
  const compsQ = useWarEra<{ items?: string[] }>("/company.getCompanies", { userId: id, perPage: 50 });
  const txQ = useWarEra<{ items?: Tx[] }>("/transaction.getPaginatedTransactions", { userId: id, limit: 20 });

  const u = meQ.data;
  const w = u?.stats?.wealth;
  const rankings = Object.entries(u?.rankings ?? {}).filter(([k]) => k in RANKING_LABELS);

  const calls = {
    me: { endpoint: "/user.getUserById", request: { userId: id }, data: meQ.data, error: meQ.error } satisfies ApiCall,
    equip: { endpoint: "/inventory.fetchCurrentEquipment", request: { userId: id }, data: equipQ.data, error: equipQ.error } satisfies ApiCall,
    comps: { endpoint: "/company.getCompanies", request: { userId: id, perPage: 50 }, data: compsQ.data, error: compsQ.error } satisfies ApiCall,
    tx: { endpoint: "/transaction.getPaginatedTransactions", request: { userId: id, limit: 20 }, data: txQ.data, error: txQ.error } satisfies ApiCall,
  };

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title={u?.username ?? "Utente"}
        description={`ID: ${id}`}
        icon={Users}
        actions={<Link to="/app/warera/users" className="text-sm text-primary hover:underline">← Indietro</Link>}
      />
      {meQ.isLoading && <LoadingState />}
      {meQ.error && <ErrorState error={meQ.error} />}

      {u && (
        <>
          <section>
            <SectionHeader title="Identità" onRefresh={() => meQ.refetch()} busy={meQ.isFetching} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatTile label="Username" value={u.username ?? "—"} />
              <StatTile label="Livello" value={fmtNum(u.leveling?.level)} hint={`XP: ${fmtNum(u.leveling?.totalXp)}`} />
              <StatTile label="Rank militare" value={fmtNum(u.militaryRank)} />
              <StatTile label="Iscritto" value={u.createdAt ? fmtRelative(u.createdAt) : "—"} />
              <StatTile label="Paese" value={u.country ? <CountryLink id={u.country} /> : "—"} />
              <StatTile label="Azienda" value={u.company ? <Link to="/app/warera/companies/$id" params={{ id: u.company }} className="text-primary hover:underline">Apri →</Link> : "—"} />
              <StatTile label="MU" value={u.mu ? `…${u.mu.slice(-6)}` : "—"} />
              <StatTile label="Aziende possedute" value={fmtNum(compsQ.data?.items?.length)} />
            </div>
            <ApiInfo calls={[calls.me]} />
          </section>

          {w && (
            <section>
              <SectionHeader icon={Coins} title="Patrimonio" hint={`Totale: ${fmtMoney(w.total)}`} onRefresh={() => meQ.refetch()} busy={meQ.isFetching} />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatTile label="Liquidità" value={fmtMoney(w.money)} />
                <StatTile label="Aziende" value={fmtMoney(w.companies)} />
                <StatTile label="Oggetti" value={fmtMoney(w.items)} />
                <StatTile label="Armi" value={fmtMoney(w.weapons)} />
                <StatTile label="Equip." value={fmtMoney(w.equipments)} />
              </div>
              <ApiInfo calls={[calls.me]} />
            </section>
          )}

          <section>
            <SectionHeader icon={Swords} title="Combat" onRefresh={() => meQ.refetch()} busy={meQ.isFetching} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatTile label="Danni totali" value={fmtNum(u.stats?.damagesCount)} />
              <StatTile label="Lavori" value={fmtNum(u.stats?.worksCount)} />
              <StatTile label="Attacco" value={fmtNum(u.skills?.attack?.total)} />
              <StatTile label="Salute" value={fmtNum(u.skills?.health?.total)} />
            </div>
            <ApiInfo calls={[calls.me]} />
          </section>

          <section>
            <SectionHeader icon={ShieldCheck} title="Equipaggiamento" onRefresh={() => equipQ.refetch()} busy={equipQ.isFetching} />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {(["weapon","helmet","chest","gloves","pants"] as const).map((slot) => {
                const it = equipQ.data?.[slot] as { code?: string } | undefined;
                return (
                  <Card key={slot} className="py-2.5"><CardHeader className="pb-1 gap-0.5">
                    <CardDescription className="uppercase text-[10px] tracking-wider">{slot}</CardDescription>
                    <CardTitle className="text-sm leading-tight">{it?.code ?? "—"}</CardTitle>
                  </CardHeader></Card>
                );
              })}
            </div>
            <ApiInfo calls={[calls.equip]} />
          </section>

          {rankings.length > 0 && (
            <section>
              <SectionHeader icon={Trophy} title="Classifiche" onRefresh={() => meQ.refetch()} busy={meQ.isFetching} />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {rankings.map(([key, r]) => (
                  <div key={key} className="rounded-md border border-border p-3 bg-muted/20">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{RANKING_LABELS[key]}</div>
                    <div className="text-xl font-semibold tabular-nums mt-1">{fmtNum(r.value)}</div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-muted-foreground">#{fmtNum(r.rank)}</span>
                      <TierBadge tier={r.tier} />
                    </div>
                  </div>
                ))}
              </div>
              <ApiInfo calls={[calls.me]} />
            </section>
          )}

          <section>
            <SectionHeader icon={Building2} title="Aziende" hint={`${compsQ.data?.items?.length ?? 0} totali`} onRefresh={() => compsQ.refetch()} busy={compsQ.isFetching} />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {(compsQ.data?.items ?? []).map((cid) => (
                <Link key={cid} to="/app/warera/companies/$id" params={{ id: cid }}
                  className="rounded-md border border-border p-2 bg-muted/10 hover:border-primary/60">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Company</div>
                  <code className="text-[11px] font-mono">…{cid.slice(-8)}</code>
                </Link>
              ))}
            </div>
            <ApiInfo calls={[calls.comps]} />
          </section>

          <section>
            <SectionHeader icon={ArrowLeftRight} title="Transazioni recenti" hint={`${txQ.data?.items?.length ?? 0} ultime`} onRefresh={() => txQ.refetch()} busy={txQ.isFetching} />
            <div className="rounded-md border border-border overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/30 text-muted-foreground">
                  <tr>
                    <th className="text-left px-2 py-1.5">Tipo</th>
                    <th className="text-left px-2 py-1.5">Item</th>
                    <th className="text-right px-2 py-1.5">Qty</th>
                    <th className="text-right px-2 py-1.5">Money</th>
                    <th className="text-left px-2 py-1.5">Quando</th>
                  </tr>
                </thead>
                <tbody>
                  {(txQ.data?.items ?? []).map((t) => (
                    <tr key={t._id} className="border-t border-border/50">
                      <td className="px-2 py-1">{t.transactionType ?? "—"}</td>
                      <td className="px-2 py-1">{t.itemCode ?? "—"}</td>
                      <td className="px-2 py-1 text-right tabular-nums">{t.quantity != null ? fmtNum(t.quantity) : "—"}</td>
                      <td className="px-2 py-1 text-right tabular-nums">{t.money != null ? fmtMoney(t.money) : "—"}</td>
                      <td className="px-2 py-1 text-muted-foreground">{fmtRelative(t.createdAt)}</td>
                    </tr>
                  ))}
                  {!(txQ.data?.items?.length) && <tr><td colSpan={5} className="text-center py-3 text-muted-foreground italic">Nessuna transazione</td></tr>}
                </tbody>
              </table>
            </div>
            <ApiInfo calls={[calls.tx]} />
          </section>
        </>
      )}
    </div>
  );
}
