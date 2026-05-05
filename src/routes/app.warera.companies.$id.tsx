import { createFileRoute, Link } from "@tanstack/react-router";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, JsonBlock } from "@/components/warera-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/app/warera/companies/$id")({ component: CompanyDetail });

function CompanyDetail() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useWarEra<Record<string, unknown>>("/company.getById", { companyId: id });
  const { data: workers } = useWarEra<unknown>("/worker.getWorkers", { companyId: id });
  const { data: offers } = useWarEra<unknown>("/workOffer.getWorkOfferByCompanyId", { companyId: id });
  const { data: upg } = useWarEra<unknown>("/upgrade.getUpgradeByTypeAndEntity", { entityType: "company", entityId: id });

  return (
    <div className="max-w-6xl">
      <PageHeader title={(data?.name as string) ?? "Azienda"} description={`ID: ${id}`} icon={Building2}
        actions={<Link to="/app/warera/companies" className="text-sm text-primary hover:underline">← Indietro</Link>} />
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data && (
        <Tabs defaultValue="info">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="workers">Lavoratori</TabsTrigger>
            <TabsTrigger value="offers">Offerte</TabsTrigger>
            <TabsTrigger value="upg">Upgrade</TabsTrigger>
          </TabsList>
          <TabsContent value="info"><Card><CardContent className="pt-6"><JsonBlock data={data} /></CardContent></Card></TabsContent>
          <TabsContent value="workers"><Card><CardHeader><CardTitle>Workers</CardTitle></CardHeader><CardContent><JsonBlock data={workers} /></CardContent></Card></TabsContent>
          <TabsContent value="offers"><Card><CardHeader><CardTitle>Work Offers</CardTitle></CardHeader><CardContent><JsonBlock data={offers} /></CardContent></Card></TabsContent>
          <TabsContent value="upg"><Card><CardHeader><CardTitle>Upgrade</CardTitle></CardHeader><CardContent><JsonBlock data={upg} /></CardContent></Card></TabsContent>
        </Tabs>
      )}
    </div>
  );
}
