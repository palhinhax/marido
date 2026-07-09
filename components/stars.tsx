import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${value} de 5 estrelas`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={cn(
            i < Math.round(value)
              ? "fill-warm text-warm"
              : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );
}
