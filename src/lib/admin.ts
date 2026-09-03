import { supabase } from "@/integrations/supabase/client";
import type { Coupon, Product, Profile, SiteSetting, Store, AppRole } from "@/lib/api";

export type AdminTable = "products" | "coupons" | "stores";

export async function fetchAdminProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*, stores(id, name, slug)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAdminCoupons() {
  const { data, error } = await supabase
    .from("coupons")
    .select("*, stores(id, name, slug)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAdminStores() {
  const { data, error } = await supabase.from("stores").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function saveProduct(values: Partial<Product> & { id?: string }) {
  const { id, ...rest } = values;
  const payload = rest as never;
  const query = id
    ? supabase.from("products").update(payload).eq("id", id)
    : supabase.from("products").insert(payload);
  const { error } = await query;
  if (error) throw error;
}

export async function saveCoupon(values: Partial<Coupon> & { id?: string }) {
  const { id, ...rest } = values;
  const payload = rest as never;
  const query = id
    ? supabase.from("coupons").update(payload).eq("id", id)
    : supabase.from("coupons").insert(payload);
  const { error } = await query;
  if (error) throw error;
}

export async function saveStore(values: Partial<Store> & { id?: string }) {
  const { id, ...rest } = values;
  const payload = rest as never;
  const query = id
    ? supabase.from("stores").update(payload).eq("id", id)
    : supabase.from("stores").insert(payload);
  const { error } = await query;
  if (error) throw error;
}

export async function deleteRow(table: AdminTable, id: string) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

export type ProfileWithRoles = Profile & { roles: AppRole[] };

export async function fetchProfilesWithRoles(): Promise<ProfileWithRoles[]> {
  const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("user_roles").select("user_id, role"),
  ]);
  if (pErr) throw pErr;
  if (rErr) throw rErr;
  return (profiles ?? []).map((p) => ({
    ...p,
    roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role as AppRole),
  }));
}

export async function grantRole(userId: string, role: AppRole) {
  const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
  if (error) throw error;
}

export async function revokeRole(userId: string, role: AppRole) {
  const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
  if (error) throw error;
}

export async function fetchAllSettings(): Promise<SiteSetting[]> {
  const { data, error } = await supabase.from("site_settings").select("*").order("key");
  if (error) throw error;
  return data ?? [];
}

export async function updateSetting(key: string, value: unknown) {
  const { error } = await supabase
    .from("site_settings")
    .update({ value: value as never })
    .eq("key", key);
  if (error) throw error;
}
