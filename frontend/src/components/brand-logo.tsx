import { cn } from "@/lib/utils";

export function BrandLogo({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <img
      src="/logo.webp"
      alt="Yiti Store"
      width={size}
      height={size}
      className={cn("rounded-[8px] bg-black object-cover", className)}
    />
  );
}
