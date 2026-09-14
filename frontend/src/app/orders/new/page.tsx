"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { AdminHeader } from "@/components/admin-header";
import { AuthGuard } from "@/components/auth-guard";
import { OrderForm } from "@/components/order-form";
import { ApiError } from "@/lib/api";
import { createOrder } from "@/lib/orders-api";
import type { OrderFormValues } from "@/lib/types";

function NewOrderInner() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: async () => {
      toast.success("تم إنشاء الطلب بنجاح");
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      router.push("/orders");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "حدث خطأ، حاول مرة أخرى");
    },
  });

  async function handleSubmit(values: OrderFormValues) {
    await mutation.mutateAsync(values);
  }

  return (
    <div className="min-h-screen bg-page">
      <AdminHeader />
      <main className="mx-auto max-w-xl px-4 py-6">
        <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ArrowRight className="h-4 w-4" />
          العودة للطلبات
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-navy">إضافة طلب جديد</h1>
        <div className="mt-5 rounded-[10px] border border-line bg-surface p-5">
          <OrderForm
            submitLabel="إنشاء الطلب"
            isSubmitting={mutation.isPending}
            onSubmit={handleSubmit}
          />
        </div>
      </main>
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <AuthGuard adminOnly>
      <NewOrderInner />
    </AuthGuard>
  );
}
