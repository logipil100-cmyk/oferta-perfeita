import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { affiliateLinkProps, safeAffiliateUrl } from "@/lib/affiliate";
import { daysLeft, formatDate } from "@/lib/format";
import type { CouponWithStore } from "@/lib/api";

export function CouponCard({ coupon }: { coupon: CouponWithStore }) {
  const [copied, setCopied] = useState(false);
  const url = safeAffiliateUrl(coupon.affiliate_url);
  const remaining = daysLeft(coupon.expires_at);
  const expired = remaining === 0;

  const copy = async () => {
    if (expired) return;

    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      toast.success(`Código ${coupon.code} copiado`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o código. Copie manualmente.");
    }
  };

  return (
    <article className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          {coupon.stores ? (
            <Link
              to="/lojas/$slug"
              params={{ slug: coupon.stores.slug }}
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:underline"
            >
              {coupon.stores.name}
            </Link>
          ) : null}
          <h3 className="mt-1 text-base font-semibold">{coupon.title}</h3>
        </div>
        {coupon.discount_label ? (
          <Badge className="shrink-0 bg-accent text-accent-foreground">
            {coupon.discount_label}
          </Badge>
        ) : null}
      </div>

      {coupon.description ? (
        <p className="text-sm text-muted-foreground">{coupon.description}</p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={copy}
          disabled={expired}
          aria-label={expired ? "Cupão expirado" : "Copiar código"}
          className="flex flex-1 items-center justify-between gap-2 rounded-xl border border-dashed border-accent bg-accent/10 px-4 py-2.5 text-left font-mono text-sm font-semibold tracking-wider transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {coupon.code}
          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          <span className="sr-only">Copiar código</span>
        </button>
        {url ? (
          <Button asChild variant="default" className="sm:w-auto">
            <a href={url} {...affiliateLinkProps}>
              Ir à loja <ExternalLink className="ml-1 h-4 w-4" />
            </a>
          </Button>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        {coupon.expires_at
          ? remaining === 0
            ? "Expirado"
            : `Válido até ${formatDate(coupon.expires_at)} · ${remaining} dia(s)`
          : "Sem data de expiração indicada"}
      </p>
      {coupon.terms ? <p className="text-xs text-muted-foreground">{coupon.terms}</p> : null}
    </article>
  );
}
