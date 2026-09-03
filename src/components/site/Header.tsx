import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, LayoutDashboard, LogOut, Menu, Search, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const NAV = [
  { to: "/ofertas", label: "Ofertas" },
  { to: "/cupoes", label: "Cupões" },
  { to: "/lojas", label: "Lojas" },
  { to: "/ferramentas", label: "Ferramentas" },
] as const;

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const { siteName } = useSiteSettings();
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    void navigate({ to: "/ofertas", search: { q: term || undefined } });
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-3">
        <Link to="/" className="flex items-center gap-2 font-display tracking-tight" aria-label="Ir para o início">
          <img src="/oferta-perfeita-logo.png" alt="Oferta Perfeita" className="size-11 object-contain" />
          <span className="hidden font-semibold tracking-tight sm:inline">{siteName}</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "text-foreground bg-secondary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submit} className="ml-auto hidden max-w-xs flex-1 items-center lg:flex" role="search">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Procurar ofertas…"
              aria-label="Procurar ofertas"
              className="pl-9"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          <Button asChild variant="ghost" size="icon" aria-label="Favoritos" className="hidden sm:inline-flex">
            <Link to="/favoritos">
              <Heart className="h-5 w-5" />
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Conta">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link to="/conta">A minha conta</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/favoritos">Favoritos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/alertas">Alertas de preço</Link>
                </DropdownMenuItem>
                {isAdmin ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Administração
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void signOut()}>
                  <LogOut className="mr-2 h-4 w-4" /> Terminar sessão
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/entrar">Entrar</Link>
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-80">
              <SheetHeader>
                <SheetTitle className="font-display">{siteName}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex flex-col gap-1 px-4 pb-6">
                <form onSubmit={submit} className="mb-3" role="search">
                  <Input
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="Procurar ofertas…"
                    aria-label="Procurar ofertas"
                  />
                </form>
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link to="/favoritos" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary">
                  Favoritos
                </Link>
                <Link to="/alertas" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary">
                  Alertas de preço
                </Link>
                {user ? (
                  <>
                    <Link to="/conta" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary">
                      A minha conta
                    </Link>
                    {isAdmin ? (
                      <Link to="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary">
                        Administração
                      </Link>
                    ) : null}
                    <Button variant="outline" className="mt-3" onClick={() => void signOut()}>
                      Terminar sessão
                    </Button>
                  </>
                ) : (
                  <Button asChild className="mt-3" onClick={() => setOpen(false)}>
                    <Link to="/entrar">Entrar</Link>
                  </Button>
                )}
              </div>
              <span className="sr-only">
                <X />
              </span>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
