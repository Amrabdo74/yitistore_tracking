import { cn } from "@/lib/utils";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/constants";
import type { OrderStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-md px-2 text-xs font-medium",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
