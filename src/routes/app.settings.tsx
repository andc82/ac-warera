import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({ component: SettingsPage });

function SettingsPage() {
  const { profile, user, refresh } = useAuth();
  const [name, setName] = useState(profile?.name ?? "");
  const [wid, setWid] = useState(profile?.warera_user_id ?? "");
  const [key, setKey] = useState(profile?.api_key ?? "");
  const [pwd, setPwd] = useState("");
  const [pwdc, setPwdc] = useState("");
  const [saving, setSaving] = useState(false);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim() || !wid.trim() || !key.trim()) return toast.error("Nome, UserId e API Key sono obbligatori");
    if (pwd && pwd !== pwdc) return toast.error("Le password non coincidono");
    if (pwd && pwd.length < 8) return toast.error("Password minimo 8 caratteri");
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), warera_user_id: wid.trim(), api_key: key.trim() })
      .eq("id", user.id);
    if (error) { setSaving(false); return toast.error(error.message); }
    if (pwd) {
      const { error: pe } = await supabase.auth.updateUser({ password: pwd });
      if (pe) { setSaving(false); return toast.error(pe.message); }
    }
    await refresh();
    setSaving(false);
    setPwd(""); setPwdc("");
    toast.success("Profilo aggiornato");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Gestisci i dati del tuo profilo.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Profilo</CardTitle>
          <CardDescription>Email: {user?.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSave} className="space-y-4">
            <Field label="Nome"><Input value={name} onChange={(e) => setName(e.target.value)} required /></Field>
            <Field label="UserId (War Era)"><Input value={wid} onChange={(e) => setWid(e.target.value)} required /></Field>
            <Field label="API Key (War Era)"><Input value={key} onChange={(e) => setKey(e.target.value)} required /></Field>
            <div className="border-t border-border pt-4 space-y-4">
              <p className="text-sm text-muted-foreground">Lascia vuoto per non cambiare la password.</p>
              <Field label="Nuova password"><Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} autoComplete="new-password" /></Field>
              <Field label="Conferma password"><Input type="password" value={pwdc} onChange={(e) => setPwdc(e.target.value)} autoComplete="new-password" /></Field>
            </div>
            <Button type="submit" disabled={saving}>{saving ? "Salvataggio…" : "Salva modifiche"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
