import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, ApiInfo, SectionHeader, useApiBody, type ApiCall } from "@/components/warera-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/app/warera/companies/")({ component: CompaniesPage });

function CompaniesPage() {
  const { profile } = useAuth();
  const myWid = profile?.warera_user_id ?? "";
  const [userId, setUserId] = useState(myWid);
  const [active, setActive] = useState(myWid);

  // When profile loads, default to my wid if user hasn't typed anything yet.
  useEffect(() => {
    if (myWid && !userId && !active) {
      setUserId(myWid);
      setActive(myWid);
    }
  }, [myWid, userId, active]);

  const defaults = { userId: active || myWid, perPage: 50 };
  const { body, apply } = useApiBody<Record<string, unknown>>(defaults);
  const q = useWarEra<{ items?: string[] }>(
    body.userId ? "/company.getCompanies" : null,
    body,
  );
  const call: ApiCall = {
    endpoint: "/company.getCompanies", request: body, data: q.data, error: q.error,
    editable: true, defaults, onApply: apply, onReload: () => q.refetch(),
  };

  return (
    <div className="max-w-6xl space-y-4">
      <PageHeader title="Aziende" description="Cerca aziende per utente proprietario" icon={Building2} />
      <Card><CardContent className="pt-4 flex gap-2">
        <Input placeholder="User ID proprietario" value={userId} onChange={(e) => setUserId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setActive(userId)} />
        <Button onClick={() => setActive(userId)} size="sm">Cerca</Button>
      </CardContent></Card>
      <SectionHeader title="Risultati" hint={(body.userId as string) ? `Owner …${(body.userId as string).slice(-6)} · ${q.data?.items?.length ?? 0}` : "Inserisci un User ID"} onRefresh={() => q.refetch()} busy={q.isFetching} />
      {q.isLoading && <LoadingState />}
      {q.error && <ErrorState error={q.error} />}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {(q.data?.items ?? []).map((cid) => (
          <Link key={cid} to="/app/warera/companies/$id" params={{ id: cid }}
            className="rounded-md border border-border p-2.5 bg-muted/10 hover:border-primary/60">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Company</div>
            <code className="text-[11px] font-mono">…{cid.slice(-10)}</code>
          </Link>
        ))}
        {q.data && !q.data.items?.length && <div className="text-xs text-muted-foreground italic col-span-full">Nessuna azienda.</div>}
      </div>
      <ApiInfo calls={[call]} />
    </div>
  );
}
