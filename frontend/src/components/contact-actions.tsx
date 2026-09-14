"use client";

import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { callHref, whatsappHref } from "@/lib/phone";

export function ContactActions({
  phone,
  large = false,
}: {
  phone: string;
  large?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <Button asChild variant="outline" size={large ? "xl" : "default"} className="flex-1">
        <a href={callHref(phone)}>
          <Phone />
          {large ? "اتصال" : "اتصال بالعميل"}
        </a>
      </Button>
      <Button asChild variant="navy" size={large ? "xl" : "default"} className="flex-1">
        <a href={whatsappHref(phone)} target="_blank" rel="noreferrer">
          <MessageCircle />
          {large ? "واتساب" : "فتح واتساب"}
        </a>
      </Button>
    </div>
  );
}
