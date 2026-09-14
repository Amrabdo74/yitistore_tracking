process.env.NODE_ENV = process.env.NODE_ENV || "production";

if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    if (url.hostname.includes("neon.tech") || url.hostname.includes("-pooler")) {
      if (!url.searchParams.has("pgbouncer")) {
        url.searchParams.set("pgbouncer", "true");
      }
      if (!url.searchParams.has("connection_limit")) {
        url.searchParams.set("connection_limit", "1");
      }
      process.env.DATABASE_URL = url.toString();
    }

    if (!process.env.DIRECT_URL) {
      const direct = new URL(process.env.DATABASE_URL);
      direct.hostname = direct.hostname.replace("-pooler", "");
      direct.searchParams.delete("pgbouncer");
      process.env.DIRECT_URL = direct.toString();
    }
  } catch (error) {
    console.error("Could not parse DATABASE_URL");
    console.error(error);
  }
}

require("./backend/dist/index.js");
