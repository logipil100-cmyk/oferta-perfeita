import { Link } from "@tanstack/react-router";
import { Heart, Store as StoreIcon, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { discountPercent, formatPrice } from "@/lib/format";
import type { ProductWithStore } from "@/lib/api";

export function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
}: {
  product: ProductWithStore;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}) {
  const off = discountPercent(
    Number(product.price),
    product.old_price ? Number(product.old_price) : null,
  );

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition-shadow hover:shadow-lift">
      <div className="relative aspect-4/3 overflow-hidden bg-secondary">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-2xl text-muted-foreground/60">
              {product.stores?.name ?? "Oferta"}
            </span>
          </div>
        )}
        {off ? (
          <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground">-{off}%</Badge>
        ) : null}
        {onToggleFavorite ? (
          <Button
            type="button"
            size="icon"
            variant="secondary"
            aria-label={isFavorite ? "Remover dos favoritos" : "Guardar nos favoritos"}
            aria-pressed={!!isFavorite}
            onClick={() => onToggleFavorite(product.id)}
            className="absolute right-3 top-3 h-9 w-9 rounded-full"
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-destructive text-destructive")} />
          </Button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.stores ? (
          <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <StoreIcon className="h-3.5 w-3.5" aria-hidden />
            {product.stores.name}
          </span>
        ) : null}

        <h3 className="line-clamp-2 text-base leading-snug font-semibold">
          <Link
            to="/ofertas/$slug"
            params={{ slug: product.slug }}
            className="after:absolute after:inset-0 hover:underline"
          >
            {product.title}
          </Link>
        </h3>

        <div className="mt-auto flex items-end gap-2 pt-2">
          <span className="font-display text-xl">
            {formatPrice(Number(product.price), product.currency)}
          </span>
          {product.old_price ? (
            <span className="pb-0.5 text-sm text-muted-foreground line-through">
              {formatPrice(Number(product.old_price), product.currency)}
            </span>
          ) : null}
        </div>

        {product.coupon_code ? (
          <span className="inline-flex w-fit items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium">
            <Tag className="h-3 w-3" aria-hidden /> Cupão {product.coupon_code}
          </span>
        ) : null}
      </div>
    </article>
  );
}
