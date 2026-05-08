import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useWarEra } from "@/hooks/use-warera";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader, LoadingState, ErrorState, StatTile, fmtNum } from "@/components/warera-ui";
import { LayoutDashboard, AlertCircle, Trophy, Coins, Swords, Globe2, Building2, Shield } from "lucide-react";

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

function Page() {
  const { profile } = useAuth();
  const uid = profile?.warera_user_id;
  const { data: me, isLoading, error } = useWarEra<User>(uid ? "/user.getUserById" : null, { userId: uid });
  const { data: countries } = useWarEra<Country[]>("/country.getAllCountries", {});
  const { data: battles } = useWarEra<{ items?: unknown[] }>("/battle.getBattles", { isActive: true, limit: 5 });

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
      <PageHeader title="Panoramica War Era" description="Dati centrati sul tuo account." icon={LayoutDashboard} />
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {me && (
        <>
          {/* Identità */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatTile label="Cittadino" value={me.username ?? "—"} />
            <StatTile label="Livello" value={fmtNum(me.leveling?.level)} hint={`XP totali: ${fmtNum(me.leveling?.totalXp)}`} />
            <StatTile label="Rank militare" value={fmtNum(me.militaryRank)} />
            <StatTile label="Skill point" value={fmtNum(me.leveling?.availableSkillPoints)} hint={`XP daily residui: ${fmtNum(me.leveling?.dailyXpLeft)}`} />
          </div>

          {/* Patrimonio */}
          {wealth && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2"><Coins className="h-5 w-5 text-primary" /><CardTitle>Patrimonio</CardTitle></div>
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
          )}

          {/* Classifiche */}
          {rankingEntries.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2"><Trophy className="h-5 w-5 text-primary" /><CardTitle>Classifiche</CardTitle></div>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link to="/app/warera/countries"><StatTile label="Paesi nel mondo" value={fmtNum(countries?.length)} hint="Apri elenco →" /></Link>
        <Link to="/app/warera/battles"><StatTile label="Battaglie attive" value={fmtNum(battles?.items?.length)} hint="Apri elenco →" /></Link>
        <Link to="/app/warera/me"><StatTile label="Profilo completo" value={<Shield className="h-6 w-6 text-primary" />} hint="Tutti i dettagli →" /></Link>
      </div>
    </div>
  );
}
