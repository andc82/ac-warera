import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", warera_user_id: "", api_key: "" });
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error("Le password non coincidono");
    if (form.password.length < 8) return toast.error("La password deve avere almeno 8 caratteri");
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          name: form.name,
          warera_user_id: form.warera_user_id,
          api_key: form.api_key,
          role: "viewer",
        },
      },
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Registrazione completata. Effettua il login.");
    nav({ to: "/login" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-background via-background to-secondary/40">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-6">
          <UserPlus className="h-9 w-9 text-primary" />
          <h1 className="text-2xl font-bold">Nuovo Viewer</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Registrazione</CardTitle>
            <CardDescription>Le nuove utenze hanno ruolo <strong>viewer</strong>.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-3">
              <Field label="Nome"><Input required value={form.name} onChange={set("name")} /></Field>
              <Field label="Login (email)"><Input type="email" required value={form.email} onChange={set("email")} /></Field>
              <Field label="Password"><Input type="password" required value={form.password} onChange={set("password")} /></Field>
              <Field label="Conferma password"><Input type="password" required value={form.confirm} onChange={set("confirm")} /></Field>
              <Field label="UserId (War Era)"><Input value={form.warera_user_id} onChange={set("warera_user_id")} placeholder="es. 69d9744b02ab9ef04637eb3c" /></Field>
              <Field label="API Key (War Era)"><Input value={form.api_key} onChange={set("api_key")} placeholder="wae_…" /></Field>
              <Button type="submit" disabled={submitting} className="w-full mt-2">
                {submitting ? "Registrazione…" : "Registrati"}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Hai già un account? <Link to="/login" className="text-primary hover:underline">Accedi</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
