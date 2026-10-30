import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingBlock } from "@/components/site/States";
import { deleteAlert, fetchAlerts } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/alertas")({
  head: () => ({
    meta: [
      { title: "Alertas de preço — OfertaPerfeita" },
      {
        name: "description",
        content: "Acompanhe os alertas de preço que criou para as suas ofertas.",
      },
      { property: "og:title", content: "Alertas de preço — OfertaPerfeita" },
      { property: "og:description", content: "Acompanhe os seus alertas de preço." },
    ],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const alerts = useQuery({
    queryKey: ["alerts", user?.id],
    queryFn: () => fetchAlerts(user!.id),
    enabled: !!user,
  });
  const removeAlert = useMutation({
    mutationFn: (alertId: string) => deleteAlert(user!.id, alertId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["alerts", user.id] });
      toast.success("Alerta removido.");
    },
    onError: () => toast.error("Não foi possível remover o alerta."),
  });

  if (loading) return <LoadingBlock />;
  if (!user) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Sessão necessária"
          description="Inicie sessão para gerir alertas de preço."
          action={
            <Button asChild>
              <Link to="/entrar">Entrar</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-3xl md:text-4xl">Alertas de preço</h1>
      <div className="mt-8">
        {alerts.isPending ? (
          <LoadingBlock />
        ) : (alerts.data ?? []).length === 0 ? (
          <EmptyState
            title="Sem alertas"
            description="Crie um alerta a partir de uma oferta para ser avisado."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {(alerts.data ?? []).map((a) => (
              <li
                key={a.id}
                className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Bell className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {a.products?.title ?? "Oferta"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Alvo: {formatPrice(Number(a.target_price))}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-destructive hover:text-destructive"
                  disabled={removeAlert.isPending}
                  onClick={() => removeAlert.mutate(a.id)}
                >
                  <Trash2 className="mr-2 size-4" aria-hidden />
                  Remover
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
