import { createFileRoute } from "@tanstack/react-router";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, JsonBlock } from "@/components/warera-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export const Route = createFileRoute("/app/warera/work")({ component: WorkPage });

function WorkPage() {
  const { data, isLoading, error } = useWarEra<unknown>("/workOffer.getWorkOffersPaginated", { limit: 50 });
  return (
    <div className="max-w-6xl">
      <PageHeader title="Lavoro & Salari" description="Offerte di lavoro paginate" icon={Briefcase} />
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data ? <Card><CardContent className="pt-6"><JsonBlock data={data} /></CardContent></Card> : null}
    </div>
  );
}
