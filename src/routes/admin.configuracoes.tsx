import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminShell } from "@/components/admin/AdminShell";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/site/States";
import { fetchAllSettings, updateSetting } from "@/lib/admin";

export const Route = createFileRoute("/admin/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Administração OfertaPerfeita" },
      { name: "description", content: "Configurações públicas do OfertaPerfeita." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminSettings,
});

function settingText(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value ?? "");
}

function AdminSettings() {
  const qc = useQueryClient();
  const settings = useQuery({ queryKey: ["admin", "settings"], queryFn: fetchAllSettings });
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings.data) {
      setValues(
        Object.fromEntries(
          settings.data.map((setting) => [setting.key, settingText(setting.value)]),
        ),
      );
    }
  }, [settings.data]);

  const save = useMutation({
    mutationFn: async () => {
      await Promise.all(Object.entries(values).map(([key, value]) => updateSetting(key, value)));
    },
    onSuccess: async () => {
      toast.success("Configurações guardadas");
      await qc.invalidateQueries({ queryKey: ["site_settings"] });
      await qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Não foi possível guardar"),
  });

  return (
    <AdminShell title="Configurações" description="Edite os valores públicos do site.">
      {settings.isPending ? (
        <LoadingBlock />
      ) : settings.isError ? (
        <ErrorState onRetry={() => void settings.refetch()} />
      ) : settings.data?.length === 0 ? (
        <EmptyState
          title="Sem configurações"
          description="Não existem configurações disponíveis."
        />
      ) : (
        <form
          className="max-w-2xl space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate();
          }}
        >
          {settings.data?.map((setting) => (
            <div key={setting.key} className="space-y-2">
              <Label htmlFor={`setting-${setting.key}`}>{setting.label || setting.key}</Label>
              <Input
                id={`setting-${setting.key}`}
                value={values[setting.key] ?? ""}
                onChange={(event) =>
                  setValues((current) => ({ ...current, [setting.key]: event.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">Chave: {setting.key}</p>
            </div>
          ))}
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "A guardar…" : "Guardar alterações"}
          </Button>
        </form>
      )}
    </AdminShell>
  );
}
