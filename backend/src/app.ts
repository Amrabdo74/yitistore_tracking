import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config";
import { authRouter } from "./routes/auth";
import { ordersRouter } from "./routes/orders";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: config.isProd ? true : config.frontendUrl,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api", notFoundHandler);
  app.use(errorHandler);

  return app;
}
