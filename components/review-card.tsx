import { Stars } from "@/components/stars";
import { formatDate } from "@/lib/format";

export function ReviewCard({
  review,
}: {
  review: {
    rating: number;
    comment: string | null;
    createdAt: Date | string;
    authorName?: string | null;
    serviceName?: string | null;
  };
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <Stars value={review.rating} />
        <span className="text-xs text-muted-foreground">
          {formatDate(review.createdAt)}
        </span>
      </div>
      {review.comment && <p className="mt-2 text-sm">{review.comment}</p>}
      <p className="mt-2 text-xs text-muted-foreground">
        {review.authorName ?? "Cliente"}
        {review.serviceName ? ` · ${review.serviceName}` : ""}
      </p>
    </div>
  );
}
