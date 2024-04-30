/*
  Warnings:

  - You are about to drop the column `business_id` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `business_id` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `business_id` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `business_id` on the `services` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[business_id,user_id]` on the table `members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[business_id,name]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[business_id,name]` on the table `services` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `business_id` to the `members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `business_id` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `business_id` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `business_id` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "members" DROP CONSTRAINT "members_business_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_business_id_fkey";

-- DropForeignKey
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_business_id_fkey";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_business_id_fkey";

-- DropIndex
DROP INDEX "members_business_id_user_id_key";

-- DropIndex
DROP INDEX "products_business_id_name_key";

-- DropIndex
DROP INDEX "services_business_id_name_key";

-- AlterTable
ALTER TABLE "members" DROP COLUMN "business_id",
ADD COLUMN     "business_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "business_id",
ADD COLUMN     "business_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "business_id",
ADD COLUMN     "business_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "services" DROP COLUMN "business_id",
ADD COLUMN     "business_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "members_business_id_user_id_key" ON "members"("business_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_business_id_name_key" ON "products"("business_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "services_business_id_name_key" ON "services"("business_id", "name");

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
