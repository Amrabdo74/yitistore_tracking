"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth-guard";
import { ContactActions } from "@/components/contact-actions";
import { FailDeliverySheet } from "@/components/fail-delivery-sheet";
import { StatusBadge } from "@/components/status-badge";
import { ErrorState, PageSpinner } from "@/components/states";
import { Button } from "@/components/ui/button";
import { useOrderId } from "@/hooks/use-order-id";
import { NEXT_STATUS } from "@/lib/constants";
import { formatAmount, formatOrderNumber } from "@/lib/format";
import { ApiError } from "@/lib/api";
import { getOrder, updateOrderStatus } from "@/lib/orders-api";
import type { OrderStatus } from "@/lib/types";

const PRIMARY_LABEL: Partial<Record<OrderStatus, string>> = {
  NEW: "استلمت الطلب",
  RECEIVED: "وصلت للعميل",
};

function DriverOrderInner() {
  const id = useOrderId();
  const queryClient = useQueryClient();
  const [failOpen, setFailOpen] = useState(false);

  const query = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrder(id),
    enabled: Boolean(id),
  });

  const mutation = useMutation({
    mutationFn: ({ status, reason }: { status: OrderStatus; reason?: string }) =>
      updateOrderStatus(id, status, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["order", id] });
      await queryClient.invalidateQueries({ queryKey: ["driver-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await queryClient.invalidateQueries({ queryKey: ["order-history", id] });
      setFailOpen(false);
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "حدث خطأ، حاول مرة أخرى");
    },
  });

  const order = query.data?.data;
  const nextStatus = order ? NEXT_STATUS[order.status] : undefined;

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-page">
      <header className="sticky top-0 z-20 border-b border-line bg-surface px-4 py-3">
        <Link
          href="/driver/orders"
          className="inline-flex min-h-11 items-center gap-1 text-sm text-muted"
        >
          <ArrowRight className="h-4 w-4" />
          رجوع
        </Link>
      </header>

      {query.isLoading ? <PageSpinner /> : null}
      {query.isError ? <ErrorState onRetry={() => query.refetch()} /> : null}

      {order ? (
        <>
          <div className="px-4 pt-4 pb-32">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted">رقم الطلب</p>
                <h1 className="text-2xl font-bold text-navy">
                  {formatOrderNumber(order.orderNumber)}
                </h1>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="mt-4 space-y-3 rounded-[10px] border border-line bg-surface p-4">
              <Field label="اسم العميل" value={order.customerName} />
              <Field label="رقم الهاتف" value={order.phone} ltr />
              <Field label="العنوان" value={order.address} />
              <Field label="وصف الطلب" value={order.description || "—"} />
              <Field label="المبلغ" value={formatAmount(order.amount)} />
              <Field label="ملاحظات" value={order.notes || "—"} />
              {order.status === "FAILED" && order.failureReason ? (
                <Field label="سبب تعذر التسليم" value={order.failureReason} />
              ) : null}
            </div>

            <div className="mt-4">
              <ContactActions phone={order.phone} large />
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-0 mx-auto max-w-lg border-t border-line bg-surface px-4 pt-3 pb-4">
            {nextStatus ? (
              <Button
                size="xl"
                className="w-full"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate({ status: nextStatus })}
              >
                {PRIMARY_LABEL[order.status]}
              </Button>
            ) : null}

            {order.status === "ARRIVED" ? (
              <div className="space-y-2">
                <Button
                  variant="success"
                  size="xl"
                  className="w-full"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate({ status: "DELIVERED" })}
                >
                  تم التسليم
                </Button>
                <Button
                  variant="outline"
                  size="xl"
                  className="w-full border-danger text-danger hover:bg-danger-bg"
                  disabled={mutation.isPending}
                  onClick={() => setFailOpen(true)}
                >
                  تعذر التسليم
                </Button>
              </div>
            ) : null}

            {order.status === "DELIVERED" ? (
              <div className="flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-success-bg text-success">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">تم تسليم الطلب</span>
              </div>
            ) : null}

            {order.status === "FAILED" ? (
              <div className="flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-danger-bg text-danger">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">تعذر تسليم الطلب</span>
              </div>
            ) : null}
          </div>

          <FailDeliverySheet
            open={failOpen}
            onOpenChange={setFailOpen}
            isSubmitting={mutation.isPending}
            onConfirm={(reason) => mutation.mutate({ status: "FAILED", reason })}
          />
        </>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  ltr,
}: {
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink" dir={ltr ? "ltr" : undefined}>
        {value}
      </p>
    </div>
  );
}

export default function DriverOrderDetailsPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<PageSpinner />}>
        <DriverOrderInner />
      </Suspense>
    </AuthGuard>
  );
}
