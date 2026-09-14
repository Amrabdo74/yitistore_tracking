"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin-header";
import { AuthGuard } from "@/components/auth-guard";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { StatusBadge } from "@/components/status-badge";
import {
  EmptyOrders,
  EmptySearch,
  ErrorState,
  TableSkeleton,
} from "@/components/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { STATUS_LABELS } from "@/lib/constants";
import { formatAmount, formatDateTime, formatOrderNumber } from "@/lib/format";
import { ApiError } from "@/lib/api";
import { deleteOrder, listOrders } from "@/lib/orders-api";
import type { OrderStatus } from "@/lib/types";

const STATUSES: Array<OrderStatus | ""> = [
  "",
  "NEW",
  "RECEIVED",
  "ARRIVED",
  "DELIVERED",
  "FAILED",
];

function OrdersPageInner() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const query = useQuery({
    queryKey: ["orders", { page, status, date, search: debouncedSearch }],
    queryFn: () =>
      listOrders({
        page,
        pageSize: 10,
        status: status || undefined,
        date: date || undefined,
        search: debouncedSearch || undefined,
      }),
    refetchInterval: 8000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: async () => {
      toast.success("تم حذف الطلب");
      setDeleteId(null);
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "حدث خطأ، حاول مرة أخرى");
    },
  });

  const stats = query.data?.stats;
  const rows = query.data?.data ?? [];
  const meta = query.data?.meta;
  const hasFilters = Boolean(debouncedSearch || status || date);

  const summary = useMemo(
    () => [
      { label: "إجمالي الطلبات", value: stats?.total ?? 0, color: "bg-navy" },
      { label: "طلبات جديدة", value: stats?.new ?? 0, color: "bg-status-new" },
      { label: "قيد التنفيذ", value: stats?.inProgress ?? 0, color: "bg-warning" },
      { label: "تم التسليم", value: stats?.delivered ?? 0, color: "bg-success" },
      { label: "تعذر التسليم", value: stats?.failed ?? 0, color: "bg-danger" },
    ],
    [stats],
  );

  return (
    <div className="min-h-screen bg-page">
      <AdminHeader />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy">الطلبات</h1>
            <p className="mt-1 text-sm text-muted">إدارة ومتابعة جميع طلبات التوصيل</p>
          </div>
          <Button asChild>
            <Link href="/orders/new">+ إضافة طلب جديد</Link>
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {summary.map((item) => (
            <div
              key={item.label}
              className="flex items-stretch overflow-hidden rounded-[10px] border border-line bg-surface"
            >
              <span className={`w-1 shrink-0 ${item.color}`} />
              <div className="px-3 py-3">
                <p className="text-xs text-muted">{item.label}</p>
                <p className="mt-1 text-xl font-bold text-ink">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[10px] border border-line bg-surface">
          <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row">
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="ابحث برقم الطلب أو اسم العميل أو رقم الهاتف"
              className="sm:max-w-md"
            />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as OrderStatus | "");
                setPage(1);
              }}
              className="h-10 rounded-[8px] border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-brand"
            >
              <option value="">الحالة</option>
              {STATUSES.filter(Boolean).map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value as OrderStatus]}
                </option>
              ))}
            </select>
            <Input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setPage(1);
              }}
              className="sm:max-w-[180px]"
              aria-label="التاريخ"
            />
          </div>

          {query.isLoading ? <TableSkeleton /> : null}
          {query.isError ? <ErrorState onRetry={() => query.refetch()} /> : null}

          {!query.isLoading && !query.isError && rows.length === 0 ? (
            hasFilters ? <EmptySearch /> : <EmptyOrders />
          ) : null}

          {!query.isLoading && !query.isError && rows.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>اسم العميل</TableHead>
                    <TableHead>رقم الهاتف</TableHead>
                    <TableHead>العنوان</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>وقت الإنشاء</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((order) => (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/orders/view?id=${order.id}`)}
                    >
                      <TableCell className="font-medium text-navy">
                        {formatOrderNumber(order.orderNumber)}
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell dir="ltr" className="text-start">
                        {order.phone}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate">{order.address}</TableCell>
                      <TableCell>{formatAmount(order.amount)}</TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted">
                        {formatDateTime(order.createdAt)}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 text-[13px]">
                          <Link href={`/orders/view?id=${order.id}`} className="text-brand hover:underline">
                            عرض
                          </Link>
                          <Link
                            href={`/orders/edit?id=${order.id}`}
                            className="text-navy hover:underline"
                          >
                            تعديل
                          </Link>
                          <button
                            type="button"
                            className="text-danger hover:underline"
                            onClick={() => setDeleteId(order.id)}
                          >
                            حذف
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {meta && meta.totalPages > 1 ? (
                <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm text-muted">
                  <span>
                    صفحة {meta.page} من {meta.totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={meta.page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      السابق
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={meta.page >= meta.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      التالي
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </main>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="حذف الطلب"
        description="هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        danger
        isSubmitting={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
      />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AuthGuard adminOnly>
      <OrdersPageInner />
    </AuthGuard>
  );
}
