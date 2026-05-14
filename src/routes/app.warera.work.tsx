import { createFileRoute, Link } from "@tanstack/react-router";
import { useWarEra } from "@/hooks/use-warera";
import {
  PageHeader, LoadingState, ErrorState, SectionHeader, ApiInfo, JsonBlock,
  StatTile, UserLink, RegionLink, fmtMoney, fmtNum, useApiBody, type ApiCall,
} from "@/components/warera-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, BarChart3, ListOrdered } from "lucide-react";

export const Route = createFileRoute("/app/warera/work")({ component: WorkPage });

interface WorkOffer {
  _id?: string;
  salary?: number;
  company?: string;
  companyName?: string;
  owner?: string;
  region?: string;
  regionId?: string;
  quality?: number;
  jobsCount?: number;
  createdAt?: string;
}

function WorkPage() {
  const defaults = { limit: 50 };
  const { body, apply } = useApiBody<Record<string, unknown>>(defaults);
  const offersQ = useWarEra<{ items?: WorkOffer[] } | WorkOffer[]>(
    "/workOffer.getWorkOffersPaginated",
    body,
  );

  const offers: WorkOffer[] = Array.isArray(offersQ.data)
    ? offersQ.data
    : (offersQ.data?.items ?? []);

  const salaries = offers.map((o) => o.salary).filter((s): s is number => typeof s === "number");
  const totalJobs = offers.reduce((acc, o) => acc + (typeof o.jobsCount === "number" ? o.jobsCount : 0), 0);
  const maxSal = salaries.length ? Math.max(...salaries) : undefined;
  const minSal = salaries.length ? Math.min(...salaries) : undefined;
  const avgSal = salaries.length ? salaries.reduce((a, b) => a + b, 0) / salaries.length : undefined;

  const sortedTop = [...offers]
    .filter((o) => typeof o.salary === "number")
    .sort((a, b) => (b.salary ?? 0) - (a.salary ?? 0))
    .slice(0, 10);

  const calls: ApiCall[] = [
    {
      endpoint: "/workOffer.getWorkOffersPaginated",
      request: body,
      data: offersQ.data,
      error: offersQ.error,
      editable: true,
      defaults,
      onApply: apply,
      onReload: () => offersQ.refetch(),
    },
  ];

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Lavoro & Salari"
        description="Offerte di lavoro disponibili nel mondo di War Era"
        icon={Briefcase}
      />

      {offersQ.isLoading && <LoadingState />}
      {offersQ.error && <ErrorState error={offersQ.error} />}

      {!offersQ.isLoading && (
        <>
          <section>
            <SectionHeader
              icon={BarChart3}
              title="Statistiche"
              onRefresh={() => offersQ.refetch()}
              busy={offersQ.isFetching}
            />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <StatTile label="Offerte" value={fmtNum(offers.length)} />
              <StatTile label="Posti totali" value={fmtNum(totalJobs)} />
              <StatTile label="Salario max" value={fmtMoney(maxSal)} />
              <StatTile label="Salario medio" value={fmtMoney(avgSal)} />
              <StatTile label="Salario min" value={fmtMoney(minSal)} />
            </div>
          </section>

          <section>
            <SectionHeader icon={ListOrdered} title="Top 10 salari" hint={`${sortedTop.length}`} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {sortedTop.map((o) => (
                <OfferCard key={o._id} o={o} />
              ))}
              {!sortedTop.length && (
                <div className="text-xs text-muted-foreground italic">Nessuna offerta.</div>
              )}
            </div>
          </section>

          <section>
            <SectionHeader icon={Briefcase} title="Tutte le offerte" hint={`${offers.length}`} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {offers.map((o) => (
                <OfferCard key={o._id} o={o} />
              ))}
              {!offers.length && (
                <div className="text-xs text-muted-foreground italic">Nessuna offerta.</div>
              )}
            </div>
            <ApiInfo calls={calls} />
          </section>

          <section>
            <SectionHeader title="Dati grezzi" />
            <Card><CardContent className="pt-4"><JsonBlock data={offersQ.data} /></CardContent></Card>
          </section>
        </>
      )}
    </div>
  );
}

function OfferCard({ o }: { o: WorkOffer }) {
  const regionId = o.region ?? o.regionId;
  const companyLabel = o.companyName ?? (o.company ? `…${o.company.slice(-6)}` : "—");
  return (
    <div className="rounded-md border border-border p-2.5 bg-muted/10 hover:border-primary/60 transition-colors">
      <div className="flex items-center justify-between text-xs">
        {o.company ? (
          <Link
            to="/app/warera/companies/$id"
            params={{ id: o.company }}
            className="font-semibold text-primary hover:underline truncate"
          >
            {companyLabel}
          </Link>
        ) : (
          <span className="font-semibold truncate">{companyLabel}</span>
        )}
        <span className="tabular-nums text-primary font-semibold">{fmtMoney(o.salary)}</span>
      </div>
      <div className="text-[11px] text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
        {o.owner && <UserLink id={o.owner} />}
        {regionId && <span>· <RegionLink id={regionId} /></span>}
        {typeof o.quality === "number" && <span>· Q{o.quality}</span>}
        {typeof o.jobsCount === "number" && <span>· {o.jobsCount} posti</span>}
      </div>
    </div>
  );
}
