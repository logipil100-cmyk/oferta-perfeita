import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ProductCard } from "@/components/site/ProductCard";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/site/States";
import { fetchCategories, fetchOffers, fetchStores, PAGE_SIZE } from "@/lib/api";
import { useFavorites } from "@/hooks/useFavorites";

type OffersSearch = {
  q?: string;
  categoria?: string;
  loja?: string;
  min?: number;
  max?: number;
  ordenar?: "recentes" | "preco-asc" | "preco-desc" | "desconto";
  cupao?: boolean;
  pagina?: number;
};

const ORDER_LABELS: Record<string, string> = {
  recentes: "Mais recentes",
  "preco-asc": "Preço: mais baixo",
  "preco-desc": "Preço: mais alto",
  desconto: "Maior desconto",
};

export const Route = createFileRoute("/ofertas/")({
  validateSearch: (search: Record<string, unknown>): OffersSearch => {
    const num = (v: unknown) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };
    const ordenar = String(search["ordenar"] ?? "");
    return {
      ...(search["q"] ? { q: String(search["q"]) } : {}),
      ...(search["categoria"] ? { categoria: String(search["categoria"]) } : {}),
      ...(search["loja"] ? { loja: String(search["loja"]) } : {}),
      ...(num(search["min"]) !== undefined ? { min: num(search["min"])! } : {}),
      ...(num(search["max"]) !== undefined ? { max: num(search["max"])! } : {}),
      ...(ordenar in ORDER_LABELS ? { ordenar: ordenar as OffersSearch["ordenar"] } : {}),
      ...(search["cupao"] ? { cupao: true } : {}),
      ...(num(search["pagina"]) ? { pagina: num(search["pagina"])! } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Ofertas — OfertaPerfeita" },
      {
        name: "description",
        content: "Pesquise e filtre ofertas por categoria, loja, preço e desconto no OfertaPerfeita.",
      },
      { property: "og:title", content: "Ofertas — OfertaPerfeita" },
      { property: "og:description", content: "Todas as ofertas curadas, com filtros e ordenação." },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/ofertas" });
  const [term, setTerm] = useState(search.q ?? "");
  const { isFavorite, toggleFavorite, canFavorite } = useFavorites();

  useEffect(() => setTerm(search.q ?? ""), [search.q]);

  const categories = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const stores = useQuery({ queryKey: ["stores"], queryFn: () => fetchStores() });

  const offers = useQuery({
    queryKey: ["offers", search],
    queryFn: () =>
      fetchOffers({
        ...(search.q ? { q: search.q } : {}),
        ...(search.categoria ? { categoria: search.categoria } : {}),
        ...(search.loja ? { loja: search.loja } : {}),
        ...(search.min !== undefined ? { min: search.min } : {}),
        ...(search.max !== undefined ? { max: search.max } : {}),
        ...(search.ordenar ? { ordenar: search.ordenar } : {}),
        ...(search.cupao ? { comCupao: true } : {}),
        pagina: search.pagina ?? 1,
      }),
    placeholderData: keepPreviousData,
  });

  const update = (patch: Partial<OffersSearch>) => {
    void navigate({
      search: (prev) => {
        const next = { ...prev, ...patch, pagina: patch.pagina ?? 1 } as OffersSearch;
        (Object.keys(next) as (keyof OffersSearch)[]).forEach((k) => {
          const v = next[k];
          if (v === undefined || v === "" || v === false || (k === "pagina" && v === 1)) delete next[k];
        });
        return next;
      },
    });
  };

  const clear = () => void navigate({ search: {} });

  const total = offers.data?.total ?? 0;
  const page = search.pagina ?? 1;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeFilters = [search.categoria, search.loja, search.min, search.max, search.cupao].filter(
    (v) => v !== undefined && v !== false,
  ).length;

  const filters = (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="f-cat">Categoria</Label>
        <Select
          value={search.categoria ?? "todas"}
          onValueChange={(v) => update({ categoria: v === "todas" ? undefined : v })}
        >
          <SelectTrigger id="f-cat"><SelectValue placeholder="Todas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {(categories.data ?? []).map((c) => (
              <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="f-loja">Loja</Label>
        <Select
          value={search.loja ?? "todas"}
          onValueChange={(v) => update({ loja: v === "todas" ? undefined : v })}
        >
          <SelectTrigger id="f-loja"><SelectValue placeholder="Todas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {(stores.data ?? []).map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="f-min">Preço mín. (€)</Label>
          <Input
            id="f-min"
            type="number"
            min={0}
            inputMode="decimal"
            defaultValue={search.min ?? ""}
            onBlur={(e) => update({ min: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="f-max">Preço máx. (€)</Label>
          <Input
            id="f-max"
            type="number"
            min={0}
            inputMode="decimal"
            defaultValue={search.max ?? ""}
            onBlur={(e) => update({ max: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border p-3">
        <Label htmlFor="f-cupao" className="cursor-pointer">Apenas com cupão</Label>
        <Switch
          id="f-cupao"
          checked={!!search.cupao}
          onCheckedChange={(v) => update({ cupao: v ? true : undefined })}
        />
      </div>

      <Button variant="outline" className="w-full" onClick={clear}>
        <X className="mr-1 h-4 w-4" /> Limpar filtros
      </Button>
    </div>
  );

  return (
    <div className="container-page py-8">
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl">Ofertas</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {total} oferta(s) encontradas{search.q ? ` para “${search.q}”` : ""}.
        </p>
      </header>

      <form
        className="mb-6 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: term || undefined });
        }}
        role="search"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Procurar por título…"
            aria-label="Procurar ofertas"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit">Procurar</Button>
          <Select
            value={search.ordenar ?? "recentes"}
            onValueChange={(v) => update({ ordenar: v as OffersSearch["ordenar"] })}
          >
            <SelectTrigger className="w-44" aria-label="Ordenar">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ORDER_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <Filter className="mr-1 h-4 w-4" /> Filtros{activeFilters ? ` (${activeFilters})` : ""}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] overflow-y-auto sm:w-96">
              <SheetHeader><SheetTitle>Filtros</SheetTitle></SheetHeader>
              <div className="p-4">{filters}</div>
            </SheetContent>
          </Sheet>
        </div>
      </form>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border bg-card p-5 shadow-soft">{filters}</div>
        </aside>

        <div>
          {offers.isPending ? (
            <CardGridSkeleton />
          ) : offers.isError ? (
            <ErrorState onRetry={() => void offers.refetch()} />
          ) : offers.data.items.length === 0 ? (
            <EmptyState
              title="Nenhuma oferta corresponde aos filtros"
              description="Experimente alargar o intervalo de preço ou limpar os filtros."
              action={<Button variant="outline" onClick={clear}>Limpar filtros</Button>}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {offers.data.items.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isFavorite={isFavorite(p.id)}
                    {...(canFavorite ? { onToggleFavorite: toggleFavorite } : {})}
                  />
                ))}
              </div>

              {pages > 1 ? (
                <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Paginação">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => update({ pagina: page - 1 })}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {page} de {pages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page >= pages}
                    onClick={() => update({ pagina: page + 1 })}
                  >
                    Seguinte
                  </Button>
                </nav>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
