import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/ferramentas")({
  head: () => ({
    meta: [
      { title: "Ferramentas — OfertaPerfeita" },
      {
        name: "description",
        content: "Conversor de moeda e simulador de poupança para as suas compras online.",
      },
      { property: "og:title", content: "Ferramentas — OfertaPerfeita" },
      { property: "og:description", content: "Conversor de moeda e simulador de poupança." },
    ],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  const [amount, setAmount] = useState(100);
  const [rate, setRate] = useState(1.08);
  const [price, setPrice] = useState(100);
  const [discount, setDiscount] = useState(20);

  const saved = (price * discount) / 100;

  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-3xl md:text-4xl">Ferramentas</h1>

      <section className="mt-8 rounded-2xl border bg-card p-6 shadow-soft">
        <h2 className="text-xl">Conversor de moeda</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Introduza a taxa de câmbio atual da sua fonte de confiança — não usamos cotações
          automáticas.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (EUR)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate">Taxa de câmbio</Label>
            <Input
              id="rate"
              type="number"
              step="0.0001"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
          </div>
        </div>
        <p className="mt-4 font-display text-2xl">{(amount * rate).toFixed(2)}</p>
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-6 shadow-soft">
        <h2 className="text-xl">Simulador de poupança</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Preço original (€)</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount">Desconto (%)</Label>
            <Input
              id="discount"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Poupa {formatPrice(saved)} — paga {formatPrice(price - saved)}.
        </p>
      </section>
    </div>
  );
}
