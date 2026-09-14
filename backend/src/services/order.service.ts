import { Order, OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";
import { generateOrderNumber } from "../utils/orderNumber";
import { assertValidTransition } from "../utils/status";

const FAILED_REASONS = [
  "العميل لا يرد",
  "العنوان غير صحيح",
  "العميل رفض الاستلام",
  "العميل غير موجود",
  "طلب العميل التأجيل",
] as const;

export type OrderFilters = {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  search?: string;
  date?: string;
};

function serializeOrder(order: Order) {
  return {
    ...order,
    amount: Number(order.amount),
  };
}

function startOfDay(date: string) {
  const start = new Date(`${date}T00:00:00`);
  if (Number.isNaN(start.getTime())) {
    throw new AppError("تاريخ غير صالح", 400);
  }
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export async function listOrders(filters: OrderFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 10));
  const where: Prisma.OrderWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search?.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { orderNumber: { contains: q.replace(/^#/, ""), mode: "insensitive" } },
      { customerName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
    ];
  }

  if (filters.date) {
    const { start, end } = startOfDay(filters.date);
    where.createdAt = { gte: start, lt: end };
  }

  const [rows, total, grouped] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
      orderBy: { status: "asc" },
    }),
  ]);

  const counts: Record<OrderStatus, number> = {
    NEW: 0,
    RECEIVED: 0,
    ARRIVED: 0,
    DELIVERED: 0,
    FAILED: 0,
  };

  for (const row of grouped) {
    counts[row.status] = (row._count as { _all: number })._all;
  }

  const stats = {
    total: Object.values(counts).reduce((sum, n) => sum + n, 0),
    new: counts.NEW,
    inProgress: counts.RECEIVED + counts.ARRIVED,
    delivered: counts.DELIVERED,
    failed: counts.FAILED,
  };

  return {
    data: rows.map(serializeOrder),
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
    stats,
  };
}

export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    throw new AppError("الطلب غير موجود", 404);
  }
  return serializeOrder(order);
}

export async function createOrder(input: {
  customerName: string;
  phone: string;
  address: string;
  description?: string;
  amount: number;
  notes?: string;
}) {
  const orderNumber = await generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName: input.customerName.trim(),
      phone: input.phone.trim(),
      address: input.address.trim(),
      description: input.description?.trim() ?? "",
      amount: input.amount,
      notes: input.notes?.trim() || null,
      status: "NEW",
      history: {
        create: { status: "NEW" },
      },
    },
  });

  return serializeOrder(order);
}

export async function updateOrder(
  id: string,
  input: {
    customerName: string;
    phone: string;
    address: string;
    description?: string;
    amount: number;
    notes?: string;
  },
) {
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("الطلب غير موجود", 404);
  }

  const order = await prisma.order.update({
    where: { id },
    data: {
      customerName: input.customerName.trim(),
      phone: input.phone.trim(),
      address: input.address.trim(),
      description: input.description?.trim() ?? "",
      amount: input.amount,
      notes: input.notes?.trim() || null,
    },
  });

  return serializeOrder(order);
}

export async function deleteOrder(id: string) {
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("الطلب غير موجود", 404);
  }

  await prisma.order.delete({ where: { id } });
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  failureReason?: string,
) {
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("الطلب غير موجود", 404);
  }

  assertValidTransition(existing.status, status);

  let reason: string | null = existing.failureReason;

  if (status === "FAILED") {
    const trimmed = failureReason?.trim();
    if (!trimmed) {
      throw new AppError("يرجى تحديد سبب تعذر التسليم", 400);
    }

    const isPreset = (FAILED_REASONS as readonly string[]).includes(trimmed);
    if (!isPreset && trimmed.length < 3) {
      throw new AppError("يرجى كتابة سبب واضح لتعذر التسليم", 400);
    }
    reason = trimmed;
  }

  const order = await prisma.order.update({
    where: { id },
    data: {
      status,
      failureReason: reason,
      deliveredAt: status === "DELIVERED" ? new Date() : existing.deliveredAt,
      history: {
        create: { status },
      },
    },
  });

  return serializeOrder(order);
}

export async function getOrderHistory(id: string) {
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("الطلب غير موجود", 404);
  }

  return prisma.orderStatusHistory.findMany({
    where: { orderId: id },
    orderBy: { createdAt: "asc" },
  });
}
