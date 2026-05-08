import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useWarEra } from "@/hooks/use-warera";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, LoadingState, ErrorState, StatTile, fmtNum } from "@/components/warera-ui";
import { LayoutDashboard, AlertCircle, Trophy, Coins, Shield, RefreshCw, User as UserIcon, BarChart3, Globe2 } from "lucide-react";

export const Route = createFileRoute("/app/warera/dashboard")({ component: Page });

interface Wealth { companies?: number; items?: number; money?: number; equipments?: number; weapons?: number; total?: number }
interface Ranking { value?: number; rank?: number; tier?: string }
interface User {
  _id?: string;
  username?: string;
  country?: string;
  company?: string;
  militaryRank?: number;
  leveling?: { level?: number; totalXp?: number; availableSkillPoints?: number; dailyXpLeft?: number };
  stats?: { worksCount?: number; damagesCount?: number; wealth?: Wealth };
  rankings?: Record<string, Ranking>;
}

interface Country { _id: string; name?: string; code?: string }

const tierColor = (tier?: string) => {
  switch (tier) {
    case "platinum": return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
    case "gold": return "bg-yellow-500/15 text-yellow-300 border-yellow-500/30";
    case "silver": return "bg-slate-400/15 text-slate-300 border-slate-400/30";
    case "bronze": return "bg-amber-700/15 text-amber-400 border-amber-700/30";
    default: return "";
  }
};

const RANKING_LABELS: Record<string, string> = {
  userDamages: "Danni totali",
  weeklyUserDamages: "Danni settimanali",
  userWealth: "Ricchezza",
  userLevel: "Livello (XP)",
  userReferrals: "Referral",
  userTerrain: "Territorio",
  userCasesOpened: "Casse aperte",
  userBounty: "Taglie",
};

function RefreshBtn({ onClick, busy, label = "Ricarica" }: { onClick: () => void; busy?: boolean; label?: string }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={busy} className="h-8 gap-1.5">
      <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
      <span className="text-xs">{label}</span>
    </Button>
  );
}

function SectionHeader({ icon: Icon, title, onRefresh, busy }: {
  icon: React.ComponentType<{ className?: string }>; title: string; onRefresh: () => void; busy?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      </div>
      <RefreshBtn onClick={onRefresh} busy={busy} />
    </div>
  );
}

