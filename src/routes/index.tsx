import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BellRing, Check, ChevronRight, Clock3, Gift, Globe2, Search, ShieldCheck, Sparkles, TrendingDown, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/ProductCard";
import { CouponCard } from "@/components/site/CouponCard";
import { StoreCard } from "@/components/site/StoreCard";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/site/States";
import { fetchCoupons, fetchFeaturedProducts, fetchLatestProducts, fetchStores } from "@/lib/api";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "OfertaPerfeita — as melhores ofertas num só lugar" }, { name: "description", content: "Descubra ofertas verificadas, cupões ativos e preços comparados das melhores lojas online." }, { property: "og:title", content: "OfertaPerfeita — ofertas e cupões curados" }, { property: "og:description", content: "Descubra ofertas verificadas, cupões ativos e preços comparados das melhores lojas online." }] }),
  component: HomePage,
});

const quickCategories = [
  { name: "Eletrônicos", icon: "▣" }, { name: "Casa", icon: "⌂" }, { name: "Moda", icon: "◇" },
  { name: "Games", icon: "◈" }, { name: "Beleza", icon: "✦" }, { name: "Viagens", icon: "⌁" },
];

const partnerLogoUrls: Record<string, string> = {
  amazon: "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/amazon/default.svg",
  "mercado-livre": "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/mercado-livre/default.svg",
  aliexpress: "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/aliexpress/default.svg",
  temu: "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/temu/default.svg",
  ebay: "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/ebay/default.svg",
  walmart: "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/walmart/default.svg",
  shein: "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/shein/default.svg",
  shopee: "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/shopee/default.svg",
  banggood: "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/banggood/default.svg",
  "best-buy": "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/best-buy/default.svg",
  clickbank: "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/clickbank/default.svg",
  hotmart: "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/hotmart/default.svg",
  sharesale: "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/sharesale/default.svg",
};

function getPartnerLogo(name: string) {
  const key = name.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/\\s+/g, "-");
  return partnerLogoUrls[key] ?? Object.entries(partnerLogoUrls).find(([slug]) => key.includes(slug) || slug.includes(key))?.[1];
}

