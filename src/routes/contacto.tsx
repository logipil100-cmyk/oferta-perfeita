import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto — OfertaPerfeita" },
      { name: "description", content: "Fale connosco sobre parcerias, correções de ofertas ou dúvidas gerais." },
      { property: "og:title", content: "Contacto — OfertaPerfeita" },
      { property: "og:description", content: "Fale connosco sobre parcerias, correções de ofertas ou dúvidas gerais." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-3xl md:text-4xl">Contacto</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>Para parcerias, correções de ofertas ou qualquer dúvida, escreva-nos por email. Respondemos normalmente em dois dias úteis.</p><p><a className="underline" href="mailto:ola@ofertaperfeita.com">ola@ofertaperfeita.com</a></p>
      </div>
    </div>
  );
}
