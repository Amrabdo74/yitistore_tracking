import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { config } from "../config";
import { AppError } from "../utils/appError";
import { login } from "../services/auth.service";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email("أدخل بريداً إلكترونياً صالحاً"),
  password: z.string().min(1, "أدخل كلمة المرور"),
});

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: config.isProd,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

authRouter.post("/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "بيانات غير صالحة", 400);
    }

    const result = await login(parsed.data.email, parsed.data.password);
    res.cookie(config.cookieName, result.token, cookieOptions());
    res.json({ user: result.user, token: result.token });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(config.cookieName, { path: "/" });
  res.json({ ok: true });
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      throw new AppError("المستخدم غير موجود", 401);
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});
