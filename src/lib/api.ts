import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Store = Database["public"]["Tables"]["stores"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Coupon = Database["public"]["Tables"]["coupons"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type SiteSetting = Database["public"]["Tables"]["site_settings"]["Row"];
export type AppRole = Database["public"]["Enums"]["app_role"];

export type ProductWithStore = Product & { stores: Pick<Store, "id" | "name" | "slug"> | null };
export type CouponWithStore = Coupon & { stores: Pick<Store, "id" | "name" | "slug"> | null };

const PRODUCT_SELECT = "*, stores(id, name, slug)";

export type OfferFilters = {
  q?: string;
  categoria?: string;
  loja?: string;
  min?: number;
  max?: number;
  ordenar?: string;
  comCupao?: boolean;
  pagina?: number;
};

export const PAGE_SIZE = 12;

function escapeIlike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function fetchOffers(filters: OfferFilters) {
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("is_active", true);

  if (filters.q) query = query.ilike("title", `%${escapeIlike(filters.q.trim())}%`);
  if (filters.categoria) query = query.eq("category_slug", filters.categoria);
  if (filters.loja) query = query.eq("store_id", filters.loja);
  if (typeof filters.min === "number") query = query.gte("price", filters.min);
  if (typeof filters.max === "number") query = query.lte("price", filters.max);
  if (filters.comCupao) query = query.not("coupon_code", "is", null);

  switch (filters.ordenar) {
    case "preco-asc":
      query = query.order("price", { ascending: true });
      break;
    case "preco-desc":
      query = query.order("price", { ascending: false });
      break;
    case "desconto":
      query = query.order("old_price", { ascending: false, nullsFirst: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const page = Math.max(1, filters.pagina ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  const { data, error, count } = await query.range(from, from + PAGE_SIZE - 1);
  if (error) throw error;
  return { items: (data ?? []) as ProductWithStore[], total: count ?? 0, page };
}

export async function fetchFeaturedProducts(limit = 8) {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ProductWithStore[];
}

export async function fetchLatestProducts(limit = 8) {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ProductWithStore[];
}

export async function fetchProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return (data as ProductWithStore | null) ?? null;
}

export async function fetchRelatedProducts(categorySlug: string | null, excludeId: string) {
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .neq("id", excludeId)
    .limit(4);
  if (categorySlug) query = query.eq("category_slug", categorySlug);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ProductWithStore[];
}

export async function fetchStores(activeOnly = true) {
  let query = supabase.from("stores").select("*").order("sort_order");
  if (activeOnly) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchStoreBySlug(slug: string) {
  const { data, error } = await supabase.from("stores").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function fetchCoupons(storeId?: string) {
  let query = supabase
    .from("coupons")
    .select("*, stores(id, name, slug)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (storeId) query = query.eq("store_id", storeId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CouponWithStore[];
}

export async function fetchPublicSettings() {
  const { data, error } = await supabase.from("site_settings").select("key, value");
  if (error) throw error;
  const map: Record<string, unknown> = {};
  for (const row of data ?? []) map[row.key] = row.value;
  return map;
}

export async function fetchFavorites(userId: string) {
  const { data, error } = await supabase
    .from("favorites")
    .select("id, created_at, product_id, products(*, stores(id, name, slug))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchFavoriteIds(userId: string) {
  const { data, error } = await supabase
    .from("favorites")
    .select("product_id")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((row) => row.product_id);
}

export async function fetchAlerts(userId: string) {
  const { data, error } = await supabase
    .from("price_alerts")
    .select("*, products(*, stores(id, name, slug))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createAlert(userId: string, productId: string, targetPrice: number) {
  if (!Number.isFinite(targetPrice) || targetPrice <= 0) throw new Error("invalid-target-price");
  const { error } = await supabase.from("price_alerts").insert({
    user_id: userId,
    product_id: productId,
    target_price: targetPrice,
  });
  if (error) throw error;
}

export async function deleteAlert(userId: string, alertId: string) {
  const { error } = await supabase
    .from("price_alerts")
    .delete()
    .eq("id", alertId)
    .eq("user_id", userId);
  if (error) throw error;
}
