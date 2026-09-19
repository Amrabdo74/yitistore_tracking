import type { Currency, OrderStatus } from "./types";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "طلب جديد",
  RECEIVED: "استلمت الطلب",
  ARRIVED: "وصلت للعميل",
  DELIVERED: "تم التسليم",
  FAILED: "تعذر التسليم",
};

export const STATUS_FILTER_LABELS: Record<OrderStatus | "ALL", string> = {
  ALL: "الكل",
  NEW: "جديد",
  RECEIVED: "استلمت",
  ARRIVED: "وصلت",
  DELIVERED: "تم التسليم",
  FAILED: "متعذر",
};

export const TIMELINE_LABELS: Record<OrderStatus, string> = {
  NEW: "تم إنشاء الطلب",
  RECEIVED: "استلم المندوب الطلب",
  ARRIVED: "وصل المندوب للعميل",
  DELIVERED: "تم التسليم",
  FAILED: "تعذر التسليم",
};

export const STATUS_STYLES: Record<OrderStatus, string> = {
  NEW: "bg-status-new-bg text-status-new",
  RECEIVED: "bg-warning-bg text-received",
  ARRIVED: "bg-info-bg text-info",
  DELIVERED: "bg-success-bg text-success",
  FAILED: "bg-danger-bg text-danger",
};

export const FAILURE_REASONS = [
  "العميل لا يرد",
  "العنوان غير صحيح",
  "العميل رفض الاستلام",
  "العميل غير موجود",
  "طلب العميل التأجيل",
  "سبب آخر",
] as const;

export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  NEW: "RECEIVED",
  RECEIVED: "ARRIVED",
};

export const CURRENCIES = ["AED", "OMR"] as const;

export const CURRENCY_LABELS: Record<Currency, string> = {
  AED: "درهم إماراتي",
  OMR: "ريال عماني",
};

export const CURRENCY_SUFFIX: Record<Currency, string> = {
  AED: "د.إ",
  OMR: "ر.ع",
};
