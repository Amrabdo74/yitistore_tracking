process.env.NODE_ENV = process.env.NODE_ENV || "production";

const { execSync } = require("child_process");
const path = require("path");

const backendDir = path.join(__dirname, "backend");

try {
  execSync("npx prisma migrate deploy", {
    cwd: backendDir,
    stdio: "inherit",
    env: process.env,
  });
} catch (error) {
  console.error("Prisma migrate failed");
  console.error(error);
  process.exit(1);
}

require("./backend/dist/index.js");
