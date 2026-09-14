"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { meRequest } from "@/lib/orders-api";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: meRequest,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
