import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Stars } from "@/components/stars";
import { Badge } from "@/components/ui/badge";
import { ReviewActions } from "@/features/admin/components/review-actions";
import { EmptyState } from "@/components/dashboard/stat-card";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: {
      client: { select: { name: true } },
      professional: { select: { displayName: true, slug: true } },
      booking: { select: { service: { select: { name: true } } } },
    },
    orderBy: [{ isApproved: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Avaliações</h1>
        <p className="text-muted-foreground">
          Modere as avaliações da plataforma.
        </p>
      </div>

      {reviews.length === 0 ? (
        <EmptyState title="Sem avaliações" />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Stars value={r.rating} size={14} />
                    {!r.isApproved && <Badge variant="warm">Escondida</Badge>}
                  </div>
                  {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {r.client.name ?? "Cliente"} · sobre{" "}
                    <Link
                      href={`/profissionais/${r.professional.slug}`}
                      className="text-primary hover:underline"
                    >
                      {r.professional.displayName}
                    </Link>{" "}
                    · {r.booking.service.name} · {formatDate(r.createdAt)}
                  </p>
                </div>
                <ReviewActions reviewId={r.id} isApproved={r.isApproved} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
