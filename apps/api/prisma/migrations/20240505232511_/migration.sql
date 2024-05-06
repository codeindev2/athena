/*
  Warnings:

  - You are about to drop the column `end_hour` on the `business` table. All the data in the column will be lost.
  - You are about to drop the column `start_hour` on the `business` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "business" DROP COLUMN "end_hour",
DROP COLUMN "start_hour",
ADD COLUMN     "end_work_hour" INTEGER DEFAULT 18,
ADD COLUMN     "start_work_hour" INTEGER DEFAULT 8;
