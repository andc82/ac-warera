import { createFileRoute } from "@tanstack/react-router";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, JsonBlock } from "@/components/warera-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/app/warera/rankings")({ component: RankingsPage });

function RankingsPage() {
  const { data, isLoading, error } = useWarEra<unknown>("/ranking.getRanking", { limit: 50 });
  return (
    <div className="max-w-5xl">
      <PageHeader title="Classifiche" description="Top giocatori globali" icon={Trophy} />
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data ? <Card><CardContent className="pt-6"><JsonBlock data={data} /></CardContent></Card> : null}
    </div>
  );
}
