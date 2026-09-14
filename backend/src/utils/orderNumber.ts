import { prisma } from "../lib/prisma";

const STARTING_NUMBER = 1025;

export async function generateOrderNumber(): Promise<string> {
  const latest = await prisma.order.findFirst({
    orderBy: { createdAt: "desc" },
    select: { orderNumber: true },
  });

  if (!latest) {
    return String(STARTING_NUMBER);
  }

  const parsed = Number.parseInt(latest.orderNumber, 10);
  if (Number.isNaN(parsed)) {
    return String(STARTING_NUMBER);
  }

  return String(Math.max(STARTING_NUMBER, parsed + 1));
}
