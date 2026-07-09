"use client";

import { useState } from "react";
import { Share2, Copy, Check, ExternalLink, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { facebookShareUrl } from "@/lib/share";

const GROUP_URL = process.env.NEXT_PUBLIC_FACEBOOK_GROUP_URL || "";

// Facebook does NOT allow pre-filling post text or one-click posting into a
// group. So the honest flow is: copy the ready-made text, open the group, paste,
// publish. This dialog makes that fast and clear.
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

  async function copy() {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast({ title: "Texto copiado", description: "Cole no post do grupo." });
    } catch {
      toast({ title: "Não foi possível copiar", variant: "destructive" });
    }
  }

  function openGroup() {
    // Copy first so it's ready to paste in the group.
    navigator.clipboard?.writeText(caption).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    const url = GROUP_URL || "https://www.facebook.com/groups/feed/";
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={size} variant="outline">
          <Share2 className="mr-1 h-4 w-4" /> Partilhar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Partilhar no grupo do Facebook</DialogTitle>
          <DialogDescription>
            O Facebook não deixa publicar automaticamente em grupos. Em 3
            passos: copie o texto, abra o grupo e cole.
          </DialogDescription>
        </DialogHeader>

        <ol className="space-y-1 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">1.</strong> Copie o texto abaixo
            (já inclui o link do pedido).
          </li>
          <li>
            <strong className="text-foreground">2.</strong> Abra o grupo do
            Facebook.
          </li>
          <li>
            <strong className="text-foreground">3.</strong> Cole e publique — o
            link mostra automaticamente o preview do pedido.
          </li>
        </ol>

        <Textarea
          readOnly
          value={caption}
          className="min-h-[130px] text-sm"
          onFocus={(e) => e.currentTarget.select()}
        />

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={copy} variant="outline" className="flex-1">
            {copied ? (
              <Check className="mr-2 h-4 w-4 text-success" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? "Copiado" : "Copiar texto"}
          </Button>
          <Button onClick={openGroup} className="flex-1">
            <Facebook className="mr-2 h-4 w-4" />
            {GROUP_URL ? "Abrir grupo e colar" : "Abrir Facebook"}
          </Button>
        </div>

        {!GROUP_URL && (
          <p className="text-xs text-muted-foreground">
            Dica: defina <code>NEXT_PUBLIC_FACEBOOK_GROUP_URL</code> no ambiente
            com o link do seu grupo para este botão abrir logo o grupo certo.
          </p>
        )}

        <a
          href={facebookShareUrl(reference)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-3 w-3" /> Em alternativa, abrir a caixa de
          partilha do Facebook (perfil/página)
        </a>
      </DialogContent>
    </Dialog>
  );
}
