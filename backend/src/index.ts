import fs from "fs";
import path from "path";
import express from "express";
import { createApp } from "./app";
import { config } from "./config";
import { prisma } from "./lib/prisma";
import { ensureDefaultUsers } from "./lib/seedUsers";
import { ensureSchema } from "./lib/ensureSchema";

function findFrontendOut() {
  const candidates = [
    path.resolve(process.cwd(), "frontend", "out"),
    path.resolve(__dirname, "..", "..", "frontend", "out"),
    path.resolve(__dirname, "..", "frontend", "out"),
  ];
  return candidates.find((dir) => fs.existsSync(dir));
}

function attachFrontend(app: express.Express) {
  const outDir = findFrontendOut();
  if (!outDir) {
    console.error("Frontend export not found");
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

async function setupDatabase() {
  await ensureSchema();
  await ensureDefaultUsers();
}

async function setupDatabaseWithRetry() {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      await setupDatabase();
      console.log("Database ready");
      return;
    } catch (error) {
      console.error(`Database setup attempt ${attempt} failed`);
      console.error(error);
      if (attempt < 5) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
      }
    }
  }
}

async function main() {
  const app = createApp();
  if (config.isProd) {
    attachFrontend(app);
  }

  await new Promise<void>((resolve) => {
    app.listen(config.port, "0.0.0.0", () => {
      console.log(`Server running on 0.0.0.0:${config.port}`);
      resolve();
    });
  });

  await setupDatabaseWithRetry();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
});
