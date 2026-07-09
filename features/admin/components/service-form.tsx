"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { slugify } from "@/lib/utils";
import { createService, updateService } from "../catalog-actions";

type PriceType = "FIXED" | "STARTING" | "HOURLY" | "QUOTE";

export interface ServiceFormValue {
  categoryId: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  priceType: PriceType;
  basePrice: string;
  estimatedDurationMinutes: string;
  requiresPhotos: boolean;
  requiresQuote: boolean;
  professionalRole: string;
  seoTitle: string;
  seoDescription: string;
  isActive: boolean;
  order: string;
  included: string;
  notIncluded: string;
  extras: { name: string; price: string }[];
  faqs: { question: string; answer: string }[];
}

export const EMPTY_SERVICE: ServiceFormValue = {
  categoryId: "",
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  priceType: "STARTING",
  basePrice: "",
  estimatedDurationMinutes: "60",
  requiresPhotos: false,
  requiresQuote: false,
  professionalRole: "",
  seoTitle: "",
  seoDescription: "",
  isActive: true,
  order: "0",
  included: "",
  notIncluded: "",
  extras: [],
  faqs: [],
};

const PRICE_TYPES: { value: PriceType; label: string }[] = [
  { value: "STARTING", label: "A partir de" },
  { value: "FIXED", label: "Preço fixo" },
  { value: "HOURLY", label: "Preço à hora" },
  { value: "QUOTE", label: "Orçamento sob avaliação" },
];

