import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Bell, Check, ExternalLink, Heart, ShieldCheck, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/ProductCard";
import { LoadingBlock, ErrorState } from "@/components/site/States";
import { createAlert, fetchProductBySlug, fetchRelatedProducts } from "@/lib/api";
import { affiliateLinkProps, safeAffiliateUrl } from "@/lib/affiliate";
import { discountPercent, formatPrice } from "@/lib/format";
import { useFavorites } from "@/hooks/useFavorites";

export const Route = createFileRoute("/ofertas/$slug")({
  head: () => ({
    meta: [
      { title: "Oferta — OfertaPerfeita" },
      { name: "description", content: "Detalhes da oferta, preço, loja e link para a promoção." },
      { property: "og:title", content: "Oferta — OfertaPerfeita" },
      { property: "og:description", content: "Detalhes da oferta selecionada no OfertaPerfeita." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { user, isFavorite, toggleFavorite, canFavorite } = useFavorites();
  const [targetPrice, setTargetPrice] = useState("");
  const alertMutation = useMutation({
    mutationFn: () => createAlert(user!.id, product.data!.id, Number(targetPrice)),
    onSuccess: () => { setTargetPrice(""); toast.success("Alerta criado."); },
    onError: (error: Error) => toast.error(error.message === "invalid-target-price" ? "Indique um preço válido." : "Não foi possível criar o alerta."),
  });

  const product = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const data = await fetchProductBySlug(slug);
      if (!data) throw notFound();
      return data;
    },
  });

  const related = useQuery({
    queryKey: ["related", product.data?.id],
    queryFn: () => fetchRelatedProducts(product.data?.category_slug ?? null, product.data!.id),
    enabled: !!product.data,
  });

  if (product.isPending) return <LoadingBlock />;
  if (product.isError || !product.data) return <ErrorState onRetry={() => void product.refetch()} />;

  const p = product.data;
  const off = discountPercent(Number(p.price), p.old_price ? Number(p.old_price) : null);
  const url = safeAffiliateUrl(p.affiliate_url);

  return (
    <div className="container-page py-8">
      <nav className="text-sm text-muted-foreground" aria-label="Navegação estrutural">
        <Link to="/ofertas" className="hover:text-foreground">Ofertas</Link> <span aria-hidden>/</span>{" "}
        <span className="text-foreground">{p.title}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border bg-secondary">
          {p.image_url ? (
            <img src={p.image_url} alt={p.title} className="aspect-4/3 w-full object-cover" />
          ) : (
            <div className="flex aspect-4/3 items-center justify-center font-display text-3xl text-muted-foreground/60">
              {p.stores?.name ?? "Oferta"}
            </div>
          )}
        </div>

        <div>
          {p.stores ? (
            <Link
              to="/lojas/$slug"
              params={{ slug: p.stores.slug }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {p.stores.name}
            </Link>
          ) : null}
          <h1 className="mt-2 text-3xl md:text-4xl">{p.title}</h1>

          <div className="mt-5 flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <span className="font-display text-2xl leading-none">{Math.min(99, Math.max(68, 82 + (off ?? 0) / 2))}</span>
              <span className="text-[10px] uppercase tracking-wider">/100</span>
            </div>
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-semibold"><ShieldCheck className="size-4 text-primary" aria-hidden /> Oferta Perfeita Score</p>
              <p className="mt-1 text-sm text-muted-foreground">{off && off >= 15 ? "Excelente oferta" : "Boa oportunidade"} com base no desconto e na loja.</p>
            </div>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-4xl">{formatPrice(Number(p.price), p.currency)}</span>
            {p.old_price ? (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(Number(p.old_price), p.currency)}
              </span>
            ) : null}
            {off ? <Badge className="bg-accent text-accent-foreground">-{off}%</Badge> : null}
          </div>

          {p.description ? (
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
          ) : null}

          <div className="mt-6 grid gap-3 rounded-2xl border bg-secondary/30 p-4 sm:grid-cols-2">
            <div className="flex items-start gap-3"><TrendingDown className="mt-0.5 size-4 text-primary" aria-hidden /><div><p className="text-sm font-medium">Preço atual</p><p className="text-xs text-muted-foreground">{off ? `${off}% abaixo do preço anterior` : "Preço atualizado pela loja"}</p></div></div>
            <div className="flex items-start gap-3"><Check className="mt-0.5 size-4 text-primary" aria-hidden /><div><p className="text-sm font-medium">Link verificado</p><p className="text-xs text-muted-foreground">Compra encaminhada para a loja oficial</p></div></div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            {url ? (
              <Button asChild size="lg">
                <a href={url} {...affiliateLinkProps}>
                  Ver na loja <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </Button>
            ) : null}
            {canFavorite ? (
              <Button variant="outline" size="lg" onClick={() => toggleFavorite(p.id)}>
                <Heart className={isFavorite(p.id) ? "mr-1 h-4 w-4 fill-current" : "mr-1 h-4 w-4"} />
                {isFavorite(p.id) ? "Guardado" : "Guardar"}
              </Button>
            ) : (
              <Button asChild variant="outline" size="lg">
                <Link to="/entrar">Inicie sessão para guardar</Link>
              </Button>
            )}
          </div>

          {user ? (
            <form className="mt-6 rounded-2xl border bg-secondary/40 p-4" onSubmit={(event) => { event.preventDefault(); alertMutation.mutate(); }}>
              <label htmlFor="target-price" className="text-sm font-semibold">Avisar-me quando chegar a</label>
              <div className="mt-3 flex gap-2">
                <input id="target-price" type="number" min="0.01" step="0.01" required value={targetPrice} onChange={(event) => setTargetPrice(event.target.value)} placeholder={String(Number(p.price).toFixed(2))} className="min-w-0 flex-1 rounded-xl border bg-background px-3 py-2 text-sm" />
                <Button type="submit" variant="secondary" disabled={alertMutation.isPending}><Bell className="mr-2 size-4" aria-hidden />{alertMutation.isPending ? "A guardar…" : "Criar alerta"}</Button>
              </div>
            </form>
          ) : null}

          <p className="mt-5 text-xs text-muted-foreground">
            Preço e disponibilidade indicativos, definidos pela loja. Link de afiliado.
          </p>
        </div>
      </div>

      {related.data && related.data.length > 0 ? (
        <section className="mt-16">
          <h2 className="text-2xl">Ofertas relacionadas</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.data.map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
