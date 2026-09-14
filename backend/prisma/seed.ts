import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@yitistore.com").toLowerCase();
  const driverEmail = (process.env.DRIVER_EMAIL ?? "driver@yitistore.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin123!";
  const driverPassword = process.env.DRIVER_PASSWORD ?? "Driver123!";

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const driverHash = await bcrypt.hash(driverPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: adminHash, role: "ADMIN" },
    create: { email: adminEmail, password: adminHash, role: "ADMIN" },
  });

  await prisma.user.upsert({
    where: { email: driverEmail },
    update: { password: driverHash, role: "DRIVER" },
    create: { email: driverEmail, password: driverHash, role: "DRIVER" },
  });

  console.log("Seed complete");
  console.log(`Admin:  ${adminEmail}`);
  console.log(`Driver: ${driverEmail}`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
