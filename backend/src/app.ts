import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { prisma } from "./lib/prisma";
import { authRouter } from "./routes/auth";
import { ordersRouter } from "./routes/orders";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get("/api/health", async (_req, res) => {
    try {
      const users = await prisma.user.count();
      res.json({ ok: true, db: true, users });
    } catch {
      res.json({ ok: true, db: false, users: 0 });
    }
  });

  app.use("/api/auth", authRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api", notFoundHandler);
  app.use(errorHandler);

  return app;
}
