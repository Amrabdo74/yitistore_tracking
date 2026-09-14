import fs from "fs";
import path from "path";
import express from "express";
import { createApp } from "./app";
import { config } from "./config";
import { prisma } from "./lib/prisma";
import { ensureDefaultUsers } from "./lib/seedUsers";

function attachFrontend(app: express.Express) {
  const outDir = path.resolve(process.cwd(), "frontend", "out");
  if (!fs.existsSync(outDir)) {
    console.error(`Frontend export not found at ${outDir}`);
    return;
  }

  app.use(express.static(outDir));
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }
    if (req.path.startsWith("/api")) {
      next();
      return;
    }

    const candidates = [
      path.join(outDir, req.path, "index.html"),
      path.join(outDir, `${req.path.replace(/\/$/, "")}.html`),
      path.join(outDir, "index.html"),
    ];
    const file = candidates.find((candidate) => fs.existsSync(candidate));
    if (file) {
      res.sendFile(file);
      return;
    }
    next();
  });
}

async function main() {
  await ensureDefaultUsers();

  const app = createApp();
  if (config.isProd) {
    attachFrontend(app);
  }

  app.listen(config.port, "0.0.0.0", () => {
    console.log(`Server running on 0.0.0.0:${config.port}`);
  });
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
