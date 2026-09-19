-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "Currency" AS ENUM ('AED', 'OMR');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "currency" "Currency" NOT NULL DEFAULT 'AED';