function Page() {
  const { profile } = useAuth();
  const uid = profile?.warera_user_id;
  const meQ = useWarEra<User>(uid ? "/user.getUserById" : null, { userId: uid });
  const countriesQ = useWarEra<Country[]>("/country.getAllCountries", {});
  const battlesQ = useWarEra<{ items?: unknown[] }>("/battle.getBattles", { isActive: true, limit: 5 });

  const me = meQ.data;
  const countries = countriesQ.data;
  const battles = battlesQ.data;

  const refetchAll = () => { meQ.refetch(); countriesQ.refetch(); battlesQ.refetch(); };
  const anyFetching = meQ.isFetching || countriesQ.isFetching || battlesQ.isFetching;

  if (!uid) {
    return (
      <div>
        <PageHeader title="Panoramica War Era" icon={LayoutDashboard} />
        <Card className="border-warning/40 bg-warning/5">
          <CardHeader>
            <div className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-warning" /><CardTitle>UserId mancante</CardTitle></div>
            <CardDescription>
              Imposta il tuo UserId War Era e l'API Key in <Link to="/app/settings" className="text-primary hover:underline">Settings</Link>.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const wealth = me?.stats?.wealth;
  const myCountry = countries?.find((c) => c._id === me?.country);
  const rankings = me?.rankings ?? {};
  const rankingEntries = Object.entries(rankings).filter(([k]) => k in RANKING_LABELS);

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Panoramica War Era"
        description="Dati centrati sul tuo account."
        icon={LayoutDashboard}
        actions={<RefreshBtn onClick={refetchAll} busy={anyFetching} label="Ricarica tutto" />}
      />
      {meQ.isLoading && <LoadingState />}
      {meQ.error && <ErrorState error={meQ.error} />}
      {me && (
        <>
          {/* Identità */}
          <section>
            <SectionHeader icon={UserIcon} title="Identità" onRefresh={() => meQ.refetch()} busy={meQ.isFetching} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatTile label="Cittadino" value={me.username ?? "—"} />
              <StatTile label="Livello" value={fmtNum(me.leveling?.level)} hint={`XP totali: ${fmtNum(me.leveling?.totalXp)}`} />
              <StatTile label="Rank militare" value={fmtNum(me.militaryRank)} />
              <StatTile label="Skill point" value={fmtNum(me.leveling?.availableSkillPoints)} hint={`XP daily residui: ${fmtNum(me.leveling?.dailyXpLeft)}`} />
            </div>
          </section>

          {/* Patrimonio */}
          {wealth && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2"><Coins className="h-5 w-5 text-primary" /><CardTitle>Patrimonio</CardTitle></div>
                  <RefreshBtn onClick={() => meQ.refetch()} busy={meQ.isFetching} />
                </div>
                <CardDescription>Composizione ricchezza totale: <span className="font-semibold text-foreground">{fmtNum(wealth.total)}</span></CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatTile label="Liquidità" value={fmtNum(wealth.money)} />
                <StatTile label="Aziende" value={fmtNum(wealth.companies)} />
                <StatTile label="Oggetti" value={fmtNum(wealth.items)} />
                <StatTile label="Armi" value={fmtNum(wealth.weapons)} />
                <StatTile label="Equip." value={fmtNum(wealth.equipments)} />
              </CardContent>
            </Card>
          )}

          {/* Statistiche di gioco */}
          {me.stats && (
            <section>
              <SectionHeader icon={BarChart3} title="Statistiche" onRefresh={() => meQ.refetch()} busy={meQ.isFetching} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatTile label="Lavori effettuati" value={fmtNum(me.stats.worksCount)} />
                <StatTile label="Danni totali" value={fmtNum(me.stats.damagesCount)} />
                <StatTile label="Tuo paese" value={
                  me.country ? (
                    <Link className="text-primary hover:underline" to="/app/warera/countries/$id" params={{ id: me.country }}>
                      {myCountry?.name ?? "Apri →"}
                    </Link>
                  ) : "—"
                } />
                <StatTile label="Tua azienda" value={
                  me.company ? (
                    <Link className="text-primary hover:underline" to="/app/warera/companies/$id" params={{ id: me.company }}>Apri →</Link>
                  ) : "—"
                } />
              </div>
            </section>
          )}

          {/* Classifiche */}
          {rankingEntries.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2"><Trophy className="h-5 w-5 text-primary" /><CardTitle>Classifiche</CardTitle></div>
                  <RefreshBtn onClick={() => meQ.refetch()} busy={meQ.isFetching} />
                </div>
                <CardDescription>Posizioni globali e tier</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {rankingEntries.map(([key, r]) => (
                  <div key={key} className="rounded-md border border-border p-3 bg-muted/20">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{RANKING_LABELS[key]}</div>
                    <div className="text-xl font-semibold tabular-nums mt-1">{fmtNum(r.value)}</div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-muted-foreground">#{fmtNum(r.rank)}</span>
                      {r.tier && <Badge variant="outline" className={`text-[10px] capitalize ${tierColor(r.tier)}`}>{r.tier}</Badge>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Mondo */}
      <section>
        <SectionHeader
          icon={Globe2}
          title="Mondo"
          onRefresh={() => { countriesQ.refetch(); battlesQ.refetch(); }}
          busy={countriesQ.isFetching || battlesQ.isFetching}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link to="/app/warera/countries"><StatTile label="Paesi nel mondo" value={fmtNum(countries?.length)} hint="Apri elenco →" /></Link>
          <Link to="/app/warera/battles"><StatTile label="Battaglie attive" value={fmtNum(battles?.items?.length)} hint="Apri elenco →" /></Link>
          <Link to="/app/warera/me"><StatTile label="Profilo completo" value={<Shield className="h-6 w-6 text-primary" />} hint="Tutti i dettagli →" /></Link>
        </div>
      </section>
    </div>
  );
}
