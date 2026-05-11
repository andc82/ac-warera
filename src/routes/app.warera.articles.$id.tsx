import { createFileRoute, Link } from "@tanstack/react-router";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, ApiInfo, UserLink, fmtDate, fmtNum, type ApiCall } from "@/components/warera-ui";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Newspaper } from "lucide-react";

export const Route = createFileRoute("/app/warera/articles/$id")({ component: ArticleDetail });

interface Article {
  title?: string; content?: string; language?: string; category?: string; author?: string;
  createdAt?: string; publishedAt?: string;
  stats?: { likes?: number; dislikes?: number; views?: number; comments?: number };
}

function ArticleDetail() {
  const { id } = Route.useParams();
  const q = useWarEra<Article>("/article.getArticleById", { articleId: id });
  const a = q.data;
  const call: ApiCall = { endpoint: "/article.getArticleById", request: { articleId: id }, data: q.data, error: q.error };

  return (
    <div className="max-w-3xl">
      <PageHeader title="Articolo" description={`ID: ${id}`} icon={Newspaper}
        actions={<Link to="/app/warera/articles" className="text-sm text-primary hover:underline">← Indietro</Link>} />
      {q.isLoading && <LoadingState />}
      {q.error && <ErrorState error={q.error} />}
      {a && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{a.title ?? "(senza titolo)"}</CardTitle>
            <CardDescription className="flex flex-wrap gap-x-2 text-[11px]">
              <span><UserLink id={a.author} /></span>
              <span>· {fmtDate(a.publishedAt ?? a.createdAt)}</span>
              {a.language && <span>· {a.language}</span>}
              {a.category && <span>· {a.category}</span>}
              <span>· 👁 {fmtNum(a.stats?.views)} · 👍 {fmtNum(a.stats?.likes)} · 👎 {fmtNum(a.stats?.dislikes)} · 💬 {fmtNum(a.stats?.comments)}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <article className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: a.content ?? "" }} />
            <ApiInfo calls={[call]} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
