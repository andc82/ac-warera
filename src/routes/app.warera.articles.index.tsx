import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useWarEra } from "@/hooks/use-warera";
import { PageHeader, LoadingState, ErrorState, ApiInfo, SectionHeader, UserLink, fmtRelative, fmtNum, useApiBody, type ApiCall } from "@/components/warera-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Newspaper } from "lucide-react";

export const Route = createFileRoute("/app/warera/articles/")({ component: ArticlesPage });

interface Article {
  _id?: string; title?: string; createdAt?: string; publishedAt?: string;
  author?: string; language?: string; category?: string;
  stats?: { likes?: number; dislikes?: number; views?: number; comments?: number };
}

const TYPES = ["last", "daily", "weekly", "top"] as const;
type T = typeof TYPES[number];

function ArticlesPage() {
  const [type, setType] = useState<T>("last");
  const q = useWarEra<{ items?: Article[] }>("/article.getArticlesPaginated", { type, limit: 30 });
  const call: ApiCall = { endpoint: "/article.getArticlesPaginated", request: { type, limit: 30 }, data: q.data, error: q.error };

  return (
    <div className="max-w-5xl">
      <PageHeader title="Articoli" description="Stampa & propaganda" icon={Newspaper} />
      <Tabs value={type} onValueChange={(v) => setType(v as T)} className="mb-3">
        <TabsList>{TYPES.map((t) => <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>)}</TabsList>
      </Tabs>
      <SectionHeader title="Articoli" hint={`${q.data?.items?.length ?? 0}`} onRefresh={() => q.refetch()} busy={q.isFetching} />
      {q.isLoading && <LoadingState />}
      {q.error && <ErrorState error={q.error} />}
      <div className="space-y-2">
        {(q.data?.items ?? []).map((a) => (
          <Link key={a._id} to="/app/warera/articles/$id" params={{ id: a._id ?? "" }}>
            <Card className="hover:border-primary/60"><CardContent className="pt-3 pb-3">
              <div className="font-semibold text-sm">{a.title ?? "(senza titolo)"}</div>
              <div className="text-[11px] text-muted-foreground mt-1 flex flex-wrap gap-x-2">
                <span><UserLink id={a.author} /></span>
                <span>· {fmtRelative(a.publishedAt ?? a.createdAt)}</span>
                {a.language && <span>· {a.language}</span>}
                {a.category && <span>· {a.category}</span>}
                <span>· 👁 {fmtNum(a.stats?.views)} · 👍 {fmtNum(a.stats?.likes)} · 👎 {fmtNum(a.stats?.dislikes)} · 💬 {fmtNum(a.stats?.comments)}</span>
              </div>
            </CardContent></Card>
          </Link>
        ))}
        {q.data && !q.data.items?.length && <div className="text-xs text-muted-foreground italic">Nessun articolo.</div>}
      </div>
      <ApiInfo calls={[call]} />
    </div>
  );
}
