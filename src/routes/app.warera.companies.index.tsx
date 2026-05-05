import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, JsonBlock } from "@/components/warera-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/app/warera/companies/")({ component: CompaniesPage });

function CompaniesPage() {
  const { profile } = useAuth();
  const [userId, setUserId] = useState(profile?.warera_user_id ?? "");
  const { data, isLoading, error } = useWarEra<{ items?: { _id?: string; name?: string }[] }>(
    userId ? "/company.getCompanies" : null, { userId, perPage: 50 });

  return (
    <div className="max-w-6xl">
      <PageHeader title="Aziende" description="Aziende per utente proprietario" icon={Building2} />
      <Card className="mb-6"><CardContent className="pt-6"><Input placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} /></CardContent></Card>
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(data.items ?? []).map((c) => (
            <Link key={c._id} to="/app/warera/companies/$id" params={{ id: c._id ?? "" }}>
              <Card className="hover:border-primary/60"><CardContent className="pt-4">
                <div className="font-semibold truncate">{c.name ?? c._id}</div>
              </CardContent></Card>
            </Link>
          ))}
        </div>
      )}
      {data && <details className="mt-4"><summary className="text-sm text-muted-foreground cursor-pointer">JSON raw</summary><JsonBlock data={data} /></details>}
    </div>
  );
}
