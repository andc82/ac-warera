import { createFileRoute, Link } from "@tanstack/react-router";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, JsonBlock, fmtDate } from "@/components/warera-ui";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Newspaper } from "lucide-react";

export const Route = createFileRoute("/app/warera/articles/$id")({ component: ArticleDetail });

function ArticleDetail() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useWarEra<Record<string, unknown>>("/article.getArticleById", { articleId: id });

  return (
    <div className="max-w-3xl">
      <PageHeader title="Articolo" description={`ID: ${id}`} icon={Newspaper}
        actions={<Link to="/app/warera/articles" className="text-sm text-primary hover:underline">← Indietro</Link>} />
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{(data.title as string) ?? "(senza titolo)"}</CardTitle>
            <CardDescription>{(data.authorName as string) ?? ""} · {fmtDate(data.createdAt)}</CardDescription>
          </CardHeader>
          <CardContent>
            <article className="prose prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
              {(data.content as string) ?? (data.body as string) ?? ""}
            </article>
            <details className="mt-6"><summary className="text-sm text-muted-foreground cursor-pointer">JSON completo</summary><JsonBlock data={data} /></details>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
