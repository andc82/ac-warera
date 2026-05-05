import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Globe2, Map, Swords, Newspaper, Coins, Users, Trophy } from "lucide-react";

export const Route = createFileRoute("/app/dashboard")({ component: Dashboard });

function Dashboard() {
  const { profile, isAdmin } = useAuth();
  const tiles = [
    { to: "/app/warera/me", label: "Il mio profilo", icon: Shield, desc: "Dati personali War Era" },
    { to: "/app/warera/countries", label: "Paesi", icon: Globe2, desc: "Tutti i paesi del mondo" },
    { to: "/app/warera/regions", label: "Regioni", icon: Map, desc: "Mappa regioni e battaglie" },
    { to: "/app/warera/battles", label: "Battaglie", icon: Swords, desc: "Conflitti attivi e storici" },
    { to: "/app/warera/users", label: "Utenti", icon: Users, desc: "Cerca cittadini e leader" },
    { to: "/app/warera/articles", label: "Articoli", icon: Newspaper, desc: "Stampa e propaganda" },
    { to: "/app/warera/items", label: "Mercato", icon: Coins, desc: "Prezzi e ordini" },
    { to: "/app/warera/rankings", label: "Classifiche", icon: Trophy, desc: "Top giocatori" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <header>
        <h1 className="text-3xl font-bold">Benvenuto, {profile?.name}</h1>
        <p className="text-muted-foreground">Sei loggato come <strong>{isAdmin ? "Admin" : "Viewer"}</strong>.</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to}>
            <Card className="hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5 transition-all h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <t.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{t.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{t.desc}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
