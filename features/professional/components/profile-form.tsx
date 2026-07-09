"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ImageUploader } from "@/components/image-uploader";
import { updateProfessionalProfile, updateProfessionalPhoto } from "../actions";

interface ProfileData {
  displayName: string;
  headline: string;
  description: string;
  photoUrl: string;
  phone: string;
  whatsapp: string;
  website: string;
  nif: string;
  companyName: string;
  yearsExperience: number | "";
}

export function ProfileForm({
  initial,
  onSaved,
}: {
  initial: ProfileData;
  onSaved?: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<ProfileData>(initial);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ProfileData>(k: K, v: ProfileData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    try {
      await updateProfessionalProfile({
        ...form,
        yearsExperience:
          form.yearsExperience === ""
            ? undefined
            : Number(form.yearsExperience),
      });
      toast({ title: "Perfil guardado" });
      onSaved?.();
    } catch {
      toast({ title: "Erro ao guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Foto de perfil</Label>
        <ImageUploader
          folder="profiles"
          variant="avatar"
          value={form.photoUrl ? [form.photoUrl] : []}
          onChange={async (urls) => {
            const url = urls[0] ?? "";
            set("photoUrl", url);
            // Save the photo immediately — no need to press "Guardar perfil".
            try {
              await updateProfessionalPhoto(url || null);
              toast({ title: url ? "Foto guardada" : "Foto removida" });
            } catch {
              toast({ title: "Erro ao guardar foto", variant: "destructive" });
            }
          }}
        />
      </div>
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
          placeholder="Conte a sua experiência, especialidades e o que o distingue."
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
          Guardar perfil
        </Button>
      </div>
    </div>
  );
}
