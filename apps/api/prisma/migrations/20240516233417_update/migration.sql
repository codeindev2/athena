-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "quantity" INTEGER DEFAULT 0;
