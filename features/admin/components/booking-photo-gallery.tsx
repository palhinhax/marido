"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface Photo {
  id: string;
  url: string;
}

export function BookingPhotoGallery({ photos }: { photos: Photo[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedPhoto =
    selectedIndex === null ? null : (photos[selectedIndex] ?? null);

  if (photos.length === 0) return null;

  const showPrev = photos.length > 1;
  const showNext = photos.length > 1;

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className="group relative h-20 w-20 overflow-hidden rounded-md border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Abrir foto ${index + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt=""
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      <Dialog
        open={selectedIndex !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedIndex(null);
        }}
      >
        <DialogContent className="max-w-5xl border-0 bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">Foto do pedido</DialogTitle>
          <DialogDescription className="sr-only">
            Pré-visualização ampliada da foto enviada pelo cliente.
          </DialogDescription>
          {selectedPhoto && (
            <div className="relative overflow-hidden rounded-lg bg-background p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhoto.url}
                alt=""
                className="max-h-[82vh] w-full object-contain"
              />
              {showPrev && (
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  onClick={() =>
                    setSelectedIndex((current) =>
                      current === null
                        ? 0
                        : (current - 1 + photos.length) % photos.length
                    )
                  }
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              {showNext && (
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  onClick={() =>
                    setSelectedIndex((current) =>
                      current === null ? 0 : (current + 1) % photos.length
                    )
                  }
                  aria-label="Foto seguinte"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
