-- Add deletedAt column to purchases table
ALTER TABLE "purchases" ADD COLUMN "deleted_at" TIMESTAMP(6);

-- Add index on deleted_at column
CREATE INDEX "idx_purchases_deleted_at" ON "purchases"("deleted_at");