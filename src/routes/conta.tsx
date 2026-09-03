import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, LoadingBlock } from "@/components/site/States";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/conta")({
  head: () => ({
    meta: [
      { title: "A minha conta — OfertaPerfeita" },
      { name: "description", content: "Gira o seu perfil, favoritos e alertas de preço." },
      { property: "og:title", content: "A minha conta — OfertaPerfeita" },
      { property: "og:description", content: "Gira o seu perfil, favoritos e alertas." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [request, setRequest] = useState({ title: "", description: "", affiliate_url: "" });
  const saveProfile = async (event: React.FormEvent) => { event.preventDefault(); if (!user) return; setSaving(true); const { error } = await supabase.from("profiles").upsert({ id: user.id, display_name: name.trim(), phone: phone.trim() } as never); setSaving(false); if (error) toast.error("Não foi possível guardar o perfil"); else toast.success("Perfil atualizado"); };
  const submitRequest = async (event: React.FormEvent) => { event.preventDefault(); if (!user) return; if (!request.affiliate_url.startsWith("http://") && !request.affiliate_url.startsWith("https://")) return toast.error("Use um link iniciado por https://"); const { error } = await supabase.from("affiliate_requests" as never).insert({ ...request, user_id: user.id } as never); if (error) toast.error("Não foi possível enviar o pedido"); else { setRequest({ title: "", description: "", affiliate_url: "" }); toast.success("Pedido enviado para análise"); } };

  if (loading) return <LoadingBlock />;
  if (!user) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Sessão necessária"
          description="Inicie sessão para aceder à sua conta."
          action={<Button asChild><Link to="/entrar">Entrar</Link></Button>}
        />
      </div>
    );
  }

  return (
    <div className="container-page max-w-2xl py-12">
      <h1 className="text-3xl md:text-4xl">A minha conta</h1>
      <div className="mt-6 rounded-2xl border bg-card p-6 shadow-soft"><p className="text-sm text-muted-foreground">Sessão iniciada como</p><p className="font-medium">{user.email}</p></div>
      <form onSubmit={saveProfile} className="mt-6 space-y-4 rounded-2xl border bg-card p-6 shadow-soft"><h2 className="text-xl font-semibold">Os meus dados</h2><p className="text-sm text-muted-foreground">Altere o seu nome e número de telemóvel. O email de acesso é gerido pelo sistema.</p><Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} /><Input placeholder="Número de telemóvel" value={phone} onChange={(e) => setPhone(e.target.value)} /><Button disabled={saving}>{saving ? "A guardar…" : "Guardar dados"}</Button></form>
      <form onSubmit={submitRequest} className="mt-6 space-y-4 rounded-2xl border bg-card p-6 shadow-soft"><h2 className="text-xl font-semibold">Pedir publicação de link</h2><p className="text-sm text-muted-foreground">Envie um link de afiliado para análise do administrador. Se aprovado, será publicado como produto.</p><Input required placeholder="Título do produto" value={request.title} onChange={(e) => setRequest({ ...request, title: e.target.value })} /><Input required type="url" placeholder="https://link-de-afiliado.com/..." value={request.affiliate_url} onChange={(e) => setRequest({ ...request, affiliate_url: e.target.value })} /><Textarea placeholder="Descrição do produto" value={request.description} onChange={(e) => setRequest({ ...request, description: e.target.value })} /><Button type="submit">Enviar pedido ao admin</Button></form>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild variant="outline"><Link to="/favoritos">Favoritos</Link></Button>
        <Button asChild variant="outline"><Link to="/alertas">Alertas de preço</Link></Button>
        {isAdmin ? <Button asChild variant="outline"><Link to="/admin">Administração</Link></Button> : null}
        <Button variant="outline" onClick={() => void signOut()}>Terminar sessão</Button>
      </div>
    </div>
  );
}
