import Link from "next/link";
import * as Icons from "lucide-react";

type IconName = keyof typeof Icons;

export function CategoryCard({
  category,
}: {
  category: {
    name: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
    serviceCount?: number;
  };
}) {
  const Icon =
    (category.icon && (Icons[category.icon as IconName] as Icons.LucideIcon)) ||
    Icons.Wrench;
  return (
    <Link
      href={`/servicos/${category.slug}`}
      className="group flex items-start gap-4 rounded-xl border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-semibold group-hover:text-primary">
          {category.name}
        </h3>
        {category.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {category.description}
          </p>
        )}
        {category.serviceCount !== undefined && (
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            {category.serviceCount} serviços
          </p>
        )}
      </div>
    </Link>
  );
}
