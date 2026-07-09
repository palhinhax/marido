"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { CATALOG } from "@/lib/data/catalog";
import { ALL_MUNICIPALITIES } from "@/lib/data/locations";

export function HeroSearch() {
  const router = useRouter();
  const [service, setService] = useState("");
  const [loc, setLoc] = useState("");

  function go() {
    if (service) {
      const q = loc ? `?loc=${loc}` : "";
      router.push(`/marcar/${service}${q}`);
    } else {
      router.push("/servicos");
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-3 shadow-lg sm:p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Select
            aria-label="Que serviço precisa?"
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="pl-9"
          >
            <option value="">Que serviço precisa?</option>
            {CATALOG.map((c) => (
              <optgroup key={c.slug} label={c.name}>
                {c.services.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
        </div>

        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Select
            aria-label="Onde?"
            value={loc}
            onChange={(e) => setLoc(e.target.value)}
            className="pl-9"
          >
            <option value="">Onde?</option>
            {ALL_MUNICIPALITIES.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.name} ({l.district.name})
              </option>
            ))}
          </Select>
        </div>

        <Button size="lg" onClick={go} className="sm:px-8">
          Marcar serviço
        </Button>
      </div>
    </div>
  );
}
