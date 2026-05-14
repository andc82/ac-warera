import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useWarEra } from "@/hooks/use-warera";
import {
  PageHeader, LoadingState, ErrorState, JsonBlock, ApiInfo, SectionHeader,
  useApiBody, type ApiCall,
} from "@/components/warera-ui";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftRight } from "lucide-react";

export const Route = createFileRoute("/app/warera/transactions")({ component: TxPage });

function TxPage() {
  const { profile } = useAuth();
  const myWid = profile?.warera_user_id ?? "";
  const defaults = useMemo(
    () => (myWid ? { userId: myWid, limit: 50 } : { limit: 50 }),
    [myWid],
  );
  const { body, apply } = useApiBody<Record<string, unknown>>(defaults);
  const q = useWarEra<unknown>("/transaction.getPaginatedTransactions", body);

  const call: ApiCall = {
    endpoint: "/transaction.getPaginatedTransactions",
    request: body,
    data: q.data,
    error: q.error,
    editable: true,
    defaults,
    onApply: apply,
    onReload: () => q.refetch(),
  };

  return (
    <div className="max-w-5xl space-y-4">
      <PageHeader
        title="Transazioni"
        description="Modifica i parametri della richiesta dal pannello API in basso (es. userId, itemCode, limit)."
        icon={ArrowLeftRight}
      />
      <SectionHeader
        title="Risultati"
        hint={myWid ? `Default: tuo userId · limit 50` : "Default: limit 50"}
        onRefresh={() => q.refetch()}
        busy={q.isFetching}
      />
      {q.isLoading && <LoadingState />}
      {q.error && <ErrorState error={q.error} />}
      {q.data ? <Card><CardContent className="pt-6"><JsonBlock data={q.data} /></CardContent></Card> : null}
      <ApiInfo calls={[call]} />
    </div>
  );
}
