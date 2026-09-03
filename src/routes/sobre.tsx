import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre nós — OfertaPerfeita" },
      { name: "description", content: "Quem somos e como selecionamos as ofertas publicadas no OfertaPerfeita." },
      { property: "og:title", content: "Sobre nós — OfertaPerfeita" },
      { property: "og:description", content: "Quem somos e como selecionamos as ofertas publicadas no OfertaPerfeita." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-3xl md:text-4xl">Sobre nós</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>O OfertaPerfeita é uma plataforma de curadoria de ofertas e cupões de lojas online. Selecionamos manualmente as promoções que consideramos relevantes.</p><p>Utilizamos links de afiliado: se comprar através deles podemos receber uma comissão, sem custo adicional para si.</p>
      </div>
    </div>
  );
}
