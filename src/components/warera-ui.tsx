import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";
import { ReactNode } from "react";

export function PageHeader({ title, description, icon: Icon, actions }: {
  title: string; description?: string; icon?: React.ComponentType<{ className?: string }>; actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div className="flex items-start gap-3">
        {Icon && <Icon className="h-7 w-7 text-primary mt-0.5" />}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}

export function LoadingState({ label = "Caricamento dati War Era…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
      <Loader2 className="h-5 w-5 animate-spin" /> {label}
    </div>
  );
}

export function ErrorState({ error }: { error: unknown }) {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardHeader>
        <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /><CardTitle className="text-destructive">Errore API</CardTitle></div>
        <CardDescription className="break-all">{msg}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export function EmptyState({ label = "Nessun dato disponibile." }: { label?: string }) {
  return <div className="text-center text-muted-foreground py-12 italic">{label}</div>;
}

export function StatTile({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="uppercase text-[11px] tracking-wider">{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      {hint && <CardContent className="pt-0 text-xs text-muted-foreground">{hint}</CardContent>}
    </Card>
  );
}

export function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="text-xs bg-muted/40 border border-border rounded-md p-3 overflow-auto max-h-[60vh]">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export function fmtNum(n: unknown): string {
  if (typeof n !== "number" || !isFinite(n)) return "—";
  return new Intl.NumberFormat("it-IT", { maximumFractionDigits: 2 }).format(n);
}

export function fmtDate(d: unknown): string {
  if (!d) return "—";
  try { return new Date(d as string).toLocaleString("it-IT"); } catch { return "—"; }
}
