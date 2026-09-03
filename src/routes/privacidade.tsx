import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade — OfertaPerfeita" },
      { name: "description", content: "Como tratamos os seus dados pessoais no OfertaPerfeita." },
      { property: "og:title", content: "Política de privacidade — OfertaPerfeita" },
      {
        property: "og:description",
        content: "Como tratamos os seus dados pessoais no OfertaPerfeita.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-3xl md:text-4xl">Política de privacidade</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Recolhemos apenas os dados necessários ao funcionamento da conta: email, nome apresentado,
          favoritos e alertas de preço.
        </p>
        <p>
          Não vendemos dados pessoais. Pode pedir a eliminação da sua conta a qualquer momento
          através do email de contacto.
        </p>
      </div>
    </div>
  );
}
