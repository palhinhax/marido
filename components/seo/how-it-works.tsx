import { Search, MapPin, CalendarCheck } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Escolha o serviço",
    text: "Selecione o serviço que precisa e veja o preço à partida.",
  },
  {
    icon: MapPin,
    title: "Indique morada e horário",
    text: "Diga onde e quando, descreva o que precisa e envie fotos se ajudar.",
  },
  {
    icon: CalendarCheck,
    title: "Receba um profissional",
    text: "Um profissional avaliado aceita o pedido e trata de tudo.",
  },
];

export function HowItWorks({ title = "Como funciona" }: { title?: string }) {
  return (
    <section>
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={i} className="rounded-xl border bg-card p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <s.icon className="h-5 w-5" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm font-bold text-warm">{i + 1}</span>
              <h3 className="font-semibold">{s.title}</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
