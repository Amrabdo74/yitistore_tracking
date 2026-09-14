import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";

function prismaErrorCode(err: unknown): string {
  if (typeof err !== "object" || err === null) {
    return "";
  }

  const value = err as { code?: string; errorCode?: string };
  return String(value.code ?? value.errorCode ?? "");
}

function prismaMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  return "";
}

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

  const code = prismaErrorCode(err);
  const message = prismaMessage(err);

  if (
    code === "P2021" ||
    code === "P2022" ||
    message.includes("does not exist")
  ) {
    res.status(503).json({ message: "قاعدة البيانات غير جاهزة بعد، حاول بعد لحظات" });
    return;
  }

  if (code.startsWith("P100") || code === "P1017" || code === "P1011") {
    res.status(503).json({ message: "تعذر الاتصال بقاعدة البيانات" });
    return;
  }

  res.status(500).json({ message: "حدث خطأ، حاول مرة أخرى" });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: "المسار غير موجود" });
}
