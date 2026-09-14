"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMe } from "@/hooks/use-me";
import { ApiError } from "@/lib/api";
import { PageSpinner } from "@/components/states";

export function AuthGuard({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const router = useRouter();
  const { data, isLoading, error } = useMe();
  const user = data?.user;

  useEffect(() => {
    if (isLoading) return;

    if (!user || (error instanceof ApiError && error.status === 401)) {
      router.replace("/login");
      return;
    }

    if (adminOnly && user.role !== "ADMIN") {
      router.replace("/driver/orders");
    }
  }, [adminOnly, error, isLoading, router, user]);

  if (isLoading) {
    return <PageSpinner />;
  }

  if (!user) {
    return null;
  }

  if (adminOnly && user.role !== "ADMIN") {
    return null;
  }

  return <>{children}</>;
}
