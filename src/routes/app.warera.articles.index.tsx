import { createFileRoute, Link } from "@tanstack/react-router";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, JsonBlock, fmtDate } from "@/components/warera-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Newspaper } from "lucide-react";

export const Route = createFileRoute("/app/warera/articles/")({ component: ArticlesPage });

interface Article { _id?: string; title?: string; createdAt?: string; authorName?: string }

function ArticlesPage() {
  const { data, isLoading, error } = useWarEra<{ items?: Article[] }>("/article.getArticlesPaginated", { limit: 30 });
  return (
    <div className="max-w-5xl">
      <PageHeader title="Articoli" description="Stampa & propaganda" icon={Newspaper} />
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data && (
        <div className="space-y-2">
          {(data.items ?? []).map((a) => (
            <Link key={a._id} to="/app/warera/articles/$id" params={{ id: a._id ?? "" }}>
              <Card className="hover:border-primary/60"><CardContent className="pt-4">
                <div className="font-semibold">{a.title ?? "(senza titolo)"}</div>
                <div className="text-xs text-muted-foreground mt-1">{a.authorName ?? ""} · {fmtDate(a.createdAt)}</div>
              </CardContent></Card>
            </Link>
          ))}
        </div>
      )}
      {data && <details className="mt-4"><summary className="text-sm text-muted-foreground cursor-pointer">JSON raw</summary><JsonBlock data={data} /></details>}
    </div>
  );
}
