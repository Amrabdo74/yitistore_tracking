import { PrismaClient } from "@prisma/client";

function applyNeonPoolerParams() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    return;
  }

  try {
    const url = new URL(raw);
    const usesNeon =
      url.hostname.includes("neon.tech") || url.hostname.includes("-pooler");
    if (!usesNeon) {
      return;
    }

    if (!url.searchParams.has("pgbouncer")) {
      url.searchParams.set("pgbouncer", "true");
    }
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "1");
    }

    process.env.DATABASE_URL = url.toString();
  } catch {
    // Keep the original URL if it cannot be parsed.
  }
}

applyNeonPoolerParams();

export const prisma = new PrismaClient();
