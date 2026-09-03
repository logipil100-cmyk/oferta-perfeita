/**
 * Segurança de links de afiliado.
 * Só são aceites URLs absolutos em https. Qualquer outro valor (javascript:,
 * data:, caminhos relativos ou domínios malformados) é descartado, evitando
 * que conteúdo introduzido no backoffice se transforme num vetor de ataque.
 */
export function safeAffiliateUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

/** Atributos obrigatórios em qualquer link de saída monetizado. */
export const affiliateLinkProps = {
  target: "_blank",
  rel: "sponsored nofollow noopener noreferrer",
} as const;
