import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingBlock } from "@/components/site/States";
import { useAuth } from "@/hooks/useAuth";
import { useQueries } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Administração — OfertaPerfeita" },
      { name: "description", content: "Área reservada à gestão de produtos, cupões, lojas e utilizadores." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Administração — OfertaPerfeita" },
      { property: "og:description", content: "Área reservada de gestão." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { loading, isAdmin } = useAuth();
  const metrics = useQueries({ queries: ["products", "stores", "coupons", "profiles"].map((table) => ({ queryKey: ["admin", "count", table], queryFn: async () => { const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true }); if (error) throw error; return count ?? 0; } })) });

  if (loading) return <LoadingBlock />;
  if (!isAdmin) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Acesso restrito"
          description="Esta área é reservada a administradores."
          action={<Button asChild><Link to="/">Voltar ao início</Link></Button>}
        />
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl md:text-4xl">Administração</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Gestão de conteúdos. Todas as operações são validadas por políticas de segurança no servidor.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{["Produtos", "Lojas", "Cupões", "Utilizadores"].map((s, index) => <Link key={s} to={s === "Produtos" ? "/admin/produtos" : s === "Lojas" ? "/admin/lojas" : s === "Cupões" ? "/admin/cupoes" : "/admin/utilizadores"} className="rounded-2xl border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary"><p className="text-3xl font-bold">{metrics[index]?.data ?? "—"}</p><h2 className="mt-2 text-lg">{s}</h2><p className="mt-1 text-sm text-muted-foreground">Gerir {s.toLowerCase()}.</p></Link>)}</div><div className="mt-4"><Link to="/admin/configuracoes" className="text-sm font-semibold text-primary hover:underline">Abrir configurações do site</Link></div>
    </div>
  );
}
