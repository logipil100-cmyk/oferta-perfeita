import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos e condições — OfertaPerfeita" },
      { name: "description", content: "Condições de utilização do OfertaPerfeita." },
      { property: "og:title", content: "Termos e condições — OfertaPerfeita" },
      { property: "og:description", content: "Condições de utilização do OfertaPerfeita." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-3xl md:text-4xl">Termos e condições</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Os preços e disponibilidades apresentados são indicativos e pertencem às lojas de origem,
          podendo alterar-se sem aviso. Confirme sempre na loja antes de comprar.
        </p>
        <p>O OfertaPerfeita não vende produtos nem processa pagamentos.</p>
      </div>
    </div>
  );
}
