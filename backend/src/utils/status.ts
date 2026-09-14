import { OrderStatus } from "@prisma/client";
import { AppError } from "./appError";

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW: ["RECEIVED"],
  RECEIVED: ["ARRIVED"],
  ARRIVED: ["DELIVERED", "FAILED"],
  DELIVERED: [],
  FAILED: [],
};

export function assertValidTransition(
  current: OrderStatus,
  next: OrderStatus,
): void {
  if (!ALLOWED_TRANSITIONS[current].includes(next)) {
    throw new AppError("لا يمكن تغيير حالة الطلب إلى هذه الحالة", 400);
  }
}

export const STATUS_HISTORY_LABELS: Record<OrderStatus, string> = {
  NEW: "تم إنشاء الطلب",
  RECEIVED: "استلم المندوب الطلب",
  ARRIVED: "وصل المندوب للعميل",
  DELIVERED: "تم التسليم",
  FAILED: "تعذر التسليم",
};
