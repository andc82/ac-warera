import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, JsonBlock } from "@/components/warera-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeftRight } from "lucide-react";

export const Route = createFileRoute("/app/warera/transactions")({ component: TxPage });

function TxPage() {
  const { profile } = useAuth();
  const [userId, setUserId] = useState(profile?.warera_user_id ?? "");
  const [itemCode, setItemCode] = useState("");
  const body: Record<string, unknown> = { limit: 50 };
  if (userId) body.userId = userId;
  if (itemCode) body.itemCode = itemCode;
  const { data, isLoading, error } = useWarEra<unknown>("/transaction.getPaginatedTransactions", body);

  return (
    <div className="max-w-5xl">
      <PageHeader title="Transazioni" description="Filtro per utente e/o oggetto" icon={ArrowLeftRight} />
      <Card className="mb-6">
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>User ID</Label><Input value={userId} onChange={(e) => setUserId(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Item code</Label><Input value={itemCode} onChange={(e) => setItemCode(e.target.value)} placeholder="es. food, weapon, …" /></div>
        </CardContent>
      </Card>
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data && <Card><CardContent className="pt-6"><JsonBlock data={data} /></CardContent></Card>}
    </div>
  );
}
