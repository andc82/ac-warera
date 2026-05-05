import { createFileRoute, Link } from "@tanstack/react-router";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, StatTile, JsonBlock, fmtNum } from "@/components/warera-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from "lucide-react";

export const Route = createFileRoute("/app/warera/users/$id")({ component: UserDetail });

function UserDetail() {
  const { id } = Route.useParams();
  const { data: u, isLoading, error } = useWarEra<Record<string, unknown>>("/user.getUserById", { userId: id });
  const { data: lite } = useWarEra<unknown>("/user.getUserLite", { userId: id });
  const { data: equip } = useWarEra<unknown>("/inventory.fetchCurrentEquipment", { userId: id });
  const { data: workers } = useWarEra<unknown>("/worker.getWorkers", { userId: id });
  const { data: companies } = useWarEra<{ items?: { _id?: string; name?: string }[] }>("/company.getCompanies", { userId: id, perPage: 50 });
  const { data: tx } = useWarEra<unknown>("/transaction.getPaginatedTransactions", { userId: id, limit: 20 });

  return (
    <div className="max-w-6xl">
      <PageHeader title={(u?.name as string) ?? "Utente"} description={`ID: ${id}`} icon={Users}
        actions={<Link to="/app/warera/users" className="text-sm text-primary hover:underline">← Indietro</Link>} />
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {u && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatTile label="Livello" value={fmtNum(u.level)} />
            <StatTile label="XP" value={fmtNum(u.xp)} />
            <StatTile label="Oro" value={fmtNum(u.gold)} />
            <StatTile label="Aziende" value={fmtNum(companies?.items?.length)} />
          </div>
          <Tabs defaultValue="info">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="lite">Lite</TabsTrigger>
              <TabsTrigger value="equip">Equipaggiamento</TabsTrigger>
              <TabsTrigger value="workers">Workers</TabsTrigger>
              <TabsTrigger value="companies">Aziende</TabsTrigger>
              <TabsTrigger value="tx">Transazioni</TabsTrigger>
            </TabsList>
            <TabsContent value="info"><Card><CardContent className="pt-6"><JsonBlock data={u} /></CardContent></Card></TabsContent>
            <TabsContent value="lite"><Card><CardContent className="pt-6"><JsonBlock data={lite} /></CardContent></Card></TabsContent>
            <TabsContent value="equip"><Card><CardContent className="pt-6"><JsonBlock data={equip} /></CardContent></Card></TabsContent>
            <TabsContent value="workers"><Card><CardContent className="pt-6"><JsonBlock data={workers} /></CardContent></Card></TabsContent>
            <TabsContent value="companies">
              <Card><CardHeader><CardTitle>Aziende ({companies?.items?.length ?? 0})</CardTitle></CardHeader><CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {(companies?.items ?? []).map((c) => (
                    <Link key={c._id} to="/app/warera/companies/$id" params={{ id: c._id ?? "" }}
                      className="border border-border rounded p-2 hover:border-primary/60">
                      <div className="font-medium">{c.name ?? c._id}</div>
                    </Link>
                  ))}
                </div>
                <JsonBlock data={companies} />
              </CardContent></Card>
            </TabsContent>
            <TabsContent value="tx"><Card><CardContent className="pt-6"><JsonBlock data={tx} /></CardContent></Card></TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
