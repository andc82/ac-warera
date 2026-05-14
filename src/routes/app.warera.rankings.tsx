import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, ApiInfo, SectionHeader, UserLink, CountryLink, TierBadge, fmtNum, type ApiCall } from "@/components/warera-ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/app/warera/rankings")({ component: RankingsPage });

const TYPES = [
  "userDamages","weeklyUserDamages","userWealth","userLevel","userReferrals","userCasesOpened","userBounty",
  "countryDamages","weeklyCountryDamages","countryWealth","countryDevelopment","countryActivePopulation","countryBounty",
  "muDamages","muWeeklyDamages","muTerrain","muWealth","muBounty","muReputation",
] as const;
type T = typeof TYPES[number];

interface Item { _id?: string; user?: string; country?: string; value?: number; rank?: number; tier?: string }

function RankingsPage() {
  const [type, setType] = useState<T>("userDamages");
  const defaults = { rankingType: type, limit: 50 };
  const { body, apply } = useApiBody<Record<string, unknown>>(defaults);
  const q = useWarEra<{ items?: Item[] }>("/ranking.getRanking", body);
  const call: ApiCall = {
    endpoint: "/ranking.getRanking", request: body, data: q.data, error: q.error,
    editable: true, defaults, onApply: apply, onReload: () => q.refetch(),
  };
  const isUser = type.startsWith("user") || type.startsWith("weeklyUser");

  return (
    <div className="max-w-5xl">
      <PageHeader title="Classifiche" description="Top globali" icon={Trophy}
        actions={
          <Select value={type} onValueChange={(v) => setType(v as T)}>
            <SelectTrigger className="w-56 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        }
      />
      <SectionHeader title={type} hint={`${q.data?.items?.length ?? 0}`} onRefresh={() => q.refetch()} busy={q.isFetching} />
      {q.isLoading && <LoadingState />}
      {q.error && <ErrorState error={q.error} />}
      <div className="rounded-md border border-border overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/30 text-muted-foreground"><tr>
            <th className="text-left px-2 py-1.5 w-12">#</th>
            <th className="text-left px-2 py-1.5">{isUser ? "Utente" : "Paese"}</th>
            <th className="text-left px-2 py-1.5">Paese</th>
            <th className="text-right px-2 py-1.5">Valore</th>
            <th className="text-left px-2 py-1.5 w-24">Tier</th>
          </tr></thead>
          <tbody>
            {(q.data?.items ?? []).map((it) => (
              <tr key={it._id} className="border-t border-border/50">
                <td className="px-2 py-1 tabular-nums">{fmtNum(it.rank)}</td>
                <td className="px-2 py-1">{isUser ? <UserLink id={it.user} /> : <CountryLink id={it.country} />}</td>
                <td className="px-2 py-1">{isUser ? <CountryLink id={it.country} /> : "—"}</td>
                <td className="px-2 py-1 text-right tabular-nums">{fmtNum(it.value)}</td>
                <td className="px-2 py-1"><TierBadge tier={it.tier} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ApiInfo calls={[call]} />
    </div>
  );
}
