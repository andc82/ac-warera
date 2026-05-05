import { createFileRoute, Link } from "@tanstack/react-router";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, JsonBlock } from "@/components/warera-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map } from "lucide-react";

export const Route = createFileRoute("/app/warera/regions/$id")({ component: RegionDetail });

function RegionDetail() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useWarEra<Record<string, unknown>>("/region.getById", { regionId: id });
  const { data: battles } = useWarEra<unknown>("/battle.getBattles", { defenderRegionId: id, limit: 20 });
  const { data: offers } = useWarEra<unknown>("/workOffer.getWorkOffersPaginated", { regionId: id, limit: 20 });
  const { data: upg } = useWarEra<unknown>("/upgrade.getUpgradeByTypeAndEntity", { entityType: "region", entityId: id });

  return (
    <div className="max-w-6xl">
      <PageHeader title={(data?.name as string) ?? "Regione"} description={`ID: ${id}`} icon={Map}
        actions={<Link to="/app/warera/regions" className="text-sm text-primary hover:underline">← Tutte</Link>} />
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data && (
        <Tabs defaultValue="info">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="battles">Battaglie</TabsTrigger>
            <TabsTrigger value="offers">Offerte di lavoro</TabsTrigger>
            <TabsTrigger value="upg">Upgrade</TabsTrigger>
          </TabsList>
          <TabsContent value="info"><Card><CardContent className="pt-6"><JsonBlock data={data} /></CardContent></Card></TabsContent>
          <TabsContent value="battles"><Card><CardHeader><CardTitle>Battaglie</CardTitle></CardHeader><CardContent><JsonBlock data={battles} /></CardContent></Card></TabsContent>
          <TabsContent value="offers"><Card><CardHeader><CardTitle>Offerte</CardTitle></CardHeader><CardContent><JsonBlock data={offers} /></CardContent></Card></TabsContent>
          <TabsContent value="upg"><Card><CardHeader><CardTitle>Upgrade</CardTitle></CardHeader><CardContent><JsonBlock data={upg} /></CardContent></Card></TabsContent>
        </Tabs>
      )}
    </div>
  );
}
