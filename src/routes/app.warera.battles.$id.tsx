import { createFileRoute, Link } from "@tanstack/react-router";
import { useWarEra } from "@/hooks/use-warera";
import { useAuth } from "@/lib/auth-context";
import { PageHeader, LoadingState, ErrorState, JsonBlock } from "@/components/warera-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Swords } from "lucide-react";

export const Route = createFileRoute("/app/warera/battles/$id")({ component: BattleDetail });

function BattleDetail() {
  const { id } = Route.useParams();
  const { profile } = useAuth();
  const { data, isLoading, error } = useWarEra<Record<string, unknown>>("/battle.getById", { battleId: id });
  const { data: live } = useWarEra<unknown>("/battle.getLiveBattleData", { battleId: id });
  const { data: orders } = useWarEra<unknown>("/battleOrder.getByBattle", { battleId: id });
  const { data: ranking } = useWarEra<unknown>("/battleRanking.getRanking", { battleId: id });
  const { data: loot } = useWarEra<unknown>(
    profile?.warera_user_id ? "/battleLootSummary.getByBattleAndUser" : null,
    { battleId: id, userId: profile?.warera_user_id }
  );

  return (
    <div className="max-w-6xl">
      <PageHeader title={(data?.name as string) ?? "Battaglia"} description={`ID: ${id}`} icon={Swords}
        actions={<Link to="/app/warera/battles" className="text-sm text-primary hover:underline">← Indietro</Link>} />
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data && (
        <Tabs defaultValue="info">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="orders">Ordini</TabsTrigger>
            <TabsTrigger value="ranking">Classifica</TabsTrigger>
            <TabsTrigger value="loot">Mio bottino</TabsTrigger>
          </TabsList>
          <TabsContent value="info"><Card><CardContent className="pt-6"><JsonBlock data={data} /></CardContent></Card></TabsContent>
          <TabsContent value="live"><Card><CardHeader><CardTitle>Live</CardTitle></CardHeader><CardContent><JsonBlock data={live} /></CardContent></Card></TabsContent>
          <TabsContent value="orders"><Card><CardContent className="pt-6"><JsonBlock data={orders} /></CardContent></Card></TabsContent>
          <TabsContent value="ranking"><Card><CardContent className="pt-6"><JsonBlock data={ranking} /></CardContent></Card></TabsContent>
          <TabsContent value="loot"><Card><CardContent className="pt-6"><JsonBlock data={loot} /></CardContent></Card></TabsContent>
        </Tabs>
      )}
    </div>
  );
}
