"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/use-me";
import { logoutRequest } from "@/lib/orders-api";

export function AdminHeader() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data } = useMe();

  async function handleLogout() {
    try {
      await logoutRequest();
      queryClient.clear();
      router.replace("/login");
    } catch {
      toast.error("حدث خطأ، حاول مرة أخرى");
    }
  }

  return (
    <header className="border-b border-[#0b2136] bg-navy text-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/orders" className="flex items-center gap-2.5">
          <BrandLogo size={32} className="rounded-[8px] ring-1 ring-white/10" />
          <span className="leading-tight">
            <span className="block text-sm font-medium">يتي ستور</span>
            <span className="block text-[11px] text-white/65">تتبع التوصيل</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-white/70 sm:inline">
            {data?.user.email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-9 text-white/85 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </header>
  );
}
