import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminShell } from "@/components/admin/AdminShell";
import { RecordDialog, type Field, type RecordValues } from "@/components/admin/RecordDialog";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/site/States";
import { deleteRow, fetchAdminStores, saveStore } from "@/lib/admin";

export const Route = createFileRoute("/admin/lojas")({
  head: () => ({
    meta: [
      { title: "Lojas — Administração OfertaPerfeita" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLojas,
});

function AdminLojas() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["admin", "stores"], queryFn: fetchAdminStores });
  const fields: Field[] = [
    { name: "name", label: "Nome da loja", required: true },
    { name: "slug", label: "Slug", required: true, help: "Exemplo: amazon" },
    { name: "description", label: "Descrição", type: "textarea" },
    { name: "logo_url", label: "URL do logo", placeholder: "https://..." },
    { name: "website_url", label: "Website oficial", required: true, placeholder: "https://..." },
    { name: "country", label: "País ou região", placeholder: "Global" },
    { name: "rating", label: "Avaliação", type: "number" },
    { name: "is_active", label: "Publicada", type: "switch" },
  ];
  const save = async (values: RecordValues) => {
    try {
      await saveStore(values as never);
      toast.success("Loja guardada");
      await qc.invalidateQueries({ queryKey: ["admin", "stores"] });
      await qc.invalidateQueries({ queryKey: ["stores"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível guardar");
      throw err;
    }
  };
  const remove = async (id: string) => {
    if (!confirm("Eliminar esta loja? Os produtos associados ficarão sem loja.")) return;
    try {
      await deleteRow("stores", id);
      toast.success("Loja eliminada");
      await qc.invalidateQueries({ queryKey: ["admin", "stores"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível eliminar");
    }
  };
  return (
    <AdminShell
      title="Lojas"
      description="Adicione, edite, publique ou remova lojas parceiras."
      actions={
        <RecordDialog
          title="Nova loja"
          fields={fields}
          initial={{ is_active: true, rating: 4.5, country: "Global" }}
          onSubmit={save}
          trigger={
            <Button>
              <Plus className="mr-1 h-4 w-4" /> Nova loja
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
        <EmptyState title="Sem lojas" description="Adicione a primeira loja parceira." />
      ) : (
        <ul className="grid gap-3">
          {list.data.map((store) => (
            <li
              key={store.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-soft"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary p-2 text-sm font-bold text-primary">
                  {store.logo_url ? (
                    <img
                      src={store.logo_url}
                      alt={`${store.name} logo`}
                      className="size-full object-contain"
                    />
                  ) : (
                    store.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-semibold">{store.name}</h2>
                    {!store.is_active ? <Badge variant="secondary">Inativa</Badge> : null}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {store.country ?? "Global"} · /{store.slug}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <RecordDialog
                  title="Editar loja"
                  fields={fields}
                  initial={store as unknown as RecordValues}
                  onSubmit={save}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Pencil className="mr-1 h-4 w-4" /> Editar
                    </Button>
                  }
                />
                <Button variant="ghost" size="sm" onClick={() => void remove(store.id)}>
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
