import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useWarEra } from "@/hooks/use-warera";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader, LoadingState, ErrorState, StatTile, fmtNum } from "@/components/warera-ui";
import { LayoutDashboard, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/app/warera/dashboard")({ component: Page });

interface User { _id?: string; name?: string; level?: number; xp?: number; gold?: number; countryId?: string; companyId?: string }

function Page() {
  const { profile } = useAuth();
  const uid = profile?.warera_user_id;
  const { data: me, isLoading, error } = useWarEra<User>(uid ? "/user.getUserById" : null, { userId: uid });
  const { data: countries } = useWarEra<unknown[]>("/country.getAllCountries", {});
  const { data: battles } = useWarEra<{ items?: unknown[] }>("/battle.getBattles", { isActive: true, limit: 5 });

  if (!uid) {
    return (
      <div>
        <PageHeader title="Panoramica War Era" icon={LayoutDashboard} />
        <Card className="border-warning/40 bg-warning/5">
          <CardHeader>
            <div className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-warning" /><CardTitle>UserId mancante</CardTitle></div>
            <CardDescription>
              Imposta il tuo UserId War Era e l'API Key in <Link to="/app/settings" className="text-primary hover:underline">Settings</Link>.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <PageHeader title="Panoramica War Era" description="Dati centrati sul tuo account." icon={LayoutDashboard} />
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {me && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatTile label="Cittadino" value={me.name ?? "—"} />
          <StatTile label="Livello" value={fmtNum(me.level)} />
          <StatTile label="XP" value={fmtNum(me.xp)} />
          <StatTile label="Oro" value={fmtNum(me.gold)} />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatTile label="Paesi nel mondo" value={fmtNum(countries?.length)} />
        <StatTile label="Battaglie attive" value={fmtNum(battles?.items?.length)} />
        <StatTile label="Tuo paese" value={me?.countryId ? <Link className="text-primary hover:underline" to="/app/warera/countries/$id" params={{ id: me.countryId }}>Apri →</Link> : "—"} />
      </div>
    </div>
  );
}
