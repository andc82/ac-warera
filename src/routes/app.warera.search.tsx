import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, JsonBlock } from "@/components/warera-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export const Route = createFileRoute("/app/warera/search")({ component: SearchPage });

function SearchPage() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState("");
  const { data, isLoading, error } = useWarEra<unknown>(active ? "/search.searchAnything" : null, { query: active });

  return (
    <div className="max-w-4xl">
      <PageHeader title="Ricerca" description="Cerca utenti, paesi, regioni, aziende…" icon={Search} />
      <Card className="mb-6">
        <CardContent className="pt-6 flex gap-2">
          <Input placeholder="Termine di ricerca…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setActive(q)} />
          <Button onClick={() => setActive(q)}>Cerca</Button>
        </CardContent>
      </Card>
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data && <Card><CardContent className="pt-6"><JsonBlock data={data} /></CardContent></Card>}
    </div>
  );
}
