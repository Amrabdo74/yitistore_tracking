"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin-header";
import { AuthGuard } from "@/components/auth-guard";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ContactActions } from "@/components/contact-actions";
import { OrderTimeline } from "@/components/order-timeline";
import { StatusBadge } from "@/components/status-badge";
import { ErrorState, PageSpinner } from "@/components/states";
import { Button } from "@/components/ui/button";
import { formatAmount, formatOrderNumber } from "@/lib/format";
import { ApiError } from "@/lib/api";
import { deleteOrder, getOrder, getOrderHistory } from "@/lib/orders-api";

function OrderDetailsInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id;
  const [confirmDelete, setConfirmDelete] = useState(false);

  const orderQuery = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrder(id),
    refetchInterval: 8000,
  });

  const historyQuery = useQuery({
    queryKey: ["order-history", id],
    queryFn: () => getOrderHistory(id),
    refetchInterval: 8000,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteOrder(id),
    onSuccess: async () => {
      toast.success("تم حذف الطلب");
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      router.push("/orders");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "حدث خطأ، حاول مرة أخرى");
    },
  });

  const order = orderQuery.data?.data;

  return (
    <div className="min-h-screen bg-page">
      <AdminHeader />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ArrowRight className="h-4 w-4" />
          العودة للطلبات
        </Link>

        {orderQuery.isLoading ? <PageSpinner /> : null}
        {orderQuery.isError ? <ErrorState onRetry={() => orderQuery.refetch()} /> : null}

        {order ? (
          <div className="mt-4 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-muted">رقم الطلب</p>
                <h1 className="text-2xl font-bold text-navy">
                  {formatOrderNumber(order.orderNumber)}
                </h1>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="rounded-[10px] border border-line bg-surface p-5">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted">اسم العميل</dt>
                  <dd className="mt-1 text-sm font-medium">{order.customerName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">رقم الهاتف</dt>
                  <dd className="mt-1 text-sm font-medium" dir="ltr">
                    {order.phone}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted">العنوان</dt>
                  <dd className="mt-1 text-sm font-medium">{order.address}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted">وصف الطلب</dt>
                  <dd className="mt-1 text-sm">{order.description || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">المبلغ</dt>
                  <dd className="mt-1 text-sm font-medium">{formatAmount(order.amount)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">الملاحظات</dt>
                  <dd className="mt-1 text-sm">{order.notes || "—"}</dd>
                </div>
                {order.status === "FAILED" && order.failureReason ? (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-muted">سبب تعذر التسليم</dt>
                    <dd className="mt-1 text-sm text-danger">{order.failureReason}</dd>
                  </div>
                ) : null}
              </dl>
              <div className="mt-5">
                <ContactActions phone={order.phone} />
              </div>
              <div className="mt-4 flex gap-2">
                <Button asChild variant="outline">
                  <Link href={`/orders/${order.id}/edit`}>تعديل</Link>
                </Button>
                <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                  حذف
                </Button>
              </div>
            </div>

            <div className="rounded-[10px] border border-line bg-surface p-5">
              <h2 className="mb-4 text-sm font-medium text-navy">سجل الحالة</h2>
              {historyQuery.isLoading ? <PageSpinner /> : null}
              {historyQuery.data ? (
                <OrderTimeline items={historyQuery.data.data} />
              ) : null}
            </div>
          </div>
        ) : null}
      </main>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="حذف الطلب"
        description="هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        danger
        isSubmitting={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}

export default function OrderDetailsPage() {
  return (
    <AuthGuard adminOnly>
      <OrderDetailsInner />
    </AuthGuard>
  );
}
