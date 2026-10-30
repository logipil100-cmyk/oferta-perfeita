import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/ProductCard";
import { CouponCard } from "@/components/site/CouponCard";
import { LoadingBlock, ErrorState, EmptyState } from "@/components/site/States";
import { fetchStoreBySlug, fetchOffers, fetchCoupons } from "@/lib/api";
import { affiliateLinkProps, safeAffiliateUrl } from "@/lib/affiliate";

export const Route = createFileRoute("/lojas/$slug")({
  head: () => ({
    meta: [
      { title: "Loja — OfertaPerfeita" },
      { name: "description", content: "Ofertas e cupões ativos desta loja parceira." },
      { property: "og:title", content: "Loja — OfertaPerfeita" },
      { property: "og:description", content: "Ofertas e cupões ativos desta loja parceira." },
    ],
  }),
  component: StorePage,
});

function StorePage() {
  const { slug } = Route.useParams();
  const store = useQuery({ queryKey: ["store", slug], queryFn: () => fetchStoreBySlug(slug) });
  const offers = useQuery({
    queryKey: ["store-offers", store.data?.id],
    queryFn: () => fetchOffers({ loja: store.data!.id, pagina: 1 }),
    enabled: !!store.data,
  });
  const coupons = useQuery({
    queryKey: ["store-coupons", store.data?.id],
    queryFn: () => fetchCoupons(store.data!.id),
    enabled: !!store.data,
  });

  if (store.isPending) return <LoadingBlock />;
  if (store.isError) return <ErrorState onRetry={() => void store.refetch()} />;
  if (!store.data)
    return <EmptyState title="Loja não encontrada" description="Esta loja não está disponível." />;

  const s = store.data;
  const url = safeAffiliateUrl(s.affiliate_url ?? s.website_url);

  return (
    <div className="container-page py-8">
      <header className="rounded-2xl border bg-card p-6 shadow-soft">
        <h1 className="text-3xl md:text-4xl">{s.name}</h1>
        {s.description ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{s.description}</p>
        ) : null}
        {url ? (
          <Button asChild className="mt-5">
            <a href={url} {...affiliateLinkProps}>
              Visitar loja <ExternalLink className="ml-1 h-4 w-4" />
            </a>
          </Button>
        ) : null}
      </header>

      {(coupons.data ?? []).length > 0 ? (
        <section className="mt-10">
          <h2 className="text-2xl">Cupões</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {(coupons.data ?? []).map((c) => (
              <CouponCard key={c.id} coupon={c} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-2xl">Ofertas</h2>
        <div className="mt-5">
          {(offers.data?.items ?? []).length === 0 ? (
            <EmptyState
              title="Sem ofertas ativas"
              description="Volte em breve para novidades desta loja."
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {(offers.data?.items ?? []).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
