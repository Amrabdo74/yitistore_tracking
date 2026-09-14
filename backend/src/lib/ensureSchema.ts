import { prisma } from "./prisma";

async function run(sql: string) {
  await prisma.$executeRawUnsafe(sql);
}

export async function ensureSchema() {
  await run(`
    DO $$ BEGIN
      CREATE TYPE "Role" AS ENUM ('ADMIN', 'DRIVER');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);
  await run(`
    DO $$ BEGIN
      CREATE TYPE "OrderStatus" AS ENUM ('NEW', 'RECEIVED', 'ARRIVED', 'DELIVERED', 'FAILED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);
  await run(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "password" TEXT NOT NULL,
      "role" "Role" NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    )
  `);
  await run(`
    CREATE TABLE IF NOT EXISTS "Order" (
      "id" TEXT NOT NULL,
      "orderNumber" TEXT NOT NULL,
      "customerName" TEXT NOT NULL,
      "phone" TEXT NOT NULL,
      "address" TEXT NOT NULL,
      "description" TEXT NOT NULL DEFAULT '',
      "amount" DECIMAL(10,2) NOT NULL,
      "status" "OrderStatus" NOT NULL DEFAULT 'NEW',
      "failureReason" TEXT,
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      "deliveredAt" TIMESTAMP(3),
      CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
    )
  `);
  await run(`
    CREATE TABLE IF NOT EXISTS "OrderStatusHistory" (
      "id" TEXT NOT NULL,
      "orderId" TEXT NOT NULL,
      "status" "OrderStatus" NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
    )
  `);
  await run(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`);
  await run(`CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber")`);
  await run(`CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status")`);
  await run(`CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt")`);
  await run(`CREATE INDEX IF NOT EXISTS "Order_customerName_idx" ON "Order"("customerName")`);
  await run(`CREATE INDEX IF NOT EXISTS "Order_phone_idx" ON "Order"("phone")`);
  await run(`CREATE INDEX IF NOT EXISTS "OrderStatusHistory_orderId_idx" ON "OrderStatusHistory"("orderId")`);
  await run(`
    DO $$ BEGIN
      ALTER TABLE "OrderStatusHistory"
      ADD CONSTRAINT "OrderStatusHistory_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);
}
