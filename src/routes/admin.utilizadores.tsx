import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/utilizadores")({ component: AdminUsers });

function AdminUsers() {
  const users = useQuery({
    queryKey: ["admin", "profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, created_at");
      if (error) throw error;
      return (data ?? []) as Array<{ id: string; display_name: string | null; created_at: string }>;
    },
  });
  return (
    <AdminShell title="Utilizadores" description="Consulte os perfis dos utilizadores.">
      <div className="grid gap-3">
        {users.data?.map((profile) => (
          <article key={profile.id} className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{profile.display_name || "Sem nome"}</h2>
                <p className="mt-1 text-sm text-muted-foreground">ID: {profile.id}</p>
              </div>
              <Badge variant="secondary">Utilizador</Badge>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Dados de autenticação não são expostos nesta área.
            </p>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
