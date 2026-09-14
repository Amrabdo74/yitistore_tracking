"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { FAILURE_REASONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function FailDeliverySheet({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isSubmitting?: boolean;
}) {
  const [selected, setSelected] = useState<string>(FAILURE_REASONS[0]);
  const [other, setOther] = useState("");

  function handleConfirm() {
    const reason = selected === "سبب آخر" ? other.trim() : selected;
    onConfirm(reason);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetTitle>سبب تعذر التسليم</SheetTitle>
        <div className="mt-4 space-y-2">
          {FAILURE_REASONS.map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => setSelected(reason)}
              className={cn(
                "flex min-h-11 w-full items-center rounded-[8px] border px-3 text-start text-sm",
                selected === reason
                  ? "border-brand bg-info-bg text-ink"
                  : "border-line bg-surface text-ink",
              )}
            >
              {reason}
            </button>
          ))}
        </div>
        {selected === "سبب آخر" ? (
          <Textarea
            className="mt-3"
            placeholder="اكتب السبب"
            value={other}
            onChange={(e) => setOther(e.target.value)}
          />
        ) : null}
        <Button
          variant="danger"
          size="xl"
          className="mt-5 w-full"
          disabled={isSubmitting || (selected === "سبب آخر" && other.trim().length < 3)}
          onClick={handleConfirm}
        >
          تأكيد تعذر التسليم
        </Button>
      </SheetContent>
    </Sheet>
  );
}
