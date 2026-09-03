import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import type { Store } from "@/lib/api";

export function StoreCard({ store }: { store: Store }) {
  return (
    <Link
      to="/lojas/$slug"
      params={{ slug: store.slug }}
      className="group flex flex-col gap-2 rounded-2xl border bg-card p-5 shadow-soft transition-shadow hover:shadow-lift"
    >
      <div className="flex items-center gap-3">
        {store.logo_url ? (
          <img
            src={store.logo_url}
            alt=""
            className="h-10 w-10 rounded-lg object-cover"
            loading="lazy"
          />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary font-display text-lg">
            {store.name.charAt(0)}
          </span>
        )}
        <div>
          <h3 className="text-base font-semibold group-hover:underline">{store.name}</h3>
          <span className="text-xs text-muted-foreground">{store.country}</span>
        </div>
        {store.is_featured ? (
          <Badge variant="secondary" className="ml-auto">
            Destaque
          </Badge>
        ) : null}
      </div>
      {store.description ? (
        <p className="line-clamp-2 text-sm text-muted-foreground">{store.description}</p>
      ) : null}
    </Link>
  );
}
