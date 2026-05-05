import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, JsonBlock } from "@/components/warera-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export const Route = createFileRoute("/app/warera/users/")({ component: UsersPage });

function UsersPage() {
  const { profile } = useAuth();
  const [countryId, setCountryId] = useState("");
  const params = countryId ? { countryId, perPage: 50 } : null;
  const { data, isLoading, error } = useWarEra<{ items?: { _id?: string; name?: string }[] }>(params ? "/user.getUsersByCountry" : null, params ?? {});

  return (
    <div className="max-w-6xl">
      <PageHeader title="Utenti" description="Cerca cittadini per paese o vai al tuo profilo." icon={Users}
        actions={profile?.warera_user_id && (
          <Link to="/app/warera/users/$id" params={{ id: profile.warera_user_id }}>
            <Button variant="outline" size="sm">Vai al mio profilo</Button>
          </Link>
        )} />
      <Card className="mb-6">
        <CardContent className="pt-6 flex gap-2">
          <Input placeholder="Country ID" value={countryId} onChange={(e) => setCountryId(e.target.value)} />
        </CardContent>
      </Card>
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(data.items ?? []).map((u) => (
            <Link key={u._id} to="/app/warera/users/$id" params={{ id: u._id ?? "" }}>
              <Card className="hover:border-primary/60"><CardContent className="pt-4">
                <div className="font-semibold truncate">{u.name ?? u._id}</div>
                <div className="text-xs text-muted-foreground truncate">{u._id}</div>
              </CardContent></Card>
            </Link>
          ))}
        </div>
      )}
      {data && (data.items?.length ?? 0) === 0 && countryId && <p className="text-muted-foreground">Nessun utente trovato.</p>}
      {data && <details className="mt-4"><summary className="text-sm text-muted-foreground cursor-pointer">JSON raw</summary><JsonBlock data={data} /></details>}
    </div>
  );
}
