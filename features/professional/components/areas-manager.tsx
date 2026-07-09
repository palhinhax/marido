"use client";

import { useState } from "react";
import { Save, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { DISTRICTS } from "@/lib/data/locations";
import { setProfessionalAreas } from "../actions";

// Selection encoded as `${district}::${municipality|*}` where * means whole district.
export function AreasManager({
  initialAreas,
}: {
  initialAreas: { district: string; municipality: string | null }[];
}) {
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialAreas.map((a) => `${a.district}::${a.municipality ?? "*"}`))
  );
  const [saving, setSaving] = useState(false);

  const key = (d: string, m: string | null) => `${d}::${m ?? "*"}`;
  const has = (k: string) => selected.has(k);

  const toggle = (k: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(k)) {
        next.delete(k);
      } else {
        next.add(k);
      }
      return next;
    });

  async function save() {
    setSaving(true);
    try {
      const areas = [...selected].map((k) => {
        const [district, muni] = k.split("::");
        return { district, municipality: muni === "*" ? null : muni };
      });
      await setProfessionalAreas(areas);
      toast({
        title: "Áreas atualizadas",
        description: `${areas.length} áreas selecionadas.`,
      });
    } catch {
      toast({ title: "Erro ao guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {DISTRICTS.map((d) => {
        const wholeKey = key(d.name, null);
        return (
          <div key={d.slug} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <MapPin className="h-4 w-4 text-primary" /> {d.name}
              </h2>
              <button
                type="button"
                onClick={() => toggle(wholeKey)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium",
                  has(wholeKey)
                    ? "border-primary bg-primary/5 text-primary"
                    : "hover:bg-muted"
                )}
              >
                Todo o distrito
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {d.municipalities.map((m) => {
                const k = key(d.name, m.name);
                const on = has(k) || has(wholeKey);
                return (
                  <button
                    key={m.slug}
                    type="button"
                    disabled={has(wholeKey)}
                    onClick={() => toggle(k)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-sm transition-colors disabled:opacity-50",
                      on
                        ? "border-primary bg-primary/5 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Guardar áreas
        </Button>
      </div>
    </div>
  );
}
