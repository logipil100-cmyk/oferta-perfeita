import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CouponCard } from "@/components/site/CouponCard";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/site/States";
import { fetchCoupons } from "@/lib/api";

export const Route = createFileRoute("/cupoes/")({
  head: () => ({
    meta: [
      { title: "Cupões de desconto — OfertaPerfeita" },
      {
        name: "description",
        content: "Códigos promocionais verificados, com condições e validade visíveis.",
      },
      { property: "og:title", content: "Cupões de desconto — OfertaPerfeita" },
      { property: "og:description", content: "Copie códigos de desconto das lojas parceiras." },
    ],
  }),
  component: CouponsPage,
});

function CouponsPage() {
  const coupons = useQuery({ queryKey: ["coupons"], queryFn: () => fetchCoupons() });

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl md:text-4xl">Cupões</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Copie o código e utilize-o no checkout da loja.
      </p>
      <div className="mt-8">
        {coupons.isPending ? (
          <CardGridSkeleton count={6} />
        ) : coupons.isError ? (
          <ErrorState onRetry={() => void coupons.refetch()} />
        ) : coupons.data.length === 0 ? (
          <EmptyState
            title="Sem cupões ativos"
            description="Novos códigos são publicados regularmente."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {coupons.data.map((c) => (
              <CouponCard key={c.id} coupon={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
