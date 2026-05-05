import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, StatTile, JsonBlock, fmtNum } from "@/components/warera-ui";
import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/app/warera/me")({ component: MePage });

interface User { _id?: string; name?: string; level?: number; xp?: number; gold?: number; countryId?: string; muId?: string }

function MePage() {
  const { profile } = useAuth();
  const uid = profile?.warera_user_id ?? "";
  const { data: me, isLoading, error } = useWarEra<User>(uid ? "/user.getUserById" : null, { userId: uid });
  const { data: lite } = useWarEra<unknown>(uid ? "/user.getUserLite" : null, { userId: uid });
  const { data: equip } = useWarEra<unknown>(uid ? "/inventory.fetchCurrentEquipment" : null, { userId: uid });
  const { data: workers } = useWarEra<unknown>(uid ? "/worker.getTotalWorkersCount" : null, { userId: uid });
  const { data: companies } = useWarEra<{ items?: unknown[] }>(uid ? "/company.getCompanies" : null, { userId: uid, perPage: 50 });

  return (
    <div className="max-w-6xl">
      <PageHeader title="Il mio profilo" description={`UserId: ${uid || "non impostato"}`} icon={Shield} />
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {me && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatTile label="Nome" value={me.name ?? "—"} />
            <StatTile label="Livello" value={fmtNum(me.level)} />
            <StatTile label="XP" value={fmtNum(me.xp)} />
            <StatTile label="Oro" value={fmtNum(me.gold)} />
            <StatTile label="Workers" value={fmtNum((workers as { count?: number })?.count ?? workers as number)} />
            <StatTile label="Aziende" value={fmtNum(companies?.items?.length)} />
            <StatTile label="Paese" value={me.countryId ? <Link className="text-primary hover:underline" to="/app/warera/countries/$id" params={{ id: me.countryId }}>{me.countryId.slice(-6)}</Link> : "—"} />
            <StatTile label="MU" value={me.muId ?? "—"} />
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Dati</TabsTrigger>
              <TabsTrigger value="equipment">Equipaggiamento</TabsTrigger>
              <TabsTrigger value="lite">Versione Lite</TabsTrigger>
              <TabsTrigger value="companies">Aziende</TabsTrigger>
            </TabsList>
            <TabsContent value="overview"><Card><CardContent className="pt-6"><JsonBlock data={me} /></CardContent></Card></TabsContent>
            <TabsContent value="equipment"><Card><CardContent className="pt-6"><JsonBlock data={equip} /></CardContent></Card></TabsContent>
            <TabsContent value="lite"><Card><CardContent className="pt-6"><JsonBlock data={lite} /></CardContent></Card></TabsContent>
            <TabsContent value="companies">
              <Card>
                <CardHeader><CardTitle>Aziende ({companies?.items?.length ?? 0})</CardTitle></CardHeader>
                <CardContent><JsonBlock data={companies} /></CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
