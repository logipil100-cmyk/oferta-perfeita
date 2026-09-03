import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminShell } from "@/components/admin/AdminShell";
import { RecordDialog, type Field, type RecordValues } from "@/components/admin/RecordDialog";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/site/States";
import { deleteRow, fetchAdminProducts, saveProduct } from "@/lib/admin";
import { fetchCategories, fetchStores } from "@/lib/api";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/admin/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos — Administração OfertaPerfeita" },
      { name: "description", content: "Gestão de produtos e ofertas do OfertaPerfeita." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Produtos — Administração" },
      { property: "og:description", content: "Gestão de produtos e ofertas." },
    ],
  }),
  component: AdminProdutos,
});

function AdminProdutos() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["admin", "products"], queryFn: fetchAdminProducts });
  const stores = useQuery({ queryKey: ["stores", "all"], queryFn: () => fetchStores(false) });
  const categories = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const fields: Field[] = [
    { name: "title", label: "Título", required: true },
    { name: "slug", label: "Slug", required: true, help: "Identificador no URL, ex: portatil-14-polegadas" },
    { name: "price", label: "Preço", type: "number", required: true },
    { name: "old_price", label: "Preço anterior", type: "number" },
    { name: "currency", label: "Moeda", placeholder: "EUR" },
    {
      name: "store_id",
      label: "Loja",
      type: "select",
      options: (stores.data ?? []).map((s) => ({ value: s.id, label: s.name })),
    },
    {
      name: "category_slug",
      label: "Categoria",
      type: "select",
      options: (categories.data ?? []).map((c) => ({ value: c.slug, label: c.name })),
    },
    { name: "affiliate_url", label: "Link de afiliado", required: true, help: "Deve começar por https://" },
    { name: "image_url", label: "Imagem (URL)" },
    { name: "coupon_code", label: "Código de cupão" },
    { name: "description", label: "Descrição", type: "textarea" },
    { name: "is_active", label: "Ativo", type: "switch" },
    { name: "is_featured", label: "Destaque", type: "switch" },
  ];

  const save = async (values: RecordValues) => {
    try {
      await saveProduct(values as never);
      toast.success("Produto guardado");
      await qc.invalidateQueries({ queryKey: ["admin", "products"] });
      await qc.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível guardar");
      throw err;
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Eliminar este produto?")) return;
    try {
      await deleteRow("products", id);
      toast.success("Produto eliminado");
      await qc.invalidateQueries({ queryKey: ["admin", "products"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível eliminar");
    }
  };

  return (
    <AdminShell
      title="Produtos"
      description="Crie, edite e desative ofertas. As permissões são validadas no servidor."
      actions={
        <RecordDialog
          title="Novo produto"
          fields={fields}
          initial={{ currency: "EUR", is_active: true, is_featured: false }}
          onSubmit={save}
          trigger={
            <Button>
              <Plus className="mr-1 h-4 w-4" /> Novo produto
            </Button>
          }
        />
      }
    >
      {list.isPending ? (
        <CardGridSkeleton count={3} />
      ) : list.isError ? (
        <ErrorState onRetry={() => void list.refetch()} />
      ) : list.data.length === 0 ? (
        <EmptyState title="Sem produtos" description="Crie o primeiro produto para começar." />
      ) : (
        <ul className="grid gap-3">
          {list.data.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-soft"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-base font-semibold">{p.title}</h2>
                  {p.is_featured ? <Badge className="bg-accent text-accent-foreground">Destaque</Badge> : null}
                  {!p.is_active ? <Badge variant="secondary">Inativo</Badge> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatPrice(Number(p.price), p.currency)} · {p.stores?.name ?? "Sem loja"} · /{p.slug}
                </p>
              </div>
              <div className="flex gap-2">
                <RecordDialog
                  title="Editar produto"
                  fields={fields}
                  initial={p as unknown as RecordValues}
                  onSubmit={save}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Pencil className="mr-1 h-4 w-4" /> Editar
                    </Button>
                  }
                />
                <Button variant="ghost" size="sm" onClick={() => void remove(p.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Eliminar</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
