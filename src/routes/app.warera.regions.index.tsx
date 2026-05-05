import { createFileRoute, Link } from "@tanstack/react-router";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState } from "@/components/warera-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Map } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/app/warera/regions/")({ component: RegionsPage });

interface Region { _id?: string; id?: string; name?: string; countryId?: string; }

function RegionsPage() {
  const { data, isLoading, error } = useWarEra<Region[] | Record<string, Region>>("/region.getRegionsObject", {});
  const arr = useMemo(() => Array.isArray(data) ? data : Object.values(data ?? {}), [data]);
  const [q, setQ] = useState("");
  const list = useMemo(() => arr.filter((r) => (r.name ?? "").toLowerCase().includes(q.toLowerCase())), [arr, q]);

  return (
    <div>
      <PageHeader title="Regioni" description={`${arr.length} regioni`} icon={Map}
        actions={<Input className="w-64" placeholder="Cerca regione…" value={q} onChange={(e) => setQ(e.target.value)} />} />
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {list.slice(0, 200).map((r) => {
          const id = r._id ?? r.id ?? "";
          return (
            <Link key={id} to="/app/warera/regions/$id" params={{ id }}>
              <Card className="hover:border-primary/60 transition-colors">
                <CardContent className="pt-4">
                  <div className="font-semibold truncate">{r.name ?? id}</div>
                  <div className="text-xs text-muted-foreground truncate">{r.countryId ?? ""}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      {list.length > 200 && <p className="text-xs text-muted-foreground mt-3">Mostrate prime 200 di {list.length}.</p>}
    </div>
  );
}
