process.env.NODE_ENV = process.env.NODE_ENV || "production";

if (process.env.DATABASE_URL && !process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL.replace("-pooler", "");
}

require("./backend/dist/index.js");
