import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, JsonBlock, fmtDate } from "@/components/warera-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Swords } from "lucide-react";

export const Route = createFileRoute("/app/warera/battles/")({ component: BattlesPage });

interface Battle { _id?: string; name?: string; isActive?: boolean; startedAt?: string }

function BattlesPage() {
  const [tab, setTab] = useState<"active" | "all">("active");
  const params = tab === "active" ? { isActive: true, limit: 30 } : { limit: 30 };
  const { data, isLoading, error } = useWarEra<{ items?: Battle[] }>("/battle.getBattles", params);

  return (
    <div className="max-w-6xl">
      <PageHeader title="Battaglie & Guerre" description="Conflitti in corso e storici" icon={Swords} />
      <Tabs value={tab} onValueChange={(v) => setTab(v as "active" | "all")} className="mb-4">
        <TabsList>
          <TabsTrigger value="active">Attive</TabsTrigger>
          <TabsTrigger value="all">Tutte</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          {isLoading && <LoadingState />}
          {error && <ErrorState error={error} />}
          {data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(data.items ?? []).map((b) => (
                <Link key={b._id} to="/app/warera/battles/$id" params={{ id: b._id ?? "" }}>
                  <Card className="hover:border-primary/60"><CardContent className="pt-4">
                    <div className="font-semibold">{b.name ?? `Battaglia ${b._id?.slice(-6)}`}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {b.isActive ? <span className="text-success">● ATTIVA</span> : <span>conclusa</span>} · {fmtDate(b.startedAt)}
                    </div>
                  </CardContent></Card>
                </Link>
              ))}
            </div>
          )}
          {data && <details className="mt-4"><summary className="text-sm text-muted-foreground cursor-pointer">JSON raw</summary><JsonBlock data={data} /></details>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
