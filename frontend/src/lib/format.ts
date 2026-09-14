export function formatAmount(amount: number): string {
  return `${new Intl.NumberFormat("ar-EG-u-nu-latn", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)} ج.م`;
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
