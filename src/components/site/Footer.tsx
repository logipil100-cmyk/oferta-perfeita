import { Link } from "@tanstack/react-router";
import { Facebook, Globe2, Instagram, Mail, Play, ShieldCheck, Youtube } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const officialStores = ["Amazon", "Mercado Livre", "AliExpress", "Temu", "eBay", "Walmart"];
const globalStores = ["Shein", "Shopee", "Banggood", "Best Buy", "ClickBank", "Hotmart Global"];

export function Footer() {
  const { siteName, contactEmail, disclosure } = useSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border/70 bg-sidebar text-sidebar-foreground">
      <div className="container-page flex flex-col gap-8 py-8 lg:flex-row lg:items-start lg:gap-12">
        <div className="min-w-0 lg:w-2/5">
          <div className="flex items-center gap-2">
            <img src="/oferta-perfeita-logo.png" alt="Logótipo Oferta Perfeita" className="size-10 object-contain" />
            <span className="font-display text-xl font-bold">Ofertas<span className="text-primary">Mundo</span>.COM</span>
          </div>
          <p className="mt-3 max-w-md text-sm leading-5 text-sidebar-foreground/65">Ofertas curadas das melhores lojas online. {disclosure}</p>
          <h2 className="mt-5 text-xs font-bold uppercase tracking-wide">Nossas redes sociais oficiais</h2>
          <div className="mt-3 flex gap-2">
            <a href="#facebook" aria-label="Facebook" className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white transition-opacity hover:opacity-80"><Facebook className="size-4" /></a>
            <a href="#instagram" aria-label="Instagram" className="flex size-8 items-center justify-center rounded-lg bg-pink-600 text-white transition-opacity hover:opacity-80"><Instagram className="size-4" /></a>
            <a href="#youtube" aria-label="YouTube" className="flex size-8 items-center justify-center rounded-lg bg-red-600 text-white transition-opacity hover:opacity-80"><Youtube className="size-4" /></a>
            <a href="#canal" aria-label="Canal de ofertas" className="flex size-8 items-center justify-center rounded-lg bg-sidebar-accent text-white transition-opacity hover:opacity-80"><Play className="size-4 fill-current" /></a>
          </div>
        </div>

        <div className="grid min-w-0 flex-1 gap-6 md:grid-cols-[auto_1fr_1fr] md:items-start">
          <div className="flex flex-col gap-2 md:pt-5">
            <div className="flex items-center gap-2 rounded-full border border-sidebar-border bg-sidebar-accent/60 px-3 py-1.5 text-xs text-sidebar-foreground/80"><Globe2 className="size-3.5 text-primary" /> Cobertura Global • 14 Plataformas</div>
            <p className="flex items-center gap-2 rounded-full border border-primary/20 px-3 py-1.5 text-xs text-primary"><ShieldCheck className="size-3.5" /> 100% Links Oficiais Seguros</p>
          </div>
          <nav aria-label="Principais lojas oficiais">
            <h2 className="text-xs font-bold uppercase tracking-wide">Principais lojas oficiais</h2>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-sidebar-foreground/65">{officialStores.map((store) => <li key={store}><Link to="/lojas" className="transition-colors hover:text-primary">{store}</Link></li>)}</ul>
          </nav>
          <nav aria-label="Mais plataformas globais">
            <h2 className="text-xs font-bold uppercase tracking-wide">Mais plataformas globais</h2>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-sidebar-foreground/65">{globalStores.map((store) => <li key={store}><Link to="/lojas" className="transition-colors hover:text-primary">{store}</Link></li>)}</ul>
          </nav>
        </div>
      </div>
      <div className="border-t border-sidebar-border"><div className="container-page flex flex-col gap-2 py-5 text-xs text-sidebar-foreground/55 sm:flex-row sm:items-center sm:justify-between"><span>© {year} {siteName}. Todos os direitos reservados a José Jacinto.</span><a href={`mailto:${contactEmail}`} className="flex items-center gap-2 transition-colors hover:text-primary"><Mail className="size-3.5" /> {contactEmail}</a></div></div>
    </footer>
  );
}
