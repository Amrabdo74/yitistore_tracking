import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <p className="text-2xl font-bold text-navy">الصفحة غير موجودة</p>
        <Link href="/orders" className="mt-3 inline-block text-sm text-brand hover:underline">
          العودة للطلبات
        </Link>
      </div>
    </main>
  );
}
