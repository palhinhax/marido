"use client";

import { useCallback, useRef, useState } from "react";
import { Copy, Trash2, Save, CalendarX2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { WEEKDAYS } from "@/lib/format";
import { toHHMM, type GridSelection } from "@/lib/availability";
import {
  saveAvailability,
  addAvailabilityException,
  removeAvailabilityException,
} from "../actions";

const DAYS = [1, 2, 3, 4, 5, 6, 7];

interface Exception {
  id: string;
  date: string; // ISO date
  type: "AVAILABLE" | "UNAVAILABLE";
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
}

export function WeeklyAvailabilityGrid({
  initialSelection,
  hours,
  exceptions: initialExceptions,
}: {
  initialSelection: GridSelection;
  hours: number[];
  exceptions: Exception[];
}) {
  const { toast } = useToast();
  const [selection, setSelection] = useState<GridSelection>(initialSelection);
  const [saving, setSaving] = useState(false);
  const [exceptions, setExceptions] = useState<Exception[]>(initialExceptions);
  const [blockDate, setBlockDate] = useState("");
  const [blocking, setBlocking] = useState(false);

  // drag-paint state
  const painting = useRef(false);
  const paintValue = useRef(false);

  const key = (day: number, hour: number) => `${day}-${hour}`;

  const apply = useCallback((day: number, hour: number, value: boolean) => {
    setSelection((s) => ({ ...s, [key(day, hour)]: value }));
  }, []);

  const startPaint = (day: number, hour: number) => {
    painting.current = true;
    paintValue.current = !selection[key(day, hour)];
    apply(day, hour, paintValue.current);
  };
  const enterPaint = (day: number, hour: number) => {
    if (painting.current) apply(day, hour, paintValue.current);
  };
  const endPaint = () => {
    painting.current = false;
  };

  function copyMondayToAll() {
    setSelection((s) => {
      const next = { ...s };
      for (const h of hours) {
        const on = !!s[key(1, h)];
        for (let d = 2; d <= 7; d++) next[key(d, h)] = on;
      }
      return next;
    });
  }

  function clearAll() {
    setSelection({});
  }

  async function onSave() {
    setSaving(true);
    try {
      await saveAvailability(selection, hours);
      toast({
        title: "Disponibilidade guardada",
        description: "As suas horas foram atualizadas.",
      });
    } catch {
      toast({ title: "Erro ao guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function onBlockDay() {
    if (!blockDate) return;
    setBlocking(true);
    try {
      await addAvailabilityException({
        dateISO: blockDate,
        type: "UNAVAILABLE",
      });
      setExceptions((e) => [
        ...e,
        {
          id: `tmp-${blockDate}`,
          date: blockDate,
          type: "UNAVAILABLE",
          startTime: null,
          endTime: null,
          reason: null,
        },
      ]);
      setBlockDate("");
      toast({
        title: "Dia bloqueado",
        description: "Não receberá pedidos nesse dia.",
      });
    } catch {
      toast({ title: "Erro ao bloquear dia", variant: "destructive" });
    } finally {
      setBlocking(false);
    }
  }

  async function onRemoveException(id: string) {
    setExceptions((e) => e.filter((x) => x.id !== id));
    if (!id.startsWith("tmp-")) await removeAvailabilityException(id);
  }

  return (
    <div className="space-y-6" onMouseUp={endPaint} onMouseLeave={endPaint}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={copyMondayToAll}>
          <Copy className="mr-2 h-4 w-4" /> Copiar para todos os dias
        </Button>
        <Button variant="outline" size="sm" onClick={clearAll}>
          <Trash2 className="mr-2 h-4 w-4" /> Limpar
        </Button>
        <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-primary" /> Disponível
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border bg-background" />{" "}
            Indisponível
          </span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Clique nas horas em que está disponível. Pode arrastar para selecionar
        várias.
      </p>

      {/* Grid */}
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[640px] border-collapse select-none">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-16 bg-card p-2 text-xs font-medium text-muted-foreground" />
              {DAYS.map((d) => (
                <th key={d} className="p-2 text-xs font-semibold">
                  {WEEKDAYS[d - 1]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((h) => (
              <tr key={h}>
                <td className="sticky left-0 z-10 whitespace-nowrap bg-card px-2 py-1 text-right text-xs text-muted-foreground">
                  {toHHMM(h * 60)}
                </td>
                {DAYS.map((d) => {
                  const on = !!selection[key(d, h)];
                  return (
                    <td key={d} className="p-0.5">
                      <button
                        type="button"
                        aria-pressed={on}
                        aria-label={`${WEEKDAYS[d - 1]} ${toHHMM(h * 60)} ${on ? "disponível" : "indisponível"}`}
                        onMouseDown={() => startPaint(d, h)}
                        onMouseEnter={() => enterPaint(d, h)}
                        onClick={() => {
                          // touch fallback (no drag)
                          if (!painting.current) apply(d, h, !on);
                        }}
                        className={cn(
                          "h-8 w-full rounded transition-colors",
                          on
                            ? "bg-primary hover:bg-primary/90"
                            : "bg-muted hover:bg-accent"
                        )}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Guardar disponibilidade
        </Button>
      </div>

      {/* Exceptions */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="flex items-center gap-2 font-semibold">
          <CalendarX2 className="h-4 w-4 text-primary" /> Bloquear dias (férias,
          folgas)
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Bloqueie datas específicas em que não está disponível, mesmo que a
          disponibilidade semanal esteja ativa.
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <Input
            type="date"
            value={blockDate}
            onChange={(e) => setBlockDate(e.target.value)}
            className="w-auto"
          />
          <Button
            variant="outline"
            onClick={onBlockDay}
            disabled={!blockDate || blocking}
          >
            {blocking ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Bloquear dia
          </Button>
        </div>

        {exceptions.length > 0 && (
          <ul className="mt-4 space-y-2">
            {exceptions
              .filter((e) => e.type === "UNAVAILABLE")
              .map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <span>
                    {new Intl.DateTimeFormat("pt-PT", {
                      dateStyle: "full",
                    }).format(new Date(e.date))}
                    {e.startTime
                      ? ` · ${e.startTime}–${e.endTime}`
                      : " · dia inteiro"}
                  </span>
                  <button
                    onClick={() => onRemoveException(e.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remover"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
