import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  if (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    (err as { type?: string }).type === "entity.parse.failed"
  ) {
    res.status(400).json({ message: "بيانات غير صالحة" });
    return;
  }

  console.error(err);
  res.status(500).json({ message: "حدث خطأ، حاول مرة أخرى" });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: "المسار غير موجود" });
}
