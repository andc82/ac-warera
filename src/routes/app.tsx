import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter,
  SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Shield, LogOut, Settings, Sliders, LayoutDashboard,
  Globe2, Map, Users, Building2, Briefcase, Swords, Newspaper,
  Coins, ArrowLeftRight, Trophy, Search, UserCog,
} from "lucide-react";

export const Route = createFileRoute("/app")({ component: AppLayout });

const wareraItems = [
  { to: "/app/warera/dashboard", label: "Panoramica", icon: LayoutDashboard },
  { to: "/app/warera/me", label: "Il mio profilo", icon: Shield },
  { to: "/app/warera/countries", label: "Paesi", icon: Globe2 },
  { to: "/app/warera/regions", label: "Regioni", icon: Map },
  { to: "/app/warera/users", label: "Utenti", icon: Users },
  { to: "/app/warera/companies", label: "Aziende", icon: Building2 },
  { to: "/app/warera/work", label: "Lavoro & Salari", icon: Briefcase },
  { to: "/app/warera/battles", label: "Battaglie & Guerre", icon: Swords },
  { to: "/app/warera/articles", label: "Articoli", icon: Newspaper },
  { to: "/app/warera/items", label: "Oggetti & Prezzi", icon: Coins },
  { to: "/app/warera/transactions", label: "Transazioni", icon: ArrowLeftRight },
  { to: "/app/warera/rankings", label: "Classifiche", icon: Trophy },
  { to: "/app/warera/search", label: "Ricerca", icon: Search },
];

function AppLayout() {
  const { session, loading, profile, isAdmin, signOut } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !session) nav({ to: "/login" });
  }, [loading, session, nav]);

  if (loading || !session) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Caricamento…</div>;
  }

  const isActive = (to: string) => path === to || path.startsWith(to + "/");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <Link to="/app/dashboard" className="flex items-center gap-2 px-2 py-2">
              <Shield className="h-6 w-6 text-primary shrink-0" />
              <div className="flex flex-col leading-tight">
                <span className="font-bold tracking-tight">AC War Era</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Dashboard</span>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Generale</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <Item to="/app/dashboard" icon={LayoutDashboard} label="Dashboard" active={isActive("/app/dashboard")} />
                  <Item to="/app/settings" icon={Settings} label="Settings" active={isActive("/app/settings")} />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>War Era</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {wareraItems.map((it) => (
                    <Item key={it.to} to={it.to} icon={it.icon} label={it.label} active={isActive(it.to)} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {isAdmin && (
              <SidebarGroup>
                <SidebarGroupLabel>Admin</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <Item to="/app/admin" icon={Sliders} label="Settings globali" active={isActive("/app/admin") && !isActive("/app/admin/users")} />
                    <Item to="/app/admin/users" icon={UserCog} label="Utenti" active={isActive("/app/admin/users")} />

                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
          <SidebarFooter>
            <div className="px-2 py-2 text-xs text-muted-foreground truncate">
              <div className="font-medium text-foreground truncate">{profile?.name ?? session.user.email}</div>
              <div className="truncate">{isAdmin ? "Admin" : "Viewer"}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => signOut().then(() => nav({ to: "/login" }))} className="justify-start">
              <LogOut className="h-4 w-4" /> Esci
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col">
          <header className="h-12 flex items-center gap-2 border-b border-border/60 px-3 sticky top-0 z-10 bg-background/80 backdrop-blur">
            <SidebarTrigger />
            <div className="text-sm text-muted-foreground">War Era Command</div>
          </header>
          <main className="flex-1 p-4 md:p-6"><Outlet /></main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function Item({ to, icon: Icon, label, active }: { to: string; icon: React.ComponentType<{ className?: string }>; label: string; active: boolean }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={label}>
        <Link to={to} className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
