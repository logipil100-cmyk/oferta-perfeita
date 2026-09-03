import { Link } from "@tanstack/react-router";
import { Heart, Home, Tag, Store, User } from "lucide-react";

const ITEMS = [
  { to: "/", label: "Início", Icon: Home },
  { to: "/ofertas", label: "Ofertas", Icon: Tag },
  { to: "/cupoes", label: "Cupões", Icon: Tag },
  { to: "/lojas", label: "Lojas", Icon: Store },
  { to: "/conta", label: "Conta", Icon: User },
] as const;

export function MobileTabBar() {
  return (
    <nav
      aria-label="Navegação inferior"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map(({ to, label, Icon }) => (
          <li key={label}>
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              activeProps={{ className: "text-foreground" }}
              className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-muted-foreground"
            >
              <Icon className="h-5 w-5" aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <span className="sr-only">
        <Heart />
      </span>
    </nav>
  );
}
