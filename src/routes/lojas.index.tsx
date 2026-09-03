import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { StoreCard } from "@/components/site/StoreCard";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/site/States";
import { fetchStores } from "@/lib/api";

export const Route = createFileRoute("/lojas/")({
  head: () => ({
    meta: [
      { title: "Lojas parceiras — OfertaPerfeita" },
      {
        name: "description",
        content: "Conheça as lojas online parceiras com ofertas e cupões no OfertaPerfeita.",
      },
      { property: "og:title", content: "Lojas parceiras — OfertaPerfeita" },
      { property: "og:description", content: "Lojas selecionadas com ofertas e cupões ativos." },
    ],
  }),
  component: StoresPage,
});

function StoresPage() {
  const stores = useQuery({ queryKey: ["stores"], queryFn: () => fetchStores() });
  return (
    <div className="container-page py-8">
      <h1 className="text-3xl md:text-4xl">Lojas</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Todas as lojas configuradas na plataforma.
      </p>
      <div className="mt-8">
        {stores.isPending ? (
          <CardGridSkeleton count={6} />
        ) : stores.isError ? (
          <ErrorState onRetry={() => void stores.refetch()} />
        ) : stores.data.length === 0 ? (
          <EmptyState
            title="Sem lojas ativas"
            description="As lojas aparecem aqui assim que forem ativadas."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stores.data.map((s) => (
              <StoreCard key={s.id} store={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
