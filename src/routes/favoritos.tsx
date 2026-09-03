import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/site/ProductCard";
import { CardGridSkeleton, EmptyState } from "@/components/site/States";
import { fetchFavorites } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/favoritos")({
  head: () => ({
    meta: [
      { title: "Favoritos — OfertaPerfeita" },
      { name: "description", content: "As ofertas que guardou na sua conta OfertaPerfeita." },
      { property: "og:title", content: "Favoritos — OfertaPerfeita" },
      { property: "og:description", content: "As ofertas que guardou na sua conta." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { user, loading } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorites = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: () => fetchFavorites(user!.id),
    enabled: !!user,
  });

  if (loading) return <CardGridSkeleton count={4} />;

  if (!user) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Inicie sessão para ver favoritos"
          description="Guarde ofertas e encontre-as aqui em qualquer dispositivo."
          action={<Button asChild><Link to="/entrar">Entrar</Link></Button>}
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl md:text-4xl">Favoritos</h1>
      <div className="mt-8">
        {favorites.isPending ? (
          <CardGridSkeleton count={4} />
        ) : (favorites.data ?? []).length === 0 ? (
          <EmptyState title="Ainda não guardou ofertas" description="Toque no coração numa oferta para a guardar." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(favorites.data ?? []).map((p) => (
              <ProductCard key={p.id} product={p} isFavorite={isFavorite(p.id)} onToggleFavorite={toggleFavorite} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
