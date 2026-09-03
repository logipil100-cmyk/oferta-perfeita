import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — OfertaPerfeita" },
      {
        name: "description",
        content: "Aceda à sua conta para guardar favoritos e criar alertas de preço.",
      },
      { property: "og:title", content: "Entrar — OfertaPerfeita" },
      { property: "og:description", content: "Aceda à sua conta OfertaPerfeita." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) void navigate({ to: "/conta" });
  }, [user, navigate]);

  const authErrorMessage = (error: unknown) => {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("invalid login credentials") || message.includes("invalid credentials")) {
      return "Email ou palavra-passe inválidos.";
    }
    if (message.includes("email not confirmed")) {
      return "Confirme o seu email antes de iniciar sessão.";
    }
    if (message.includes("already registered") || message.includes("user already registered")) {
      return "Este email já está registado. Tente iniciar sessão.";
    }
    if (message.includes("invalid email") || message.includes("email_address_invalid")) {
      return "Introduza um email válido.";
    }
    if (message.includes("password") && (message.includes("weak") || message.includes("least"))) {
      return "A palavra-passe deve ter pelo menos 6 caracteres.";
    }
    if (message.includes("rate limit") || message.includes("too many")) {
      return "Demasiadas tentativas. Aguarde alguns minutos e tente novamente.";
    }
    if (message.includes("database") || message.includes("postgres") || message.includes("trigger")) {
      return "Não foi possível concluir o cadastro devido a um erro de base de dados.";
    }
    return "Não foi possível autenticar. Tente novamente.";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo:
            import.meta.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/entrar`,
        },
      });
      if (error) throw error;
      toast.success(
        data.session
          ? "Conta criada com sucesso."
          : "Conta criada. Verifique o seu email para confirmar a conta.",
      );
    } catch (error) {
      toast.error(authErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error("Não foi possível entrar com Google.");
  };

  return (
    <div className="container-page max-w-md py-16">
      <h1 className="text-3xl">{mode === "login" ? "Entrar" : "Criar conta"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Guarde favoritos e receba alertas quando os preços descerem.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Palavra-passe</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {mode === "login" ? "Entrar" : "Criar conta"}
        </Button>
      </form>

      <Button variant="outline" className="mt-3 w-full" onClick={() => void google()}>
        Continuar com Google
      </Button>

      <button
        type="button"
        className="mt-6 w-full text-sm text-muted-foreground hover:text-foreground"
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
      >
        {mode === "login" ? "Não tem conta? Criar conta" : "Já tem conta? Entrar"}
      </button>
    </div>
  );
}
