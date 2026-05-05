import { createFileRoute, Link } from "@tanstack/react-router";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, StatTile, JsonBlock, fmtNum } from "@/components/warera-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe2 } from "lucide-react";

export const Route = createFileRoute("/app/warera/countries/$id")({ component: CountryDetail });

function CountryDetail() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useWarEra<Record<string, unknown>>("/country.getCountryById", { countryId: id });
  const { data: gov } = useWarEra<unknown>("/government.getByCountryId", { countryId: id });
  const { data: users } = useWarEra<{ items?: unknown[] }>("/user.getUsersByCountry", { countryId: id, perPage: 20 });
  const { data: events } = useWarEra<{ items?: unknown[] }>("/event.getEventsPaginated", { countryId: id, limit: 20 });
  const { data: battles } = useWarEra<{ items?: unknown[] }>("/battle.getBattles", { countryId: id, limit: 20 });

  const c = data ?? {};

  return (
    <div className="max-w-6xl">
      <PageHeader title={(c.name as string) ?? "Paese"} description={`ID: ${id}`} icon={Globe2}
        actions={<Link to="/app/warera/countries" className="text-sm text-primary hover:underline">← Tutti i paesi</Link>} />
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatTile label="Codice" value={(c.code as string) ?? "—"} />
            <StatTile label="Popolazione" value={fmtNum(c.population)} />
            <StatTile label="Cittadini (sample)" value={fmtNum(users?.items?.length)} />
            <StatTile label="Eventi recenti" value={fmtNum(events?.items?.length)} />
          </div>
          <Tabs defaultValue="info">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="gov">Governo</TabsTrigger>
              <TabsTrigger value="users">Cittadini</TabsTrigger>
              <TabsTrigger value="battles">Battaglie</TabsTrigger>
              <TabsTrigger value="events">Eventi</TabsTrigger>
            </TabsList>
            <TabsContent value="info"><Card><CardContent className="pt-6"><JsonBlock data={c} /></CardContent></Card></TabsContent>
            <TabsContent value="gov"><Card><CardContent className="pt-6"><JsonBlock data={gov} /></CardContent></Card></TabsContent>
            <TabsContent value="users">
              <Card><CardHeader><CardTitle>Cittadini</CardTitle></CardHeader><CardContent><JsonBlock data={users} /></CardContent></Card>
            </TabsContent>
            <TabsContent value="battles">
              <Card><CardHeader><CardTitle>Battaglie</CardTitle></CardHeader><CardContent><JsonBlock data={battles} /></CardContent></Card>
            </TabsContent>
            <TabsContent value="events">
              <Card><CardHeader><CardTitle>Eventi</CardTitle></CardHeader><CardContent><JsonBlock data={events} /></CardContent></Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
