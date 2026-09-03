import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchFavoriteIds } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export function useFavorites() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const ids = useQuery({
    queryKey: ["favorite-ids", user?.id],
    queryFn: () => fetchFavoriteIds(user!.id),
    enabled: !!user,
  });

  const toggle = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("auth");
      const isFav = (ids.data ?? []).includes(productId);
      if (isFav) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
        if (error) throw error;
        return "removed" as const;
      }
      const { error } = await supabase.from("favorites").insert({ user_id: user.id, product_id: productId });
      if (error) throw error;
      return "added" as const;
    },
    onSuccess: (result) => {
      void qc.invalidateQueries({ queryKey: ["favorite-ids", user?.id] });
      void qc.invalidateQueries({ queryKey: ["favorites", user?.id] });
      toast.success(result === "added" ? "Guardado nos favoritos" : "Removido dos favoritos");
    },
    onError: (error: Error) => {
      toast.error(error.message === "auth" ? "Inicie sessão para guardar favoritos." : "Não foi possível atualizar os favoritos.");
    },
  });

  return {
    favoriteIds: ids.data ?? [],
    isFavorite: (id: string) => (ids.data ?? []).includes(id),
    toggleFavorite: (id: string) => toggle.mutate(id),
    canFavorite: !!user,
  };
}
