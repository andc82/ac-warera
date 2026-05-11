import { createFileRoute, Link } from "@tanstack/react-router";
import { useWarEra } from "@/hooks/use-warera";
import {
  PageHeader, LoadingState, ErrorState, StatTile, ApiInfo, SectionHeader,
  UserLink, RegionLink, fmtNum, fmtMoney, fmtRelative, type ApiCall,
} from "@/components/warera-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users as UsersIcon, Briefcase } from "lucide-react";

export const Route = createFileRoute("/app/warera/companies/$id")({ component: CompanyDetail });

interface Company {
  _id?: string; name?: string; user?: string; region?: string; itemCode?: string;
  production?: number; estimatedValue?: number; concreteInvested?: number;
  isFull?: boolean; workerCount?: number; createdAt?: string;
  activeUpgradeLevels?: Record<string, number>;
}
interface Worker { _id?: string; user?: string; wage?: number; fidelity?: number; joinedAt?: string }
interface WorkOffer { _id?: string; wage?: number; quantity?: number; initialQuantity?: number; minEnergy?: number; minProduction?: number }

function CompanyDetail() {
  const { id } = Route.useParams();
  const cQ = useWarEra<Company>("/company.getById", { companyId: id });
  const wQ = useWarEra<{ workers?: Worker[] }>("/worker.getWorkers", { companyId: id });
  const oQ = useWarEra<WorkOffer | { items?: WorkOffer[] }>("/workOffer.getWorkOfferByCompanyId", { companyId: id });

  const c = cQ.data;
  const calls = {
    c: { endpoint: "/company.getById", request: { companyId: id }, data: cQ.data, error: cQ.error } as ApiCall,
    w: { endpoint: "/worker.getWorkers", request: { companyId: id }, data: wQ.data, error: wQ.error } as ApiCall,
    o: { endpoint: "/workOffer.getWorkOfferByCompanyId", request: { companyId: id }, data: oQ.data, error: oQ.error } as ApiCall,
  };
  const offer = (oQ.data as WorkOffer) ?? null;

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader title={c?.name ?? "Azienda"} description={`ID: ${id}`} icon={Building2}
        actions={<Link to="/app/warera/companies" className="text-sm text-primary hover:underline">← Indietro</Link>} />
      {cQ.isLoading && <LoadingState />}
      {cQ.error && <ErrorState error={cQ.error} />}

      {c && (
        <>
          <section>
            <SectionHeader title="Anagrafica" onRefresh={() => cQ.refetch()} busy={cQ.isFetching} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatTile label="Nome" value={c.name ?? "—"} />
              <StatTile label="Item prodotto" value={c.itemCode ?? "—"} />
              <StatTile label="Proprietario" value={<UserLink id={c.user} />} />
              <StatTile label="Regione" value={<RegionLink id={c.region} />} />
              <StatTile label="Produzione" value={fmtNum(c.production)} hint={`Concreto: ${fmtMoney(c.concreteInvested)}`} />
              <StatTile label="Valore stimato" value={fmtMoney(c.estimatedValue)} />
              <StatTile label="Lavoratori" value={fmtNum(c.workerCount)} hint={c.isFull ? "Al completo" : "Posti liberi"} />
              <StatTile label="Creata" value={c.createdAt ? fmtRelative(c.createdAt) : "—"} />
            </div>
            <ApiInfo calls={[calls.c]} />
          </section>

          {c.activeUpgradeLevels && Object.keys(c.activeUpgradeLevels).length > 0 && (
            <section>
              <SectionHeader title="Upgrade attivi" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(c.activeUpgradeLevels).map(([k, v]) => (
                  <Card key={k} className="py-2"><CardContent className="pt-2 pb-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
                    <div className="text-base font-semibold tabular-nums">Lv {fmtNum(v)}</div>
                  </CardContent></Card>
                ))}
              </div>
            </section>
          )}

          <section>
            <SectionHeader icon={Briefcase} title="Offerta di lavoro" onRefresh={() => oQ.refetch()} busy={oQ.isFetching} />
            {oQ.error ? <div className="text-xs text-muted-foreground italic">Nessuna offerta attiva.</div> : offer && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatTile label="Salario" value={fmtMoney(offer.wage)} />
                <StatTile label="Posti" value={`${fmtNum(offer.quantity)}/${fmtNum(offer.initialQuantity)}`} />
                <StatTile label="Min. energia" value={fmtNum(offer.minEnergy)} />
                <StatTile label="Min. produzione" value={fmtNum(offer.minProduction)} />
              </div>
            )}
            <ApiInfo calls={[calls.o]} />
          </section>

          <section>
            <SectionHeader icon={UsersIcon} title="Lavoratori" hint={`${wQ.data?.workers?.length ?? 0}`} onRefresh={() => wQ.refetch()} busy={wQ.isFetching} />
            <div className="rounded-md border border-border overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/30 text-muted-foreground">
                  <tr><th className="text-left px-2 py-1.5">Utente</th><th className="text-right px-2 py-1.5">Salario</th><th className="text-right px-2 py-1.5">Fedeltà</th><th className="text-left px-2 py-1.5">Entrato</th></tr>
                </thead>
                <tbody>
                  {(wQ.data?.workers ?? []).map((w) => (
                    <tr key={w._id} className="border-t border-border/50">
                      <td className="px-2 py-1"><UserLink id={w.user} /></td>
                      <td className="px-2 py-1 text-right tabular-nums">{fmtMoney(w.wage)}</td>
                      <td className="px-2 py-1 text-right tabular-nums">{fmtNum(w.fidelity)}</td>
                      <td className="px-2 py-1 text-muted-foreground">{fmtRelative(w.joinedAt)}</td>
                    </tr>
                  ))}
                  {!(wQ.data?.workers?.length) && <tr><td colSpan={4} className="text-center py-3 text-muted-foreground italic">Nessun lavoratore.</td></tr>}
                </tbody>
              </table>
            </div>
            <ApiInfo calls={[calls.w]} />
          </section>
        </>
      )}
    </div>
  );
}
