import Image from "next/image";
import { cn } from "@/lib/utils";

export function LogoMark({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt=""
      width={500}
      height={500}
      priority={priority}
      className={cn("h-8 w-8 object-contain", className)}
    />
  );
}
