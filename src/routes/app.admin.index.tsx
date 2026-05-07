import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { clearSettingsCache } from "@/lib/warera-api";

export const Route = createFileRoute("/app/admin/")({ component: AdminSettings });

function AdminSettings() {
  const { isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const [url, setUrl] = useState("");
  const [server, setServer] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) nav({ to: "/app/dashboard" });
  }, [isAdmin, loading, nav]);

  useEffect(() => {
    supabase.from("app_settings").select("api_url,api_server").eq("id", 1).maybeSingle().then(({ data }) => {
      if (data) { setUrl(data.api_url); setServer(data.api_server); }
      setLoaded(true);
    });
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("app_settings").update({ api_url: url, api_server: server, updated_at: new Date().toISOString() }).eq("id", 1);
    setSaving(false);
    if (error) return toast.error(error.message);
    clearSettingsCache();
    toast.success("Settings globali aggiornati");
  };

  if (!isAdmin || !loaded) return <div className="text-muted-foreground">Caricamento…</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Admin · Settings globali</h1>
        <p className="text-muted-foreground">Configurazione delle chiamate alle API War Era.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Endpoint</CardTitle>
          <CardDescription>Le chiamate vengono composte come <code>Url + Server + Endpoint</code>.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Url</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api2.warera.io" required />
            </div>
            <div className="space-y-1.5">
              <Label>Server</Label>
              <Input value={server} onChange={(e) => setServer(e.target.value)} placeholder="/trpc" required />
            </div>
            <div className="rounded-md border border-border bg-muted/40 p-3 text-sm font-mono break-all">
              {url}{server}/&lt;endpoint&gt;
            </div>
            <Button type="submit" disabled={saving}>{saving ? "Salvataggio…" : "Salva"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
