"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { adminUpdateProfessional } from "../actions";

interface ProfileData {
  displayName: string;
  headline: string;
  description: string;
  phone: string;
  whatsapp: string;
  website: string;
  nif: string;
  companyName: string;
  yearsExperience: number | "";
}

export function ProfessionalEditForm({
  professionalId,
  initial,
}: {
  professionalId: string;
  initial: ProfileData;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<ProfileData>(initial);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ProfileData>(k: K, v: ProfileData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    try {
      await adminUpdateProfessional(professionalId, {
        ...form,
        yearsExperience:
          form.yearsExperience === ""
            ? undefined
            : Number(form.yearsExperience),
      });
      toast({ title: "Profissional atualizado" });
      router.refresh();
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
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Nome público</Label>
        <Input
          value={form.displayName}
          onChange={(e) => set("displayName", e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Título / headline</Label>
        <Input
          placeholder="Ex.: Canalizador certificado, resposta rápida"
          value={form.headline}
          onChange={(e) => set("headline", e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Descrição</Label>
        <Textarea
          className="min-h-[120px]"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Telefone público</Label>
          <Input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>WhatsApp</Label>
          <Input
            value={form.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Anos de experiência</Label>
          <Input
            type="number"
            value={form.yearsExperience}
            onChange={(e) =>
              set(
                "yearsExperience",
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label>Website</Label>
          <Input
            placeholder="https://"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>NIF (opcional)</Label>
          <Input
            value={form.nif}
            onChange={(e) => set("nif", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Nome de empresa (opcional)</Label>
          <Input
            value={form.companyName}
            onChange={(e) => set("companyName", e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Guardar alterações
        </Button>
      </div>
    </div>
  );
}
