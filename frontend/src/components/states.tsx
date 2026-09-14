import { Inbox, SearchX, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function EmptyOrders() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <Inbox className="mb-3 h-8 w-8 text-[#9aa8b8]" />
      <p className="text-sm font-medium text-ink">لا توجد طلبات حالياً</p>
    </div>
  );
}

export function EmptySearch() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <SearchX className="mb-3 h-8 w-8 text-[#9aa8b8]" />
      <p className="text-sm font-medium text-ink">لا توجد نتائج مطابقة</p>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <AlertCircle className="mb-3 h-8 w-8 text-danger" />
      <p className="text-sm font-medium text-ink">حدث خطأ، حاول مرة أخرى</p>
      {onRetry ? (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          إعادة المحاولة
        </Button>
      ) : null}
    </div>
  );
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-pulse rounded-full bg-[#dbe3ed]" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function CardsSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-[10px]" />
      ))}
    </div>
  );
}
