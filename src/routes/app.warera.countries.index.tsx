import { createFileRoute, Link } from "@tanstack/react-router";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, EmptyState } from "@/components/warera-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Globe2 } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/app/warera/countries/")({ component: CountriesList });

interface Country { _id?: string; id?: string; name?: string; code?: string; flag?: string; population?: number; }

function CountriesList() {
  const { data, isLoading, error } = useWarEra<Country[]>("/country.getAllCountries", {});
  const [q, setQ] = useState("");
  const list = useMemo(() => (data ?? []).filter((c) => (c.name ?? "").toLowerCase().includes(q.toLowerCase())), [data, q]);

  return (
    <div>
      <PageHeader title="Paesi" description="Tutti i paesi del mondo War Era" icon={Globe2}
        actions={<Input className="w-64" placeholder="Cerca paese…" value={q} onChange={(e) => setQ(e.target.value)} />}
      />
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data && list.length === 0 && <EmptyState />}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {list.map((c) => {
          const id = c._id ?? c.id ?? "";
          return (
            <Link key={id} to="/app/warera/countries/$id" params={{ id }}>
              <Card className="hover:border-primary/60 transition-colors h-full">
                <CardContent className="pt-4 flex items-center gap-3">
                  {c.flag && <img src={c.flag} alt={c.name} className="h-8 w-12 object-cover rounded border border-border" loading="lazy" />}
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{c.name ?? id}</div>
                    {c.code && <div className="text-xs text-muted-foreground">{c.code}</div>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
