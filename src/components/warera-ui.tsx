import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";
import { ReactNode } from "react";

export function PageHeader({ title, description, icon: Icon, actions }: {
  title: string; description?: string; icon?: React.ComponentType<{ className?: string }>; actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-border/60">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-primary" />}
        <div>
          <h1 className="text-lg md:text-xl font-semibold tracking-tight leading-tight">{title}</h1>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-1.5">{actions}</div>}
    </header>
  );
}

export function LoadingState({ label = "Caricamento dati War Era…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground py-6 justify-center">
      <Loader2 className="h-4 w-4 animate-spin" /> {label}
    </div>
  );
}

export function ErrorState({ error }: { error: unknown }) {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardHeader>
        <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /><CardTitle className="text-destructive text-sm">Errore API</CardTitle></div>
        <CardDescription className="break-all text-xs">{msg}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export function EmptyState({ label = "Nessun dato disponibile." }: { label?: string }) {
  return <div className="text-center text-xs text-muted-foreground py-8 italic">{label}</div>;
}

export function StatTile({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Card className="py-2.5">
      <CardHeader className="pb-1 gap-0.5">
        <CardDescription className="uppercase text-[10px] tracking-wider">{label}</CardDescription>
        <CardTitle className="text-lg tabular-nums leading-tight">{value}</CardTitle>
      </CardHeader>
      {hint && <CardContent className="pt-0 text-[11px] text-muted-foreground">{hint}</CardContent>}
    </Card>
  );
}

export function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="text-[11px] bg-muted/40 border border-border rounded-md p-2.5 overflow-auto max-h-[60vh]">
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
