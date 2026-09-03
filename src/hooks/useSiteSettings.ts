import { useQuery } from "@tanstack/react-query";
import { fetchPublicSettings } from "@/lib/api";

export const settingsQuery = {
  queryKey: ["site_settings"],
  queryFn: fetchPublicSettings,
  staleTime: 5 * 60 * 1000,
};

export function useSiteSettings() {
  const { data } = useQuery(settingsQuery);
  const get = <T,>(key: string, fallback: T): T => {
    const value = data?.[key];
    return (value === undefined || value === null ? fallback : value) as T;
  };
  return {
    siteName: get<string>("site_name", "OfertaPerfeita"),
    tagline: get<string>("site_tagline", "Ofertas curadas das melhores lojas online"),
    contactEmail: get<string>("contact_email", "ola@ofertaperfeita.com"),
    disclosure: get<string>(
      "affiliate_disclosure",
      "Podemos receber uma comissão pelas compras efetuadas através dos links assinalados.",
    ),
    defaultCurrency: get<string>("default_currency", "EUR"),
    featuredLimit: get<number>("featured_limit", 8),
  };
}
