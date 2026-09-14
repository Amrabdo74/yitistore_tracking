import { TIMELINE_LABELS } from "@/lib/constants";
import { formatTime } from "@/lib/format";
import type { OrderHistoryItem } from "@/lib/types";

export function OrderTimeline({ items }: { items: OrderHistoryItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">لا يوجد سجل حالات بعد.</p>;
  }

  return (
    <ol className="space-y-0">
      {items.map((item, index) => (
        <li key={item.id} className="flex gap-3">
          <div className="flex w-5 flex-col items-center">
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-navy" />
            {index < items.length - 1 ? (
              <span className="w-px flex-1 bg-line" />
            ) : null}
          </div>
          <div className="pb-5">
            <p className="text-xs text-muted">{formatTime(item.createdAt)}</p>
            <p className="text-sm text-ink">{TIMELINE_LABELS[item.status]}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
