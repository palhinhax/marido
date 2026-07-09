import { Plus } from "lucide-react";

interface Faq {
  question: string;
  answer: string;
}

export function FAQSection({
  faqs,
  title = "Perguntas frequentes",
}: {
  faqs: Faq[];
  title?: string;
}) {
  if (!faqs.length) return null;
  return (
    <section>
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-6 divide-y rounded-xl border bg-card">
        {faqs.map((f, i) => (
          <details key={i} className="group px-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium">
              {f.question}
              <Plus className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-45" />
            </summary>
            <p className="pb-5 pr-8 text-sm text-muted-foreground">
              {f.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
