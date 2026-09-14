export function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) {
    return digits.slice(2);
  }
  if (digits.startsWith("20")) {
    return digits;
  }
  if (digits.startsWith("0")) {
    return `20${digits.slice(1)}`;
  }
  return digits;
}

export function callHref(phone: string): string {
  return `tel:${phone.replace(/\s/g, "")}`;
}

export function whatsappHref(phone: string): string {
  return `https://wa.me/${toWhatsAppNumber(phone)}`;
}
