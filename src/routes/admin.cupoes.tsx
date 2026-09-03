import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminShell } from "@/components/admin/AdminShell";
import { RecordDialog, type Field, type RecordValues } from "@/components/admin/RecordDialog";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/site/States";
import { deleteRow, fetchAdminCoupons, saveCoupon } from "@/lib/admin";
import { fetchStores } from "@/lib/api";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/cupoes")({
  head: () => ({
    meta: [
      { title: "Cupões — Administração OfertaPerfeita" },
      { name: "description", content: "Gestão de cupões e códigos promocionais." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Cupões — Administração" },
      { property: "og:description", content: "Gestão de cupões e códigos promocionais." },
    ],
  }),
  component: AdminCupoes,
});

function AdminCupoes() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["admin", "coupons"], queryFn: fetchAdminCoupons });
  const stores = useQuery({ queryKey: ["stores", "all"], queryFn: () => fetchStores(false) });

  const fields: Field[] = [
    { name: "title", label: "Título", required: true },
    { name: "code", label: "Código", required: true },
    {
      name: "store_id",
      label: "Loja",
      type: "select",
      required: true,
      options: (stores.data ?? []).map((s) => ({ value: s.id, label: s.name })),
    },
    { name: "discount_label", label: "Etiqueta de desconto", placeholder: "-15%" },
    { name: "affiliate_url", label: "Link de afiliado" },
    { name: "expires_at", label: "Expira em", type: "date" },
    { name: "description", label: "Descrição", type: "textarea" },
    { name: "terms", label: "Condições", type: "textarea" },
    { name: "is_active", label: "Ativo", type: "switch" },
  ];

  const save = async (values: RecordValues) => {
    try {
      await saveCoupon(values as never);
      toast.success("Cupão guardado");
      await qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
      await qc.invalidateQueries({ queryKey: ["coupons"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível guardar");
      throw err;
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Eliminar este cupão?")) return;
    try {
      await deleteRow("coupons", id);
      toast.success("Cupão eliminado");
      await qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível eliminar");
    }
  };

  return (
    <AdminShell
      title="Cupões"
      description="Códigos promocionais associados às lojas parceiras."
      actions={
        <RecordDialog
          title="Novo cupão"
          fields={fields}
          initial={{ is_active: true }}
          onSubmit={save}
          trigger={
            <Button>
              <Plus className="mr-1 h-4 w-4" /> Novo cupão
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
        <EmptyState title="Sem cupões" description="Adicione o primeiro código promocional." />
      ) : (
        <ul className="grid gap-3">
          {list.data.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-soft"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-base font-semibold">{c.title}</h2>
                  <Badge variant="secondary" className="font-mono">
                    {c.code}
                  </Badge>
                  {!c.is_active ? <Badge variant="secondary">Inativo</Badge> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {c.stores?.name ?? "Sem loja"}
                  {c.expires_at ? ` · até ${formatDate(c.expires_at)}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <RecordDialog
                  title="Editar cupão"
                  fields={fields}
                  initial={c as unknown as RecordValues}
                  onSubmit={save}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Pencil className="mr-1 h-4 w-4" /> Editar
                    </Button>
                  }
                />
                <Button variant="ghost" size="sm" onClick={() => void remove(c.id)}>
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
