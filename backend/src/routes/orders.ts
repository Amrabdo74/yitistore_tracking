import { Router } from "express";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { AppError } from "../utils/appError";
import { requireAdmin, requireAuth } from "../middleware/auth";
import * as orderService from "../services/order.service";

export const ordersRouter = Router();

const statuses = ["NEW", "RECEIVED", "ARRIVED", "DELIVERED", "FAILED"] as const;

const orderBodySchema = z.object({
  customerName: z.string().trim().min(2, "اسم العميل مطلوب"),
  phone: z
    .string()
    .trim()
    .min(8, "رقم الهاتف غير صالح")
    .regex(/^[0-9+\s-]+$/, "رقم الهاتف غير صالح"),
  address: z.string().trim().min(4, "العنوان مطلوب"),
  description: z.string().trim().optional().default(""),
  amount: z.coerce.number().positive("أدخل مبلغاً صحيحاً"),
  notes: z.string().trim().optional(),
});

const statusBodySchema = z.object({
  status: z.enum(statuses),
  failureReason: z.string().trim().optional(),
});

function parseStatus(value: unknown): OrderStatus | undefined {
  if (typeof value !== "string" || value.length === 0) {
    return undefined;
  }
  if (!statuses.includes(value as OrderStatus)) {
    throw new AppError("حالة غير صالحة", 400);
  }
  return value as OrderStatus;
}

ordersRouter.use(requireAuth);

ordersRouter.get("/", async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const date = typeof req.query.date === "string" ? req.query.date : undefined;
    const status = parseStatus(req.query.status);

    const result = await orderService.listOrders({
      page: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : 10,
      search,
      date,
      status,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

ordersRouter.post("/", requireAdmin, async (req, res, next) => {
  try {
    const parsed = orderBodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "بيانات غير صالحة", 400);
    }
    const order = await orderService.createOrder(parsed.data);
    res.status(201).json({ data: order });
  } catch (error) {
    next(error);
  }
});

ordersRouter.get("/:id", async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.json({ data: order });
  } catch (error) {
    next(error);
  }
});

ordersRouter.patch("/:id", requireAdmin, async (req, res, next) => {
  try {
    const parsed = orderBodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "بيانات غير صالحة", 400);
    }
    const order = await orderService.updateOrder(req.params.id, parsed.data);
    res.json({ data: order });
  } catch (error) {
    next(error);
  }
});

ordersRouter.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    await orderService.deleteOrder(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

ordersRouter.patch("/:id/status", async (req, res, next) => {
  try {
    const parsed = statusBodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "بيانات غير صالحة", 400);
    }
    const order = await orderService.updateOrderStatus(
      req.params.id,
      parsed.data.status,
      parsed.data.failureReason,
    );
    res.json({ data: order });
  } catch (error) {
    next(error);
  }
});

ordersRouter.get("/:id/history", async (req, res, next) => {
  try {
    const history = await orderService.getOrderHistory(req.params.id);
    res.json({ data: history });
  } catch (error) {
    next(error);
  }
});
