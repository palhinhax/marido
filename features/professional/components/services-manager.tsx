"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { setProfessionalServices } from "../actions";

interface CategoryGroup {
  category: string;
  items: { id: string; name: string }[];
}

export function ServicesManager({
  groups,
  initialSelected,
}: {
  groups: CategoryGroup[];
  initialSelected: string[];
}) {
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialSelected)
  );
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const toggleCategory = (items: { id: string }[]) =>
    setSelected((s) => {
      const next = new Set(s);
      const allOn = items.every((i) => next.has(i.id));
      items.forEach((i) => {
        if (allOn) {
          next.delete(i.id);
        } else {
          next.add(i.id);
        }
      });
      return next;
    });

  async function save() {
    setSaving(true);
    try {
      await setProfessionalServices([...selected]);
      toast({
        title: "Serviços atualizados",
        description: `${selected.size} serviços selecionados.`,
      });
    } catch {
      toast({ title: "Erro ao guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {groups.map((g) => {
        const allOn = g.items.every((i) => selected.has(i.id));
        return (
          <div key={g.category} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{g.category}</h2>
              <button
                type="button"
                onClick={() => toggleCategory(g.items)}
                className="text-xs font-medium text-primary hover:underline"
              >
                {allOn ? "Desmarcar todos" : "Selecionar todos"}
              </button>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {g.items.map((i) => {
                const on = selected.has(i.id);
                return (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => toggle(i.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                      on ? "border-primary bg-primary/5" : "hover:bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border",
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input"
                      )}
                    >
                      {on && "✓"}
                    </span>
                    {i.name}
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
          Guardar serviços
        </Button>
      </div>
    </div>
  );
}
