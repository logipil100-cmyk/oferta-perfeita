import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/utilizadores")({ component: AdminUsers });

function AdminUsers() {
  const users = useQuery({ queryKey: ["admin", "profiles"], queryFn: async () => { const { data, error } = await supabase.from("profiles").select("id, display_name, email, phone, created_at" as never); if (error) throw error; return (data ?? []) as Array<{ id: string; display_name: string | null; email: string | null; phone: string | null }>; } });
  return <AdminShell title="Utilizadores" description="Consulte e atualize os contactos dos utilizadores."><div className="grid gap-3">{users.data?.map((profile) => <article key={profile.id} className="rounded-2xl border bg-card p-5 shadow-soft"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">{profile.display_name || "Sem nome"}</h2><p className="mt-1 text-sm text-muted-foreground">{profile.email || "Email não registado"}</p><p className="text-sm text-muted-foreground">{profile.phone || "Telemóvel não registado"}</p></div><Badge variant="secondary">Utilizador</Badge></div><p className="mt-4 text-xs text-muted-foreground">O email de autenticação deve ser alterado através do fluxo seguro de confirmação do Supabase.</p></article>)}</div></AdminShell>;
}
