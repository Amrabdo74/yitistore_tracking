import path from "path";
import next from "next";
import { createApp } from "./app";
import { config } from "./config";
import { prisma } from "./lib/prisma";
import { ensureDefaultUsers } from "./lib/seedUsers";

async function main() {
  await ensureDefaultUsers();

  const app = createApp();

  if (config.isProd) {
    const frontendDir = path.resolve(__dirname, "../../frontend");
    const nextApp = next({
      dev: false,
      dir: frontendDir,
    });
    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();
    app.use((req, res) => handle(req, res));
  }

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
