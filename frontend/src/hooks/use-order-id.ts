"use client";

import { useSearchParams } from "next/navigation";

export function useOrderId() {
  const search = useSearchParams();
  return search.get("id") ?? "";
}
