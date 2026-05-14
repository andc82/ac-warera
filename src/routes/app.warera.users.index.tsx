import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, ApiInfo, SectionHeader, fmtRelative, useApiBody, type ApiCall } from "@/components/warera-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export const Route = createFileRoute("/app/warera/users/")({ component: UsersPage });

function UsersPage() {
  const { profile } = useAuth();
  const [countryId, setCountryId] = useState("");
  const defaults = countryId ? { countryId, perPage: 30 } : { perPage: 30 };
  const { body, apply } = useApiBody<Record<string, unknown>>(defaults);
  const q = useWarEra<{ items?: { _id: string; createdAt?: string }[] }>(
    countryId || (body.countryId as string) ? "/user.getUsersByCountry" : null,
    body,
  );
  const call: ApiCall = {
    endpoint: "/user.getUsersByCountry", request: body, data: q.data, error: q.error,
    editable: true, defaults, onApply: apply, onReload: () => q.refetch(),
  };

  return (
    <div className="max-w-5xl space-y-4">
      <PageHeader title="Utenti" description="Cerca cittadini per Country ID o vai al tuo profilo." icon={Users}
        actions={profile?.warera_user_id && (
          <Link to="/app/warera/users/$id" params={{ id: profile.warera_user_id }}>
            <Button variant="outline" size="sm">Vai al mio profilo</Button>
          </Link>
        )} />
      <Card><CardContent className="pt-4 flex gap-2">
        <Input placeholder="Country ID (vedi /app/warera/countries)" value={countryId} onChange={(e) => setCountryId(e.target.value)} />
      </CardContent></Card>
      {countryId && <SectionHeader title="Cittadini" hint={`${q.data?.items?.length ?? 0} ultimi iscritti`} onRefresh={() => q.refetch()} busy={q.isFetching} />}
      {q.isLoading && <LoadingState />}
      {q.error && <ErrorState error={q.error} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {(q.data?.items ?? []).map((u) => (
          <Link key={u._id} to="/app/warera/users/$id" params={{ id: u._id }}>
            <Card className="hover:border-primary/60"><CardContent className="pt-3 pb-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Iscritto {fmtRelative(u.createdAt)}</div>
              <code className="text-[11px] font-mono">…{u._id.slice(-10)}</code>
            </CardContent></Card>
          </Link>
        ))}
        {q.data && !q.data.items?.length && countryId && <div className="text-xs text-muted-foreground italic col-span-full">Nessun utente trovato.</div>}
      </div>
      {countryId && <ApiInfo calls={[call]} />}
    </div>
  );
}
