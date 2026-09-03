import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingBlock } from "@/components/site/States";
import { useAuth } from "@/hooks/useAuth";

export const ADMIN_NAV = [
  { to: "/admin", label: "Painel" },
  { to: "/admin/produtos", label: "Produtos" },
  { to: "/admin/cupoes", label: "Cupões" },
  { to: "/admin/lojas", label: "Lojas" },
  { to: "/admin/utilizadores", label: "Utilizadores" },
  { to: "/admin/configuracoes", label: "Configurações" },
] as const;

export function AdminShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { loading, isAdmin } = useAuth();

  if (loading) return <LoadingBlock />;
  if (!isAdmin) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Acesso restrito"
          description="Esta área é reservada a administradores."
          action={
            <Button asChild>
              <Link to="/">Voltar ao início</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <nav aria-label="Administração" className="flex flex-wrap gap-2">
        {ADMIN_NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/admin" }}
            activeProps={{ className: "bg-secondary text-foreground" }}
            className="rounded-full border px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl">{title}</h1>
          {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions}
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}
