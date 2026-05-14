import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, RefreshCw, ChevronDown, Code2 } from "lucide-react";
import { ReactNode } from "react";
import { useWarEra } from "@/hooks/use-warera";

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

export function fmtMoney(n: unknown): string {
  if (typeof n !== "number" || !isFinite(n)) return "—";
  return new Intl.NumberFormat("it-IT", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(n);
}

export function fmtPct(n: unknown): string {
  if (typeof n !== "number" || !isFinite(n)) return "—";
  return `${n.toFixed(2)}%`;
}

export function fmtDate(d: unknown): string {
  if (!d) return "—";
  try { return new Date(d as string).toLocaleString("it-IT"); } catch { return "—"; }
}

export function fmtRelative(d: unknown): string {
  if (!d) return "—";
  try {
    const t = new Date(d as string).getTime();
    const diff = Date.now() - t;
    const m = Math.round(diff / 60000);
    if (m < 1) return "ora";
    if (m < 60) return `${m}m fa`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h}h fa`;
    const d2 = Math.round(h / 24);
    return `${d2}g fa`;
  } catch { return "—"; }
}

export function RefreshBtn({ onClick, busy, label = "Ricarica" }: { onClick: () => void; busy?: boolean; label?: string }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={busy} className="h-8 gap-1.5">
      <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
      <span className="text-xs">{label}</span>
    </Button>
  );
}

export function SectionHeader({ icon: Icon, title, hint, onRefresh, busy, right }: {
  icon?: React.ComponentType<{ className?: string }>; title: string; hint?: string;
  onRefresh?: () => void; busy?: boolean; right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 mb-2">
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon className="h-4 w-4 text-primary shrink-0" />}
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground truncate">{title}</h2>
        {hint && <span className="text-xs text-muted-foreground/70 truncate">· {hint}</span>}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {right}
        {onRefresh && <RefreshBtn onClick={onRefresh} busy={busy} />}
      </div>
    </div>
  );
}

export interface ApiCall {
  endpoint: string;
  request: Record<string, unknown>;
  data?: unknown;
  error?: unknown;
  /** When provided, an editable JSON body is shown with Apply / Reset / Reload. */
  editable?: boolean;
  /** Default body used by the "Reset ai default" button. Falls back to `request`. */
  defaults?: Record<string, unknown>;
  /** Called when the user clicks "Applica". Receives the parsed JSON body. */
  onApply?: (body: Record<string, unknown>) => void;
  /** Called when the user clicks "Ricarica". Re-runs the request with current params. */
  onReload?: () => void;
}

const MAX_BODY_LEN = 8192;

function ApiCallRow({ c }: { c: ApiCall }) {
  const [text, setText] = useState<string>(() => JSON.stringify(c.request ?? {}, null, 2));
  const [parseErr, setParseErr] = useState<string | null>(null);
  const lastSyncedRef = useRef<string>(JSON.stringify(c.request ?? {}, null, 2));

  // Re-sync editor when external request changes (e.g. after Apply or default load),
  // but don't clobber user typing in progress.
  useEffect(() => {
    const next = JSON.stringify(c.request ?? {}, null, 2);
    if (next !== lastSyncedRef.current && text === lastSyncedRef.current) {
      setText(next);
      setParseErr(null);
    }
    lastSyncedRef.current = next;
  }, [c.request, text]);

  const handleApply = () => {
    if (text.length > MAX_BODY_LEN) {
      setParseErr(`Body troppo lungo (max ${MAX_BODY_LEN} caratteri)`);
      return;
    }
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed !== "object" || Array.isArray(parsed) || parsed === null) {
        setParseErr("Il body deve essere un oggetto JSON");
        return;
      }
      setParseErr(null);
      c.onApply?.(parsed as Record<string, unknown>);
    } catch (e) {
      setParseErr(e instanceof Error ? e.message : String(e));
    }
  };

  const handleReset = () => {
    const def = c.defaults ?? c.request ?? {};
    const next = JSON.stringify(def, null, 2);
    setText(next);
    setParseErr(null);
    c.onApply?.(def as Record<string, unknown>);
  };

  return (
    <Collapsible>
      <div className="rounded-md border border-border/60 bg-muted/10">
        <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left hover:bg-muted/20">
          <div className="flex items-center gap-2 min-w-0">
            <Code2 className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">API</span>
            <code className="text-[11px] font-mono text-foreground/80 truncate">{c.endpoint}</code>
            {c.editable ? <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">editable</Badge> : null}
            {c.error ? <Badge variant="outline" className="text-[10px] border-destructive/40 text-destructive">err</Badge> : null}
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 shrink-0" />
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t border-border/60 px-2.5 py-2 space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Request body</div>
              {c.editable && (
                <div className="flex items-center gap-1">
                  {c.onReload && (
                    <Button type="button" variant="outline" size="sm" className="h-6 px-2 text-[10px]" onClick={c.onReload}>
                      <RefreshCw className="h-3 w-3 mr-1" /> Ricarica
                    </Button>
                  )}
                  <Button type="button" variant="outline" size="sm" className="h-6 px-2 text-[10px]" onClick={handleReset}>
                    Reset default
                  </Button>
                  <Button type="button" size="sm" className="h-6 px-2 text-[10px]" onClick={handleApply}>
                    Applica
                  </Button>
                </div>
              )}
            </div>
            {c.editable ? (
              <>
                <textarea
                  className="w-full font-mono text-[11px] bg-muted/40 border border-border rounded-md p-2 min-h-[80px] focus:outline-none focus:ring-1 focus:ring-primary"
                  value={text}
                  onChange={(e) => { setText(e.target.value); setParseErr(null); }}
                  spellCheck={false}
                  maxLength={MAX_BODY_LEN}
                />
                {parseErr && <div className="text-[10px] text-destructive mt-1">{parseErr}</div>}
              </>
            ) : (
              <JsonBlock data={c.request} />
            )}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Response</div>
            <JsonBlock data={c.error ? { error: String((c.error as Error)?.message ?? c.error) } : c.data} />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function ApiInfo({ calls }: { calls: ApiCall[] }) {
  return (
    <div className="mt-2 space-y-1.5">
      {calls.map((c, i) => <ApiCallRow key={`${c.endpoint}-${i}`} c={c} />)}
    </div>
  );
}

// ---- name resolution hooks ----

interface CountryLite { _id: string; name?: string; code?: string }

export function useCountriesMap() {
  const q = useWarEra<CountryLite[]>("/country.getAllCountries", {}, { staleTime: 5 * 60_000 });
  const map = new Map<string, CountryLite>();
  (q.data ?? []).forEach((c) => map.set(c._id, c));
  return { map, isLoading: q.isLoading };
}

export function CountryLink({ id, fallback = "—", className = "text-primary hover:underline" }: { id?: string | null; fallback?: string; className?: string }) {
  const { map } = useCountriesMap();
  if (!id) return <span>{fallback}</span>;
  const c = map.get(id);
  const label = c?.name ?? `…${id.slice(-6)}`;
  // Link import in caller; render plain anchor handled via wrapper in caller (avoid Link here)
  return <a href={`/app/warera/countries/${id}`} className={className}>{label}{c?.code ? ` (${c.code.toUpperCase()})` : ""}</a>;
}

interface UserLite { _id?: string; username?: string }

export function UserLink({ id, className = "text-primary hover:underline" }: { id?: string | null; className?: string }) {
  const q = useWarEra<UserLite>(id ? "/user.getUserById" : null, { userId: id ?? "" }, { staleTime: 5 * 60_000 });
  if (!id) return <span>—</span>;
  const name = q.data?.username ?? `…${id.slice(-6)}`;
  return <a href={`/app/warera/users/${id}`} className={className}>{name}</a>;
}

interface RegionLite { _id?: string; name?: string; countryCode?: string }

export function RegionLink({ id, className = "text-primary hover:underline" }: { id?: string | null; className?: string }) {
  const q = useWarEra<RegionLite>(id ? "/region.getById" : null, { regionId: id ?? "" }, { staleTime: 5 * 60_000 });
  if (!id) return <span>—</span>;
  const name = q.data?.name ?? `…${id.slice(-6)}`;
  return <a href={`/app/warera/regions/${id}`} className={className}>{name}</a>;
}

export function TierBadge({ tier }: { tier?: string }) {
  if (!tier) return null;
  const cls: Record<string, string> = {
    diamond: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    master: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
    platinum: "bg-cyan-400/15 text-cyan-200 border-cyan-400/30",
    gold: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    silver: "bg-slate-400/15 text-slate-300 border-slate-400/30",
    bronze: "bg-amber-700/15 text-amber-400 border-amber-700/30",
  };
  return <Badge variant="outline" className={`text-[10px] capitalize ${cls[tier] ?? ""}`}>{tier}</Badge>;
}
