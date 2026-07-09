import { prisma } from "@/lib/prisma";
import { getCurrentProfessional } from "@/features/professional/queries";
import { ReviewCard } from "@/components/review-card";
import { Stars } from "@/components/stars";
import { EmptyState } from "@/components/dashboard/stat-card";

export const dynamic = "force-dynamic";

export default async function ProfessionalReviewsPage() {
  const pro = await getCurrentProfessional();
  const reviews = await prisma.review.findMany({
    where: { professionalId: pro.id, isApproved: true },
    include: {
      client: { select: { name: true } },
      booking: { select: { service: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Avaliações</h1>
        <div className="mt-2 flex items-center gap-3">
          <Stars value={pro.ratingAverage} size={20} />
          <span className="text-sm text-muted-foreground">
            {pro.ratingAverage.toFixed(1)} · {pro.ratingCount} avaliações
          </span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          title="Ainda sem avaliações"
          description="As avaliações dos clientes aparecem aqui após concluir serviços."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {reviews.map((r) => (
            <ReviewCard
              key={r.id}
              review={{
                rating: r.rating,
                comment: r.comment,
                createdAt: r.createdAt,
                authorName: r.client.name,
                serviceName: r.booking.service.name,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
