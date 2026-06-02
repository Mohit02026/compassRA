-- Phase 1 schema updates
-- 1. Add DATA_QC and READY_TO_FILE to OrderStatus enum (rename REVIEW)
-- 2. Add PaymentStatus enum + paymentStatus column to Order
-- 3. Add ghlOpportunityId to Order
-- 4. Add SS4_DRAFT, PAYMENT_INVOICE, LEGAL_NOTICE to DocumentType enum
-- 5. Make Document.r2Key optional, add driveFileId
-- 6. Add LegalNotice model

-- OrderStatus: add new values (keep REVIEW for now, will drop after data migration)
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'DATA_QC';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'READY_TO_FILE';

-- PaymentStatus enum
DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CONFIRMED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add paymentStatus to Order
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- Add ghlOpportunityId to Order
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "ghlOpportunityId" TEXT;

-- DocumentType: add new values
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'SS4_DRAFT';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'PAYMENT_INVOICE';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'LEGAL_NOTICE';

-- Make Document.r2Key optional
ALTER TABLE "Document" ALTER COLUMN "r2Key" DROP NOT NULL;

-- Add driveFileId to Document
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "driveFileId" TEXT;

-- Create LegalNotice table
CREATE TABLE IF NOT EXISTS "LegalNotice" (
  "id"          TEXT NOT NULL,
  "tenantId"    TEXT NOT NULL,
  "customerId"  TEXT NOT NULL,
  "r2Key"       TEXT NOT NULL,
  "filename"    TEXT NOT NULL,
  "receivedAt"  TIMESTAMP(3) NOT NULL,
  "forwardedAt" TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LegalNotice_pkey" PRIMARY KEY ("id")
);
