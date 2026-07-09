"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { facebookShareUrl } from "@/lib/share";

// Opens the Facebook share dialog for the request's public page (works with
// groups — the admin picks the group and posts). Also copies the anonymized
// caption, since the sharer ignores custom text.
export function FacebookShareButton({
  reference,
  caption,
  size = "sm",
}: {
  reference: string;
  caption: string;
  size?: "sm" | "default";
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  function share() {
    // Copy the caption first so it's ready to paste into the group post.
    navigator.clipboard?.writeText(caption).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      },
      () => {}
    );
    window.open(
      facebookShareUrl(reference),
      "fb-share",
      "width=680,height=640,noopener,noreferrer"
    );
    toast({
      title: "Texto copiado",
      description: "Cole o texto no post do grupo e publique.",
    });
  }

  async function copyOnly() {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast({ title: "Texto copiado" });
    } catch {
      toast({ title: "Não foi possível copiar", variant: "destructive" });
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button size={size} variant="outline" onClick={share}>
        <Share2 className="mr-1 h-4 w-4" /> Partilhar
      </Button>
      <Button
        size={size === "sm" ? "icon" : "icon"}
        variant="ghost"
        onClick={copyOnly}
        aria-label="Copiar texto"
      >
        {copied ? (
          <Check className="h-4 w-4 text-success" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
