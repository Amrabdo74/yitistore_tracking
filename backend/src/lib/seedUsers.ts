import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export async function ensureDefaultUsers() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@yitistore.com").toLowerCase();
  const driverEmail = (process.env.DRIVER_EMAIL ?? "driver@yitistore.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin123!";
  const driverPassword = process.env.DRIVER_PASSWORD ?? "Driver123!";

  const existing = await prisma.user.count();
  if (existing > 0) {
    return;
  }

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const driverHash = await bcrypt.hash(driverPassword, 10);

  await prisma.user.createMany({
    data: [
      { email: adminEmail, password: adminHash, role: "ADMIN" },
      { email: driverEmail, password: driverHash, role: "DRIVER" },
    ],
  });

  console.log("Created default admin and driver accounts");
}
