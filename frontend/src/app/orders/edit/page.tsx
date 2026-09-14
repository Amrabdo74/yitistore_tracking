"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin-header";
import { AuthGuard } from "@/components/auth-guard";
import { OrderForm } from "@/components/order-form";
import { ErrorState, PageSpinner } from "@/components/states";
import { useOrderId } from "@/hooks/use-order-id";
import { ApiError } from "@/lib/api";
import { getOrder, updateOrder } from "@/lib/orders-api";
import type { OrderFormValues } from "@/lib/types";

function EditOrderInner() {
  const id = useOrderId();
  const router = useRouter();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrder(id),
    enabled: Boolean(id),
  });

  const mutation = useMutation({
    mutationFn: (values: OrderFormValues) => updateOrder(id, values),
    onSuccess: async () => {
      toast.success("تم حفظ التعديلات");
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await queryClient.invalidateQueries({ queryKey: ["order", id] });
      router.push(`/orders/view?id=${id}`);
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "حدث خطأ، حاول مرة أخرى");
    },
  });

  const order = query.data?.data;

  return (
    <div className="min-h-screen bg-page">
      <AdminHeader />
      <main className="mx-auto max-w-xl px-4 py-6">
        <Link
          href={`/orders/view?id=${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للتفاصيل
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-navy">تعديل الطلب</h1>

        {query.isLoading ? <PageSpinner /> : null}
        {query.isError ? <ErrorState onRetry={() => query.refetch()} /> : null}

        {order ? (
          <div className="mt-5 rounded-[10px] border border-line bg-surface p-5">
            <OrderForm
              defaultValues={{
                customerName: order.customerName,
                phone: order.phone,
                address: order.address,
                description: order.description,
                amount: order.amount,
                notes: order.notes ?? "",
              }}
              submitLabel="حفظ التعديلات"
              isSubmitting={mutation.isPending}
              onSubmit={async (values) => {
                await mutation.mutateAsync(values);
              }}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default function EditOrderPage() {
  return (
    <AuthGuard adminOnly>
      <Suspense fallback={<PageSpinner />}>
        <EditOrderInner />
      </Suspense>
    </AuthGuard>
  );
}
