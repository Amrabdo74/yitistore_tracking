import type { Currency } from "./types";
import { CURRENCY_SUFFIX } from "./constants";

export function formatAmount(amount: number, currency: Currency = "AED"): string {
  return `${new Intl.NumberFormat("ar-EG-u-nu-latn", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)} ${CURRENCY_SUFFIX[currency] ?? CURRENCY_SUFFIX.AED}`;
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

export function formatTime(value: string): string {
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

export function formatOrderNumber(orderNumber: string): string {
  return `#${orderNumber.replace(/^#/, "")}`;
}
