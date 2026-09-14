import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import express from "express";
import { createApp } from "./app";
import { config } from "./config";
import { prisma } from "./lib/prisma";
import { ensureDefaultUsers } from "./lib/seedUsers";

function findFrontendOut() {
  const candidates = [
    path.resolve(process.cwd(), "frontend", "out"),
    path.resolve(__dirname, "..", "..", "frontend", "out"),
    path.resolve(__dirname, "..", "frontend", "out"),
  ];
  return candidates.find((dir) => fs.existsSync(dir));
}

function findBackendDir() {
  const candidates = [
    path.resolve(process.cwd(), "backend"),
    path.resolve(__dirname, ".."),
  ];
  return candidates.find((dir) => fs.existsSync(path.join(dir, "prisma", "schema.prisma")));
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
  const backendDir = findBackendDir();
  if (!backendDir) {
    throw new Error("Backend directory not found");
  }

  const originalUrl = process.env.DATABASE_URL;
  const directUrl = originalUrl?.replace("-pooler", "");

  execSync("npx prisma db push", {
    cwd: backendDir,
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: directUrl || originalUrl,
    },
  });
  await ensureDefaultUsers();
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

  try {
    await setupDatabase();
    console.log("Database ready");
  } catch (error) {
    console.error("Database setup failed; API may not work yet");
    console.error(error);
  }
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
});