function HomePage() {
  const { siteName, tagline, featuredLimit } = useSiteSettings();
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const featured = useQuery({ queryKey: ["products", "featured", featuredLimit], queryFn: () => fetchFeaturedProducts(featuredLimit) });
  const latest = useQuery({ queryKey: ["products", "latest"], queryFn: () => fetchLatestProducts(4) });
  const coupons = useQuery({ queryKey: ["coupons", "home"], queryFn: () => fetchCoupons() });
  const stores = useQuery({ queryKey: ["stores"], queryFn: () => fetchStores() });
  const products = featured.data ?? [];

  return (
    <>
      <section className="relative isolate overflow-hidden border-b">
        <video className="absolute inset-0 -z-20 size-full object-cover opacity-35" autoPlay muted loop playsInline preload="metadata" aria-hidden="true"><source src="/oferta-perfeita-video.mp4" type="video/mp4" /></video>
        <div className="absolute inset-0 -z-10 bg-background/85" aria-hidden="true" />
        <div className="container-page py-10 text-center md:py-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> Curadoria diária, preços reais
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.08] md:text-5xl lg:text-6xl">As melhores ofertas do <span className="text-gradient-brand">mundo</span> num só lugar</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-6 text-muted-foreground">{tagline} Encontre promoções verificadas, cupões ativos e links oficiais de Amazon, Mercado Livre, AliExpress, Temu e muito mais.</p>
          <form onSubmit={(e) => { e.preventDefault(); void navigate({ to: "/ofertas", search: { q: term || undefined } }); }} role="search" className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border-2 border-primary/60 bg-card p-2 shadow-lift">
            <Search className="ml-2 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            <input value={term} onChange={(e) => setTerm(e.target.value)} aria-label="Procurar ofertas" placeholder="O que você está procurando hoje? Ex: iPhone, MacBook..." className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground" />
            <Button type="submit" size="lg" className="shrink-0">Explorar <ArrowRight className="ml-1 h-4 w-4" /></Button>
          </form>
          <div className="mx-auto mt-5 flex max-w-3xl flex-wrap items-center justify-center gap-2 text-xs"><span className="font-medium text-accent">Mais buscados:</span>{["iPhone 15 Pro Max", "Temu -70%", "PS5 Slim", "MacBook Air M3", "AliExpress Choice"].map((item) => <Link key={item} to="/ofertas" search={{ q: item }} className="rounded-full border bg-card/70 px-3 py-1.5 text-muted-foreground transition-colors hover:border-primary hover:text-foreground">{item}</Link>)}</div>
          <div className="mt-12 grid gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
            {[
              { Icon: ShieldCheck, title: "100% Links Oficiais", desc: "Direto para as lojas oficiais.", iconClass: "text-primary" },
              { Icon: Globe2, title: "Lojas Globais", desc: "14 grandes varejistas.", iconClass: "text-cyan-400" },
              { Icon: Zap, title: "Multi-Moedas", desc: "USD, EUR, BRL e CAD.", iconClass: "text-accent" },
              { Icon: Check, title: "Sem Taxas Ocultas", desc: "Compare o preço real.", iconClass: "text-primary" },
            ].map(({ Icon, title, desc, iconClass }) => <div key={title} className="flex items-start gap-3 rounded-2xl border border-border/80 bg-card/70 p-4 shadow-soft transition-transform hover:-translate-y-0.5"><Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconClass}`} aria-hidden /><div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{desc}</p></div></div>)}
          </div>
        </div>
      </section>

      <section className="border-b bg-secondary/20 py-8"><div className="container-page"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Nossos parceiros oficiais <span className="font-normal text-muted-foreground">(13 grandes plataformas)</span></h2><Link to="/lojas" className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary">Clique para filtrar por loja</Link></div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">{(stores.data ?? []).slice(0, 13).map((store) => <Link key={store.id} to="/lojas/$slug" params={{ slug: store.slug }} className="group flex min-w-0 items-center gap-2 rounded-xl border bg-card px-3 py-3 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-primary hover:shadow-md"><span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary p-1.5 text-xs font-bold text-primary"><img src={store.logo_url || getPartnerLogo(store.name) || ""} alt={`${store.name} logo`} className="size-full object-contain" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />{!store.logo_url && !getPartnerLogo(store.name) ? store.name.slice(0, 2).toUpperCase() : null}</span><span className="min-w-0"><span className="block truncate text-xs font-semibold group-hover:text-primary">{store.name}</span><span className="block truncate text-[10px] text-muted-foreground">{store.country ?? "Global"}</span></span></Link>)}</div></div></section>

      <section className="border-b bg-secondary/30 py-12"><div className="container-page text-center"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Plataformas parceiras oficiais</p><h2 className="mx-auto mt-3 max-w-3xl text-3xl font-extrabold md:text-4xl">Grandes lojas &amp; marketplaces globais</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Compre diretamente nas maiores plataformas de e-commerce do mundo com segurança, garantia oficial e ofertas verificadas.</p><Link to="/lojas" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">Explorar todas as lojas <ArrowRight className="h-4 w-4" /></Link><div className="mx-auto mt-8 grid max-w-5xl grid-cols-3 gap-3 text-left sm:grid-cols-5 md:grid-cols-7">{(stores.data ?? []).slice(0, 13).map((store) => <Link key={store.id} to="/lojas/$slug" params={{ slug: store.slug }} className="group flex flex-col items-center gap-2 rounded-xl border bg-card p-3 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md"><span className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-secondary p-1.5"><img src={store.logo_url || getPartnerLogo(store.name) || ""} alt={`${store.name} logo`} className="size-full object-contain" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />{!store.logo_url && !getPartnerLogo(store.name) ? store.name.slice(0, 2).toUpperCase() : null}</span><span className="w-full truncate text-center text-xs font-semibold group-hover:text-primary">{store.name}</span></Link>)}</div></div></section>

      <section className="container-page py-10"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Explore por interesse</p><h2 className="mt-2 text-2xl">Categorias em alta</h2></div><Link to="/ofertas" className="text-sm font-semibold text-primary hover:underline">Ver todas <ChevronRight className="inline h-4 w-4" /></Link></div><div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">{quickCategories.map((c) => <Link key={c.name} to="/ofertas" search={{ categoria: c.name }} className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 text-center transition-all hover:-translate-y-1 hover:border-primary hover:shadow-soft"><span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-xl text-primary">{c.icon}</span><span className="text-xs font-semibold">{c.name}</span></Link>)}</div></section>

      <section className="bg-secondary/30 py-12"><div className="container-page"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-accent">Não perca</p><h2 className="mt-2 text-2xl">Ofertas em destaque</h2></div><Link to="/ofertas" className="text-sm font-semibold text-primary hover:underline">Ver todas <ChevronRight className="inline h-4 w-4" /></Link></div><div className="mt-6">{featured.isPending ? <CardGridSkeleton count={4} /> : featured.isError ? <ErrorState onRetry={() => void featured.refetch()} /> : products.length === 0 ? <EmptyState title="Ainda não há destaques" description="Volte em breve para novas ofertas." /> : <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>}</div></div></section>

      <section className="container-page py-12"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Escolha inteligente</p><h2 className="mt-2 text-2xl">Compare e economize</h2></div><TrendingDown className="h-6 w-6 text-primary" aria-hidden /></div><div className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-soft"><div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b bg-secondary/50 px-5 py-3 text-xs font-semibold text-muted-foreground"><span>Produto encontrado</span><span>Melhor preço</span><span>Economia</span><span /></div>{products.slice(0, 3).map((p, i) => <div key={p.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b px-5 py-4 last:border-0"><div className="flex min-w-0 items-center gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">{i + 1}</span><span className="truncate text-sm font-medium">{p.title}</span></div><span className="font-display text-base">{p.price} {p.currency}</span><span className="text-sm font-semibold text-primary">-{p.old_price ? Math.round((1 - Number(p.price) / Number(p.old_price)) * 100) : 0}%</span><Link to="/ofertas/$slug" params={{ slug: p.slug }} className="text-xs font-semibold text-primary hover:underline">Ver oferta</Link></div>)}</div></section>

      <section className="container-page pb-12"><div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-card to-card p-7 md:p-10"><div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground"><BellRing className="h-3.5 w-3.5" aria-hidden /> ALERTAS DE PREÇO</div><h2 className="max-w-xl text-2xl md:text-3xl">O preço baixou? Você fica sabendo primeiro.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Crie alertas para os seus produtos favoritos e receba uma notificação quando o preço atingir o seu alvo.</p></div><Button asChild size="lg"><Link to="/alertas">Criar meu alerta <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div></div></section>

      <section className="container-page py-12"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-accent">Descontos secretos</p><h2 className="mt-2 text-2xl">Cupons ativos</h2></div><Link to="/cupoes" className="text-sm font-semibold text-primary hover:underline">Ver todos <ChevronRight className="inline h-4 w-4" /></Link></div><div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{(coupons.data ?? []).slice(0, 3).map((c) => <CouponCard key={c.id} coupon={c} />)}</div></section>

      <section className="container-page py-4"><div className="overflow-hidden rounded-3xl border border-primary/50 bg-primary/15 p-8 text-center md:p-12"><div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Gift className="h-7 w-7" aria-hidden /></div><div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground"><Users className="h-3.5 w-3.5" aria-hidden /> CANAL OFICIAL VIP</div><h2 className="mt-4 text-2xl md:text-3xl">Receba ofertas relâmpago em primeira mão</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">As melhores promoções, descontos de até 80% e cupons secretos enviados diretamente para você.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Button size="lg">Entrar no canal VIP <ArrowRight className="ml-2 h-4 w-4" /></Button><Button variant="outline" size="lg" asChild><Link to="/contacto">Falar com suporte</Link></Button></div></div></section>

      <section className="container-page py-12"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Parceiros confiáveis</p><h2 className="mt-2 text-2xl">As melhores lojas</h2></div><Link to="/lojas" className="text-sm font-semibold text-primary hover:underline">Ver todas <ChevronRight className="inline h-4 w-4" /></Link></div><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{(stores.data ?? []).slice(0, 6).map((s) => <StoreCard key={s.id} store={s} />)}</div></section>

      <section className="container-page pb-12"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Recém-chegadas</p><h2 className="mt-2 text-2xl">Novas ofertas</h2></div><Clock3 className="h-6 w-6 text-muted-foreground" aria-hidden /></div><div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{(latest.data ?? []).map((p) => <ProductCard key={p.id} product={p} />)}</div></section>

      <section className="border-t bg-secondary/20 py-14"><div className="container-page"><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-semibold uppercase tracking-widest text-primary">Ajuda para comprar melhor</p><h2 className="mt-2 text-3xl font-extrabold md:text-4xl">Perguntas Frequentes sobre as Compras</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Tudo o que precisa de saber antes de escolher uma oferta e comprar numa das nossas lojas parceiras.</p></div><div className="mx-auto mt-8 max-w-3xl divide-y overflow-hidden rounded-2xl border bg-card shadow-soft">{[
        { q: "Como funcionam as ofertas apresentadas?", a: "Reunimos ofertas de lojas parceiras e apresentamos os preços, descontos e condições disponíveis para facilitar a sua comparação." },
        { q: "A compra é feita diretamente no site?", a: "Não. Ao clicar em uma oferta, será encaminhado para o site oficial da loja, onde a compra é concluída com segurança." },
        { q: "Os preços e descontos estão sempre atualizados?", a: "Fazemos o possível para manter as informações atualizadas, mas os preços, stock e condições podem mudar na loja a qualquer momento." },
        { q: "Posso confiar nos links das ofertas?", a: "Sim. Priorizamos links oficiais das lojas parceiras. Confirme sempre o domínio da loja antes de finalizar a compra." },
        { q: "Como posso criar um alerta de preço?", a: "Entre na sua conta, abra a página de uma oferta e defina o preço-alvo. Avisaremos quando o produto atingir esse valor." },
      ].map(({ q, a }) => <details key={q} className="group px-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-sm font-semibold marker:hidden"><span>{q}</span><ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" aria-hidden /></summary><p className="max-w-2xl pb-5 pr-8 text-sm leading-6 text-muted-foreground">{a}</p></details>)}</div></div></section>
    </>
  );
}

