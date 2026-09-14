import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { config } from "../config";
import { AppError } from "../utils/appError";

export type AuthPayload = {
  userId: string;
  email: string;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = req.cookies?.[config.cookieName] as string | undefined;

  if (!token) {
    next(new AppError("يجب تسجيل الدخول أولاً", 401));
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    next(new AppError("جلسة غير صالحة، سجّل الدخول مرة أخرى", 401));
  }
}

export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    next(new AppError("يجب تسجيل الدخول أولاً", 401));
    return;
  }

  if (req.user.role !== "ADMIN") {
    next(new AppError("غير مصرح لك بالوصول", 403));
    return;
  }

  next();
}
