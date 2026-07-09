"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, ImagePlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

type Folder = "profiles" | "bookings" | "verification";

interface Props {
  folder: Folder;
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  max?: number;
  /** "avatar" = single round preview; "grid" = thumbnail grid (default) */
  variant?: "avatar" | "grid";
}

async function uploadFile(file: File, folder: Folder): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Falha no upload");
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

export function ImageUploader({
  folder,
  value,
  onChange,
  multiple = false,
  max = 6,
  variant = "grid",
}: Props) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).slice(0, max - value.length || 1);
    setBusy(true);
    try {
      const uploaded: string[] = [];
      for (const f of files) {
        uploaded.push(await uploadFile(f, folder));
      }
      onChange(
        multiple ? [...value, ...uploaded].slice(0, max) : uploaded.slice(0, 1)
      );
    } catch (e) {
      toast({
        title: "Erro no upload",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  const canAddMore = multiple ? value.length < max : value.length === 0;

  // --- Avatar (single) --------------------------------------------------------
  if (variant === "avatar") {
    const current = value[0];
    return (
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border bg-muted">
          {current ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current}
              alt="Foto de perfil"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImagePlus className="h-6 w-6" />
            </div>
          )}
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />{" "}
            {current ? "Alterar foto" : "Carregar foto"}
          </button>
          {current && (
            <button
              type="button"
              onClick={() => remove(current)}
              className="text-left text-xs text-muted-foreground hover:text-destructive"
            >
              Remover
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    );
  }

  // --- Grid (multiple) --------------------------------------------------------
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((url) => (
          <div
            key={url}
            className="relative h-20 w-20 overflow-hidden rounded-md border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(url)}
              className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
              aria-label="Remover"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className={cn(
              "flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-md border border-dashed text-xs text-muted-foreground hover:bg-muted/50 disabled:opacity-50"
            )}
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
            {busy ? "A enviar" : "Adicionar"}
          </button>
        )}
      </div>
      {multiple && (
        <p className="mt-2 text-xs text-muted-foreground">
          Até {max} fotos · JPG, PNG ou WEBP · máx. 8 MB cada
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
