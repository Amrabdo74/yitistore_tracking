"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { loginRequest } from "@/lib/orders-api";
import { loginSchema, type LoginSchema } from "@/lib/validations";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: LoginSchema) => loginRequest(values.email, values.password),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      router.replace(result.user.role === "DRIVER" ? "/driver/orders" : "/orders");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "حدث خطأ، حاول مرة أخرى");
    },
  });

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-[400px] overflow-hidden rounded-[10px] border border-line bg-surface">
        <div className="flex flex-col items-center bg-black px-6 py-6">
          <BrandLogo size={96} className="rounded-[12px]" />
          <p className="mt-3 text-sm font-medium text-white">يتي ستور</p>
        </div>
        <div className="px-6 py-7">
          <h1 className="text-xl font-bold text-navy">تسجيل الدخول</h1>
          <p className="mt-1 text-sm text-muted">أدخل بيانات حسابك للمتابعة</p>

          <form
            className="mt-6 space-y-4"
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          >
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                dir="ltr"
                className="text-start"
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="mt-1 text-xs text-danger">{form.formState.errors.email.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                dir="ltr"
                className="text-start"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="mt-1 text-xs text-danger">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "جاري الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
