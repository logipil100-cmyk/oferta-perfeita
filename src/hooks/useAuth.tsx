import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/api";

type AuthState = {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadRoles = (userId: string | undefined) => {
      if (!userId) {
        setRoles([]);
        return;
      }
      // Consulta diferida: nunca chamar o backend dentro do callback de auth.
      setTimeout(() => {
        void supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .then(({ data }) => {
            if (active) setRoles((data ?? []).map((row) => row.role as AppRole));
          });
      }, 0);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      loadRoles(nextSession?.user?.id);
      setLoading(false);
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      loadRoles(data.session?.user?.id);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user: session?.user ?? null,
      session,
      roles,
      isAdmin: roles.includes("admin") || roles.includes("superadmin"),
      isSuperAdmin: roles.includes("superadmin"),
      loading,
      signOut: async () => {
        await supabase.auth.signOut();
        setRoles([]);
      },
    }),
    [session, roles, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
