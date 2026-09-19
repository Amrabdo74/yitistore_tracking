"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CURRENCIES, CURRENCY_LABELS } from "@/lib/constants";
import { orderSchema, type OrderSchema } from "@/lib/validations";
import type { OrderFormValues } from "@/lib/types";

export function OrderForm({
  defaultValues,
  submitLabel,
  onSubmit,
  isSubmitting,
}: {
  defaultValues?: Partial<OrderFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: OrderFormValues) => Promise<void> | void;
}) {
  const form = useForm<OrderSchema>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerName: defaultValues?.customerName ?? "",
      phone: defaultValues?.phone ?? "",
      address: defaultValues?.address ?? "",
      description: defaultValues?.description ?? "",
      amount: defaultValues?.amount ?? undefined,
      currency: defaultValues?.currency ?? "AED",
      notes: defaultValues?.notes ?? "",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit({
          customerName: values.customerName,
          phone: values.phone,
          address: values.address,
          description: values.description ?? "",
          amount: values.amount,
          currency: values.currency,
          notes: values.notes ?? "",
        });
      })}
    >
      <div>
        <Label htmlFor="customerName">اسم العميل</Label>
        <Input id="customerName" {...form.register("customerName")} />
        {form.formState.errors.customerName ? (
          <p className="mt-1 text-xs text-danger">
            {form.formState.errors.customerName.message}
          </p>
        ) : null}
      </div>
      <div>
        <Label htmlFor="phone">رقم الهاتف</Label>
        <Input id="phone" inputMode="tel" dir="ltr" className="text-start" {...form.register("phone")} />
        {form.formState.errors.phone ? (
          <p className="mt-1 text-xs text-danger">{form.formState.errors.phone.message}</p>
        ) : null}
      </div>
      <div>
        <Label htmlFor="address">العنوان</Label>
        <Input id="address" {...form.register("address")} />
        {form.formState.errors.address ? (
          <p className="mt-1 text-xs text-danger">{form.formState.errors.address.message}</p>
        ) : null}
      </div>
      <div>
        <Label htmlFor="description">وصف الطلب</Label>
        <Textarea id="description" {...form.register("description")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="amount">المبلغ</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            dir="ltr"
            className="text-start"
            {...form.register("amount")}
          />
          {form.formState.errors.amount ? (
            <p className="mt-1 text-xs text-danger">{form.formState.errors.amount.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="currency">العملة</Label>
          <select
            id="currency"
            {...form.register("currency")}
            className="h-10 w-full rounded-[8px] border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-brand"
          >
            {CURRENCIES.map((value) => (
              <option key={value} value={value}>
                {CURRENCY_LABELS[value]}
              </option>
            ))}
          </select>
          {form.formState.errors.currency ? (
            <p className="mt-1 text-xs text-danger">{form.formState.errors.currency.message}</p>
          ) : null}
        </div>
      </div>
      <div>
        <Label htmlFor="notes">ملاحظات</Label>
        <Textarea id="notes" {...form.register("notes")} />
      </div>
      <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? "جاري الحفظ..." : submitLabel}
      </Button>
    </form>
  );
}
