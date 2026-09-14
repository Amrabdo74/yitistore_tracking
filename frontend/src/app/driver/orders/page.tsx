"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth-guard";
import { StatusBadge } from "@/components/status-badge";
import { CardsSkeleton, EmptyOrders, EmptySearch, ErrorState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { STATUS_FILTER_LABELS } from "@/lib/constants";
import { formatAmount, formatOrderNumber } from "@/lib/format";
import { logoutRequest, listOrders } from "@/lib/orders-api";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS: Array<OrderStatus | "ALL"> = [
  "ALL",
  "NEW",
  "RECEIVED",
  "ARRIVED",
  "DELIVERED",
  "FAILED",
];

function DriverOrdersInner() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<OrderStatus | "ALL">("ALL");

  const query = useQuery({
    queryKey: ["driver-orders", tab],
    queryFn: () =>
      listOrders({
        page: 1,
        pageSize: 50,
        status: tab === "ALL" ? undefined : tab,
      }),
    refetchInterval: 5000,
  });

  const logout = useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      queryClient.clear();
      router.replace("/login");
    },
    onError: () => toast.error("حدث خطأ، حاول مرة أخرى"),
  });

  const orders = query.data?.data ?? [];

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-page pb-8">
      <header className="sticky top-0 z-20 border-b border-line bg-surface px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-navy">طلباتي اليوم</h1>
          <Button
            variant="ghost"
            size="sm"
            className="h-11 px-3"
            onClick={() => logout.mutate()}
          >
            <LogOut className="h-4 w-4" />
            خروج
          </Button>
        </div>
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={cn(
                "h-11 shrink-0 rounded-[8px] px-3 text-sm",
                tab === item
                  ? "bg-navy text-white"
                  : "border border-line bg-surface text-muted",
              )}
            >
              {STATUS_FILTER_LABELS[item]}
            </button>
          ))}
        </div>
      </header>

      {query.isLoading ? <CardsSkeleton /> : null}
      {query.isError ? <ErrorState onRetry={() => query.refetch()} /> : null}

      {!query.isLoading && !query.isError && orders.length === 0 ? (
        tab === "ALL" ? <EmptyOrders /> : <EmptySearch />
      ) : null}

      <div className="space-y-3 px-4 pt-4">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-[10px] border border-line bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-base font-bold text-navy">
                {formatOrderNumber(order.orderNumber)}
              </p>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-2 text-sm font-medium text-ink">{order.customerName}</p>
            <p className="mt-1 text-sm text-muted">{order.address}</p>
            <p className="mt-2 text-sm font-medium">{formatAmount(order.amount)}</p>
            <Button asChild variant="outline" size="xl" className="mt-4 w-full">
              <Link href={`/driver/orders/${order.id}`}>عرض التفاصيل</Link>
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function DriverOrdersPage() {
  return (
    <AuthGuard>
      <DriverOrdersInner />
    </AuthGuard>
  );
}
