import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("أدخل بريداً إلكترونياً صالحاً"),
  password: z.string().min(1, "أدخل كلمة المرور"),
});

export const orderSchema = z.object({
  customerName: z.string().trim().min(2, "اسم العميل مطلوب"),
  phone: z
    .string()
    .trim()
    .min(8, "رقم الهاتف غير صالح")
    .regex(/^[0-9+\s-]+$/, "رقم الهاتف غير صالح"),
  address: z.string().trim().min(4, "العنوان مطلوب"),
  description: z.string().trim().optional().default(""),
  amount: z.coerce.number().positive("أدخل مبلغاً صحيحاً"),
  notes: z.string().trim().optional().default(""),
});

export type OrderSchema = z.infer<typeof orderSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
