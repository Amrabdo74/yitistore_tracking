import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#e8edf3]", className)}
      {...props}
    />
  );
}

export { Skeleton };