export function ServiceForm({
  categories,
  initial,
  serviceId,
}: {
  categories: { id: string; name: string }[];
  initial: ServiceFormValue;
  serviceId?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<ServiceFormValue>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(serviceId));
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ServiceFormValue>(
    k: K,
    v: ServiceFormValue[K]
  ) => setForm((f) => ({ ...f, [k]: v }));

  const isQuote = form.priceType === "QUOTE";

  function onName(v: string) {
    setForm((f) => ({
      ...f,
      name: v,
      slug: slugTouched ? f.slug : slugify(v),
    }));
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        categoryId: form.categoryId,
        name: form.name.trim(),
        slug: slugify(form.slug),
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        priceType: form.priceType,
        basePrice:
          isQuote || form.basePrice === "" ? null : Number(form.basePrice),
        estimatedDurationMinutes: Number(form.estimatedDurationMinutes),
        requiresPhotos: form.requiresPhotos,
        requiresQuote: form.requiresQuote,
        professionalRole: form.professionalRole.trim(),
        seoTitle: form.seoTitle.trim(),
        seoDescription: form.seoDescription.trim(),
        isActive: form.isActive,
        order: Number(form.order) || 0,
        included: form.included
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        notIncluded: form.notIncluded
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        extras: form.extras
          .filter((e) => e.name.trim())
          .map((e) => ({ name: e.name.trim(), price: Number(e.price) || 0 })),
        faqs: form.faqs
          .filter((f) => f.question.trim() && f.answer.trim())
          .map((f) => ({
            question: f.question.trim(),
            answer: f.answer.trim(),
          })),
      };

      if (serviceId) {
        await updateService(serviceId, payload);
        toast({ title: "Serviço atualizado" });
        router.refresh();
      } else {
        await createService(payload);
        toast({ title: "Serviço criado" });
        router.push("/admin/servicos");
      }
    } catch (e) {
      toast({
        title: "Erro ao guardar",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Basics */}
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Básico</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <select
              value={form.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">— escolher —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={form.name} onChange={(e) => onName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Slug (URL)</Label>
            <Input
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Ordem</Label>
            <Input
              type="number"
              value={form.order}
              onChange={(e) => set("order", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Descrição curta</Label>
          <Input
            value={form.shortDescription}
            onChange={(e) => set("shortDescription", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Descrição completa</Label>
          <Textarea
            className="min-h-[120px]"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
      </section>

      {/* Pricing */}
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Preço e duração</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Tipo de preço</Label>
            <select
              value={form.priceType}
              onChange={(e) => set("priceType", e.target.value as PriceType)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              {PRICE_TYPES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Preço base (€)</Label>
            <Input
              type="number"
              value={isQuote ? "" : form.basePrice}
              disabled={isQuote}
              placeholder={isQuote ? "Sob avaliação" : ""}
              onChange={(e) => set("basePrice", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Duração (min)</Label>
            <Input
              type="number"
              value={form.estimatedDurationMinutes}
              onChange={(e) => set("estimatedDurationMinutes", e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.requiresPhotos}
              onChange={(e) => set("requiresPhotos", e.target.checked)}
            />
            Requer fotos
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.requiresQuote}
              onChange={(e) => set("requiresQuote", e.target.checked)}
            />
            Requer orçamento
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
            />
            Ativo
          </label>
        </div>
      </section>

      {/* Included / not included */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 rounded-xl border bg-card p-5">
          <Label>O que está incluído (uma linha por item)</Label>
          <Textarea
            className="min-h-[120px]"
            value={form.included}
            onChange={(e) => set("included", e.target.value)}
          />
        </div>
        <div className="space-y-1.5 rounded-xl border bg-card p-5">
          <Label>O que não está incluído (uma linha por item)</Label>
          <Textarea
            className="min-h-[120px]"
            value={form.notIncluded}
            onChange={(e) => set("notIncluded", e.target.value)}
          />
        </div>
      </section>

      {/* Extras */}
      <section className="space-y-3 rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Extras opcionais</h2>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              set("extras", [...form.extras, { name: "", price: "" }])
            }
          >
            <Plus className="mr-1 h-4 w-4" /> Adicionar extra
          </Button>
        </div>
        {form.extras.map((ex, i) => (
          <div key={i} className="flex gap-2">
            <Input
              placeholder="Nome do extra"
              value={ex.name}
              onChange={(e) => {
                const extras = [...form.extras];
                extras[i] = { ...extras[i], name: e.target.value };
                set("extras", extras);
              }}
            />
            <Input
              type="number"
              placeholder="€"
              className="w-28"
              value={ex.price}
              onChange={(e) => {
                const extras = [...form.extras];
                extras[i] = { ...extras[i], price: e.target.value };
                set("extras", extras);
              }}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() =>
                set(
                  "extras",
                  form.extras.filter((_, j) => j !== i)
                )
              }
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        {form.extras.length === 0 && (
          <p className="text-sm text-muted-foreground">Sem extras.</p>
        )}
      </section>

      {/* FAQs */}
      <section className="space-y-3 rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Perguntas frequentes</h2>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              set("faqs", [...form.faqs, { question: "", answer: "" }])
            }
          >
            <Plus className="mr-1 h-4 w-4" /> Adicionar FAQ
          </Button>
        </div>
        {form.faqs.map((f, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-3">
            <div className="flex gap-2">
              <Input
                placeholder="Pergunta"
                value={f.question}
                onChange={(e) => {
                  const faqs = [...form.faqs];
                  faqs[i] = { ...faqs[i], question: e.target.value };
                  set("faqs", faqs);
                }}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() =>
                  set(
                    "faqs",
                    form.faqs.filter((_, j) => j !== i)
                  )
                }
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <Textarea
              placeholder="Resposta"
              value={f.answer}
              onChange={(e) => {
                const faqs = [...form.faqs];
                faqs[i] = { ...faqs[i], answer: e.target.value };
                set("faqs", faqs);
              }}
            />
          </div>
        ))}
        {form.faqs.length === 0 && (
          <p className="text-sm text-muted-foreground">Sem perguntas.</p>
        )}
      </section>

      {/* SEO */}
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="font-semibold">SEO e mapeamento</h2>
        <div className="space-y-1.5">
          <Label>Título SEO</Label>
          <Input
            value={form.seoTitle}
            onChange={(e) => set("seoTitle", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Descrição SEO</Label>
          <Textarea
            value={form.seoDescription}
            onChange={(e) => set("seoDescription", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Profissão (professionalRole)</Label>
          <Input
            placeholder="Ex.: Canalizador"
            value={form.professionalRole}
            onChange={(e) => set("professionalRole", e.target.value)}
          />
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} size="lg">
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {serviceId ? "Guardar alterações" : "Criar serviço"}
        </Button>
      </div>
    </div>
  );
}
