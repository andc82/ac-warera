import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useWarEra } from "@/hooks/use-warera";
import {
  PageHeader, LoadingState, ErrorState, StatTile, ApiInfo, SectionHeader,
  CountryLink, fmtNum, fmtMoney, fmtRelative, TierBadge, useApiBody, type ApiCall,
} from "@/components/warera-ui";
import { Shield, User as UserIcon, Coins, Trophy, Swords, Building2, ShieldCheck, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const Route = createFileRoute("/app/warera/me")({ component: MePage });

interface Wealth { companies?: number; items?: number; money?: number; equipments?: number; weapons?: number; total?: number }
interface Ranking { value?: number; rank?: number; tier?: string }
interface SkillStat { level?: number; total?: number; currentBarValue?: number; hourlyBarRegen?: number }
interface User {
  _id?: string;
  username?: string;
  avatarUrl?: string;
  country?: string;
  company?: string;
  mu?: string;
  party?: string;
  militaryRank?: number;
  emailVerified?: boolean;
  createdAt?: string;
  leveling?: { level?: number; totalXp?: number; dailyXpLeft?: number; availableSkillPoints?: number; spentSkillPoints?: number };
  stats?: { worksCount?: number; damagesCount?: number; wealth?: Wealth };
  skills?: Record<string, SkillStat>;
  rankings?: Record<string, Ranking>;
  equipment?: Record<string, string>;
}

interface Equipment {
  weapon?: { code?: string; state?: number; maxState?: number; skills?: Record<string, number> };
  helmet?: { code?: string; state?: number; maxState?: number; skills?: Record<string, number> };
  chest?: { code?: string; state?: number; maxState?: number; skills?: Record<string, number> };
  gloves?: { code?: string; state?: number; maxState?: number; skills?: Record<string, number> };
  pants?: { code?: string; state?: number; maxState?: number; skills?: Record<string, number> };
}

interface Mu { _id?: string; name?: string; members?: string[]; leveling?: { level?: number; monthlyDamages?: number } }

const RANKING_LABELS: Record<string, string> = {
  userDamages: "Danni totali",
  weeklyUserDamages: "Danni settim.",
  userWealth: "Ricchezza",
  userLevel: "Livello (XP)",
  userReferrals: "Referral",
  userTerrain: "Territorio",
  userCasesOpened: "Casse aperte",
  userBounty: "Taglia",
};

const SLOT_LABELS: Record<string, string> = {
  weapon: "Arma", helmet: "Elmo", chest: "Petto", gloves: "Guanti", pants: "Pantaloni",
};

function EquipSlot({ slot, item }: { slot: string; item: Equipment[keyof Equipment] | undefined }) {
  return (
    <Card className="py-2.5">
      <CardHeader className="pb-1 gap-0.5">
        <CardDescription className="uppercase text-[10px] tracking-wider">{SLOT_LABELS[slot] ?? slot}</CardDescription>
        <CardTitle className="text-sm leading-tight">{item?.code ?? "—"}</CardTitle>
      </CardHeader>
      {item && (
        <CardContent className="pt-0 text-[11px] text-muted-foreground space-y-0.5">
          <div>Stato: <span className="text-foreground tabular-nums">{fmtNum(item.state)}/{fmtNum(item.maxState)}</span></div>
          {item.skills && Object.entries(item.skills).map(([k, v]) => (
            <div key={k}>{k}: <span className="text-foreground tabular-nums">+{fmtNum(v)}</span></div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}

function MePage() {
  const { profile } = useAuth();
  const uid = profile?.warera_user_id ?? "";

  const meDefaults = { userId: uid };
  const equipDefaults = { userId: uid };
  const compsDefaults = { userId: uid, perPage: 50 };
  const meBody = useApiBody<Record<string, unknown>>(meDefaults);
  const equipBody = useApiBody<Record<string, unknown>>(equipDefaults);
  const compsBody = useApiBody<Record<string, unknown>>(compsDefaults);

  const meQ = useWarEra<User>(uid ? "/user.getUserById" : null, meBody.body);
  const equipQ = useWarEra<Equipment>(uid ? "/inventory.fetchCurrentEquipment" : null, equipBody.body);
  const compsQ = useWarEra<{ items?: string[] }>(uid ? "/company.getCompanies" : null, compsBody.body);
  const muQ = useWarEra<Mu>(meQ.data?.mu ? "/mu.getById" : null, { muId: meQ.data?.mu ?? "" });

  if (!uid) {
    return (
      <div>
        <PageHeader title="Il mio profilo" icon={Shield} />
        <Card className="border-warning/40 bg-warning/5">
          <CardHeader>
            <div className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-warning" /><CardTitle>UserId mancante</CardTitle></div>
            <CardDescription>Imposta il tuo UserId War Era e l'API Key in <Link to="/app/settings" className="text-primary hover:underline">Settings</Link>.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const me = meQ.data;
  const w = me?.stats?.wealth;
  const refetchProfile = () => { meQ.refetch(); equipQ.refetch(); compsQ.refetch(); muQ.refetch(); };
  const anyFetching = meQ.isFetching || equipQ.isFetching || compsQ.isFetching || muQ.isFetching;

  const meCall: ApiCall = {
    endpoint: "/user.getUserById", request: meBody.body, data: meQ.data, error: meQ.error,
    editable: true, defaults: meDefaults, onApply: meBody.apply, onReload: () => meQ.refetch(),
  };
  const equipCall: ApiCall = {
    endpoint: "/inventory.fetchCurrentEquipment", request: equipBody.body, data: equipQ.data, error: equipQ.error,
    editable: true, defaults: equipDefaults, onApply: equipBody.apply, onReload: () => equipQ.refetch(),
  };
  const compsCall: ApiCall = {
    endpoint: "/company.getCompanies", request: compsBody.body, data: compsQ.data, error: compsQ.error,
    editable: true, defaults: compsDefaults, onApply: compsBody.apply, onReload: () => compsQ.refetch(),
  };
  const muCall: ApiCall = { endpoint: "/mu.getById", request: { muId: me?.mu ?? "" }, data: muQ.data, error: muQ.error };

  const rankings = Object.entries(me?.rankings ?? {}).filter(([k]) => k in RANKING_LABELS);

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title={me?.username ? `Profilo · ${me.username}` : "Il mio profilo"}
        description={`UserId: ${uid}`}
        icon={Shield}
        actions={<button onClick={refetchProfile} className="text-xs text-primary hover:underline" disabled={anyFetching}>Ricarica tutto</button>}
      />
      {meQ.isLoading && <LoadingState />}
      {meQ.error && <ErrorState error={meQ.error} />}

      {me && (
        <>
          {/* Identità */}
          <section>
            <SectionHeader icon={UserIcon} title="Identità" onRefresh={() => meQ.refetch()} busy={meQ.isFetching} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatTile label="Username" value={me.username ?? "—"} hint={me.emailVerified ? "Email verificata" : "Email non verificata"} />
              <StatTile label="Livello" value={fmtNum(me.leveling?.level)} hint={`XP: ${fmtNum(me.leveling?.totalXp)}`} />
              <StatTile label="Rank militare" value={fmtNum(me.militaryRank)} />
              <StatTile label="Skill point" value={fmtNum(me.leveling?.availableSkillPoints)} hint={`Spesi: ${fmtNum(me.leveling?.spentSkillPoints)}`} />
              <StatTile label="Paese" value={me.country ? <CountryLink id={me.country} /> : "—"} />
              <StatTile label="Azienda" value={me.company ? <Link to="/app/warera/companies/$id" params={{ id: me.company }} className="text-primary hover:underline">Apri →</Link> : "—"} />
              <StatTile label="MU" value={muQ.data?.name ?? (me.mu ? `…${me.mu.slice(-6)}` : "—")} hint={muQ.data?.leveling?.level ? `Lv ${muQ.data.leveling.level}` : undefined} />
              <StatTile label="XP daily residui" value={fmtNum(me.leveling?.dailyXpLeft)} hint={`Account dal ${me.createdAt ? fmtRelative(me.createdAt) : "—"}`} />
            </div>
            <ApiInfo calls={[meCall, muCall]} />
          </section>

          {/* Patrimonio */}
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
              <ApiInfo calls={[meCall]} />
            </section>
          )}

          {/* Combattimento / Statistiche */}
          <section>
            <SectionHeader icon={Swords} title="Statistiche" onRefresh={() => meQ.refetch()} busy={meQ.isFetching} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatTile label="Lavori effettuati" value={fmtNum(me.stats?.worksCount)} />
              <StatTile label="Danni totali" value={fmtNum(me.stats?.damagesCount)} />
              <StatTile label="Attacco" value={fmtNum(me.skills?.attack?.total)} />
              <StatTile label="Salute" value={`${fmtNum(me.skills?.health?.currentBarValue)}/${fmtNum(me.skills?.health?.total)}`} />
              <StatTile label="Energia" value={`${fmtNum(me.skills?.energy?.currentBarValue)}/${fmtNum(me.skills?.energy?.total)}`} hint={`Regen: ${fmtNum(me.skills?.energy?.hourlyBarRegen)}/h`} />
              <StatTile label="Fame" value={`${fmtNum(me.skills?.hunger?.currentBarValue)}/${fmtNum(me.skills?.hunger?.total)}`} />
              <StatTile label="Crit. chance" value={`${fmtNum(me.skills?.criticalChance?.total)}%`} />
              <StatTile label="Crit. damage" value={`${fmtNum(me.skills?.criticalDamages?.total)}%`} />
            </div>
            <ApiInfo calls={[meCall]} />
          </section>

          {/* Equipaggiamento */}
          <section>
            <SectionHeader icon={ShieldCheck} title="Equipaggiamento" onRefresh={() => equipQ.refetch()} busy={equipQ.isFetching} />
            {equipQ.error && <ErrorState error={equipQ.error} />}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {["weapon","helmet","chest","gloves","pants"].map((s) => (
                <EquipSlot key={s} slot={s} item={equipQ.data?.[s as keyof Equipment]} />
              ))}
            </div>
            <ApiInfo calls={[equipCall]} />
          </section>

          {/* Classifiche */}
          {rankings.length > 0 && (
            <section>
              <SectionHeader icon={Trophy} title="Classifiche personali" onRefresh={() => meQ.refetch()} busy={meQ.isFetching} />
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
              <ApiInfo calls={[meCall]} />
            </section>
          )}

          {/* Aziende possedute */}
          <section>
            <SectionHeader icon={Building2} title="Aziende possedute" hint={`${compsQ.data?.items?.length ?? 0} totali`} onRefresh={() => compsQ.refetch()} busy={compsQ.isFetching} />
            {compsQ.error && <ErrorState error={compsQ.error} />}
            {compsQ.data && (compsQ.data.items?.length ?? 0) === 0 && <div className="text-xs text-muted-foreground italic py-2">Nessuna azienda di proprietà.</div>}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {(compsQ.data?.items ?? []).map((cid) => (
                <Link key={cid} to="/app/warera/companies/$id" params={{ id: cid }}
                  className="rounded-md border border-border p-2 bg-muted/10 hover:border-primary/60">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Company</div>
                  <code className="text-[11px] font-mono">…{cid.slice(-8)}</code>
                </Link>
              ))}
            </div>
            <ApiInfo calls={[compsCall]} />
          </section>
        </>
      )}
    </div>
  );
}
